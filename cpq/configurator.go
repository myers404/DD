// configurator.go - Main Configuration Engine
// Combines Phase 1 (static constraints) + Phase 2 (basic pricing)
// Provides unified interface for SMB CPQ operations

package cpq

import (
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

// ===================================================================
// MAIN CONFIGURATOR - COMBINES CONSTRAINTS + PRICING
// ===================================================================

// Configurator provides the main interface for CPQ operations
type Configurator struct {
	model            *Model
	constraintEngine *ConstraintEngine
	pricingCalc      *PricingCalculator
	currentConfig    Configuration
	mutex            sync.RWMutex
	stats            ConfiguratorStats
	ruleAnalyzer     *RuleAnalyzer
}

// ConfiguratorStats tracks overall configurator performance
type ConfiguratorStats struct {
	TotalOperations int64
	ValidationCalls int64
	PricingCalls    int64
	AverageTime     time.Duration
	ErrorCount      int64
	LastOperation   time.Time
}

// ConfigurationUpdate represents the result of a configuration change
type ConfigurationUpdate struct {
	IsValid          bool              `json:"is_valid"`
	UpdatedConfig    Configuration     `json:"updated_config"`
	ValidationResult ValidationResult  `json:"validation_result"`
	PriceBreakdown   PriceBreakdown    `json:"price_breakdown"`
	PricingResult    *PricingResult    `json:"pricing_result,omitempty"` // Added for interface compatibility
	AvailableOptions []AvailableOption `json:"available_options"`
	ResponseTime     time.Duration     `json:"response_time"`
}

// PricingResult represents the result of pricing calculations
type PricingResult struct {
	BasePrice   float64           `json:"base_price"`
	Adjustments []PriceAdjustment `json:"adjustments"`
	TotalPrice  float64           `json:"total_price"`
	Breakdown   *PriceBreakdown   `json:"breakdown,omitempty"`
}

// SelectionStatus indicates how an option can be selected
type SelectionStatus string

const (
	StatusSelectable SelectionStatus = "selectable"  // Can be added without changes
	StatusSwitch     SelectionStatus = "switch"      // Can be selected by switching (select-one groups)
	StatusBlocked    SelectionStatus = "blocked"     // Blocked by constraints
	StatusSelected   SelectionStatus = "selected"    // Already selected
	StatusMaxReached SelectionStatus = "max-reached" // Group max selections reached
)

// GroupContext provides information about an option's group
type GroupContext struct {
	GroupID          string   `json:"group_id"`
	GroupType        string   `json:"group_type"` // "select-one", "select-zero-or-one", "multi-select"
	CurrentSelection []string `json:"current_selection,omitempty"`
	MinSelections    int      `json:"min_selections,omitempty"`
	MaxSelections    int      `json:"max_selections,omitempty"`
}

// ConstraintInfo provides information about a constraint
type ConstraintInfo struct {
	RuleID      string `json:"rule_id"`
	Message     string `json:"message"`
	Type        string `json:"type"` // "requires", "excludes", etc.
	Description string `json:"description,omitempty"`
}

// AvailableOption represents an option that can be selected
type AvailableOption struct {
	Option           Option           `json:"option"`
	Status           SelectionStatus  `json:"status"`
	CanSelect        bool             `json:"can_select"`       // Direct selection possible
	SelectionMethod  string           `json:"selection_method"` // "add", "switch", "none"
	RequiresDeselect []string         `json:"requires_deselect,omitempty"`
	BlockedBy        []ConstraintInfo `json:"blocked_by,omitempty"`
	GroupInfo        GroupContext     `json:"group_info"`
	Price            float64          `json:"price"` // Current price (may include discounts)
	RequirementTooltip string         `json:"requirement_tooltip,omitempty"` // Tooltip for requirements
	
	// Legacy fields for backward compatibility
	IsSelectable bool     `json:"is_selectable"`
	IsRequired   bool     `json:"is_required"`
	Reason       string   `json:"reason,omitempty"`
	Impact       string   `json:"impact,omitempty"`
	HelpsResolve []string `json:"helps_resolve,omitempty"`
}

// NewConfigurator creates a new configurator with both constraint and pricing engines
func NewConfigurator(model *Model) (*Configurator, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	// Validate model first
	if err := model.Validate(); err != nil {
		return nil, fmt.Errorf("model validation failed: %w", err)
	}

	// Create constraint engine
	constraintEngine, err := NewConstraintEngine(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create constraint engine: %w", err)
	}

	// Create pricing calculator
	pricingCalc := NewPricingCalculator(model)

	// Initialize configurator
	configurator := &Configurator{
		model:            model,
		constraintEngine: constraintEngine,
		pricingCalc:      pricingCalc,
		ruleAnalyzer:     NewRuleAnalyzer(model),
		currentConfig: Configuration{
			ID:         generateConfigID(),
			ModelID:    model.ID,
			Selections: make([]Selection, 0),
			IsValid:    true,
			TotalPrice: 0.0,
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		},
	}

	// Apply default selections for single-select groups
	configurator.applyDefaultSelections()

	return configurator, nil
}

// ===================================================================
// CORE CONFIGURATION OPERATIONS
// ===================================================================

// AddSelection adds an option selection to the configuration
func (c *Configurator) AddSelection(optionID string, quantity int) (ConfigurationUpdate, error) {
	startTime := time.Now()
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Validate option exists
	option, err := c.model.GetOption(optionID)
	if err != nil {
		c.stats.ErrorCount++
		return ConfigurationUpdate{}, fmt.Errorf("invalid option: %w", err)
	}

	if quantity <= 0 {
		return ConfigurationUpdate{}, fmt.Errorf("quantity must be positive")
	}

	// Check if option already selected
	newSelections := make([]Selection, 0, len(c.currentConfig.Selections)+1)
	found := false

	for _, selection := range c.currentConfig.Selections {
		if selection.OptionID == optionID {
			// Update existing selection
			newSelections = append(newSelections, Selection{
				OptionID: optionID,
				Quantity: quantity,
			})
			found = true
		} else {
			newSelections = append(newSelections, selection)
		}
	}

	// Add new selection if not found
	if !found {
		newSelections = append(newSelections, Selection{
			OptionID: optionID,
			Quantity: quantity,
		})
	}

	// Handle group constraints (remove conflicting selections for single-select groups)
	newSelections = c.handleGroupConstraints(option, newSelections)

	// Create updated configuration
	updatedConfig := c.currentConfig
	updatedConfig.Selections = newSelections
	updatedConfig.UpdatedAt = time.Now()

	// Validate and price the configuration
	update := c.evaluateConfiguration(updatedConfig, time.Since(startTime))

	// Update current configuration if valid or force update
	c.currentConfig = update.UpdatedConfig
	c.updateStats(time.Since(startTime))

	return update, nil
}

// RemoveSelection removes an option from the configuration
func (c *Configurator) RemoveSelection(optionID string) (ConfigurationUpdate, error) {
	startTime := time.Now()
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Filter out the selection
	newSelections := make([]Selection, 0, len(c.currentConfig.Selections))
	found := false

	for _, selection := range c.currentConfig.Selections {
		if selection.OptionID != optionID {
			newSelections = append(newSelections, selection)
		} else {
			found = true
		}
	}

	if !found {
		return ConfigurationUpdate{}, fmt.Errorf("option %s not selected", optionID)
	}

	// Create updated configuration
	updatedConfig := c.currentConfig
	updatedConfig.Selections = newSelections
	updatedConfig.UpdatedAt = time.Now()

	// Validate and price the configuration
	update := c.evaluateConfiguration(updatedConfig, time.Since(startTime))

	// Update current configuration
	c.currentConfig = update.UpdatedConfig
	c.updateStats(time.Since(startTime))

	return update, nil
}

// UpdateSelection updates the quantity for an existing selection
func (c *Configurator) UpdateSelection(optionID string, quantity int) (ConfigurationUpdate, error) {
	if quantity <= 0 {
		return c.RemoveSelection(optionID)
	}

	return c.AddSelection(optionID, quantity)
}

// ClearConfiguration removes all selections
func (c *Configurator) ClearConfiguration() ConfigurationUpdate {
	startTime := time.Now()
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Create empty configuration
	clearedConfig := Configuration{
		ID:         c.currentConfig.ID,
		ModelID:    c.currentConfig.ModelID,
		Selections: make([]Selection, 0),
		IsValid:    true,
		TotalPrice: 0.0,
		CreatedAt:  c.currentConfig.CreatedAt,
		UpdatedAt:  time.Now(),
	}

	// Evaluate empty configuration
	update := c.evaluateConfiguration(clearedConfig, time.Since(startTime))

	// Update current configuration
	c.currentConfig = update.UpdatedConfig
	c.updateStats(time.Since(startTime))

	return update
}

// ===================================================================
// CONFIGURATION EVALUATION
// ===================================================================

// evaluateConfiguration performs complete validation and pricing
func (c *Configurator) evaluateConfiguration(config Configuration, elapsed time.Duration) ConfigurationUpdate {
	// Phase 1: Validate constraints
	validationResult := c.constraintEngine.ValidateSelections(config.Selections)
	c.stats.ValidationCalls++

	// Phase 2: Calculate pricing (separate from constraints)
	priceBreakdown := c.pricingCalc.CalculatePrice(config.Selections)
	c.stats.PricingCalls++

	// Update configuration with results
	config.IsValid = validationResult.IsValid
	config.TotalPrice = priceBreakdown.TotalPrice

	// Get available options for current state
	availableOptions := c.getAvailableOptions(config.Selections)

	return ConfigurationUpdate{
		IsValid:          validationResult.IsValid,
		UpdatedConfig:    config,
		ValidationResult: validationResult,
		PriceBreakdown:   priceBreakdown,
		AvailableOptions: availableOptions,
		ResponseTime:     elapsed,
	}
}

// getAvailableOptions determines which options can be selected given current state
func (c *Configurator) getAvailableOptions(currentSelections []Selection) []AvailableOption {
	var available []AvailableOption

	// Build current selection map for quick lookup
	selectionMap := make(map[string]bool)
	for _, sel := range currentSelections {
		if sel.Quantity > 0 {
			selectionMap[sel.OptionID] = true
		}
	}

	// Get option-to-rules mapping
	optionToRules := c.constraintEngine.GetOptionToRulesMapping()

	for _, option := range c.model.Options {
		if !option.IsActive {
			continue
		}

		// Get group info
		group, err := c.model.GetGroup(option.GroupID)
		if err != nil {
			continue
		}

		// Determine selection status
		status := c.determineOptionStatus(option, selectionMap, group, currentSelections)
		
		// Build group context
		groupContext := c.buildGroupContext(group, selectionMap)
		
		// Create available option
		availableOption := AvailableOption{
			Option:    option,
			Status:    status,
			Price:     option.BasePrice,
			GroupInfo: groupContext,
		}

		// Set fields based on status
		switch status {
		case StatusSelected:
			availableOption.CanSelect = true
			availableOption.SelectionMethod = "none"
			availableOption.IsSelectable = true
			
			// Check if this selected option is violating constraints
			// We need to determine if THIS option is the one causing the violation
			// For example: if i7 requires 16GB and 8GB is selected, then 8GB is violating (not i7)
			
			// Get rules that this option is involved in
			optionRules := optionToRules[option.ID]
			
			for _, ruleID := range optionRules {
				// Skip group constraints
				if strings.HasPrefix(ruleID, "group_") {
					continue
				}
				
				// Check if this rule is currently violated
				ruleSatisfied, err := c.constraintEngine.EvaluateRule(ruleID, selectionMap)
				if err != nil || ruleSatisfied {
					continue // Rule is satisfied or error, skip
				}
				
				// Rule is violated - determine if THIS option is the cause
				// Test: would removing this option make the rule satisfied?
				testMap := make(map[string]bool)
				for k, v := range selectionMap {
					testMap[k] = v
				}
				testMap[option.ID] = false
				
				// Re-evaluate the rule without this option
				satisfiedWithoutOption, err := c.constraintEngine.EvaluateRule(ruleID, testMap)
				if err != nil {
					continue
				}
				
				// If removing this option makes the rule satisfied, then this option is causing the violation
				// BUT: for implication rules (A -> B), if A is selected without B, 
				// it's B that's missing, not A that's violating
				if satisfiedWithoutOption {
					// Check if this is an implication rule where this option is the antecedent
					isAntecedentOfImplication := false
					if c.ruleAnalyzer != nil {
						implications := c.ruleAnalyzer.GetImplicationRules(option.ID)
						for _, impl := range implications {
							if impl.RuleID == ruleID {
								isAntecedentOfImplication = true
								break
							}
						}
					}
					
					// Only mark as violating if it's NOT the antecedent of an implication
					// (i.e., don't mark monitor as violating when it requires keyboard)
					if !isAntecedentOfImplication {
						// Get the rule details for the message
						var ruleMessage string
						for _, rule := range c.model.Rules {
							if rule.ID == ruleID {
								ruleMessage = rule.Message
								if ruleMessage == "" {
									ruleMessage = fmt.Sprintf("%s constraint violation", rule.Name)
								}
								break
							}
						}
						
						availableOption.BlockedBy = append(availableOption.BlockedBy, ConstraintInfo{
							RuleID:      ruleID,
							Message:     ruleMessage,
							Type:        "violation",
							Description: "This selection violates a constraint",
						})
					}
				}
			}
			
		case StatusSelectable:
			availableOption.CanSelect = true
			availableOption.SelectionMethod = "add"
			availableOption.IsSelectable = true
			
		case StatusSwitch:
			availableOption.CanSelect = false
			availableOption.SelectionMethod = "switch"
			availableOption.IsSelectable = false
			
			// Find what needs to be deselected
			for _, groupOption := range group.Options {
				if groupOption.ID != option.ID && selectionMap[groupOption.ID] {
					availableOption.RequiresDeselect = append(availableOption.RequiresDeselect, groupOption.ID)
				}
			}
			
		case StatusMaxReached:
			availableOption.CanSelect = false
			availableOption.SelectionMethod = "none"
			availableOption.IsSelectable = false
			availableOption.Reason = fmt.Sprintf("Maximum selections (%d) reached for this group", group.MaxSelections)
		}
		
		// Set legacy fields for backward compatibility
		availableOption.IsRequired = c.isOptionRequired(option, group, selectionMap)
		
		// Add implication information for tooltips
		if implications := c.ruleAnalyzer.GetImplicationRules(option.ID); len(implications) > 0 {
			// Build a user-friendly message about requirements
			var requirementMessages []string
			for _, impl := range implications {
				if impl.IsDisjunctive && len(impl.Consequents) > 1 {
					// For OR rules: "Requires one of: A, B, C"
					consequentNames := c.getOptionNames(impl.Consequents)
					requirementMessages = append(requirementMessages, 
						fmt.Sprintf("Requires one of: %s", strings.Join(consequentNames, ", ")))
				} else if len(impl.Consequents) > 0 {
					// For single or AND rules: "Requires: A" or "Requires: A and B"
					consequentNames := c.getOptionNames(impl.Consequents)
					requirementMessages = append(requirementMessages, 
						fmt.Sprintf("Requires: %s", strings.Join(consequentNames, " and ")))
				}
			}
			
			// Add requirement info to the option (use Attributes field if available)
			if len(requirementMessages) > 0 {
				availableOption.RequirementTooltip = strings.Join(requirementMessages, "; ")
			}
		}

		available = append(available, availableOption)
	}

	// Sort by group and display order
	sort.Slice(available, func(i, j int) bool {
		optI, optJ := available[i].Option, available[j].Option
		if optI.GroupID != optJ.GroupID {
			return optI.GroupID < optJ.GroupID
		}
		return optI.DisplayOrder < optJ.DisplayOrder
	})

	// Add impact analysis if there are constraint violations
	validationResult := c.constraintEngine.ValidateSelections(currentSelections)
	if !validationResult.IsValid {
		c.addImpactAnalysis(available, currentSelections, validationResult)
	}

	return available
}

// determineOptionStatus determines the selection status of an option
func (c *Configurator) determineOptionStatus(option Option, currentSelections map[string]bool, group *Group, selections []Selection) SelectionStatus {
	// Already selected?
	if currentSelections[option.ID] {
		return StatusSelected
	}
	
	// Check group constraints first
	switch group.Type {
	case SingleSelect:
		// Is another option in this group selected?
		for _, groupOption := range group.Options {
			if groupOption.ID != option.ID && currentSelections[groupOption.ID] {
				// In single-select groups, other options become "switch" options
				return StatusSwitch
			}
		}
		
	case MultiSelect:
		currentCount := 0
		for _, opt := range group.Options {
			if currentSelections[opt.ID] {
				currentCount++
			}
		}
		if group.MaxSelections > 0 && currentCount >= group.MaxSelections {
			return StatusMaxReached
		}
	}
	
	// All other unselected options are selectable
	// We do NOT check constraints here - that happens after selection
	return StatusSelectable
}

// buildGroupContext builds the group context information
func (c *Configurator) buildGroupContext(group *Group, selections map[string]bool) GroupContext {
	groupType := string(group.Type)
	if groupType == string(SingleSelect) {
		groupType = "select-one"
	} else if groupType == string(MultiSelect) {
		groupType = "multi-select"
	}
	
	context := GroupContext{
		GroupID:       group.ID,
		GroupType:     groupType,
		MinSelections: group.MinSelections,
		MaxSelections: group.MaxSelections,
	}
	
	// Find current selections in this group
	for _, option := range group.Options {
		if selections[option.ID] {
			context.CurrentSelection = append(context.CurrentSelection, option.ID)
		}
	}
	
	return context
}


// createSwitchSelections creates selections for a switch operation (deselect some, select one)
func (c *Configurator) createSwitchSelections(current []Selection, selectID string, deselectIDs []string) []Selection {
	result := make([]Selection, 0, len(current))
	
	// Copy current selections, excluding ones to deselect
	deselectMap := make(map[string]bool)
	for _, id := range deselectIDs {
		deselectMap[id] = true
	}
	
	for _, sel := range current {
		if !deselectMap[sel.OptionID] {
			result = append(result, sel)
		}
	}
	
	// Add the new selection
	result = append(result, Selection{
		OptionID: selectID,
		Quantity: 1,
	})
	
	return result
}


// isOptionRequired checks if an option is required (part of a required group with no selections)
func (c *Configurator) isOptionRequired(option Option, group *Group, selections map[string]bool) bool {
	// Don't mark any options as required in the UI
	// The group being required is enough context
	return false
}

// createTestSelections creates a test selection set for availability checking
func (c *Configurator) createTestSelections(current []Selection, testOptionID string) []Selection {
	test := make([]Selection, len(current))
	copy(test, current)

	// Add test selection
	found := false
	for i, selection := range test {
		if selection.OptionID == testOptionID {
			test[i].Quantity = 1 // Test with quantity 1
			found = true
			break
		}
	}

	if !found {
		test = append(test, Selection{
			OptionID: testOptionID,
			Quantity: 1,
		})
	}

	return test
}

// handleGroupConstraints removes conflicting selections for single-select groups
func (c *Configurator) handleGroupConstraints(newOption *Option, selections []Selection) []Selection {
	group, err := c.model.GetGroup(newOption.GroupID)
	if err != nil {
		return selections
	}

	// For single-select groups, remove other selections from same group
	if group.Type == SingleSelect {
		filtered := make([]Selection, 0, len(selections))
		for _, selection := range selections {
			if selection.OptionID == newOption.ID {
				// Keep the new selection
				filtered = append(filtered, selection)
			} else {
				// Check if selection is from same group
				if option, err := c.model.GetOption(selection.OptionID); err == nil {
					if option.GroupID != newOption.GroupID {
						// Keep selections from other groups
						filtered = append(filtered, selection)
					}
					// Remove selections from same group
				}
			}
		}
		return filtered
	}

	return selections
}

// ===================================================================
// HELPER METHODS
// ===================================================================

// getOptionNames converts option IDs to their display names
func (c *Configurator) getOptionNames(optionIDs []string) []string {
	names := make([]string, 0, len(optionIDs))
	for _, id := range optionIDs {
		if opt, err := c.model.GetOption(id); err == nil {
			names = append(names, opt.Name)
		} else {
			names = append(names, id) // Fallback to ID if not found
		}
	}
	return names
}

// addImpactAnalysis adds impact information to available options
func (c *Configurator) addImpactAnalysis(available []AvailableOption, currentSelections []Selection, validationResult ValidationResult) {
	// Build current selection map
	currentMap := make(map[string]bool)
	for _, sel := range currentSelections {
		if sel.Quantity > 0 {
			currentMap[sel.OptionID] = true
		}
	}
	
	// For each violation, find which options could help resolve it
	helpfulOptions := make(map[string][]string) // optionID -> []ruleIDs it helps with
	
	for _, violation := range validationResult.Violations {
		// Use the constraint engine's new method to find helpful options
		options := c.constraintEngine.FindOptionsToResolveViolation(violation.RuleID, currentMap)
		for _, optID := range options {
			if helpfulOptions[optID] == nil {
				helpfulOptions[optID] = []string{}
			}
			helpfulOptions[optID] = append(helpfulOptions[optID], violation.RuleID)
		}
	}
	
	// Apply the impact information to available options
	for i := range available {
		option := &available[i]
		
		// Skip if already has impact set or if option is selected
		if option.Impact != "" || option.Status == StatusSelected {
			continue
		}
		
		// Check if this option helps resolve any violations
		if resolvedRules, exists := helpfulOptions[option.Option.ID]; exists {
			option.Impact = "helps"
			option.HelpsResolve = resolvedRules
		}
	}
}


// ===================================================================
// QUERY METHODS
// ===================================================================

// GetCurrentConfiguration returns the current configuration state
func (c *Configurator) GetCurrentConfiguration() Configuration {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.currentConfig
}

// IsValidConfiguration checks if current configuration is valid
func (c *Configurator) IsValidConfiguration() bool {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.currentConfig.IsValid
}

// GetCurrentPrice returns the current total price
func (c *Configurator) GetCurrentPrice() float64 {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.currentConfig.TotalPrice
}

// GetDetailedPrice returns detailed price breakdown for current configuration
func (c *Configurator) GetDetailedPrice() PriceBreakdown {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.pricingCalc.CalculatePrice(c.currentConfig.Selections)
}

// ValidateCurrentConfiguration performs validation on current configuration
func (c *Configurator) ValidateCurrentConfiguration() ValidationResult {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.constraintEngine.ValidateSelections(c.currentConfig.Selections)
}

// GetAvailableOptionsForGroup returns available options for a specific group
func (c *Configurator) GetAvailableOptionsForGroup(groupID string) ([]AvailableOption, error) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	// Validate group exists
	_, err := c.model.GetGroup(groupID)
	if err != nil {
		return nil, err
	}

	// Get all available options and filter by group
	allAvailable := c.getAvailableOptions(c.currentConfig.Selections)

	var groupOptions []AvailableOption
	for _, option := range allAvailable {
		if option.Option.GroupID == groupID {
			groupOptions = append(groupOptions, option)
		}
	}

	return groupOptions, nil
}

// ===================================================================
// CONFIGURATION MANAGEMENT
// ===================================================================

// LoadConfiguration loads a previously saved configuration
func (c *Configurator) LoadConfiguration(config Configuration) (ConfigurationUpdate, error) {
	startTime := time.Now()
	c.mutex.Lock()
	defer c.mutex.Unlock()

	// Validate the loaded configuration
	if config.ModelID != c.model.ID {
		return ConfigurationUpdate{}, fmt.Errorf("configuration model ID %s does not match configurator model ID %s",
			config.ModelID, c.model.ID)
	}

	// Validate all options exist
	for _, selection := range config.Selections {
		if _, err := c.model.GetOption(selection.OptionID); err != nil {
			return ConfigurationUpdate{}, fmt.Errorf("configuration contains invalid option %s: %w",
				selection.OptionID, err)
		}
	}

	// Update configuration timestamp
	config.UpdatedAt = time.Now()

	// Evaluate the loaded configuration
	update := c.evaluateConfiguration(config, time.Since(startTime))

	// Update current configuration
	c.currentConfig = update.UpdatedConfig
	c.updateStats(time.Since(startTime))

	return update, nil
}

// CloneConfiguration creates a copy of the current configuration
func (c *Configurator) CloneConfiguration() Configuration {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	clone := c.currentConfig
	clone.ID = generateConfigID()
	clone.CreatedAt = time.Now()
	clone.UpdatedAt = time.Now()

	// Deep copy selections
	clone.Selections = make([]Selection, len(c.currentConfig.Selections))
	copy(clone.Selections, c.currentConfig.Selections)

	return clone
}

// ===================================================================
// STATS AND UTILITIES
// ===================================================================

// GetStats returns configurator performance statistics
func (c *Configurator) GetStats() ConfiguratorStats {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	return c.stats
}

// GetConstraintEngineStats returns constraint engine statistics
func (c *Configurator) GetConstraintEngineStats() ConstraintStats {
	return c.constraintEngine.GetStats()
}

// GetPricingCalculatorStats returns pricing calculator statistics
func (c *Configurator) GetPricingCalculatorStats() PricingStats {
	return c.pricingCalc.GetStats()
}

// updateStats updates configurator performance statistics
func (c *Configurator) updateStats(elapsed time.Duration) {
	c.stats.TotalOperations++
	c.stats.LastOperation = time.Now()

	// Update average time
	if c.stats.TotalOperations == 1 {
		c.stats.AverageTime = elapsed
	} else {
		c.stats.AverageTime = time.Duration(
			(int64(c.stats.AverageTime)*(c.stats.TotalOperations-1) + int64(elapsed)) / c.stats.TotalOperations,
		)
	}
}

// generateConfigID generates a unique configuration ID
func generateConfigID() string {
	return fmt.Sprintf("config_%d", time.Now().UnixNano())
}

// applyDefaultSelections applies default option selections for single-select groups
func (c *Configurator) applyDefaultSelections() {
	startTime := time.Now()
	defaultSelections := make([]Selection, 0)

	fmt.Printf("Applying default selections for model %s\n", c.model.ID)

	// Find all single-select groups with default options
	for _, group := range c.model.Groups {
		fmt.Printf("Checking group %s: Type=%s, DefaultOptionID=%s\n", group.ID, group.Type, group.DefaultOptionID)
		
		if group.Type == SingleSelect && group.DefaultOptionID != "" {
			// Verify the default option exists and is active
			defaultOption, err := c.model.GetOption(group.DefaultOptionID)
			if err == nil && defaultOption.IsActive {
				fmt.Printf("Adding default selection: %s for group %s\n", group.DefaultOptionID, group.ID)
				defaultSelections = append(defaultSelections, Selection{
					OptionID: group.DefaultOptionID,
					Quantity: 1,
				})
			} else {
				fmt.Printf("Default option %s not found or inactive: %v\n", group.DefaultOptionID, err)
			}
		}
	}

	if len(defaultSelections) > 0 {
		fmt.Printf("Applying %d default selections\n", len(defaultSelections))
		// Update configuration with default selections
		c.currentConfig.Selections = defaultSelections
		c.currentConfig.UpdatedAt = time.Now()

		// Evaluate configuration with defaults
		update := c.evaluateConfiguration(c.currentConfig, time.Since(startTime))
		c.currentConfig = update.UpdatedConfig
		c.updateStats(time.Since(startTime))
		
		fmt.Printf("Configuration after defaults: %d selections, valid=%v\n", len(c.currentConfig.Selections), c.currentConfig.IsValid)
	} else {
		fmt.Printf("No default selections found\n")
	}
}

// ResetStats resets all performance statistics
func (c *Configurator) ResetStats() {
	c.mutex.Lock()
	defer c.mutex.Unlock()
	c.stats = ConfiguratorStats{}
}

// CalculatePricing calculates pricing for a given set of selections (for interface compatibility)
func (c *Configurator) CalculatePricing(selections []Selection) (*PricingResult, error) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()
	
	// Calculate pricing
	breakdown := c.pricingCalc.CalculatePrice(selections)
	
	// Convert to PricingResult
	result := &PricingResult{
		BasePrice:   breakdown.BasePrice,
		Adjustments: breakdown.Adjustments,
		TotalPrice:  breakdown.TotalPrice,
		Breakdown:   &breakdown,
	}
	
	return result, nil
}

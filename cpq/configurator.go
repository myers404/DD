// configurator.go - Main Configuration Engine
// Combines Phase 1 (static constraints) + Phase 2 (basic pricing)
// Provides unified interface for SMB CPQ operations

package cpq

import (
	"fmt"
	"sort"
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

// AvailableOption represents an option that can be selected
type AvailableOption struct {
	Option       Option  `json:"option"`
	IsSelectable bool    `json:"is_selectable"`
	Reason       string  `json:"reason,omitempty"`
	Price        float64 `json:"price"`
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

	for _, option := range c.model.Options {
		if !option.IsActive {
			continue
		}

		availableOption := AvailableOption{
			Option: option,
			Price:  option.BasePrice,
		}

		// Test if option can be selected by trying to add it
		testSelections := c.createTestSelections(currentSelections, option.ID)
		testResult := c.constraintEngine.ValidateSelections(testSelections)

		availableOption.IsSelectable = testResult.IsValid
		if !testResult.IsValid && len(testResult.Violations) > 0 {
			availableOption.Reason = testResult.Violations[0].Message
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

	return available
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

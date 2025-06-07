// mtbdd_bridge.go
// Bridge implementation for converting CPQ models to MTBDD representations
// Handles variable mapping, rule compilation, and configuration evaluation

package cpq

import (
	"DD/mtbdd"
	"fmt"
	"sync"
	"time"
)

// MTBDDConfiguration represents a compiled CPQ model in MTBDD form
type MTBDDConfiguration struct {
	Model            *Model                   `json:"model"`
	Variables        map[string]mtbdd.NodeRef `json:"variables"`
	RuleIndex        map[string]mtbdd.NodeRef `json:"rule_index"`
	UnifiedMTBDD     mtbdd.NodeRef            `json:"unified_mtbdd"`
	Stats            CompilationStats         `json:"stats"`
	CacheEnabled     bool                     `json:"cache_enabled"`
	compiledAt       time.Time
	mtbddEngine      *mtbdd.MTBDD
	variableRegistry *VariableRegistry
	ruleCompiler     *RuleCompiler
	mutex            sync.RWMutex
}

// CompilationStats tracks MTBDD compilation metrics
type CompilationStats struct {
	VariableCount   int           `json:"variable_count"`
	RuleCount       int           `json:"rule_count"`
	NodeCount       int           `json:"node_count"`
	CompilationTime time.Duration `json:"compilation_time"`
	CacheHits       int           `json:"cache_hits"`
	CacheMisses     int           `json:"cache_misses"`
}

// ===================================================================
// MAIN CONVERSION FUNCTION
// ===================================================================

// ToMTBDD converts a CPQ model to MTBDD representation
func (model *Model) ToMTBDD() (*MTBDDConfiguration, error) {
	startTime := time.Now()

	// Validate model structure
	if err := ValidateModel(model); err != nil {
		return nil, fmt.Errorf("model validation failed: %w", err)
	}

	// Initialize components
	mtbddEngine := mtbdd.NewMTBDD()
	if mtbddEngine == nil {
		return nil, fmt.Errorf("failed to create MTBDD engine")
	}

	variableRegistry := NewVariableRegistry()
	if variableRegistry == nil {
		return nil, fmt.Errorf("failed to create variable registry")
	}

	ruleCompiler := NewRuleCompiler(mtbddEngine, variableRegistry)
	if ruleCompiler == nil {
		return nil, fmt.Errorf("failed to create rule compiler")
	}

	if err := ruleCompiler.LoadStandardTemplates(); err != nil {
		return nil, fmt.Errorf("failed to load rule templates: %w", err)
	}

	config := &MTBDDConfiguration{
		Model:            model,
		Variables:        make(map[string]mtbdd.NodeRef),
		RuleIndex:        make(map[string]mtbdd.NodeRef),
		CacheEnabled:     true,
		compiledAt:       time.Now(),
		mtbddEngine:      mtbddEngine,
		variableRegistry: variableRegistry,
		ruleCompiler:     ruleCompiler,
	}

	// Phase 1: Register variables for options and groups
	if err := config.registerVariables(); err != nil {
		return nil, fmt.Errorf("variable registration failed: %w", err)
	}

	// Phase 2: Compile business rules
	if err := config.compileRules(); err != nil {
		return nil, fmt.Errorf("rule compilation failed: %w", err)
	}

	// Phase 3: Compile pricing rules
	if err := config.compilePricingRules(); err != nil {
		return nil, fmt.Errorf("pricing rule compilation failed: %w", err)
	}

	// Phase 4: Create unified constraint MTBDD
	if err := config.createUnifiedMTBDD(); err != nil {
		return nil, fmt.Errorf("unified MTBDD creation failed: %w", err)
	}

	// Phase 5: Generate compilation statistics
	config.generateStats(time.Since(startTime))

	return config, nil
}

// ===================================================================
// VARIABLE REGISTRATION
// ===================================================================

// registerVariables creates MTBDD variables for all CPQ elements
func (config *MTBDDConfiguration) registerVariables() error {
	config.mutex.Lock()
	defer config.mutex.Unlock()

	if config.mtbddEngine == nil {
		return fmt.Errorf("MTBDD engine not initialized")
	}

	if config.variableRegistry == nil {
		return fmt.Errorf("variable registry not initialized")
	}

	// Register option variables (boolean for selection state)
	for _, option := range config.Model.Options {
		varName := BuildOptionVariable(option.GroupID, option.ID)

		_, err := config.variableRegistry.RegisterVariable(varName, VarTypeBoolean, &option)
		if err != nil {
			return fmt.Errorf("failed to register option variable %s: %w", varName, err)
		}

		config.mtbddEngine.AddVar(varName)
		mtbddVar, err := config.mtbddEngine.Var(varName)
		if err != nil {
			return fmt.Errorf("failed to create MTBDD variable %s: %w", varName, err)
		}

		config.Variables[varName] = mtbddVar
	}

	// Register group count variables (integer for quantity tracking)
	for _, group := range config.Model.Groups {
		varName := BuildGroupCountVariable(group.ID)

		_, err := config.variableRegistry.RegisterVariable(varName, VarTypeInteger, &group)
		if err != nil {
			return fmt.Errorf("failed to register group variable %s: %w", varName, err)
		}

		config.mtbddEngine.AddVar(varName)
		mtbddVar, err := config.mtbddEngine.Var(varName)
		if err != nil {
			return fmt.Errorf("failed to create MTBDD group variable %s: %w", varName, err)
		}

		config.Variables[varName] = mtbddVar
	}

	// Register meta variables for system-wide constraints
	metaVars := []string{
		"meta_total_quantity",
		"meta_total_price",
		"meta_configuration_valid",
	}

	for _, metaVar := range metaVars {
		_, err := config.variableRegistry.RegisterVariable(metaVar, VarTypeInteger, nil)
		if err != nil {
			return fmt.Errorf("failed to register meta variable %s: %w", metaVar, err)
		}

		config.mtbddEngine.AddVar(metaVar)
		mtbddVar, err := config.mtbddEngine.Var(metaVar)
		if err != nil {
			return fmt.Errorf("failed to create MTBDD meta variable %s: %w", metaVar, err)
		}

		config.Variables[metaVar] = mtbddVar
	}

	return nil
}

// ===================================================================
// RULE COMPILATION
// ===================================================================

// compileRules converts business rules to MTBDD form
func (config *MTBDDConfiguration) compileRules() error {
	config.mutex.Lock()
	defer config.mutex.Unlock()

	if config.ruleCompiler == nil {
		return fmt.Errorf("rule compiler not initialized")
	}

	for _, rule := range config.Model.Rules {
		if !rule.IsActive {
			continue
		}

		compiledRule, err := config.ruleCompiler.CompileRule(&rule)
		if err != nil {
			return fmt.Errorf("failed to compile rule %s: %w", rule.ID, err)
		}

		if compiledRule == nil {
			return fmt.Errorf("rule %s compilation returned nil", rule.ID)
		}

		if compiledRule.CompiledMTBDD == 0 {
			return fmt.Errorf("rule %s compilation resulted in nil MTBDD", rule.ID)
		}

		config.RuleIndex[rule.ID] = compiledRule.CompiledMTBDD
	}

	return nil
}

// compilePricingRules converts pricing rules to MTBDD form
func (config *MTBDDConfiguration) compilePricingRules() error {
	config.mutex.Lock()
	defer config.mutex.Unlock()

	if config.ruleCompiler == nil {
		return fmt.Errorf("rule compiler not initialized")
	}

	for _, rule := range config.Model.PricingRules {
		if !rule.IsActive {
			continue
		}

		compiledRule, err := config.ruleCompiler.CompilePricingRule(&rule)
		if err != nil {
			return fmt.Errorf("failed to compile pricing rule %s: %w", rule.ID, err)
		}

		if compiledRule == nil {
			return fmt.Errorf("pricing rule %s compilation returned nil", rule.ID)
		}

		config.RuleIndex[rule.ID] = compiledRule.CompiledMTBDD
	}

	return nil
}

// createUnifiedMTBDD combines all constraints into a single MTBDD
func (config *MTBDDConfiguration) createUnifiedMTBDD() error {
	config.mutex.Lock()
	defer config.mutex.Unlock()

	if config.mtbddEngine == nil {
		return fmt.Errorf("MTBDD engine not initialized")
	}

	if len(config.RuleIndex) == 0 {
		// Create trivial "true" MTBDD if no rules
		trueMTBDD := config.mtbddEngine.Constant(true)
		config.UnifiedMTBDD = trueMTBDD
		return nil
	}

	// Start with the first rule
	var unifiedMTBDD mtbdd.NodeRef
	first := true

	for _, ruleMTBDD := range config.RuleIndex {
		if first {
			unifiedMTBDD = ruleMTBDD
			first = false
		} else {
			// Combine with AND operation
			combined := config.mtbddEngine.AND(unifiedMTBDD, ruleMTBDD)
			unifiedMTBDD = combined
		}
	}

	config.UnifiedMTBDD = unifiedMTBDD
	return nil
}

// ===================================================================
// CONFIGURATION EVALUATION
// ===================================================================

// EvaluateConfiguration checks if a configuration satisfies all constraints
func (config *MTBDDConfiguration) EvaluateConfiguration(selections []Selection) (bool, error) {
	config.mutex.RLock()
	defer config.mutex.RUnlock()

	// Critical fix: Check for proper initialization
	if config.mtbddEngine == nil {
		return false, fmt.Errorf("MTBDD engine not initialized")
	}

	if config.UnifiedMTBDD == 0 {
		return false, fmt.Errorf("configuration not properly compiled - unified MTBDD is nil")
	}

	// Convert selections to variable assignments
	assignment, err := config.selectionsToAssignment(selections)
	if err != nil {
		return false, fmt.Errorf("failed to convert selections to assignment: %w", err)
	}

	// Evaluate the unified MTBDD with the assignment
	result := config.mtbddEngine.Evaluate(config.UnifiedMTBDD, assignment)
	if err != nil {
		return false, fmt.Errorf("MTBDD evaluation failed: %w", err)
	}

	return result == true, nil
}

// selectionsToAssignment converts user selections to MTBDD variable assignments
func (config *MTBDDConfiguration) selectionsToAssignment(selections []Selection) (map[string]bool, error) {
	assignment := make(map[string]bool)
	groupCounts := make(map[string]int)

	// Validate that we have variables registered
	if len(config.Variables) == 0 {
		return nil, fmt.Errorf("no variables registered in MTBDD configuration")
	}

	// First pass: Set all option variables to false
	for _, option := range config.Model.Options {
		varName := BuildOptionVariable(option.GroupID, option.ID)

		// Critical fix: Validate variable exists before assignment
		if _, exists := config.Variables[varName]; !exists {
			return nil, fmt.Errorf("variable %s not registered in MTBDD", varName)
		}

		assignment[varName] = false
	}

	// Second pass: Set selected options to true and count group quantities
	for _, selection := range selections {
		// Find the option to get its group
		var option *OptionDef
		for i := range config.Model.Options {
			if config.Model.Options[i].ID == selection.OptionID {
				option = &config.Model.Options[i]
				break
			}
		}

		if option == nil {
			return nil, fmt.Errorf("option not found: %s", selection.OptionID)
		}

		// Set option variable to true
		varName := BuildOptionVariable(option.GroupID, option.ID)

		// Validate variable exists
		if _, exists := config.Variables[varName]; !exists {
			return nil, fmt.Errorf("variable %s not registered in MTBDD", varName)
		}

		assignment[varName] = true

		// Update group count
		groupCounts[option.GroupID] += selection.Quantity
	}

	// Third pass: Set group count variables
	totalQuantity := 0
	for _, group := range config.Model.Groups {
		count := groupCounts[group.ID]
		groupCountVar := BuildGroupCountVariable(group.ID)

		// Validate group variable exists
		if _, exists := config.Variables[groupCountVar]; !exists {
			return nil, fmt.Errorf("group variable %s not registered in MTBDD", groupCountVar)
		}

		// For boolean assignment, we represent counts > 0 as true
		assignment[groupCountVar] = count > 0
		totalQuantity += count
	}

	// Set meta variables
	if _, exists := config.Variables["meta_total_quantity"]; exists {
		assignment["meta_total_quantity"] = totalQuantity > 0
	}
	if _, exists := config.Variables["meta_configuration_valid"]; exists {
		assignment["meta_configuration_valid"] = true // Will be determined by evaluation
	}

	return assignment, nil
}

// ===================================================================
// STATISTICS AND METADATA
// ===================================================================

// generateStats calculates compilation statistics
func (config *MTBDDConfiguration) generateStats(compilationTime time.Duration) {
	config.Stats = CompilationStats{
		VariableCount:   len(config.Variables),
		RuleCount:       len(config.RuleIndex),
		CompilationTime: compilationTime,
		CacheHits:       0, // Will be updated during runtime
		CacheMisses:     0, // Will be updated during runtime
	}

	// Calculate node count if unified MTBDD exists
	if config.UnifiedMTBDD != 0 && config.mtbddEngine != nil {
		config.Stats.NodeCount = config.mtbddEngine.NodeCount(config.UnifiedMTBDD)
	}
}

// GetStats returns current compilation and runtime statistics
func (config *MTBDDConfiguration) GetStats() map[string]interface{} {
	config.mutex.RLock()
	defer config.mutex.RUnlock()

	return map[string]interface{}{
		"compilation_time": config.Stats.CompilationTime.String(),
		"variables":        config.Stats.VariableCount,
		"rules":            config.Stats.RuleCount,
		"nodes":            config.Stats.NodeCount,
		"cache_hits":       config.Stats.CacheHits,
		"cache_misses":     config.Stats.CacheMisses,
		"compiled_at":      config.compiledAt,
		"cache_enabled":    config.CacheEnabled,
	}
}

// GetPerformanceMetrics returns performance metrics for monitoring
func (config *MTBDDConfiguration) GetPerformanceMetrics() map[string]interface{} {
	config.mutex.RLock()
	defer config.mutex.RUnlock()

	cacheHitRate := 0.0
	totalOps := config.Stats.CacheHits + config.Stats.CacheMisses
	if totalOps > 0 {
		cacheHitRate = float64(config.Stats.CacheHits) / float64(totalOps)
	}

	return map[string]interface{}{
		"cache_hit_rate":   cacheHitRate,
		"total_operations": totalOps,
		"node_count":       config.Stats.NodeCount,
		"variable_count":   len(config.Variables),
		"depth":            config.getDepth(),
	}
}

// getDepth calculates the depth of the unified MTBDD
func (config *MTBDDConfiguration) getDepth() int {
	return 0
}

// ===================================================================
// CONSTRAINT VIOLATION ANALYSIS
// ===================================================================

// ExplainViolation provides detailed explanation of why a configuration is invalid
func (config *MTBDDConfiguration) ExplainViolation(selections []Selection) ([]string, error) {
	config.mutex.RLock()
	defer config.mutex.RUnlock()

	// Check for proper initialization
	if config.mtbddEngine == nil {
		return nil, fmt.Errorf("MTBDD engine not initialized")
	}

	if config.UnifiedMTBDD == 0 {
		return nil, fmt.Errorf("unified MTBDD not compiled")
	}

	var explanations []string

	// Check if the overall configuration is valid
	isValid, err := config.EvaluateConfiguration(selections)
	if err != nil {
		return nil, fmt.Errorf("evaluation failed: %w", err)
	}

	if isValid {
		return []string{"Configuration is valid"}, nil
	}

	// Convert selections to assignment for individual rule testing
	assignment, err := config.selectionsToAssignment(selections)
	if err != nil {
		return nil, fmt.Errorf("failed to convert selections: %w", err)
	}

	// Test individual rules to find violations
	for ruleID, ruleMTBDD := range config.RuleIndex {
		if ruleMTBDD == 0 {
			continue // Skip invalid rules
		}

		ruleResult := config.mtbddEngine.Evaluate(ruleMTBDD, assignment)
		if ruleResult != true {
			// Find the original rule for context
			var rule *RuleDef
			for i := range config.Model.Rules {
				if config.Model.Rules[i].ID == ruleID {
					rule = &config.Model.Rules[i]
					break
				}
			}

			if rule != nil {
				explanation := fmt.Sprintf("Violates rule '%s': %s", rule.Name, rule.Description)
				explanations = append(explanations, explanation)
			} else {
				explanation := fmt.Sprintf("Violates rule: %s", ruleID)
				explanations = append(explanations, explanation)
			}
		}
	}

	// If no specific violations found, provide generic explanation
	if len(explanations) == 0 {
		explanations = append(explanations, "Configuration violates one or more constraints")
	}

	return explanations, nil
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// ValidateModel performs comprehensive validation of the CPQ model structure
func ValidateModel(model *Model) error {
	if model == nil {
		return fmt.Errorf("model cannot be nil")
	}

	if model.ID == "" {
		return fmt.Errorf("model ID is required")
	}

	if len(model.Groups) == 0 {
		return fmt.Errorf("model must have at least one group")
	}

	// Check that all options belong to valid groups
	groupIDs := make(map[string]bool)
	for _, group := range model.Groups {
		if group.ID == "" {
			return fmt.Errorf("group ID cannot be empty")
		}
		groupIDs[group.ID] = true
	}

	for _, option := range model.Options {
		if option.ID == "" {
			return fmt.Errorf("option ID cannot be empty")
		}
		if !groupIDs[option.GroupID] {
			return fmt.Errorf("option %s references invalid group %s", option.ID, option.GroupID)
		}
		if option.BasePrice < 0 {
			return fmt.Errorf("option %s has negative base price: %f", option.ID, option.BasePrice)
		}
	}

	// Validate rules
	for _, rule := range model.Rules {
		if rule.ID == "" {
			return fmt.Errorf("rule ID cannot be empty")
		}
		if rule.Expression == "" {
			return fmt.Errorf("rule %s has empty expression", rule.ID)
		}
	}

	// Validate pricing rules
	for _, rule := range model.PricingRules {
		if rule.ID == "" {
			return fmt.Errorf("pricing rule ID cannot be empty")
		}
		if rule.Expression == "" {
			return fmt.Errorf("pricing rule %s has empty expression", rule.ID)
		}
	}

	return nil
}

// GetModelSummary returns a comprehensive summary of the model structure
func GetModelSummary(model *Model) map[string]interface{} {
	if model == nil {
		return map[string]interface{}{"error": "model is nil"}
	}

	summary := map[string]interface{}{
		"model_id":      model.ID,
		"model_name":    model.Name,
		"version":       model.Version,
		"groups":        len(model.Groups),
		"options":       len(model.Options),
		"rules":         len(model.Rules),
		"pricing_rules": len(model.PricingRules),
		"created_at":    time.Now(),
	}

	// Group breakdown with option counts
	groupSummary := make(map[string]interface{})
	for _, group := range model.Groups {
		optionCount := 0
		totalValue := 0.0

		for _, option := range model.Options {
			if option.GroupID == group.ID {
				optionCount++
				totalValue += option.BasePrice
			}
		}

		groupSummary[group.ID] = map[string]interface{}{
			"name":           group.Name,
			"type":           group.Type,
			"option_count":   optionCount,
			"total_value":    totalValue,
			"is_required":    group.IsRequired,
			"min_selections": group.MinSelections,
			"max_selections": group.MaxSelections,
		}
	}
	summary["group_details"] = groupSummary

	// Rule breakdown by type
	rulesByType := make(map[string]int)
	activeRules := 0
	for _, rule := range model.Rules {
		rulesByType[string(rule.Type)]++
		if rule.IsActive {
			activeRules++
		}
	}
	summary["rules_by_type"] = rulesByType
	summary["active_rules"] = activeRules

	// Pricing rule breakdown
	pricingRulesByType := make(map[string]int)
	activePricingRules := 0
	for _, rule := range model.PricingRules {
		pricingRulesByType[string(rule.Type)]++
		if rule.IsActive {
			activePricingRules++
		}
	}
	summary["pricing_rules_by_type"] = pricingRulesByType
	summary["active_pricing_rules"] = activePricingRules

	return summary
}

// IsConfigurationEmpty checks if a configuration has any selections
func IsConfigurationEmpty(selections []Selection) bool {
	return len(selections) == 0
}

// GetTotalQuantity calculates the total quantity across all selections
func GetTotalQuantity(selections []Selection) int {
	total := 0
	for _, selection := range selections {
		total += selection.Quantity
	}
	return total
}

// GetSelectedOptionIDs returns a list of all selected option IDs
func GetSelectedOptionIDs(selections []Selection) []string {
	optionIDs := make([]string, len(selections))
	for i, selection := range selections {
		optionIDs[i] = selection.OptionID
	}
	return optionIDs
}

// validation_engine.go
// Comprehensive validation engine for CPQ configurations with intelligent suggestions
// Provides real-time constraint validation, violation detection, and resolution guidance

package cpq

import (
	"fmt"
	"sort"
	"sync"
	"time"

	"DD/mtbdd"
)

// ValidationEngine handles configuration validation and suggestion generation
type ValidationEngine struct {
	model            *Model
	mtbddConfig      *MTBDDConfiguration
	ruleCompiler     *RuleCompiler
	variableRegistry *VariableRegistry
	mtbddEngine      *mtbdd.MTBDD
	suggestionEngine *SuggestionEngine
	cache            map[string]*ValidationResult
	mutex            sync.RWMutex
	metrics          *ValidationMetrics
	options          ValidationOptions
}

// ValidationOptions configures validation behavior
type ValidationOptions struct {
	EnableSuggestions    bool          `json:"enable_suggestions"`
	MaxSuggestions       int           `json:"max_suggestions"`
	EnableCaching        bool          `json:"enable_caching"`
	CacheTTL             time.Duration `json:"cache_ttl"`
	EnableDetailedErrors bool          `json:"enable_detailed_errors"`
	MaxViolationDepth    int           `json:"max_violation_depth"`
}

// ValidationMetrics tracks validation performance
type ValidationMetrics struct {
	TotalValidations int64                   `json:"total_validations"`
	CacheHits        int64                   `json:"cache_hits"`
	CacheMisses      int64                   `json:"cache_misses"`
	AverageTime      time.Duration           `json:"average_time"`
	TotalTime        time.Duration           `json:"total_time"`
	ViolationsByType map[ViolationType]int64 `json:"violations_by_type"`
	mutex            sync.Mutex
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewValidationEngine creates a new validation engine with proper error handling
func NewValidationEngine(
	model *Model,
	ruleCompiler *RuleCompiler,
	variableRegistry *VariableRegistry,
	mtbddEngine *mtbdd.MTBDD,
) (*ValidationEngine, error) {

	// Critical fix: Validate all required components
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}
	if ruleCompiler == nil {
		return nil, fmt.Errorf("rule compiler cannot be nil")
	}
	if variableRegistry == nil {
		return nil, fmt.Errorf("variable registry cannot be nil")
	}
	if mtbddEngine == nil {
		return nil, fmt.Errorf("MTBDD engine cannot be nil")
	}

	// Create MTBDD configuration with proper error handling
	mtbddConfig, err := model.ToMTBDD()
	if err != nil {
		return nil, fmt.Errorf("failed to create MTBDD config: %w", err)
	}

	// Validate MTBDD configuration was created properly
	if mtbddConfig == nil {
		return nil, fmt.Errorf("MTBDD configuration creation returned nil")
	}

	engine := &ValidationEngine{
		model:            model,
		mtbddConfig:      mtbddConfig,
		ruleCompiler:     ruleCompiler,
		variableRegistry: variableRegistry,
		mtbddEngine:      mtbddEngine,
		suggestionEngine: NewSuggestionEngine(model, ruleCompiler, variableRegistry),
		cache:            make(map[string]*ValidationResult),
		metrics:          NewValidationMetrics(),
		options: ValidationOptions{
			EnableSuggestions:    true,
			MaxSuggestions:       10,
			EnableCaching:        true,
			CacheTTL:             5 * time.Minute,
			EnableDetailedErrors: true,
			MaxViolationDepth:    3,
		},
	}

	return engine, nil
}

// NewValidationMetrics creates a new metrics tracker
func NewValidationMetrics() *ValidationMetrics {
	return &ValidationMetrics{
		ViolationsByType: make(map[ViolationType]int64),
	}
}

// ===================================================================
// MAIN VALIDATION INTERFACE
// ===================================================================

// ValidateConfiguration performs comprehensive validation of a configuration
func (ve *ValidationEngine) ValidateConfiguration(config *Configuration) (*ValidationResult, error) {
	startTime := time.Now()

	// Critical fix: Validate engine is properly initialized
	if ve.mtbddConfig == nil {
		return nil, fmt.Errorf("validation engine not properly initialized - MTBDD config is nil")
	}

	if config == nil {
		return nil, fmt.Errorf("configuration cannot be nil")
	}

	// Generate validation ID
	validationID := generateValidationID()

	// Check cache first
	if ve.options.EnableCaching {
		cacheKey := ve.generateCacheKey(config)
		if cached := ve.getCachedResult(cacheKey); cached != nil {
			cached.Performance.CacheHit = true
			ve.updateMetrics(cached)
			return cached, nil
		}
	}

	// Perform validation
	result := &ValidationResult{
		ValidationID:    validationID,
		ConfigurationID: config.ID,
		Timestamp:       time.Now(),
		Violations:      []ConstraintViolation{},
		Suggestions:     []ResolutionSuggestion{},
		Performance:     PerformanceMetrics{CacheHit: false},
	}

	// Build validation context
	context, err := ve.buildValidationContext(config)
	if err != nil {
		return nil, fmt.Errorf("failed to build validation context: %w", err)
	}
	result.Context = context

	// Validate against MTBDD constraints
	constraintStartTime := time.Now()
	isValid, err := ve.validateConstraints(config)
	if err != nil {
		return nil, fmt.Errorf("constraint validation failed: %w", err)
	}
	result.Performance.ValidationTime = time.Since(constraintStartTime)

	result.IsValid = isValid

	// If invalid, analyze violations
	if !isValid {
		violations, err := ve.analyzeViolations(config, context)
		if err != nil {
			return nil, fmt.Errorf("violation analysis failed: %w", err)
		}
		result.Violations = violations

		// Generate suggestions if enabled
		if ve.options.EnableSuggestions {
			suggestionStartTime := time.Now()
			suggestions, err := ve.generateSuggestions(config, violations, context)
			if err != nil {
				// Log error but don't fail validation
				suggestions = []ResolutionSuggestion{}
			}
			result.Suggestions = suggestions
			result.Performance.SuggestionTime = time.Since(suggestionStartTime)
		}
	}

	// Update performance metrics
	result.Performance.ValidationTime = time.Since(startTime)
	if ve.mtbddConfig != nil && ve.mtbddConfig.UnifiedMTBDD != 0 {
		result.Performance.MTBDDNodes = ve.mtbddEngine.NodeCount(ve.mtbddConfig.UnifiedMTBDD)
	}
	result.Performance.RulesEvaluated = len(ve.model.Rules) + len(ve.model.PricingRules)

	// Cache the result
	if ve.options.EnableCaching {
		cacheKey := ve.generateCacheKey(config)
		ve.cacheResult(cacheKey, result)
	}

	// Update metrics
	ve.updateMetrics(result)

	return result, nil
}

// ValidateSelection validates a single selection change
func (ve *ValidationEngine) ValidateSelection(optionID string, quantity int, currentSelections []Selection) (*ValidationResult, error) {
	// Critical fix: Validate inputs
	if optionID == "" {
		return nil, fmt.Errorf("option ID cannot be empty")
	}
	if quantity < 0 {
		return nil, fmt.Errorf("quantity cannot be negative")
	}

	// Handle nil selections gracefully
	if currentSelections == nil {
		currentSelections = []Selection{}
	}

	// Create temporary configuration with the new selection
	tempSelections := make([]Selection, len(currentSelections))
	copy(tempSelections, currentSelections)

	// Add or update the selection
	found := false
	for i, sel := range tempSelections {
		if sel.OptionID == optionID {
			tempSelections[i].Quantity = quantity
			found = true
			break
		}
	}

	if !found {
		tempSelections = append(tempSelections, Selection{
			OptionID: optionID,
			Quantity: quantity,
		})
	}

	tempConfig := &Configuration{
		ID:         generateConfigurationID(),
		ModelID:    ve.model.ID,
		Selections: tempSelections,
		Timestamp:  time.Now(),
	}

	return ve.ValidateConfiguration(tempConfig)
}

// ===================================================================
// CONSTRAINT VALIDATION
// ===================================================================

// validateConstraints checks configuration against all constraints
func (ve *ValidationEngine) validateConstraints(config *Configuration) (bool, error) {
	// Critical fix: Validate MTBDD config is available and properly initialized
	if ve.mtbddConfig == nil {
		return false, fmt.Errorf("validation engine not properly initialized - MTBDD config is nil")
	}

	if ve.mtbddConfig.UnifiedMTBDD == 0 {
		return false, fmt.Errorf("MTBDD constraints not compiled")
	}

	// Handle nil or empty selections gracefully
	if config.Selections == nil {
		config.Selections = []Selection{}
	}

	// Use MTBDD to evaluate all constraints
	isValid, err := ve.mtbddConfig.EvaluateConfiguration(config.Selections)
	if err != nil {
		return false, fmt.Errorf("MTBDD evaluation failed: %w", err)
	}

	return isValid, nil
}

// ===================================================================
// VIOLATION ANALYSIS
// ===================================================================

// analyzeViolations identifies specific constraint violations
func (ve *ValidationEngine) analyzeViolations(config *Configuration, context *ValidationContext) ([]ConstraintViolation, error) {
	var violations []ConstraintViolation

	// Analyze business rule violations
	ruleViolations, err := ve.analyzeRuleViolations(config, context)
	if err != nil {
		return nil, fmt.Errorf("rule violation analysis failed: %w", err)
	}
	violations = append(violations, ruleViolations...)

	// Analyze group constraint violations
	groupViolations, err := ve.analyzeGroupViolations(config, context)
	if err != nil {
		return nil, fmt.Errorf("group violation analysis failed: %w", err)
	}
	violations = append(violations, groupViolations...)

	// Analyze pricing constraint violations
	pricingViolations, err := ve.analyzePricingViolations(config, context)
	if err != nil {
		return nil, fmt.Errorf("pricing violation analysis failed: %w", err)
	}
	violations = append(violations, pricingViolations...)

	// Sort violations by severity and priority
	sort.Slice(violations, func(i, j int) bool {
		if violations[i].Severity != violations[j].Severity {
			return violations[i].Severity == SeverityError
		}
		return violations[i].Context.Priority > violations[j].Context.Priority
	})

	return violations, nil
}

// analyzeRuleViolations checks violations of business rules
func (ve *ValidationEngine) analyzeRuleViolations(config *Configuration, context *ValidationContext) ([]ConstraintViolation, error) {
	var violations []ConstraintViolation

	if ve.mtbddConfig == nil {
		return violations, nil
	}

	// Convert selections to assignment
	assignment, err := ve.mtbddConfig.selectionsToAssignment(config.Selections)
	if err != nil {
		return nil, fmt.Errorf("failed to convert selections: %w", err)
	}

	// Test each rule individually
	for _, rule := range ve.model.Rules {
		if !rule.IsActive {
			continue
		}

		ruleMTBDD, exists := ve.mtbddConfig.RuleIndex[rule.ID]
		if !exists {
			continue
		}

		if ruleMTBDD == 0 {
			continue // Skip invalid rule MTBDDs
		}

		ruleResult := ve.mtbddEngine.Evaluate(ruleMTBDD, assignment)
		if ruleResult != true {
			violation := ve.createRuleViolation(&rule, config, context)
			violations = append(violations, violation)
		}
	}

	return violations, nil
}

// analyzeGroupViolations checks group quantity constraints
func (ve *ValidationEngine) analyzeGroupViolations(config *Configuration, context *ValidationContext) ([]ConstraintViolation, error) {
	var violations []ConstraintViolation

	for _, group := range ve.model.Groups {
		count := 0
		if context != nil && context.GroupCounts != nil {
			count = context.GroupCounts[group.ID]
		}

		// Check minimum requirements
		if group.IsRequired && group.MinSelections > 0 && count < group.MinSelections {
			violation := ConstraintViolation{
				Type:            ViolationGroupQuantity,
				RuleID:          fmt.Sprintf("group_%s_min", group.ID),
				Message:         ve.generateGroupMinMessage(&group, count),
				DetailedMessage: ve.generateDetailedGroupMinMessage(&group, count),
				Severity:        SeverityError,
				OptionIDs:       ve.getGroupOptionIDs(group.ID),
				Context: ViolationContext{
					GroupID:      group.ID,
					GroupName:    group.Name,
					CurrentCount: count,
					RequiredMin:  group.MinSelections,
					Priority:     10, // High priority for required groups
				},
			}
			violations = append(violations, violation)
		}

		// Check maximum limits
		if group.MaxSelections > 0 && count > group.MaxSelections {
			violation := ConstraintViolation{
				Type:            ViolationGroupQuantity,
				RuleID:          fmt.Sprintf("group_%s_max", group.ID),
				Message:         ve.generateGroupMaxMessage(&group, count),
				DetailedMessage: ve.generateDetailedGroupMaxMessage(&group, count),
				Severity:        SeverityError,
				OptionIDs:       ve.getGroupOptionIDs(group.ID),
				Context: ViolationContext{
					GroupID:      group.ID,
					GroupName:    group.Name,
					CurrentCount: count,
					RequiredMax:  group.MaxSelections,
					Priority:     8, // High priority for exceeded limits
				},
			}
			violations = append(violations, violation)
		}
	}

	return violations, nil
}

// analyzePricingViolations checks pricing constraint violations
func (ve *ValidationEngine) analyzePricingViolations(config *Configuration, context *ValidationContext) ([]ConstraintViolation, error) {
	var violations []ConstraintViolation

	if ve.mtbddConfig == nil {
		return violations, nil
	}

	// Convert selections to assignment
	assignment, err := ve.mtbddConfig.selectionsToAssignment(config.Selections)
	if err != nil {
		return nil, fmt.Errorf("failed to convert selections: %w", err)
	}

	// Test each pricing rule individually
	for _, rule := range ve.model.PricingRules {
		if !rule.IsActive {
			continue
		}

		ruleMTBDD, exists := ve.mtbddConfig.RuleIndex[rule.ID]
		if !exists {
			continue
		}

		if ruleMTBDD == 0 {
			continue // Skip invalid rule MTBDDs
		}

		ruleResult := ve.mtbddEngine.Evaluate(ruleMTBDD, assignment)
		if ruleResult != true {
			violation := ve.createPricingViolation(&rule, config, context)
			violations = append(violations, violation)
		}
	}

	return violations, nil
}

// ===================================================================
// SUGGESTION GENERATION
// ===================================================================

// generateSuggestions creates resolution suggestions for violations
func (ve *ValidationEngine) generateSuggestions(config *Configuration, violations []ConstraintViolation, context *ValidationContext) ([]ResolutionSuggestion, error) {
	if ve.suggestionEngine == nil {
		return []ResolutionSuggestion{}, nil
	}

	suggestions, err := ve.suggestionEngine.GenerateSuggestions(config, violations, context)
	if err != nil {
		return nil, fmt.Errorf("suggestion generation failed: %w", err)
	}

	// Limit number of suggestions
	if len(suggestions) > ve.options.MaxSuggestions {
		suggestions = suggestions[:ve.options.MaxSuggestions]
	}

	return suggestions, nil
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// buildValidationContext creates validation context from configuration
func (ve *ValidationEngine) buildValidationContext(config *Configuration) (*ValidationContext, error) {
	context := &ValidationContext{
		GroupCounts: make(map[string]int),
		Metadata:    make(map[string]interface{}),
	}

	// Handle nil selections gracefully
	if config.Selections == nil {
		config.Selections = []Selection{}
	}

	// Calculate group counts and totals
	for _, selection := range config.Selections {
		// Find option to get group ID
		var option *OptionDef
		for i := range ve.model.Options {
			if ve.model.Options[i].ID == selection.OptionID {
				option = &ve.model.Options[i]
				break
			}
		}

		if option == nil {
			continue // Skip unknown options
		}

		context.GroupCounts[option.GroupID] += selection.Quantity
		context.TotalQuantity += selection.Quantity
		context.TotalValue += option.BasePrice * float64(selection.Quantity)
	}

	// Add customer context if available
	if config.Context != nil && config.Context.Customer != nil {
		if segment, exists := config.Context.Customer.Attributes["type"]; exists {
			if segmentStr, ok := segment.(string); ok {
				context.CustomerSegment = segmentStr
			}
		}
	}

	// Add metadata
	context.Metadata["validation_timestamp"] = time.Now()
	context.Metadata["model_version"] = ve.model.Version
	context.Metadata["total_options"] = len(config.Selections)

	return context, nil
}

// createRuleViolation creates a violation for a business rule
func (ve *ValidationEngine) createRuleViolation(rule *RuleDef, config *Configuration, context *ValidationContext) ConstraintViolation {
	violationType := ve.determineViolationType(rule)

	return ConstraintViolation{
		Type:            violationType,
		RuleID:          rule.ID,
		Message:         ve.generateRuleMessage(rule, config),
		DetailedMessage: ve.generateDetailedRuleMessage(rule, config),
		Severity:        ve.determineSeverity(rule),
		OptionIDs:       ve.extractRelevantOptions(*rule, config),
		Context: ViolationContext{
			RuleID:          rule.ID,
			RuleName:        rule.Name,
			RuleExpression:  rule.Expression,
			AffectedOptions: ve.extractRelevantOptions(*rule, config),
			Priority:        rule.Priority,
		},
	}
}

// createPricingViolation creates a violation for a pricing rule
func (ve *ValidationEngine) createPricingViolation(rule *PricingRuleDef, config *Configuration, context *ValidationContext) ConstraintViolation {
	return ConstraintViolation{
		Type:            ViolationPricingConflict,
		RuleID:          rule.ID,
		Message:         ve.generatePricingMessage(rule, config),
		DetailedMessage: ve.generateDetailedPricingMessage(rule, config),
		Severity:        SeverityWarning,
		OptionIDs:       ve.extractPricingRelevantOptions(*rule, config),
		Context: ViolationContext{
			RuleID:          rule.ID,
			RuleName:        rule.Name,
			RuleExpression:  rule.Expression,
			AffectedOptions: ve.extractPricingRelevantOptions(*rule, config),
			Priority:        5, // Medium priority for pricing
		},
	}
}

// Message generation functions
func (ve *ValidationEngine) generateRuleMessage(rule *RuleDef, config *Configuration) string {
	switch rule.Type {
	case ExclusionRule:
		return ve.generateExclusionMessage(*rule, config)
	case RequirementRule:
		return ve.generateDependencyMessage(*rule, config)
	default:
		return fmt.Sprintf("Configuration violates rule: %s", rule.Name)
	}
}

func (ve *ValidationEngine) generateDetailedRuleMessage(rule *RuleDef, config *Configuration) string {
	switch rule.Type {
	case ExclusionRule:
		return ve.generateDetailedExclusionMessage(*rule, config)
	case RequirementRule:
		return ve.generateDetailedDependencyMessage(*rule, config)
	default:
		return fmt.Sprintf("The rule '%s' is not satisfied by the current configuration. %s", rule.Name, rule.Description)
	}
}

func (ve *ValidationEngine) generateExclusionMessage(rule RuleDef, config *Configuration) string {
	return fmt.Sprintf("Conflicting options selected: %s", rule.Name)
}

func (ve *ValidationEngine) generateDetailedExclusionMessage(rule RuleDef, config *Configuration) string {
	return fmt.Sprintf("The rule '%s' prevents certain options from being selected together. Please choose only one of the conflicting options.", rule.Name)
}

func (ve *ValidationEngine) generateDependencyMessage(rule RuleDef, config *Configuration) string {
	return fmt.Sprintf("Missing required dependency: %s", rule.Name)
}

func (ve *ValidationEngine) generateDetailedDependencyMessage(rule RuleDef, config *Configuration) string {
	return fmt.Sprintf("The rule '%s' requires additional options to be selected. Please add the missing dependencies.", rule.Name)
}

func (ve *ValidationEngine) generateGroupMinMessage(group *GroupDef, count int) string {
	return fmt.Sprintf("Group '%s' requires at least %d selections, but only %d provided", group.Name, group.MinSelections, count)
}

func (ve *ValidationEngine) generateDetailedGroupMinMessage(group *GroupDef, count int) string {
	return fmt.Sprintf("The group '%s' is required and must have at least %d selections. Please add %d more selections to this group.",
		group.Name, group.MinSelections, group.MinSelections-count)
}

func (ve *ValidationEngine) generateGroupMaxMessage(group *GroupDef, count int) string {
	return fmt.Sprintf("Group '%s' allows at most %d selections, but %d provided", group.Name, group.MaxSelections, count)
}

func (ve *ValidationEngine) generateDetailedGroupMaxMessage(group *GroupDef, count int) string {
	return fmt.Sprintf("The group '%s' allows at most %d selections. Please remove %d selections from this group.",
		group.Name, group.MaxSelections, count-group.MaxSelections)
}

func (ve *ValidationEngine) generatePricingMessage(rule *PricingRuleDef, config *Configuration) string {
	return fmt.Sprintf("Pricing constraint violation: %s", rule.Name)
}

func (ve *ValidationEngine) generateDetailedPricingMessage(rule *PricingRuleDef, config *Configuration) string {
	return fmt.Sprintf("The pricing rule '%s' cannot be applied to the current configuration. Please review your selections.", rule.Name)
}

// Utility functions for violation analysis
func (ve *ValidationEngine) determineViolationType(rule *RuleDef) ViolationType {
	switch rule.Type {
	case ExclusionRule:
		return ViolationMutualExclusion
	case RequirementRule:
		return ViolationMissingDependency
	default:
		return ViolationCustomRule
	}
}

func (ve *ValidationEngine) determineSeverity(rule *RuleDef) Severity {
	// Could be based on rule metadata or type
	return SeverityError
}

func (ve *ValidationEngine) extractRelevantOptions(rule RuleDef, config *Configuration) []string {
	// Parse rule expression to extract relevant options
	// Simplified implementation - should be enhanced with proper parsing
	var options []string
	if config.Selections != nil {
		for _, sel := range config.Selections {
			options = append(options, sel.OptionID)
		}
	}
	return options
}

func (ve *ValidationEngine) extractPricingRelevantOptions(rule PricingRuleDef, config *Configuration) []string {
	// Parse pricing rule expression to extract relevant options
	var options []string
	if config.Selections != nil {
		for _, sel := range config.Selections {
			options = append(options, sel.OptionID)
		}
	}
	return options
}

func (ve *ValidationEngine) getGroupOptionIDs(groupID string) []string {
	var optionIDs []string
	for _, option := range ve.model.Options {
		if option.GroupID == groupID {
			optionIDs = append(optionIDs, option.ID)
		}
	}
	return optionIDs
}

// ===================================================================
// CACHE MANAGEMENT
// ===================================================================

func (ve *ValidationEngine) generateCacheKey(config *Configuration) string {
	return fmt.Sprintf("config_%s_%d", config.ID, len(config.Selections))
}

func (ve *ValidationEngine) getCachedResult(key string) *ValidationResult {
	ve.mutex.RLock()
	defer ve.mutex.RUnlock()

	if result, exists := ve.cache[key]; exists {
		// Check if result is still valid (TTL)
		if time.Since(result.Timestamp) < ve.options.CacheTTL {
			return result
		}
		// Remove expired entry
		delete(ve.cache, key)
	}

	return nil
}

func (ve *ValidationEngine) cacheResult(key string, result *ValidationResult) {
	ve.mutex.Lock()
	defer ve.mutex.Unlock()

	if ve.cache == nil {
		ve.cache = make(map[string]*ValidationResult)
	}

	ve.cache[key] = result
}

func (ve *ValidationEngine) updateMetrics(result *ValidationResult) {
	if ve.metrics == nil {
		return
	}

	ve.metrics.mutex.Lock()
	defer ve.metrics.mutex.Unlock()

	ve.metrics.TotalValidations++
	ve.metrics.TotalTime += result.Performance.ValidationTime
	if ve.metrics.TotalValidations > 0 {
		ve.metrics.AverageTime = time.Duration(int64(ve.metrics.TotalTime) / ve.metrics.TotalValidations)
	}

	if result.Performance.CacheHit {
		ve.metrics.CacheHits++
	} else {
		ve.metrics.CacheMisses++
	}

	for _, violation := range result.Violations {
		ve.metrics.ViolationsByType[violation.Type]++
	}
}

// ===================================================================
// PUBLIC INTERFACE METHODS
// ===================================================================

// GetMetrics returns current validation metrics
func (ve *ValidationEngine) GetMetrics() map[string]interface{} {
	if ve.metrics == nil {
		return make(map[string]interface{})
	}

	ve.metrics.mutex.Lock()
	defer ve.metrics.mutex.Unlock()

	hitRate := 0.0
	totalOps := ve.metrics.CacheHits + ve.metrics.CacheMisses
	if totalOps > 0 {
		hitRate = float64(ve.metrics.CacheHits) / float64(totalOps)
	}

	return map[string]interface{}{
		"total_validations":  ve.metrics.TotalValidations,
		"cache_hit_rate":     hitRate,
		"average_time_ms":    float64(ve.metrics.AverageTime.Nanoseconds()) / 1e6,
		"violations_by_type": ve.metrics.ViolationsByType,
	}
}

// ClearCache removes all cached validation results
func (ve *ValidationEngine) ClearCache() {
	ve.mutex.Lock()
	defer ve.mutex.Unlock()
	ve.cache = make(map[string]*ValidationResult)
}

// SetOptions updates validation options
func (ve *ValidationEngine) SetOptions(options ValidationOptions) {
	ve.mutex.Lock()
	defer ve.mutex.Unlock()
	ve.options = options
}

// generateValidationID generates a unique validation ID
func generateValidationID() string {
	return fmt.Sprintf("val_%d", time.Now().UnixNano())
}

// generateConfigurationID generates a unique configuration ID
func generateConfigurationID() string {
	return fmt.Sprintf("config_%d", time.Now().UnixNano())
}

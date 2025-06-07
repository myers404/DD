// validation_errors.go
// Comprehensive error handling and suggestion system for CPQ validation
// Provides structured error types, contextual information, and resolution guidance

package cpq

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

// ===================================================================
// ERROR CONTEXT AND METADATA
// ===================================================================

// ErrorContext provides additional context for validation errors
type ErrorContext struct {
	ConfigurationID    string                 `json:"configuration_id,omitempty"`
	CurrentSelections  []Selection            `json:"current_selections"`
	ConflictingOptions []string               `json:"conflicting_options,omitempty"`
	MissingOptions     []string               `json:"missing_options,omitempty"`
	GroupContext       *GroupErrorContext     `json:"group_context,omitempty"`
	RuleContext        *RuleErrorContext      `json:"rule_context,omitempty"`
	CustomerContext    *CustomerErrorContext  `json:"customer_context,omitempty"`
	PricingContext     *PricingErrorContext   `json:"pricing_context,omitempty"`
	Metadata           map[string]interface{} `json:"metadata,omitempty"`
	Timestamp          time.Time              `json:"timestamp"`
}

// GroupErrorContext provides group-specific error context
type GroupErrorContext struct {
	GroupID          string   `json:"group_id"`
	GroupName        string   `json:"group_name"`
	GroupType        string   `json:"group_type"`
	CurrentCount     int      `json:"current_count"`
	MinRequired      int      `json:"min_required"`
	MaxAllowed       int      `json:"max_allowed"`
	IsRequired       bool     `json:"is_required"`
	SelectedOptions  []string `json:"selected_options"`
	AvailableOptions []string `json:"available_options"`
	DefaultOption    string   `json:"default_option,omitempty"`
}

// RuleErrorContext provides rule-specific error context
type RuleErrorContext struct {
	RuleID          string   `json:"rule_id"`
	RuleName        string   `json:"rule_name"`
	RuleType        string   `json:"rule_type"`
	RuleExpression  string   `json:"rule_expression"`
	AffectedOptions []string `json:"affected_options"`
	RequiredOptions []string `json:"required_options,omitempty"`
	ExcludedOptions []string `json:"excluded_options,omitempty"`
	Priority        int      `json:"priority"`
	Severity        string   `json:"severity"`
}

// CustomerErrorContext provides customer-specific error context
type CustomerErrorContext struct {
	CustomerID       string                 `json:"customer_id,omitempty"`
	CustomerSegment  string                 `json:"customer_segment,omitempty"`
	VolumeHistory    int                    `json:"volume_history,omitempty"`
	EligibleSegments []string               `json:"eligible_segments,omitempty"`
	Restrictions     []string               `json:"restrictions,omitempty"`
	Attributes       map[string]interface{} `json:"attributes,omitempty"`
}

// PricingErrorContext provides pricing-specific error context
type PricingErrorContext struct {
	CurrentTier     string   `json:"current_tier,omitempty"`
	EligibleTiers   []string `json:"eligible_tiers,omitempty"`
	VolumeThreshold int      `json:"volume_threshold,omitempty"`
	PricingRules    []string `json:"pricing_rules,omitempty"`
	DiscountIssues  []string `json:"discount_issues,omitempty"`
	TotalQuantity   int      `json:"total_quantity"`
}

// ===================================================================
// ERROR SUGGESTION SYSTEM
// ===================================================================

// ErrorSuggestion represents a suggested resolution for an error
type ErrorSuggestion struct {
	Type        SuggestionType         `json:"type"`
	Description string                 `json:"description"`
	Action      SuggestionAction       `json:"action"`
	OptionID    string                 `json:"option_id,omitempty"`
	GroupID     string                 `json:"group_id,omitempty"`
	Quantity    int                    `json:"quantity,omitempty"`
	Confidence  float64                `json:"confidence"`
	Priority    int                    `json:"priority"`
	Impact      string                 `json:"impact,omitempty"`
	Reasoning   string                 `json:"reasoning,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// SuggestionEngine generates intelligent suggestions for validation errors
type SuggestionEngine struct {
	model               *Model
	ruleCompiler        *RuleCompiler
	variableRegistry    *VariableRegistry
	suggestionRules     []SuggestionRule
	priorityWeights     map[SuggestionType]int
	confidenceThreshold float64
}

// SuggestionRule defines rules for generating suggestions
type SuggestionRule struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name"`
	Conditions []SuggestionCondition  `json:"conditions"`
	Actions    []SuggestionAction     `json:"actions"`
	Priority   int                    `json:"priority"`
	Confidence float64                `json:"confidence"`
	IsActive   bool                   `json:"is_active"`
	Metadata   map[string]interface{} `json:"metadata"`
}

// SuggestionCondition defines conditions for suggestion rules
type SuggestionCondition struct {
	Type      string      `json:"type"`
	Attribute string      `json:"attribute"`
	Operator  string      `json:"operator"`
	Value     interface{} `json:"value"`
	Weight    float64     `json:"weight"`
}

// ===================================================================
// VALIDATION ERROR BUILDER
// ===================================================================

// ValidationErrorBuilder provides a fluent interface for building validation errors
type ValidationErrorBuilder struct {
	violationType   ViolationType
	ruleID          string
	message         string
	detailedMessage string
	severity        Severity
	optionIDs       []string
	context         ErrorContext
	suggestions     []ErrorSuggestion
	metadata        map[string]interface{}
}

// NewValidationErrorBuilder creates a new validation error builder
func NewValidationErrorBuilder() *ValidationErrorBuilder {
	return &ValidationErrorBuilder{
		optionIDs:   make([]string, 0),
		suggestions: make([]ErrorSuggestion, 0),
		metadata:    make(map[string]interface{}),
		context: ErrorContext{
			Timestamp: time.Now(),
			Metadata:  make(map[string]interface{}),
		},
	}
}

// WithType sets the violation type
func (builder *ValidationErrorBuilder) WithType(violationType ViolationType) *ValidationErrorBuilder {
	builder.violationType = violationType
	return builder
}

// WithRule sets the rule information
func (builder *ValidationErrorBuilder) WithRule(ruleID, ruleName string) *ValidationErrorBuilder {
	builder.ruleID = ruleID
	if builder.context.RuleContext == nil {
		builder.context.RuleContext = &RuleErrorContext{}
	}
	builder.context.RuleContext.RuleID = ruleID
	builder.context.RuleContext.RuleName = ruleName
	return builder
}

// WithMessage sets the error message
func (builder *ValidationErrorBuilder) WithMessage(message string) *ValidationErrorBuilder {
	builder.message = message
	return builder
}

// WithDetailedMessage sets the detailed error message
func (builder *ValidationErrorBuilder) WithDetailedMessage(message string) *ValidationErrorBuilder {
	builder.detailedMessage = message
	return builder
}

// WithSeverity sets the error severity
func (builder *ValidationErrorBuilder) WithSeverity(severity Severity) *ValidationErrorBuilder {
	builder.severity = severity
	return builder
}

// WithOptions sets the affected option IDs
func (builder *ValidationErrorBuilder) WithOptions(optionIDs ...string) *ValidationErrorBuilder {
	builder.optionIDs = append(builder.optionIDs, optionIDs...)
	return builder
}

// WithGroupContext sets group-specific context
func (builder *ValidationErrorBuilder) WithGroupContext(context *GroupErrorContext) *ValidationErrorBuilder {
	builder.context.GroupContext = context
	return builder
}

// WithRuleContext sets rule-specific context
func (builder *ValidationErrorBuilder) WithRuleContext(context *RuleErrorContext) *ValidationErrorBuilder {
	builder.context.RuleContext = context
	return builder
}

// WithCustomerContext sets customer-specific context
func (builder *ValidationErrorBuilder) WithCustomerContext(context *CustomerErrorContext) *ValidationErrorBuilder {
	builder.context.CustomerContext = context
	return builder
}

// WithPricingContext sets pricing-specific context
func (builder *ValidationErrorBuilder) WithPricingContext(context *PricingErrorContext) *ValidationErrorBuilder {
	builder.context.PricingContext = context
	return builder
}

// WithCurrentSelections sets the current configuration selections
func (builder *ValidationErrorBuilder) WithCurrentSelections(selections []Selection) *ValidationErrorBuilder {
	builder.context.CurrentSelections = selections
	return builder
}

// WithConflictingOptions sets the conflicting options
func (builder *ValidationErrorBuilder) WithConflictingOptions(optionIDs ...string) *ValidationErrorBuilder {
	builder.context.ConflictingOptions = append(builder.context.ConflictingOptions, optionIDs...)
	return builder
}

// WithMissingOptions sets the missing options
func (builder *ValidationErrorBuilder) WithMissingOptions(optionIDs ...string) *ValidationErrorBuilder {
	builder.context.MissingOptions = append(builder.context.MissingOptions, optionIDs...)
	return builder
}

// WithSuggestion adds a suggestion for resolving the error
func (builder *ValidationErrorBuilder) WithSuggestion(suggestion ErrorSuggestion) *ValidationErrorBuilder {
	builder.suggestions = append(builder.suggestions, suggestion)
	return builder
}

// WithMetadata adds metadata to the error
func (builder *ValidationErrorBuilder) WithMetadata(key string, value interface{}) *ValidationErrorBuilder {
	builder.metadata[key] = value
	return builder
}

// Build creates the final constraint violation
func (builder *ValidationErrorBuilder) Build() ConstraintViolation {
	// Auto-generate messages if not provided
	if builder.message == "" {
		builder.message = builder.generateDefaultMessage()
	}
	if builder.detailedMessage == "" {
		builder.detailedMessage = builder.generateDefaultDetailedMessage()
	}

	// Convert context to ViolationContext for backward compatibility
	violationContext := ViolationContext{
		Priority: 5, // Default priority
	}

	if builder.context.GroupContext != nil {
		violationContext.GroupID = builder.context.GroupContext.GroupID
		violationContext.GroupName = builder.context.GroupContext.GroupName
		violationContext.CurrentCount = builder.context.GroupContext.CurrentCount
		violationContext.RequiredMin = builder.context.GroupContext.MinRequired
		violationContext.RequiredMax = builder.context.GroupContext.MaxAllowed
	}

	if builder.context.RuleContext != nil {
		violationContext.RuleID = builder.context.RuleContext.RuleID
		violationContext.RuleName = builder.context.RuleContext.RuleName
		violationContext.RuleExpression = builder.context.RuleContext.RuleExpression
		violationContext.AffectedOptions = builder.context.RuleContext.AffectedOptions
		violationContext.Priority = builder.context.RuleContext.Priority
	}

	return ConstraintViolation{
		Type:            builder.violationType,
		RuleID:          builder.ruleID,
		Message:         builder.message,
		DetailedMessage: builder.detailedMessage,
		Severity:        builder.severity,
		OptionIDs:       builder.optionIDs,
		Context:         violationContext,
		Metadata:        builder.metadata,
	}
}

// ===================================================================
// SUGGESTION ENGINE
// ===================================================================

// NewSuggestionEngine creates a new suggestion engine
func NewSuggestionEngine(model *Model, ruleCompiler *RuleCompiler, variableRegistry *VariableRegistry) *SuggestionEngine {
	engine := &SuggestionEngine{
		model:            model,
		ruleCompiler:     ruleCompiler,
		variableRegistry: variableRegistry,
		suggestionRules:  make([]SuggestionRule, 0),
		priorityWeights: map[SuggestionType]int{
			SuggestionRemoveOption:      15,
			SuggestionAddOption:         10,
			SuggestionSelectAlternative: 8,
			SuggestionChangeQuantity:    6,
			SuggestionConfigureGroup:    4,
			SuggestionApplyDiscount:     3,
			SuggestionCustomAction:      2,
		},
		confidenceThreshold: 0.3,
	}

	// Initialize default suggestion rules
	engine.initializeDefaultRules()

	return engine
}

// GenerateSuggestions generates suggestions for configuration violations
func (se *SuggestionEngine) GenerateSuggestions(
	config *Configuration,
	violations []ConstraintViolation,
	context *ValidationContext,
) ([]ResolutionSuggestion, error) {

	var allSuggestions []ResolutionSuggestion

	for _, violation := range violations {
		suggestions, err := se.generateSuggestionsForViolation(violation, config, context)
		if err != nil {
			continue // Skip violations we can't generate suggestions for
		}
		allSuggestions = append(allSuggestions, suggestions...)
	}

	// Remove duplicates and sort by priority
	uniqueSuggestions := se.removeDuplicateSuggestions(allSuggestions)
	se.sortSuggestionsByPriority(uniqueSuggestions)

	// Limit number of suggestions to prevent overwhelming user
	maxSuggestions := 10
	if len(uniqueSuggestions) > maxSuggestions {
		uniqueSuggestions = uniqueSuggestions[:maxSuggestions]
	}

	return uniqueSuggestions, nil
}

// generateSuggestionsForViolation generates suggestions for a specific violation
func (se *SuggestionEngine) generateSuggestionsForViolation(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) ([]ResolutionSuggestion, error) {

	var suggestions []ResolutionSuggestion

	switch violation.Type {
	case ViolationMutualExclusion:
		suggestions = se.generateMutualExclusionSuggestions(violation, config, context)
	case ViolationMissingDependency:
		suggestions = se.generateDependencySuggestions(violation, config, context)
	case ViolationGroupQuantity:
		suggestions = se.generateGroupQuantitySuggestions(violation, config, context)
	case ViolationPricingConflict:
		suggestions = se.generatePricingSuggestions(violation, config, context)
	case ViolationCustomRule:
		suggestions = se.generateCustomRuleSuggestions(violation, config, context)
	default:
		suggestions = se.generateGenericSuggestions(violation, config, context)
	}

	// Filter by confidence threshold
	var filteredSuggestions []ResolutionSuggestion
	for _, suggestion := range suggestions {
		if suggestion.Confidence >= se.confidenceThreshold {
			filteredSuggestions = append(filteredSuggestions, suggestion)
		}
	}

	return filteredSuggestions, nil
}

// generateMutualExclusionSuggestions generates suggestions for mutual exclusion violations
func (se *SuggestionEngine) generateMutualExclusionSuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	if len(violation.OptionIDs) >= 2 {
		// Suggest removing all but one option
		for i, optionID := range violation.OptionIDs {
			if i == 0 {
				continue // Keep the first option
			}

			suggestions = append(suggestions, ResolutionSuggestion{
				Type:        SuggestionRemoveOption,
				Description: fmt.Sprintf("Remove %s to resolve conflict", se.getOptionName(optionID)),
				Action:      ActionRemove,
				OptionID:    optionID,
				Confidence:  0.8,
				Priority:    se.priorityWeights[SuggestionRemoveOption],
				Metadata: map[string]interface{}{
					"violation_type": "mutual_exclusion",
					"conflict_with":  violation.OptionIDs[0],
				},
			})
		}

		// Suggest alternative options if available
		alternatives := se.findAlternativeOptions(violation.OptionIDs, config)
		for _, alt := range alternatives {
			suggestions = append(suggestions, ResolutionSuggestion{
				Type:        SuggestionSelectAlternative,
				Description: fmt.Sprintf("Consider %s as an alternative", se.getOptionName(alt)),
				Action:      ActionReplace,
				OptionID:    alt,
				Confidence:  0.7,
				Priority:    se.priorityWeights[SuggestionSelectAlternative],
				Metadata: map[string]interface{}{
					"violation_type":  "mutual_exclusion",
					"alternative_for": violation.OptionIDs,
				},
			})
		}
	}

	return suggestions
}

// generateDependencySuggestions generates suggestions for dependency violations
func (se *SuggestionEngine) generateDependencySuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	// Find missing dependencies
	missingDependencies := se.findMissingDependencies(violation, config)
	for _, dep := range missingDependencies {
		suggestions = append(suggestions, ResolutionSuggestion{
			Type:        SuggestionAddOption,
			Description: fmt.Sprintf("Add %s to satisfy dependency", se.getOptionName(dep)),
			Action:      ActionAdd,
			OptionID:    dep,
			Quantity:    1,
			Confidence:  0.9,
			Priority:    se.priorityWeights[SuggestionAddOption],
			Metadata: map[string]interface{}{
				"violation_type": "dependency",
				"required_by":    violation.OptionIDs,
			},
		})
	}

	// Suggest removing dependent options if dependencies can't be satisfied
	for _, optionID := range violation.OptionIDs {
		suggestions = append(suggestions, ResolutionSuggestion{
			Type:        SuggestionRemoveOption,
			Description: fmt.Sprintf("Remove %s to avoid dependency requirement", se.getOptionName(optionID)),
			Action:      ActionRemove,
			OptionID:    optionID,
			Confidence:  0.6,
			Priority:    se.priorityWeights[SuggestionRemoveOption] - 2, // Lower priority
			Metadata: map[string]interface{}{
				"violation_type":       "dependency",
				"alternative_solution": true,
			},
		})
	}

	return suggestions
}

// generateGroupQuantitySuggestions generates suggestions for group quantity violations
func (se *SuggestionEngine) generateGroupQuantitySuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	groupID := violation.Context.GroupID
	if groupID == "" {
		return suggestions
	}

	currentCount := violation.Context.CurrentCount
	minRequired := violation.Context.RequiredMin
	maxAllowed := violation.Context.RequiredMax

	// Too few selections
	if currentCount < minRequired {
		deficit := minRequired - currentCount

		// Suggest adding options from the group
		availableOptions := se.getAvailableOptionsForGroup(groupID, config)
		for i, optionID := range availableOptions {
			if i >= deficit {
				break // Added enough
			}

			suggestions = append(suggestions, ResolutionSuggestion{
				Type:        SuggestionAddOption,
				Description: fmt.Sprintf("Add %s to meet minimum requirement", se.getOptionName(optionID)),
				Action:      ActionAdd,
				OptionID:    optionID,
				GroupID:     groupID,
				Quantity:    1,
				Confidence:  0.85,
				Priority:    se.priorityWeights[SuggestionAddOption],
				Metadata: map[string]interface{}{
					"violation_type": "group_quantity",
					"requirement":    "minimum",
					"deficit":        deficit,
				},
			})
		}
	}

	// Too many selections
	if maxAllowed > 0 && currentCount > maxAllowed {
		excess := currentCount - maxAllowed

		// Suggest removing options from the group
		selectedOptions := se.getSelectedOptionsForGroup(groupID, config)
		for i, optionID := range selectedOptions {
			if i >= excess {
				break // Removed enough
			}

			suggestions = append(suggestions, ResolutionSuggestion{
				Type:        SuggestionRemoveOption,
				Description: fmt.Sprintf("Remove %s to meet maximum limit", se.getOptionName(optionID)),
				Action:      ActionRemove,
				OptionID:    optionID,
				GroupID:     groupID,
				Confidence:  0.8,
				Priority:    se.priorityWeights[SuggestionRemoveOption],
				Metadata: map[string]interface{}{
					"violation_type": "group_quantity",
					"requirement":    "maximum",
					"excess":         excess,
				},
			})
		}
	}

	return suggestions
}

// generatePricingSuggestions generates suggestions for pricing violations
func (se *SuggestionEngine) generatePricingSuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	// Suggest volume optimizations
	totalQuantity := 0
	for _, sel := range config.Selections {
		totalQuantity += sel.Quantity
	}

	// Check if close to volume tier boundaries
	if totalQuantity >= 9 && totalQuantity < 11 {
		suggestions = append(suggestions, ResolutionSuggestion{
			Type:        SuggestionChangeQuantity,
			Description: "Increase quantity to 11 for volume tier discount",
			Action:      ActionIncrease,
			Confidence:  0.75,
			Priority:    se.priorityWeights[SuggestionChangeQuantity],
			Metadata: map[string]interface{}{
				"violation_type":     "pricing",
				"optimization":       "volume_tier",
				"current_quantity":   totalQuantity,
				"suggested_quantity": 11,
			},
		})
	}

	return suggestions
}

// generateCustomRuleSuggestions generates suggestions for custom rule violations
func (se *SuggestionEngine) generateCustomRuleSuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	// Generic suggestion for custom rules
	suggestions = append(suggestions, ResolutionSuggestion{
		Type:        SuggestionCustomAction,
		Description: "Review configuration to resolve custom rule violation",
		Action:      ActionConfigure,
		Confidence:  0.5,
		Priority:    se.priorityWeights[SuggestionCustomAction],
		Metadata: map[string]interface{}{
			"violation_type": "custom_rule",
			"rule_id":        violation.RuleID,
		},
	})

	return suggestions
}

// generateGenericSuggestions generates generic suggestions for unknown violations
func (se *SuggestionEngine) generateGenericSuggestions(
	violation ConstraintViolation,
	config *Configuration,
	context *ValidationContext,
) []ResolutionSuggestion {

	var suggestions []ResolutionSuggestion

	suggestions = append(suggestions, ResolutionSuggestion{
		Type:        SuggestionCustomAction,
		Description: "Review and adjust configuration to resolve constraint violation",
		Action:      ActionConfigure,
		Confidence:  0.4,
		Priority:    se.priorityWeights[SuggestionCustomAction],
		Metadata: map[string]interface{}{
			"violation_type": "generic",
			"rule_id":        violation.RuleID,
		},
	})

	return suggestions
}

// ===================================================================
// HELPER METHODS
// ===================================================================

// generateDefaultMessage generates a default error message
func (builder *ValidationErrorBuilder) generateDefaultMessage() string {
	switch builder.violationType {
	case ViolationMutualExclusion:
		return "Conflicting options selected"
	case ViolationMissingDependency:
		return "Required dependency missing"
	case ViolationGroupQuantity:
		return "Group quantity constraint violated"
	case ViolationPricingConflict:
		return "Pricing rule conflict"
	default:
		return "Configuration constraint violated"
	}
}

// generateDefaultDetailedMessage generates a default detailed error message
func (builder *ValidationErrorBuilder) generateDefaultDetailedMessage() string {
	switch builder.violationType {
	case ViolationMutualExclusion:
		return "The selected options cannot be used together. Please select only one of the conflicting options."
	case ViolationMissingDependency:
		return "The selected option requires additional options to be selected. Please add the required dependencies."
	case ViolationGroupQuantity:
		return "The group has quantity constraints that are not satisfied. Please adjust your selections."
	case ViolationPricingConflict:
		return "The current configuration conflicts with pricing rules. Please review your selections."
	default:
		return "The current configuration violates one or more constraints. Please review and adjust your selections."
	}
}

// Utility methods for suggestion generation
func (se *SuggestionEngine) getOptionName(optionID string) string {
	for _, option := range se.model.Options {
		if option.ID == optionID {
			return option.Name
		}
	}
	return optionID // Fallback to ID if name not found
}

func (se *SuggestionEngine) findAlternativeOptions(conflictingOptions []string, config *Configuration) []string {
	// Simplified: return options from same groups that aren't conflicting
	var alternatives []string

	for _, option := range se.model.Options {
		isConflicting := false
		for _, conflicting := range conflictingOptions {
			if option.ID == conflicting {
				isConflicting = true
				break
			}
		}
		if !isConflicting && option.IsAvailable {
			alternatives = append(alternatives, option.ID)
		}
	}

	return alternatives
}

func (se *SuggestionEngine) findMissingDependencies(violation ConstraintViolation, config *Configuration) []string {
	// Simplified implementation - would need rule parsing in practice
	var missing []string

	// Look for options mentioned in rule that aren't selected
	for _, option := range se.model.Options {
		isSelected := false
		for _, sel := range config.Selections {
			if sel.OptionID == option.ID {
				isSelected = true
				break
			}
		}
		if !isSelected && option.IsAvailable {
			missing = append(missing, option.ID)
		}
	}

	return missing
}

func (se *SuggestionEngine) getAvailableOptionsForGroup(groupID string, config *Configuration) []string {
	var options []string
	for _, option := range se.model.Options {
		if option.GroupID == groupID && option.IsAvailable {
			options = append(options, option.ID)
		}
	}
	return options
}

func (se *SuggestionEngine) getSelectedOptionsForGroup(groupID string, config *Configuration) []string {
	var options []string
	for _, sel := range config.Selections {
		for _, option := range se.model.Options {
			if option.ID == sel.OptionID && option.GroupID == groupID {
				options = append(options, option.ID)
				break
			}
		}
	}
	return options
}

func (se *SuggestionEngine) removeDuplicateSuggestions(suggestions []ResolutionSuggestion) []ResolutionSuggestion {
	seen := make(map[string]bool)
	var unique []ResolutionSuggestion

	for _, suggestion := range suggestions {
		key := fmt.Sprintf("%s_%s_%s_%d", suggestion.Type, suggestion.Action, suggestion.OptionID, suggestion.Quantity)
		if !seen[key] {
			seen[key] = true
			unique = append(unique, suggestion)
		}
	}

	return unique
}

func (se *SuggestionEngine) sortSuggestionsByPriority(suggestions []ResolutionSuggestion) {
	sort.Slice(suggestions, func(i, j int) bool {
		if suggestions[i].Priority != suggestions[j].Priority {
			return suggestions[i].Priority > suggestions[j].Priority
		}
		return suggestions[i].Confidence > suggestions[j].Confidence
	})
}

// initializeDefaultRules sets up default suggestion rules
func (se *SuggestionEngine) initializeDefaultRules() {
	// Initialize with basic suggestion rules
	se.suggestionRules = []SuggestionRule{
		{
			ID:         "mutual_exclusion_resolver",
			Name:       "Mutual Exclusion Resolver",
			Priority:   10,
			Confidence: 0.8,
			IsActive:   true,
		},
		{
			ID:         "dependency_resolver",
			Name:       "Dependency Resolver",
			Priority:   9,
			Confidence: 0.9,
			IsActive:   true,
		},
		{
			ID:         "quantity_optimizer",
			Name:       "Quantity Optimizer",
			Priority:   7,
			Confidence: 0.7,
			IsActive:   true,
		},
	}
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// CreateMutualExclusionError creates a mutual exclusion error
func CreateMutualExclusionError(conflictingOptions []string, ruleID, ruleName string) ConstraintViolation {
	return NewValidationErrorBuilder().
		WithType(ViolationMutualExclusion).
		WithRule(ruleID, ruleName).
		WithSeverity(SeverityError).
		WithOptions(conflictingOptions...).
		WithConflictingOptions(conflictingOptions...).
		WithMessage(fmt.Sprintf("Conflicting options: %s", strings.Join(conflictingOptions, ", "))).
		Build()
}

// CreateDependencyError creates a missing dependency error
func CreateDependencyError(dependentOption string, missingDependencies []string, ruleID, ruleName string) ConstraintViolation {
	return NewValidationErrorBuilder().
		WithType(ViolationMissingDependency).
		WithRule(ruleID, ruleName).
		WithSeverity(SeverityError).
		WithOptions(dependentOption).
		WithMissingOptions(missingDependencies...).
		WithMessage(fmt.Sprintf("Missing dependencies for %s", dependentOption)).
		Build()
}

// CreateGroupQuantityError creates a group quantity constraint error
func CreateGroupQuantityError(groupContext *GroupErrorContext) ConstraintViolation {
	return NewValidationErrorBuilder().
		WithType(ViolationGroupQuantity).
		WithSeverity(SeverityError).
		WithGroupContext(groupContext).
		WithMessage(fmt.Sprintf("Group %s quantity constraint violated", groupContext.GroupName)).
		Build()
}

// CreatePricingError creates a pricing constraint error
func CreatePricingError(pricingContext *PricingErrorContext, ruleID, ruleName string) ConstraintViolation {
	return NewValidationErrorBuilder().
		WithType(ViolationPricingConflict).
		WithRule(ruleID, ruleName).
		WithSeverity(SeverityWarning).
		WithPricingContext(pricingContext).
		WithMessage("Pricing constraint conflict").
		Build()
}

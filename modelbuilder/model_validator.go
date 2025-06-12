// model_validator.go - Comprehensive Model Validation
// Part of Model Building Tools for CPQ Platform Layer
// Performance target: <1s for complex enterprise models

package modelbuilder

import (
	"fmt"
	"math"
	"strings"
	"time"

	"DD/cpq"
)

// ===================================================================
// MODEL VALIDATION
// ===================================================================

// ValidationError represents a specific validation issue
type ValidationError struct {
	ErrorID     string   `json:"error_id"`
	ErrorType   string   `json:"error_type"`
	Severity    string   `json:"severity"` // "critical", "warning", "info"
	Message     string   `json:"message"`
	AffectedIDs []string `json:"affected_ids"`
	Context     string   `json:"context"`
	Suggestion  string   `json:"suggestion"`
}

// ValidationWarning represents a non-critical validation issue
type ValidationWarning struct {
	WarningID   string   `json:"warning_id"`
	WarningType string   `json:"warning_type"`
	Message     string   `json:"message"`
	AffectedIDs []string `json:"affected_ids"`
	Context     string   `json:"context"`
	Suggestion  string   `json:"suggestion"`
}

// ModelComplexityMetrics provides insights into model complexity
type ModelComplexityMetrics struct {
	TotalOptions     int     `json:"total_options"`
	TotalGroups      int     `json:"total_groups"`
	TotalRules       int     `json:"total_rules"`
	RuleComplexity   float64 `json:"rule_complexity"`   // Average complexity score
	DependencyDepth  int     `json:"dependency_depth"`  // Maximum dependency chain length
	CircularityRisk  float64 `json:"circularity_risk"`  // 0-100 risk score
	ConsistencyScore float64 `json:"consistency_score"` // 0-100 consistency score
}

// ValidationReport contains comprehensive model validation results
type ValidationReport struct {
	IsValid            bool                   `json:"is_valid"`
	ValidationTime     time.Duration          `json:"validation_time"`
	Errors             []ValidationError      `json:"errors"`
	Warnings           []ValidationWarning    `json:"warnings"`
	Suggestions        []string               `json:"suggestions"`
	ModelComplexity    ModelComplexityMetrics `json:"model_complexity"`
	RecommendedActions []string               `json:"recommended_actions"`
	QualityScore       int                    `json:"quality_score"` // 0-100
}

// ModelValidator performs comprehensive validation of CPQ models
type ModelValidator struct {
	model           *cpq.Model
	existingOptions map[string]bool
	existingGroups  map[string]bool
	dependencyGraph map[string][]string
	validationRules []ValidationRule
}

// ValidationRule defines a specific validation check
type ValidationRule struct {
	Name        string
	Description string
	Check       func(*ModelValidator) []ValidationError
	Priority    int
}

// NewModelValidator creates a new model validator
func NewModelValidator(model *cpq.Model) (*ModelValidator, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	validator := &ModelValidator{
		model:           model,
		existingOptions: make(map[string]bool),
		existingGroups:  make(map[string]bool),
		dependencyGraph: make(map[string][]string),
	}

	// Build lookup maps for efficient validation
	if err := validator.buildLookupMaps(); err != nil {
		return nil, fmt.Errorf("failed to build lookup maps: %w", err)
	}

	// Initialize validation rules
	validator.initializeValidationRules()

	return validator, nil
}

// ValidateModel performs comprehensive model validation
func (mv *ModelValidator) ValidateModel() (*ValidationReport, error) {
	startTime := time.Now()

	var allErrors []ValidationError
	var allWarnings []ValidationWarning

	// Run all validation rules
	for _, rule := range mv.validationRules {
		errors := rule.Check(mv)
		allErrors = append(allErrors, errors...)
	}

	// Generate warnings for potential issues
	warnings := mv.generateWarnings()
	allWarnings = append(allWarnings, warnings...)

	// Calculate model complexity metrics
	complexity := mv.calculateComplexityMetrics()

	// Generate suggestions and recommended actions
	suggestions := mv.generateSuggestions(allErrors, allWarnings)
	recommendedActions := mv.generateRecommendedActions(allErrors, allWarnings, complexity)

	// Calculate overall quality score
	qualityScore := mv.calculateQualityScore(allErrors, allWarnings, complexity)

	report := &ValidationReport{
		IsValid:            len(allErrors) == 0,
		ValidationTime:     time.Since(startTime),
		Errors:             allErrors,
		Warnings:           allWarnings,
		Suggestions:        suggestions,
		ModelComplexity:    complexity,
		RecommendedActions: recommendedActions,
		QualityScore:       qualityScore,
	}

	return report, nil
}

// buildLookupMaps creates efficient lookup structures for validation
func (mv *ModelValidator) buildLookupMaps() error {
	// Build option lookup map
	for _, option := range mv.model.Options {
		if mv.existingOptions[option.ID] {
			return fmt.Errorf("duplicate option ID: %s", option.ID)
		}
		mv.existingOptions[option.ID] = true
	}

	// Build group lookup map
	for _, group := range mv.model.Groups {
		if mv.existingGroups[group.ID] {
			return fmt.Errorf("duplicate group ID: %s", group.ID)
		}
		mv.existingGroups[group.ID] = true
	}

	// Build dependency graph for circular dependency detection
	for _, rule := range mv.model.Rules {
		if rule.Type == cpq.RequiresRule {
			deps := mv.extractRuleDependencies(rule.Expression)
			for source, targets := range deps {
				mv.dependencyGraph[source] = append(mv.dependencyGraph[source], targets...)
			}
		}
	}

	return nil
}

// initializeValidationRules sets up all validation checks
func (mv *ModelValidator) initializeValidationRules() {
	mv.validationRules = []ValidationRule{
		{
			Name:        "ID Reference Validation",
			Description: "Ensures all referenced IDs exist",
			Check:       mv.validateIDReferences,
			Priority:    1,
		},
		{
			Name:        "Circular Dependency Detection",
			Description: "Detects circular dependencies in rules",
			Check:       mv.validateCircularDependencies,
			Priority:    2,
		},
		{
			Name:        "Rule Priority Validation",
			Description: "Validates rule priorities are unique and sensible",
			Check:       mv.validateRulePriorities,
			Priority:    3,
		},
		{
			Name:        "Group Constraint Validation",
			Description: "Ensures group constraints are achievable",
			Check:       mv.validateGroupConstraints,
			Priority:    4,
		},
		{
			Name:        "Pricing Rule Validation",
			Description: "Validates pricing rules don't create impossible scenarios",
			Check:       mv.validatePricingRules,
			Priority:    5,
		},
		{
			Name:        "Expression Syntax Validation",
			Description: "Validates rule expressions are syntactically correct",
			Check:       mv.validateExpressionSyntax,
			Priority:    6,
		},
	}
}

// validateIDReferences checks that all referenced IDs exist
func (mv *ModelValidator) validateIDReferences(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	// Check rule references
	for _, rule := range mv.model.Rules {
		referencedIDs := mv.extractReferencedIDs(rule.Expression)
		for _, id := range referencedIDs {
			if !mv.existingOptions[id] && !mv.existingGroups[id] {
				errors = append(errors, ValidationError{
					ErrorID:     fmt.Sprintf("missing_reference_%s_%s", rule.ID, id),
					ErrorType:   "missing_reference",
					Severity:    "critical",
					Message:     fmt.Sprintf("Rule '%s' references non-existent ID '%s'", rule.Name, id),
					AffectedIDs: []string{rule.ID, id},
					Context:     fmt.Sprintf("Rule expression: %s", rule.Expression),
					Suggestion:  fmt.Sprintf("Create option/group with ID '%s' or update rule expression", id),
				})
			}
		}
	}

	// Check option group references (options point to groups)
	for _, option := range mv.model.Options {
		if option.GroupID != "" && !mv.existingGroups[option.GroupID] {
			errors = append(errors, ValidationError{
				ErrorID:     fmt.Sprintf("missing_option_group_%s_%s", option.ID, option.GroupID),
				ErrorType:   "missing_option_group",
				Severity:    "critical",
				Message:     fmt.Sprintf("Option '%s' references non-existent group '%s'", option.Name, option.GroupID),
				AffectedIDs: []string{option.ID, option.GroupID},
				Context:     fmt.Sprintf("Option group: %s", option.GroupID),
				Suggestion:  fmt.Sprintf("Create group with ID '%s' or update option's group reference", option.GroupID),
			})
		}
	}

	return errors
}

// validateCircularDependencies detects circular dependency chains
func (mv *ModelValidator) validateCircularDependencies(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	for option := range mv.dependencyGraph {
		if !visited[option] {
			cycle := mv.detectDependencyCycle(option, visited, recStack, []string{})
			if len(cycle) > 0 {
				errors = append(errors, ValidationError{
					ErrorID:     fmt.Sprintf("circular_dependency_%s", strings.Join(cycle, "_")),
					ErrorType:   "circular_dependency",
					Severity:    "critical",
					Message:     fmt.Sprintf("Circular dependency detected: %s", strings.Join(cycle, " -> ")),
					AffectedIDs: cycle,
					Context:     "Rule dependency chain",
					Suggestion:  fmt.Sprintf("Break circular dependency by removing one requirement in chain"),
				})
			}
		}
	}

	return errors
}

// validateRulePriorities ensures rule priorities are unique and sensible
func (mv *ModelValidator) validateRulePriorities(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	priorityMap := make(map[int][]string)
	for _, rule := range mv.model.Rules {
		if rule.Priority != 0 {
			priorityMap[rule.Priority] = append(priorityMap[rule.Priority], rule.ID)
		}
	}

	// Check for duplicate priorities
	for priority, ruleIDs := range priorityMap {
		if len(ruleIDs) > 1 {
			errors = append(errors, ValidationError{
				ErrorID:     fmt.Sprintf("duplicate_priority_%d", priority),
				ErrorType:   "duplicate_priority",
				Severity:    "warning",
				Message:     fmt.Sprintf("Multiple rules have priority %d: %v", priority, ruleIDs),
				AffectedIDs: ruleIDs,
				Context:     "Rule priorities",
				Suggestion:  "Assign unique priorities to ensure predictable rule execution order",
			})
		}
	}

	return errors
}

// validateGroupConstraints ensures group constraints are achievable
func (mv *ModelValidator) validateGroupConstraints(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	for _, group := range mv.model.Groups {
		// Count active options in this group
		optionsInGroup := mv.getActiveOptionsInGroup(group.ID)
		optionCount := len(optionsInGroup)

		switch group.Type {
		case cpq.SingleSelect:
			if optionCount < 1 {
				errors = append(errors, ValidationError{
					ErrorID:     fmt.Sprintf("empty_single_select_%s", group.ID),
					ErrorType:   "empty_group",
					Severity:    "critical",
					Message:     fmt.Sprintf("Single-select group '%s' has no options", group.Name),
					AffectedIDs: []string{group.ID},
					Context:     "Group configuration",
					Suggestion:  "Add at least one option to single-select group",
				})
			}

		case cpq.MultiSelect:
			if group.MinSelections > optionCount {
				errors = append(errors, ValidationError{
					ErrorID:   fmt.Sprintf("impossible_min_selections_%s", group.ID),
					ErrorType: "impossible_constraint",
					Severity:  "critical",
					Message: fmt.Sprintf("Group '%s' requires %d selections but only has %d options",
						group.Name, group.MinSelections, optionCount),
					AffectedIDs: []string{group.ID},
					Context:     "Group constraints",
					Suggestion:  fmt.Sprintf("Reduce minimum selections to %d or add more options", optionCount),
				})
			}

			if group.MaxSelections > 0 && group.MinSelections > group.MaxSelections {
				errors = append(errors, ValidationError{
					ErrorID:   fmt.Sprintf("invalid_selection_range_%s", group.ID),
					ErrorType: "invalid_constraint",
					Severity:  "critical",
					Message: fmt.Sprintf("Group '%s' minimum selections (%d) exceeds maximum (%d)",
						group.Name, group.MinSelections, group.MaxSelections),
					AffectedIDs: []string{group.ID},
					Context:     "Group selection constraints",
					Suggestion:  "Ensure minimum selections ≤ maximum selections",
				})
			}
		}
	}

	return errors
}

// validatePricingRules checks pricing rules for consistency
func (mv *ModelValidator) validatePricingRules(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	for _, rule := range mv.model.Rules {
		if rule.Type == cpq.PricingRule {
			// Check for negative pricing
			if strings.Contains(rule.Expression, "price") && strings.Contains(rule.Expression, "-") {
				// This is a simplified check - in practice, you'd parse the expression properly
				errors = append(errors, ValidationError{
					ErrorID:     fmt.Sprintf("negative_pricing_%s", rule.ID),
					ErrorType:   "negative_pricing",
					Severity:    "warning",
					Message:     fmt.Sprintf("Pricing rule '%s' may result in negative prices", rule.Name),
					AffectedIDs: []string{rule.ID},
					Context:     fmt.Sprintf("Rule expression: %s", rule.Expression),
					Suggestion:  "Ensure pricing rules cannot result in negative prices",
				})
			}
		}
	}

	return errors
}

// validateExpressionSyntax checks rule expressions for syntax errors
func (mv *ModelValidator) validateExpressionSyntax(validator *ModelValidator) []ValidationError {
	var errors []ValidationError

	for _, rule := range mv.model.Rules {
		if err := mv.validateExpression(rule.Expression); err != nil {
			errors = append(errors, ValidationError{
				ErrorID:     fmt.Sprintf("syntax_error_%s", rule.ID),
				ErrorType:   "syntax_error",
				Severity:    "critical",
				Message:     fmt.Sprintf("Rule '%s' has syntax error: %v", rule.Name, err),
				AffectedIDs: []string{rule.ID},
				Context:     fmt.Sprintf("Rule expression: %s", rule.Expression),
				Suggestion:  "Fix syntax error in rule expression",
			})
		}
	}

	return errors
}

// Helper methods

func (mv *ModelValidator) extractReferencedIDs(expression string) []string {
	// Simplified ID extraction - in practice, you'd use proper parsing
	var ids []string
	words := strings.Fields(expression)
	for _, word := range words {
		word = strings.Trim(word, "()!&|")
		if strings.HasPrefix(word, "opt_") || strings.HasPrefix(word, "group_") {
			ids = append(ids, word)
		}
	}
	return ids
}

func (mv *ModelValidator) extractRuleDependencies(expression string) map[string][]string {
	deps := make(map[string][]string)

	// Simple parsing for "A -> B" dependencies
	if strings.Contains(expression, "->") {
		parts := strings.Split(expression, "->")
		if len(parts) == 2 {
			source := strings.TrimSpace(parts[0])
			target := strings.TrimSpace(parts[1])
			deps[source] = append(deps[source], target)
		}
	}

	return deps
}

func (mv *ModelValidator) detectDependencyCycle(option string, visited, recStack map[string]bool, path []string) []string {
	visited[option] = true
	recStack[option] = true
	path = append(path, option)

	for _, dependency := range mv.dependencyGraph[option] {
		if !visited[dependency] {
			if cycle := mv.detectDependencyCycle(dependency, visited, recStack, path); len(cycle) > 0 {
				return cycle
			}
		} else if recStack[dependency] {
			// Found cycle
			cycleStart := -1
			for i, p := range path {
				if p == dependency {
					cycleStart = i
					break
				}
			}
			if cycleStart >= 0 {
				return append(path[cycleStart:], dependency)
			}
		}
	}

	recStack[option] = false
	return nil
}

func (mv *ModelValidator) validateExpression(expression string) error {
	// Simplified expression validation
	if expression == "" {
		return fmt.Errorf("empty expression")
	}

	// Check for balanced parentheses
	count := 0
	for _, char := range expression {
		if char == '(' {
			count++
		} else if char == ')' {
			count--
		}
		if count < 0 {
			return fmt.Errorf("unbalanced parentheses")
		}
	}
	if count != 0 {
		return fmt.Errorf("unbalanced parentheses")
	}

	return nil
}

func (mv *ModelValidator) generateWarnings() []ValidationWarning {
	var warnings []ValidationWarning

	// Check for unused options
	usedOptions := make(map[string]bool)

	// Mark options used in rules
	for _, rule := range mv.model.Rules {
		for _, id := range mv.extractReferencedIDs(rule.Expression) {
			usedOptions[id] = true
		}
	}

	// Mark options that belong to groups as used
	for _, option := range mv.model.Options {
		if option.GroupID != "" {
			usedOptions[option.ID] = true
		}
	}

	for _, option := range mv.model.Options {
		if !usedOptions[option.ID] {
			warnings = append(warnings, ValidationWarning{
				WarningID:   fmt.Sprintf("unused_option_%s", option.ID),
				WarningType: "unused_option",
				Message:     fmt.Sprintf("Option '%s' is not used in any rules or groups", option.Name),
				AffectedIDs: []string{option.ID},
				Context:     "Model optimization",
				Suggestion:  "Consider removing unused option or adding relevant rules",
			})
		}
	}

	return warnings
}

func (mv *ModelValidator) calculateComplexityMetrics() ModelComplexityMetrics {
	totalRules := len(mv.model.Rules)
	totalOptions := len(mv.model.Options)
	totalGroups := len(mv.model.Groups)

	// Calculate rule complexity (average number of conditions per rule)
	totalConditions := 0
	for _, rule := range mv.model.Rules {
		conditions := strings.Count(rule.Expression, "AND") + strings.Count(rule.Expression, "OR") + 1
		totalConditions += conditions
	}

	ruleComplexity := 0.0
	if totalRules > 0 {
		ruleComplexity = float64(totalConditions) / float64(totalRules)
	}

	// Calculate maximum dependency depth
	maxDepth := 0
	for option := range mv.dependencyGraph {
		depth := mv.calculateDependencyDepth(option, make(map[string]bool))
		if depth > maxDepth {
			maxDepth = depth
		}
	}

	// Calculate circularity risk (simplified)
	circularityRisk := float64(len(mv.dependencyGraph)) / float64(max(1, totalOptions)) * 100
	if circularityRisk > 100 {
		circularityRisk = 100
	}

	// Calculate consistency score
	consistencyScore := 100.0
	if totalRules > 0 {
		// Reduce score based on complexity factors
		consistencyScore -= math.Min(50, ruleComplexity*10)
		consistencyScore -= math.Min(30, float64(maxDepth)*5)
		consistencyScore -= math.Min(20, circularityRisk*0.2)
	}

	return ModelComplexityMetrics{
		TotalOptions:     totalOptions,
		TotalGroups:      totalGroups,
		TotalRules:       totalRules,
		RuleComplexity:   ruleComplexity,
		DependencyDepth:  maxDepth,
		CircularityRisk:  circularityRisk,
		ConsistencyScore: math.Max(0.0, consistencyScore),
	}
}

func (mv *ModelValidator) getActiveOptionsInGroup(groupID string) []cpq.Option {
	var options []cpq.Option
	for _, option := range mv.model.Options {
		if option.GroupID == groupID && option.IsActive {
			options = append(options, option)
		}
	}
	return options
}

func (mv *ModelValidator) calculateDependencyDepth(option string, visited map[string]bool) int {
	if visited[option] {
		return 0 // Avoid infinite recursion
	}

	visited[option] = true
	maxDepth := 0

	for _, dependency := range mv.dependencyGraph[option] {
		depth := 1 + mv.calculateDependencyDepth(dependency, visited)
		if depth > maxDepth {
			maxDepth = depth
		}
	}

	delete(visited, option)
	return maxDepth
}

func (mv *ModelValidator) generateSuggestions(errors []ValidationError, warnings []ValidationWarning) []string {
	var suggestions []string

	if len(errors) == 0 && len(warnings) == 0 {
		suggestions = append(suggestions, "Model validation passed - no issues detected")
		return suggestions
	}

	if len(errors) > 0 {
		suggestions = append(suggestions, fmt.Sprintf("Fix %d critical errors before deploying model", len(errors)))
	}

	if len(warnings) > 5 {
		suggestions = append(suggestions, "Consider model refactoring to reduce complexity")
	}

	return suggestions
}

func (mv *ModelValidator) generateRecommendedActions(errors []ValidationError, warnings []ValidationWarning, complexity ModelComplexityMetrics) []string {
	var actions []string

	// Error-based actions
	errorTypes := make(map[string]int)
	for _, err := range errors {
		errorTypes[err.ErrorType]++
	}

	for errType, count := range errorTypes {
		switch errType {
		case "missing_reference":
			actions = append(actions, fmt.Sprintf("Create missing options/groups for %d reference errors", count))
		case "circular_dependency":
			actions = append(actions, fmt.Sprintf("Break %d circular dependency chains", count))
		case "impossible_constraint":
			actions = append(actions, fmt.Sprintf("Fix %d impossible constraint configurations", count))
		}
	}

	// Complexity-based actions
	if complexity.RuleComplexity > 5 {
		actions = append(actions, "Consider simplifying complex rules for better maintainability")
	}

	if complexity.DependencyDepth > 5 {
		actions = append(actions, "Review deep dependency chains for potential simplification")
	}

	if complexity.ConsistencyScore < 70 {
		actions = append(actions, "Model consistency is low - review rule interactions")
	}

	if len(actions) == 0 {
		actions = append(actions, "Model is well-structured - no immediate actions required")
	}

	return actions
}

func (mv *ModelValidator) calculateQualityScore(errors []ValidationError, warnings []ValidationWarning, complexity ModelComplexityMetrics) int {
	score := 100

	// Deduct for errors
	for _, err := range errors {
		switch err.Severity {
		case "critical":
			score -= 15
		case "warning":
			score -= 5
		case "info":
			score -= 1
		}
	}

	// Deduct for warnings
	score -= len(warnings) * 2

	// Adjust for complexity
	score = int(float64(score) * (complexity.ConsistencyScore / 100))

	return max(0, min(100, score))
}

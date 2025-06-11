// validation.go - Basic validation helpers for SMB CPQ
// Simple validation utilities for model and configuration validation

package cpq

import (
	"fmt"
	"strings"
)

// ===================================================================
// MODEL VALIDATION HELPERS
// ===================================================================

// ValidateModel performs comprehensive model validation
func ValidateModel(model *Model) error {
	if model == nil {
		return fmt.Errorf("model cannot be nil")
	}

	// Basic model validation
	if err := model.Validate(); err != nil {
		return err
	}

	// Validate groups have options
	for _, group := range model.Groups {
		if err := validateGroup(model, group); err != nil {
			return fmt.Errorf("group %s validation failed: %w", group.ID, err)
		}
	}

	// Validate rules reference valid options
	for _, rule := range model.Rules {
		if err := validateRule(model, rule); err != nil {
			return fmt.Errorf("rule %s validation failed: %w", rule.ID, err)
		}
	}

	// Validate price rules
	for _, priceRule := range model.PriceRules {
		if err := validatePriceRule(model, priceRule); err != nil {
			return fmt.Errorf("price rule %s validation failed: %w", priceRule.ID, err)
		}
	}

	return nil
}

// validateGroup validates a single group
func validateGroup(model *Model, group Group) error {
	if group.ID == "" {
		return fmt.Errorf("group ID cannot be empty")
	}

	if group.Name == "" {
		return fmt.Errorf("group name cannot be empty")
	}

	// Check min/max selections make sense
	if group.MinSelections < 0 {
		return fmt.Errorf("min selections cannot be negative")
	}

	if group.MaxSelections > 0 && group.MaxSelections < group.MinSelections {
		return fmt.Errorf("max selections (%d) cannot be less than min selections (%d)",
			group.MaxSelections, group.MinSelections)
	}

	// Check group has options
	options := model.GetOptionsInGroup(group.ID)
	if len(options) == 0 {
		return fmt.Errorf("group has no active options")
	}

	// For single-select groups, max should be 1
	if group.Type == SingleSelect && group.MaxSelections != 1 {
		return fmt.Errorf("single-select group max selections must be 1")
	}

	// Check that max selections doesn't exceed available options
	if group.MaxSelections > len(options) && group.MaxSelections > 0 {
		return fmt.Errorf("max selections (%d) exceeds available options (%d)",
			group.MaxSelections, len(options))
	}

	return nil
}

// validateRule validates a constraint rule
func validateRule(model *Model, rule Rule) error {
	if rule.ID == "" {
		return fmt.Errorf("rule ID cannot be empty")
	}

	if rule.Name == "" {
		return fmt.Errorf("rule name cannot be empty")
	}

	if rule.Expression == "" {
		return fmt.Errorf("rule expression cannot be empty")
	}

	// Basic expression validation - check for referenced options
	referencedOptions := extractOptionReferences(rule.Expression)
	for _, optionRef := range referencedOptions {
		if _, err := model.GetOption(optionRef); err != nil {
			return fmt.Errorf("rule references invalid option %s", optionRef)
		}
	}

	return nil
}

// validatePriceRule validates a pricing rule
func validatePriceRule(model *Model, priceRule PriceRule) error {
	if priceRule.ID == "" {
		return fmt.Errorf("price rule ID cannot be empty")
	}

	if priceRule.Name == "" {
		return fmt.Errorf("price rule name cannot be empty")
	}

	if priceRule.Expression == "" {
		return fmt.Errorf("price rule expression cannot be empty")
	}

	// Validate expression format for simple rules
	switch priceRule.Type {
	case FixedDiscountRule, PercentDiscountRule, SurchargeRule:
		if err := validateSimplePriceExpression(model, priceRule.Expression); err != nil {
			return fmt.Errorf("invalid price expression: %w", err)
		}
	}

	return nil
}

// ===================================================================
// CONFIGURATION VALIDATION HELPERS
// ===================================================================

// ValidateConfiguration performs comprehensive configuration validation
func ValidateConfiguration(model *Model, config Configuration) error {
	if config.ModelID != model.ID {
		return fmt.Errorf("configuration model ID %s does not match model ID %s",
			config.ModelID, model.ID)
	}

	// Validate all selections reference valid options
	for _, selection := range config.Selections {
		if err := validateSelection(model, selection); err != nil {
			return fmt.Errorf("invalid selection %s: %w", selection.OptionID, err)
		}
	}

	// Validate group constraints
	for _, group := range model.Groups {
		if err := validateGroupSelections(model, group, config.Selections); err != nil {
			return fmt.Errorf("group %s constraint violation: %w", group.ID, err)
		}
	}

	return nil
}

// validateSelection validates a single selection
func validateSelection(model *Model, selection Selection) error {
	if selection.OptionID == "" {
		return fmt.Errorf("option ID cannot be empty")
	}

	if selection.Quantity <= 0 {
		return fmt.Errorf("quantity must be positive")
	}

	// Check option exists and is active
	option, err := model.GetOption(selection.OptionID)
	if err != nil {
		return err
	}

	if !option.IsActive {
		return fmt.Errorf("option %s is not active", selection.OptionID)
	}

	return nil
}

// validateGroupSelections validates selections against group constraints
func validateGroupSelections(model *Model, group Group, selections []Selection) error {
	// Count selections in this group
	groupSelections := 0
	for _, selection := range selections {
		if selection.Quantity > 0 {
			if option, err := model.GetOption(selection.OptionID); err == nil {
				if option.GroupID == group.ID {
					groupSelections++
				}
			}
		}
	}

	// Check minimum selections
	if group.IsRequired && groupSelections < group.MinSelections {
		return fmt.Errorf("group requires at least %d selections, got %d",
			group.MinSelections, groupSelections)
	}

	// Check maximum selections
	if group.MaxSelections > 0 && groupSelections > group.MaxSelections {
		return fmt.Errorf("group allows at most %d selections, got %d",
			group.MaxSelections, groupSelections)
	}

	return nil
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// extractOptionReferences extracts option references from constraint expressions
func extractOptionReferences(expression string) []string {
	var options []string

	// Simple extraction: look for "opt_" followed by option ID
	words := strings.Fields(expression)
	for _, word := range words {
		// Remove operators and parentheses
		cleaned := strings.Trim(word, "()!&|->")

		// Check if it's an option reference
		if strings.HasPrefix(cleaned, "opt_") {
			optionID := strings.TrimPrefix(cleaned, "opt_")
			if optionID != "" && !contains(options, optionID) {
				options = append(options, optionID)
			}
		}
	}

	return options
}

// validateSimplePriceExpression validates simple price rule expressions
func validateSimplePriceExpression(model *Model, expression string) error {
	// Expected format: "optionID:value"
	parts := strings.Split(expression, ":")
	if len(parts) != 2 {
		return fmt.Errorf("expression must be in format 'optionID:value', got %s", expression)
	}

	optionID := strings.TrimSpace(parts[0])
	value := strings.TrimSpace(parts[1])

	// Validate option exists
	if _, err := model.GetOption(optionID); err != nil {
		return fmt.Errorf("references invalid option %s", optionID)
	}

	// Validate value is numeric
	if value == "" {
		return fmt.Errorf("value cannot be empty")
	}

	// Simple numeric validation
	var testFloat float64
	if _, err := fmt.Sscanf(value, "%f", &testFloat); err != nil {
		return fmt.Errorf("value must be numeric, got %s", value)
	}

	return nil
}

// contains checks if a slice contains a string
func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// ===================================================================
// VALIDATION RESULT HELPERS
// ===================================================================

// IsValidationError checks if an error is a validation error
func IsValidationError(err error) bool {
	if err == nil {
		return false
	}

	errorMsg := err.Error()
	validationKeywords := []string{
		"validation failed",
		"constraint violation",
		"invalid option",
		"invalid selection",
		"references invalid",
		"cannot be empty",
		"must be positive",
	}

	for _, keyword := range validationKeywords {
		if strings.Contains(errorMsg, keyword) {
			return true
		}
	}

	return false
}

// FormatValidationError formats a validation error for user display
func FormatValidationError(err error) string {
	if err == nil {
		return ""
	}

	errorMsg := err.Error()

	// Make error messages more user-friendly
	replacements := map[string]string{
		"validation failed":    "There's an issue with",
		"constraint violation": "Selection not allowed:",
		"invalid option":       "Unknown option",
		"references invalid":   "depends on missing",
		"cannot be empty":      "is required",
		"must be positive":     "must be greater than zero",
	}

	for technical, friendly := range replacements {
		if strings.Contains(errorMsg, technical) {
			return strings.Replace(errorMsg, technical, friendly, 1)
		}
	}

	return errorMsg
}

// CreateValidationSummary creates a summary of validation results
func CreateValidationSummary(results []ValidationResult) string {
	if len(results) == 0 {
		return "No validation performed"
	}

	totalValid := 0
	totalViolations := 0

	for _, result := range results {
		if result.IsValid {
			totalValid++
		} else {
			totalViolations += len(result.Violations)
		}
	}

	if totalValid == len(results) {
		return fmt.Sprintf("All %d configurations are valid", len(results))
	}

	return fmt.Sprintf("%d valid, %d invalid with %d total violations",
		totalValid, len(results)-totalValid, totalViolations)
}

// model_validator_test.go - Unit tests for model validation
package modelbuilder

import (
	"fmt"
	"testing"
	"time"

	"DD/cpq"
)

func TestNewModelValidator(t *testing.T) {
	model := createValidTestModel()

	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	if validator.model != model {
		t.Error("Validator should store reference to model")
	}

	if len(validator.existingOptions) == 0 {
		t.Error("Validator should build option lookup map")
	}

	if len(validator.existingGroups) == 0 {
		t.Error("Validator should build group lookup map")
	}

	if len(validator.validationRules) == 0 {
		t.Error("Validator should initialize validation rules")
	}
}

func TestNewModelValidatorWithNilModel(t *testing.T) {
	_, err := NewModelValidator(nil)
	if err == nil {
		t.Error("Expected error with nil model")
	}
}

func TestValidateModel_ValidModel(t *testing.T) {
	model := createValidTestModel()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	report, err := validator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate model: %v", err)
	}

	if report == nil {
		t.Fatal("Report should not be nil")
	}

	if !report.IsValid {
		t.Errorf("Valid model should pass validation. Errors: %v", report.Errors)
	}

	if report.ValidationTime <= 0 {
		t.Error("Validation time should be positive")
	}

	if report.QualityScore <= 0 {
		t.Error("Quality score should be positive for valid model")
	}

	if len(report.Suggestions) == 0 {
		t.Error("Report should include suggestions")
	}
}

func TestValidateModel_InvalidModel(t *testing.T) {
	model := createInvalidTestModel()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	report, err := validator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate model: %v", err)
	}

	if report.IsValid {
		t.Error("Invalid model should fail validation")
	}

	if len(report.Errors) == 0 {
		t.Error("Invalid model should have errors")
	}

	if len(report.RecommendedActions) == 0 {
		t.Error("Invalid model should have recommended actions")
	}
}

func TestValidateIDReferences(t *testing.T) {
	model := createModelWithMissingReferences()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validateIDReferences(validator)
	if len(errors) == 0 {
		t.Error("Should detect missing ID references")
	}

	// Check error structure
	for _, err := range errors {
		if err.ErrorType != "missing_reference" && err.ErrorType != "missing_option_group" {
			t.Errorf("Expected missing reference error type, got '%s'", err.ErrorType)
		}
		if err.Severity != "critical" {
			t.Errorf("Missing reference should be critical severity, got '%s'", err.Severity)
		}
		if len(err.AffectedIDs) == 0 {
			t.Error("Error should include affected IDs")
		}
		if err.Suggestion == "" {
			t.Error("Error should include suggestion")
		}
	}
}

func TestValidateCircularDependencies(t *testing.T) {
	model := createModelWithCircularDependencies()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validateCircularDependencies(validator)
	if len(errors) == 0 {
		t.Error("Should detect circular dependencies")
	}

	// Check error structure
	for _, err := range errors {
		if err.ErrorType != "circular_dependency" {
			t.Errorf("Expected circular dependency error type, got '%s'", err.ErrorType)
		}
		if err.Severity != "critical" {
			t.Errorf("Circular dependency should be critical severity, got '%s'", err.Severity)
		}
		if len(err.AffectedIDs) < 2 {
			t.Error("Circular dependency should affect multiple IDs")
		}
	}
}

func TestValidateRulePriorities(t *testing.T) {
	model := createModelWithDuplicatePriorities()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validateRulePriorities(validator)
	if len(errors) == 0 {
		t.Error("Should detect duplicate priorities")
	}

	// Check error structure
	for _, err := range errors {
		if err.ErrorType != "duplicate_priority" {
			t.Errorf("Expected duplicate priority error type, got '%s'", err.ErrorType)
		}
		if len(err.AffectedIDs) < 2 {
			t.Error("Duplicate priority should affect multiple rules")
		}
	}
}

func TestValidateGroupConstraints(t *testing.T) {
	model := createModelWithInvalidGroupConstraints()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validateGroupConstraints(validator)
	if len(errors) == 0 {
		t.Error("Should detect invalid group constraints")
	}

	// Check for specific constraint violations
	errorTypes := make(map[string]bool)
	for _, err := range errors {
		errorTypes[err.ErrorType] = true
		if err.Severity != "critical" {
			t.Errorf("Group constraint errors should be critical, got '%s'", err.Severity)
		}
	}

	// Should detect various types of constraint issues
	expectedTypes := []string{"empty_group", "impossible_constraint", "invalid_constraint"}
	for _, expectedType := range expectedTypes {
		if !errorTypes[expectedType] {
			t.Errorf("Should detect %s constraint issues", expectedType)
		}
	}
}

func TestValidatePricingRules(t *testing.T) {
	model := createModelWithInvalidPricingRules()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validatePricingRules(validator)
	if len(errors) == 0 {
		t.Error("Should detect pricing rule issues")
	}

	// Check error structure
	for _, err := range errors {
		if err.ErrorType != "negative_pricing" {
			t.Errorf("Expected negative pricing error type, got '%s'", err.ErrorType)
		}
		if err.Severity != "warning" {
			t.Errorf("Pricing issues should be warnings, got '%s'", err.Severity)
		}
	}
}

func TestValidateExpressionSyntax(t *testing.T) {
	model := createModelWithSyntaxErrors()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	errors := validator.validateExpressionSyntax(validator)
	if len(errors) == 0 {
		t.Error("Should detect syntax errors")
	}

	// Check error structure
	for _, err := range errors {
		if err.ErrorType != "syntax_error" {
			t.Errorf("Expected syntax error type, got '%s'", err.ErrorType)
		}
		if err.Severity != "critical" {
			t.Errorf("Syntax errors should be critical, got '%s'", err.Severity)
		}
	}
}

func TestGenerateWarnings(t *testing.T) {
	model := createModelWithWarningConditions()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	warnings := validator.generateWarnings()
	if len(warnings) == 0 {
		t.Error("Should generate warnings for potential issues")
	}

	// Check warning structure
	for _, warning := range warnings {
		if warning.WarningType == "" {
			t.Error("Warning should have type")
		}
		if warning.Message == "" {
			t.Error("Warning should have message")
		}
		if warning.Suggestion == "" {
			t.Error("Warning should have suggestion")
		}
	}
}

func TestCalculateComplexityMetrics(t *testing.T) {
	model := createComplexTestModel()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	metrics := validator.calculateComplexityMetrics()

	if metrics.TotalOptions != len(model.Options) {
		t.Errorf("Expected %d total options, got %d", len(model.Options), metrics.TotalOptions)
	}

	if metrics.TotalGroups != len(model.Groups) {
		t.Errorf("Expected %d total groups, got %d", len(model.Groups), metrics.TotalGroups)
	}

	if metrics.TotalRules != len(model.Rules) {
		t.Errorf("Expected %d total rules, got %d", len(model.Rules), metrics.TotalRules)
	}

	if metrics.RuleComplexity < 0 {
		t.Error("Rule complexity should be non-negative")
	}

	if metrics.ConsistencyScore < 0 || metrics.ConsistencyScore > 100 {
		t.Errorf("Consistency score should be 0-100, got %f", metrics.ConsistencyScore)
	}
}

func TestCalculateQualityScore(t *testing.T) {
	model := createValidTestModel()
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	// Test with no errors
	complexity := ModelComplexityMetrics{ConsistencyScore: 90}
	score := validator.calculateQualityScore([]ValidationError{}, []ValidationWarning{}, complexity)

	if score < 80 {
		t.Errorf("Valid model should have high quality score, got %d", score)
	}

	// Test with errors
	errors := []ValidationError{
		{Severity: "critical"},
		{Severity: "warning"},
	}
	warnings := []ValidationWarning{{}, {}}

	lowScore := validator.calculateQualityScore(errors, warnings, complexity)
	if lowScore >= score {
		t.Error("Model with errors should have lower quality score")
	}

	if lowScore < 0 || lowScore > 100 {
		t.Errorf("Quality score should be 0-100, got %d", lowScore)
	}
}

func TestPerformanceValidation(t *testing.T) {
	// Test with larger model to verify performance requirements
	model := createLargeTestModelForValidation(100) // 100 options, 50 rules
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	start := time.Now()
	report, err := validator.ValidateModel()
	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to validate model: %v", err)
	}

	// Should meet performance target of <1s for complex models
	if elapsed > 1*time.Second {
		t.Errorf("Performance target missed: took %v, expected <1s", elapsed)
	}

	if report.ValidationTime <= 0 {
		t.Error("Validation time should be recorded")
	}

	t.Logf("Performance test: validated model with %d options, %d rules in %v",
		len(model.Options), len(model.Rules), elapsed)
}

// Helper functions for creating test models

func createValidTestModel() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Valid Test Model"

	// Add valid groups first
	model.Groups = []cpq.Group{
		{
			ID:         "group_cpu",
			Name:       "CPU Selection",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
		{
			ID:         "group_cooling",
			Name:       "Cooling Selection",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
	}

	// Add valid options that reference the groups
	model.Options = []cpq.Option{
		{ID: "opt_cpu_basic", Name: "Basic CPU", Price: 100, GroupID: "group_cpu", IsActive: true},
		{ID: "opt_cpu_high", Name: "High Performance CPU", Price: 300, GroupID: "group_cpu", IsActive: true},
		{ID: "opt_cooling_air", Name: "Air Cooling", Price: 50, GroupID: "group_cooling", IsActive: true},
		{ID: "opt_cooling_liquid", Name: "Liquid Cooling", Price: 150, GroupID: "group_cooling", IsActive: true},
	}

	// Add valid rules
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_cooling_requirement",
			Name:       "High CPU requires liquid cooling",
			Expression: "opt_cpu_high -> opt_cooling_liquid",
			Type:       cpq.RequiresRule,
			Priority:   1,
		},
	}

	return model
}

func createInvalidTestModel() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Invalid Test Model"

	// Add groups with issues
	model.Groups = []cpq.Group{
		{
			ID:         "group_empty",
			Name:       "Empty Group",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
	}

	// Add options - some with missing group references
	model.Options = []cpq.Option{
		{ID: "opt_cpu", Name: "CPU", Price: 100, GroupID: "group_missing"}, // References non-existent group
	}

	// Add rules with missing references
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_missing_ref",
			Name:       "Rule with missing reference",
			Expression: "opt_nonexistent -> opt_another_missing",
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createModelWithMissingReferences() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Missing References"

	// Add some options
	model.Options = []cpq.Option{
		{ID: "opt_existing", Name: "Existing Option", Price: 100, GroupID: "group_existing"},
	}

	// Add group
	model.Groups = []cpq.Group{
		{
			ID:         "group_existing",
			Name:       "Existing Group",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
	}

	// Add option that references non-existent group
	model.Options = append(model.Options, cpq.Option{
		ID:      "opt_orphaned",
		Name:    "Orphaned Option",
		Price:   100,
		GroupID: "group_missing", // References non-existent group
	})

	// Add rule with missing references
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_missing",
			Name:       "Rule with missing references",
			Expression: "opt_missing1 -> opt_missing2",
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createModelWithCircularDependencies() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Circular Dependencies"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 100},
		{ID: "opt_c", Name: "Option C", Price: 100},
	}

	// Add rules that create circular dependency: A -> B -> C -> A
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_a_to_b",
			Name:       "A requires B",
			Expression: "opt_a -> opt_b",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_b_to_c",
			Name:       "B requires C",
			Expression: "opt_b -> opt_c",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_c_to_a",
			Name:       "C requires A",
			Expression: "opt_c -> opt_a",
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createModelWithDuplicatePriorities() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Duplicate Priorities"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 100},
	}

	// Add rules with duplicate priorities
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_1",
			Name:       "Rule 1",
			Expression: "opt_a",
			Type:       cpq.RequiresRule,
			Priority:   10, // Duplicate priority
		},
		{
			ID:         "rule_2",
			Name:       "Rule 2",
			Expression: "opt_b",
			Type:       cpq.RequiresRule,
			Priority:   10, // Duplicate priority
		},
	}

	return model
}

func createModelWithInvalidGroupConstraints() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Invalid Group Constraints"

	// Add groups with various constraint issues
	model.Groups = []cpq.Group{
		{
			ID:         "group_empty",
			Name:       "Empty Single Select",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
		{
			ID:            "group_impossible_min",
			Name:          "Impossible Minimum",
			Type:          cpq.MultiSelect,
			MinSelections: 5, // Will have fewer options than this
			MaxSelections: 3,
		},
		{
			ID:            "group_invalid_range",
			Name:          "Invalid Range",
			Type:          cpq.MultiSelect,
			MinSelections: 3, // Min > Max
			MaxSelections: 2,
		},
	}

	// Add options - deliberately fewer than some group constraints require
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100, GroupID: "group_impossible_min", IsActive: true},
		{ID: "opt_b", Name: "Option B", Price: 200, GroupID: "group_impossible_min", IsActive: true},
		// group_empty has no options
		// group_invalid_range has no options but has min > max anyway
	}

	return model
}

func createModelWithInvalidPricingRules() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Invalid Pricing Rules"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_discount", Name: "Discount Option", Price: 100},
	}

	// Add pricing rules with potential issues
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_negative_price",
			Name:       "Potentially negative pricing",
			Expression: "opt_discount -> price - 200", // Could result in negative price
			Type:       cpq.PricingRule,
		},
	}

	return model
}

func createModelWithSyntaxErrors() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Syntax Errors"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_test", Name: "Test Option", Price: 100},
	}

	// Add rules with syntax errors
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_unbalanced_parens",
			Name:       "Unbalanced Parentheses",
			Expression: "((opt_test -> other)", // Unbalanced parentheses
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_empty_expression",
			Name:       "Empty Expression",
			Expression: "", // Empty expression
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createModelWithWarningConditions() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Warning Conditions"

	// Add groups
	model.Groups = []cpq.Group{
		{
			ID:   "group_test",
			Name: "Test Group",
			Type: cpq.SingleSelect,
		},
	}

	// Add options, some unused
	model.Options = []cpq.Option{
		{ID: "opt_used", Name: "Used Option", Price: 100, GroupID: "group_test", IsActive: true},
		{ID: "opt_unused", Name: "Unused Option", Price: 100, GroupID: "", IsActive: true}, // No group = unused
	}

	// No rules reference opt_unused, so it should generate a warning

	return model
}

func createComplexTestModel1() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Complex Test Model"

	// Add multiple options
	for i := 0; i < 10; i++ {
		model.Options = append(model.Options, cpq.Option{
			ID:    fmt.Sprintf("opt_%d", i),
			Name:  fmt.Sprintf("Option %d", i),
			Price: float64(100 * (i + 1)),
		})
	}

	// Add groups
	model.Groups = []cpq.Group{
		{
			ID:        "group_1",
			Name:      "Group 1",
			Type:      cpq.SingleSelect,
			OptionIDs: []string{"opt_0", "opt_1", "opt_2"},
		},
		{
			ID:            "group_2",
			Name:          "Group 2",
			Type:          cpq.MultiSelect,
			OptionIDs:     []string{"opt_3", "opt_4", "opt_5"},
			MinSelections: 1,
			MaxSelections: 2,
		},
	}

	// Add complex rules
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_complex_1",
			Name:       "Complex Rule 1",
			Expression: "(opt_0 AND opt_3) OR (opt_1 AND opt_4)",
			Type:       cpq.RequiresRule,
			Priority:   1,
		},
		{
			ID:         "rule_complex_2",
			Name:       "Complex Rule 2",
			Expression: "opt_2 -> (opt_5 AND opt_6)",
			Type:       cpq.RequiresRule,
			Priority:   2,
		},
	}

	return model
}

func createLargeTestModelForValidation(optionCount int) *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Large Test Model for Validation"

	// Add many options
	for i := 0; i < optionCount; i++ {
		model.Options = append(model.Options, cpq.Option{
			ID:    fmt.Sprintf("opt_%d", i),
			Name:  fmt.Sprintf("Option %d", i),
			Price: float64(100 + i),
		})
	}

	// Add groups
	groupSize := 5
	for i := 0; i < optionCount/groupSize; i++ {
		var optionIDs []string
		for j := 0; j < groupSize && i*groupSize+j < optionCount; j++ {
			optionIDs = append(optionIDs, fmt.Sprintf("opt_%d", i*groupSize+j))
		}

		model.Groups = append(model.Groups, cpq.Group{
			ID:        fmt.Sprintf("group_%d", i),
			Name:      fmt.Sprintf("Group %d", i),
			Type:      cpq.SingleSelect,
			OptionIDs: optionIDs,
		})
	}

	// Add rules (half of option count)
	for i := 0; i < optionCount/2; i++ {
		model.Rules = append(model.Rules, cpq.Rule{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Expression: fmt.Sprintf("opt_%d -> opt_%d", i, (i+1)%optionCount),
			Type:       cpq.RequiresRule,
			Priority:   i + 1,
		})
	}

	return model
}

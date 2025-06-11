package cpq

import (
	"fmt"
	"testing"
	"time"
)

func TestValidateModel(t *testing.T) {
	// Test valid model
	validModel := createValidTestModel()
	err := ValidateModel(validModel)
	if err != nil {
		t.Errorf("Valid model should pass validation: %v", err)
	}

	// Test nil model
	err = ValidateModel(nil)
	if err == nil {
		t.Error("Nil model should fail validation")
	}

	// Test model with empty ID
	invalidModel := NewModel("", "Test Model")
	err = ValidateModel(invalidModel)
	if err == nil {
		t.Error("Model with empty ID should fail validation")
	}
}

func TestValidateGroup(t *testing.T) {
	model := createValidTestModel()

	// Test valid group
	validGroup := Group{
		ID:            "test_group",
		Name:          "Test Group",
		Type:          SingleSelect,
		MinSelections: 1,
		MaxSelections: 1,
		IsRequired:    true,
	}

	// Add option to group first
	model.AddOption(Option{
		ID:       "test_opt",
		Name:     "Test Option",
		GroupID:  "test_group",
		IsActive: true,
	})

	err := validateGroup(model, validGroup)
	if err != nil {
		t.Errorf("Valid group should pass validation: %v", err)
	}

	// Test group with empty ID
	invalidGroup := validGroup
	invalidGroup.ID = ""
	err = validateGroup(model, invalidGroup)
	if err == nil {
		t.Error("Group with empty ID should fail validation")
	}

	// Test group with empty name
	invalidGroup = validGroup
	invalidGroup.Name = ""
	err = validateGroup(model, invalidGroup)
	if err == nil {
		t.Error("Group with empty name should fail validation")
	}

	// Test group with negative min selections
	invalidGroup = validGroup
	invalidGroup.MinSelections = -1
	err = validateGroup(model, invalidGroup)
	if err == nil {
		t.Error("Group with negative min selections should fail validation")
	}

	// Test group with max < min
	invalidGroup = validGroup
	invalidGroup.MinSelections = 3
	invalidGroup.MaxSelections = 1
	err = validateGroup(model, invalidGroup)
	if err == nil {
		t.Error("Group with max < min should fail validation")
	}

	// Test single-select group with max != 1
	invalidGroup = validGroup
	invalidGroup.Type = SingleSelect
	invalidGroup.MaxSelections = 2
	err = validateGroup(model, invalidGroup)
	if err == nil {
		t.Error("Single-select group with max != 1 should fail validation")
	}
}

func TestValidateRule(t *testing.T) {
	model := createValidTestModel()

	// Test valid rule
	validRule := Rule{
		ID:         "test_rule",
		Name:       "Test Rule",
		Type:       RequiresRule,
		Expression: "opt_opt1 -> opt_opt2",
		Message:    "Option 1 requires Option 2",
		IsActive:   true,
	}

	err := validateRule(model, validRule)
	if err != nil {
		t.Errorf("Valid rule should pass validation: %v", err)
	}

	// Test rule with empty ID
	invalidRule := validRule
	invalidRule.ID = ""
	err = validateRule(model, invalidRule)
	if err == nil {
		t.Error("Rule with empty ID should fail validation")
	}

	// Test rule with empty expression
	invalidRule = validRule
	invalidRule.Expression = ""
	err = validateRule(model, invalidRule)
	if err == nil {
		t.Error("Rule with empty expression should fail validation")
	}

	// Test rule referencing invalid option
	invalidRule = validRule
	invalidRule.Expression = "opt_nonexistent -> opt_opt1"
	err = validateRule(model, invalidRule)
	if err == nil {
		t.Error("Rule referencing invalid option should fail validation")
	}
}

func TestValidatePriceRule(t *testing.T) {
	model := createValidTestModel()

	// Test valid price rule
	validPriceRule := PriceRule{
		ID:         "test_price_rule",
		Name:       "Test Price Rule",
		Type:       FixedDiscountRule,
		Expression: "opt1:10.0",
		IsActive:   true,
	}

	err := validatePriceRule(model, validPriceRule)
	if err != nil {
		t.Errorf("Valid price rule should pass validation: %v", err)
	}

	// Test price rule with empty ID
	invalidPriceRule := validPriceRule
	invalidPriceRule.ID = ""
	err = validatePriceRule(model, invalidPriceRule)
	if err == nil {
		t.Error("Price rule with empty ID should fail validation")
	}

	// Test price rule with empty expression
	invalidPriceRule = validPriceRule
	invalidPriceRule.Expression = ""
	err = validatePriceRule(model, invalidPriceRule)
	if err == nil {
		t.Error("Price rule with empty expression should fail validation")
	}

	// Test price rule with invalid format
	invalidPriceRule = validPriceRule
	invalidPriceRule.Expression = "invalid_format"
	err = validatePriceRule(model, invalidPriceRule)
	if err == nil {
		t.Error("Price rule with invalid format should fail validation")
	}
}

func TestValidateConfiguration(t *testing.T) {
	model := createValidTestModel()

	// Test valid configuration
	validConfig := Configuration{
		ID:      "test_config",
		ModelID: model.ID,
		Selections: []Selection{
			{OptionID: "opt1", Quantity: 1},
		},
		IsValid:   true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := ValidateConfiguration(model, validConfig)
	if err != nil {
		t.Errorf("Valid configuration should pass validation: %v", err)
	}

	// Test configuration with wrong model ID
	invalidConfig := validConfig
	invalidConfig.ModelID = "wrong_model"
	err = ValidateConfiguration(model, invalidConfig)
	if err == nil {
		t.Error("Configuration with wrong model ID should fail validation")
	}

	// Test configuration with invalid option
	invalidConfig = validConfig
	invalidConfig.Selections = []Selection{
		{OptionID: "nonexistent", Quantity: 1},
	}
	err = ValidateConfiguration(model, invalidConfig)
	if err == nil {
		t.Error("Configuration with invalid option should fail validation")
	}
}

func TestValidateSelection(t *testing.T) {
	model := createValidTestModel()

	// Test valid selection
	validSelection := Selection{
		OptionID: "opt1",
		Quantity: 1,
	}

	err := validateSelection(model, validSelection)
	if err != nil {
		t.Errorf("Valid selection should pass validation: %v", err)
	}

	// Test selection with empty option ID
	invalidSelection := validSelection
	invalidSelection.OptionID = ""
	err = validateSelection(model, invalidSelection)
	if err == nil {
		t.Error("Selection with empty option ID should fail validation")
	}

	// Test selection with zero quantity
	invalidSelection = validSelection
	invalidSelection.Quantity = 0
	err = validateSelection(model, invalidSelection)
	if err == nil {
		t.Error("Selection with zero quantity should fail validation")
	}

	// Test selection with negative quantity
	invalidSelection = validSelection
	invalidSelection.Quantity = -1
	err = validateSelection(model, invalidSelection)
	if err == nil {
		t.Error("Selection with negative quantity should fail validation")
	}

	// Test selection with nonexistent option
	invalidSelection = validSelection
	invalidSelection.OptionID = "nonexistent"
	err = validateSelection(model, invalidSelection)
	if err == nil {
		t.Error("Selection with nonexistent option should fail validation")
	}

	// Test selection with inactive option
	model.AddOption(Option{
		ID:       "inactive_opt",
		Name:     "Inactive Option",
		GroupID:  "group1",
		IsActive: false,
	})

	invalidSelection = validSelection
	invalidSelection.OptionID = "inactive_opt"
	err = validateSelection(model, invalidSelection)
	if err == nil {
		t.Error("Selection with inactive option should fail validation")
	}
}

func TestValidateGroupSelections(t *testing.T) {
	model := createValidTestModel()

	// Add a required single-select group
	model.AddGroup(Group{
		ID:            "required_group",
		Name:          "Required Group",
		Type:          SingleSelect,
		MinSelections: 1,
		MaxSelections: 1,
		IsRequired:    true,
	})

	model.AddOption(Option{
		ID:       "req_opt1",
		Name:     "Required Option 1",
		GroupID:  "required_group",
		IsActive: true,
	})

	model.AddOption(Option{
		ID:       "req_opt2",
		Name:     "Required Option 2",
		GroupID:  "required_group",
		IsActive: true,
	})

	group, _ := model.GetGroup("required_group")

	// Test valid group selections
	validSelections := []Selection{
		{OptionID: "req_opt1", Quantity: 1},
	}

	err := validateGroupSelections(model, *group, validSelections)
	if err != nil {
		t.Errorf("Valid group selections should pass validation: %v", err)
	}

	// Test missing required selection
	invalidSelections := []Selection{}
	err = validateGroupSelections(model, *group, invalidSelections)
	if err == nil {
		t.Error("Missing required selection should fail validation")
	}

	// Test too many selections for single-select
	invalidSelections = []Selection{
		{OptionID: "req_opt1", Quantity: 1},
		{OptionID: "req_opt2", Quantity: 1},
	}

	err = validateGroupSelections(model, *group, invalidSelections)
	if err == nil {
		t.Error("Too many selections for single-select group should fail validation")
	}
}

func TestExtractOptionReferences(t *testing.T) {
	testCases := []struct {
		expression string
		expected   []string
	}{
		{"opt_option1 -> opt_option2", []string{"option1", "option2"}},
		{"opt_a || opt_b", []string{"a", "b"}},
		{"!(opt_x && opt_y)", []string{"x", "y"}},
		{"opt_test", []string{"test"}},
		{"no_options_here", []string{}},
		{"opt_same -> opt_same", []string{"same"}}, // Should deduplicate
	}

	for _, tc := range testCases {
		t.Run(tc.expression, func(t *testing.T) {
			result := extractOptionReferences(tc.expression)

			if len(result) != len(tc.expected) {
				t.Errorf("Expected %d options, got %d", len(tc.expected), len(result))
			}

			for _, expected := range tc.expected {
				found := false
				for _, actual := range result {
					if actual == expected {
						found = true
						break
					}
				}
				if !found {
					t.Errorf("Expected option '%s' not found in result: %v", expected, result)
				}
			}
		})
	}
}

func TestValidateSimplePriceExpression(t *testing.T) {
	model := createValidTestModel()

	// Test valid expressions
	validExpressions := []string{
		"opt1:10.0",
		"opt2:0.15",
		"opt1:25",
	}

	for _, expr := range validExpressions {
		err := validateSimplePriceExpression(model, expr)
		if err != nil {
			t.Errorf("Valid expression '%s' should pass validation: %v", expr, err)
		}
	}

	// Test invalid expressions
	invalidExpressions := []string{
		"invalid_format",   // No colon
		"opt1:",            // Empty value
		":10.0",            // Empty option
		"opt1:abc",         // Non-numeric value
		"nonexistent:10.0", // Invalid option
		"opt1:10.0:extra",  // Too many parts
	}

	for _, expr := range invalidExpressions {
		err := validateSimplePriceExpression(model, expr)
		if err == nil {
			t.Errorf("Invalid expression '%s' should fail validation", expr)
		}
	}
}

func TestIsValidationError(t *testing.T) {
	// Test validation errors
	validationErrors := []string{
		"validation failed: something wrong",
		"constraint violation occurred",
		"invalid option selected",
		"invalid selection made",
		"references invalid option",
		"name cannot be empty",
		"quantity must be positive",
	}

	for _, errMsg := range validationErrors {
		if !IsValidationError(fmt.Errorf("%s", errMsg)) {
			t.Errorf("Should recognize '%s' as validation error", errMsg)
		}
	}

	// Test non-validation errors
	nonValidationErrors := []string{
		"network connection failed",
		"database error",
		"unknown system error",
	}

	for _, errMsg := range nonValidationErrors {
		if IsValidationError(fmt.Errorf("%s", errMsg)) {
			t.Errorf("Should not recognize '%s' as validation error", errMsg)
		}
	}

	// Test nil error
	if IsValidationError(nil) {
		t.Error("Nil error should not be validation error")
	}
}

func TestFormatValidationError(t *testing.T) {
	testCases := []struct {
		input    string
		expected string
	}{
		{"validation failed: test", "There's an issue with: test"},
		{"constraint violation: bad selection", "Selection not allowed:: bad selection"},
		{"invalid option: opt1", "Unknown option: opt1"},
		{"name cannot be empty", "name is required"},
		{"quantity must be positive", "quantity must be greater than zero"},
		{"normal error", "normal error"},
	}

	for _, tc := range testCases {
		result := FormatValidationError(fmt.Errorf("%s", tc.input))
		if result != tc.expected {
			t.Errorf("Expected '%s', got '%s'", tc.expected, result)
		}
	}

	// Test nil error
	result := FormatValidationError(nil)
	if result != "" {
		t.Errorf("Expected empty string for nil error, got '%s'", result)
	}
}

func TestCreateValidationSummary(t *testing.T) {
	// Test empty results
	summary := CreateValidationSummary([]ValidationResult{})
	if summary != "No validation performed" {
		t.Errorf("Expected 'No validation performed', got '%s'", summary)
	}

	// Test all valid results
	validResults := []ValidationResult{
		{IsValid: true, Violations: []RuleViolation{}},
		{IsValid: true, Violations: []RuleViolation{}},
	}

	summary = CreateValidationSummary(validResults)
	if summary != "All 2 configurations are valid" {
		t.Errorf("Expected 'All 2 configurations are valid', got '%s'", summary)
	}

	// Test mixed results
	mixedResults := []ValidationResult{
		{IsValid: true, Violations: []RuleViolation{}},
		{IsValid: false, Violations: []RuleViolation{{}, {}}}, // 2 violations
		{IsValid: false, Violations: []RuleViolation{{}}},     // 1 violation
	}

	summary = CreateValidationSummary(mixedResults)
	expectedSummary := "1 valid, 2 invalid with 3 total violations"
	if summary != expectedSummary {
		t.Errorf("Expected '%s', got '%s'", expectedSummary, summary)
	}
}

func TestContains(t *testing.T) {
	slice := []string{"apple", "banana", "cherry"}

	// Test existing items
	if !contains(slice, "apple") {
		t.Error("Should find 'apple' in slice")
	}

	if !contains(slice, "banana") {
		t.Error("Should find 'banana' in slice")
	}

	// Test non-existing item
	if contains(slice, "orange") {
		t.Error("Should not find 'orange' in slice")
	}

	// Test empty slice
	emptySlice := []string{}
	if contains(emptySlice, "anything") {
		t.Error("Should not find anything in empty slice")
	}
}

// ===================================================================
// TEST HELPER FUNCTIONS
// ===================================================================

func createValidTestModel() *Model {
	model := NewModel("test-validation", "Validation Test Model")

	// Add group
	model.AddGroup(Group{
		ID:            "group1",
		Name:          "Test Group",
		Type:          SingleSelect,
		MinSelections: 0,
		MaxSelections: 1,
		IsRequired:    false,
	})

	// Add options
	model.AddOption(Option{
		ID:        "opt1",
		Name:      "Option 1",
		GroupID:   "group1",
		BasePrice: 100.0,
		IsActive:  true,
	})

	model.AddOption(Option{
		ID:        "opt2",
		Name:      "Option 2",
		GroupID:   "group1",
		BasePrice: 50.0,
		IsActive:  true,
	})

	return model
}

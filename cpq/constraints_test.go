package cpq

import (
	"fmt"
	"strings"
	"testing"
	"time"
)

func TestNewConstraintEngine(t *testing.T) {
	model := createTestModel()

	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create constraint engine: %v", err)
	}

	if engine.model != model {
		t.Error("Engine should store reference to model")
	}

	if engine.mtbdd == nil {
		t.Error("Engine should initialize MTBDD instance")
	}

	if len(engine.compiledRules) == 0 {
		t.Error("Engine should compile rules during initialization")
	}

	if len(engine.variables) == 0 {
		t.Error("Engine should declare variables during initialization")
	}
}

func TestNewConstraintEngineWithNilModel(t *testing.T) {
	_, err := NewConstraintEngine(nil)
	if err == nil {
		t.Error("Expected error when creating engine with nil model")
	}

	expectedError := "model cannot be nil"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestConstraintEngine_ValidateSelections_ValidConfiguration(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Valid selection: one option from single-select group
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
	}

	result := engine.ValidateSelections(selections)

	if !result.IsValid {
		t.Errorf("Expected valid configuration, got invalid with violations: %v", result.Violations)
	}

	if len(result.Violations) != 0 {
		t.Errorf("Expected 0 violations, got %d", len(result.Violations))
	}

	if result.ResponseTime <= 0 {
		t.Error("Response time should be positive")
	}
}

func TestConstraintEngine_ValidateSelections_SingleSelectViolation(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Invalid selection: multiple options from single-select group
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
		{OptionID: "opt2", Quantity: 1},
	}

	result := engine.ValidateSelections(selections)

	if result.IsValid {
		t.Error("Expected invalid configuration due to single-select violation")
	}

	if len(result.Violations) == 0 {
		t.Error("Expected at least one violation")
	}

	// Check violation contains group information
	found := false
	for _, violation := range result.Violations {
		if strings.Contains(violation.RuleName, "Group 1") || strings.Contains(violation.Message, "one option") {
			found = true
			break
		}
	}

	if !found {
		t.Error("Expected single-select group violation")
	}
}

func TestConstraintEngine_ValidateSelections_RequiredGroupViolation(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Invalid selection: no options selected from required group
	selections := []Selection{} // Empty selections

	result := engine.ValidateSelections(selections)

	if result.IsValid {
		t.Error("Expected invalid configuration due to required group violation")
	}

	if len(result.Violations) == 0 {
		t.Error("Expected at least one violation for required group")
	}
}

func TestConstraintEngine_ValidateSelections_CustomRuleViolation(t *testing.T) {
	model := createTestModelWithCustomRule()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Invalid selection: violates custom rule (opt1 requires opt3)
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1}, // Selected opt1 but not opt3
	}

	result := engine.ValidateSelections(selections)

	if result.IsValid {
		t.Error("Expected invalid configuration due to custom rule violation")
	}

	// Find the custom rule violation
	found := false
	for _, violation := range result.Violations {
		if violation.RuleID == "rule1" {
			found = true
			if violation.Message != "Option 1 requires Option 3" {
				t.Errorf("Expected custom message, got '%s'", violation.Message)
			}
			break
		}
	}

	if !found {
		t.Error("Expected custom rule violation with ID 'rule1'")
	}
}

func TestConstraintEngine_IsValidConfiguration(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Test valid configuration
	validSelections := []Selection{
		{OptionID: "opt1", Quantity: 1},
	}

	if !engine.IsValidConfiguration(validSelections) {
		t.Error("Expected valid configuration")
	}

	// Test invalid configuration
	invalidSelections := []Selection{
		{OptionID: "opt1", Quantity: 1},
		{OptionID: "opt2", Quantity: 1},
	}

	if engine.IsValidConfiguration(invalidSelections) {
		t.Error("Expected invalid configuration")
	}
}

func TestConstraintEngine_GetStats(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Initial stats
	stats := engine.GetStats()
	if stats.TotalEvaluations != 0 {
		t.Errorf("Expected 0 initial evaluations, got %d", stats.TotalEvaluations)
	}

	if stats.CompilationTime <= 0 {
		t.Error("Compilation time should be positive")
	}

	// Perform some validations
	selections := []Selection{{OptionID: "opt1", Quantity: 1}}
	engine.ValidateSelections(selections)
	engine.ValidateSelections(selections)

	// Check updated stats
	updatedStats := engine.GetStats()
	if updatedStats.TotalEvaluations != 2 {
		t.Errorf("Expected 2 evaluations, got %d", updatedStats.TotalEvaluations)
	}

	if updatedStats.AverageTime <= 0 {
		t.Error("Average time should be positive")
	}
}

func TestConstraintEngine_GetCompiledRuleCount(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	ruleCount := engine.GetCompiledRuleCount()
	if ruleCount <= 0 {
		t.Error("Should have compiled at least some rules")
	}

	// Should include both explicit rules and generated group constraints
	// Group 1 (single-select, required) should generate at least 2 constraints
	if ruleCount < 2 {
		t.Errorf("Expected at least 2 compiled rules, got %d", ruleCount)
	}
}

func TestConstraintEngine_GetDeclaredVariables(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	variables := engine.GetDeclaredVariables()

	if len(variables) == 0 {
		t.Error("Should have declared variables")
	}

	// Should include option variables
	expectedVars := []string{"opt_opt1", "opt_opt2"}
	for _, expected := range expectedVars {
		found := false
		for _, variable := range variables {
			if variable == expected {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("Expected variable '%s' to be declared", expected)
		}
	}

	// Variables should be sorted
	for i := 1; i < len(variables); i++ {
		if variables[i-1] > variables[i] {
			t.Error("Variables should be sorted alphabetically")
			break
		}
	}
}

func TestConstraintEngine_MultiSelectGroup(t *testing.T) {
	model := createTestModelWithMultiSelect()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Valid multi-select: select multiple options
	validSelections := []Selection{
		{OptionID: "opt3", Quantity: 1},
		{OptionID: "opt4", Quantity: 1},
	}

	result := engine.ValidateSelections(validSelections)
	if !result.IsValid {
		t.Errorf("Multi-select should allow multiple selections, violations: %v", result.Violations)
	}

	// Check that group count variable was declared
	variables := engine.GetDeclaredVariables()
	found := false
	for _, variable := range variables {
		if variable == "group_group2_count" {
			found = true
			break
		}
	}
	if !found {
		t.Error("Expected group count variable for multi-select group")
	}
}

func TestConstraintEngine_Performance(t *testing.T) {
	model := createLargeTestModel()

	start := time.Now()
	engine, err := NewConstraintEngine(model)
	compilationTime := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Test compilation time is reasonable
	if compilationTime > 200*time.Millisecond {
		t.Errorf("Compilation took too long: %v (target: <200ms)", compilationTime)
	}

	// Test validation performance
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
		{OptionID: "opt6", Quantity: 1},
	}

	start = time.Now()
	result := engine.ValidateSelections(selections)
	validationTime := time.Since(start)

	// Performance target: <200ms
	if validationTime > 200*time.Millisecond {
		t.Errorf("Validation took too long: %v (target: <200ms)", validationTime)
	}

	if result.ResponseTime > 200*time.Millisecond {
		t.Errorf("Reported response time too long: %v", result.ResponseTime)
	}
}

func TestConstraintEngine_SuggestionGeneration(t *testing.T) {
	model := createTestModel()
	engine, err := NewConstraintEngine(model)
	if err != nil {
		t.Fatalf("Failed to create engine: %v", err)
	}

	// Create violation that should generate suggestions
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
		{OptionID: "opt2", Quantity: 1}, // Violates single-select
	}

	result := engine.ValidateSelections(selections)

	if len(result.Suggestions) == 0 {
		t.Error("Expected suggestions for violations")
	}

	// Should contain relevant suggestion
	found := false
	for _, suggestion := range result.Suggestions {
		if strings.Contains(suggestion, "one option") {
			found = true
			break
		}
	}

	if !found {
		t.Errorf("Expected relevant suggestion, got: %v", result.Suggestions)
	}
}

// ===================================================================
// TEST HELPER FUNCTIONS
// ===================================================================

func createTestModel() *Model {
	model := NewModel("test-model", "Test Model")

	// Add single-select required group
	model.AddGroup(Group{
		ID:            "group1",
		Name:          "Group 1",
		Type:          SingleSelect,
		MinSelections: 1,
		MaxSelections: 1,
		IsRequired:    true,
	})

	// Add options to the group
	model.AddOption(Option{
		ID:       "opt1",
		Name:     "Option 1",
		GroupID:  "group1",
		IsActive: true,
	})

	model.AddOption(Option{
		ID:       "opt2",
		Name:     "Option 2",
		GroupID:  "group1",
		IsActive: true,
	})

	return model
}

func createTestModelWithCustomRule() *Model {
	model := createTestModel()

	// Add third option
	model.AddOption(Option{
		ID:       "opt3",
		Name:     "Option 3",
		GroupID:  "group1",
		IsActive: true,
	})

	// Add custom rule: opt1 requires opt3
	model.AddRule(Rule{
		ID:         "rule1",
		Name:       "Dependency Rule",
		Type:       RequiresRule,
		Expression: "opt_opt1 -> opt_opt3",
		Message:    "Option 1 requires Option 3",
		IsActive:   true,
		Priority:   1,
	})

	return model
}

func createTestModelWithMultiSelect() *Model {
	model := NewModel("multi-select-test", "Multi-Select Test Model")

	// Add single-select group (NOT required to avoid conflicts)
	model.AddGroup(Group{
		ID:            "group1",
		Name:          "Group 1",
		Type:          SingleSelect,
		MinSelections: 0,
		MaxSelections: 1,
		IsRequired:    false, // Changed to false
	})

	// Add options to single-select group
	model.AddOption(Option{
		ID:       "opt1",
		Name:     "Option 1",
		GroupID:  "group1",
		IsActive: true,
	})

	model.AddOption(Option{
		ID:       "opt2",
		Name:     "Option 2",
		GroupID:  "group1",
		IsActive: true,
	})

	// Add multi-select group
	model.AddGroup(Group{
		ID:            "group2",
		Name:          "Group 2",
		Type:          MultiSelect,
		MinSelections: 1,
		MaxSelections: 3,
		IsRequired:    true,
	})

	// Add options to multi-select group
	model.AddOption(Option{
		ID:       "opt3",
		Name:     "Option 3",
		GroupID:  "group2",
		IsActive: true,
	})

	model.AddOption(Option{
		ID:       "opt4",
		Name:     "Option 4",
		GroupID:  "group2",
		IsActive: true,
	})

	return model
}

func createLargeTestModel() *Model {
	model := NewModel("large-model", "Large Test Model")

	// Create multiple groups with multiple options
	for groupNum := 1; groupNum <= 5; groupNum++ {
		groupID := fmt.Sprintf("group%d", groupNum)
		groupType := SingleSelect
		if groupNum%2 == 0 {
			groupType = MultiSelect
		}

		model.AddGroup(Group{
			ID:            groupID,
			Name:          fmt.Sprintf("Group %d", groupNum),
			Type:          groupType,
			MinSelections: 1,
			MaxSelections: 1,
			IsRequired:    true,
		})

		// Add 4 options per group
		for optNum := 1; optNum <= 4; optNum++ {
			optionID := fmt.Sprintf("opt%d", (groupNum-1)*4+optNum)
			model.AddOption(Option{
				ID:       optionID,
				Name:     fmt.Sprintf("Option %s", optionID),
				GroupID:  groupID,
				IsActive: true,
			})
		}
	}

	// Add some complex rules
	model.AddRule(Rule{
		ID:         "complex_rule1",
		Name:       "Complex Rule 1",
		Type:       RequiresRule,
		Expression: "(opt_opt1 || opt_opt2) -> opt_opt5",
		Message:    "Options 1 or 2 require Option 5",
		IsActive:   true,
		Priority:   1,
	})

	model.AddRule(Rule{
		ID:         "complex_rule2",
		Name:       "Complex Rule 2",
		Type:       ExcludesRule,
		Expression: "!(opt_opt3 && opt_opt7)",
		Message:    "Option 3 excludes Option 7",
		IsActive:   true,
		Priority:   2,
	})

	return model
}

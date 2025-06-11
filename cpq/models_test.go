package cpq

import (
	"testing"
	"time"
)

func TestNewModel(t *testing.T) {
	model := NewModel("test-model", "Test Model")

	if model.ID != "test-model" {
		t.Errorf("Expected ID 'test-model', got '%s'", model.ID)
	}

	if model.Name != "Test Model" {
		t.Errorf("Expected name 'Test Model', got '%s'", model.Name)
	}

	if model.Version != "1.0.0" {
		t.Errorf("Expected version '1.0.0', got '%s'", model.Version)
	}

	if !model.IsActive {
		t.Error("Expected new model to be active")
	}

	if len(model.Groups) != 0 {
		t.Errorf("Expected empty groups, got %d", len(model.Groups))
	}

	if len(model.Options) != 0 {
		t.Errorf("Expected empty options, got %d", len(model.Options))
	}
}

func TestModel_AddGroup(t *testing.T) {
	model := NewModel("test", "Test")

	group := Group{
		ID:            "group1",
		Name:          "Test Group",
		Type:          SingleSelect,
		MinSelections: 1,
		MaxSelections: 1,
		IsRequired:    true,
	}

	oldTime := model.UpdatedAt
	time.Sleep(1 * time.Millisecond) // Ensure time difference

	result := model.AddGroup(group)

	// Should return the same model for chaining
	if result != model {
		t.Error("AddGroup should return the same model for chaining")
	}

	if len(model.Groups) != 1 {
		t.Errorf("Expected 1 group, got %d", len(model.Groups))
	}

	if model.Groups[0].ID != "group1" {
		t.Errorf("Expected group ID 'group1', got '%s'", model.Groups[0].ID)
	}

	if !model.UpdatedAt.After(oldTime) {
		t.Error("UpdatedAt should be updated when adding group")
	}
}

func TestModel_AddOption(t *testing.T) {
	model := NewModel("test", "Test")

	option := Option{
		ID:        "opt1",
		Name:      "Option 1",
		GroupID:   "group1",
		BasePrice: 100.0,
		IsActive:  true,
		IsDefault: false,
	}

	result := model.AddOption(option)

	// Should return the same model for chaining
	if result != model {
		t.Error("AddOption should return the same model for chaining")
	}

	if len(model.Options) != 1 {
		t.Errorf("Expected 1 option, got %d", len(model.Options))
	}

	if model.Options[0].BasePrice != 100.0 {
		t.Errorf("Expected base price 100.0, got %f", model.Options[0].BasePrice)
	}
}

func TestModel_AddRule(t *testing.T) {
	model := NewModel("test", "Test")

	rule := Rule{
		ID:         "rule1",
		Name:       "Test Rule",
		Type:       RequiresRule,
		Expression: "opt1 -> opt2",
		Message:    "Option 1 requires Option 2",
		IsActive:   true,
		Priority:   1,
	}

	result := model.AddRule(rule)

	if result != model {
		t.Error("AddRule should return the same model for chaining")
	}

	if len(model.Rules) != 1 {
		t.Errorf("Expected 1 rule, got %d", len(model.Rules))
	}

	if model.Rules[0].Expression != "opt1 -> opt2" {
		t.Errorf("Expected expression 'opt1 -> opt2', got '%s'", model.Rules[0].Expression)
	}
}

func TestModel_AddPriceRule(t *testing.T) {
	model := NewModel("test", "Test")

	priceRule := PriceRule{
		ID:         "price1",
		Name:       "Volume Discount",
		Type:       VolumeTierRule,
		Expression: "quantity >= 10 ? 0.9 : 1.0",
		IsActive:   true,
		Priority:   1,
	}

	result := model.AddPriceRule(priceRule)

	if result != model {
		t.Error("AddPriceRule should return the same model for chaining")
	}

	if len(model.PriceRules) != 1 {
		t.Errorf("Expected 1 price rule, got %d", len(model.PriceRules))
	}

	if model.PriceRules[0].Type != VolumeTierRule {
		t.Errorf("Expected type VolumeTierRule, got %s", model.PriceRules[0].Type)
	}
}

func TestModel_GetOption(t *testing.T) {
	model := NewModel("test", "Test")

	option := Option{
		ID:      "opt1",
		Name:    "Option 1",
		GroupID: "group1",
	}

	model.AddOption(option)

	// Test successful retrieval
	found, err := model.GetOption("opt1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if found.ID != "opt1" {
		t.Errorf("Expected option ID 'opt1', got '%s'", found.ID)
	}

	// Test not found
	_, err = model.GetOption("nonexistent")
	if err == nil {
		t.Error("Expected error for nonexistent option")
	}

	expectedError := "option nonexistent not found"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestModel_GetGroup(t *testing.T) {
	model := NewModel("test", "Test")

	group := Group{
		ID:   "group1",
		Name: "Test Group",
		Type: SingleSelect,
	}

	model.AddGroup(group)

	// Test successful retrieval
	found, err := model.GetGroup("group1")
	if err != nil {
		t.Errorf("Unexpected error: %v", err)
	}

	if found.Type != SingleSelect {
		t.Errorf("Expected type SingleSelect, got %s", found.Type)
	}

	// Test not found
	_, err = model.GetGroup("nonexistent")
	if err == nil {
		t.Error("Expected error for nonexistent group")
	}
}

func TestModel_GetOptionsInGroup(t *testing.T) {
	model := NewModel("test", "Test")

	// Add options to different groups
	model.AddOption(Option{ID: "opt1", GroupID: "group1", IsActive: true})
	model.AddOption(Option{ID: "opt2", GroupID: "group1", IsActive: true})
	model.AddOption(Option{ID: "opt3", GroupID: "group2", IsActive: true})
	model.AddOption(Option{ID: "opt4", GroupID: "group1", IsActive: false}) // Inactive

	options := model.GetOptionsInGroup("group1")

	// Should return 2 active options from group1
	if len(options) != 2 {
		t.Errorf("Expected 2 options in group1, got %d", len(options))
	}

	// Verify options are correct
	optionIDs := make(map[string]bool)
	for _, opt := range options {
		optionIDs[opt.ID] = true
	}

	if !optionIDs["opt1"] || !optionIDs["opt2"] {
		t.Error("Expected options opt1 and opt2 in group1")
	}

	if optionIDs["opt3"] || optionIDs["opt4"] {
		t.Error("Should not include options from other groups or inactive options")
	}

	// Test empty group
	emptyOptions := model.GetOptionsInGroup("nonexistent")
	if len(emptyOptions) != 0 {
		t.Errorf("Expected 0 options for nonexistent group, got %d", len(emptyOptions))
	}
}

func TestModel_Validate(t *testing.T) {
	// Test valid model
	model := NewModel("test", "Test Model")
	model.AddGroup(Group{ID: "group1", Name: "Group 1", Type: SingleSelect})
	model.AddOption(Option{ID: "opt1", GroupID: "group1", Name: "Option 1"})

	err := model.Validate()
	if err != nil {
		t.Errorf("Valid model should not have validation error: %v", err)
	}

	// Test empty ID
	invalidModel := NewModel("", "Test")
	err = invalidModel.Validate()
	if err == nil {
		t.Error("Expected validation error for empty ID")
	}

	// Test empty name
	invalidModel = NewModel("test", "")
	err = invalidModel.Validate()
	if err == nil {
		t.Error("Expected validation error for empty name")
	}

	// Test invalid group reference
	invalidModel = NewModel("test", "Test")
	invalidModel.AddOption(Option{ID: "opt1", GroupID: "nonexistent", Name: "Option 1"})

	err = invalidModel.Validate()
	if err == nil {
		t.Error("Expected validation error for invalid group reference")
	}

	expectedError := "option opt1 references invalid group nonexistent"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestModelChaining(t *testing.T) {
	// Test method chaining
	model := NewModel("test", "Test").
		AddGroup(Group{ID: "group1", Name: "Group 1", Type: SingleSelect}).
		AddOption(Option{ID: "opt1", GroupID: "group1", Name: "Option 1"}).
		AddRule(Rule{ID: "rule1", Name: "Rule 1", Type: RequiresRule, Expression: "test"}).
		AddPriceRule(PriceRule{ID: "price1", Name: "Price 1", Type: VolumeTierRule, Expression: "1.0"})

	if len(model.Groups) != 1 {
		t.Errorf("Expected 1 group after chaining, got %d", len(model.Groups))
	}

	if len(model.Options) != 1 {
		t.Errorf("Expected 1 option after chaining, got %d", len(model.Options))
	}

	if len(model.Rules) != 1 {
		t.Errorf("Expected 1 rule after chaining, got %d", len(model.Rules))
	}

	if len(model.PriceRules) != 1 {
		t.Errorf("Expected 1 price rule after chaining, got %d", len(model.PriceRules))
	}
}

func TestEnumValues(t *testing.T) {
	// Test GroupType values
	if SingleSelect != "single_select" {
		t.Errorf("Expected SingleSelect to be 'single_select', got '%s'", SingleSelect)
	}

	// Test RuleType values
	if RequiresRule != "requires" {
		t.Errorf("Expected RequiresRule to be 'requires', got '%s'", RequiresRule)
	}

	// Test PriceRuleType values
	if VolumeTierRule != "volume_tier" {
		t.Errorf("Expected VolumeTierRule to be 'volume_tier', got '%s'", VolumeTierRule)
	}
}

func TestConfigurationStructure(t *testing.T) {
	// Test Configuration creation
	config := Configuration{
		ID:      "config1",
		ModelID: "model1",
		Selections: []Selection{
			{OptionID: "opt1", Quantity: 1},
			{OptionID: "opt2", Quantity: 2},
		},
		IsValid:    true,
		TotalPrice: 150.0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if config.ID != "config1" {
		t.Errorf("Expected config ID 'config1', got '%s'", config.ID)
	}

	if len(config.Selections) != 2 {
		t.Errorf("Expected 2 selections, got %d", len(config.Selections))
	}

	if config.Selections[1].Quantity != 2 {
		t.Errorf("Expected quantity 2 for second selection, got %d", config.Selections[1].Quantity)
	}
}

func TestValidationResult(t *testing.T) {
	// Test ValidationResult structure
	result := ValidationResult{
		IsValid: false,
		Violations: []RuleViolation{
			{
				RuleID:          "rule1",
				RuleName:        "Test Rule",
				Message:         "Violation occurred",
				AffectedOptions: []string{"opt1", "opt2"},
			},
		},
		Suggestions:  []string{"Try selecting option X instead"},
		ResponseTime: 50 * time.Millisecond,
	}

	if result.IsValid {
		t.Error("Expected validation result to be invalid")
	}

	if len(result.Violations) != 1 {
		t.Errorf("Expected 1 violation, got %d", len(result.Violations))
	}

	if len(result.Violations[0].AffectedOptions) != 2 {
		t.Errorf("Expected 2 affected options, got %d", len(result.Violations[0].AffectedOptions))
	}
}

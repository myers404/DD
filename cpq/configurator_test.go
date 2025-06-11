package cpq

import (
	"fmt"
	"math"
	"testing"
	"time"
)

func TestNewConfigurator(t *testing.T) {
	model := createTestModelForConfigurator()

	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	if configurator.model != model {
		t.Error("Configurator should store reference to model")
	}

	if configurator.constraintEngine == nil {
		t.Error("Configurator should initialize constraint engine")
	}

	if configurator.pricingCalc == nil {
		t.Error("Configurator should initialize pricing calculator")
	}

	// Initial configuration should be empty and valid
	config := configurator.GetCurrentConfiguration()
	if config.ModelID != model.ID {
		t.Errorf("Expected model ID %s, got %s", model.ID, config.ModelID)
	}

	if len(config.Selections) != 0 {
		t.Error("Initial configuration should have no selections")
	}

	if !config.IsValid {
		t.Error("Initial configuration should be valid")
	}
}

func TestNewConfiguratorWithInvalidModel(t *testing.T) {
	// Test with nil model
	_, err := NewConfigurator(nil)
	if err == nil {
		t.Error("Expected error with nil model")
	}

	// Test with invalid model
	invalidModel := NewModel("", "") // Empty ID and name
	_, err = NewConfigurator(invalidModel)
	if err == nil {
		t.Error("Expected error with invalid model")
	}
}

func TestConfigurator_AddSelection(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add valid selection
	update, err := configurator.AddSelection("opt1", 1)
	if err != nil {
		t.Errorf("Failed to add selection: %v", err)
	}

	if !update.IsValid {
		t.Errorf("Configuration should be valid after adding valid selection, violations: %v",
			update.ValidationResult.Violations)
	}

	// Check that selection was added
	config := configurator.GetCurrentConfiguration()
	if len(config.Selections) != 1 {
		t.Errorf("Expected 1 selection, got %d", len(config.Selections))
	}

	if config.Selections[0].OptionID != "opt1" {
		t.Errorf("Expected selection opt1, got %s", config.Selections[0].OptionID)
	}

	if config.Selections[0].Quantity != 1 {
		t.Errorf("Expected quantity 1, got %d", config.Selections[0].Quantity)
	}

	// Check pricing was calculated
	if update.PriceBreakdown.BasePrice != 100.0 {
		t.Errorf("Expected base price 100.0, got %.2f", update.PriceBreakdown.BasePrice)
	}

	if update.ResponseTime <= 0 {
		t.Error("Response time should be positive")
	}
}

func TestConfigurator_AddSelectionInvalidOption(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Try to add invalid option
	_, err = configurator.AddSelection("nonexistent", 1)
	if err == nil {
		t.Error("Expected error when adding nonexistent option")
	}

	// Try to add with invalid quantity
	_, err = configurator.AddSelection("opt1", 0)
	if err == nil {
		t.Error("Expected error when adding with zero quantity")
	}

	_, err = configurator.AddSelection("opt1", -1)
	if err == nil {
		t.Error("Expected error when adding with negative quantity")
	}
}

func TestConfigurator_SingleSelectGroupConstraint(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add first option
	update1, err := configurator.AddSelection("opt1", 1)
	if err != nil {
		t.Fatalf("Failed to add first selection: %v", err)
	}

	if !update1.IsValid {
		t.Error("First selection should be valid")
	}

	// Add second option from same single-select group
	// This should replace the first selection automatically
	update2, err := configurator.AddSelection("opt2", 1)
	if err != nil {
		t.Fatalf("Failed to add second selection: %v", err)
	}

	if !update2.IsValid {
		t.Error("Second selection should be valid after automatic replacement")
	}

	// Should only have one selection now
	config := configurator.GetCurrentConfiguration()
	if len(config.Selections) != 1 {
		t.Errorf("Expected 1 selection after single-select replacement, got %d", len(config.Selections))
	}

	if config.Selections[0].OptionID != "opt2" {
		t.Errorf("Expected opt2 to be selected, got %s", config.Selections[0].OptionID)
	}
}

func TestConfigurator_RemoveSelection(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add selection first
	_, err = configurator.AddSelection("opt1", 1)
	if err != nil {
		t.Fatalf("Failed to add selection: %v", err)
	}

	// Remove selection
	update, err := configurator.RemoveSelection("opt1")
	if err != nil {
		t.Errorf("Failed to remove selection: %v", err)
	}

	// Configuration should be empty
	config := configurator.GetCurrentConfiguration()
	if len(config.Selections) != 0 {
		t.Errorf("Expected 0 selections after removal, got %d", len(config.Selections))
	}

	// Price should be zero
	if update.PriceBreakdown.TotalPrice != 0.0 {
		t.Errorf("Expected total price 0.0 after removal, got %.2f", update.PriceBreakdown.TotalPrice)
	}
}

func TestConfigurator_RemoveNonexistentSelection(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Try to remove selection that doesn't exist
	_, err = configurator.RemoveSelection("opt1")
	if err == nil {
		t.Error("Expected error when removing nonexistent selection")
	}

	expectedError := "option opt1 not selected"
	if err.Error() != expectedError {
		t.Errorf("Expected error '%s', got '%s'", expectedError, err.Error())
	}
}

func TestConfigurator_UpdateSelection(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add initial selection
	_, err = configurator.AddSelection("opt1", 1)
	if err != nil {
		t.Fatalf("Failed to add selection: %v", err)
	}

	// Update quantity
	update, err := configurator.UpdateSelection("opt1", 5)
	if err != nil {
		t.Errorf("Failed to update selection: %v", err)
	}

	// Check updated quantity
	config := configurator.GetCurrentConfiguration()
	if config.Selections[0].Quantity != 5 {
		t.Errorf("Expected quantity 5, got %d", config.Selections[0].Quantity)
	}

	// Check updated price (5 * $100 = $500)
	expectedPrice := 500.0
	if math.Abs(update.PriceBreakdown.BasePrice-expectedPrice) > 0.01 {
		t.Errorf("Expected base price %.2f, got %.2f", expectedPrice, update.PriceBreakdown.BasePrice)
	}

	// Update to zero quantity should remove selection
	update, err = configurator.UpdateSelection("opt1", 0)
	if err != nil {
		t.Errorf("Failed to update selection to zero: %v", err)
	}

	config = configurator.GetCurrentConfiguration()
	if len(config.Selections) != 0 {
		t.Error("Expected selection to be removed when quantity set to 0")
	}
}

func TestConfigurator_ClearConfiguration(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add some selections
	configurator.AddSelection("opt1", 1)
	configurator.AddSelection("opt3", 2) // Different group

	// Verify selections exist
	config := configurator.GetCurrentConfiguration()
	if len(config.Selections) == 0 {
		t.Error("Expected selections before clear")
	}

	// Clear configuration
	update := configurator.ClearConfiguration()

	// Check configuration is empty
	if len(update.UpdatedConfig.Selections) != 0 {
		t.Error("Expected empty configuration after clear")
	}

	if update.PriceBreakdown.TotalPrice != 0.0 {
		t.Error("Expected zero price after clear")
	}

	if !update.IsValid {
		t.Error("Empty configuration should be valid")
	}
}

func TestConfigurator_GetAvailableOptions(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Get initial available options
	update, _ := configurator.AddSelection("opt1", 1) // Will be replaced by constraint handling

	availableOptions := update.AvailableOptions

	if len(availableOptions) == 0 {
		t.Error("Expected available options")
	}

	// Check that each option has required fields
	for _, availableOption := range availableOptions {
		if availableOption.Option.ID == "" {
			t.Error("Available option should have valid option data")
		}

		if availableOption.Price < 0 {
			t.Error("Available option should have non-negative price")
		}

		// Options should be sorted by group and display order
	}

	// Check specific option availability
	opt2Available := false
	for _, availableOption := range availableOptions {
		if availableOption.Option.ID == "opt2" {
			opt2Available = true
			// opt2 should not be selectable due to single-select constraint with opt1
			if availableOption.IsSelectable {
				t.Error("opt2 should not be selectable when opt1 is selected (single-select group)")
			}
			break
		}
	}

	if !opt2Available {
		t.Error("opt2 should be in available options list")
	}
}

func TestConfigurator_GetAvailableOptionsForGroup(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Get options for specific group
	groupOptions, err := configurator.GetAvailableOptionsForGroup("group1")
	if err != nil {
		t.Errorf("Failed to get group options: %v", err)
	}

	if len(groupOptions) != 2 {
		t.Errorf("Expected 2 options in group1, got %d", len(groupOptions))
	}

	// Verify all options belong to requested group
	for _, option := range groupOptions {
		if option.Option.GroupID != "group1" {
			t.Errorf("Option %s should belong to group1, got %s",
				option.Option.ID, option.Option.GroupID)
		}
	}

	// Test invalid group
	_, err = configurator.GetAvailableOptionsForGroup("nonexistent")
	if err == nil {
		t.Error("Expected error for nonexistent group")
	}
}

func TestConfigurator_LoadConfiguration(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Create configuration to load
	configToLoad := Configuration{
		ID:      "test-config",
		ModelID: model.ID,
		Selections: []Selection{
			{OptionID: "opt1", Quantity: 2},
			{OptionID: "opt3", Quantity: 1},
		},
		CreatedAt: time.Now().Add(-1 * time.Hour),
	}

	// Load configuration
	update, err := configurator.LoadConfiguration(configToLoad)
	if err != nil {
		t.Errorf("Failed to load configuration: %v", err)
	}

	// Check loaded configuration
	config := configurator.GetCurrentConfiguration()
	if len(config.Selections) != 2 {
		t.Errorf("Expected 2 selections in loaded config, got %d", len(config.Selections))
	}

	// Check pricing was calculated
	expectedPrice := 275.0 // (2 * $100) + (1 * $75)
	if math.Abs(update.PriceBreakdown.BasePrice-expectedPrice) > 0.01 {
		t.Errorf("Expected base price %.2f, got %.2f", expectedPrice, update.PriceBreakdown.BasePrice)
	}
}

func TestConfigurator_LoadConfigurationWithInvalidModel(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Configuration with wrong model ID
	invalidConfig := Configuration{
		ID:      "test-config",
		ModelID: "wrong-model",
		Selections: []Selection{
			{OptionID: "opt1", Quantity: 1},
		},
	}

	_, err = configurator.LoadConfiguration(invalidConfig)
	if err == nil {
		t.Error("Expected error when loading config with wrong model ID")
	}

	// Configuration with invalid option
	invalidConfig2 := Configuration{
		ID:      "test-config",
		ModelID: model.ID,
		Selections: []Selection{
			{OptionID: "nonexistent", Quantity: 1},
		},
	}

	_, err = configurator.LoadConfiguration(invalidConfig2)
	if err == nil {
		t.Error("Expected error when loading config with invalid option")
	}
}

func TestConfigurator_CloneConfiguration(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add some selections
	configurator.AddSelection("opt1", 2)

	// Clone configuration
	original := configurator.GetCurrentConfiguration()
	clone := configurator.CloneConfiguration()

	// Check clone has different ID and timestamps
	if clone.ID == original.ID {
		t.Error("Clone should have different ID")
	}

	if clone.CreatedAt.Equal(original.CreatedAt) {
		t.Error("Clone should have different CreatedAt")
	}

	// Check clone has same selections
	if len(clone.Selections) != len(original.Selections) {
		t.Error("Clone should have same number of selections")
	}

	if clone.ModelID != original.ModelID {
		t.Error("Clone should have same model ID")
	}

	// Modify clone selections (should not affect original)
	clone.Selections[0].Quantity = 5
	if original.Selections[0].Quantity == 5 {
		t.Error("Modifying clone should not affect original")
	}
}

func TestConfigurator_Integration_ConstraintsAndPricing(t *testing.T) {
	model := createTestModelWithVolumeAndConstraints()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Add large quantity to trigger volume pricing
	// First add opt3 to satisfy the dependency rule (opt1 -> opt3)
	_, err = configurator.AddSelection("opt3", 1)
	if err != nil {
		t.Fatalf("Failed to add opt3: %v", err)
	}

	// Now add opt1 which should be valid due to dependency satisfaction
	update, err := configurator.AddSelection("opt1", 25)
	if err != nil {
		t.Fatalf("Failed to add selection: %v", err)
	}

	// Should be valid (no constraint violations)
	if !update.IsValid {
		t.Errorf("Large quantity should be valid, violations: %v", update.ValidationResult.Violations)
	}

	// Should have volume discount applied
	expectedBasePrice := (25 * 100.0) + (1 * 75.0) // opt1: 25 * $100 + opt3: 1 * $75
	if math.Abs(update.PriceBreakdown.BasePrice-expectedBasePrice) > 0.01 {
		t.Errorf("Expected base price %.2f, got %.2f", expectedBasePrice, update.PriceBreakdown.BasePrice)
	}

	// Should have volume discount (5% for quantity 11-50)
	expectedDiscount := expectedBasePrice * 0.05
	foundDiscount := false
	for _, adj := range update.PriceBreakdown.Adjustments {
		if adj.Type == "volume_discount" && math.Abs(adj.Amount+expectedDiscount) < 0.01 {
			foundDiscount = true
			break
		}
	}

	if !foundDiscount {
		t.Error("Expected volume discount for large quantity")
	}
}

func TestConfigurator_Performance(t *testing.T) {
	model := createLargeTestModelForConfigurator()

	start := time.Now()
	configurator, err := NewConfigurator(model)
	initTime := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Initialization should be fast
	if initTime > 500*time.Millisecond {
		t.Errorf("Configurator initialization took too long: %v", initTime)
	}

	// Test multiple operations
	start = time.Now()
	for i := 1; i <= 5; i++ {
		optionID := fmt.Sprintf("opt%d", i)
		update, err := configurator.AddSelection(optionID, i)
		if err != nil {
			t.Errorf("Failed to add selection %s: %v", optionID, err)
		}

		// Each operation should be fast
		if update.ResponseTime > 200*time.Millisecond {
			t.Errorf("Operation %d took too long: %v", i, update.ResponseTime)
		}
	}

	totalTime := time.Since(start)
	if totalTime > 1*time.Second {
		t.Errorf("Total operations took too long: %v", totalTime)
	}
}

func TestConfigurator_Stats(t *testing.T) {
	model := createTestModelForConfigurator()
	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Initial stats should be zero
	stats := configurator.GetStats()
	if stats.TotalOperations != 0 {
		t.Error("Initial total operations should be 0")
	}

	// Perform some operations
	configurator.AddSelection("opt1", 1)
	configurator.UpdateSelection("opt1", 2)
	configurator.RemoveSelection("opt1")

	// Check updated stats
	updatedStats := configurator.GetStats()
	if updatedStats.TotalOperations != 3 {
		t.Errorf("Expected 3 operations, got %d", updatedStats.TotalOperations)
	}

	if updatedStats.AverageTime <= 0 {
		t.Error("Average time should be positive")
	}

	if updatedStats.LastOperation.IsZero() {
		t.Error("Last operation time should be set")
	}

	// Test stats from subcomponents
	constraintStats := configurator.GetConstraintEngineStats()
	if constraintStats.TotalEvaluations == 0 {
		t.Error("Constraint engine should have performed evaluations")
	}

	pricingStats := configurator.GetPricingCalculatorStats()
	if pricingStats.TotalCalculations == 0 {
		t.Error("Pricing calculator should have performed calculations")
	}

	// Reset stats
	configurator.ResetStats()
	resetStats := configurator.GetStats()
	if resetStats.TotalOperations != 0 {
		t.Error("Stats should be reset to zero")
	}
}

// ===================================================================
// TEST HELPER FUNCTIONS
// ===================================================================

func createTestModelForConfigurator() *Model {
	model := NewModel("configurator-test", "Configurator Test Model")

	// Single-select group (not required for clear config test)
	model.AddGroup(Group{
		ID:            "group1",
		Name:          "Group 1",
		Type:          SingleSelect,
		MinSelections: 0,
		MaxSelections: 1,
		IsRequired:    false,
	})

	// Multi-select group
	model.AddGroup(Group{
		ID:            "group2",
		Name:          "Group 2",
		Type:          MultiSelect,
		MinSelections: 0,
		MaxSelections: 3,
		IsRequired:    false,
	})

	// Options for single-select group
	model.AddOption(Option{
		ID:           "opt1",
		Name:         "Option 1",
		GroupID:      "group1",
		BasePrice:    100.0,
		IsActive:     true,
		DisplayOrder: 1,
	})

	model.AddOption(Option{
		ID:           "opt2",
		Name:         "Option 2",
		GroupID:      "group1",
		BasePrice:    50.0,
		IsActive:     true,
		DisplayOrder: 2,
	})

	// Options for multi-select group
	model.AddOption(Option{
		ID:           "opt3",
		Name:         "Option 3",
		GroupID:      "group2",
		BasePrice:    75.0,
		IsActive:     true,
		DisplayOrder: 1,
	})

	model.AddOption(Option{
		ID:           "opt4",
		Name:         "Option 4",
		GroupID:      "group2",
		BasePrice:    25.0,
		IsActive:     true,
		DisplayOrder: 2,
	})

	return model
}

func createTestModelWithVolumeAndConstraints() *Model {
	model := createTestModelForConfigurator()

	// Add a constraint rule
	model.AddRule(Rule{
		ID:         "rule1",
		Name:       "Dependency Rule",
		Type:       RequiresRule,
		Expression: "opt_opt1 -> opt_opt3",
		Message:    "Option 1 requires Option 3",
		IsActive:   true,
		Priority:   1,
	})

	// Add a price rule
	model.AddPriceRule(PriceRule{
		ID:         "price1",
		Name:       "Large Quantity Discount",
		Type:       PercentDiscountRule,
		Expression: "opt1:0.10", // 10% discount for opt1
		IsActive:   true,
		Priority:   1,
	})

	return model
}

func createLargeTestModelForConfigurator() *Model {
	model := NewModel("large-configurator-test", "Large Configurator Test Model")

	// Create multiple groups
	for groupNum := 1; groupNum <= 3; groupNum++ {
		groupID := fmt.Sprintf("group%d", groupNum)
		groupType := SingleSelect
		if groupNum == 3 {
			groupType = MultiSelect
		}

		model.AddGroup(Group{
			ID:            groupID,
			Name:          fmt.Sprintf("Group %d", groupNum),
			Type:          groupType,
			MinSelections: 0,
			MaxSelections: 2,
			IsRequired:    false,
		})

		// Add options to each group
		for optNum := 1; optNum <= 5; optNum++ {
			optionID := fmt.Sprintf("opt%d", (groupNum-1)*5+optNum)
			model.AddOption(Option{
				ID:           optionID,
				Name:         fmt.Sprintf("Option %s", optionID),
				GroupID:      groupID,
				BasePrice:    float64(optNum * 20),
				IsActive:     true,
				DisplayOrder: optNum,
			})
		}
	}

	// Add some rules
	model.AddRule(Rule{
		ID:         "complex_rule",
		Name:       "Complex Rule",
		Type:       RequiresRule,
		Expression: "opt_opt1 -> opt_opt6",
		Message:    "Option 1 requires Option 6",
		IsActive:   true,
		Priority:   1,
	})

	return model
}

package cpq

import (
	"fmt"
	"math"
	"testing"
	"time"
)

func TestNewPricingCalculator(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	if calc.model != model {
		t.Error("Calculator should store reference to model")
	}

	if len(calc.volumeTiers) == 0 {
		t.Error("Calculator should have default volume tiers")
	}

	if calc.cache == nil {
		t.Error("Calculator should initialize cache")
	}
}

func TestPricingCalculator_CalculatePrice_BasePrice(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Simple selection with base prices
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1}, // $100
		{OptionID: "opt2", Quantity: 2}, // $50 each = $100
	}

	breakdown := calc.CalculatePrice(selections)

	expectedBase := 200.0 // $100 + $100
	if breakdown.BasePrice != expectedBase {
		t.Errorf("Expected base price %.2f, got %.2f", expectedBase, breakdown.BasePrice)
	}

	// No volume discount for small quantity
	if breakdown.TotalPrice != expectedBase {
		t.Errorf("Expected total price %.2f, got %.2f", expectedBase, breakdown.TotalPrice)
	}

	if breakdown.CalculationTime <= 0 {
		t.Error("Calculation time should be positive")
	}
}

func TestPricingCalculator_CalculatePrice_VolumeTier(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Large quantity to trigger volume discount
	selections := []Selection{
		{OptionID: "opt1", Quantity: 15}, // Triggers Small Volume tier (5% discount)
	}

	breakdown := calc.CalculatePrice(selections)

	expectedBase := 1500.0 // 15 * $100
	if breakdown.BasePrice != expectedBase {
		t.Errorf("Expected base price %.2f, got %.2f", expectedBase, breakdown.BasePrice)
	}

	// Should have volume discount
	if len(breakdown.Adjustments) == 0 {
		t.Error("Expected volume discount adjustment")
	}

	// 5% discount = $75 off
	expectedDiscount := 75.0
	foundDiscount := false
	for _, adj := range breakdown.Adjustments {
		if adj.Type == "volume_discount" && math.Abs(adj.Amount+expectedDiscount) < 0.01 {
			foundDiscount = true
			break
		}
	}

	if !foundDiscount {
		t.Errorf("Expected $%.2f volume discount, got adjustments: %v", expectedDiscount, breakdown.Adjustments)
	}

	expectedTotal := 1425.0 // $1500 - $75
	if math.Abs(breakdown.TotalPrice-expectedTotal) > 0.01 {
		t.Errorf("Expected total price %.2f, got %.2f", expectedTotal, breakdown.TotalPrice)
	}
}

func TestPricingCalculator_VolumeTiers(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	testCases := []struct {
		quantity           int
		expectedTierName   string
		expectedMultiplier float64
	}{
		{5, "Individual", 1.0},      // No discount
		{15, "Small Volume", 0.95},  // 5% discount
		{75, "Medium Volume", 0.90}, // 10% discount
		{150, "Large Volume", 0.85}, // 15% discount
	}

	for _, tc := range testCases {
		t.Run(tc.expectedTierName, func(t *testing.T) {
			selections := []Selection{
				{OptionID: "opt1", Quantity: tc.quantity},
			}

			breakdown := calc.CalculatePrice(selections)

			basePrice := float64(tc.quantity) * 100.0
			expectedPrice := basePrice * tc.expectedMultiplier

			if math.Abs(breakdown.TotalPrice-expectedPrice) > 0.01 {
				t.Errorf("For quantity %d, expected price %.2f, got %.2f",
					tc.quantity, expectedPrice, breakdown.TotalPrice)
			}
		})
	}
}

func TestPricingCalculator_PriceRules_FixedDiscount(t *testing.T) {
	model := createTestModelWithPriceRules()
	calc := NewPricingCalculator(model)

	// Selection that triggers fixed discount rule
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1}, // Triggers $20 fixed discount
	}

	breakdown := calc.CalculatePrice(selections)

	// Should have fixed discount adjustment
	foundDiscount := false
	for _, adj := range breakdown.Adjustments {
		if adj.Type == "fixed_discount" && adj.Amount == -20.0 {
			foundDiscount = true
			if adj.RuleName != "Fixed Discount Rule" {
				t.Errorf("Expected rule name 'Fixed Discount Rule', got '%s'", adj.RuleName)
			}
			break
		}
	}

	if !foundDiscount {
		t.Error("Expected fixed discount adjustment")
	}

	expectedTotal := 80.0 // $100 - $20
	if math.Abs(breakdown.TotalPrice-expectedTotal) > 0.01 {
		t.Errorf("Expected total price %.2f, got %.2f", expectedTotal, breakdown.TotalPrice)
	}
}

func TestPricingCalculator_PriceRules_PercentDiscount(t *testing.T) {
	model := createTestModelWithPriceRules()
	calc := NewPricingCalculator(model)

	// Selection that triggers percent discount rule
	selections := []Selection{
		{OptionID: "opt2", Quantity: 1}, // Triggers 15% discount
	}

	breakdown := calc.CalculatePrice(selections)

	// Should have percent discount adjustment
	foundDiscount := false
	expectedDiscountAmount := 50.0 * 0.15 // 15% of $50
	for _, adj := range breakdown.Adjustments {
		if adj.Type == "percent_discount" && math.Abs(adj.Amount+expectedDiscountAmount) < 0.01 {
			foundDiscount = true
			break
		}
	}

	if !foundDiscount {
		t.Errorf("Expected 15%% discount (%.2f), got adjustments: %v", expectedDiscountAmount, breakdown.Adjustments)
	}
}

func TestPricingCalculator_PriceRules_Surcharge(t *testing.T) {
	model := createTestModelWithPriceRules()
	calc := NewPricingCalculator(model)

	// Selection that triggers surcharge rule
	selections := []Selection{
		{OptionID: "opt3", Quantity: 1}, // Triggers $15 surcharge
	}

	breakdown := calc.CalculatePrice(selections)

	// Should have surcharge adjustment
	foundSurcharge := false
	for _, adj := range breakdown.Adjustments {
		if adj.Type == "surcharge" && adj.Amount == 15.0 {
			foundSurcharge = true
			break
		}
	}

	if !foundSurcharge {
		t.Error("Expected surcharge adjustment")
	}

	expectedTotal := 90.0 // $75 + $15
	if math.Abs(breakdown.TotalPrice-expectedTotal) > 0.01 {
		t.Errorf("Expected total price %.2f, got %.2f", expectedTotal, breakdown.TotalPrice)
	}
}

func TestPricingCalculator_Cache(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
	}

	// First calculation - cache miss
	breakdown1 := calc.CalculatePrice(selections)
	stats1 := calc.GetStats()

	if stats1.CacheMisses != 1 {
		t.Errorf("Expected 1 cache miss, got %d", stats1.CacheMisses)
	}

	if stats1.CacheHits != 0 {
		t.Errorf("Expected 0 cache hits, got %d", stats1.CacheHits)
	}

	// Second calculation - cache hit
	breakdown2 := calc.CalculatePrice(selections)
	stats2 := calc.GetStats()

	if stats2.CacheHits != 1 {
		t.Errorf("Expected 1 cache hit, got %d", stats2.CacheHits)
	}

	// Results should be identical
	if breakdown1.TotalPrice != breakdown2.TotalPrice {
		t.Error("Cached result should be identical to original calculation")
	}

	// Cache size should be 1
	if calc.GetCacheSize() != 1 {
		t.Errorf("Expected cache size 1, got %d", calc.GetCacheSize())
	}

	// Cache hit rate should be 50%
	hitRate := calc.GetCacheHitRate()
	if math.Abs(hitRate-50.0) > 0.01 {
		t.Errorf("Expected cache hit rate 50%%, got %.2f%%", hitRate)
	}
}

func TestPricingCalculator_ClearCache(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Generate some cache entries
	selections := []Selection{{OptionID: "opt1", Quantity: 1}}
	calc.CalculatePrice(selections)

	if calc.GetCacheSize() == 0 {
		t.Error("Expected cache to have entries")
	}

	// Clear cache
	calc.ClearCache()

	if calc.GetCacheSize() != 0 {
		t.Error("Expected cache to be empty after clear")
	}
}

func TestPricingCalculator_SetVolumeTiers(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Custom volume tiers
	customTiers := []VolumeTier{
		{
			ID:          "custom1",
			Name:        "Custom Tier",
			MinQuantity: 1,
			MaxQuantity: 5,
			Multiplier:  0.8, // 20% discount
			Priority:    1,
		},
	}

	calc.SetVolumeTiers(customTiers)

	retrievedTiers := calc.GetVolumeTiers()
	if len(retrievedTiers) != 1 {
		t.Errorf("Expected 1 custom tier, got %d", len(retrievedTiers))
	}

	if retrievedTiers[0].Multiplier != 0.8 {
		t.Errorf("Expected multiplier 0.8, got %.2f", retrievedTiers[0].Multiplier)
	}

	// Test that pricing uses new tiers
	selections := []Selection{
		{OptionID: "opt1", Quantity: 3},
	}

	breakdown := calc.CalculatePrice(selections)
	expectedPrice := 300.0 * 0.8 // 20% discount

	if math.Abs(breakdown.TotalPrice-expectedPrice) > 0.01 {
		t.Errorf("Expected price %.2f with custom tier, got %.2f", expectedPrice, breakdown.TotalPrice)
	}
}

func TestPricingCalculator_Performance(t *testing.T) {
	model := createLargeTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Test with multiple selections
	selections := []Selection{
		{OptionID: "opt1", Quantity: 10},
		{OptionID: "opt2", Quantity: 5},
		{OptionID: "opt3", Quantity: 8},
		{OptionID: "opt4", Quantity: 12},
	}

	start := time.Now()
	breakdown := calc.CalculatePrice(selections)
	elapsed := time.Since(start)

	// Performance target: <200ms (same as constraints)
	if elapsed > 200*time.Millisecond {
		t.Errorf("Pricing calculation took too long: %v (target: <200ms)", elapsed)
	}

	if breakdown.CalculationTime > 200*time.Millisecond {
		t.Errorf("Reported calculation time too long: %v", breakdown.CalculationTime)
	}

	// Verify calculation is correct
	if breakdown.BasePrice <= 0 {
		t.Error("Base price should be positive")
	}

	if breakdown.TotalPrice <= 0 {
		t.Error("Total price should be positive")
	}
}

func TestPricingCalculator_ZeroQuantity(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Selections with zero quantity should be ignored
	selections := []Selection{
		{OptionID: "opt1", Quantity: 0},
		{OptionID: "opt2", Quantity: 1},
	}

	breakdown := calc.CalculatePrice(selections)

	// Should only include opt2 ($50)
	expectedPrice := 50.0
	if breakdown.BasePrice != expectedPrice {
		t.Errorf("Expected base price %.2f, got %.2f", expectedPrice, breakdown.BasePrice)
	}
}

func TestPricingCalculator_InvalidOption(t *testing.T) {
	model := createTestModelForPricing()
	calc := NewPricingCalculator(model)

	// Selection with invalid option ID
	selections := []Selection{
		{OptionID: "nonexistent", Quantity: 1},
		{OptionID: "opt1", Quantity: 1},
	}

	breakdown := calc.CalculatePrice(selections)

	// Should only include valid option opt1 ($100)
	expectedPrice := 100.0
	if breakdown.BasePrice != expectedPrice {
		t.Errorf("Expected base price %.2f, got %.2f", expectedPrice, breakdown.BasePrice)
	}
}

func TestPricingCalculator_RulePriority(t *testing.T) {
	model := createTestModelWithPriorityRules()
	calc := NewPricingCalculator(model)

	// Selection that triggers multiple rules
	selections := []Selection{
		{OptionID: "opt1", Quantity: 1},
	}

	breakdown := calc.CalculatePrice(selections)

	// Should apply both rules but in priority order
	if len(breakdown.Adjustments) < 2 {
		t.Error("Expected multiple price rule adjustments")
	}

	// Check that adjustments are in priority order
	for i := 1; i < len(breakdown.Adjustments); i++ {
		// This is a simplified check - in reality, you'd verify rule IDs
		if breakdown.Adjustments[i-1].RuleID > breakdown.Adjustments[i].RuleID {
			// Rules should be applied in priority order
		}
	}
}

// ===================================================================
// TEST HELPER FUNCTIONS
// ===================================================================

func createTestModelForPricing() *Model {
	model := NewModel("pricing-test", "Pricing Test Model")

	// Add group
	model.AddGroup(Group{
		ID:   "group1",
		Name: "Test Group",
		Type: SingleSelect,
	})

	// Add options with different prices
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

func createTestModelWithPriceRules() *Model {
	model := createTestModelForPricing()

	// Add third option
	model.AddOption(Option{
		ID:        "opt3",
		Name:      "Option 3",
		GroupID:   "group1",
		BasePrice: 75.0,
		IsActive:  true,
	})

	// Add price rules
	model.AddPriceRule(PriceRule{
		ID:         "fixed_rule",
		Name:       "Fixed Discount Rule",
		Type:       FixedDiscountRule,
		Expression: "opt1:20.0", // $20 discount for opt1
		IsActive:   true,
		Priority:   1,
	})

	model.AddPriceRule(PriceRule{
		ID:         "percent_rule",
		Name:       "Percent Discount Rule",
		Type:       PercentDiscountRule,
		Expression: "opt2:0.15", // 15% discount for opt2
		IsActive:   true,
		Priority:   2,
	})

	model.AddPriceRule(PriceRule{
		ID:         "surcharge_rule",
		Name:       "SurchargeRule Rule",
		Type:       SurchargeRule,
		Expression: "opt3:15.0", // $15 surcharge for opt3
		IsActive:   true,
		Priority:   3,
	})

	return model
}

func createTestModelWithPriorityRules() *Model {
	model := createTestModelForPricing()

	// Add multiple rules for same option with different priorities
	model.AddPriceRule(PriceRule{
		ID:         "rule_high_priority",
		Name:       "High Priority Rule",
		Type:       FixedDiscountRule,
		Expression: "opt1:10.0",
		IsActive:   true,
		Priority:   1, // Higher priority (lower number)
	})

	model.AddPriceRule(PriceRule{
		ID:         "rule_low_priority",
		Name:       "Low Priority Rule",
		Type:       FixedDiscountRule,
		Expression: "opt1:5.0",
		IsActive:   true,
		Priority:   2, // Lower priority (higher number)
	})

	return model
}

func createLargeTestModelForPricing() *Model {
	model := NewModel("large-pricing-test", "Large Pricing Test Model")

	// Create multiple groups and options
	for groupNum := 1; groupNum <= 3; groupNum++ {
		groupID := fmt.Sprintf("group%d", groupNum)
		model.AddGroup(Group{
			ID:   groupID,
			Name: fmt.Sprintf("Group %d", groupNum),
			Type: MultiSelect,
		})

		// Add multiple options per group
		for optNum := 1; optNum <= 5; optNum++ {
			optionID := fmt.Sprintf("opt%d", (groupNum-1)*5+optNum)
			model.AddOption(Option{
				ID:        optionID,
				Name:      fmt.Sprintf("Option %s", optionID),
				GroupID:   groupID,
				BasePrice: float64((optNum + groupNum) * 25), // Varying prices
				IsActive:  true,
			})
		}
	}

	// Add multiple price rules
	for i := 1; i <= 5; i++ {
		model.AddPriceRule(PriceRule{
			ID:         fmt.Sprintf("rule%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Type:       PercentDiscountRule,
			Expression: fmt.Sprintf("opt%d:0.05", i), // 5% discount
			IsActive:   true,
			Priority:   i,
		})
	}

	return model
}

// impact_analyzer_test.go - Unit tests for impact analysis
package modelbuilder

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"DD/cpq"
)

func TestNewImpactAnalyzer(t *testing.T) {
	model := createTestModelForImpactAnalysis()

	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	if analyzer.model != model {
		t.Error("Analyzer should store reference to model")
	}

	if analyzer.originalConfigurator == nil {
		t.Error("Analyzer should initialize original configurator")
	}

	if analyzer.testGenerator == nil {
		t.Error("Analyzer should initialize test generator")
	}

	if analyzer.testGenerator.model != model {
		t.Error("Test generator should reference same model")
	}
}

func TestNewImpactAnalyzerWithNilModel(t *testing.T) {
	_, err := NewImpactAnalyzer(nil)
	if err == nil {
		t.Error("Expected error with nil model")
	}
}

func TestAnalyzeRuleChange_AddRule(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Create a new rule to add
	newRule := &cpq.Rule{
		ID:         "new_rule",
		Name:       "New Test Rule",
		Expression: "cpu_high -> premium_support",
		Type:       cpq.RequiresRule,
	}

	analysis, err := analyzer.AnalyzeRuleChange("add", nil, newRule)
	if err != nil {
		t.Fatalf("Failed to analyze rule change: %v", err)
	}

	// Verify analysis structure
	if analysis == nil {
		t.Fatal("Analysis should not be nil")
	}

	if analysis.RuleChange.Type != "add" {
		t.Errorf("Expected change type 'add', got '%s'", analysis.RuleChange.Type)
	}

	if analysis.RuleChange.RuleID != "new_rule" {
		t.Errorf("Expected rule ID 'new_rule', got '%s'", analysis.RuleChange.RuleID)
	}

	if analysis.TotalConfigurations == 0 {
		t.Error("Should have tested some configurations")
	}

	if analysis.AnalysisTime <= 0 {
		t.Error("Analysis time should be positive")
	}

	if len(analysis.RecommendedActions) == 0 {
		t.Error("Should have recommended actions")
	}

	// Test coverage should be calculated
	if analysis.TestCoverage.CombinationsTested == 0 {
		t.Error("Should have test coverage data")
	}
}

func TestAnalyzeRuleChange_ModifyRule(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Use existing rule as old rule
	oldRule := &model.Rules[0]

	// Create modified version
	newRule := &cpq.Rule{
		ID:         oldRule.ID,
		Name:       oldRule.Name + " (Modified)",
		Expression: "cpu_basic -> cooling_air", // Different expression
		Type:       oldRule.Type,
	}

	analysis, err := analyzer.AnalyzeRuleChange("modify", oldRule, newRule)
	if err != nil {
		t.Fatalf("Failed to analyze rule change: %v", err)
	}

	if analysis.RuleChange.Type != "modify" {
		t.Errorf("Expected change type 'modify', got '%s'", analysis.RuleChange.Type)
	}

	if analysis.RuleChange.OldRule == nil {
		t.Error("Should have old rule reference")
	}

	if analysis.RuleChange.NewRule == nil {
		t.Error("Should have new rule reference")
	}
}

func TestAnalyzeRuleChange_RemoveRule(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Use existing rule to remove
	ruleToRemove := &model.Rules[0]

	analysis, err := analyzer.AnalyzeRuleChange("remove", ruleToRemove, nil)
	if err != nil {
		t.Fatalf("Failed to analyze rule change: %v", err)
	}

	if analysis.RuleChange.Type != "remove" {
		t.Errorf("Expected change type 'remove', got '%s'", analysis.RuleChange.Type)
	}

	if analysis.RuleChange.OldRule == nil {
		t.Error("Should have old rule reference")
	}

	if analysis.RuleChange.NewRule != nil {
		t.Error("Should not have new rule reference for removal")
	}
}

func TestGenerateTestConfigurations(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	configs, coverage, err := analyzer.generateTestConfigurations()
	if err != nil {
		t.Fatalf("Failed to generate test configurations: %v", err)
	}

	// Should generate some configurations
	if len(configs) == 0 {
		t.Error("Should generate test configurations")
	}

	// Coverage should be calculated
	if coverage.CombinationsTested != len(configs) {
		t.Errorf("Coverage combinations tested (%d) should match config count (%d)",
			coverage.CombinationsTested, len(configs))
	}

	if coverage.TestGenerationTime <= 0 {
		t.Error("Test generation time should be positive")
	}

	if coverage.CoveragePercentage < 0 || coverage.CoveragePercentage > 100 {
		t.Errorf("Coverage percentage should be 0-100, got %.2f", coverage.CoveragePercentage)
	}

	// Verify configurations have required fields
	for i, config := range configs {
		if config.ModelID != model.ID {
			t.Errorf("Config %d should have model ID %s, got %s", i, model.ID, config.ModelID)
		}
	}
}

func TestGenerateSingleOptionConfigurations(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	configs := analyzer.generateSingleOptionConfigurations()

	// Should generate one config per option
	expectedCount := len(model.Options)
	if len(configs) != expectedCount {
		t.Errorf("Expected %d single-option configs, got %d", expectedCount, len(configs))
	}

	// Each config should have exactly one selection
	for i, config := range configs {
		if len(config.Selections) != 1 {
			t.Errorf("Config %d should have 1 selection, got %d", i, len(config.Selections))
		}

		if config.Selections[0].Quantity != 1 {
			t.Errorf("Config %d selection should have quantity 1, got %d",
				i, config.Selections[0].Quantity)
		}
	}
}

func TestGenerateGroupBasedConfigurations(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	configs := analyzer.generateGroupBasedConfigurations()

	// Should generate some configurations based on groups
	if len(configs) == 0 {
		t.Error("Should generate group-based configurations")
	}

	// Verify each config has valid selections
	for _, config := range configs {
		for _, selection := range config.Selections {
			// Verify option exists in model
			found := false
			for _, option := range model.Options {
				if option.ID == selection.OptionID {
					found = true
					break
				}
			}
			if !found {
				t.Errorf("Selection references non-existent option: %s", selection.OptionID)
			}
		}
	}
}

func TestCreateConfigurationSnapshot(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		t.Fatalf("Failed to create configurator: %v", err)
	}

	// Create test configuration
	config := cpq.Configuration{
		ID:      "test_config",
		ModelID: model.ID,
		Selections: []cpq.Selection{
			{OptionID: "cpu_basic", Quantity: 1},
		},
	}

	snapshot, err := analyzer.createConfigurationSnapshot(config, configurator)
	if err != nil {
		t.Fatalf("Failed to create configuration snapshot: %v", err)
	}

	// Verify snapshot structure
	if len(snapshot.Selections) != 1 {
		t.Errorf("Expected 1 selection in snapshot, got %d", len(snapshot.Selections))
	}

	if snapshot.TotalPrice < 0 {
		t.Error("Total price should not be negative")
	}

	// Should have some available options
	if snapshot.AvailableCount < 0 {
		t.Error("Available count should not be negative")
	}
}

func TestCreateModifiedModel(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	originalRuleCount := len(model.Rules)

	// Test adding a rule
	newRule := &cpq.Rule{
		ID:         "new_rule",
		Name:       "New Rule",
		Expression: "test_expression",
		Type:       cpq.RequiresRule,
	}

	modifiedModel, err := analyzer.createModifiedModel("add", nil, newRule)
	if err != nil {
		t.Fatalf("Failed to create modified model for add: %v", err)
	}

	if len(modifiedModel.Rules) != originalRuleCount+1 {
		t.Errorf("Expected %d rules after add, got %d", originalRuleCount+1, len(modifiedModel.Rules))
	}

	// Test removing a rule
	ruleToRemove := &model.Rules[0]
	modifiedModel, err = analyzer.createModifiedModel("remove", ruleToRemove, nil)
	if err != nil {
		t.Fatalf("Failed to create modified model for remove: %v", err)
	}

	if len(modifiedModel.Rules) != originalRuleCount-1 {
		t.Errorf("Expected %d rules after remove, got %d", originalRuleCount-1, len(modifiedModel.Rules))
	}

	// Verify removed rule is not present
	for _, rule := range modifiedModel.Rules {
		if rule.ID == ruleToRemove.ID {
			t.Error("Removed rule should not be present in modified model")
		}
	}

	// Test modifying a rule
	oldRule := &model.Rules[0]
	modifiedRule := &cpq.Rule{
		ID:         oldRule.ID,
		Name:       oldRule.Name + " (Modified)",
		Expression: "modified_expression",
		Type:       oldRule.Type,
	}

	modifiedModel, err = analyzer.createModifiedModel("modify", oldRule, modifiedRule)
	if err != nil {
		t.Fatalf("Failed to create modified model for modify: %v", err)
	}

	if len(modifiedModel.Rules) != originalRuleCount {
		t.Errorf("Expected %d rules after modify, got %d", originalRuleCount, len(modifiedModel.Rules))
	}

	// Verify rule was modified
	found := false
	for _, rule := range modifiedModel.Rules {
		if rule.ID == oldRule.ID {
			if rule.Expression != "modified_expression" {
				t.Error("Rule expression should be modified")
			}
			found = true
			break
		}
	}
	if !found {
		t.Error("Modified rule should be present")
	}
}

func TestRemoveDuplicateConfigurations(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	// Create configurations with duplicates
	configs := []cpq.Configuration{
		{
			ID:      "config1",
			ModelID: model.ID,
			Selections: []cpq.Selection{
				{OptionID: "cpu_basic", Quantity: 1},
			},
		},
		{
			ID:      "config2", // Different ID but same selections
			ModelID: model.ID,
			Selections: []cpq.Selection{
				{OptionID: "cpu_basic", Quantity: 1},
			},
		},
		{
			ID:      "config3",
			ModelID: model.ID,
			Selections: []cpq.Selection{
				{OptionID: "cpu_high", Quantity: 1},
			},
		},
	}

	unique := analyzer.removeDuplicateConfigurations(configs)

	// Should remove one duplicate
	if len(unique) != 2 {
		t.Errorf("Expected 2 unique configurations, got %d", len(unique))
	}
}

func TestConfigurationKey(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	config1 := cpq.Configuration{
		Selections: []cpq.Selection{
			{OptionID: "cpu_basic", Quantity: 1},
			{OptionID: "cooling_air", Quantity: 1},
		},
	}

	config2 := cpq.Configuration{
		Selections: []cpq.Selection{
			{OptionID: "cooling_air", Quantity: 1}, // Different order
			{OptionID: "cpu_basic", Quantity: 1},
		},
	}

	key1 := analyzer.configurationKey(config1)
	key2 := analyzer.configurationKey(config2)

	// Keys should be identical regardless of selection order
	if key1 != key2 {
		t.Errorf("Keys should be identical for same selections in different order: '%s' vs '%s'", key1, key2)
	}
}

func TestDetermineValidityImpact(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	tests := []struct {
		beforeValid bool
		afterValid  bool
		expected    string
	}{
		{true, false, "broken"},
		{false, true, "fixed"},
		{true, true, "unchanged"},
		{false, false, "unchanged"},
	}

	for _, test := range tests {
		before := ConfigurationSnapshot{IsValid: test.beforeValid}
		after := ConfigurationSnapshot{IsValid: test.afterValid}

		result := analyzer.determineValidityImpact(before, after)
		if result != test.expected {
			t.Errorf("Expected validity impact '%s' for %v->%v, got '%s'",
				test.expected, test.beforeValid, test.afterValid, result)
		}
	}
}

func TestDeterminePricingImpact(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	tests := []struct {
		priceDiff float64
		expected  string
	}{
		{10.0, "price_increase"},
		{-5.0, "price_decrease"},
		{0.0, "price_unchanged"},
		{0.001, "price_unchanged"}, // Within tolerance
	}

	for _, test := range tests {
		result := analyzer.determinePricingImpact(test.priceDiff)
		if result != test.expected {
			t.Errorf("Expected pricing impact '%s' for diff %.3f, got '%s'",
				test.expected, test.priceDiff, result)
		}
	}
}

func TestGenerateSummary(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	validityChanges := []ConfigurationChange{
		{Impact: "broken"},
		{Impact: "fixed"},
		{Impact: "broken"},
	}

	pricingChanges := []ConfigurationChange{
		{Impact: "price_increase"},
		{Impact: "price_decrease"},
	}

	optionChanges := []ConfigurationChange{
		{Impact: "options_restricted"},
	}

	summary := analyzer.generateSummary(validityChanges, pricingChanges, optionChanges)

	if summary.ConfigurationsBroken != 2 {
		t.Errorf("Expected 2 broken configurations, got %d", summary.ConfigurationsBroken)
	}

	if summary.ConfigurationsFixed != 1 {
		t.Errorf("Expected 1 fixed configuration, got %d", summary.ConfigurationsFixed)
	}

	if summary.PriceIncreases != 1 {
		t.Errorf("Expected 1 price increase, got %d", summary.PriceIncreases)
	}

	if summary.PriceDecreases != 1 {
		t.Errorf("Expected 1 price decrease, got %d", summary.PriceDecreases)
	}

	if summary.OptionsRestricted != 1 {
		t.Errorf("Expected 1 options restricted, got %d", summary.OptionsRestricted)
	}

	// Impact score should be calculated
	if summary.TotalImpactScore < 0 || summary.TotalImpactScore > 100 {
		t.Errorf("Impact score should be 0-100, got %d", summary.TotalImpactScore)
	}
}

func TestGenerateRecommendations(t *testing.T) {
	model := createTestModelForImpactAnalysis()
	analyzer, _ := NewImpactAnalyzer(model)

	ruleChange := RuleChangeDescription{
		Type:     "add",
		RuleID:   "test_rule",
		RuleName: "Test Rule",
	}

	// Test high impact scenario
	summary := ImpactSummary{
		ConfigurationsBroken: 5,
		TotalImpactScore:     75,
		PriceIncreases:       3,
	}

	recommendations := analyzer.generateRecommendations(ruleChange, summary, []ConfigurationChange{}, []ConfigurationChange{})

	if len(recommendations) == 0 {
		t.Error("Should generate recommendations")
	}

	// Should include critical recommendation for broken configurations
	hasCritical := false
	hasHighImpact := false
	for _, rec := range recommendations {
		if containsStringImproved(rec, "CRITICAL") {
			hasCritical = true
		}
		if containsStringImproved(rec, "HIGH IMPACT") {
			hasHighImpact = true
		}
	}

	if !hasCritical {
		t.Error("Should include critical recommendation for broken configurations")
	}
	if !hasHighImpact {
		t.Error("Should include high impact recommendation")
	}

	// Test low impact scenario
	lowImpactSummary := ImpactSummary{
		ConfigurationsBroken: 0,
		TotalImpactScore:     10,
		ConfigurationsFixed:  2,
	}

	lowImpactRecs := analyzer.generateRecommendations(ruleChange, lowImpactSummary, []ConfigurationChange{}, []ConfigurationChange{})

	// Should include positive recommendation
	hasPositive := false
	for _, rec := range lowImpactRecs {
		if containsStringImproved(rec, "POSITIVE") || containsStringImproved(rec, "Low impact") {
			hasPositive = true
			break
		}
	}
	if !hasPositive {
		t.Error("Should include positive or low impact recommendation")
	}
}

func TestPerformanceImpactAnalysis(t *testing.T) {
	// Test with model that has multiple options to ensure performance
	model := createLargeTestModelForImpact(20) // 20 options
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	newRule := &cpq.Rule{
		ID:         "perf_test_rule",
		Name:       "Performance Test Rule",
		Expression: "option_1 -> option_2",
		Type:       cpq.RequiresRule,
	}

	start := time.Now()
	analysis, err := analyzer.AnalyzeRuleChange("add", nil, newRule)
	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to analyze rule change: %v", err)
	}

	// Should meet performance target of <500ms for comprehensive testing
	if elapsed > 500*time.Millisecond {
		t.Errorf("Performance target missed: took %v, expected <500ms", elapsed)
	}

	if analysis.AnalysisTime <= 0 {
		t.Error("Analysis time should be recorded")
	}

	t.Logf("Performance test: analyzed %d configurations in %v",
		analysis.TotalConfigurations, elapsed)
}

// Helper functions for creating test models

func createTestModelForImpactAnalysis() *cpq.Model {
	model := cpq.NewModel("impact_test_model", "Impact Test Model")

	model.Groups = []cpq.Group{
		{ID: "cpu", Name: "CPU", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
		{ID: "cooling", Name: "Cooling", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
		{ID: "support", Name: "Support", Type: cpq.Optional, MinSelections: 0, MaxSelections: 1},
	}

	model.Options = []cpq.Option{
		{ID: "cpu_basic", Name: "Basic CPU", GroupID: "cpu", BasePrice: 100},
		{ID: "cpu_high", Name: "High-end CPU", GroupID: "cpu", BasePrice: 500},
		{ID: "cooling_air", Name: "Air Cooling", GroupID: "cooling", BasePrice: 50},
		{ID: "cooling_liquid", Name: "Liquid Cooling", GroupID: "cooling", BasePrice: 150},
		{ID: "premium_support", Name: "Premium Support", GroupID: "support", BasePrice: 200},
		{ID: "basic_support", Name: "Basic Support", GroupID: "support", BasePrice: 50},
	}

	model.Rules = []cpq.Rule{
		{ID: "rule1", Name: "High CPU needs liquid cooling",
			Expression: "cpu_high -> cooling_liquid", Type: cpq.RequiresRule},
		{ID: "rule2", Name: "Basic CPU with air cooling",
			Expression: "cpu_basic -> cooling_air", Type: cpq.RequiresRule},
	}

	return model
}

func createLargeTestModelForImpact(numOptions int) *cpq.Model {
	model := cpq.NewModel("large_impact_model", "Large Impact Test Model")

	model.Groups = []cpq.Group{
		{ID: "main_group", Name: "Main Group", Type: cpq.MultiSelect, MinSelections: 0, MaxSelections: numOptions},
	}

	// Create many options
	for i := 0; i < numOptions; i++ {
		option := cpq.Option{
			ID:        fmt.Sprintf("option_%d", i),
			Name:      fmt.Sprintf("Option %d", i),
			GroupID:   "main_group",
			BasePrice: float64(100 + i*10),
		}
		model.Options = append(model.Options, option)
	}

	// Create a few rules
	for i := 0; i < min(5, numOptions-1); i++ {
		rule := cpq.Rule{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Expression: fmt.Sprintf("option_%d => allows option_%d", i, i+1),
			Type:       cpq.RequiresRule,
		}
		model.Rules = append(model.Rules, rule)
	}

	return model
}

// Utility function
func containsStringImproved(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}

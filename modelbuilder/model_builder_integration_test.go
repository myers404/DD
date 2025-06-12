// model_builder_integration_test.go - Integration tests for Model Building Tools
// Tests the interaction between Rule Conflict Detection and Impact Analysis
package modelbuilder

import (
	"fmt"
	"testing"
	"time"

	"DD/cpq"
)

// TestModelBuilderWorkflow tests the complete workflow of model building tools
func TestModelBuilderWorkflow(t *testing.T) {
	// 1. Create a complex model with potential conflicts
	model := createComplexTestModel()

	// 2. Analyze existing conflicts
	conflictDetector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	conflictResult, err := conflictDetector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	t.Logf("Initial model analysis: %d conflicts found", conflictResult.ConflictsFound)

	// 3. Propose a rule change that might resolve conflicts
	impactAnalyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Propose adding a rule that might create new conflicts
	newRule := &cpq.Rule{
		ID:         "integration_rule",
		Name:       "Integration Test Rule",
		Expression: "opt_tier_premium -> (opt_support_premium && opt_cooling_liquid)",
		Message:    "Premium tier requires premium support and liquid cooling",
		Type:       cpq.RequiresRule,
	}

	impactResult, err := impactAnalyzer.AnalyzeRuleChange("add", nil, newRule)
	if err != nil {
		t.Fatalf("Failed to analyze rule impact: %v", err)
	}

	t.Logf("Impact analysis: %d configurations affected", impactResult.AffectedConfigurations)

	// 4. Verify integration results make sense
	if impactResult.TotalConfigurations == 0 {
		t.Error("Impact analysis should test some configurations")
	}

	if len(impactResult.RecommendedActions) == 0 {
		t.Error("Impact analysis should provide recommendations")
	}

	// 5. Test the modified model for new conflicts
	modifiedModel, err := createModelWithNewRule(model, newRule)
	if err != nil {
		t.Fatalf("Failed to create modified model: %v", err)
	}

	modifiedDetector, err := NewConflictDetector(modifiedModel)
	if err != nil {
		t.Fatalf("Failed to create conflict detector for modified model: %v", err)
	}

	modifiedConflictResult, err := modifiedDetector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts in modified model: %v", err)
	}

	t.Logf("Modified model analysis: %d conflicts found", modifiedConflictResult.ConflictsFound)

	// 6. Verify the workflow provides actionable insights
	if conflictResult.ConflictsFound > 0 && len(conflictResult.Recommendations) == 0 {
		t.Error("Conflict detection should provide recommendations when conflicts exist")
	}

	// Performance check - entire workflow should complete in reasonable time
	if conflictResult.AnalysisTime+impactResult.AnalysisTime > 1*time.Second {
		t.Errorf("Combined analysis took too long: %v",
			conflictResult.AnalysisTime+impactResult.AnalysisTime)
	}
}

// TestRuleConflictToImpactAnalysisFlow tests the flow from conflict detection to impact analysis
func TestRuleConflictToImpactAnalysisFlow(t *testing.T) {
	// Create model with known conflicts
	model := createModelWithKnownConflicts()

	// 1. Detect conflicts
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	conflicts, err := detector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	// Should find conflicts in this model
	if conflicts.ConflictsFound == 0 {
		t.Error("Expected to find conflicts in test model")
	}

	// 2. For each conflict, analyze impact of potential resolution
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	for _, conflict := range conflicts.Conflicts {
		if conflict.ConflictType == "direct_contradiction" && len(conflict.ConflictingRules) >= 2 {
			// Simulate resolving conflict by removing one rule
			ruleToRemove := findRuleByID(model, conflict.ConflictingRules[0])
			if ruleToRemove != nil {
				impact, err := analyzer.AnalyzeRuleChange("remove", ruleToRemove, nil)
				if err != nil {
					t.Errorf("Failed to analyze impact of rule removal: %v", err)
					continue
				}

				t.Logf("Removing rule %s would affect %d configurations",
					ruleToRemove.Name, impact.AffectedConfigurations)

				// Impact analysis should provide meaningful results
				if len(impact.RecommendedActions) == 0 {
					t.Error("Impact analysis should provide recommendations for rule removal")
				}

				// Removing a conflicting rule should generally be positive
				if impact.Summary.TotalImpactScore > 80 {
					t.Logf("Warning: High impact score (%d) for conflict resolution",
						impact.Summary.TotalImpactScore)
				}
			}
			break // Just test one conflict resolution
		}
	}
}

// TestConcurrentAnalysis tests running both tools concurrently
func TestConcurrentAnalysis(t *testing.T) {
	model := createComplexTestModel()

	// Channel to collect results
	type analysisResult struct {
		conflictResult *ConflictDetectionResult
		impactResult   *ImpactAnalysis
		err            error
	}

	resultChan := make(chan analysisResult, 2)

	// Run conflict detection concurrently
	go func() {
		detector, err := NewConflictDetector(model)
		if err != nil {
			resultChan <- analysisResult{err: err}
			return
		}

		conflicts, err := detector.DetectConflicts()
		resultChan <- analysisResult{conflictResult: conflicts, err: err}
	}()

	// Run impact analysis concurrently
	go func() {
		analyzer, err := NewImpactAnalyzer(model)
		if err != nil {
			resultChan <- analysisResult{err: err}
			return
		}

		newRule := &cpq.Rule{
			ID:         "concurrent_test_rule",
			Name:       "Concurrent Test Rule",
			Expression: "opt_option_1 -> opt_option_2",
			Message:    "Option 1 requires Option 2",
			Type:       cpq.RequiresRule,
		}

		impact, err := analyzer.AnalyzeRuleChange("add", nil, newRule)
		resultChan <- analysisResult{impactResult: impact, err: err}
	}()

	// Collect results
	var conflictResult *ConflictDetectionResult
	var impactResult *ImpactAnalysis
	for i := 0; i < 2; i++ {
		result := <-resultChan
		if result.err != nil {
			t.Fatalf("Concurrent analysis failed: %v", result.err)
		}
		if result.conflictResult != nil {
			conflictResult = result.conflictResult
		}
		if result.impactResult != nil {
			impactResult = result.impactResult
		}
	}

	// Verify both completed successfully
	if conflictResult == nil {
		t.Error("Conflict detection should complete")
	}
	if impactResult == nil {
		t.Error("Impact analysis should complete")
	}

	t.Logf("Concurrent analysis completed: %d conflicts, %d configs affected",
		conflictResult.ConflictsFound, impactResult.AffectedConfigurations)
}

// TestEndToEndModelEvolution tests evolving a model through multiple changes
func TestEndToEndModelEvolution(t *testing.T) {
	// Start with simple model
	model := createSimpleEvolutionModel()

	changes := []struct {
		name        string
		changeType  string
		oldRule     *cpq.Rule
		newRule     *cpq.Rule
		expectation string
	}{
		{
			name:       "Add basic requirement rule",
			changeType: "add",
			newRule: &cpq.Rule{
				ID:         "req1",
				Name:       "CPU requires cooling",
				Expression: "opt_cpu_high -> opt_cooling_liquid",
				Message:    "High-end CPU requires liquid cooling",
				Type:       cpq.RequiresRule,
			},
			expectation: "should add valid requirement",
		},
		{
			name:       "Add conflicting exclusion rule",
			changeType: "add",
			newRule: &cpq.Rule{
				ID:         "excl1",
				Name:       "Budget excludes liquid cooling",
				Expression: "opt_budget_tier -> !opt_cooling_liquid",
				Message:    "Budget tier excludes liquid cooling",
				Type:       cpq.ExcludesRule,
			},
			expectation: "should create conflict",
		},
		{
			name:       "Modify to resolve conflict",
			changeType: "modify",
			oldRule: &cpq.Rule{
				ID:         "excl1",
				Name:       "Budget excludes liquid cooling",
				Expression: "opt_budget_tier -> !opt_cooling_liquid",
				Message:    "Budget tier excludes liquid cooling",
				Type:       cpq.ExcludesRule,
			},
			newRule: &cpq.Rule{
				ID:         "excl1",
				Name:       "Budget prefers air cooling",
				Expression: "opt_budget_tier -> opt_cooling_air",
				Message:    "Budget tier requires air cooling",
				Type:       cpq.RequiresRule,
			},
			expectation: "should reduce conflicts",
		},
	}

	currentModel := model
	for i, change := range changes {
		t.Logf("Step %d: %s", i+1, change.name)

		// Analyze current state
		detector, err := NewConflictDetector(currentModel)
		if err != nil {
			t.Fatalf("Failed to create detector for step %d: %v", i+1, err)
		}

		beforeConflicts, err := detector.DetectConflicts()
		if err != nil {
			t.Fatalf("Failed to detect conflicts before step %d: %v", i+1, err)
		}

		// Analyze proposed change
		analyzer, err := NewImpactAnalyzer(currentModel)
		if err != nil {
			t.Fatalf("Failed to create analyzer for step %d: %v", i+1, err)
		}

		impact, err := analyzer.AnalyzeRuleChange(change.changeType, change.oldRule, change.newRule)
		if err != nil {
			t.Fatalf("Failed to analyze impact for step %d: %v", i+1, err)
		}

		// Apply change
		currentModel, err = applyRuleChange(currentModel, change.changeType, change.oldRule, change.newRule)
		if err != nil {
			t.Fatalf("Failed to apply change for step %d: %v", i+1, err)
		}

		// Analyze new state
		newDetector, err := NewConflictDetector(currentModel)
		if err != nil {
			t.Fatalf("Failed to create detector after step %d: %v", i+1, err)
		}

		afterConflicts, err := newDetector.DetectConflicts()
		if err != nil {
			t.Fatalf("Failed to detect conflicts after step %d: %v", i+1, err)
		}

		// Log evolution
		t.Logf("  Before: %d conflicts, After: %d conflicts, Impact: %d configs affected",
			beforeConflicts.ConflictsFound, afterConflicts.ConflictsFound, impact.AffectedConfigurations)

		// Verify expectations based on change
		switch change.expectation {
		case "should add valid requirement":
			if impact.Summary.ConfigurationsBroken > 0 {
				t.Errorf("Step %d: Expected valid addition, but %d configs broken",
					i+1, impact.Summary.ConfigurationsBroken)
			}
		case "should create conflict":
			if afterConflicts.ConflictsFound <= beforeConflicts.ConflictsFound {
				t.Errorf("Step %d: Expected to create conflicts, but conflicts didn't increase", i+1)
			}
		case "should reduce conflicts":
			if afterConflicts.ConflictsFound >= beforeConflicts.ConflictsFound {
				t.Errorf("Step %d: Expected to reduce conflicts, but conflicts didn't decrease", i+1)
			}
		}
	}
}

// TestLargeModelPerformance tests performance with a large, complex model
func TestLargeModelPerformance(t *testing.T) {
	// Create large model
	model := createLargeComplexModel(100, 20) // 100 options, 20 rules

	start := time.Now()

	// Test conflict detection performance
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	conflicts, err := detector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	conflictTime := time.Since(start)

	// Test impact analysis performance
	analyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	newRule := &cpq.Rule{
		ID:         "perf_test_rule",
		Name:       "Performance Test Rule",
		Expression: "opt_option_1 -> opt_option_2",
		Message:    "Option 1 requires Option 2",
		Type:       cpq.RequiresRule,
	}

	impactStart := time.Now()
	impact, err := analyzer.AnalyzeRuleChange("add", nil, newRule)
	if err != nil {
		t.Fatalf("Failed to analyze impact: %v", err)
	}
	impactTime := time.Since(impactStart)

	totalTime := time.Since(start)

	// Performance assertions
	if conflictTime > 200*time.Millisecond {
		t.Errorf("Conflict detection too slow: %v (target: <200ms)", conflictTime)
	}

	if impactTime > 500*time.Millisecond {
		t.Errorf("Impact analysis too slow: %v (target: <500ms)", impactTime)
	}

	if totalTime > 1*time.Second {
		t.Errorf("Total analysis too slow: %v (target: <1s)", totalTime)
	}

	t.Logf("Performance results for model with %d options, %d rules:", len(model.Options), len(model.Rules))
	t.Logf("  Conflict detection: %v (%d conflicts found)", conflictTime, conflicts.ConflictsFound)
	t.Logf("  Impact analysis: %v (%d configs tested)", impactTime, impact.TotalConfigurations)
	t.Logf("  Total time: %v", totalTime)
}

// Helper functions for integration tests

func createComplexTestModel() *cpq.Model {
	model := cpq.NewModel("complex_model", "Complex Test Model")

	model.Groups = []cpq.Group{
		{ID: "cpu", Name: "CPU", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
		{ID: "memory", Name: "Memory", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
		{ID: "storage", Name: "Storage", Type: cpq.MultiSelect, MinSelections: 1, MaxSelections: 3},
		{ID: "cooling", Name: "Cooling", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
		{ID: "support", Name: "Support", Type: cpq.Optional, MinSelections: 0, MaxSelections: 2},
		{ID: "tier", Name: "Service Tier", Type: cpq.SingleSelect, MinSelections: 1, MaxSelections: 1},
	}

	model.Options = []cpq.Option{
		{ID: "cpu_basic", Name: "Basic CPU", GroupID: "cpu", BasePrice: 200},
		{ID: "cpu_high", Name: "High-end CPU", GroupID: "cpu", BasePrice: 800},
		{ID: "cpu_extreme", Name: "Extreme CPU", GroupID: "cpu", BasePrice: 1500},

		{ID: "mem_8gb", Name: "8GB Memory", GroupID: "memory", BasePrice: 100},
		{ID: "mem_16gb", Name: "16GB Memory", GroupID: "memory", BasePrice: 200},
		{ID: "mem_32gb", Name: "32GB Memory", GroupID: "memory", BasePrice: 400},

		{ID: "ssd_500gb", Name: "500GB SSD", GroupID: "storage", BasePrice: 150},
		{ID: "ssd_1tb", Name: "1TB SSD", GroupID: "storage", BasePrice: 300},
		{ID: "hdd_2tb", Name: "2TB HDD", GroupID: "storage", BasePrice: 100},

		{ID: "cooling_air", Name: "Air Cooling", GroupID: "cooling", BasePrice: 75},
		{ID: "cooling_liquid", Name: "Liquid Cooling", GroupID: "cooling", BasePrice: 200},

		{ID: "support_basic", Name: "Basic Support", GroupID: "support", BasePrice: 100},
		{ID: "support_premium", Name: "Premium Support", GroupID: "support", BasePrice: 300},

		{ID: "tier_budget", Name: "Budget Tier", GroupID: "tier", BasePrice: 0},
		{ID: "tier_standard", Name: "Standard Tier", GroupID: "tier", BasePrice: 200},
		{ID: "tier_premium", Name: "Premium Tier", GroupID: "tier", BasePrice: 500},
	}

	model.Rules = []cpq.Rule{
		{ID: "rule1", Name: "High CPU requires liquid cooling",
			Expression: "opt_cpu_high -> opt_cooling_liquid",
			Message:    "High-end CPU requires liquid cooling",
			Type:       cpq.RequiresRule},
		{ID: "rule2", Name: "Extreme CPU requires liquid cooling",
			Expression: "opt_cpu_extreme -> opt_cooling_liquid",
			Message:    "Extreme CPU requires liquid cooling",
			Type:       cpq.RequiresRule},
		{ID: "rule3", Name: "Budget tier excludes premium support",
			Expression: "opt_tier_budget -> !opt_support_premium",
			Message:    "Budget tier excludes premium support",
			Type:       cpq.ExcludesRule},
		{ID: "rule4", Name: "Premium tier includes premium support",
			Expression: "opt_tier_premium -> opt_support_premium",
			Message:    "Premium tier requires premium support",
			Type:       cpq.RequiresRule},
		{ID: "rule5", Name: "Extreme CPU requires high memory",
			Expression: "opt_cpu_extreme -> opt_mem_32gb",
			Message:    "Extreme CPU requires 32GB memory",
			Type:       cpq.RequiresRule},
	}

	return model
}

func createModelWithKnownConflicts() *cpq.Model {
	model := createComplexTestModel()

	// Add conflicting rules
	model.Rules = append(model.Rules, []cpq.Rule{
		{ID: "conflict1", Name: "Budget requires premium support",
			Expression: "opt_tier_budget -> opt_support_premium",
			Message:    "Budget tier requires premium support",
			Type:       cpq.RequiresRule},
		{ID: "conflict2", Name: "High CPU excludes liquid cooling",
			Expression: "opt_cpu_high -> !opt_cooling_liquid",
			Message:    "High CPU excludes liquid cooling",
			Type:       cpq.ExcludesRule},
	}...)

	return model
}

func createSimpleEvolutionModel() *cpq.Model {
	model := cpq.NewModel("evolution_model", "Evolution Test Model")

	model.Groups = []cpq.Group{
		{ID: "cpu", Name: "CPU", Type: cpq.SingleSelect},
		{ID: "cooling", Name: "Cooling", Type: cpq.SingleSelect},
		{ID: "tier", Name: "Tier", Type: cpq.SingleSelect},
	}

	model.Options = []cpq.Option{
		{ID: "cpu_basic", Name: "Basic CPU", GroupID: "cpu", BasePrice: 200},
		{ID: "cpu_high", Name: "High-end CPU", GroupID: "cpu", BasePrice: 800},
		{ID: "cooling_air", Name: "Air Cooling", GroupID: "cooling", BasePrice: 50},
		{ID: "cooling_liquid", Name: "Liquid Cooling", GroupID: "cooling", BasePrice: 200},
		{ID: "budget_tier", Name: "Budget Tier", GroupID: "tier", BasePrice: 0},
		{ID: "premium_tier", Name: "Premium Tier", GroupID: "tier", BasePrice: 300},
	}

	// Start with no rules
	model.Rules = []cpq.Rule{}

	return model
}

func createLargeComplexModel(numOptions, numRules int) *cpq.Model {
	model := cpq.NewModel("large_model", "Large Complex Model")

	// Create groups
	numGroups := 5
	for i := 0; i < numGroups; i++ {
		groupType := cpq.SingleSelect
		if i%3 == 1 {
			groupType = cpq.MultiSelect
		} else if i%3 == 2 {
			groupType = cpq.Optional
		}

		group := cpq.Group{
			ID:            fmt.Sprintf("group_%d", i),
			Name:          fmt.Sprintf("Group %d", i),
			Type:          groupType,
			MinSelections: 0,
			MaxSelections: 5,
		}
		model.Groups = append(model.Groups, group)
	}

	// Create options
	for i := 0; i < numOptions; i++ {
		groupID := fmt.Sprintf("group_%d", i%numGroups)
		option := cpq.Option{
			ID:        fmt.Sprintf("option_%d", i),
			Name:      fmt.Sprintf("Option %d", i),
			GroupID:   groupID,
			BasePrice: float64(100 + (i*17)%500), // Varied pricing
		}
		model.Options = append(model.Options, option)
	}

	// Create rules with valid boolean expressions
	for i := 0; i < numRules && i < numOptions-1; i++ {
		option1 := i % numOptions
		option2 := (i + 1) % numOptions

		var expression, message string
		var ruleType cpq.RuleType

		if i%2 == 0 {
			// Requires rule: option1 -> option2
			expression = fmt.Sprintf("opt_option_%d -> opt_option_%d", option1, option2)
			message = fmt.Sprintf("Option %d requires Option %d", option1, option2)
			ruleType = cpq.RequiresRule
		} else {
			// Excludes rule: option1 -> !option2
			expression = fmt.Sprintf("opt_option_%d -> !opt_option_%d", option1, option2)
			message = fmt.Sprintf("Option %d excludes Option %d", option1, option2)
			ruleType = cpq.ExcludesRule
		}

		rule := cpq.Rule{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Expression: expression,
			Message:    message,
			Type:       ruleType,
		}
		model.Rules = append(model.Rules, rule)
	}

	return model
}

func createModelWithNewRule(originalModel *cpq.Model, newRule *cpq.Rule) (*cpq.Model, error) {
	// Create a copy of the model with the new rule added
	modifiedModel := &cpq.Model{
		ID:          originalModel.ID + "_with_new_rule",
		Name:        originalModel.Name + " (Modified)",
		Description: originalModel.Description,
		Version:     originalModel.Version,
		Groups:      make([]cpq.Group, len(originalModel.Groups)),
		Options:     make([]cpq.Option, len(originalModel.Options)),
		Rules:       make([]cpq.Rule, len(originalModel.Rules)+1),
		PriceRules:  make([]cpq.PriceRule, len(originalModel.PriceRules)),
		CreatedAt:   originalModel.CreatedAt,
		UpdatedAt:   time.Now(),
		IsActive:    originalModel.IsActive,
	}

	// Copy all fields
	copy(modifiedModel.Groups, originalModel.Groups)
	copy(modifiedModel.Options, originalModel.Options)
	copy(modifiedModel.Rules, originalModel.Rules)
	copy(modifiedModel.PriceRules, originalModel.PriceRules)

	// Add new rule
	modifiedModel.Rules[len(originalModel.Rules)] = *newRule

	return modifiedModel, nil
}

func findRuleByID(model *cpq.Model, ruleID string) *cpq.Rule {
	for _, rule := range model.Rules {
		if rule.ID == ruleID {
			return &rule
		}
	}
	return nil
}

func applyRuleChange(model *cpq.Model, changeType string, oldRule, newRule *cpq.Rule) (*cpq.Model, error) {
	// Create a copy of the model
	modifiedModel := &cpq.Model{
		ID:          model.ID + "_modified",
		Name:        model.Name + " (Modified)",
		Description: model.Description,
		Version:     model.Version,
		Groups:      make([]cpq.Group, len(model.Groups)),
		Options:     make([]cpq.Option, len(model.Options)),
		Rules:       make([]cpq.Rule, 0, len(model.Rules)+1),
		PriceRules:  make([]cpq.PriceRule, len(model.PriceRules)),
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   time.Now(),
		IsActive:    model.IsActive,
	}

	// Copy groups, options, and price rules
	copy(modifiedModel.Groups, model.Groups)
	copy(modifiedModel.Options, model.Options)
	copy(modifiedModel.PriceRules, model.PriceRules)

	// Apply rule changes
	switch changeType {
	case "add":
		modifiedModel.Rules = append(modifiedModel.Rules, model.Rules...)
		modifiedModel.Rules = append(modifiedModel.Rules, *newRule)
	case "modify":
		for _, rule := range model.Rules {
			if rule.ID != oldRule.ID {
				modifiedModel.Rules = append(modifiedModel.Rules, rule)
			}
		}
		modifiedModel.Rules = append(modifiedModel.Rules, *newRule)
	case "remove":
		for _, rule := range model.Rules {
			if rule.ID != oldRule.ID {
				modifiedModel.Rules = append(modifiedModel.Rules, rule)
			}
		}
	default:
		return nil, fmt.Errorf("unsupported change type: %s", changeType)
	}

	return modifiedModel, nil
}

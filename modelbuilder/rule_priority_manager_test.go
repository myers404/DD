// rule_priority_manager_test.go - Unit tests for rule priority management
package modelbuilder

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"DD/cpq"
)

func TestNewRulePriorityManager(t *testing.T) {
	model := createTestModelForPriorities()

	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create rule priority manager: %v", err)
	}

	if manager.model != model {
		t.Error("Manager should store reference to model")
	}

	if !manager.config.AutoAssignPriorities {
		t.Error("Default config should enable auto-assign priorities")
	}

	if manager.config.PriorityGap != 10 {
		t.Errorf("Expected priority gap 10, got %d", manager.config.PriorityGap)
	}

	if len(manager.config.RuleTypeBasePriorities) == 0 {
		t.Error("Manager should initialize rule type base priorities")
	}
}

func TestNewRulePriorityManagerWithNilModel(t *testing.T) {
	_, err := NewRulePriorityManager(nil)
	if err == nil {
		t.Error("Expected error with nil model")
	}
}

func TestNewRulePriorityManagerWithConfig(t *testing.T) {
	model := createTestModelForPriorities()
	customConfig := PriorityManagerConfig{
		AutoAssignPriorities: false,
		PriorityGap:          5,
		RuleTypeBasePriorities: map[cpq.RuleType]int{
			cpq.ValidationRule: 50,
			cpq.RequiresRule:   100,
		},
		ManualOverrides: map[string]int{"rule1": 25},
	}

	manager, err := NewRulePriorityManagerWithConfig(model, customConfig)
	if err != nil {
		t.Fatalf("Failed to create manager with config: %v", err)
	}

	if manager.config.AutoAssignPriorities {
		t.Error("Should use custom config value")
	}

	if manager.config.PriorityGap != 5 {
		t.Errorf("Expected priority gap 5, got %d", manager.config.PriorityGap)
	}

	if len(manager.config.ManualOverrides) != 1 {
		t.Error("Should preserve manual overrides from config")
	}
}

func TestAnalyzePriorities(t *testing.T) {
	model := createModelWithMixedPriorities()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	analysis, err := manager.AnalyzePriorities()
	if err != nil {
		t.Fatalf("Failed to analyze priorities: %v", err)
	}

	if analysis == nil {
		t.Fatal("Analysis should not be nil")
	}

	if analysis.TotalRules != len(model.Rules) {
		t.Errorf("Expected %d total rules, got %d", len(model.Rules), analysis.TotalRules)
	}

	if analysis.RulesWithPriorities+analysis.RulesWithoutPriorities != analysis.TotalRules {
		t.Error("Rules with and without priorities should sum to total")
	}

	if analysis.AnalysisTime <= 0 {
		t.Error("Analysis time should be positive")
	}

	if len(analysis.Assignments) != analysis.TotalRules {
		t.Error("Should have assignment for every rule")
	}

	if len(analysis.ExecutionOrder) != analysis.TotalRules {
		t.Error("Execution order should include all rules")
	}

	if len(analysis.Recommendations) == 0 {
		t.Error("Should provide recommendations")
	}
}

func TestDetectPriorityConflicts(t *testing.T) {
	model := createModelWithPriorityConflicts()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	conflicts := manager.detectPriorityConflicts()
	if len(conflicts) == 0 {
		t.Error("Should detect priority conflicts in test model")
	}

	// Check for duplicate priority conflicts
	foundDuplicate := false
	for _, conflict := range conflicts {
		if conflict.ConflictType == "duplicate" {
			foundDuplicate = true
			if len(conflict.AffectedRules) < 2 {
				t.Error("Duplicate priority conflict should affect multiple rules")
			}
			if conflict.Severity == "" {
				t.Error("Conflict should have severity")
			}
			if conflict.Message == "" {
				t.Error("Conflict should have message")
			}
			if conflict.Suggestion == "" {
				t.Error("Conflict should have suggestion")
			}
		}
	}

	if !foundDuplicate {
		t.Error("Should detect duplicate priority conflicts")
	}
}

func TestGeneratePriorityAssignments(t *testing.T) {
	model := createTestModelWithDifferentRuleTypes()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	assignments := manager.generatePriorityAssignments()
	if len(assignments) == 0 {
		t.Error("Should generate priority assignments")
	}

	if len(assignments) != len(model.Rules) {
		t.Errorf("Expected %d assignments, got %d", len(model.Rules), len(assignments))
	}

	// Check assignment structure
	for _, assignment := range assignments {
		if assignment.RuleID == "" {
			t.Error("Assignment should have rule ID")
		}
		if assignment.RuleName == "" {
			t.Error("Assignment should have rule name")
		}
		if assignment.RuleType == "" {
			t.Error("Assignment should have rule type")
		}
		if assignment.SuggestedPriority <= 0 {
			t.Error("Assignment should have positive suggested priority")
		}
		if assignment.AssignmentReason == "" {
			t.Error("Assignment should have reason")
		}
	}

	// Validate that assignments are sorted by priority
	for i := 1; i < len(assignments); i++ {
		if assignments[i].SuggestedPriority < assignments[i-1].SuggestedPriority {
			t.Error("Assignments should be sorted by suggested priority")
		}
	}

	// Check that validation rules get higher priority (lower numbers)
	validationPriority := -1
	requiresPriority := -1
	pricingPriority := -1

	for _, assignment := range assignments {
		switch assignment.RuleType {
		case string(cpq.ValidationRule):
			if validationPriority == -1 {
				validationPriority = assignment.SuggestedPriority
			}
		case string(cpq.RequiresRule):
			if requiresPriority == -1 {
				requiresPriority = assignment.SuggestedPriority
			}
		case string(cpq.PricingRule):
			if pricingPriority == -1 {
				pricingPriority = assignment.SuggestedPriority
			}
		}
	}

	if validationPriority > 0 && requiresPriority > 0 && validationPriority >= requiresPriority {
		t.Error("Validation rules should have higher priority than requires rules")
	}

	if requiresPriority > 0 && pricingPriority > 0 && requiresPriority >= pricingPriority {
		t.Error("Requires rules should have higher priority than pricing rules")
	}
}

func TestApplyPriorityAssignments(t *testing.T) {
	model := createTestModelForPriorities()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	// Generate assignments
	assignments := manager.generatePriorityAssignments()

	// Record original priorities
	originalPriorities := make(map[string]int)
	for _, rule := range model.Rules {
		originalPriorities[rule.ID] = rule.Priority
	}

	// Apply assignments
	err = manager.ApplyPriorityAssignments(assignments)
	if err != nil {
		t.Fatalf("Failed to apply priority assignments: %v", err)
	}

	// Verify assignments were applied
	for _, assignment := range assignments {
		// Find the rule in the model
		for _, rule := range model.Rules {
			if rule.ID == assignment.RuleID {
				if rule.Priority != assignment.SuggestedPriority {
					t.Errorf("Rule %s priority not applied correctly. Expected %d, got %d",
						rule.ID, assignment.SuggestedPriority, rule.Priority)
				}
				break
			}
		}
	}
}

func TestSetManualPriority(t *testing.T) {
	model := createTestModelForPriorities()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	ruleID := model.Rules[0].ID
	priority := 99

	// Set manual priority
	err = manager.SetManualPriority(ruleID, priority)
	if err != nil {
		t.Fatalf("Failed to set manual priority: %v", err)
	}

	// Verify manual override was set
	if manager.config.ManualOverrides[ruleID] != priority {
		t.Errorf("Expected manual override %d, got %d", priority, manager.config.ManualOverrides[ruleID])
	}

	// Test with non-existent rule
	err = manager.SetManualPriority("non_existent_rule", priority)
	if err == nil {
		t.Error("Expected error for non-existent rule")
	}

	// Test with negative priority
	err = manager.SetManualPriority(ruleID, -1)
	if err == nil {
		t.Error("Expected error for negative priority")
	}
}

func TestClearManualPriority(t *testing.T) {
	model := createTestModelForPriorities()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	ruleID := model.Rules[0].ID

	// Set manual priority
	manager.SetManualPriority(ruleID, 99)

	// Verify it was set
	if _, exists := manager.config.ManualOverrides[ruleID]; !exists {
		t.Error("Manual override should be set")
	}

	// Clear manual priority
	manager.ClearManualPriority(ruleID)

	// Verify it was cleared
	if _, exists := manager.config.ManualOverrides[ruleID]; exists {
		t.Error("Manual override should be cleared")
	}
}

func TestOptimizeExecutionOrder(t *testing.T) {
	model := createComplexModelForOptimization()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	analysis, err := manager.OptimizeExecutionOrder()
	if err != nil {
		t.Fatalf("Failed to optimize execution order: %v", err)
	}

	if analysis == nil {
		t.Fatal("Optimization analysis should not be nil")
	}

	if len(analysis.ExecutionOrder) != len(model.Rules) {
		t.Error("Optimized execution order should include all rules")
	}

	// Check that execution order follows priority order
	lastPriority := 0
	for _, ruleID := range analysis.ExecutionOrder {
		// Find assignment for this rule
		var assignment *PriorityAssignment
		for i := range analysis.Assignments {
			if analysis.Assignments[i].RuleID == ruleID {
				assignment = &analysis.Assignments[i]
				break
			}
		}

		if assignment == nil {
			t.Errorf("No assignment found for rule %s in execution order", ruleID)
			continue
		}

		if assignment.SuggestedPriority < lastPriority {
			t.Error("Execution order should follow priority order (ascending)")
		}
		lastPriority = assignment.SuggestedPriority
	}
}

func TestCalculateRuleComplexityScores(t *testing.T) {
	model := createModelWithComplexRules()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	scores := manager.calculateRuleComplexityScores()
	if len(scores) == 0 {
		t.Error("Should calculate complexity scores for rules")
	}

	if len(scores) != len(model.Rules) {
		t.Errorf("Expected %d complexity scores, got %d", len(model.Rules), len(scores))
	}

	// Check that all scores are positive
	for ruleID, score := range scores {
		if score <= 0 {
			t.Errorf("Complexity score for rule %s should be positive, got %f", ruleID, score)
		}
	}

	// Find simple and complex rules to verify scoring
	simpleRuleScore := -1.0
	complexRuleScore := -1.0

	for _, rule := range model.Rules {
		score := scores[rule.ID]
		if rule.Name == "Simple Rule" {
			simpleRuleScore = score
		} else if rule.Name == "Complex Rule" {
			complexRuleScore = score
		}
	}

	if simpleRuleScore > 0 && complexRuleScore > 0 && simpleRuleScore >= complexRuleScore {
		t.Error("Complex rules should have higher complexity scores than simple rules")
	}
}

func TestManualOverrideIntegration(t *testing.T) {
	model := createTestModelForPriorities()
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	ruleID := model.Rules[0].ID
	manualPriority := 5

	// Set manual priority
	err = manager.SetManualPriority(ruleID, manualPriority)
	if err != nil {
		t.Fatalf("Failed to set manual priority: %v", err)
	}

	// Generate assignments
	assignments := manager.generatePriorityAssignments()

	// Find the assignment for the rule with manual override
	var manualAssignment *PriorityAssignment
	for i := range assignments {
		if assignments[i].RuleID == ruleID {
			manualAssignment = &assignments[i]
			break
		}
	}

	if manualAssignment == nil {
		t.Fatal("Should find assignment for rule with manual override")
	}

	if manualAssignment.SuggestedPriority != manualPriority {
		t.Errorf("Expected manual priority %d, got %d", manualPriority, manualAssignment.SuggestedPriority)
	}

	if !manualAssignment.IsManualOverride {
		t.Error("Assignment should be marked as manual override")
	}

	if !strings.Contains(manualAssignment.AssignmentReason, "Manual") {
		t.Error("Assignment reason should indicate manual override")
	}
}

func TestPerformancePriorityManagement(t *testing.T) {
	// Test with larger model to verify performance requirements
	model := createLargeModelForPriorityTesting(50) // 50 rules
	manager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create manager: %v", err)
	}

	start := time.Now()
	analysis, err := manager.AnalyzePriorities()
	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to analyze priorities: %v", err)
	}

	// Should meet performance target of <200ms for 50+ rules
	if elapsed > 200*time.Millisecond {
		t.Errorf("Performance target missed: took %v, expected <200ms", elapsed)
	}

	if analysis.AnalysisTime <= 0 {
		t.Error("Analysis time should be recorded")
	}

	t.Logf("Performance test: analyzed %d rules in %v", analysis.TotalRules, elapsed)
}

// Helper functions for creating test models

func createTestModelForPriorities() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Test Model for Priorities"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 200},
		{ID: "opt_c", Name: "Option C", Price: 300},
	}

	// Add rules without priorities
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_validation",
			Name:       "Validation Rule",
			Expression: "opt_a",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_requires",
			Name:       "Requires Rule",
			Expression: "opt_a -> opt_b",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_pricing",
			Name:       "Pricing Rule",
			Expression: "opt_c -> price + 50",
			Type:       cpq.PricingRule,
		},
	}

	return model
}

func createModelWithMixedPriorities() *cpq.Model {
	model := createTestModelForPriorities()

	// Set some priorities
	model.Rules[0].Priority = 10 // Validation rule
	model.Rules[1].Priority = 0  // No priority
	model.Rules[2].Priority = 30 // Pricing rule

	return model
}

func createModelWithPriorityConflicts() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Priority Conflicts"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 200},
	}

	// Add rules with duplicate priorities
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_1",
			Name:       "Rule 1",
			Expression: "opt_a",
			Type:       cpq.ValidationRule,
			Priority:   10, // Duplicate priority
		},
		{
			ID:         "rule_2",
			Name:       "Rule 2",
			Expression: "opt_b",
			Type:       cpq.RequiresRule,
			Priority:   10, // Duplicate priority
		},
		{
			ID:         "rule_3",
			Name:       "Rule 3",
			Expression: "opt_a -> opt_b",
			Type:       cpq.RequiresRule,
			Priority:   100, // Large gap from 10 to 100
		},
	}

	return model
}

func createTestModelWithDifferentRuleTypes() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Different Rule Types"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 200},
		{ID: "opt_c", Name: "Option C", Price: 300},
	}

	// Add rules of different types
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_validation_1",
			Name:       "Validation Rule 1",
			Expression: "opt_a",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_validation_2",
			Name:       "Validation Rule 2",
			Expression: "opt_b",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_requires_1",
			Name:       "Requires Rule 1",
			Expression: "opt_a -> opt_b",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_excludes_1",
			Name:       "Excludes Rule 1",
			Expression: "opt_a -> !opt_c",
			Type:       cpq.ExcludesRule,
		},
		{
			ID:         "rule_pricing_1",
			Name:       "Pricing Rule 1",
			Expression: "opt_c -> price + 100",
			Type:       cpq.PricingRule,
		},
	}

	return model
}

func createComplexModelForOptimization() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Complex Model for Optimization"

	// Add many options
	for i := 0; i < 10; i++ {
		model.Options = append(model.Options, cpq.Option{
			ID:    fmt.Sprintf("opt_%d", i),
			Name:  fmt.Sprintf("Option %d", i),
			Price: float64(100 * (i + 1)),
		})
	}

	// Add rules with dependencies
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_val_1",
			Name:       "Simple Validation",
			Expression: "opt_0",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_complex_val",
			Name:       "Complex Validation",
			Expression: "(opt_1 AND opt_2) OR (opt_3 AND NOT opt_4)",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_req_1",
			Name:       "Simple Requirement",
			Expression: "opt_0 -> opt_1",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_complex_req",
			Name:       "Complex Requirement",
			Expression: "(opt_2 AND opt_3) -> (opt_4 OR opt_5)",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_pricing_simple",
			Name:       "Simple Pricing",
			Expression: "opt_6 -> price + 50",
			Type:       cpq.PricingRule,
		},
	}

	return model
}

func createModelWithComplexRules() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Model with Complex Rules"

	// Add options
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100},
		{ID: "opt_b", Name: "Option B", Price: 200},
		{ID: "opt_c", Name: "Option C", Price: 300},
		{ID: "opt_d", Name: "Option D", Price: 400},
	}

	// Add rules with varying complexity
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_simple",
			Name:       "Simple Rule",
			Expression: "opt_a",
			Type:       cpq.ValidationRule,
		},
		{
			ID:         "rule_complex",
			Name:       "Complex Rule",
			Expression: "((opt_a AND opt_b) OR (opt_c AND NOT opt_d)) -> (opt_a OR opt_b)",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_medium",
			Name:       "Medium Rule",
			Expression: "opt_a AND opt_b -> opt_c",
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createLargeModelForPriorityTesting(ruleCount int) *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Large Model for Priority Testing"

	// Add options
	for i := 0; i < ruleCount; i++ {
		model.Options = append(model.Options, cpq.Option{
			ID:    fmt.Sprintf("opt_%d", i),
			Name:  fmt.Sprintf("Option %d", i),
			Price: float64(100 + i),
		})
	}

	// Add rules of different types
	ruleTypes := []cpq.RuleType{
		cpq.ValidationRule,
		cpq.RequiresRule,
		cpq.ExcludesRule,
		cpq.PricingRule,
	}

	for i := 0; i < ruleCount; i++ {
		ruleType := ruleTypes[i%len(ruleTypes)]

		model.Rules = append(model.Rules, cpq.Rule{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Expression: fmt.Sprintf("opt_%d", i),
			Type:       ruleType,
			Priority:   0, // No initial priority
		})
	}

	return model
}

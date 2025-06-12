// conflict_detector_test.go - Unit tests for rule conflict detection
package modelbuilder

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"DD/cpq"
)

func TestNewConflictDetector(t *testing.T) {
	model := createTestModel()

	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	if detector.model != model {
		t.Error("Detector should store reference to model")
	}

	if detector.mtbdd == nil {
		t.Error("Detector should initialize MTBDD")
	}

	if detector.constraintEngine == nil {
		t.Error("Detector should initialize constraint engine")
	}

	if len(detector.ruleConditions) == 0 {
		t.Error("Detector should compile rule conditions")
	}
}

func TestNewConflictDetectorWithNilModel(t *testing.T) {
	_, err := NewConflictDetector(nil)
	if err == nil {
		t.Error("Expected error with nil model")
	}
}

func TestDetectConflicts(t *testing.T) {
	model := createModelWithConflicts()
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	result, err := detector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	if result == nil {
		t.Fatal("Result should not be nil")
	}

	if result.TotalRulesAnalyzed != len(model.Rules) {
		t.Errorf("Expected %d rules analyzed, got %d", len(model.Rules), result.TotalRulesAnalyzed)
	}

	if result.AnalysisTime <= 0 {
		t.Error("Analysis time should be positive")
	}

	if len(result.Recommendations) == 0 {
		t.Error("Should have recommendations")
	}

	// Should detect at least some conflicts in test model
	if result.ConflictsFound == 0 {
		t.Error("Expected to find conflicts in test model")
	}
}

func TestDetectConflictsWithNoConflicts(t *testing.T) {
	model := createModelWithoutConflicts()
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	result, err := detector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	if result.ConflictsFound != 0 {
		t.Errorf("Expected no conflicts, found %d", result.ConflictsFound)
	}

	if result.CriticalConflicts != 0 {
		t.Errorf("Expected no critical conflicts, found %d", result.CriticalConflicts)
	}

	// Should still have recommendations (even if just "no conflicts found")
	if len(result.Recommendations) == 0 {
		t.Error("Should have recommendations even with no conflicts")
	}
}

func TestParseRuleExpression(t *testing.T) {
	model := createTestModel()
	detector, _ := NewConflictDetector(model)

	tests := []struct {
		expression string
		condition  string
		action     string
	}{
		{
			expression: "opt_cpu_high -> opt_cooling_liquid",
			condition:  "opt_cpu_high",
			action:     "opt_cooling_liquid",
		},
		{
			expression: "opt_tier_budget -> !opt_support_premium",
			condition:  "opt_tier_budget",
			action:     "!opt_support_premium",
		},
		{
			expression: "opt_simple_condition",
			condition:  "opt_simple_condition",
			action:     "",
		},
	}

	for _, test := range tests {
		condition, action := detector.parseRuleExpression(test.expression)
		if condition != test.condition {
			t.Errorf("Expected condition '%s', got '%s'", test.condition, condition)
		}
		if action != test.action {
			t.Errorf("Expected action '%s', got '%s'", test.action, action)
		}
	}
}

func TestActionsContradict(t *testing.T) {
	model := createTestModel()
	detector, _ := NewConflictDetector(model)

	// Set up test rule actions
	detector.ruleActions["rule1"] = "opt_cooling_liquid"
	detector.ruleActions["rule2"] = "!opt_cooling_liquid"
	detector.ruleActions["rule3"] = "opt_cpu_upgrade"
	detector.ruleActions["rule4"] = "opt_cooling_liquid"

	rule1 := cpq.Rule{ID: "rule1", Name: "Rule 1"}
	rule2 := cpq.Rule{ID: "rule2", Name: "Rule 2"}
	rule3 := cpq.Rule{ID: "rule3", Name: "Rule 3"}
	rule4 := cpq.Rule{ID: "rule4", Name: "Rule 4"}

	// Test contradictory actions
	if !detector.actionsContradict(rule1, rule2) {
		t.Error("Should detect contradiction between requires and excludes for same target")
	}

	// Test non-contradictory actions
	if detector.actionsContradict(rule1, rule3) {
		t.Error("Should not detect contradiction between different targets")
	}

	// Test identical actions
	if detector.actionsContradict(rule1, rule4) {
		t.Error("Should not detect contradiction between identical actions")
	}
}

func TestExtractActionTarget(t *testing.T) {
	model := createTestModel()
	detector, _ := NewConflictDetector(model)

	tests := []struct {
		action   string
		expected string
	}{
		{"opt_cooling_liquid", "opt_cooling_liquid"},
		{"!opt_premium_support", "opt_premium_support"},
		{"invalid", "invalid"},
		{"", ""},
	}

	for _, test := range tests {
		result := detector.extractActionTarget(test.action)
		if result != test.expected {
			t.Errorf("Expected target '%s' for action '%s', got '%s'",
				test.expected, test.action, result)
		}
	}
}

func TestGenerateRecommendations2(t *testing.T) {
	model := createTestModel()
	detector, _ := NewConflictDetector(model)

	// Test with no conflicts
	noConflicts := []RuleConflict{}
	recommendations := detector.generateRecommendations(noConflicts)
	if len(recommendations) != 1 {
		t.Errorf("Expected 1 recommendation for no conflicts, got %d", len(recommendations))
	}
	if recommendations[0] != "No conflicts detected - model rules are consistent" {
		t.Error("Should recommend no conflicts detected")
	}

	// Test with various conflict types
	conflicts := []RuleConflict{
		{ConflictType: "direct_contradiction", Severity: "critical"},
		{ConflictType: "direct_contradiction", Severity: "critical"},
		{ConflictType: "circular_dependency", Severity: "critical"},
		{ConflictType: "impossible_constraint", Severity: "warning"},
	}

	recommendations = detector.generateRecommendations(conflicts)
	if len(recommendations) < 3 {
		t.Errorf("Expected at least 3 recommendations for mixed conflicts, got %d", len(recommendations))
	}

	// Should include type-specific recommendations
	hasContradictionRec := false
	hasCircularRec := false
	hasPriorityRec := false

	for _, rec := range recommendations {
		if containsString(rec, "contradiction") {
			hasContradictionRec = true
		}
		if containsString(rec, "circular") {
			hasCircularRec = true
		}
		if containsString(rec, "PRIORITY") || containsString(rec, "critical") {
			hasPriorityRec = true
		}
	}

	if !hasContradictionRec {
		t.Error("Should include contradiction-specific recommendation")
	}
	if !hasCircularRec {
		t.Error("Should include circular dependency recommendation")
	}
	if !hasPriorityRec {
		t.Error("Should include priority recommendation for critical conflicts")
	}
}

func TestDetectDirectContradictions(t *testing.T) {
	model := createModelWithDirectContradictions()
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	conflicts, err := detector.detectDirectContradictions()
	if err != nil {
		t.Fatalf("Failed to detect direct contradictions: %v", err)
	}

	// Should find contradictions in test model
	if len(conflicts) == 0 {
		t.Error("Expected to find direct contradictions")
	}

	// Verify conflict structure
	for _, conflict := range conflicts {
		if conflict.ConflictType != "direct_contradiction" {
			t.Errorf("Expected conflict type 'direct_contradiction', got '%s'", conflict.ConflictType)
		}
		if len(conflict.ConflictingRules) != 2 {
			t.Errorf("Expected 2 conflicting rules, got %d", len(conflict.ConflictingRules))
		}
		if conflict.Severity != "critical" {
			t.Errorf("Expected critical severity, got '%s'", conflict.Severity)
		}
		if conflict.DetectedAt.IsZero() {
			t.Error("DetectedAt should be set")
		}
	}
}

func TestPerformance(t *testing.T) {
	// Test with larger model to verify performance requirements
	model := createLargeTestModel(50) // 50 rules
	detector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	start := time.Now()
	result, err := detector.DetectConflicts()
	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	// Should meet performance target of <200ms for 50+ rules
	if elapsed > 200*time.Millisecond {
		t.Errorf("Performance target missed: took %v, expected <200ms", elapsed)
	}

	if result.AnalysisTime <= 0 {
		t.Error("Analysis time should be recorded")
	}

	t.Logf("Performance test: analyzed %d rules in %v", result.TotalRulesAnalyzed, elapsed)
}

// Helper functions for creating test models

func createTestModel() *cpq.Model {
	model := cpq.NewModel("test_model", "Test Model")

	// Add basic groups and options
	model.Groups = []cpq.Group{
		{ID: "cpu", Name: "CPU", Type: cpq.SingleSelect},
		{ID: "cooling", Name: "Cooling", Type: cpq.SingleSelect},
		{ID: "support", Name: "Support", Type: cpq.Optional},
	}

	model.Options = []cpq.Option{
		{ID: "cpu_basic", Name: "Basic CPU", GroupID: "cpu", BasePrice: 100},
		{ID: "cpu_high", Name: "High-end CPU", GroupID: "cpu", BasePrice: 500},
		{ID: "cooling_air", Name: "Air Cooling", GroupID: "cooling", BasePrice: 50},
		{ID: "cooling_liquid", Name: "Liquid Cooling", GroupID: "cooling", BasePrice: 150},
		{ID: "premium_support", Name: "Premium Support", GroupID: "support", BasePrice: 200},
	}

	model.Rules = []cpq.Rule{
		{ID: "rule1", Name: "High CPU requires liquid cooling",
			Expression: "opt_cpu_high -> opt_cooling_liquid",
			Message:    "High-end CPU requires liquid cooling",
			Type:       cpq.RequiresRule},
		{ID: "rule2", Name: "Basic CPU excludes liquid cooling",
			Expression: "opt_cpu_basic -> !opt_cooling_liquid",
			Message:    "Basic CPU excludes liquid cooling",
			Type:       cpq.ExcludesRule},
	}

	return model
}

func createModelWithConflicts() *cpq.Model {
	model := createTestModel()

	// Add conflicting rules
	model.Rules = append(model.Rules, []cpq.Rule{
		{ID: "rule3", Name: "Budget excludes premium support",
			Expression: "budget_tier -> !excludes premium_support", Type: cpq.ExcludesRule},
		{ID: "rule4", Name: "High CPU requires premium support",
			Expression: "cpu_high -> premium_support", Type: cpq.RequiresRule},
	}...)

	return model
}

func createModelWithoutConflicts() *cpq.Model {
	model := cpq.NewModel("clean_model", "Clean Model")

	model.Groups = []cpq.Group{
		{ID: "cpu", Name: "CPU", Type: cpq.SingleSelect},
		{ID: "memory", Name: "Memory", Type: cpq.SingleSelect},
	}

	model.Options = []cpq.Option{
		{ID: "cpu_basic", Name: "Basic CPU", GroupID: "cpu", BasePrice: 100},
		{ID: "cpu_high", Name: "High-end CPU", GroupID: "cpu", BasePrice: 500},
		{ID: "mem_8gb", Name: "8GB Memory", GroupID: "memory", BasePrice: 100},
		{ID: "mem_16gb", Name: "16GB Memory", GroupID: "memory", BasePrice: 200},
	}

	model.Rules = []cpq.Rule{
		{ID: "rule1", Name: "Rule allows high memory",
			Expression: "opt_cpu_high -> opt_mem_16gb",
			Message:    "High-end CPU allows 16GB memory",
			Type:       cpq.RequiresRule},
	}

	return model
}

func createModelWithDirectContradictions() *cpq.Model {
	model := createTestModel()

	// Create rules that directly contradict each other
	model.Rules = []cpq.Rule{
		{ID: "rule1", Name: "Rule requires cooling",
			Expression: "opt_cpu_high -> opt_cooling_liquid",
			Message:    "High-end CPU requires liquid cooling",
			Type:       cpq.RequiresRule},
		{ID: "rule2", Name: "Rule excludes cooling",
			Expression: "opt_cpu_high -> !opt_cooling_liquid",
			Message:    "High-end CPU excludes liquid cooling",
			Type:       cpq.ExcludesRule},
	}

	return model
}

func createLargeTestModel(numRules int) *cpq.Model {
	model := cpq.NewModel("large_model", "Large Test Model")

	// Create groups and options
	model.Groups = []cpq.Group{
		{ID: "group1", Name: "Group 1", Type: cpq.MultiSelect},
		{ID: "group2", Name: "Group 2", Type: cpq.SingleSelect},
		{ID: "group3", Name: "Group 3", Type: cpq.Optional},
	}

	// Create many options
	for i := 0; i < numRules; i++ {
		groupID := "group1"
		if i%3 == 1 {
			groupID = "group2"
		} else if i%3 == 2 {
			groupID = "group3"
		}

		option := cpq.Option{
			ID:        fmt.Sprintf("option_%d", i),
			Name:      fmt.Sprintf("Option %d", i),
			GroupID:   groupID,
			BasePrice: float64(100 + i*10),
		}
		model.Options = append(model.Options, option)
	}

	// Create many rules with potential conflicts
	for i := 0; i < numRules; i++ {
		rule := cpq.Rule{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Expression: fmt.Sprintf("option_%d -> option_%d", i, (i+1)%numRules),
			Type:       cpq.RequiresRule,
		}
		model.Rules = append(model.Rules, rule)
	}

	return model
}

// Utility function
func containsString(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || (len(s) > len(substr) &&
		(s[:len(substr)] == substr || s[len(s)-len(substr):] == substr ||
			strings.Contains(s, substr))))
}

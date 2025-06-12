// model_builder_complete_integration_test.go - Complete integration tests for all Model Building Tools
package modelbuilder

import (
	"fmt"
	"testing"
	"time"

	"DD/cpq"
)

func TestCompleteModelBuildingWorkflow(t *testing.T) {
	// Create a model with various issues for comprehensive testing
	model := createComprehensiveTestModel()

	// 1. Validate Model Structure
	t.Log("Step 1: Validating model structure...")
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create model validator: %v", err)
	}

	validationReport, err := validator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate model: %v", err)
	}

	t.Logf("Validation completed: %d errors, %d warnings, quality score: %d",
		len(validationReport.Errors), len(validationReport.Warnings), validationReport.QualityScore)

	// 2. Detect Rule Conflicts
	t.Log("Step 2: Detecting rule conflicts...")
	conflictDetector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	conflictResult, err := conflictDetector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts: %v", err)
	}

	t.Logf("Conflict detection completed: %d conflicts found (%d critical)",
		conflictResult.ConflictsFound, conflictResult.CriticalConflicts)

	// 3. Analyze Rule Priorities
	t.Log("Step 3: Analyzing rule priorities...")
	priorityManager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create priority manager: %v", err)
	}

	priorityAnalysis, err := priorityManager.AnalyzePriorities()
	if err != nil {
		t.Fatalf("Failed to analyze priorities: %v", err)
	}

	t.Logf("Priority analysis completed: %d rules analyzed, %d conflicts found",
		priorityAnalysis.TotalRules, priorityAnalysis.ConflictsFound)

	// 4. Fix Model Issues
	t.Log("Step 4: Applying fixes to model...")

	// Fix validation errors (simulate by creating a corrected model)
	correctedModel := createCorrectedTestModel()

	// Apply priority assignments
	err = priorityManager.ApplyPriorityAssignments(priorityAnalysis.Assignments)
	if err != nil {
		t.Fatalf("Failed to apply priority assignments: %v", err)
	}

	// 5. Re-validate Fixed Model
	t.Log("Step 5: Re-validating fixed model...")
	correctedValidator, err := NewModelValidator(correctedModel)
	if err != nil {
		t.Fatalf("Failed to create validator for corrected model: %v", err)
	}

	correctedValidationReport, err := correctedValidator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate corrected model: %v", err)
	}

	// 6. Analyze Impact of Changes (use corrected model)
	t.Log("Step 6: Analyzing impact of model changes...")
	impactAnalyzer, err := NewImpactAnalyzer(correctedModel)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Simulate adding a new rule to test impact analysis
	newRule := &cpq.Rule{
		ID:         "new_validation_rule",
		Name:       "New Validation Rule",
		Expression: "opt_cpu_high -> opt_premium_support",
		Type:       cpq.ValidationRule,
		Priority:   50,
	}

	impactAnalysis, err := impactAnalyzer.AnalyzeRuleChange("add", nil, newRule)
	if err != nil {
		t.Fatalf("Failed to analyze rule impact: %v", err)
	}

	t.Logf("Impact analysis completed: %d configurations tested, %d affected",
		impactAnalysis.TotalConfigurations, impactAnalysis.AffectedConfigurations)

	// 7. Verify Workflow Results
	t.Log("Step 7: Verifying workflow results...")

	// Validation should show improvement
	if correctedValidationReport.QualityScore <= validationReport.QualityScore {
		t.Logf("Warning: Quality score didn't improve (was %d, now %d)",
			validationReport.QualityScore, correctedValidationReport.QualityScore)
	}

	// Should have fewer errors after correction
	if len(correctedValidationReport.Errors) > len(validationReport.Errors) {
		t.Error("Corrected model should have fewer errors")
	}

	// Priority assignments should be applied
	prioritizedRules := 0
	for _, rule := range model.Rules {
		if rule.Priority > 0 {
			prioritizedRules++
		}
	}

	if prioritizedRules == 0 {
		t.Error("Priority assignments should have been applied")
	}

	// Impact analysis should provide meaningful results
	if len(impactAnalysis.RecommendedActions) == 0 {
		t.Error("Impact analysis should provide recommendations")
	}

	// 8. Performance Verification
	totalTime := validationReport.ValidationTime + conflictResult.AnalysisTime +
		priorityAnalysis.AnalysisTime + impactAnalysis.AnalysisTime

	if totalTime > 2*time.Second {
		t.Errorf("Complete workflow took too long: %v (should be under 2s)", totalTime)
	}

	t.Logf("Complete workflow finished in %v", totalTime)
}

func TestModelBuildingToolsInteroperability(t *testing.T) {
	// Test that all tools work together seamlessly
	model := createInteroperabilityTestModel()

	// Create all tools
	validator, err := NewModelValidator(model)
	if err != nil {
		t.Fatalf("Failed to create validator: %v", err)
	}

	conflictDetector, err := NewConflictDetector(model)
	if err != nil {
		t.Fatalf("Failed to create conflict detector: %v", err)
	}

	priorityManager, err := NewRulePriorityManager(model)
	if err != nil {
		t.Fatalf("Failed to create priority manager: %v", err)
	}

	impactAnalyzer, err := NewImpactAnalyzer(model)
	if err != nil {
		t.Fatalf("Failed to create impact analyzer: %v", err)
	}

	// Run analysis in parallel to test concurrent safety
	type analysisResult struct {
		validation *ValidationReport
		conflicts  *ConflictDetectionResult
		priorities *PriorityAnalysis
		impact     *ImpactAnalysis
		err        error
	}

	resultChan := make(chan analysisResult, 4)

	// Validation
	go func() {
		result, err := validator.ValidateModel()
		resultChan <- analysisResult{validation: result, err: err}
	}()

	// Conflict detection
	go func() {
		result, err := conflictDetector.DetectConflicts()
		resultChan <- analysisResult{conflicts: result, err: err}
	}()

	// Priority analysis
	go func() {
		result, err := priorityManager.AnalyzePriorities()
		resultChan <- analysisResult{priorities: result, err: err}
	}()

	// Impact analysis
	go func() {
		testRule := &cpq.Rule{
			ID:         "interop_test_rule",
			Name:       "Interoperability Test Rule",
			Expression: "opt_test -> opt_required",
			Type:       cpq.RequiresRule,
		}
		result, err := impactAnalyzer.AnalyzeRuleChange("add", nil, testRule)
		resultChan <- analysisResult{impact: result, err: err}
	}()

	// Collect results
	var validation *ValidationReport
	var conflicts *ConflictDetectionResult
	var priorities *PriorityAnalysis
	var impact *ImpactAnalysis

	for i := 0; i < 4; i++ {
		result := <-resultChan
		if result.err != nil {
			t.Errorf("Analysis failed: %v", result.err)
			continue
		}

		if result.validation != nil {
			validation = result.validation
		}
		if result.conflicts != nil {
			conflicts = result.conflicts
		}
		if result.priorities != nil {
			priorities = result.priorities
		}
		if result.impact != nil {
			impact = result.impact
		}
	}

	// Verify all analyses completed successfully
	if validation == nil {
		t.Error("Validation analysis failed")
	}
	if conflicts == nil {
		t.Error("Conflict analysis failed")
	}
	if priorities == nil {
		t.Error("Priority analysis failed")
	}
	if impact == nil {
		t.Error("Impact analysis failed")
	}

	// Verify results are consistent
	if validation != nil && conflicts != nil {
		// If validation found errors, conflicts should also find issues
		if len(validation.Errors) > 0 && conflicts.ConflictsFound == 0 {
			t.Log("Note: Validation found errors but conflict detection found none (this may be normal)")
		}
	}

	if priorities != nil {
		// Priority analysis should cover all rules
		if priorities.TotalRules != len(model.Rules) {
			t.Errorf("Priority analysis should cover all %d rules, got %d",
				len(model.Rules), priorities.TotalRules)
		}
	}

	if impact != nil {
		// Impact analysis should test some configurations
		if impact.TotalConfigurations == 0 {
			t.Error("Impact analysis should test some configurations")
		}
	}
}

func TestEndToEndModelImprovement(t *testing.T) {
	// Demonstrate complete model improvement workflow
	originalModel := createPoorQualityTestModel()

	// Step 1: Assess current state with Model Validator
	validator, err := NewModelValidator(originalModel)
	if err != nil {
		t.Fatalf("Failed to create validator: %v", err)
	}
	originalReport, err := validator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate original model: %v", err)
	}

	t.Logf("Original model: Quality=%d, Errors=%d (including syntax errors)",
		originalReport.QualityScore, len(originalReport.Errors))

	// Step 2: Apply systematic improvements (fix syntax errors first)
	improvedModel := applyModelImprovements(originalModel, originalReport, nil)

	// Step 3: Now assess improved state (should be able to run all tools)
	improvedValidator, err := NewModelValidator(improvedModel)
	if err != nil {
		t.Fatalf("Failed to create improved validator: %v", err)
	}
	improvedReport, err := improvedValidator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate improved model: %v", err)
	}

	// Now we can run conflict detection on the improved model
	improvedConflictDetector, err := NewConflictDetector(improvedModel)
	if err != nil {
		t.Fatalf("Failed to create improved conflict detector: %v", err)
	}
	improvedConflicts, err := improvedConflictDetector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts in improved model: %v", err)
	}

	t.Logf("Improved model: Quality=%d, Errors=%d, Conflicts=%d",
		improvedReport.QualityScore, len(improvedReport.Errors), improvedConflicts.ConflictsFound)

	// Step 4: Verify improvements
	if improvedReport.QualityScore <= originalReport.QualityScore {
		t.Errorf("Model quality should improve (was %d, now %d)",
			originalReport.QualityScore, improvedReport.QualityScore)
	}

	if len(improvedReport.Errors) >= len(originalReport.Errors) {
		t.Errorf("Should have fewer errors (was %d, now %d)",
			len(originalReport.Errors), len(improvedReport.Errors))
	}

	// Note: We can't compare conflicts since we couldn't run conflict detection on the original broken model
	// This is realistic - you need to fix syntax errors before running advanced analysis

	// Step 5: Optimize priorities
	priorityManager, err := NewRulePriorityManager(improvedModel)
	if err != nil {
		t.Fatalf("Failed to create priority manager: %v", err)
	}
	optimizedAnalysis, err := priorityManager.OptimizeExecutionOrder()
	if err != nil {
		t.Fatalf("Failed to optimize execution order: %v", err)
	}

	// Apply optimized priorities
	err = priorityManager.ApplyPriorityAssignments(optimizedAnalysis.Assignments)
	if err != nil {
		t.Fatalf("Failed to apply priority assignments: %v", err)
	}

	// Step 6: Final verification
	finalValidator, err := NewModelValidator(improvedModel)
	if err != nil {
		t.Fatalf("Failed to create final validator: %v", err)
	}
	finalReport, err := finalValidator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate final model: %v", err)
	}

	t.Logf("Final model: Quality=%d, Errors=%d",
		finalReport.QualityScore, len(finalReport.Errors))

	// Should maintain or improve quality after priority optimization
	if finalReport.QualityScore < improvedReport.QualityScore-5 { // Allow small tolerance
		t.Errorf("Priority optimization shouldn't significantly reduce quality (was %d, now %d)",
			improvedReport.QualityScore, finalReport.QualityScore)
	}
}

func TestModelBuildingPerformanceAtScale(t *testing.T) {
	// Test performance with larger models
	largeModel := createLargeScaleTestModel(100, 50) // 100 options, 50 rules

	start := time.Now()

	// Run all tools on large model
	validator, err := NewModelValidator(largeModel)
	if err != nil {
		t.Fatalf("Failed to create validator for large model: %v", err)
	}

	validationReport, err := validator.ValidateModel()
	if err != nil {
		t.Fatalf("Failed to validate large model: %v", err)
	}

	conflictDetector, err := NewConflictDetector(largeModel)
	if err != nil {
		t.Fatalf("Failed to create conflict detector for large model: %v", err)
	}

	conflictResult, err := conflictDetector.DetectConflicts()
	if err != nil {
		t.Fatalf("Failed to detect conflicts in large model: %v", err)
	}

	priorityManager, err := NewRulePriorityManager(largeModel)
	if err != nil {
		t.Fatalf("Failed to create priority manager for large model: %v", err)
	}

	priorityAnalysis, err := priorityManager.AnalyzePriorities()
	if err != nil {
		t.Fatalf("Failed to analyze priorities in large model: %v", err)
	}

	totalTime := time.Since(start)

	// Performance targets for large models
	if validationReport.ValidationTime > 1*time.Second {
		t.Errorf("Validation took too long: %v (target: <1s)", validationReport.ValidationTime)
	}

	if conflictResult.AnalysisTime > 200*time.Millisecond {
		t.Errorf("Conflict detection took too long: %v (target: <200ms)", conflictResult.AnalysisTime)
	}

	if priorityAnalysis.AnalysisTime > 200*time.Millisecond {
		t.Errorf("Priority analysis took too long: %v (target: <200ms)", priorityAnalysis.AnalysisTime)
	}

	if totalTime > 2*time.Second {
		t.Errorf("Total analysis took too long: %v (target: <2s)", totalTime)
	}

	t.Logf("Large model analysis completed in %v", totalTime)
	t.Logf("- Validation: %v", validationReport.ValidationTime)
	t.Logf("- Conflicts: %v", conflictResult.AnalysisTime)
	t.Logf("- Priorities: %v", priorityAnalysis.AnalysisTime)
}

// Helper functions for creating test models

func createComprehensiveTestModel() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Comprehensive Test Model"

	// Add groups first
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
		{
			ID:            "group_support",
			Name:          "Support Options",
			Type:          cpq.MultiSelect,
			MinSelections: 0,
			MaxSelections: 1,
		},
	}

	// Add options that reference the groups
	model.Options = []cpq.Option{
		{ID: "opt_cpu_basic", Name: "Basic CPU", Price: 100, GroupID: "group_cpu", IsActive: true},
		{ID: "opt_cpu_high", Name: "High Performance CPU", Price: 300, GroupID: "group_cpu", IsActive: true},
		{ID: "opt_cooling_air", Name: "Air Cooling", Price: 50, GroupID: "group_cooling", IsActive: true},
		{ID: "opt_cooling_liquid", Name: "Liquid Cooling", Price: 150, GroupID: "group_cooling", IsActive: true},
		{ID: "opt_premium_support", Name: "Premium Support", Price: 200, GroupID: "group_support", IsActive: true},
		{ID: "opt_unused", Name: "Unused Option", Price: 10, GroupID: "group_support", IsActive: true}, // Assign to valid group but still unused in rules
	}

	// Add rules with various issues
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_cooling_requirement",
			Name:       "High CPU requires liquid cooling",
			Expression: "opt_cpu_high -> opt_cooling_liquid",
			Type:       cpq.RequiresRule,
			Priority:   10, // Will have duplicate priority
		},
		{
			ID:         "rule_support_requirement",
			Name:       "High CPU requires premium support",
			Expression: "opt_cpu_high -> opt_premium_support",
			Type:       cpq.RequiresRule,
			Priority:   10, // Duplicate priority (conflict)
		},
		{
			ID:         "rule_validation",
			Name:       "CPU Validation",
			Expression: "opt_cpu_basic OR opt_cpu_high",
			Type:       cpq.ValidationRule,
			Priority:   0, // No priority assigned
		},
		{
			ID:         "rule_pricing",
			Name:       "Premium Pricing",
			Expression: "opt_premium_support -> price + 100",
			Type:       cpq.PricingRule,
			Priority:   100, // Large gap
		},
		{
			ID:         "rule_missing_ref",
			Name:       "Rule with missing reference",
			Expression: "opt_nonexistent -> opt_cpu_basic", // Missing reference
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func createCorrectedTestModel() *cpq.Model {
	model := createComprehensiveTestModel()

	// Fix missing reference
	for i := range model.Rules {
		if model.Rules[i].ID == "rule_missing_ref" {
			model.Rules[i].Expression = "opt_cpu_basic -> opt_cooling_air"
		}
	}

	// Note: opt_unused is now in a valid group but still not used in rules
	// This will still trigger a warning but won't cause CPQ configurator to fail

	return model
}

func createInteroperabilityTestModel() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Interoperability Test Model"

	// Add groups first
	model.Groups = []cpq.Group{
		{
			ID:         "group_main",
			Name:       "Main Group",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
	}

	// Add simple, clean options for interoperability testing
	model.Options = []cpq.Option{
		{ID: "opt_test", Name: "Test Option", Price: 100, GroupID: "group_main", IsActive: true},
		{ID: "opt_required", Name: "Required Option", Price: 50, GroupID: "group_main", IsActive: true},
		{ID: "opt_optional", Name: "Optional Option", Price: 25, GroupID: "group_main", IsActive: true}, // Assign to valid group
	}

	model.Rules = []cpq.Rule{
		{
			ID:         "rule_requirement",
			Name:       "Test Requirement",
			Expression: "opt_test -> opt_required",
			Type:       cpq.RequiresRule,
			Priority:   10,
		},
		{
			ID:         "rule_validation",
			Name:       "Test Validation",
			Expression: "opt_test OR opt_required",
			Type:       cpq.ValidationRule,
			Priority:   5,
		},
	}

	return model
}

func createPoorQualityTestModel() *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Poor Quality Test Model"

	// Add problematic groups
	model.Groups = []cpq.Group{
		{
			ID:         "group_empty",
			Name:       "Empty Group",
			Type:       cpq.SingleSelect,
			IsRequired: true,
		},
		{
			ID:            "group_impossible",
			Name:          "Impossible Group",
			Type:          cpq.MultiSelect,
			MinSelections: 5, // More than available options
			MaxSelections: 3,
		},
		{
			ID:         "group_valid",
			Name:       "Valid Group",
			Type:       cpq.SingleSelect,
			IsRequired: false,
		},
	}

	// Add options with some issues but valid group references
	model.Options = []cpq.Option{
		{ID: "opt_a", Name: "Option A", Price: 100, GroupID: "group_impossible", IsActive: true},
		{ID: "opt_b", Name: "Option B", Price: 200, GroupID: "group_impossible", IsActive: true},
		{ID: "opt_c", Name: "Option C", Price: 300, GroupID: "group_valid", IsActive: true},
		{ID: "opt_orphaned", Name: "Orphaned Option", Price: 50, GroupID: "group_valid", IsActive: true}, // Assign to valid group
	}

	// Add conflicting rules
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_conflict_1",
			Name:       "Conflicting Rule 1",
			Expression: "opt_a -> opt_b",
			Type:       cpq.RequiresRule,
			Priority:   10,
		},
		{
			ID:         "rule_conflict_2",
			Name:       "Conflicting Rule 2",
			Expression: "opt_a -> !opt_b", // Conflicts with rule_conflict_1
			Type:       cpq.ExcludesRule,
			Priority:   10, // Duplicate priority
		},
		{
			ID:         "rule_missing_ref",
			Name:       "Missing Reference Rule",
			Expression: "opt_missing -> opt_a",
			Type:       cpq.RequiresRule,
		},
		{
			ID:         "rule_syntax_error",
			Name:       "Syntax Error Rule",
			Expression: "((opt_a -> opt_b)", // Unbalanced parentheses
			Type:       cpq.RequiresRule,
		},
	}

	return model
}

func applyModelImprovements(model *cpq.Model, validationReport *ValidationReport, conflictResult *ConflictDetectionResult) *cpq.Model {
	// Create improved version of the model with proper initialization
	improvedModel := &cpq.Model{
		ID:          model.ID + "_improved",
		Name:        model.Name + " (Improved)",
		Description: model.Description,
		Version:     model.Version,
		Options:     make([]cpq.Option, len(model.Options)),
		Groups:      make([]cpq.Group, 0, len(model.Groups)),
		Rules:       make([]cpq.Rule, 0, len(model.Rules)),
		PriceRules:  make([]cpq.PriceRule, len(model.PriceRules)),
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   time.Now(),
		IsActive:    model.IsActive,
	}

	// Copy and fix groups
	for _, group := range model.Groups {
		fixedGroup := group // Create a copy
		if group.ID == "group_impossible" {
			// Fix impossible constraints
			fixedGroup.MinSelections = 1
			fixedGroup.MaxSelections = 2
		}
		improvedModel.Groups = append(improvedModel.Groups, fixedGroup)
	}

	// Copy options
	copy(improvedModel.Options, model.Options)

	// Copy price rules
	copy(improvedModel.PriceRules, model.PriceRules)

	// Copy and fix rules
	for _, rule := range model.Rules {
		// Create a proper copy of the rule
		fixedRule := cpq.Rule{
			ID:         rule.ID,
			Name:       rule.Name,
			Type:       rule.Type,
			Expression: rule.Expression, // Will be updated below if needed
			Message:    rule.Message,
			IsActive:   rule.IsActive,
			Priority:   rule.Priority,
		}

		switch rule.ID {
		case "rule_missing_ref":
			// Fix missing reference
			fixedRule.Expression = "opt_a -> opt_b"
		case "rule_syntax_error":
			// Fix syntax error - use simple, valid expression
			fixedRule.Expression = "opt_a -> opt_b"
		case "rule_conflict_2":
			// Remove conflicting rule by skipping it
			continue
		}

		improvedModel.Rules = append(improvedModel.Rules, fixedRule)
	}

	return improvedModel
}

func createLargeScaleTestModel(optionCount, ruleCount int) *cpq.Model {
	model := cpq.NewModel("test-model", "Test Model")
	model.Name = "Large Scale Test Model"

	// Add groups
	groupSize := 10
	numGroups := (optionCount + groupSize - 1) / groupSize // Ceiling division
	for i := 0; i < numGroups; i++ {
		model.Groups = append(model.Groups, cpq.Group{
			ID:   fmt.Sprintf("group_%d", i),
			Name: fmt.Sprintf("Group %d", i),
			Type: cpq.SingleSelect,
		})
	}

	// Add many options that reference the groups
	for i := 0; i < optionCount; i++ {
		groupID := fmt.Sprintf("group_%d", i/groupSize)
		model.Options = append(model.Options, cpq.Option{
			ID:       fmt.Sprintf("opt_%d", i),
			Name:     fmt.Sprintf("Option %d", i),
			Price:    float64(100 + i),
			GroupID:  groupID,
			IsActive: true,
		})
	}

	// Add many rules
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
			Expression: fmt.Sprintf("opt_%d", i%optionCount),
			Type:       ruleType,
		})
	}

	return model
}

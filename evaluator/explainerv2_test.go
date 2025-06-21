// explainerv2_test.go - Comprehensive tests for the consolidated explainer visitor
package evaluator

import (
	"DD/parser"
	"fmt"
	"strings"
	"testing"
	"time"
)

// ===================================================================
// TEST SETUP HELPERS
// ===================================================================

func createTestExplainer() *Explainer {
	explainer := NewExplainer()

	// Set up display names for testing
	explainer.SetVariableDisplayName("opt_cpu_high", "High-end CPU")
	explainer.SetVariableDisplayName("opt_cpu_mid", "Mid-range CPU")
	explainer.SetVariableDisplayName("opt_cpu_low", "Budget CPU")
	explainer.SetVariableDisplayName("opt_cooling_liquid", "Liquid Cooling")
	explainer.SetVariableDisplayName("opt_cooling_air", "Air Cooling")
	explainer.SetVariableDisplayName("opt_psu_850w", "850W Power Supply")
	explainer.SetVariableDisplayName("opt_psu_600w", "600W Power Supply")
	explainer.SetVariableDisplayName("opt_case_full", "Full Tower Case")
	explainer.SetVariableDisplayName("opt_case_mid", "Mid Tower Case")
	explainer.SetVariableDisplayName("opt_gaming_mode", "Gaming Mode")
	explainer.SetVariableDisplayName("opt_workstation", "Workstation Package")
	explainer.SetVariableDisplayName("opt_budget_tier", "Budget Package")
	explainer.SetVariableDisplayName("opt_gpu_rtx4090", "RTX 4090")
	explainer.SetVariableDisplayName("opt_gpu_rtx4070", "RTX 4070")
	explainer.SetVariableDisplayName("opt_ram_32gb", "32GB RAM")
	explainer.SetVariableDisplayName("opt_ram_16gb", "16GB RAM")

	return explainer
}

func processRule(t *testing.T, explainer *Explainer, ruleID, ruleName, expression string) {
	explainer.SetCurrentRule(ruleID, ruleName, expression)

	expr, err := parser.ParseExpression(expression)
	if err != nil {
		t.Fatalf("Failed to parse expression '%s': %v", expression, err)
	}

	_, err = expr.Accept(explainer)
	if err != nil {
		t.Fatalf("Failed to process rule '%s': %v", ruleID, err)
	}
	
	// Debug: check if variables were captured
	if ruleExpl, exists := explainer.GetRuleExplanation(ruleID); exists {
		if len(ruleExpl.Variables) == 0 {
			t.Logf("WARNING: Rule %s has no variables after processing expression: %s", ruleID, expression)
		}
	}
}

// ===================================================================
// BASIC FUNCTIONALITY TESTS
// ===================================================================

func TestExplainer_Creation(t *testing.T) {
	explainer := NewExplainer()

	if explainer == nil {
		t.Fatal("Expected explainer to be created")
	}

	if explainer.dependencies == nil {
		t.Error("Expected dependencies map to be initialized")
	}
	if explainer.exclusions == nil {
		t.Error("Expected exclusions map to be initialized")
	}
	if explainer.implications == nil {
		t.Error("Expected implications map to be initialized")
	}
	if explainer.isCompiled {
		t.Error("Expected isCompiled to be false initially")
	}
}

func TestExplainer_SimpleDependency(t *testing.T) {
	explainer := createTestExplainer()

	// Process simple implication rule
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")

	// Verify dependency was captured
	deps := explainer.GetDependencies("opt_cpu_high")
	if len(deps) != 1 {
		t.Fatalf("Expected 1 dependency, got %d", len(deps))
	}

	dep := deps[0]
	if dep.Source != "opt_cpu_high" {
		t.Errorf("Expected source 'opt_cpu_high', got '%s'", dep.Source)
	}
	if dep.Target != "opt_cooling_liquid" {
		t.Errorf("Expected target 'opt_cooling_liquid', got '%s'", dep.Target)
	}
	if dep.RuleID != "rule1" {
		t.Errorf("Expected rule ID 'rule1', got '%s'", dep.RuleID)
	}
	if !strings.Contains(dep.Explanation, "High-end CPU") {
		t.Error("Expected explanation to contain readable CPU name")
	}
	if !strings.Contains(dep.Explanation, "requires") {
		t.Error("Expected explanation to contain 'requires'")
	}
}

func TestExplainer_ExclusionRule(t *testing.T) {
	explainer := createTestExplainer()

	// Process exclusion rule using negation (since EXCLUDES is not a parser token)
	// This rule means: if budget_tier is selected, then NOT cpu_high
	processRule(t, explainer, "rule1", "Budget Exclusion", "opt_budget_tier -> NOT opt_cpu_high")

	// Get rule explanation
	ruleExpl, exists := explainer.GetRuleExplanation("rule1")
	if !exists {
		t.Fatal("Expected rule explanation to exist")
	}

	// Should have captured the implication
	if len(ruleExpl.Dependencies) == 0 && len(ruleExpl.Implications) == 0 {
		t.Error("Expected dependencies or implications to be created")
	}

	// The negation in the consequence should be captured
	if len(ruleExpl.Variables) < 2 {
		t.Errorf("Expected at least 2 variables, got %d", len(ruleExpl.Variables))
	}
}

func TestExplainer_ComplexExpression(t *testing.T) {
	explainer := createTestExplainer()

	// Process complex expression with AND
	processRule(t, explainer, "rule1", "Gaming Requirements",
		"(opt_gaming_mode AND opt_gpu_rtx4090) -> (opt_cpu_high AND opt_ram_32gb)")

	// Get rule explanation
	ruleExpl, exists := explainer.GetRuleExplanation("rule1")
	if !exists {
		t.Fatal("Expected rule explanation to exist")
	}

	// Should have extracted all variables
	expectedVars := []string{"opt_gaming_mode", "opt_gpu_rtx4090", "opt_cpu_high", "opt_ram_32gb"}
	if len(ruleExpl.Variables) != len(expectedVars) {
		t.Errorf("Expected %d variables, got %d", len(expectedVars), len(ruleExpl.Variables))
	}

	// Should have created dependencies
	if len(ruleExpl.Dependencies) == 0 {
		t.Error("Expected dependencies to be created from complex expression")
	}
}

func TestExplainer_NegationRule(t *testing.T) {
	explainer := createTestExplainer()

	// Process negation rule
	processRule(t, explainer, "rule1", "No Budget CPU", "NOT opt_cpu_low")

	// Should create exclusion for negated variable
	exclusions := explainer.GetExclusions("any")
	if len(exclusions) == 0 {
		t.Error("Expected exclusion to be created for negated variable")
	}

	found := false
	for _, excl := range exclusions {
		if excl.Target == "opt_cpu_low" {
			found = true
			if !strings.Contains(excl.Explanation, "not allowed") {
				t.Error("Expected explanation to indicate variable is not allowed")
			}
		}
	}

	if !found {
		t.Error("Expected to find exclusion for opt_cpu_low")
	}
}

// ===================================================================
// COMPILATION TESTS
// ===================================================================

func TestExplainer_BasicCompilation(t *testing.T) {
	explainer := createTestExplainer()

	// Create simple dependency chain
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Cooling Power", "opt_cooling_liquid -> opt_psu_850w")
	processRule(t, explainer, "rule3", "PSU Case", "opt_psu_850w -> opt_case_full")

	// Compile the graph
	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile dependency graph: %v", err)
	}

	// Verify basic structure
	if graph == nil {
		t.Fatal("Expected compiled graph, got nil")
	}

	// Verify direct dependencies
	if len(graph.DirectDependencies) != 3 {
		t.Errorf("Expected 3 sources with direct dependencies, got %d", len(graph.DirectDependencies))
	}

	// Verify transitive dependencies were computed
	if len(graph.TransitiveDependencies) == 0 {
		t.Error("Expected transitive dependencies to be computed")
	}

	// Verify statistics
	if graph.CompilationStats.TotalRules != 3 {
		t.Errorf("Expected 3 rules, got %d", graph.CompilationStats.TotalRules)
	}
	if graph.CompilationStats.TotalVariables != 4 {
		t.Errorf("Expected 4 variables, got %d", graph.CompilationStats.TotalVariables)
	}
}

func TestExplainer_TransitiveClosure(t *testing.T) {
	explainer := createTestExplainer()

	// Create chain: cpu -> cooling -> psu -> case
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Cooling Power", "opt_cooling_liquid -> opt_psu_850w")
	processRule(t, explainer, "rule3", "PSU Case", "opt_psu_850w -> opt_case_full")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Test transitive closure
	cpuDeps := graph.GetTransitiveDependencies("opt_cpu_high")
	expectedDeps := []string{"opt_case_full", "opt_cooling_liquid", "opt_psu_850w"}

	if len(cpuDeps) != len(expectedDeps) {
		t.Errorf("Expected %d transitive dependencies for CPU, got %d",
			len(expectedDeps), len(cpuDeps))
	}

	// Verify all expected dependencies are present
	depMap := make(map[string]bool)
	for _, dep := range cpuDeps {
		depMap[dep] = true
	}

	for _, expected := range expectedDeps {
		if !depMap[expected] {
			t.Errorf("Expected transitive dependency '%s' not found", expected)
		}
	}
}

func TestExplainer_DependencyLevels(t *testing.T) {
	explainer := createTestExplainer()

	// Create chain with known levels
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Cooling Power", "opt_cooling_liquid -> opt_psu_850w")
	processRule(t, explainer, "rule3", "PSU Case", "opt_psu_850w -> opt_case_full")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Verify dependency levels
	expectedLevels := map[string]int{
		"opt_case_full":      0, // No dependencies
		"opt_psu_850w":       1, // Depends on case
		"opt_cooling_liquid": 2, // Depends on PSU
		"opt_cpu_high":       3, // Depends on cooling
	}

	for variable, expectedLevel := range expectedLevels {
		actualLevel := graph.DependencyLevels[variable]
		if actualLevel != expectedLevel {
			t.Errorf("Expected %s to have level %d, got %d",
				variable, expectedLevel, actualLevel)
		}
	}

	// Verify max depth
	if graph.CompilationStats.MaxDependencyDepth != 3 {
		t.Errorf("Expected max depth 3, got %d", graph.CompilationStats.MaxDependencyDepth)
	}
}

// ===================================================================
// CYCLE DETECTION TESTS
// ===================================================================

func TestExplainer_CycleDetection(t *testing.T) {
	explainer := createTestExplainer()

	// Create a cycle: A -> B -> C -> A
	explainer.SetVariableDisplayName("opt_a", "Option A")
	explainer.SetVariableDisplayName("opt_b", "Option B")
	explainer.SetVariableDisplayName("opt_c", "Option C")

	processRule(t, explainer, "cycle1", "A to B", "opt_a -> opt_b")
	processRule(t, explainer, "cycle2", "B to C", "opt_b -> opt_c")
	processRule(t, explainer, "cycle3", "C to A", "opt_c -> opt_a")

	// Compilation should detect the cycle
	graph, err := explainer.Compile()
	if err == nil {
		t.Error("Expected compilation to fail due to cycle detection")
	}

	if !strings.Contains(err.Error(), "cycle") {
		t.Errorf("Expected error message to mention cycles, got: %v", err)
	}

	// Graph should still be returned with cycle information
	if graph == nil {
		t.Fatal("Expected graph to be returned even with cycles")
	}

	if !graph.HasCycles {
		t.Error("Expected HasCycles to be true")
	}

	if len(graph.CyclicDependencies) == 0 {
		t.Error("Expected cyclic dependencies to be detected")
	}

	// Verify the cycle contains our variables
	cycle := graph.CyclicDependencies[0]
	cycleVars := make(map[string]bool)
	for _, variable := range cycle {
		cycleVars[variable] = true
	}

	expectedVars := []string{"opt_a", "opt_b", "opt_c"}
	for _, expected := range expectedVars {
		if !cycleVars[expected] {
			t.Errorf("Expected variable '%s' to be in detected cycle", expected)
		}
	}
}

func TestExplainer_SelfReferenceCycle(t *testing.T) {
	explainer := createTestExplainer()

	// Create self-referencing rule
	processRule(t, explainer, "self", "Self Reference", "opt_cpu_high -> opt_cpu_high")

	graph, err := explainer.Compile()
	if err == nil {
		t.Error("Expected compilation to fail due to self-reference cycle")
	}

	if graph == nil {
		t.Fatal("Expected graph to be returned even with cycles")
	}

	if !graph.HasCycles {
		t.Error("Expected self-reference to be detected as cycle")
	}
}

// ===================================================================
// PATH FINDING TESTS
// ===================================================================

func TestExplainer_DependencyPath(t *testing.T) {
	explainer := createTestExplainer()

	// Create chain for path finding
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Cooling Power", "opt_cooling_liquid -> opt_psu_850w")
	processRule(t, explainer, "rule3", "PSU Case", "opt_psu_850w -> opt_case_full")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Test finding path from CPU to case
	path := graph.GetDependencyPath("opt_cpu_high", "opt_case_full")
	if path == nil {
		t.Fatal("Expected to find dependency path from CPU to case")
	}

	expectedPath := []string{"opt_cpu_high", "opt_cooling_liquid", "opt_psu_850w", "opt_case_full"}
	if len(path.Path) != len(expectedPath) {
		t.Errorf("Expected path length %d, got %d", len(expectedPath), len(path.Path))
	}

	for i, expected := range expectedPath {
		if i >= len(path.Path) || path.Path[i] != expected {
			t.Errorf("Expected path element %d to be '%s', got '%s'",
				i, expected, path.Path[i])
		}
	}

	// Verify path properties
	if path.Length != 3 { // 4 nodes = 3 edges
		t.Errorf("Expected path length 3, got %d", path.Length)
	}

	// Verify explanation
	if !strings.Contains(path.Explanation, "requires") {
		t.Error("Expected path explanation to contain 'requires'")
	}
}

func TestExplainer_NoPath(t *testing.T) {
	explainer := createTestExplainer()

	// Create two independent chains
	processRule(t, explainer, "rule1", "Chain A", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Chain B", "opt_gpu_rtx4090 -> opt_psu_850w")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Should not find path between independent chains
	path := graph.GetDependencyPath("opt_cpu_high", "opt_gpu_rtx4090")
	if path != nil {
		t.Error("Expected no path between independent chains")
	}
}

// ===================================================================
// RELEVANT RULES TESTS
// ===================================================================

func TestExplainer_RelevantRules(t *testing.T) {
	explainer := createTestExplainer()

	// Create complex dependency model
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Gaming CPU", "opt_gaming_mode -> opt_cpu_high")
	processRule(t, explainer, "rule3", "Workstation Cooling", "opt_workstation -> opt_cooling_liquid")
	processRule(t, explainer, "rule4", "Budget Exclusion", "opt_budget_tier -> NOT opt_cpu_high")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Test relevant rules for CPU
	relevantRules := graph.GetRelevantRulesForOption("opt_cpu_high")

	// Should include rules that directly mention CPU
	expectedRules := []string{"rule1", "rule2", "rule4"}

	if len(relevantRules) < len(expectedRules) {
		t.Errorf("Expected at least %d relevant rules, got %d",
			len(expectedRules), len(relevantRules))
	}

	ruleMap := make(map[string]bool)
	for _, rule := range relevantRules {
		ruleMap[rule] = true
	}

	for _, expected := range expectedRules {
		if !ruleMap[expected] {
			t.Errorf("Expected relevant rule '%s' not found", expected)
		}
	}
}

// ===================================================================
// ENHANCED EXPLANATION TESTS
// ===================================================================

func TestExplainer_EnhancedExplanations(t *testing.T) {
	explainer := createTestExplainer()

	// Create rules
	processRule(t, explainer, "rule1", "CPU Cooling", "opt_cpu_high -> opt_cooling_liquid")
	processRule(t, explainer, "rule2", "Budget Exclusion", "opt_budget_tier -> NOT opt_cpu_high")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Create selections that would block CPU
	selections := map[string]bool{
		"opt_budget_tier": true,  // This excludes CPU
		"opt_cpu_high":    false, // CPU is not selected
	}

	// Generate enhanced explanations
	explanations := graph.ExplainUnavailabilityWithPaths("opt_cpu_high", selections)

	if len(explanations) == 0 {
		t.Error("Expected enhanced explanations to be generated")
	}

	// Find the exclusion explanation
	found := false
	for _, expl := range explanations {
		if expl.BlockingRule == "rule2" {
			found = true

			if expl.Type != "dependency_chain" {
				t.Errorf("Expected type 'dependency_chain', got '%s'", expl.Type)
			}

			if len(expl.Suggestions) == 0 {
				t.Error("Expected suggestions to be generated")
			}

			if expl.Severity == "" {
				t.Error("Expected severity to be calculated")
			}
		}
	}

	if !found {
		t.Error("Expected to find exclusion explanation")
	}
}

// ===================================================================
// PERFORMANCE TESTS
// ===================================================================

func TestExplainer_CompilationPerformance(t *testing.T) {
	explainer := createTestExplainer()

	// Create a larger dependency graph
	numRules := 100
	for i := 0; i < numRules; i++ {
		varA := fmt.Sprintf("opt_var_%d", i)
		varB := fmt.Sprintf("opt_var_%d", (i+1)%numRules)
		ruleID := fmt.Sprintf("perf_rule_%d", i)
		expression := fmt.Sprintf("%s -> %s", varA, varB)

		explainer.SetVariableDisplayName(varA, fmt.Sprintf("Variable %d", i))
		processRule(t, explainer, ruleID, "Performance Rule", expression)
	}

	// Measure compilation time
	startTime := time.Now()
	graph, err := explainer.Compile()
	compilationTime := time.Since(startTime)

	if err != nil {
		// This will likely have cycles, which is expected
		if !strings.Contains(err.Error(), "cycle") {
			t.Fatalf("Unexpected compilation error: %v", err)
		}
	}

	// Verify graph was created
	if graph == nil {
		t.Fatal("Expected graph to be created even with cycles")
	}

	// Verify performance
	t.Logf("Compiled %d rules in %v", numRules, compilationTime)

	if compilationTime > 2*time.Second {
		t.Errorf("Compilation took too long: %v (expected <2s)", compilationTime)
	}

	// Test query performance
	startQuery := time.Now()
	_ = graph.GetRelevantRulesForOption("opt_var_50")
	queryTime := time.Since(startQuery)

	t.Logf("Query for relevant rules took %v", queryTime)

	if queryTime > 50*time.Millisecond {
		t.Errorf("Query took too long: %v (expected <50ms)", queryTime)
	}
}

// ===================================================================
// EDGE CASE TESTS
// ===================================================================

func TestExplainer_EmptyModel(t *testing.T) {
	explainer := createTestExplainer()

	// Compile empty model
	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile empty model: %v", err)
	}

	// Should have empty but valid structure
	if len(graph.DirectDependencies) != 0 {
		t.Error("Expected empty direct dependencies")
	}
	if len(graph.TransitiveDependencies) != 0 {
		t.Error("Expected empty transitive dependencies")
	}
	if graph.CompilationStats.TotalRules != 0 {
		t.Error("Expected 0 rules")
	}
	if graph.CompilationStats.TotalVariables != 0 {
		t.Error("Expected 0 variables")
	}
}

func TestExplainer_ComplexBooleanExpressions(t *testing.T) {
	explainer := createTestExplainer()

	// Test complex boolean expression with nested operations
	processRule(t, explainer, "rule1", "Complex Rule",
		"((opt_cpu_high OR opt_cpu_mid) AND opt_gpu_rtx4090) -> (opt_psu_850w AND opt_cooling_liquid)")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Should have extracted all variables
	if graph.CompilationStats.TotalVariables < 5 {
		t.Errorf("Expected at least 5 variables, got %d", graph.CompilationStats.TotalVariables)
	}
}

func TestExplainer_MultipleRulesPerVariable(t *testing.T) {
	explainer := createTestExplainer()

	// Multiple rules affecting same variable
	processRule(t, explainer, "rule1", "CPU from Gaming", "opt_gaming_mode -> opt_cpu_high")
	processRule(t, explainer, "rule2", "CPU from Workstation", "opt_workstation -> opt_cpu_high")
	processRule(t, explainer, "rule3", "CPU needs Cooling", "opt_cpu_high -> opt_cooling_liquid")

	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile: %v", err)
	}

	// Get relevant rules for CPU
	relevantRules := graph.GetRelevantRulesForOption("opt_cpu_high")
	if len(relevantRules) != 3 {
		t.Errorf("Expected 3 relevant rules for CPU, got %d", len(relevantRules))
		// Debug: print available rules
		t.Logf("Available rules in graph: %v", graph.Rules)
		for ruleID, ruleExpl := range graph.RuleExplanations {
			t.Logf("Rule %s has variables: %v", ruleID, ruleExpl.Variables)
		}
		t.Logf("Transitive dependencies: %v", graph.TransitiveDependencies)
	}

	// Verify transitive dependencies
	gamingDeps := graph.GetTransitiveDependencies("opt_gaming_mode")
	if len(gamingDeps) != 2 { // Should depend on cpu_high and cooling_liquid
		t.Errorf("Expected 2 transitive dependencies for gaming mode, got %d", len(gamingDeps))
	}
}

// ===================================================================
// REAL-WORLD SCENARIO TEST
// ===================================================================

func TestExplainer_RealWorldComputerConfiguration(t *testing.T) {
	explainer := createTestExplainer()

	// Set up realistic computer configuration rules
	explainer.SetVariableDisplayName("opt_cpu_i9", "Intel Core i9")
	explainer.SetVariableDisplayName("opt_motherboard_x670", "X670 Motherboard")
	explainer.SetVariableDisplayName("opt_storage_nvme", "NVMe SSD")

	// Create realistic dependency chains
	processRule(t, explainer, "cpu_cooling", "High-end CPU needs cooling",
		"opt_cpu_i9 -> opt_cooling_liquid")
	processRule(t, explainer, "gpu_power", "4090 needs power",
		"opt_gpu_rtx4090 -> opt_psu_850w")
	processRule(t, explainer, "cooling_power", "Liquid cooling needs power",
		"opt_cooling_liquid -> opt_psu_850w")
	processRule(t, explainer, "power_case", "850W PSU needs full case",
		"opt_psu_850w -> opt_case_full")
	processRule(t, explainer, "cpu_motherboard", "i9 needs X670",
		"opt_cpu_i9 -> opt_motherboard_x670")
	processRule(t, explainer, "gaming_requirements", "Gaming needs high-end",
		"opt_gaming_mode -> (opt_cpu_i9 AND opt_gpu_rtx4090)")
	processRule(t, explainer, "budget_exclusions", "Budget excludes high-end",
		"opt_budget_tier -> NOT opt_cpu_i9")

	// Compile the graph
	graph, err := explainer.Compile()
	if err != nil {
		t.Fatalf("Failed to compile realistic scenario: %v", err)
	}

	// Test complex transitive dependencies
	cpuDeps := graph.GetTransitiveDependencies("opt_cpu_i9")
	expectedComponents := []string{"opt_cooling_liquid", "opt_psu_850w", "opt_case_full", "opt_motherboard_x670"}

	for _, component := range expectedComponents {
		found := false
		for _, dep := range cpuDeps {
			if dep == component {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("Expected CPU to transitively depend on %s", component)
		}
	}

	// Test realistic explanation scenario
	selections := map[string]bool{
		"opt_budget_tier": true,
		"opt_cpu_i9":      false,
	}

	explanations := graph.ExplainUnavailabilityWithPaths("opt_cpu_i9", selections)
	if len(explanations) == 0 {
		t.Error("Expected explanations for budget/i9 conflict")
	}

	// Verify statistics
	stats := graph.CompilationStats
	t.Logf("Real-world scenario stats: Rules=%d, Variables=%d, MaxDepth=%d",
		stats.TotalRules, stats.TotalVariables, stats.MaxDependencyDepth)

	if stats.TotalRules != 7 {
		t.Errorf("Expected 7 rules, got %d", stats.TotalRules)
	}
	if stats.MaxDependencyDepth < 2 {
		t.Error("Expected some dependency depth in realistic scenario")
	}
}
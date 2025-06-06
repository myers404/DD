package mtbdd

import (
	"testing"
)

// TestMTBDDIntegration provides comprehensive integration testing for the optimized MTBDD library.
// This test validates that all components work together correctly with the new typed cache system.
func TestMTBDDIntegration(t *testing.T) {
	// Create a new MTBDD instance
	mtbdd := NewMTBDD()

	// Declare variables for testing
	mtbdd.Declare("x", "y", "z", "w")

	t.Run("Foundation", testFoundation)
	t.Run("BooleanOperations", testBooleanOperations)
	t.Run("ArithmeticOperations", testArithmeticOperations)
	t.Run("ComparisonOperations", testComparisonOperations)
	t.Run("ManipulationOperations", testManipulationOperations)
	t.Run("QuantificationOperations", testQuantificationOperations)
	t.Run("AnalysisOperations", testAnalysisOperations)
	t.Run("TemporalOperations", testTemporalOperations)
	t.Run("MemoryManagement", testMemoryManagement)
	t.Run("CacheManagement", testCacheManagement)
	t.Run("ComplexWorkflow", testComplexWorkflow)
}

// testFoundation validates the core foundation components
func testFoundation(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test variable declaration and management
	mtbdd.Declare("a", "b", "c")

	if mtbdd.VariableCount() != 3 {
		t.Errorf("Expected 3 variables, got %d", mtbdd.VariableCount())
	}

	// Test variable creation
	a, err := mtbdd.Var("a")
	if err != nil {
		t.Fatalf("Failed to create variable 'a': %v", err)
	}

	// Test terminal creation
	trueNode := mtbdd.Constant(true)
	falseNode := mtbdd.Constant(false)
	intNode := mtbdd.Constant(42)

	// Validate terminal values
	if val, ok := mtbdd.GetTerminalValue(trueNode); !ok || val != true {
		t.Errorf("Expected true terminal, got %v", val)
	}

	if val, ok := mtbdd.GetTerminalValue(falseNode); !ok || val != false {
		t.Errorf("Expected false terminal, got %v", val)
	}

	if val, ok := mtbdd.GetTerminalValue(intNode); !ok || val != 42 {
		t.Errorf("Expected 42 terminal, got %v", val)
	}

	// Test node type checking
	if !mtbdd.IsTerminal(trueNode) {
		t.Error("Expected trueNode to be terminal")
	}

	if !mtbdd.IsTerminal(falseNode) {
		t.Error("Expected falseNode to be terminal")
	}

	if mtbdd.IsTerminal(a) {
		t.Error("Expected variable node to not be terminal")
	}
}

// testBooleanOperations validates boolean logic operations
func testBooleanOperations(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Test basic boolean operations
	andResult := mtbdd.AND(x, y)
	orResult := mtbdd.OR(x, y)
	notResult := mtbdd.NOT(x)
	xorResult := mtbdd.XOR(x, y)
	impliesResult := mtbdd.IMPLIES(x, y)
	equivResult := mtbdd.EQUIV(x, y)

	// Test evaluation with different assignments
	assignments := []map[string]bool{
		{"x": true, "y": true},
		{"x": true, "y": false},
		{"x": false, "y": true},
		{"x": false, "y": false},
	}

	expectedAnd := []bool{true, false, false, false}
	expectedOr := []bool{true, true, true, false}
	expectedNot := []bool{false, false, true, true}
	expectedXor := []bool{false, true, true, false}
	expectedImplies := []bool{true, false, true, true}
	expectedEquiv := []bool{true, false, false, true}

	for i, assignment := range assignments {
		if result := mtbdd.Evaluate(andResult, assignment); result != expectedAnd[i] {
			t.Errorf("AND with assignment %v: expected %v, got %v", assignment, expectedAnd[i], result)
		}

		if result := mtbdd.Evaluate(orResult, assignment); result != expectedOr[i] {
			t.Errorf("OR with assignment %v: expected %v, got %v", assignment, expectedOr[i], result)
		}

		if result := mtbdd.Evaluate(notResult, assignment); result != expectedNot[i] {
			t.Errorf("NOT with assignment %v: expected %v, got %v", assignment, expectedNot[i], result)
		}

		if result := mtbdd.Evaluate(xorResult, assignment); result != expectedXor[i] {
			t.Errorf("XOR with assignment %v: expected %v, got %v", assignment, expectedXor[i], result)
		}

		if result := mtbdd.Evaluate(impliesResult, assignment); result != expectedImplies[i] {
			t.Errorf("IMPLIES with assignment %v: expected %v, got %v", assignment, expectedImplies[i], result)
		}

		if result := mtbdd.Evaluate(equivResult, assignment); result != expectedEquiv[i] {
			t.Errorf("EQUIV with assignment %v: expected %v, got %v", assignment, expectedEquiv[i], result)
		}
	}
}

// testArithmeticOperations validates arithmetic operations
func testArithmeticOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	// Create arithmetic terminals
	node5 := mtbdd.Constant(5)
	node3 := mtbdd.Constant(3)
	node2 := mtbdd.Constant(2)

	// Test arithmetic operations
	sum := mtbdd.Add(node5, node3)
	diff := mtbdd.Subtract(node5, node3)
	product := mtbdd.Multiply(node5, node2)
	maximum := mtbdd.Max(node5, node3)
	minimum := mtbdd.Min(node5, node3)
	negated := mtbdd.Negate(node5)
	absolute := mtbdd.Abs(negated)

	// Validate results
	if val, _ := mtbdd.GetTerminalValue(sum); val != 8 {
		t.Errorf("5 + 3 = %v, expected 8", val)
	}

	if val, _ := mtbdd.GetTerminalValue(diff); val != 2 {
		t.Errorf("5 - 3 = %v, expected 2", val)
	}

	if val, _ := mtbdd.GetTerminalValue(product); val != 10 {
		t.Errorf("5 * 2 = %v, expected 10", val)
	}

	if val, _ := mtbdd.GetTerminalValue(maximum); val != 5 {
		t.Errorf("max(5, 3) = %v, expected 5", val)
	}

	if val, _ := mtbdd.GetTerminalValue(minimum); val != 3 {
		t.Errorf("min(5, 3) = %v, expected 3", val)
	}

	if val, _ := mtbdd.GetTerminalValue(negated); val != -5 {
		t.Errorf("-5 = %v, expected -5", val)
	}

	if val, _ := mtbdd.GetTerminalValue(absolute); val != 5 {
		t.Errorf("abs(-5) = %v, expected 5", val)
	}
}

// testComparisonOperations validates comparison operations
func testComparisonOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	// Create test values
	node5 := mtbdd.Constant(5)
	node3 := mtbdd.Constant(3)

	// Test comparison operations
	greater := mtbdd.GreaterThan(node5, node3)
	less := mtbdd.LessThan(node3, node5)
	equal := mtbdd.Equal(node5, node5)
	threshold := mtbdd.Threshold(node5, 4)

	// Validate results
	if val, _ := mtbdd.GetTerminalValue(greater); val != true {
		t.Errorf("5 > 3 = %v, expected true", val)
	}

	if val, _ := mtbdd.GetTerminalValue(less); val != true {
		t.Errorf("3 < 5 = %v, expected true", val)
	}

	if val, _ := mtbdd.GetTerminalValue(equal); val != true {
		t.Errorf("5 == 5 = %v, expected true", val)
	}

	if val, _ := mtbdd.GetTerminalValue(threshold); val != true {
		t.Errorf("5 >= 4 = %v, expected true", val)
	}
}

// testManipulationOperations validates MTBDD manipulation operations
func testManipulationOperations(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create formula: x AND y
	formula := mtbdd.AND(x, y)

	// Test restriction: restrict x to true
	restricted := mtbdd.Restrict(formula, "x", true)

	// Should evaluate to y when x=true
	assignment := map[string]bool{"y": true}
	if result := mtbdd.Evaluate(restricted, assignment); result != true {
		t.Errorf("Restrict(x AND y, x=true) with y=true = %v, expected true", result)
	}

	assignment["y"] = false
	if result := mtbdd.Evaluate(restricted, assignment); result != false {
		t.Errorf("Restrict(x AND y, x=true) with y=false = %v, expected false", result)
	}

	// Test cofactor: multiple restrictions
	cofactor := mtbdd.Cofactor(map[string]bool{"x": true, "y": false}, formula)
	if val, _ := mtbdd.GetTerminalValue(cofactor); val != false {
		t.Errorf("Cofactor(x AND y, x=true, y=false) = %v, expected false", val)
	}

	// Test composition: substitute x with NOT(y)
	notY := mtbdd.NOT(y)
	composed := mtbdd.Compose(formula, map[string]NodeRef{"x": notY})

	// Should be equivalent to NOT(y) AND y = false
	testAssignment := map[string]bool{"y": true}
	if result := mtbdd.Evaluate(composed, testAssignment); result != false {
		t.Errorf("Compose(x AND y, x := NOT(y)) with y=true = %v, expected false", result)
	}
}

// testQuantificationOperations validates quantification operations
func testQuantificationOperations(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create formula: x AND y
	formula := mtbdd.AND(x, y)

	// Test existential quantification: ∃x.(x AND y)
	exists := mtbdd.Exists(formula, []string{"x"})

	// Should be equivalent to y (since ∃x.(x AND y) = (false AND y) OR (true AND y) = y)
	assignment := map[string]bool{"y": true}
	if result := mtbdd.Evaluate(exists, assignment); result != true {
		t.Errorf("∃x.(x AND y) with y=true = %v, expected true", result)
	}

	assignment["y"] = false
	if result := mtbdd.Evaluate(exists, assignment); result != false {
		t.Errorf("∃x.(x AND y) with y=false = %v, expected false", result)
	}

	// Test universal quantification: ∀x.(x IMPLIES y)
	implies := mtbdd.IMPLIES(x, y)
	forall := mtbdd.ForAll(implies, []string{"x"})

	// Should be equivalent to y (since ∀x.(x → y) = (false → y) AND (true → y) = true AND y = y)
	assignment = map[string]bool{"y": true}
	if result := mtbdd.Evaluate(forall, assignment); result != true {
		t.Errorf("∀x.(x → y) with y=true = %v, expected true", result)
	}

	assignment["y"] = false
	if result := mtbdd.Evaluate(forall, assignment); result != false {
		t.Errorf("∀x.(x → y) with y=false = %v, expected false", result)
	}
}

// testAnalysisOperations validates analysis operations
func testAnalysisOperations(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Create formulas for testing
	formula1 := mtbdd.AND(x, y)
	formula2 := mtbdd.OR(y, z)

	// Test satisfiability count
	satCount1 := mtbdd.CountSat(formula1)
	if satCount1 <= 0 {
		t.Error("AND formula should have positive satisfying assignments")
	}

	satCount2 := mtbdd.CountSat(formula2)
	if satCount2 <= satCount1 {
		t.Error("OR formula should have more satisfying assignments than AND")
	}

	// Test support calculation
	support1 := mtbdd.Support(formula1)
	if len(support1) != 2 {
		t.Errorf("Support of (x AND y) should have 2 variables, got %d", len(support1))
	}

	if _, hasX := support1["x"]; !hasX {
		t.Error("Support should contain variable x")
	}

	if _, hasY := support1["y"]; !hasY {
		t.Error("Support should contain variable y")
	}

	// Test tautology and satisfiability checking
	tautology := mtbdd.OR(x, mtbdd.NOT(x))
	if !(mtbdd.CountSat(tautology) > 0) {
		t.Error("Tautology should be satisfiable")
	}

	contradiction := mtbdd.AND(x, mtbdd.NOT(x))
	if mtbdd.CountSat(contradiction) > 0 {
		t.Error("Contradiction should not be satisfiable")
	}
}

// testTemporalOperations validates temporal logic operations
func testTemporalOperations(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "x_next", "y_next")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	xNext, _ := mtbdd.Var("x_next")
	yNext, _ := mtbdd.Var("y_next")

	// Create a simple transition relation: x_next = NOT(x), y_next = y
	transition := mtbdd.AND(
		mtbdd.EQUIV(xNext, mtbdd.NOT(x)),
		mtbdd.EQUIV(yNext, y),
	)

	// Define state variables
	currentVars := []string{"x", "y"}
	nextVars := []string{"x_next", "y_next"}

	// Test target state
	target := mtbdd.AND(xNext, yNext)

	// Test EX (exists next): from x=false, y=true can reach x_next=true, y_next=true
	ex := mtbdd.EX(target, transition, currentVars, nextVars)

	assignment := map[string]bool{"x": false, "y": true}
	if result := mtbdd.Evaluate(ex, assignment); !result.(bool) {
		t.Error("EX should find x=false can reach x_next=true")
	}

	assignment = map[string]bool{"x": true, "y": false}
	if result := mtbdd.Evaluate(ex, assignment); result.(bool) {
		t.Error("EX should not find x=true can reach x_next=true")
	}

	// Test basic temporal operators existence (more detailed tests would require complex setup)
	ef := mtbdd.EF(target, transition, currentVars, nextVars)
	af := mtbdd.AF(target, transition, currentVars, nextVars)

	// Basic validation that operations complete without error
	if ef == NullRef || af == NullRef {
		t.Error("Temporal operations should return valid node references")
	}
}

// testMemoryManagement validates memory management operations with optimized cache system
func testMemoryManagement(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")

	// Create some nodes
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create arithmetic and boolean operations to populate different caches
	num1 := mtbdd.Constant(10)
	num2 := mtbdd.Constant(5)

	arithmeticResult := mtbdd.Add(num1, num2) // Binary cache
	booleanResult := mtbdd.AND(x, y)          // Ternary cache (via ITE)

	// Test memory statistics
	stats := mtbdd.GetMemoryStats()
	if stats.TotalNodes <= 0 {
		t.Error("Total nodes should be positive")
	}

	if stats.VariableCount != 3 {
		t.Errorf("Should have 3 variables, got %d", stats.VariableCount)
	}

	// Test that different cache types are tracked
	// Note: Boolean operations use ternary cache, arithmetic operations use binary cache
	if stats.BinaryCacheSize == 0 {
		t.Error("Binary cache should have entries after Add operation")
	}

	if stats.TernaryCacheSize == 0 {
		t.Error("Ternary cache should have entries after AND operation (via ITE)")
	}

	// Verify cache size calculation consistency
	expectedCacheSize := stats.BinaryCacheSize + stats.UnaryCacheSize +
		stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
	if stats.CacheSize != expectedCacheSize {
		t.Errorf("Total cache size %d should equal sum of individual caches %d",
			stats.CacheSize, expectedCacheSize)
	}

	// Test cache clearing
	mtbdd.ClearCaches()
	statsAfterClear := mtbdd.GetMemoryStats()
	if statsAfterClear.CacheSize != 0 {
		t.Errorf("Total cache size should be 0 after clearing, got %d", statsAfterClear.CacheSize)
	}

	// Verify all individual cache types are cleared
	if statsAfterClear.BinaryCacheSize != 0 {
		t.Errorf("Binary cache size should be 0 after clearing, got %d", statsAfterClear.BinaryCacheSize)
	}
	if statsAfterClear.UnaryCacheSize != 0 {
		t.Errorf("Unary cache size should be 0 after clearing, got %d", statsAfterClear.UnaryCacheSize)
	}
	if statsAfterClear.TernaryCacheSize != 0 {
		t.Errorf("Ternary cache size should be 0 after clearing, got %d", statsAfterClear.TernaryCacheSize)
	}
	if statsAfterClear.QuantCacheSize != 0 {
		t.Errorf("Quantify cache size should be 0 after clearing, got %d", statsAfterClear.QuantCacheSize)
	}
	if statsAfterClear.ComposeCacheSize != 0 {
		t.Errorf("Compose cache size should be 0 after clearing, got %d", statsAfterClear.ComposeCacheSize)
	}

	// Test garbage collection
	initialNodeCount := mtbdd.GetMemoryStats().TotalNodes

	// Create temporary nodes that won't be preserved
	temp1 := mtbdd.Constant(999)
	temp2 := mtbdd.Constant(888)
	mtbdd.Add(temp1, temp2)

	// Garbage collect, keeping only essential nodes
	mtbdd.GarbageCollect([]NodeRef{arithmeticResult, booleanResult})

	finalNodeCount := mtbdd.GetMemoryStats().TotalNodes

	// Should have fewer or equal nodes after GC
	if finalNodeCount > initialNodeCount+10 { // Allow some tolerance
		t.Errorf("Node count should not increase significantly after GC: %d -> %d",
			initialNodeCount, finalNodeCount)
	}

	// Test dump functionality (should not crash)
	dump := mtbdd.Dump()
	if len(dump) == 0 {
		t.Error("Dump should produce non-empty output")
	}

	// Test print stats (should not crash)
	mtbdd.PrintStats()
}

// testCacheManagement validates the optimized cache management system
func testCacheManagement(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Clear all caches to start fresh
	mtbdd.ClearCaches()

	// Create numeric terminals for arithmetic operations
	num1 := mtbdd.Constant(10)
	num2 := mtbdd.Constant(5)

	// Perform operations that populate different cache types
	binaryResult := mtbdd.Add(num1, num2) // Binary operation (arithmetic)
	unaryResult := mtbdd.Negate(num1)     // Unary operation (arithmetic)
	ternaryResult := mtbdd.ITE(x, y, z)   // Ternary operation
	booleanResult := mtbdd.AND(x, y)      // Boolean operation (via ITE, uses ternary cache)

	stats := mtbdd.GetMemoryStats()

	// Verify each cache type has entries
	if stats.BinaryCacheSize == 0 {
		t.Error("Binary cache should have entries after Add operation")
	}
	if stats.UnaryCacheSize == 0 {
		t.Error("Unary cache should have entries after Negate operation")
	}
	if stats.TernaryCacheSize == 0 {
		t.Error("Ternary cache should have entries after ITE/AND operations")
	}

	// Test selective cache clearing
	mtbdd.ClearSpecificCache("BINARY")

	statsAfterBinaryCleared := mtbdd.GetMemoryStats()
	if statsAfterBinaryCleared.BinaryCacheSize != 0 {
		t.Error("Binary cache should be cleared")
	}
	if statsAfterBinaryCleared.UnaryCacheSize == 0 {
		t.Error("Unary cache should still have entries")
	}
	if statsAfterBinaryCleared.TernaryCacheSize == 0 {
		t.Error("Ternary cache should still have entries")
	}

	// Test cache efficiency metrics
	efficiency := mtbdd.GetCacheEfficiency()
	if _, exists := efficiency["cache_to_nodes_ratio"]; !exists {
		t.Error("Should have cache efficiency metrics")
	}

	// Verify operations still work after selective cache clearing
	newBinaryResult := mtbdd.Add(num1, num2)
	if newBinaryResult != binaryResult {
		t.Error("Binary operation should produce same result after cache clearing due to hash consing")
	}

	// Use results to avoid unused variable warnings
	_, _, _, _ = binaryResult, unaryResult, ternaryResult, booleanResult
}

// testComplexWorkflow validates a complete workflow using multiple components
func testComplexWorkflow(t *testing.T) {
	mtbdd := NewMTBDD()

	// Create a more complex example: modeling a simple state machine
	mtbdd.Declare("ready", "processing", "done", "ready_next", "processing_next", "done_next")

	ready, _ := mtbdd.Var("ready")
	processing, _ := mtbdd.Var("processing")
	done, _ := mtbdd.Var("done")
	readyNext, _ := mtbdd.Var("ready_next")
	processingNext, _ := mtbdd.Var("processing_next")
	doneNext, _ := mtbdd.Var("done_next")

	// State invariant: exactly one state is true
	oneHot := mtbdd.AND(
		mtbdd.AND(
			mtbdd.OR(mtbdd.OR(ready, processing), done),
			mtbdd.IMPLIES(ready, mtbdd.AND(mtbdd.NOT(processing), mtbdd.NOT(done))),
		),
		mtbdd.AND(
			mtbdd.IMPLIES(processing, mtbdd.AND(mtbdd.NOT(ready), mtbdd.NOT(done))),
			mtbdd.IMPLIES(done, mtbdd.AND(mtbdd.NOT(ready), mtbdd.NOT(processing))),
		),
	)

	// Transition relation: ready -> processing -> done -> ready
	transition := mtbdd.AND(
		mtbdd.AND(
			// ready_next = done
			mtbdd.EQUIV(readyNext, done),
			// processing_next = ready
			mtbdd.EQUIV(processingNext, ready),
		),
		// done_next = processing
		mtbdd.EQUIV(doneNext, processing),
	)

	// Combine with state invariant
	fullTransition := mtbdd.AND(transition,
		mtbdd.AND(oneHot,
			mtbdd.Rename(oneHot, map[string]string{
				"ready":      "ready_next",
				"processing": "processing_next",
				"done":       "done_next",
			})))

	// Test reachability: starting from ready=true, can we reach done=true?
	_ = mtbdd.AND(mtbdd.AND(ready, mtbdd.NOT(processing)), mtbdd.NOT(done))
	targetState := mtbdd.AND(mtbdd.AND(mtbdd.NOT(readyNext), mtbdd.NOT(processingNext)), doneNext)

	currentVars := []string{"ready", "processing", "done"}
	nextVars := []string{"ready_next", "processing_next", "done_next"}

	// Compute states that can eventually reach the target
	canReachTarget := mtbdd.EF(targetState, fullTransition, currentVars, nextVars)

	// Test if initial state can reach target
	initialAssignment := map[string]bool{
		"ready": true, "processing": false, "done": false,
	}

	if result := mtbdd.Evaluate(canReachTarget, initialAssignment); !result.(bool) {
		t.Error("Should be able to reach done state from ready state")
	}

	// Test quantification: what states lead to processing next?
	processingStates := mtbdd.Preimage(processingNext, fullTransition, currentVars, nextVars)

	// Should be reachable from ready=true
	if result := mtbdd.Evaluate(processingStates, initialAssignment); !result.(bool) {
		t.Error("Processing state should be reachable from ready state")
	}

	// Test arithmetic integration: count the number of reachable states
	reachableCount := mtbdd.CountSat(canReachTarget)
	if reachableCount <= 0 {
		t.Error("Should have positive number of reachable states")
	}

	// Test cache efficiency after complex workflow
	finalStats := mtbdd.GetMemoryStats()
	if finalStats.CacheSize == 0 {
		t.Error("Should have cache entries after complex workflow")
	}

	// Verify all cache types may have been used
	totalCacheEntries := finalStats.BinaryCacheSize + finalStats.UnaryCacheSize +
		finalStats.TernaryCacheSize + finalStats.QuantCacheSize + finalStats.ComposeCacheSize
	if finalStats.CacheSize != totalCacheEntries {
		t.Errorf("Cache size calculation inconsistent: %d != %d",
			finalStats.CacheSize, totalCacheEntries)
	}

	t.Logf("Complex workflow completed successfully. Reachable states: %d", reachableCount)
	t.Logf("Final cache statistics: Binary=%d, Unary=%d, Ternary=%d, Quant=%d, Compose=%d",
		finalStats.BinaryCacheSize, finalStats.UnaryCacheSize, finalStats.TernaryCacheSize,
		finalStats.QuantCacheSize, finalStats.ComposeCacheSize)
}

// BenchmarkMTBDDOperations provides basic performance benchmarks
func BenchmarkMTBDDOperations(b *testing.B) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z", "w")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	b.Run("AND", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.AND(x, y)
		}
	})

	b.Run("NOT", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.NOT(x)
		}
	})

	b.Run("ITE", func(b *testing.B) {
		z, _ := mtbdd.Var("z")
		for i := 0; i < b.N; i++ {
			mtbdd.ITE(x, y, z)
		}
	})

	b.Run("Arithmetic", func(b *testing.B) {
		node5 := mtbdd.Constant(5)
		node3 := mtbdd.Constant(3)
		for i := 0; i < b.N; i++ {
			mtbdd.Add(node5, node3)
		}
	})

	b.Run("Evaluation", func(b *testing.B) {
		formula := mtbdd.AND(x, y)
		assignment := map[string]bool{"x": true, "y": false}
		for i := 0; i < b.N; i++ {
			mtbdd.Evaluate(formula, assignment)
		}
	})

	b.Run("CacheClearing", func(b *testing.B) {
		// Create some cache entries
		mtbdd.AND(x, y)
		mtbdd.NOT(x)
		mtbdd.ITE(x, y, TrueRef)

		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			mtbdd.ClearCaches()
			// Recreate some entries for next iteration
			if i < b.N-1 {
				mtbdd.AND(x, y)
			}
		}
	})

	b.Run("MemoryStats", func(b *testing.B) {
		// Create some complexity
		formula := mtbdd.AND(mtbdd.OR(x, y), mtbdd.NOT(x))
		_ = formula

		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			mtbdd.GetMemoryStats()
		}
	})
}

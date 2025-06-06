package mtbdd

import (
	"reflect"
	"testing"
)

// TestTerminalBasics tests basic terminal functionality
func TestTerminalBasics(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test boolean terminals
	trueNode := mtbdd.Constant(true)
	falseNode := mtbdd.Constant(false)

	if trueNode != TrueRef {
		t.Errorf("Constant(true) should return TrueRef (%d), got %d", TrueRef, trueNode)
	}

	if falseNode != FalseRef {
		t.Errorf("Constant(false) should return FalseRef (%d), got %d", FalseRef, falseNode)
	}
}

// TestTerminalCreation tests terminal node creation and uniqueness
func TestTerminalCreation(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test unique values get unique nodes
	node1 := mtbdd.Constant(42)
	node2 := mtbdd.Constant(42)
	node3 := mtbdd.Constant(42)

	// Same value should return same node (uniqueness)
	if node1 != node2 || node2 != node3 {
		t.Errorf("Same values should get same node references %d, %d, %d for same value",
			node1, node2, node3)
	}

	// Different values should get different nodes
	node4 := mtbdd.Constant(43)
	if node1 == node4 {
		t.Errorf("Different values got same node reference: %d and %d both returned %d",
			42, 43, node1)
	}
}

// TestGetTerminalValue tests retrieval of terminal values
func TestGetTerminalValue(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test with terminal node
	testValue := "test string"
	terminalNode := mtbdd.Constant(testValue)

	value, isTerminal := mtbdd.GetTerminalValue(terminalNode)
	if !isTerminal {
		t.Errorf("GetTerminalValue on terminal node returned isTerminal=false")
	}
	if value != testValue {
		t.Errorf("GetTerminalValue returned %v, expected %v", value, testValue)
	}

	// Test with built-in terminals
	value, isTerminal = mtbdd.GetTerminalValue(TrueRef)
	if !isTerminal {
		t.Errorf("GetTerminalValue on built-in TrueRef returned isTerminal=false")
	}
	if value != true {
		t.Errorf("GetTerminalValue on TrueRef returned %v, expected true", value)
	}

	value, isTerminal = mtbdd.GetTerminalValue(FalseRef)
	if !isTerminal {
		t.Errorf("GetTerminalValue on built-in FalseRef returned isTerminal=false")
	}
	if value != false {
		t.Errorf("GetTerminalValue on FalseRef returned %v, expected false", value)
	}

	// Test with invalid node reference
	value, isTerminal = mtbdd.GetTerminalValue(NodeRef(9999))
	if isTerminal {
		t.Errorf("GetTerminalValue on invalid node returned isTerminal=true")
	}
	if value != nil {
		t.Errorf("GetTerminalValue on invalid node returned value %v, expected nil", value)
	}
}

// TestIsTerminal tests terminal node identification
func TestIsTerminal(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test with terminal nodes
	terminalNode := mtbdd.Constant(3.14159)
	if !mtbdd.IsTerminal(terminalNode) {
		t.Errorf("IsTerminal returned false for terminal node")
	}

	// Test with invalid node reference
	if mtbdd.IsTerminal(NodeRef(9999)) {
		t.Errorf("IsTerminal returned true for invalid node reference")
	}

	// Test with built-in terminal references
	if !mtbdd.IsTerminal(TrueRef) {
		t.Errorf("IsTerminal returned false for built-in TrueRef")
	}

	if !mtbdd.IsTerminal(FalseRef) {
		t.Errorf("IsTerminal returned false for built-in FalseRef")
	}

	// Test with decision node
	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")
	if mtbdd.IsTerminal(x) {
		t.Errorf("IsTerminal returned true for decision node")
	}
}

// TestIsBooleanFunction tests boolean function detection
func TestIsBooleanFunction(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test with boolean terminal
	boolTerminal := mtbdd.Constant(true)
	if !mtbdd.IsBooleanFunction(boolTerminal) {
		t.Errorf("IsBooleanFunction returned false for boolean terminal")
	}

	// Test non-boolean terminal
	intTerminal := mtbdd.Constant(42)
	if mtbdd.IsBooleanFunction(intTerminal) {
		t.Errorf("IsBooleanFunction returned true for integer terminal")
	}

	// Test built-in boolean terminals
	if !mtbdd.IsBooleanFunction(TrueRef) {
		t.Errorf("IsBooleanFunction returned false for built-in TrueRef")
	}

	if !mtbdd.IsBooleanFunction(FalseRef) {
		t.Errorf("IsBooleanFunction returned false for built-in FalseRef")
	}

	// Test invalid node reference
	if mtbdd.IsBooleanFunction(NodeRef(9999)) {
		t.Errorf("IsBooleanFunction returned true for invalid node reference")
	}
}

// TestTerminalEdgeCases tests edge cases and boundary conditions with comparable types
func TestTerminalEdgeCases(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test with comparable complex types only
	// Note: We avoid slices, maps, and functions as they are not comparable in Go

	// Test with struct (comparable)
	type TestStruct struct {
		Name string
		Age  int
	}
	structValue := TestStruct{Name: "Alice", Age: 30}
	structNode := mtbdd.Constant(structValue)

	retrievedValue, isTerminal := mtbdd.GetTerminalValue(structNode)
	if !isTerminal {
		t.Errorf("Struct type not recognized as terminal")
	}

	if !reflect.DeepEqual(retrievedValue, structValue) {
		t.Errorf("Struct type not preserved correctly")
	}

	// Test with array (comparable, unlike slices)
	arrayValue := [5]int{1, 2, 3, 4, 5}
	arrayNode := mtbdd.Constant(arrayValue)

	retrievedArray, isTerminal := mtbdd.GetTerminalValue(arrayNode)
	if !isTerminal {
		t.Errorf("Array type not recognized as terminal")
	}

	if !reflect.DeepEqual(retrievedArray, arrayValue) {
		t.Errorf("Array type not preserved correctly")
	}

	// Test that different arrays with same content are properly handled
	arrayValue2 := [5]int{1, 2, 3, 4, 5}
	arrayNode2 := mtbdd.Constant(arrayValue2)

	// Same content should result in same node (arrays are comparable)
	if arrayNode != arrayNode2 {
		t.Errorf("Arrays with same content should get same node reference")
	}

	// Test with pointer (comparable)
	x := 42
	ptrValue := &x
	ptrNode := mtbdd.Constant(ptrValue)

	retrievedPtr, isTerminal := mtbdd.GetTerminalValue(ptrNode)
	if !isTerminal {
		t.Errorf("Pointer type not recognized as terminal")
	}

	if retrievedPtr != ptrValue {
		t.Errorf("Pointer type not preserved correctly")
	}
}

// TestTerminalTypes tests various comparable Go types as terminal values
func TestTerminalTypes(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test various comparable types
	testCases := []struct {
		name  string
		value interface{}
	}{
		{"nil", nil},
		{"bool true", true},
		{"bool false", false},
		{"int", 42},
		{"int8", int8(42)},
		{"int16", int16(42)},
		{"int32", int32(42)},
		{"int64", int64(42)},
		{"uint", uint(42)},
		{"uint8", uint8(42)},
		{"uint16", uint16(42)},
		{"uint32", uint32(42)},
		{"uint64", uint64(42)},
		{"float32", float32(3.14)},
		{"float64", float64(3.14)},
		{"string", "hello world"},
		{"empty string", ""},
		{"rune", 'A'},
		{"complex64", complex64(1 + 2i)},
		{"complex128", complex128(1 + 2i)},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			node := mtbdd.Constant(tc.value)

			// Should be terminal
			if !mtbdd.IsTerminal(node) {
				t.Errorf("Node with %s value not recognized as terminal", tc.name)
			}

			// Should retrieve correct value
			value, isTerminal := mtbdd.GetTerminalValue(node)
			if !isTerminal {
				t.Errorf("GetTerminalValue returned false for %s terminal", tc.name)
			}

			if !reflect.DeepEqual(value, tc.value) {
				t.Errorf("Retrieved value %v doesn't match original %v for %s", value, tc.value, tc.name)
			}

			// Creating same value again should return same node
			node2 := mtbdd.Constant(tc.value)
			if node != node2 {
				t.Errorf("Same %s value should return same node reference", tc.name)
			}
		})
	}
}

// TestIncomparableTypes tests that the MTBDD handles uncomparable types gracefully
func TestIncomparableTypes(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test that uncomparable types either work or fail gracefully
	// Note: This tests the robustness of the implementation

	testCases := []struct {
		name  string
		value interface{}
	}{
		{"slice", []int{1, 2, 3}},
		{"map", map[string]int{"a": 1, "b": 2}},
		{"channel", make(chan int)},
		{"function", func() {}},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// This should either work or panic gracefully
			// We'll catch any panic and treat it as expected behavior
			defer func() {
				if r := recover(); r != nil {
					t.Logf("Creating terminal with %s panicked as expected: %v", tc.name, r)
					// This is acceptable - uncomparable types may not be supported
				}
			}()

			node := mtbdd.Constant(tc.value)

			// If we get here without panic, the implementation handles this type
			if mtbdd.IsTerminal(node) {
				t.Logf("Successfully created terminal with %s type", tc.name)

				value, isTerminal := mtbdd.GetTerminalValue(node)
				if isTerminal {
					t.Logf("Successfully retrieved %s value: %v", tc.name, value)
				}
			}
		})
	}
}

// TestTerminalStatistics tests that terminal creation affects statistics correctly
func TestTerminalStatistics(t *testing.T) {
	mtbdd := NewMTBDD()

	// Get initial stats
	initialStats := mtbdd.GetMemoryStats()

	// Should start with 2 terminals (true/false)
	if initialStats.TerminalNodes < 2 {
		t.Errorf("Expected at least 2 initial terminal nodes, got %d", initialStats.TerminalNodes)
	}

	// Create some terminals
	mtbdd.Constant(42)
	mtbdd.Constant("hello")
	mtbdd.Constant(3.14)

	// Get updated stats
	newStats := mtbdd.GetMemoryStats()

	// Should have more terminals
	if newStats.TerminalNodes <= initialStats.TerminalNodes {
		t.Errorf("Terminal count should increase after creating terminals: %d -> %d",
			initialStats.TerminalNodes, newStats.TerminalNodes)
	}

	// Total nodes should increase
	if newStats.TotalNodes <= initialStats.TotalNodes {
		t.Errorf("Total node count should increase after creating terminals: %d -> %d",
			initialStats.TotalNodes, newStats.TotalNodes)
	}

	// Terminal + Decision should equal Total
	if newStats.TerminalNodes+newStats.DecisionNodes != newStats.TotalNodes {
		t.Errorf("TerminalNodes(%d) + DecisionNodes(%d) != TotalNodes(%d)",
			newStats.TerminalNodes, newStats.DecisionNodes, newStats.TotalNodes)
	}
}

// TestTerminalMemoryEfficiency tests that identical terminals are shared
func TestTerminalMemoryEfficiency(t *testing.T) {
	mtbdd := NewMTBDD()

	// Get initial node count
	initialStats := mtbdd.GetMemoryStats()

	// Create many terminals with same values
	value := 42
	nodes := make([]NodeRef, 100)
	for i := 0; i < 100; i++ {
		nodes[i] = mtbdd.Constant(value)
	}

	// All should be the same reference
	for i := 1; i < len(nodes); i++ {
		if nodes[i] != nodes[0] {
			t.Errorf("Identical terminal values should return same reference: nodes[0]=%d, nodes[%d]=%d",
				nodes[0], i, nodes[i])
		}
	}

	// Node count should increase by only 1 (for the new terminal value)
	finalStats := mtbdd.GetMemoryStats()
	expectedIncrease := 1 // Only one new terminal should be created
	actualIncrease := finalStats.TotalNodes - initialStats.TotalNodes

	if actualIncrease != expectedIncrease {
		t.Errorf("Expected node count to increase by %d, but increased by %d",
			expectedIncrease, actualIncrease)
	}
}

// TestTerminalConcurrency tests that terminal creation is thread-safe
func TestTerminalConcurrency(t *testing.T) {
	mtbdd := NewMTBDD()

	const numGoroutines = 10
	const numTerminals = 10

	results := make([][]NodeRef, numGoroutines)
	done := make(chan int, numGoroutines)

	// Create terminals concurrently
	for i := 0; i < numGoroutines; i++ {
		go func(id int) {
			defer func() { done <- id }()

			results[id] = make([]NodeRef, numTerminals)
			for j := 0; j < numTerminals; j++ {
				// Each goroutine creates terminals with same values
				results[id][j] = mtbdd.Constant(j * 10)
			}
		}(i)
	}

	// Wait for all goroutines
	for i := 0; i < numGoroutines; i++ {
		<-done
	}

	// Verify all goroutines got same references for same values
	for i := 1; i < numGoroutines; i++ {
		for j := 0; j < numTerminals; j++ {
			if results[i][j] != results[0][j] {
				t.Errorf("Concurrent terminal creation inconsistent: results[0][%d]=%d, results[%d][%d]=%d",
					j, results[0][j], i, j, results[i][j])
			}
		}
	}

	// Verify all terminals are valid
	for i := 0; i < numGoroutines; i++ {
		for j := 0; j < numTerminals; j++ {
			if !mtbdd.IsTerminal(results[i][j]) {
				t.Errorf("Node returned by concurrent creation is not terminal: results[%d][%d]=%d",
					i, j, results[i][j])
			}
		}
	}
}

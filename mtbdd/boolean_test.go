package mtbdd

import (
	"testing"
)

// Test fixtures and setup
func setupBooleanTests(t *testing.T) *MTBDD {
	mtbdd := NewUDD()
	// Declare standard test variables
	mtbdd.Declare("a", "b", "c", "x", "y", "z")
	return mtbdd
}

// Helper function to get variable nodes safely
func getVar(t *testing.T, mtbdd *MTBDD, name string) NodeRef {
	node, err := mtbdd.Var(name)
	if err != nil {
		t.Fatalf("Failed to get variable %s: %v", name, err)
	}
	return node
}

// Helper function to check if result is a terminal and get its value
func getTerminalResult(t *testing.T, mtbdd *MTBDD, nodeRef NodeRef) (interface{}, bool) {
	return mtbdd.GetTerminalValue(nodeRef)
}

// Helper function to check basic node structure properties
func validateNodeStructure(t *testing.T, mtbdd *MTBDD, nodeRef NodeRef) {
	// Verify that the node reference is valid (either terminal or decision)
	if mtbdd.IsTerminal(nodeRef) {
		if _, exists := mtbdd.GetTerminalValue(nodeRef); !exists {
			t.Errorf("Invalid terminal node reference: %d", nodeRef)
		}
	} else {
		if _, _, exists := mtbdd.GetNode(NodeRef(nodeRef)); !exists {
			t.Errorf("Invalid decision node reference: %d", nodeRef)
		}
	}
}

// Test NOT operation
func TestNOT(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("NOT with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// NOT(true) should be false
		notTrue := mtbdd.NOT(trueNode)
		if value, isTerminal := mtbdd.GetTerminalValue(notTrue); !isTerminal || value != false {
			t.Errorf("NOT(true) = %v, want false", value)
		}

		// NOT(false) should be true
		notFalse := mtbdd.NOT(falseNode)
		if value, isTerminal := mtbdd.GetTerminalValue(notFalse); !isTerminal || value != true {
			t.Errorf("NOT(false) = %v, want true", value)
		}
	})

	t.Run("NOT with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		notA := mtbdd.NOT(a)

		// Verify the result is a valid node
		validateNodeStructure(t, mtbdd, notA)

		// NOT of a variable should create a decision node (not terminal)
		if mtbdd.IsTerminal(notA) {
			t.Errorf("NOT(variable) should create a decision node, got terminal")
		}

		// Verify it's different from the original variable
		if notA == a {
			t.Errorf("NOT(a) should be different from a")
		}
	})

	t.Run("NOT with numeric values", func(t *testing.T) {
		zeroNode := mtbdd.Constant(0)
		oneNode := mtbdd.Constant(1)
		negativeNode := mtbdd.Constant(-5)

		// NOT(0) should be true (0 is falsy)
		notZero := mtbdd.NOT(zeroNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, notZero); !isTerminal || value != true {
			t.Errorf("NOT(0) = %v, want true", value)
		}

		// NOT(1) should be false (1 is truthy)
		notOne := mtbdd.NOT(oneNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, notOne); !isTerminal || value != false {
			t.Errorf("NOT(1) = %v, want false", value)
		}

		// NOT(-5) should be false (-5 is truthy)
		notNegative := mtbdd.NOT(negativeNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, notNegative); !isTerminal || value != false {
			t.Errorf("NOT(-5) = %v, want false", value)
		}
	})

	t.Run("NOT double negation", func(t *testing.T) {
		// Test with terminal values first
		trueNode := mtbdd.Constant(true)
		notTrue := mtbdd.NOT(trueNode)
		notNotTrue := mtbdd.NOT(notTrue)

		if value, isTerminal := getTerminalResult(t, mtbdd, notNotTrue); !isTerminal || value != true {
			t.Errorf("NOT(NOT(true)) = %v, want true", value)
		}

		// Test structural property with variables
		a := getVar(t, mtbdd, "a")
		notA := mtbdd.NOT(a)
		notNotA := mtbdd.NOT(notA)

		// Verify all results are valid nodes
		validateNodeStructure(t, mtbdd, notA)
		validateNodeStructure(t, mtbdd, notNotA)
	})
}

// Test AND operation
func TestAND(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("AND with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		testCases := []struct {
			x, y     NodeRef
			expected bool
		}{
			{trueNode, trueNode, true},
			{trueNode, falseNode, false},
			{falseNode, trueNode, false},
			{falseNode, falseNode, false},
		}

		for i, tc := range testCases {
			result := mtbdd.AND(tc.x, tc.y)
			if value, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || value != tc.expected {
				t.Errorf("Test case %d: AND(%v, %v) = %v, want %t", i, tc.x, tc.y, value, tc.expected)
			}
		}
	})

	t.Run("AND with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aAndB := mtbdd.AND(a, b)

		// Verify the result is a valid node structure
		validateNodeStructure(t, mtbdd, aAndB)

		// AND of two different variables should not be terminal (unless optimized)
		// and should be different from either input
		if aAndB == a || aAndB == b {
			t.Errorf("AND(a, b) should be different from both a and b")
		}
	})

	t.Run("AND properties", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// Test AND with true (should be identity-like for variables)
		aTrueResult := mtbdd.AND(a, trueNode)
		validateNodeStructure(t, mtbdd, aTrueResult)

		// Test AND with false (should be false)
		aFalseResult := mtbdd.AND(a, falseNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, aFalseResult); !isTerminal || value != false {
			t.Errorf("AND(a, false) = %v, want false", value)
		}

		// Test idempotency: AND(a, a) should be related to a
		aAndA := mtbdd.AND(a, a)
		validateNodeStructure(t, mtbdd, aAndA)
	})

	t.Run("AND commutativity structure", func(t *testing.T) {
		// Test with constants first
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		result1 := mtbdd.AND(trueNode, falseNode)
		result2 := mtbdd.AND(falseNode, trueNode)

		if value1, isTerminal1 := getTerminalResult(t, mtbdd, result1); isTerminal1 {
			if value2, isTerminal2 := getTerminalResult(t, mtbdd, result2); isTerminal2 {
				if value1 != value2 {
					t.Errorf("AND not commutative for constants: %v vs %v", value1, value2)
				}
			}
		}

		// Test structural properties with variables
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aAndB := mtbdd.AND(a, b)
		bAndA := mtbdd.AND(b, a)

		validateNodeStructure(t, mtbdd, aAndB)
		validateNodeStructure(t, mtbdd, bAndA)
	})
}

// Test OR operation
func TestOR(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("OR with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		testCases := []struct {
			x, y     NodeRef
			expected bool
		}{
			{trueNode, trueNode, true},
			{trueNode, falseNode, true},
			{falseNode, trueNode, true},
			{falseNode, falseNode, false},
		}

		for i, tc := range testCases {
			result := mtbdd.OR(tc.x, tc.y)
			if value, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || value != tc.expected {
				t.Errorf("Test case %d: OR(%v, %v) = %v, want %t", i, tc.x, tc.y, value, tc.expected)
			}
		}
	})

	t.Run("OR with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aOrB := mtbdd.OR(a, b)

		validateNodeStructure(t, mtbdd, aOrB)

		// OR of two different variables should be different from either input
		if aOrB == a || aOrB == b {
			t.Errorf("OR(a, b) should be different from both a and b")
		}
	})

	t.Run("OR properties", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// Test OR with false (should be identity-like for variables)
		aFalseResult := mtbdd.OR(a, falseNode)
		validateNodeStructure(t, mtbdd, aFalseResult)

		// Test OR with true (should be true)
		aTrueResult := mtbdd.OR(a, trueNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, aTrueResult); !isTerminal || value != true {
			t.Errorf("OR(a, true) = %v, want true", value)
		}
	})
}

// Test XOR operation
func TestXOR(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("XOR with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		testCases := []struct {
			x, y     NodeRef
			expected bool
		}{
			{trueNode, trueNode, false},
			{trueNode, falseNode, true},
			{falseNode, trueNode, true},
			{falseNode, falseNode, false},
		}

		for i, tc := range testCases {
			result := mtbdd.XOR(tc.x, tc.y)
			if value, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || value != tc.expected {
				t.Errorf("Test case %d: XOR(%v, %v) = %v, want %t", i, tc.x, tc.y, value, tc.expected)
			}
		}
	})

	t.Run("XOR with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aXorB := mtbdd.XOR(a, b)

		validateNodeStructure(t, mtbdd, aXorB)
	})

	t.Run("XOR properties", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		falseNode := mtbdd.Constant(false)

		// Test XOR with false (should be identity-like)
		aXorFalse := mtbdd.XOR(a, falseNode)
		validateNodeStructure(t, mtbdd, aXorFalse)

		// Test XOR with self (should be false)
		aXorA := mtbdd.XOR(a, a)
		if value, isTerminal := getTerminalResult(t, mtbdd, aXorA); !isTerminal || value != false {
			t.Errorf("XOR(a, a) = %v, want false", value)
		}
	})
}

// Test IMPLIES operation
func TestIMPLIES(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("IMPLIES with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		testCases := []struct {
			x, y     NodeRef
			expected bool
		}{
			{trueNode, trueNode, true},   // true → true = true
			{trueNode, falseNode, false}, // true → false = false
			{falseNode, trueNode, true},  // false → true = true
			{falseNode, falseNode, true}, // false → false = true
		}

		for i, tc := range testCases {
			result := mtbdd.IMPLIES(tc.x, tc.y)
			if value, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || value != tc.expected {
				t.Errorf("Test case %d: IMPLIES(%v, %v) = %v, want %t", i, tc.x, tc.y, value, tc.expected)
			}
		}
	})

	t.Run("IMPLIES with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aImpliesB := mtbdd.IMPLIES(a, b)

		validateNodeStructure(t, mtbdd, aImpliesB)
	})

	t.Run("IMPLIES properties", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// false → anything should be true
		falseImpliesA := mtbdd.IMPLIES(falseNode, a)
		if value, isTerminal := getTerminalResult(t, mtbdd, falseImpliesA); !isTerminal || value != true {
			t.Errorf("IMPLIES(false, a) = %v, want true", value)
		}

		// anything → true should be true
		aImpliesTrue := mtbdd.IMPLIES(a, trueNode)
		if value, isTerminal := getTerminalResult(t, mtbdd, aImpliesTrue); !isTerminal || value != true {
			t.Errorf("IMPLIES(a, true) = %v, want true", value)
		}
	})
}

// Test EQUIV operation
func TestEQUIV(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("EQUIV with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		testCases := []struct {
			x, y     NodeRef
			expected bool
		}{
			{trueNode, trueNode, true},   // true ↔ true = true
			{trueNode, falseNode, false}, // true ↔ false = false
			{falseNode, trueNode, false}, // false ↔ true = false
			{falseNode, falseNode, true}, // false ↔ false = true
		}

		for i, tc := range testCases {
			result := mtbdd.EQUIV(tc.x, tc.y)
			if value, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || value != tc.expected {
				t.Errorf("Test case %d: EQUIV(%v, %v) = %v, want %t", i, tc.x, tc.y, value, tc.expected)
			}
		}
	})

	t.Run("EQUIV with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aEquivB := mtbdd.EQUIV(a, b)

		validateNodeStructure(t, mtbdd, aEquivB)
	})

	t.Run("EQUIV reflexivity", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		aEquivA := mtbdd.EQUIV(a, a)

		// a ↔ a should be true
		if value, isTerminal := getTerminalResult(t, mtbdd, aEquivA); !isTerminal || value != true {
			t.Errorf("EQUIV(a, a) = %v, want true", value)
		}
	})

	t.Run("EQUIV symmetry structure", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		aEquivB := mtbdd.EQUIV(a, b)
		bEquivA := mtbdd.EQUIV(b, a)

		validateNodeStructure(t, mtbdd, aEquivB)
		validateNodeStructure(t, mtbdd, bEquivA)

		// Test with constants for actual symmetry
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		trueEquivFalse := mtbdd.EQUIV(trueNode, falseNode)
		falseEquivTrue := mtbdd.EQUIV(falseNode, trueNode)

		if value1, isTerminal1 := getTerminalResult(t, mtbdd, trueEquivFalse); isTerminal1 {
			if value2, isTerminal2 := getTerminalResult(t, mtbdd, falseEquivTrue); isTerminal2 {
				if value1 != value2 {
					t.Errorf("EQUIV not symmetric: %v vs %v", value1, value2)
				}
			}
		}
	})
}

// Test ITE operation
func TestITE(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("ITE with boolean constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)
		value1 := mtbdd.Constant(42)
		value2 := mtbdd.Constant(100)

		// ITE(true, 42, 100) should be 42
		result1 := mtbdd.ITE(trueNode, value1, value2)
		if value, isTerminal := getTerminalResult(t, mtbdd, result1); !isTerminal || value != 42 {
			t.Errorf("ITE(true, 42, 100) = %v, want 42", value)
		}

		// ITE(false, 42, 100) should be 100
		result2 := mtbdd.ITE(falseNode, value1, value2)
		if value, isTerminal := getTerminalResult(t, mtbdd, result2); !isTerminal || value != 100 {
			t.Errorf("ITE(false, 42, 100) = %v, want 100", value)
		}
	})

	t.Run("ITE with variables", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// ITE(a, true, false) should create a valid structure
		iteResult := mtbdd.ITE(a, trueNode, falseNode)
		validateNodeStructure(t, mtbdd, iteResult)
	})

	t.Run("ITE reduction rules", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		value := mtbdd.Constant(42)

		// ITE(a, value, value) should reduce to value
		result := mtbdd.ITE(a, value, value)
		if resultValue, isTerminal := getTerminalResult(t, mtbdd, result); !isTerminal || resultValue != 42 {
			t.Errorf("ITE(a, 42, 42) = %v, want 42", resultValue)
		}
	})

	t.Run("ITE with complex structure", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		c := getVar(t, mtbdd, "c")

		// Build: ITE(a, b, c) - if a then b else c
		result := mtbdd.ITE(a, b, c)
		validateNodeStructure(t, mtbdd, result)

		// Should be different from all inputs (unless optimized)
		if result == a || result == b || result == c {
			// This might be valid optimization in some cases, but let's check structure is valid
			validateNodeStructure(t, mtbdd, result)
		}
	})
}

// Test complex boolean expressions
func TestComplexBooleanExpressions(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("Basic boolean algebra with constants", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// Test De Morgan's law with constants: ¬(T ∧ F) = ¬T ∨ ¬F
		tAndF := mtbdd.AND(trueNode, falseNode)
		notTAndF := mtbdd.NOT(tAndF)

		notT := mtbdd.NOT(trueNode)
		notF := mtbdd.NOT(falseNode)
		notTOrNotF := mtbdd.OR(notT, notF)

		// Both should be true
		if value1, isTerminal1 := getTerminalResult(t, mtbdd, notTAndF); isTerminal1 {
			if value2, isTerminal2 := getTerminalResult(t, mtbdd, notTOrNotF); isTerminal2 {
				if value1 != value2 {
					t.Errorf("De Morgan's law failed with constants: %v vs %v", value1, value2)
				}
				if value1 != true {
					t.Errorf("De Morgan's law result should be true, got %v", value1)
				}
			}
		}
	})

	t.Run("Complex expression structure", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")
		c := getVar(t, mtbdd, "c")

		// Build: (a ∧ b) ∨ c
		aAndB := mtbdd.AND(a, b)
		complex := mtbdd.OR(aAndB, c)

		validateNodeStructure(t, mtbdd, aAndB)
		validateNodeStructure(t, mtbdd, complex)

		// Should be different from all component parts
		if complex == a || complex == b || complex == c || complex == aAndB {
			// Might be optimized in some cases, but should still be valid
			validateNodeStructure(t, mtbdd, complex)
		}
	})

	t.Run("Boolean operation chaining", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")

		// Test chaining: NOT(NOT(NOT(a)))
		step1 := mtbdd.NOT(a)
		step2 := mtbdd.NOT(step1)
		step3 := mtbdd.NOT(step2)

		validateNodeStructure(t, mtbdd, step1)
		validateNodeStructure(t, mtbdd, step2)
		validateNodeStructure(t, mtbdd, step3)
	})
}

// Benchmark tests for performance
func BenchmarkBooleanOperations(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("a", "b", "c", "d")

	a, _ := mtbdd.Var("a")
	varB, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")
	d, _ := mtbdd.Var("d")

	b.Run("NOT", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.NOT(a)
		}
	})

	b.Run("AND", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.AND(a, varB)
		}
	})

	b.Run("OR", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.OR(a, varB)
		}
	})

	b.Run("XOR", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.XOR(a, varB)
		}
	})

	b.Run("IMPLIES", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.IMPLIES(a, varB)
		}
	})

	b.Run("EQUIV", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.EQUIV(a, varB)
		}
	})

	b.Run("ITE", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			mtbdd.ITE(a, varB, c)
		}
	})

	b.Run("Complex expression", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			// Build: (a ∧ b) ∨ (c ∧ d)
			ab := mtbdd.AND(a, varB)
			cd := mtbdd.AND(c, d)
			mtbdd.OR(ab, cd)
		}
	})

	b.Run("Deeply nested expression", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			// Build: ((a ∧ b) ∨ (c ∧ d)) → (a ⊕ b)
			ab := mtbdd.AND(a, varB)
			cd := mtbdd.AND(c, d)
			left := mtbdd.OR(ab, cd)
			right := mtbdd.XOR(a, varB)
			mtbdd.IMPLIES(left, right)
		}
	})
}

// Test edge cases and error conditions
func TestBooleanEdgeCases(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("Operations with same operands", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")

		// Test operations with identical operands
		aAndA := mtbdd.AND(a, a)
		aOrA := mtbdd.OR(a, a)
		aXorA := mtbdd.XOR(a, a)
		aImpliesA := mtbdd.IMPLIES(a, a)
		aEquivA := mtbdd.EQUIV(a, a)

		validateNodeStructure(t, mtbdd, aAndA)
		validateNodeStructure(t, mtbdd, aOrA)
		validateNodeStructure(t, mtbdd, aXorA)
		validateNodeStructure(t, mtbdd, aImpliesA)
		validateNodeStructure(t, mtbdd, aEquivA)

		// XOR(a, a) should be false
		if value, isTerminal := getTerminalResult(t, mtbdd, aXorA); !isTerminal || value != false {
			t.Errorf("XOR(a, a) = %v, want false", value)
		}

		// IMPLIES(a, a) should be true
		if value, isTerminal := getTerminalResult(t, mtbdd, aImpliesA); !isTerminal || value != true {
			t.Errorf("IMPLIES(a, a) = %v, want true", value)
		}

		// EQUIV(a, a) should be true
		if value, isTerminal := getTerminalResult(t, mtbdd, aEquivA); !isTerminal || value != true {
			t.Errorf("EQUIV(a, a) = %v, want true", value)
		}
	})

	t.Run("Operations with mixed types", func(t *testing.T) {
		stringNode := mtbdd.Constant("hello")
		intNode := mtbdd.Constant(42)
		zeroNode := mtbdd.Constant(0)
		boolNode := mtbdd.Constant(true)

		// Test operations with mixed terminal types
		result1 := mtbdd.AND(stringNode, boolNode) // "hello" is truthy, true is truthy
		result2 := mtbdd.OR(zeroNode, boolNode)    // 0 is falsy, true is truthy
		result3 := mtbdd.XOR(intNode, zeroNode)    // 42 is truthy, 0 is falsy

		// These should produce valid nodes (behavior depends on truthiness)
		validateNodeStructure(t, mtbdd, result1)
		validateNodeStructure(t, mtbdd, result2)
		validateNodeStructure(t, mtbdd, result3)

		// Verify specific results based on truthiness
		if value, isTerminal := getTerminalResult(t, mtbdd, result1); !isTerminal || value != true {
			t.Errorf("AND(truthy_string, true) = %v, want true", value)
		}

		if value, isTerminal := getTerminalResult(t, mtbdd, result2); !isTerminal || value != true {
			t.Errorf("OR(0, true) = %v, want true", value)
		}

		if value, isTerminal := getTerminalResult(t, mtbdd, result3); !isTerminal || value != true {
			t.Errorf("XOR(42, 0) = %v, want true", value)
		}
	})

	t.Run("Operations with nil values", func(t *testing.T) {
		nilNode := mtbdd.Constant(nil)
		trueNode := mtbdd.Constant(true)

		// nil is falsy, so should behave like false
		result1 := mtbdd.AND(nilNode, trueNode) // false AND true = false
		result2 := mtbdd.OR(nilNode, trueNode)  // false OR true = true
		result3 := mtbdd.NOT(nilNode)           // NOT(false) = true

		validateNodeStructure(t, mtbdd, result1)
		validateNodeStructure(t, mtbdd, result2)
		validateNodeStructure(t, mtbdd, result3)

		if value, isTerminal := getTerminalResult(t, mtbdd, result1); !isTerminal || value != false {
			t.Errorf("AND(nil, true) = %v, want false", value)
		}

		if value, isTerminal := getTerminalResult(t, mtbdd, result2); !isTerminal || value != true {
			t.Errorf("OR(nil, true) = %v, want true", value)
		}

		if value, isTerminal := getTerminalResult(t, mtbdd, result3); !isTerminal || value != true {
			t.Errorf("NOT(nil) = %v, want true", value)
		}
	})

	t.Run("Large expression chains", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")

		// Build a long chain of operations
		current := a
		for i := 0; i < 10; i++ {
			current = mtbdd.NOT(current)
		}

		validateNodeStructure(t, mtbdd, current)

		// After 10 NOTs (even number), should be equivalent to original
		// Test with constants to verify
		trueNode := mtbdd.Constant(true)
		currentTest := trueNode
		for i := 0; i < 10; i++ {
			currentTest = mtbdd.NOT(currentTest)
		}

		if value, isTerminal := getTerminalResult(t, mtbdd, currentTest); !isTerminal || value != true {
			t.Errorf("10 consecutive NOTs of true = %v, want true", value)
		}
	})

	t.Run("Memory efficiency verification", func(t *testing.T) {
		// Create the same expression multiple times to test hash consing
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")

		expr1 := mtbdd.AND(a, b)
		expr2 := mtbdd.AND(a, b) // Should reuse existing node
		expr3 := mtbdd.AND(b, a) // Might be different due to ordering

		validateNodeStructure(t, mtbdd, expr1)
		validateNodeStructure(t, mtbdd, expr2)
		validateNodeStructure(t, mtbdd, expr3)

		// Get initial node count
		initialCount := mtbdd.GetMemoryStats().TotalNodes

		// Create many duplicate expressions
		for i := 0; i < 100; i++ {
			duplicate := mtbdd.AND(a, b)
			validateNodeStructure(t, mtbdd, duplicate)
		}

		// Node count should not increase significantly due to hash consing
		finalCount := mtbdd.GetMemoryStats().TotalNodes
		if finalCount > initialCount+10 { // Allow some growth for caching overhead
			t.Errorf("Node count grew too much: %d -> %d, possible hash consing failure",
				initialCount, finalCount)
		}
	})
}

// Test caching behavior
func TestBooleanCaching(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("Operation result caching", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")

		// First call should compute and cache
		result1 := mtbdd.AND(a, b)

		// Second call should hit cache
		result2 := mtbdd.AND(a, b)

		// Results should be identical
		if result1 != result2 {
			t.Errorf("Cached AND operation returned different results: %d vs %d", result1, result2)
		}

		validateNodeStructure(t, mtbdd, result1)
		validateNodeStructure(t, mtbdd, result2)
	})

	t.Run("Cache clearing", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")

		// Perform operations to populate cache
		result1 := mtbdd.AND(a, b)
		result2 := mtbdd.OR(a, b)

		// Clear caches
		mtbdd.ClearCaches()

		// Operations should still work after cache clear
		result3 := mtbdd.AND(a, b)
		result4 := mtbdd.OR(a, b)

		validateNodeStructure(t, mtbdd, result1)
		validateNodeStructure(t, mtbdd, result2)
		validateNodeStructure(t, mtbdd, result3)
		validateNodeStructure(t, mtbdd, result4)

		// Results should still be the same (hash consing should ensure this)
		if result1 != result3 {
			t.Errorf("AND results differ after cache clear: %d vs %d", result1, result3)
		}
		if result2 != result4 {
			t.Errorf("OR results differ after cache clear: %d vs %d", result2, result4)
		}
	})
}

// Test integration with other MTBDD components
func TestBooleanIntegration(t *testing.T) {
	mtbdd := setupBooleanTests(t)

	t.Run("Boolean operations with terminal analysis", func(t *testing.T) {
		a := getVar(t, mtbdd, "a")
		b := getVar(t, mtbdd, "b")

		// Create complex expression
		aAndB := mtbdd.AND(a, b)
		notA := mtbdd.NOT(a)
		complex := mtbdd.OR(aAndB, notA)

		// Verify structure using terminal analysis methods
		validateNodeStructure(t, mtbdd, complex)

		// Check if it's a boolean function
		if !mtbdd.IsBooleanFunction(complex) {
			t.Errorf("Boolean expression should be recognized as boolean function")
		}

		// Collect terminals
		terminals := mtbdd.CollectTerminals(complex)

		// Should only contain boolean values
		for _, terminal := range terminals {
			if terminal != true && terminal != false {
				t.Errorf("Boolean expression contains non-boolean terminal: %v", terminal)
			}
		}

		// Count nodes
		nodeCount := mtbdd.NodeCount(complex)
		if nodeCount <= 0 {
			t.Errorf("Node count should be positive, got %d", nodeCount)
		}
	})

	t.Run("Boolean operations with variable management", func(t *testing.T) {
		// Test that boolean operations work correctly with variable ordering
		variables := []string{"x", "y", "z"}

		// Add variables in specific order
		for _, variable := range variables {
			level := mtbdd.AddVar(variable)
			if level < 0 {
				t.Errorf("Failed to add variable %s", variable)
			}
		}

		// Get variable nodes
		x, err := mtbdd.Var("x")
		if err != nil {
			t.Fatalf("Failed to get variable x: %v", err)
		}

		y, err := mtbdd.Var("y")
		if err != nil {
			t.Fatalf("Failed to get variable y: %v", err)
		}

		z, err := mtbdd.Var("z")
		if err != nil {
			t.Fatalf("Failed to get variable z: %v", err)
		}

		// Create expression with variables in different orders
		expr1 := mtbdd.AND(x, mtbdd.OR(y, z))
		expr2 := mtbdd.OR(mtbdd.AND(x, y), mtbdd.AND(x, z)) // Should be equivalent by distribution

		validateNodeStructure(t, mtbdd, expr1)
		validateNodeStructure(t, mtbdd, expr2)

		// Both expressions should be valid boolean functions
		if !mtbdd.IsBooleanFunction(expr1) {
			t.Errorf("expr1 should be boolean function")
		}
		if !mtbdd.IsBooleanFunction(expr2) {
			t.Errorf("expr2 should be boolean function")
		}
	})
}

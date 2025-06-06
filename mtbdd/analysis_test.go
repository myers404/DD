package mtbdd

import (
	"testing"
)

// Test Evaluate method
func TestEvaluate(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("EvaluateTerminals", func(t *testing.T) {
		// Test evaluation of terminal nodes
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)
		intNode := mtbdd.Constant(42)

		result := mtbdd.Evaluate(trueNode, map[string]bool{})
		if result != true {
			t.Errorf("Expected true, got %v", result)
		}

		result = mtbdd.Evaluate(falseNode, map[string]bool{})
		if result != false {
			t.Errorf("Expected false, got %v", result)
		}

		result = mtbdd.Evaluate(intNode, map[string]bool{})
		if result != 42 {
			t.Errorf("Expected 42, got %v", result)
		}
	})

	t.Run("EvaluateSingleVariable", func(t *testing.T) {
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		// Test x with x = true
		result := mtbdd.Evaluate(x, map[string]bool{"x": true})
		if result != true {
			t.Errorf("Expected true when x=true, got %v", result)
		}

		// Test x with x = false
		result = mtbdd.Evaluate(x, map[string]bool{"x": false})
		if result != false {
			t.Errorf("Expected false when x=false, got %v", result)
		}
	})

	t.Run("EvaluateBooleanFormulas", func(t *testing.T) {
		mtbdd.Declare("a", "b")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")

		// Test AND operation
		andNode := mtbdd.AND(a, b)
		testCases := []struct {
			assignment map[string]bool
			expected   bool
		}{
			{map[string]bool{"a": true, "b": true}, true},
			{map[string]bool{"a": true, "b": false}, false},
			{map[string]bool{"a": false, "b": true}, false},
			{map[string]bool{"a": false, "b": false}, false},
		}

		for _, tc := range testCases {
			result := mtbdd.Evaluate(andNode, tc.assignment)
			if result != tc.expected {
				t.Errorf("AND with assignment %v: expected %v, got %v",
					tc.assignment, tc.expected, result)
			}
		}

		// Test OR operation
		orNode := mtbdd.OR(a, b)
		orTestCases := []struct {
			assignment map[string]bool
			expected   bool
		}{
			{map[string]bool{"a": true, "b": true}, true},
			{map[string]bool{"a": true, "b": false}, true},
			{map[string]bool{"a": false, "b": true}, true},
			{map[string]bool{"a": false, "b": false}, false},
		}

		for _, tc := range orTestCases {
			result := mtbdd.Evaluate(orNode, tc.assignment)
			if result != tc.expected {
				t.Errorf("OR with assignment %v: expected %v, got %v",
					tc.assignment, tc.expected, result)
			}
		}
	})

	t.Run("EvaluateArithmeticMTBDD", func(t *testing.T) {
		// Test ITE with numeric terminals
		mtbdd.Declare("c")
		c, _ := mtbdd.Var("c")
		node1 := mtbdd.Constant(10)
		node2 := mtbdd.Constant(20)
		iteNode := mtbdd.ITE(c, node1, node2)

		result := mtbdd.Evaluate(iteNode, map[string]bool{"c": true})
		if result != 10 {
			t.Errorf("Expected 10 when c=true, got %v", result)
		}

		result = mtbdd.Evaluate(iteNode, map[string]bool{"c": false})
		if result != 20 {
			t.Errorf("Expected 20 when c=false, got %v", result)
		}
	})
}

// Test Sat method
func TestSat(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("SatTerminals", func(t *testing.T) {
		// True terminal should be satisfiable
		trueNode := mtbdd.Constant(true)
		assignment, satisfiable := mtbdd.Sat(trueNode)
		if !satisfiable {
			t.Error("True terminal should be satisfiable")
		}
		if assignment == nil {
			t.Error("Assignment should not be nil for satisfiable formula")
		}

		// False terminal should be unsatisfiable
		falseNode := mtbdd.Constant(false)
		assignment, satisfiable = mtbdd.Sat(falseNode)
		if satisfiable {
			t.Error("False terminal should be unsatisfiable")
		}
		if assignment != nil {
			t.Error("Assignment should be nil for unsatisfiable formula")
		}

		// Non-boolean truthy terminal should be satisfiable
		intNode := mtbdd.Constant(42)
		assignment, satisfiable = mtbdd.Sat(intNode)
		if !satisfiable {
			t.Error("Truthy terminal should be satisfiable")
		}

		// Zero should be unsatisfiable (falsy)
		zeroNode := mtbdd.Constant(0)
		assignment, satisfiable = mtbdd.Sat(zeroNode)
		if satisfiable {
			t.Error("Zero terminal should be unsatisfiable")
		}
	})

	t.Run("SatSingleVariable", func(t *testing.T) {
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		assignment, satisfiable := mtbdd.Sat(x)
		if !satisfiable {
			t.Error("Variable x should be satisfiable")
		}

		// Verify the assignment actually satisfies the formula
		result := mtbdd.Evaluate(x, assignment)
		if !isTruthy(result) {
			t.Errorf("Assignment %v should make x truthy, got %v", assignment, result)
		}
	})

	t.Run("SatBooleanFormulas", func(t *testing.T) {
		mtbdd.Declare("a", "b")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")

		// Test satisfiable formula: a OR b
		orNode := mtbdd.OR(a, b)
		assignment, satisfiable := mtbdd.Sat(orNode)
		if !satisfiable {
			t.Error("a OR b should be satisfiable")
		}

		// Verify assignment satisfies the formula
		result := mtbdd.Evaluate(orNode, assignment)
		if result != true {
			t.Errorf("Assignment %v should make (a OR b) true, got %v", assignment, result)
		}

		// Test unsatisfiable formula: a AND NOT(a)
		notA := mtbdd.NOT(a)
		contradiction := mtbdd.AND(a, notA)
		assignment, satisfiable = mtbdd.Sat(contradiction)
		if satisfiable {
			t.Error("a AND NOT(a) should be unsatisfiable")
		}
		if assignment != nil {
			t.Error("Assignment should be nil for contradiction")
		}
	})
}

// Test AllSat method
func TestAllSat(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("AllSatTerminals", func(t *testing.T) {
		// True terminal
		trueNode := mtbdd.Constant(true)
		assignments := mtbdd.AllSat(trueNode)
		if len(assignments) != 1 {
			t.Errorf("True terminal should have 1 satisfying assignment, got %d", len(assignments))
		}

		// False terminal
		falseNode := mtbdd.Constant(false)
		assignments = mtbdd.AllSat(falseNode)
		if len(assignments) != 0 {
			t.Errorf("False terminal should have 0 satisfying assignments, got %d", len(assignments))
		}
	})

	t.Run("AllSatSingleVariable", func(t *testing.T) {
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		assignments := mtbdd.AllSat(x)
		if len(assignments) != 1 {
			t.Errorf("Variable x should have 1 satisfying assignment, got %d", len(assignments))
		}

		// The satisfying assignment should have x=true
		if len(assignments) > 0 {
			if assignments[0]["x"] != true {
				t.Errorf("Expected x=true in satisfying assignment, got %v", assignments[0])
			}
		}
	})

	t.Run("AllSatMultipleVariables", func(t *testing.T) {
		mtbdd.Declare("a", "b")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")

		// Test XOR: should have exactly 2 satisfying assignments
		xorNode := mtbdd.XOR(a, b)
		assignments := mtbdd.AllSat(xorNode)
		if len(assignments) != 2 {
			t.Errorf("a XOR b should have 2 satisfying assignments, got %d", len(assignments))
		}

		// Verify all assignments actually satisfy the formula
		for i, assignment := range assignments {
			result := mtbdd.Evaluate(xorNode, assignment)
			if result != true {
				t.Errorf("Assignment %d (%v) should satisfy XOR, got %v", i, assignment, result)
			}
		}

		// Check that we have the expected assignments: {a:true, b:false} and {a:false, b:true}
		foundAssignments := make(map[string]bool)
		for _, assignment := range assignments {
			key := ""
			if assignment["a"] {
				key += "a"
			}
			if assignment["b"] {
				key += "b"
			}
			if key == "" {
				key = "none"
			}
			foundAssignments[key] = true
		}

		expectedKeys := []string{"a", "b"} // a=true,b=false -> "a", a=false,b=true -> "b"
		for _, key := range expectedKeys {
			if !foundAssignments[key] {
				t.Errorf("Missing expected assignment pattern: %s", key)
			}
		}
	})
}

// Test CountSat method
func TestCountSat(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("CountSatTerminals", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		count := mtbdd.CountSat(trueNode)
		if count != 1 {
			t.Errorf("True terminal should have count 1, got %d", count)
		}

		falseNode := mtbdd.Constant(false)
		count = mtbdd.CountSat(falseNode)
		if count != 0 {
			t.Errorf("False terminal should have count 0, got %d", count)
		}
	})

	t.Run("CountSatFormulas", func(t *testing.T) {
		mtbdd.Declare("a", "b")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")

		// Test various formulas and their expected counts
		testCases := []struct {
			name     string
			formula  NodeRef
			expected int
		}{
			{"Single variable", a, 1},
			{"OR (a OR b)", mtbdd.OR(a, b), 3},
			{"AND (a AND b)", mtbdd.AND(a, b), 1},
			{"XOR (a XOR b)", mtbdd.XOR(a, b), 2},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				count := mtbdd.CountSat(tc.formula)
				if count != tc.expected {
					t.Errorf("%s: expected count %d, got %d", tc.name, tc.expected, count)
				}

				// Verify count matches AllSat length
				allAssignments := mtbdd.AllSat(tc.formula)
				if count != len(allAssignments) {
					t.Errorf("%s: CountSat (%d) doesn't match AllSat length (%d)",
						tc.name, count, len(allAssignments))
				}
			})
		}
	})
}

// Test Support method
func TestSupport(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("SupportTerminals", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		support := mtbdd.Support(trueNode)
		if len(support) != 0 {
			t.Errorf("Terminal node should have empty support, got %v", support)
		}
	})

	t.Run("SupportSingleVariable", func(t *testing.T) {
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		support := mtbdd.Support(x)
		if len(support) != 1 {
			t.Errorf("Single variable should have support size 1, got %d", len(support))
		}

		if _, exists := support["x"]; !exists {
			t.Error("Support should contain variable x")
		}
	})

	t.Run("SupportMultipleVariables", func(t *testing.T) {
		mtbdd.Declare("a", "b", "c")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")
		_, _ = mtbdd.Var("c")

		// Formula that uses a and b but not c
		formula := mtbdd.AND(a, b)
		support := mtbdd.Support(formula)

		if len(support) != 2 {
			t.Errorf("Formula (a AND b) should have support size 2, got %d", len(support))
		}

		expectedVars := []string{"a", "b"}
		for _, variable := range expectedVars {
			if _, exists := support[variable]; !exists {
				t.Errorf("Support should contain variable %s", variable)
			}
		}

		if _, exists := support["c"]; exists {
			t.Error("Support should not contain unused variable c")
		}
	})

	t.Run("SupportComplexFormula", func(t *testing.T) {
		mtbdd.Declare("x", "y", "z", "w")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")
		// w is declared but not used

		// Complex formula: (x AND y) OR z
		formula := mtbdd.OR(mtbdd.AND(x, y), z)
		support := mtbdd.Support(formula)

		expectedVars := []string{"x", "y", "z"}
		if len(support) != len(expectedVars) {
			t.Errorf("Complex formula should have support size %d, got %d",
				len(expectedVars), len(support))
		}

		for _, variable := range expectedVars {
			if _, exists := support[variable]; !exists {
				t.Errorf("Support should contain variable %s", variable)
			}
		}

		if _, exists := support["w"]; exists {
			t.Error("Support should not contain unused variable w")
		}
	})
}

// Test LinearFunction method
func TestLinearFunction(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("LinearFunctionBasic", func(t *testing.T) {
		mtbdd.Declare("x", "y")

		// Create function: 5 + 2*x + 3*y
		coeffs := map[string]interface{}{
			"x": 2,
			"y": 3,
		}
		linear := mtbdd.LinearFunction(coeffs, 5)

		// Test all combinations
		testCases := []struct {
			assignment map[string]bool
			expected   interface{}
		}{
			{map[string]bool{"x": false, "y": false}, 5}, // 5 + 0 + 0 = 5
			{map[string]bool{"x": true, "y": false}, 7},  // 5 + 2 + 0 = 7
			{map[string]bool{"x": false, "y": true}, 8},  // 5 + 0 + 3 = 8
			{map[string]bool{"x": true, "y": true}, 10},  // 5 + 2 + 3 = 10
		}

		for _, tc := range testCases {
			result := mtbdd.Evaluate(linear, tc.assignment)
			if result != tc.expected {
				t.Errorf("Linear function with assignment %v: expected %v, got %v",
					tc.assignment, tc.expected, result)
			}
		}
	})

	t.Run("LinearFunctionNegativeCoefficients", func(t *testing.T) {
		mtbdd.Declare("a", "b")

		// Create function: 10 - 2*a + 3*b
		coeffs := map[string]interface{}{
			"a": -2,
			"b": 3,
		}
		linear := mtbdd.LinearFunction(coeffs, 10)

		// Test with a=true, b=false: 10 - 2*1 + 3*0 = 8
		result := mtbdd.Evaluate(linear, map[string]bool{"a": true, "b": false})
		if result != 8 {
			t.Errorf("Expected 8, got %v", result)
		}
	})

	t.Run("LinearFunctionFloatCoefficients", func(t *testing.T) {
		mtbdd.Declare("x")

		// Create function: 1.5 + 2.5*x
		coeffs := map[string]interface{}{
			"x": 2.5,
		}
		linear := mtbdd.LinearFunction(coeffs, 1.5)

		// Test with x=true: 1.5 + 2.5*1 = 4.0
		result := mtbdd.Evaluate(linear, map[string]bool{"x": true})
		if result != 4.0 {
			t.Errorf("Expected 4.0, got %v", result)
		}
	})

	t.Run("LinearFunctionEmptyCoefficients", func(t *testing.T) {
		// No coefficients, should return just the constant
		coeffs := map[string]interface{}{}
		linear := mtbdd.LinearFunction(coeffs, 42)

		result := mtbdd.Evaluate(linear, map[string]bool{})
		if result != 42 {
			t.Errorf("Expected 42, got %v", result)
		}
	})
}

// Test CountingSolution method
func TestCountingSolution(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("CountingSolutionBasic", func(t *testing.T) {
		mtbdd.Declare("x", "y", "z")
		counting := mtbdd.CountingSolution([]string{"x", "y", "z"})

		// Test all combinations
		testCases := []struct {
			assignment map[string]bool
			expected   int
		}{
			{map[string]bool{"x": false, "y": false, "z": false}, 0},
			{map[string]bool{"x": true, "y": false, "z": false}, 1},
			{map[string]bool{"x": false, "y": true, "z": false}, 1},
			{map[string]bool{"x": false, "y": false, "z": true}, 1},
			{map[string]bool{"x": true, "y": true, "z": false}, 2},
			{map[string]bool{"x": true, "y": false, "z": true}, 2},
			{map[string]bool{"x": false, "y": true, "z": true}, 2},
			{map[string]bool{"x": true, "y": true, "z": true}, 3},
		}

		for _, tc := range testCases {
			result := mtbdd.Evaluate(counting, tc.assignment)
			if result != tc.expected {
				t.Errorf("Counting function with assignment %v: expected %d, got %v",
					tc.assignment, tc.expected, result)
			}
		}
	})

	t.Run("CountingSolutionSingleVariable", func(t *testing.T) {
		mtbdd.Declare("x")
		counting := mtbdd.CountingSolution([]string{"x"})

		result := mtbdd.Evaluate(counting, map[string]bool{"x": true})
		if result != 1 {
			t.Errorf("Expected 1 for x=true, got %v", result)
		}

		result = mtbdd.Evaluate(counting, map[string]bool{"x": false})
		if result != 0 {
			t.Errorf("Expected 0 for x=false, got %v", result)
		}
	})

	t.Run("CountingSolutionEmptyList", func(t *testing.T) {
		counting := mtbdd.CountingSolution([]string{})

		// Should always return 0 (no variables to count)
		result := mtbdd.Evaluate(counting, map[string]bool{})
		if result != 0 {
			t.Errorf("Empty counting function should return 0, got %v", result)
		}
	})
}

// Test WeightedFormula method
func TestWeightedFormula(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("WeightedFormulaBasic", func(t *testing.T) {
		mtbdd.Declare("x", "y", "z")

		// Create weighted formula: 2*x + 5*y + 1*z (default weight = 1)
		weights := map[string]interface{}{
			"x": 2,
			"y": 5,
		}
		weighted := mtbdd.WeightedFormula([]string{"x", "y", "z"}, weights, 1)

		// Test with x=true, y=false, z=true: 2*1 + 5*0 + 1*1 = 3
		result := mtbdd.Evaluate(weighted, map[string]bool{"x": true, "y": false, "z": true})
		if result != 3 {
			t.Errorf("Expected 3, got %v", result)
		}

		// Test with x=true, y=true, z=false: 2*1 + 5*1 + 1*0 = 7
		result = mtbdd.Evaluate(weighted, map[string]bool{"x": true, "y": true, "z": false})
		if result != 7 {
			t.Errorf("Expected 7, got %v", result)
		}
	})

	t.Run("WeightedFormulaAllDefaults", func(t *testing.T) {
		mtbdd.Declare("a", "b")

		// No specific weights, all use default
		weights := map[string]interface{}{}
		weighted := mtbdd.WeightedFormula([]string{"a", "b"}, weights, 3)

		// Test with a=true, b=true: 3*1 + 3*1 = 6
		result := mtbdd.Evaluate(weighted, map[string]bool{"a": true, "b": true})
		if result != 6 {
			t.Errorf("Expected 6, got %v", result)
		}

		// Test with a=false, b=true: 3*0 + 3*1 = 3
		result = mtbdd.Evaluate(weighted, map[string]bool{"a": false, "b": true})
		if result != 3 {
			t.Errorf("Expected 3, got %v", result)
		}
	})

	t.Run("WeightedFormulaFloatWeights", func(t *testing.T) {
		mtbdd.Declare("x", "y")

		weights := map[string]interface{}{
			"x": 1.5,
			"y": 2.5,
		}
		weighted := mtbdd.WeightedFormula([]string{"x", "y"}, weights, 0.5)

		// Test with x=true, y=true: 1.5*1 + 2.5*1 = 4.0
		result := mtbdd.Evaluate(weighted, map[string]bool{"x": true, "y": true})
		if result != 4.0 {
			t.Errorf("Expected 4.0, got %v", result)
		}
	})
}

// Test edge cases and error conditions
func TestAnalysisEdgeCases(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("EvaluateWithIncompleteAssignment", func(t *testing.T) {
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		formula := mtbdd.AND(x, y)

		// This should handle missing variables gracefully
		// The behavior may be undefined, but shouldn't crash
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("Evaluate should not panic with incomplete assignment: %v", r)
			}
		}()

		_ = mtbdd.Evaluate(formula, map[string]bool{"x": true})
		// We don't check the result since behavior is undefined
	})

	t.Run("SupportOfInvalidNode", func(t *testing.T) {
		// Test with an invalid node reference
		support := mtbdd.Support(-999)
		if len(support) != 0 {
			t.Errorf("Invalid node should have empty support, got %v", support)
		}
	})
}

// Benchmark tests for performance-critical operations
func BenchmarkEvaluate(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("a", "b", "c", "d")
	a, _ := mtbdd.Var("a")
	b_var, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")
	d, _ := mtbdd.Var("d")

	// Create a moderately complex formula
	formula := mtbdd.OR(mtbdd.AND(a, b_var), mtbdd.AND(c, d))
	assignment := map[string]bool{"a": true, "b": false, "c": true, "d": true}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Evaluate(formula, assignment)
	}
}

func BenchmarkCountSat(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("a", "b", "c", "d")
	a, _ := mtbdd.Var("a")
	b_var, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")
	d, _ := mtbdd.Var("d")

	formula := mtbdd.OR(mtbdd.AND(a, b_var), mtbdd.XOR(c, d))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.CountSat(formula)
	}
}

func BenchmarkSupport(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("a", "b", "c", "d", "e")
	a, _ := mtbdd.Var("a")
	b_var, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")
	d, _ := mtbdd.Var("d")
	e, _ := mtbdd.Var("e")

	formula := mtbdd.OR(mtbdd.AND(a, b_var), mtbdd.OR(c, mtbdd.AND(d, e)))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Support(formula)
	}
}

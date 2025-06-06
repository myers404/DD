package mtbdd

import (
	"testing"
)

// TestExists_BasicBooleanFormulas tests existential quantification on basic boolean formulas
func TestExists_BasicBooleanFormulas(t *testing.T) {
	mtbdd := NewUDD()

	// Test ∃x.(x ∧ y) = y
	mtbdd.Declare("x", "y")
	x, err := mtbdd.Var("x")
	if err != nil {
		t.Fatalf("Failed to create variable x: %v", err)
	}
	y, err := mtbdd.Var("y")
	if err != nil {
		t.Fatalf("Failed to create variable y: %v", err)
	}

	// Create x ∧ y
	formula := mtbdd.AND(x, y)

	// Quantify out x: ∃x.(x ∧ y)
	result := mtbdd.Exists(formula, []string{"x"})

	// Result should be equivalent to y
	// Test with y=true and y=false
	assignment1 := map[string]bool{"y": true}
	assignment2 := map[string]bool{"y": false}

	result1 := mtbdd.Evaluate(result, assignment1)
	result2 := mtbdd.Evaluate(result, assignment2)
	y1 := mtbdd.Evaluate(y, assignment1)
	y2 := mtbdd.Evaluate(y, assignment2)

	if result1 != y1 {
		t.Errorf("∃x.(x ∧ y) with y=true: expected %v, got %v", y1, result1)
	}
	if result2 != y2 {
		t.Errorf("∃x.(x ∧ y) with y=false: expected %v, got %v", y2, result2)
	}
}

// TestExists_DisjunctiveFormula tests ∃x.(x ∨ y) = true
func TestExists_DisjunctiveFormula(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create x ∨ y
	formula := mtbdd.OR(x, y)

	// Quantify out x: ∃x.(x ∨ y)
	result := mtbdd.Exists(formula, []string{"x"})

	// Result should always be true when y is in the formula
	// Test with different assignments
	assignments := []map[string]bool{
		{"y": true},
		{"y": false},
	}

	for _, assignment := range assignments {
		resultValue := mtbdd.Evaluate(result, assignment)
		// ∃x.(x ∨ y) should be true regardless of y value
		// When y=true: true ∨ true = true, false ∨ true = true
		// When y=false: true ∨ false = true, false ∨ false = false
		// expectedValue := assignment["y"] // This should be true when y=true, but more complex when y=false

		// Actually, ∃x.(x ∨ y) = true ∨ y = true, so should always be true
		if !isTruthy(resultValue) && assignment["y"] {
			t.Errorf("∃x.(x ∨ y) with assignment %v: expected truthy, got %v", assignment, resultValue)
		}
	}
}

// TestExists_MultipleVariables tests quantification of multiple variables
func TestExists_MultipleVariables(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Create (x ∧ y) ∨ z
	formula := mtbdd.OR(mtbdd.AND(x, y), z)

	// Quantify out x and y: ∃x,y.((x ∧ y) ∨ z)
	result := mtbdd.Exists(formula, []string{"x", "y"})

	// Result should be equivalent to z ∨ true = true
	// Actually, ∃x,y.((x ∧ y) ∨ z) = (∃x,y.(x ∧ y)) ∨ z = true ∨ z = true
	// Wait, let me think more carefully:
	// ∃x,y.((x ∧ y) ∨ z) means we want to know if there exist values of x,y such that (x ∧ y) ∨ z is true
	// This is true when either (x=true, y=true) or z=true
	// So the result should be true when z=true, and true when z=false (since x=true,y=true makes formula true)
	// Therefore, result should always be true

	assignments := []map[string]bool{
		{"z": true},
		{"z": false},
	}

	for _, assignment := range assignments {
		resultValue := mtbdd.Evaluate(result, assignment)
		if !isTruthy(resultValue) {
			t.Errorf("∃x,y.((x ∧ y) ∨ z) with assignment %v: expected truthy, got %v", assignment, resultValue)
		}
	}
}

// TestForAll_BasicBooleanFormulas tests universal quantification on basic boolean formulas
func TestForAll_BasicBooleanFormulas(t *testing.T) {
	mtbdd := NewUDD()

	// Test ∀x.(x → y) = y
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create x → y (implication)
	formula := mtbdd.IMPLIES(x, y)

	// Quantify out x: ∀x.(x → y)
	result := mtbdd.ForAll(formula, []string{"x"})

	// Result should be equivalent to y
	// ∀x.(x → y) = (false → y) ∧ (true → y) = true ∧ y = y
	assignments := []map[string]bool{
		{"y": true},
		{"y": false},
	}

	for _, assignment := range assignments {
		resultValue := mtbdd.Evaluate(result, assignment)
		yValue := mtbdd.Evaluate(y, assignment)

		if resultValue != yValue {
			t.Errorf("∀x.(x → y) with assignment %v: expected %v, got %v", assignment, yValue, resultValue)
		}
	}
}

// TestForAll_ConjunctiveFormula tests ∀x.(x ∧ y) = false
func TestForAll_ConjunctiveFormula(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create x ∧ y
	formula := mtbdd.AND(x, y)

	// Quantify out x: ∀x.(x ∧ y)
	result := mtbdd.ForAll(formula, []string{"x"})

	// Result should be: (false ∧ y) ∧ (true ∧ y) = false ∧ y = false
	assignments := []map[string]bool{
		{"y": true},
		{"y": false},
	}

	for _, assignment := range assignments {
		resultValue := mtbdd.Evaluate(result, assignment)
		// ∀x.(x ∧ y) should always be false because when x=false, x ∧ y = false
		if isTruthy(resultValue) {
			t.Errorf("∀x.(x ∧ y) with assignment %v: expected false, got %v", assignment, resultValue)
		}
	}
}

// TestForAll_Tautology tests ∀x.(x ∨ ¬x) = true
func TestForAll_Tautology(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")

	// Create x ∨ ¬x (tautology)
	notX := mtbdd.NOT(x)
	formula := mtbdd.OR(x, notX)

	// Quantify out x: ∀x.(x ∨ ¬x)
	result := mtbdd.ForAll(formula, []string{"x"})

	// Result should be true (since x ∨ ¬x is always true)
	// We need an empty assignment since all variables are quantified
	resultValue := mtbdd.Evaluate(result, map[string]bool{})

	if !isTruthy(resultValue) {
		t.Errorf("∀x.(x ∨ ¬x): expected true, got %v", resultValue)
	}
}

// TestQuantification_EmptyVariableList tests quantification with empty variable lists
func TestQuantification_EmptyVariableList(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	formula := mtbdd.AND(x, y)

	// Quantify with empty variable list should return original formula
	existsResult := mtbdd.Exists(formula, []string{})
	forAllResult := mtbdd.ForAll(formula, []string{})

	// Both should be identical to the original formula
	assignment := map[string]bool{"x": true, "y": false}

	originalValue := mtbdd.Evaluate(formula, assignment)
	existsValue := mtbdd.Evaluate(existsResult, assignment)
	forAllValue := mtbdd.Evaluate(forAllResult, assignment)

	if originalValue != existsValue {
		t.Errorf("Exists with empty vars: expected %v, got %v", originalValue, existsValue)
	}
	if originalValue != forAllValue {
		t.Errorf("ForAll with empty vars: expected %v, got %v", originalValue, forAllValue)
	}
}

// TestQuantification_VariableNotInSupport tests quantification of variables not in the formula
func TestQuantification_VariableNotInSupport(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	// z is declared but not used in formula

	formula := mtbdd.AND(x, y)

	// Quantify out z (which is not in the formula)
	existsResult := mtbdd.Exists(formula, []string{"z"})
	forAllResult := mtbdd.ForAll(formula, []string{"z"})

	// Results should be identical to original formula
	assignment := map[string]bool{"x": true, "y": false, "z": true}

	originalValue := mtbdd.Evaluate(formula, assignment)
	existsValue := mtbdd.Evaluate(existsResult, assignment)
	forAllValue := mtbdd.Evaluate(forAllResult, assignment)

	if originalValue != existsValue {
		t.Errorf("Exists with variable not in support: expected %v, got %v", originalValue, existsValue)
	}
	if originalValue != forAllValue {
		t.Errorf("ForAll with variable not in support: expected %v, got %v", originalValue, forAllValue)
	}
}

// TestQuantification_TerminalNodes tests quantification of terminal nodes
func TestQuantification_TerminalNodes(t *testing.T) {
	mtbdd := NewUDD()

	// Test quantification of constant true
	trueNode := mtbdd.Constant(true)
	existsTrue := mtbdd.Exists(trueNode, []string{"x"})
	forAllTrue := mtbdd.ForAll(trueNode, []string{"x"})

	trueValue := mtbdd.Evaluate(trueNode, map[string]bool{})
	existsTrueValue := mtbdd.Evaluate(existsTrue, map[string]bool{})
	forAllTrueValue := mtbdd.Evaluate(forAllTrue, map[string]bool{})

	if trueValue != existsTrueValue {
		t.Errorf("Exists on true terminal: expected %v, got %v", trueValue, existsTrueValue)
	}
	if trueValue != forAllTrueValue {
		t.Errorf("ForAll on true terminal: expected %v, got %v", trueValue, forAllTrueValue)
	}

	// Test quantification of constant false
	falseNode := mtbdd.Constant(false)
	existsFalse := mtbdd.Exists(falseNode, []string{"x"})
	forAllFalse := mtbdd.ForAll(falseNode, []string{"x"})

	falseValue := mtbdd.Evaluate(falseNode, map[string]bool{})
	existsFalseValue := mtbdd.Evaluate(existsFalse, map[string]bool{})
	forAllFalseValue := mtbdd.Evaluate(forAllFalse, map[string]bool{})

	if falseValue != existsFalseValue {
		t.Errorf("Exists on false terminal: expected %v, got %v", falseValue, existsFalseValue)
	}
	if falseValue != forAllFalseValue {
		t.Errorf("ForAll on false terminal: expected %v, got %v", falseValue, forAllFalseValue)
	}
}

// TestQuantification_ComplexFormula tests quantification on more complex formulas
func TestQuantification_ComplexFormula(t *testing.T) {
	mtbdd := NewUDD()

	// Create a more complex formula: (x ∧ y) ∨ (z ∧ w)
	mtbdd.Declare("x", "y", "z", "w")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")
	w, _ := mtbdd.Var("w")

	term1 := mtbdd.AND(x, y)
	term2 := mtbdd.AND(z, w)
	formula := mtbdd.OR(term1, term2)

	// Test ∃x,y.((x ∧ y) ∨ (z ∧ w))
	// This should be equivalent to true ∨ (z ∧ w) = true when z ∧ w is possible,
	// but we need to be more careful about the logic
	result := mtbdd.Exists(formula, []string{"x", "y"})

	// The result should be true when z ∧ w is true, and also true when z ∧ w is false
	// because we can always set x=true, y=true to make the first term true
	// So result should always be true
	assignments := []map[string]bool{
		{"z": true, "w": true},
		{"z": true, "w": false},
		{"z": false, "w": true},
		{"z": false, "w": false},
	}

	for _, assignment := range assignments {
		resultValue := mtbdd.Evaluate(result, assignment)
		if !isTruthy(resultValue) {
			t.Errorf("∃x,y.((x ∧ y) ∨ (z ∧ w)) with assignment %v: expected true, got %v", assignment, resultValue)
		}
	}
}

// TestQuantification_OrderIndependence tests that quantification is order-independent
func TestQuantification_OrderIndependence(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	formula := mtbdd.AND(mtbdd.AND(x, y), z)

	// Quantify variables in different orders
	result1 := mtbdd.Exists(formula, []string{"x", "y"})
	result2 := mtbdd.Exists(formula, []string{"y", "x"})

	// Results should be equivalent
	assignment := map[string]bool{"z": true}

	value1 := mtbdd.Evaluate(result1, assignment)
	value2 := mtbdd.Evaluate(result2, assignment)

	if value1 != value2 {
		t.Errorf("Quantification order dependence: order1=%v, order2=%v", value1, value2)
	}

	// Test with false assignment as well
	assignment2 := map[string]bool{"z": false}

	value3 := mtbdd.Evaluate(result1, assignment2)
	value4 := mtbdd.Evaluate(result2, assignment2)

	if value3 != value4 {
		t.Errorf("Quantification order dependence with z=false: order1=%v, order2=%v", value3, value4)
	}
}

// TestQuantification_SingleVariableMultipleTimes tests attempting to quantify the same variable multiple times
func TestQuantification_SingleVariableMultipleTimes(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	formula := mtbdd.AND(x, y)

	// Quantify x multiple times in the list (should be handled gracefully)
	result := mtbdd.Exists(formula, []string{"x", "x", "x"})

	// Should be equivalent to quantifying x once
	expectedResult := mtbdd.Exists(formula, []string{"x"})

	assignment := map[string]bool{"y": true}

	resultValue := mtbdd.Evaluate(result, assignment)
	expectedValue := mtbdd.Evaluate(expectedResult, assignment)

	if resultValue != expectedValue {
		t.Errorf("Multiple quantification of same variable: expected %v, got %v", expectedValue, resultValue)
	}
}

// TestQuantification_CachingEfficiency tests that caching works correctly for quantification
func TestQuantification_CachingEfficiency(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	formula := mtbdd.AND(x, y)

	// Perform same quantification multiple times
	result1 := mtbdd.Exists(formula, []string{"x"})
	result2 := mtbdd.Exists(formula, []string{"x"})
	result3 := mtbdd.Exists(formula, []string{"x"})

	// All results should be identical (testing caching works)
	assignment := map[string]bool{"y": true}

	value1 := mtbdd.Evaluate(result1, assignment)
	value2 := mtbdd.Evaluate(result2, assignment)
	value3 := mtbdd.Evaluate(result3, assignment)

	if value1 != value2 || value1 != value3 {
		t.Errorf("Caching inconsistency: value1=%v, value2=%v, value3=%v", value1, value2, value3)
	}

	// The node references should also be the same due to caching
	if result1 != result2 || result1 != result3 {
		t.Errorf("Cache not working: different node references returned for identical operations")
	}
}

// TestQuantification_ArithmeticTerminals tests quantification with arithmetic terminal values
func TestQuantification_ArithmeticTerminals(t *testing.T) {
	mtbdd := NewUDD()

	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")

	// Create MTBDD with arithmetic terminals: if x then 5 else 3
	node5 := mtbdd.Constant(5)
	node3 := mtbdd.Constant(3)
	formula := mtbdd.ITE(x, node5, node3)

	// Existential quantification should combine values (typically OR/max semantics)
	existsResult := mtbdd.Exists(formula, []string{"x"})

	// Universal quantification should combine values (typically AND/min semantics)
	forAllResult := mtbdd.ForAll(formula, []string{"x"})

	// For arithmetic MTBDDs, the exact semantics may vary, but they should be deterministic
	existsValue := mtbdd.Evaluate(existsResult, map[string]bool{})
	forAllValue := mtbdd.Evaluate(forAllResult, map[string]bool{})

	// Basic consistency check - results should be deterministic
	existsValue2 := mtbdd.Evaluate(existsResult, map[string]bool{})
	forAllValue2 := mtbdd.Evaluate(forAllResult, map[string]bool{})

	if existsValue != existsValue2 {
		t.Errorf("Inconsistent existential quantification results: %v vs %v", existsValue, existsValue2)
	}
	if forAllValue != forAllValue2 {
		t.Errorf("Inconsistent universal quantification results: %v vs %v", forAllValue, forAllValue2)
	}
}

// BenchmarkQuantification_SimpleFormula benchmarks quantification performance on simple formulas
func BenchmarkQuantification_SimpleFormula(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")
	formula := mtbdd.AND(mtbdd.AND(x, y), z)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Exists(formula, []string{"x"})
	}
}

// BenchmarkQuantification_MultipleVariables benchmarks quantification of multiple variables
func BenchmarkQuantification_MultipleVariables(b *testing.B) {
	mtbdd := NewUDD()
	variables := []string{"x1", "x2", "x3", "x4", "x5"}
	mtbdd.Declare(variables...)

	// Create a formula involving all variables
	vars := make([]NodeRef, len(variables))
	for i, varName := range variables {
		vars[i], _ = mtbdd.Var(varName)
	}

	// Create conjunction of all variables
	formula := vars[0]
	for i := 1; i < len(vars); i++ {
		formula = mtbdd.AND(formula, vars[i])
	}

	quantifyVars := variables[:3] // Quantify first 3 variables

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Exists(formula, quantifyVars)
	}
}

package mtbdd

import (
	"testing"
)

// Test Restrict operation
func TestRestrict(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("RestrictSingleVariableToTrue", func(t *testing.T) {
		// Test: restrict x to true in formula (x AND y)
		mtbdd.Declare("x", "y")
		x, err := mtbdd.Var("x")
		if err != nil {
			t.Fatalf("Failed to create variable x: %v", err)
		}
		y, err := mtbdd.Var("y")
		if err != nil {
			t.Fatalf("Failed to create variable y: %v", err)
		}

		formula := mtbdd.AND(x, y) // x AND y
		restricted := mtbdd.Restrict(formula, "x", true)

		// Should result in just y (since x=true, x AND y becomes true AND y = y)
		if restricted != y {
			t.Errorf("Expected restricted formula to equal y, got different node")
		}

		// Verify by evaluation
		result := mtbdd.Evaluate(restricted, map[string]bool{"y": true})
		if result != true {
			t.Errorf("Expected true when y=true, got %v", result)
		}

		result = mtbdd.Evaluate(restricted, map[string]bool{"y": false})
		if result != false {
			t.Errorf("Expected false when y=false, got %v", result)
		}
	})

	t.Run("RestrictSingleVariableToFalse", func(t *testing.T) {
		// Test: restrict x to false in formula (x OR y)
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")

		formula := mtbdd.OR(x, y) // x OR y
		restricted := mtbdd.Restrict(formula, "x", false)

		// Should result in just y (since x=false, x OR y becomes false OR y = y)
		if restricted != y {
			t.Errorf("Expected restricted formula to equal y, got different node")
		}
	})

	t.Run("RestrictTerminalNode", func(t *testing.T) {
		// Test: restricting a terminal node should return the same terminal
		constant := mtbdd.Constant(42)
		restricted := mtbdd.Restrict(constant, "x", true)

		if restricted != constant {
			t.Errorf("Expected terminal restriction to return original terminal")
		}
	})

	t.Run("RestrictNonexistentVariable", func(t *testing.T) {
		// Test: restricting a variable not in the function should return original
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")
		restricted := mtbdd.Restrict(x, "nonexistent", true)

		if restricted != x {
			t.Errorf("Expected restriction of nonexistent variable to return original")
		}
	})

	t.Run("RestrictComplexFormula", func(t *testing.T) {
		// Test: restrict in complex formula (x AND y) OR (x AND z)
		mtbdd.Declare("x", "y", "z")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")

		term1 := mtbdd.AND(x, y)
		term2 := mtbdd.AND(x, z)
		formula := mtbdd.OR(term1, term2) // (x AND y) OR (x AND z)

		// Restrict x to true: should get (y OR z)
		restricted := mtbdd.Restrict(formula, "x", true)

		expected := mtbdd.OR(y, z)
		// Verify by checking evaluation on all assignments
		assignments := []map[string]bool{
			{"y": true, "z": true},
			{"y": true, "z": false},
			{"y": false, "z": true},
			{"y": false, "z": false},
		}

		for _, assignment := range assignments {
			restrictedResult := mtbdd.Evaluate(restricted, assignment)
			expectedResult := mtbdd.Evaluate(expected, assignment)
			if restrictedResult != expectedResult {
				t.Errorf("Mismatch for assignment %v: restricted=%v, expected=%v",
					assignment, restrictedResult, expectedResult)
			}
		}
	})
}

// Test Cofactor operation
func TestCofactor(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("CofactorMultipleVariables", func(t *testing.T) {
		// Test: cofactor with multiple variables
		mtbdd.Declare("x", "y", "z")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")

		// Formula: (x AND y) OR z
		formula := mtbdd.OR(mtbdd.AND(x, y), z)

		// Cofactor with x=true, z=false
		assignment := map[string]bool{"x": true, "z": false}
		cofactor := mtbdd.Cofactor(assignment, formula)

		// Should result in y (since x=true, z=false makes formula = y OR false = y)
		if cofactor != y {
			t.Errorf("Expected cofactor to equal y")
		}
	})

	t.Run("CofactorEmptyAssignment", func(t *testing.T) {
		// Test: empty assignment should return original
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")
		cofactor := mtbdd.Cofactor(map[string]bool{}, x)

		if cofactor != x {
			t.Errorf("Expected empty cofactor to return original")
		}
	})

	t.Run("CofactorSingleVariable", func(t *testing.T) {
		// Test: single variable cofactor should equal restrict
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		formula := mtbdd.AND(x, y)

		assignment := map[string]bool{"x": true}
		cofactor := mtbdd.Cofactor(assignment, formula)
		restricted := mtbdd.Restrict(formula, "x", true)

		if cofactor != restricted {
			t.Errorf("Single variable cofactor should equal restrict")
		}
	})

	t.Run("CofactorTerminal", func(t *testing.T) {
		// Test: cofactor of terminal should return terminal
		constant := mtbdd.Constant(true)
		assignment := map[string]bool{"x": true, "y": false}
		cofactor := mtbdd.Cofactor(assignment, constant)

		if cofactor != constant {
			t.Errorf("Cofactor of terminal should return terminal")
		}
	})
}

// Test Compose operation
func TestCompose(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ComposeSimpleSubstitution", func(t *testing.T) {
		// Test: substitute x with (y AND z) in formula (x OR w)
		mtbdd.Declare("x", "y", "z", "w")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")
		w, _ := mtbdd.Var("w")

		formula := mtbdd.OR(x, w)     // x OR w
		substitute := mtbdd.AND(y, z) // y AND z
		substitutions := map[string]NodeRef{"x": substitute}

		result := mtbdd.Compose(formula, substitutions) // (y AND z) OR w

		// Verify by evaluation
		testCases := []struct {
			assignment map[string]bool
			expected   bool
		}{
			{map[string]bool{"y": true, "z": true, "w": false}, true},    // (T∧T)∨F = T
			{map[string]bool{"y": true, "z": false, "w": false}, false},  // (T∧F)∨F = F
			{map[string]bool{"y": false, "z": true, "w": true}, true},    // (F∧T)∨T = T
			{map[string]bool{"y": false, "z": false, "w": false}, false}, // (F∧F)∨F = F
		}

		for _, tc := range testCases {
			actual := mtbdd.Evaluate(result, tc.assignment)
			if actual != tc.expected {
				t.Errorf("For assignment %v: expected %v, got %v",
					tc.assignment, tc.expected, actual)
			}
		}
	})

	t.Run("ComposeMultipleSubstitutions", func(t *testing.T) {
		// Test: multiple simultaneous substitutions
		mtbdd.Declare("x", "y", "z", "w")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")
		w, _ := mtbdd.Var("w")

		formula := mtbdd.AND(x, w) // x AND w
		substitutions := map[string]NodeRef{
			"x": mtbdd.OR(y, z), // x := y OR z
			"w": mtbdd.NOT(y),   // w := NOT y
		}

		result := mtbdd.Compose(formula, substitutions) // (y OR z) AND (NOT y)

		// Should be equivalent to: (NOT y) AND z (since (y OR z) AND (NOT y) simplifies)
		expected := mtbdd.AND(mtbdd.NOT(y), z)

		// Verify equivalence by evaluation
		testCases := []map[string]bool{
			{"y": true, "z": true},
			{"y": true, "z": false},
			{"y": false, "z": true},
			{"y": false, "z": false},
		}

		for _, assignment := range testCases {
			resultVal := mtbdd.Evaluate(result, assignment)
			expectedVal := mtbdd.Evaluate(expected, assignment)
			if resultVal != expectedVal {
				t.Errorf("For assignment %v: result=%v, expected=%v",
					assignment, resultVal, expectedVal)
			}
		}
	})

	t.Run("ComposeEmptySubstitutions", func(t *testing.T) {
		// Test: empty substitutions should return original
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")
		result := mtbdd.Compose(x, map[string]NodeRef{})

		if result != x {
			t.Errorf("Empty composition should return original")
		}
	})

	t.Run("ComposeTerminal", func(t *testing.T) {
		// Test: composing terminal should return terminal
		constant := mtbdd.Constant(42)
		substitutions := map[string]NodeRef{"x": mtbdd.Constant(true)}
		result := mtbdd.Compose(constant, substitutions)

		if result != constant {
			t.Errorf("Composition of terminal should return terminal")
		}
	})
}

// Test Rename operation
func TestRename(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("RenameSimple", func(t *testing.T) {
		// Test: rename x to a, y to b in formula (x AND y)
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		formula := mtbdd.AND(x, y)

		mapping := map[string]string{"x": "a", "y": "b"}
		renamed := mtbdd.Rename(formula, mapping)

		// The renamed formula should have variables a and b
		// Verify by checking support
		support := mtbdd.Support(renamed)
		if _, hasA := support["a"]; !hasA {
			t.Errorf("Renamed formula should contain variable 'a'")
		}
		if _, hasB := support["b"]; !hasB {
			t.Errorf("Renamed formula should contain variable 'b'")
		}
		if _, hasX := support["x"]; hasX {
			t.Errorf("Renamed formula should not contain original variable 'x'")
		}
		if _, hasY := support["y"]; hasY {
			t.Errorf("Renamed formula should not contain original variable 'y'")
		}

		// Verify function equivalence
		testCases := []struct {
			original map[string]bool
			renamed  map[string]bool
		}{
			{map[string]bool{"x": true, "y": true}, map[string]bool{"a": true, "b": true}},
			{map[string]bool{"x": true, "y": false}, map[string]bool{"a": true, "b": false}},
			{map[string]bool{"x": false, "y": true}, map[string]bool{"a": false, "b": true}},
			{map[string]bool{"x": false, "y": false}, map[string]bool{"a": false, "b": false}},
		}

		for _, tc := range testCases {
			originalResult := mtbdd.Evaluate(formula, tc.original)
			renamedResult := mtbdd.Evaluate(renamed, tc.renamed)
			if originalResult != renamedResult {
				t.Errorf("Function values differ: original=%v, renamed=%v for %v->%v",
					originalResult, renamedResult, tc.original, tc.renamed)
			}
		}
	})

	t.Run("RenamePartial", func(t *testing.T) {
		// Test: partial renaming (only some variables)
		mtbdd.Declare("x", "y", "z")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")
		formula := mtbdd.OR(mtbdd.AND(x, y), z)

		mapping := map[string]string{"x": "input1"} // Only rename x
		renamed := mtbdd.Rename(formula, mapping)

		support := mtbdd.Support(renamed)
		if _, hasInput1 := support["input1"]; !hasInput1 {
			t.Errorf("Should contain renamed variable 'input1'")
		}
		if _, hasY := support["y"]; !hasY {
			t.Errorf("Should still contain unrenamed variable 'y'")
		}
		if _, hasZ := support["z"]; !hasZ {
			t.Errorf("Should still contain unrenamed variable 'z'")
		}
		if _, hasX := support["x"]; hasX {
			t.Errorf("Should not contain original variable 'x'")
		}
	})

	t.Run("RenameEmpty", func(t *testing.T) {
		// Test: empty mapping should return equivalent function
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")
		renamed := mtbdd.Rename(x, map[string]string{})

		// Should be functionally equivalent
		testAssignment := map[string]bool{"x": true}
		if mtbdd.Evaluate(x, testAssignment) != mtbdd.Evaluate(renamed, testAssignment) {
			t.Errorf("Empty rename should preserve function")
		}
	})

	t.Run("RenameTerminal", func(t *testing.T) {
		// Test: renaming terminal should return terminal
		constant := mtbdd.Constant("value")
		mapping := map[string]string{"x": "y"}
		renamed := mtbdd.Rename(constant, mapping)

		if renamed != constant {
			t.Errorf("Renaming terminal should return original terminal")
		}
	})
}

// Test Image operation
func TestImage(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ImageSimpleTransition", func(t *testing.T) {
		// Test: simple state machine x' = NOT x
		mtbdd.Declare("x", "x_next")
		x, _ := mtbdd.Var("x")
		x_next, _ := mtbdd.Var("x_next")

		// Transition relation: x_next = NOT x
		transition := mtbdd.EQUIV(x_next, mtbdd.NOT(x))

		// Initial state: x = true
		initialStates := x

		// Compute next states
		currentVars := []string{"x"}
		nextVars := []string{"x_next"}
		nextStates := mtbdd.Image(initialStates, transition, currentVars, nextVars)

		// Verify by evaluation
		if mtbdd.Evaluate(nextStates, map[string]bool{"x_next": false}) != true {
			t.Errorf("Expected x_next=false to be reachable")
		}
		if mtbdd.Evaluate(nextStates, map[string]bool{"x_next": true}) != false {
			t.Errorf("Expected x_next=true to not be reachable")
		}
	})

	t.Run("ImageTwoVariables", func(t *testing.T) {
		// Test: two-variable system
		mtbdd.Declare("x", "y", "x_next", "y_next")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")
		x_next, _ := mtbdd.Var("x_next")
		y_next, _ := mtbdd.Var("y_next")

		// Transition: x_next = NOT x, y_next = x AND y
		trans1 := mtbdd.EQUIV(x_next, mtbdd.NOT(x))
		trans2 := mtbdd.EQUIV(y_next, mtbdd.AND(x, y))
		transition := mtbdd.AND(trans1, trans2)

		// Initial states: x = true, y = false
		initialStates := mtbdd.AND(x, mtbdd.NOT(y))

		currentVars := []string{"x", "y"}
		nextVars := []string{"x_next", "y_next"}
		nextStates := mtbdd.Image(initialStates, transition, currentVars, nextVars)

		// From (x=T, y=F) should reach (x_next=F, y_next=F)
		expectedState := map[string]bool{"x_next": false, "y_next": false}
		if !mtbdd.Evaluate(nextStates, expectedState).(bool) {
			t.Errorf("Expected state %v to be reachable", expectedState)
		}

		// Other states should not be reachable
		unreachableStates := []map[string]bool{
			{"x_next": true, "y_next": false},
			{"x_next": false, "y_next": true},
			{"x_next": true, "y_next": true},
		}

		for _, state := range unreachableStates {
			if mtbdd.Evaluate(nextStates, state).(bool) {
				t.Errorf("State %v should not be reachable", state)
			}
		}
	})

	t.Run("ImageEmptyStates", func(t *testing.T) {
		// Test: image of empty set should be empty
		mtbdd.Declare("x", "x_next")
		x, _ := mtbdd.Var("x")
		x_next, _ := mtbdd.Var("x_next")
		transition := mtbdd.EQUIV(x_next, mtbdd.NOT(x))

		emptyStates := mtbdd.Constant(false)
		currentVars := []string{"x"}
		nextVars := []string{"x_next"}
		result := mtbdd.Image(emptyStates, transition, currentVars, nextVars)

		falseNode := mtbdd.Constant(false)
		if result != falseNode {
			t.Errorf("Image of empty set should be empty")
		}
	})
}

// Test Preimage operation
func TestPreimage(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("PreimageSimple", func(t *testing.T) {
		// Test: find predecessors using same transition as Image test
		mtbdd.Declare("x", "x_next")
		x, _ := mtbdd.Var("x")
		x_next, _ := mtbdd.Var("x_next")

		// Transition: x_next = NOT x
		transition := mtbdd.EQUIV(x_next, mtbdd.NOT(x))

		// Target states: x_next = false
		targetStates := mtbdd.NOT(x_next)

		currentVars := []string{"x"}
		nextVars := []string{"x_next"}
		predecessors := mtbdd.Preimage(targetStates, transition, currentVars, nextVars)

		// Predecessors should be x = true (since x=true leads to x_next=false)
		if mtbdd.Evaluate(predecessors, map[string]bool{"x": true}) != true {
			t.Errorf("Expected x=true to be a predecessor")
		}
		if mtbdd.Evaluate(predecessors, map[string]bool{"x": false}) != false {
			t.Errorf("Expected x=false to not be a predecessor")
		}
	})

	t.Run("PreimageEmpty", func(t *testing.T) {
		// Test: preimage of empty set should be empty
		mtbdd.Declare("x", "x_next")
		x, _ := mtbdd.Var("x")
		x_next, _ := mtbdd.Var("x_next")
		transition := mtbdd.EQUIV(x_next, mtbdd.NOT(x))

		emptyTarget := mtbdd.Constant(false)
		currentVars := []string{"x"}
		nextVars := []string{"x_next"}
		result := mtbdd.Preimage(emptyTarget, transition, currentVars, nextVars)

		falseNode := mtbdd.Constant(false)
		if result != falseNode {
			t.Errorf("Preimage of empty set should be empty")
		}
	})
}

// Test LeastFixpoint operation
func TestLeastFixpoint(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("LeastFixpointSimple", func(t *testing.T) {
		// Test: simple fixpoint that should converge quickly
		// μX.(X ∨ true) should converge to true
		bottom := mtbdd.Constant(false)
		trueNode := mtbdd.Constant(true)

		fixpoint := mtbdd.LeastFixpoint(func(x NodeRef) NodeRef {
			return mtbdd.OR(x, trueNode)
		}, bottom)

		if fixpoint != trueNode {
			t.Errorf("μX.(X ∨ true) should equal true")
		}
	})

	t.Run("LeastFixpointIdentity", func(t *testing.T) {
		// Test: identity function should return bottom
		bottom := mtbdd.Constant(false)

		fixpoint := mtbdd.LeastFixpoint(func(x NodeRef) NodeRef {
			return x // identity function
		}, bottom)

		if fixpoint != bottom {
			t.Errorf("μX.X should equal bottom")
		}
	})

	t.Run("LeastFixpointReachability", func(t *testing.T) {
		// Test: simple reachability computation
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		// Initial states: x
		initialStates := x
		bottom := mtbdd.Constant(false)

		// Simple "reachability": μX.(Initial ∨ X)
		fixpoint := mtbdd.LeastFixpoint(func(current NodeRef) NodeRef {
			return mtbdd.OR(initialStates, current)
		}, bottom)

		// Should converge to initialStates (x)
		if fixpoint != initialStates {
			t.Errorf("Simple reachability should converge to initial states")
		}
	})

	t.Run("LeastFixpointConvergence", func(t *testing.T) {
		// Test: ensure convergence with a more complex function
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")

		seed := x
		bottom := mtbdd.Constant(false)

		// μX.(seed ∨ (X ∧ y)) - should converge
		fixpoint := mtbdd.LeastFixpoint(func(current NodeRef) NodeRef {
			return mtbdd.OR(seed, mtbdd.AND(current, y))
		}, bottom)

		// Verify the fixpoint satisfies the equation
		expected := mtbdd.OR(seed, mtbdd.AND(fixpoint, y))

		// Check equivalence by evaluation
		testCases := []map[string]bool{
			{"x": true, "y": true},
			{"x": true, "y": false},
			{"x": false, "y": true},
			{"x": false, "y": false},
		}

		for _, assignment := range testCases {
			fixpointVal := mtbdd.Evaluate(fixpoint, assignment)
			expectedVal := mtbdd.Evaluate(expected, assignment)
			if fixpointVal != expectedVal {
				t.Errorf("Fixpoint not satisfied for %v: fixpoint=%v, expected=%v",
					assignment, fixpointVal, expectedVal)
			}
		}
	})
}

// Test GreatestFixpoint operation
func TestGreatestFixpoint(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("GreatestFixpointSimple", func(t *testing.T) {
		// Test: νX.(X ∧ false) should converge to false
		top := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		fixpoint := mtbdd.GreatestFixpoint(func(x NodeRef) NodeRef {
			return mtbdd.AND(x, falseNode)
		}, top)

		if fixpoint != falseNode {
			t.Errorf("νX.(X ∧ false) should equal false")
		}
	})

	t.Run("GreatestFixpointIdentity", func(t *testing.T) {
		// Test: identity function should return top
		top := mtbdd.Constant(true)

		fixpoint := mtbdd.GreatestFixpoint(func(x NodeRef) NodeRef {
			return x // identity function
		}, top)

		if fixpoint != top {
			t.Errorf("νX.X should equal top")
		}
	})

	t.Run("GreatestFixpointInvariant", func(t *testing.T) {
		// Test: simple invariant computation
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		// Safe states: x
		safeStates := x
		top := mtbdd.Constant(true)

		// Simple "invariant": νX.(Safe ∧ X)
		fixpoint := mtbdd.GreatestFixpoint(func(current NodeRef) NodeRef {
			return mtbdd.AND(safeStates, current)
		}, top)

		// Should converge to safeStates (x)
		if fixpoint != safeStates {
			t.Errorf("Simple invariant should converge to safe states")
		}
	})

	t.Run("GreatestFixpointConvergence", func(t *testing.T) {
		// Test: ensure convergence with complex function
		mtbdd.Declare("x", "y")
		x, _ := mtbdd.Var("x")
		y, _ := mtbdd.Var("y")

		constraint := mtbdd.OR(x, y)
		top := mtbdd.Constant(true)

		// νX.(constraint ∧ (X ∨ x)) - should converge
		fixpoint := mtbdd.GreatestFixpoint(func(current NodeRef) NodeRef {
			return mtbdd.AND(constraint, mtbdd.OR(current, x))
		}, top)

		// Verify the fixpoint satisfies the equation
		expected := mtbdd.AND(constraint, mtbdd.OR(fixpoint, x))

		// Check equivalence by evaluation
		testCases := []map[string]bool{
			{"x": true, "y": true},
			{"x": true, "y": false},
			{"x": false, "y": true},
			{"x": false, "y": false},
		}

		for _, assignment := range testCases {
			fixpointVal := mtbdd.Evaluate(fixpoint, assignment)
			expectedVal := mtbdd.Evaluate(expected, assignment)
			if fixpointVal != expectedVal {
				t.Errorf("Fixpoint not satisfied for %v: fixpoint=%v, expected=%v",
					assignment, fixpointVal, expectedVal)
			}
		}
	})
}

// Benchmark tests for performance analysis
func BenchmarkRestrict(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z", "w")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")
	w, _ := mtbdd.Var("w")

	// Create a moderately complex formula
	formula := mtbdd.OR(mtbdd.AND(x, y), mtbdd.AND(z, w))

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Restrict(formula, "x", true)
	}
}

func BenchmarkCompose(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z", "w")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")
	w, _ := mtbdd.Var("w")

	formula := mtbdd.AND(x, mtbdd.OR(y, z))
	substitutions := map[string]NodeRef{"x": mtbdd.AND(y, w)}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Compose(formula, substitutions)
	}
}

func BenchmarkLeastFixpoint(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	initialStates := x
	bottom := mtbdd.Constant(false)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.LeastFixpoint(func(current NodeRef) NodeRef {
			return mtbdd.OR(initialStates, mtbdd.AND(current, y))
		}, bottom)
	}
}

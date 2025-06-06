package mtbdd

import (
	"testing"
)

// TestTemporalOperatorsBasic tests basic functionality of all CTL operators
func TestTemporalOperatorsBasic(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "x_next", "y_next")

	// Create basic variables
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	x_next, _ := mtbdd.Var("x_next")
	y_next, _ := mtbdd.Var("y_next")

	currentVars := []string{"x", "y"}
	nextVars := []string{"x_next", "y_next"}

	// Simple transition: x_next = !x, y_next = y
	trans1 := mtbdd.EQUIV(x_next, mtbdd.NOT(x))
	trans2 := mtbdd.EQUIV(y_next, y)
	transition := mtbdd.AND(trans1, trans2)

	// Test property: x (we want to reach states where x is true)
	phi := x

	t.Run("EX_Basic", func(t *testing.T) {
		// EX(x) should return states where x will be true in the next step
		// Since x_next = !x, EX(x) should be satisfied when current x=false
		result := mtbdd.EX(phi, transition, currentVars, nextVars)

		// When x=false, y=false: x_next will be true, so EX(x) should be true
		assignment1 := map[string]bool{"x": false, "y": false}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EX: Expected true for x=false,y=false, got %v", value1)
		}

		// When x=true, y=false: x_next will be false, so EX(x) should be false
		assignment2 := map[string]bool{"x": true, "y": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		if isTruthy(value2) {
			t.Errorf("EX: Expected false for x=true,y=false, got %v", value2)
		}
	})

	t.Run("AX_Basic", func(t *testing.T) {
		// AX(x) should return states where x holds in ALL successors
		result := mtbdd.AX(phi, transition, currentVars, nextVars)

		// Since each state has only one successor, AX should equal EX in this case
		exResult := mtbdd.EX(phi, transition, currentVars, nextVars)

		// Check that AX and EX give same results for deterministic transition
		assignment := map[string]bool{"x": false, "y": true}
		axValue := mtbdd.Evaluate(result, assignment)
		exValue := mtbdd.Evaluate(exResult, assignment)

		if axValue != exValue {
			t.Errorf("AX: Expected AX=EX for deterministic transition, got AX=%v, EX=%v", axValue, exValue)
		}
	})

	t.Run("EF_Basic", func(t *testing.T) {
		// EF(x) should include all states since system oscillates between x=true and x=false
		result := mtbdd.EF(phi, transition, currentVars, nextVars)

		// From x=false: can reach x=true in one step
		assignment1 := map[string]bool{"x": false, "y": false}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EF: Expected true for x=false,y=false, got %v", value1)
		}

		// From x=true: already satisfies x=true
		assignment2 := map[string]bool{"x": true, "y": true}
		value2 := mtbdd.Evaluate(result, assignment2)
		if !isTruthy(value2) {
			t.Errorf("EF: Expected true for x=true,y=true, got %v", value2)
		}
	})

	t.Run("AF_Basic", func(t *testing.T) {
		// AF(x) should be same as EF for this system (deterministic)
		result := mtbdd.AF(phi, transition, currentVars, nextVars)
		efResult := mtbdd.EF(phi, transition, currentVars, nextVars)

		// Compare results
		assignment := map[string]bool{"x": true, "y": false}
		afValue := mtbdd.Evaluate(result, assignment)
		efValue := mtbdd.Evaluate(efResult, assignment)

		if afValue != efValue {
			t.Errorf("AF: Expected AF=EF for deterministic system, got AF=%v, EF=%v", afValue, efValue)
		}
	})
}

// TestTemporalOperatorsEG_AG tests the globally operators
func TestTemporalOperatorsEG_AG(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "x_next")

	x, _ := mtbdd.Var("x")
	x_next, _ := mtbdd.Var("x_next")

	currentVars := []string{"x"}
	nextVars := []string{"x_next"}

	// Self-loop transition: x_next = x (state stays same)
	transition := mtbdd.EQUIV(x_next, x)

	// Property: x (x is true)
	phi := x

	t.Run("EG_SelfLoop", func(t *testing.T) {
		// EG(x) with self-loop: should hold exactly where x=true
		result := mtbdd.EG(phi, transition, currentVars, nextVars)

		// x=true: should satisfy EG(x) since it loops to x=true forever
		assignment1 := map[string]bool{"x": true}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EG: Expected true for x=true in self-loop, got %v", value1)
		}

		// x=false: should not satisfy EG(x) since it loops to x=false forever
		assignment2 := map[string]bool{"x": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		if isTruthy(value2) {
			t.Errorf("EG: Expected false for x=false in self-loop, got %v", value2)
		}
	})

	t.Run("AG_SelfLoop", func(t *testing.T) {
		// AG(x) with self-loop: should be same as EG(x) for deterministic system
		result := mtbdd.AG(phi, transition, currentVars, nextVars)
		egResult := mtbdd.EG(phi, transition, currentVars, nextVars)

		// Compare results for x=true
		assignment := map[string]bool{"x": true}
		agValue := mtbdd.Evaluate(result, assignment)
		egValue := mtbdd.Evaluate(egResult, assignment)

		if agValue != egValue {
			t.Errorf("AG: Expected AG=EG for deterministic self-loop, got AG=%v, EG=%v", agValue, egValue)
		}
	})
}

// TestTemporalOperatorsUntil tests the until operators
func TestTemporalOperatorsUntil(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "x_next", "y_next")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	x_next, _ := mtbdd.Var("x_next")
	y_next, _ := mtbdd.Var("y_next")

	currentVars := []string{"x", "y"}
	nextVars := []string{"x_next", "y_next"}

	// Transition: if not y, then y_next = true and x_next = x
	//            if y, then stay same (y_next = true, x_next = x)
	// This models: y becomes true and stays true, x unchanged
	cond := mtbdd.NOT(y)
	trans1 := mtbdd.ITE(cond, mtbdd.Constant(true), y) // y_next = true if !y, else y
	trans2 := mtbdd.EQUIV(x_next, x)                   // x_next = x
	transition := mtbdd.AND(mtbdd.EQUIV(y_next, trans1), trans2)

	// Properties (over current variables)
	phi := x // phi: x is true
	psi := y // psi: y is true

	t.Run("EU_Basic", func(t *testing.T) {
		// EU(x, y): x holds until y becomes true
		result := mtbdd.EU(phi, psi, transition, currentVars, nextVars)

		// x=true, y=false: should satisfy EU since x holds and y will become true
		assignment1 := map[string]bool{"x": true, "y": false}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EU: Expected true for x=true,y=false, got %v", value1)
		}

		// x=false, y=false: should not satisfy EU since x doesn't hold initially
		assignment2 := map[string]bool{"x": false, "y": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		if isTruthy(value2) {
			t.Errorf("EU: Expected false for x=false,y=false, got %v", value2)
		}

		// x=true, y=true: should satisfy EU since psi immediately true
		assignment3 := map[string]bool{"x": true, "y": true}
		value3 := mtbdd.Evaluate(result, assignment3)
		if !isTruthy(value3) {
			t.Errorf("EU: Expected true for x=true,y=true (immediate psi), got %v", value3)
		}
	})

	t.Run("AU_Basic", func(t *testing.T) {
		// AU(x, y): on all paths, x holds until y becomes true
		result := mtbdd.AU(phi, psi, transition, currentVars, nextVars)

		// For deterministic system, AU should behave like EU for valid cases
		euResult := mtbdd.EU(phi, psi, transition, currentVars, nextVars)

		assignment := map[string]bool{"x": true, "y": false}
		auValue := mtbdd.Evaluate(result, assignment)
		euValue := mtbdd.Evaluate(euResult, assignment)

		// Both should be true for this case
		if !isTruthy(auValue) {
			t.Errorf("AU: Expected true for x=true,y=false, got %v", auValue)
		}
		if !isTruthy(euValue) {
			t.Errorf("EU: Expected true for x=true,y=false, got %v", euValue)
		}
	})
}

// TestTemporalOperatorsEdgeCases tests edge cases and boundary conditions
func TestTemporalOperatorsEdgeCases(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "x_next")

	x, _ := mtbdd.Var("x")
	x_next, _ := mtbdd.Var("x_next")

	currentVars := []string{"x"}
	nextVars := []string{"x_next"}

	// Identity transition: x_next = x
	transition := mtbdd.EQUIV(x_next, x)

	t.Run("ConstantProperties", func(t *testing.T) {
		trueNode := mtbdd.Constant(true)
		falseNode := mtbdd.Constant(false)

		// EX(true) should always be true (if there are any successors)
		exTrue := mtbdd.EX(trueNode, transition, currentVars, nextVars)
		assignment := map[string]bool{"x": false}
		value := mtbdd.Evaluate(exTrue, assignment)
		if !isTruthy(value) {
			t.Errorf("EX(true): Expected true, got %v", value)
		}

		// EX(false) should always be false
		exFalse := mtbdd.EX(falseNode, transition, currentVars, nextVars)
		value = mtbdd.Evaluate(exFalse, assignment)
		if isTruthy(value) {
			t.Errorf("EX(false): Expected false, got %v", value)
		}

		// EF(true) should always be true
		efTrue := mtbdd.EF(trueNode, transition, currentVars, nextVars)
		value = mtbdd.Evaluate(efTrue, assignment)
		if !isTruthy(value) {
			t.Errorf("EF(true): Expected true, got %v", value)
		}

		// EG(false) should always be false
		egFalse := mtbdd.EG(falseNode, transition, currentVars, nextVars)
		value = mtbdd.Evaluate(egFalse, assignment)
		if isTruthy(value) {
			t.Errorf("EG(false): Expected false, got %v", value)
		}
	})

	t.Run("EmptyTransition", func(t *testing.T) {
		// Transition that's always false (no transitions possible)
		noTransition := mtbdd.Constant(false)
		phi := x

		// EX with no transitions should be false
		exResult := mtbdd.EX(phi, noTransition, currentVars, nextVars)
		assignment := map[string]bool{"x": true}
		value := mtbdd.Evaluate(exResult, assignment)
		if isTruthy(value) {
			t.Errorf("EX with no transitions: Expected false, got %v", value)
		}

		// AX with no transitions should be true (vacuously true)
		axResult := mtbdd.AX(phi, noTransition, currentVars, nextVars)
		value = mtbdd.Evaluate(axResult, assignment)
		if !isTruthy(value) {
			t.Errorf("AX with no transitions: Expected true (vacuous), got %v", value)
		}
	})
}

// TestTemporalOperatorsDuality tests CTL duality properties
func TestTemporalOperatorsDuality(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "x_next", "y_next")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	x_next, _ := mtbdd.Var("x_next")
	y_next, _ := mtbdd.Var("y_next")

	currentVars := []string{"x", "y"}
	nextVars := []string{"x_next", "y_next"}

	// Simple transition: x toggles, y stays same
	trans1 := mtbdd.EQUIV(x_next, mtbdd.NOT(x))
	trans2 := mtbdd.EQUIV(y_next, y)
	transition := mtbdd.AND(trans1, trans2)

	phi := x

	t.Run("AX_EX_Duality", func(t *testing.T) {
		// AX(phi) = ¬EX(¬phi)
		axResult := mtbdd.AX(phi, transition, currentVars, nextVars)
		exNotPhi := mtbdd.EX(mtbdd.NOT(phi), transition, currentVars, nextVars)
		notExNotPhi := mtbdd.NOT(exNotPhi)

		// Compare at a test point
		assignment := map[string]bool{"x": true, "y": false}
		axValue := mtbdd.Evaluate(axResult, assignment)
		dualValue := mtbdd.Evaluate(notExNotPhi, assignment)

		if axValue != dualValue {
			t.Errorf("AX/EX duality: AX(phi) != ¬EX(¬phi), got AX=%v, ¬EX(¬phi)=%v", axValue, dualValue)
		}
	})

	t.Run("AF_EG_Duality", func(t *testing.T) {
		// AF(phi) = ¬EG(¬phi)
		afResult := mtbdd.AF(phi, transition, currentVars, nextVars)
		egNotPhi := mtbdd.EG(mtbdd.NOT(phi), transition, currentVars, nextVars)
		notEgNotPhi := mtbdd.NOT(egNotPhi)

		// Compare at a test point
		assignment := map[string]bool{"x": false, "y": true}
		afValue := mtbdd.Evaluate(afResult, assignment)
		dualValue := mtbdd.Evaluate(notEgNotPhi, assignment)

		if afValue != dualValue {
			t.Errorf("AF/EG duality: AF(phi) != ¬EG(¬phi), got AF=%v, ¬EG(¬phi)=%v", afValue, dualValue)
		}
	})

	t.Run("AG_EF_Duality", func(t *testing.T) {
		// AG(phi) = ¬EF(¬phi)
		agResult := mtbdd.AG(phi, transition, currentVars, nextVars)
		efNotPhi := mtbdd.EF(mtbdd.NOT(phi), transition, currentVars, nextVars)
		notEfNotPhi := mtbdd.NOT(efNotPhi)

		// Compare at a test point
		assignment := map[string]bool{"x": true, "y": false}
		agValue := mtbdd.Evaluate(agResult, assignment)
		dualValue := mtbdd.Evaluate(notEfNotPhi, assignment)

		if agValue != dualValue {
			t.Errorf("AG/EF duality: AG(phi) != ¬EF(¬phi), got AG=%v, ¬EF(¬phi)=%v", agValue, dualValue)
		}
	})
}

// TestTemporalOperatorsNondeterministic tests operators with nondeterministic transitions
func TestTemporalOperatorsNondeterministic(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "x_next")

	x, _ := mtbdd.Var("x")
	_, _ = mtbdd.Var("x_next")

	currentVars := []string{"x"}
	nextVars := []string{"x_next"}

	// Nondeterministic transition: from any state, can go to either x=true or x=false
	transition := mtbdd.Constant(true) // All transitions allowed

	phi := x // Property: x is true

	t.Run("EX_Nondeterministic", func(t *testing.T) {
		// EX(x) should be true everywhere (can always choose x_next=true)
		result := mtbdd.EX(phi, transition, currentVars, nextVars)

		assignment1 := map[string]bool{"x": true}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EX nondeterministic: Expected true for x=true, got %v", value1)
		}

		assignment2 := map[string]bool{"x": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		if !isTruthy(value2) {
			t.Errorf("EX nondeterministic: Expected true for x=false, got %v", value2)
		}
	})

	t.Run("AX_Nondeterministic", func(t *testing.T) {
		// AX(x) should be false everywhere (can always choose x_next=false)
		result := mtbdd.AX(phi, transition, currentVars, nextVars)

		assignment := map[string]bool{"x": true}
		value := mtbdd.Evaluate(result, assignment)
		if isTruthy(value) {
			t.Errorf("AX nondeterministic: Expected false (can choose x_next=false), got %v", value)
		}
	})
}

// TestTemporalOperatorsComplexTransition tests with more complex transition relations
func TestTemporalOperatorsComplexTransition(t *testing.T) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "x_next", "y_next")

	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	x_next, _ := mtbdd.Var("x_next")
	y_next, _ := mtbdd.Var("y_next")

	currentVars := []string{"x", "y"}
	nextVars := []string{"x_next", "y_next"}

	// Complex transition:
	// - If x && y, then x_next = false, y_next = false (reset)
	// - If x && !y, then x_next = true, y_next = true (progress)
	// - If !x && y, then x_next = false, y_next = false (reset)
	// - If !x && !y, then x_next = true, y_next = false (start)

	_ = mtbdd.OR(mtbdd.AND(x, y), mtbdd.AND(mtbdd.NOT(x), y))
	progressCondition := mtbdd.AND(x, mtbdd.NOT(y))
	startCondition := mtbdd.AND(mtbdd.NOT(x), mtbdd.NOT(y))

	// x_next logic
	xNextTrue := mtbdd.OR(progressCondition, startCondition)
	transX := mtbdd.EQUIV(x_next, xNextTrue)

	// y_next logic
	yNextTrue := progressCondition
	transY := mtbdd.EQUIV(y_next, yNextTrue)

	transition := mtbdd.AND(transX, transY)

	t.Run("EF_ComplexReachability", func(t *testing.T) {
		// Test reachability of state where both x and y are true
		target := mtbdd.AND(x, y)
		result := mtbdd.EF(target, transition, currentVars, nextVars)

		// From (false,false): should reach (true,true) via (true,false)
		assignment1 := map[string]bool{"x": false, "y": false}
		value1 := mtbdd.Evaluate(result, assignment1)
		if !isTruthy(value1) {
			t.Errorf("EF complex: Expected reachable from (false,false), got %v", value1)
		}

		// From (true,false): should reach (true,true) in one step
		assignment2 := map[string]bool{"x": true, "y": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		if !isTruthy(value2) {
			t.Errorf("EF complex: Expected reachable from (true,false), got %v", value2)
		}
	})

	t.Run("EG_ComplexInvariant", func(t *testing.T) {
		// Test what states can maintain x=true forever
		invariant := x
		result := mtbdd.EG(invariant, transition, currentVars, nextVars)

		// From (true,true): goes to (false,false), so cannot maintain x=true
		assignment1 := map[string]bool{"x": true, "y": true}
		value1 := mtbdd.Evaluate(result, assignment1)
		if isTruthy(value1) {
			t.Errorf("EG complex: Expected false from (true,true), got %v", value1)
		}

		// Check other states
		assignment2 := map[string]bool{"x": false, "y": false}
		value2 := mtbdd.Evaluate(result, assignment2)
		// This should be false since (false,false) -> (true,false) -> (true,true) -> (false,false)
		// So we can't maintain x=true forever
		if isTruthy(value2) {
			t.Errorf("EG complex: Expected false from (false,false), got %v", value2)
		}
	})
}

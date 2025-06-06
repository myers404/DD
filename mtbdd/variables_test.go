package mtbdd

import (
	"testing"
)

// TestDeclare tests the Declare method for declaring multiple variables
func TestDeclare(t *testing.T) {
	tests := []struct {
		name      string
		variables []string
		expected  []string
	}{
		{
			name:      "Empty declaration",
			variables: []string{},
			expected:  []string{},
		},
		{
			name:      "Single variable",
			variables: []string{"x"},
			expected:  []string{"x"},
		},
		{
			name:      "Multiple variables",
			variables: []string{"x", "y", "z"},
			expected:  []string{"x", "y", "z"},
		},
		{
			name:      "Variables with underscores",
			variables: []string{"var_1", "_temp", "result_2"},
			expected:  []string{"var_1", "_temp", "result_2"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mtbdd := NewUDD()
			mtbdd.Declare(tt.variables...)

			// Check variable count
			if count := mtbdd.VariableCount(); count != len(tt.expected) {
				t.Errorf("VariableCount() = %d, want %d", count, len(tt.expected))
			}

			// Check variable ordering
			order := mtbdd.GetVariableOrder()
			if !stringSliceEqual(order, tt.expected) {
				t.Errorf("GetVariableOrder() = %v, want %v", order, tt.expected)
			}

			// Check all variables exist and have correct levels
			for i, variable := range tt.expected {
				if !mtbdd.HasVariable(variable) {
					t.Errorf("Variable %s not found after declaration", variable)
				}

				level, err := mtbdd.LevelOfVar(variable)
				if err != nil {
					t.Errorf("LevelOfVar(%s) error: %v", variable, err)
				}
				if level != i {
					t.Errorf("LevelOfVar(%s) = %d, want %d", variable, level, i)
				}
			}
		})
	}
}

// TestDeclareInvalidVariables tests declaring invalid variable names
func TestDeclareInvalidVariables(t *testing.T) {
	mtbdd := NewUDD()

	// Declare some invalid variable names - they should be ignored
	mtbdd.Declare("123invalid", "", "var-with-dash", "x", "valid_var")

	// Only valid variables should be declared
	expected := []string{"x", "valid_var"}
	order := mtbdd.GetVariableOrder()

	if !stringSliceEqual(order, expected) {
		t.Errorf("GetVariableOrder() = %v, want %v (invalid names should be ignored)", order, expected)
	}
}

// TestDeclareDuplicates tests declaring duplicate variables
func TestDeclareDuplicates(t *testing.T) {
	mtbdd := NewUDD()

	// Declare some variables, including duplicates
	mtbdd.Declare("x", "y")
	mtbdd.Declare("y", "z", "x") // y and x are duplicates

	// Should only have unique variables in correct order
	expected := []string{"x", "y", "z"}
	order := mtbdd.GetVariableOrder()

	if !stringSliceEqual(order, expected) {
		t.Errorf("GetVariableOrder() = %v, want %v (duplicates should be ignored)", order, expected)
	}

	if count := mtbdd.VariableCount(); count != 3 {
		t.Errorf("VariableCount() = %d, want 3", count)
	}
}

// TestAddVar tests the AddVar method for adding single variables
func TestAddVar(t *testing.T) {
	mtbdd := NewUDD()

	// Test adding valid variables
	tests := []struct {
		variable      string
		expectedLevel int
	}{
		{"x", 0},
		{"y", 1},
		{"var_1", 2},
		{"_temp", 3},
	}

	for _, tt := range tests {
		level := mtbdd.AddVar(tt.variable)
		if level != tt.expectedLevel {
			t.Errorf("AddVar(%s) = %d, want %d", tt.variable, level, tt.expectedLevel)
		}

		// Verify variable is actually added
		if !mtbdd.HasVariable(tt.variable) {
			t.Errorf("Variable %s not found after AddVar", tt.variable)
		}
	}

	// Test adding duplicate variable
	level := mtbdd.AddVar("x") // x already exists at level 0
	if level != 0 {
		t.Errorf("AddVar(duplicate 'x') = %d, want 0", level)
	}

	// Test adding invalid variable
	level = mtbdd.AddVar("123invalid")
	if level != -1 {
		t.Errorf("AddVar(invalid name) = %d, want -1", level)
	}
}

// TestVar tests the Var method for creating variable BDD nodes
func TestVar(t *testing.T) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")

	// Test creating variable nodes for declared variables
	for _, variable := range []string{"x", "y", "z"} {
		nodeRef, err := mtbdd.Var(variable)
		if err != nil {
			t.Errorf("Var(%s) error: %v", variable, err)
			continue
		}

		if nodeRef == NullRef {
			t.Errorf("Var(%s) returned NullRef", variable)
		}

		// Verify it's a decision node
		if mtbdd.IsTerminal(nodeRef) {
			t.Errorf("Var(%s) returned terminal node, expected decision node", variable)
		}

		// Get the node and verify its structure
		node, _, exists := mtbdd.GetNode(nodeRef)
		if !exists || node == nil {
			t.Errorf("Var(%s) created invalid node", variable)
			continue
		}

		if node.Variable != variable {
			t.Errorf("Var(%s) node has wrong variable: %s", variable, node.Variable)
		}

		if node.Low != FalseRef {
			t.Errorf("Var(%s) node low child = %v, want FalseRef", variable, node.Low)
		}

		if node.High != TrueRef {
			t.Errorf("Var(%s) node high child = %v, want TrueRef", variable, node.High)
		}
	}

	// Test creating variable node for undeclared variable
	_, err := mtbdd.Var("undeclared")
	if err == nil {
		t.Error("Var(undeclared) should return error")
	}
}

// TestLevelOfVar tests the LevelOfVar method
func TestLevelOfVar(t *testing.T) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")

	tests := []struct {
		variable      string
		expectedLevel int
		expectError   bool
	}{
		{"x", 0, false},
		{"y", 1, false},
		{"z", 2, false},
		{"undeclared", -1, true},
	}

	for _, tt := range tests {
		level, err := mtbdd.LevelOfVar(tt.variable)

		if tt.expectError {
			if err == nil {
				t.Errorf("LevelOfVar(%s) should return error", tt.variable)
			}
		} else {
			if err != nil {
				t.Errorf("LevelOfVar(%s) error: %v", tt.variable, err)
			}
			if level != tt.expectedLevel {
				t.Errorf("LevelOfVar(%s) = %d, want %d", tt.variable, level, tt.expectedLevel)
			}
		}
	}
}

// TestVarAtLevel tests the VarAtLevel method
func TestVarAtLevel(t *testing.T) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")

	tests := []struct {
		level       int
		expectedVar string
		expectError bool
	}{
		{0, "x", false},
		{1, "y", false},
		{2, "z", false},
		{-1, "", true},  // negative level
		{3, "", true},   // out of range
		{100, "", true}, // way out of range
	}

	for _, tt := range tests {
		variable, err := mtbdd.VarAtLevel(tt.level)

		if tt.expectError {
			if err == nil {
				t.Errorf("VarAtLevel(%d) should return error", tt.level)
			}
		} else {
			if err != nil {
				t.Errorf("VarAtLevel(%d) error: %v", tt.level, err)
			}
			if variable != tt.expectedVar {
				t.Errorf("VarAtLevel(%d) = %s, want %s", tt.level, variable, tt.expectedVar)
			}
		}
	}
}

// TestGetVariableOrder tests the GetVariableOrder method
func TestGetVariableOrder(t *testing.T) {
	mtbdd := NewUDD()

	// Test empty ordering
	order := mtbdd.GetVariableOrder()
	if len(order) != 0 {
		t.Errorf("GetVariableOrder() on empty MTBDD = %v, want []", order)
	}

	// Test with variables
	mtbdd.Declare("x", "y", "z")
	order = mtbdd.GetVariableOrder()
	expected := []string{"x", "y", "z"}

	if !stringSliceEqual(order, expected) {
		t.Errorf("GetVariableOrder() = %v, want %v", order, expected)
	}

	// Test that returned slice is a copy (modifying it shouldn't affect internal state)
	order[0] = "modified"
	newOrder := mtbdd.GetVariableOrder()
	if newOrder[0] != "x" {
		t.Error("GetVariableOrder() should return a copy, not reference to internal slice")
	}
}

// TestVariableCount tests the VariableCount method
func TestVariableCount(t *testing.T) {
	mtbdd := NewUDD()

	// Test empty MTBDD
	if count := mtbdd.VariableCount(); count != 0 {
		t.Errorf("VariableCount() on empty MTBDD = %d, want 0", count)
	}

	// Test after adding variables
	mtbdd.Declare("x")
	if count := mtbdd.VariableCount(); count != 1 {
		t.Errorf("VariableCount() after 1 variable = %d, want 1", count)
	}

	mtbdd.Declare("y", "z")
	if count := mtbdd.VariableCount(); count != 3 {
		t.Errorf("VariableCount() after 3 variables = %d, want 3", count)
	}
}

// TestSetVariableOrder tests the SetVariableOrder method
func TestSetVariableOrder(t *testing.T) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")

	// Test valid reordering
	newOrder := []string{"z", "x", "y"}
	err := mtbdd.SetVariableOrder(newOrder)
	if err != nil {
		t.Errorf("SetVariableOrder() error: %v", err)
	}

	// Verify new ordering
	order := mtbdd.GetVariableOrder()
	if !stringSliceEqual(order, newOrder) {
		t.Errorf("GetVariableOrder() after reorder = %v, want %v", order, newOrder)
	}

	// Verify levels are updated correctly
	expectedLevels := map[string]int{"z": 0, "x": 1, "y": 2}
	for variable, expectedLevel := range expectedLevels {
		level, err := mtbdd.LevelOfVar(variable)
		if err != nil {
			t.Errorf("LevelOfVar(%s) after reorder error: %v", variable, err)
		}
		if level != expectedLevel {
			t.Errorf("LevelOfVar(%s) after reorder = %d, want %d", variable, level, expectedLevel)
		}
	}
}

// TestSetVariableOrderErrors tests error cases for SetVariableOrder
func TestSetVariableOrderErrors(t *testing.T) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y", "z")

	tests := []struct {
		name     string
		newOrder []string
	}{
		{
			name:     "Wrong length",
			newOrder: []string{"x", "y"}, // missing z
		},
		{
			name:     "Duplicate variable",
			newOrder: []string{"x", "x", "y"}, // x appears twice
		},
		{
			name:     "Undeclared variable",
			newOrder: []string{"x", "y", "undeclared"}, // undeclared not in MTBDD
		},
		{
			name:     "Missing declared variable",
			newOrder: []string{"x", "y", "w"}, // missing z, has undeclared w
		},
		{
			name:     "Invalid variable name",
			newOrder: []string{"x", "y", "123invalid"}, // invalid name
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := mtbdd.SetVariableOrder(tt.newOrder)
			if err == nil {
				t.Errorf("SetVariableOrder(%v) should return error for %s", tt.newOrder, tt.name)
			}

			// Verify original ordering is preserved after error
			order := mtbdd.GetVariableOrder()
			expected := []string{"x", "y", "z"}
			if !stringSliceEqual(order, expected) {
				t.Errorf("Original ordering not preserved after error: got %v, want %v", order, expected)
			}
		})
	}
}

// TestHasVariable tests the HasVariable method
func TestHasVariable(t *testing.T) {
	mtbdd := NewUDD()

	// Test on empty MTBDD
	if mtbdd.HasVariable("x") {
		t.Error("HasVariable('x') on empty MTBDD should return false")
	}

	// Test after declaring variables
	mtbdd.Declare("x", "y")

	if !mtbdd.HasVariable("x") {
		t.Error("HasVariable('x') should return true after declaring x")
	}

	if !mtbdd.HasVariable("y") {
		t.Error("HasVariable('y') should return true after declaring y")
	}

	if mtbdd.HasVariable("z") {
		t.Error("HasVariable('z') should return false for undeclared variable")
	}
}

// TestGetAllVariables tests the GetAllVariables method
func TestGetAllVariables(t *testing.T) {
	mtbdd := NewUDD()

	// Test empty MTBDD
	vars := mtbdd.GetAllVariables()
	if len(vars) != 0 {
		t.Errorf("GetAllVariables() on empty MTBDD = %v, want empty map", vars)
	}

	// Test with variables
	mtbdd.Declare("x", "y", "z")
	vars = mtbdd.GetAllVariables()

	expected := map[string]int{"x": 0, "y": 1, "z": 2}

	if len(vars) != len(expected) {
		t.Errorf("GetAllVariables() length = %d, want %d", len(vars), len(expected))
	}

	for variable, expectedLevel := range expected {
		if level, exists := vars[variable]; !exists {
			t.Errorf("GetAllVariables() missing variable %s", variable)
		} else if level != expectedLevel {
			t.Errorf("GetAllVariables()[%s] = %d, want %d", variable, level, expectedLevel)
		}
	}

	// Test that returned map is a copy
	vars["x"] = 999
	newVars := mtbdd.GetAllVariables()
	if newVars["x"] != 0 {
		t.Error("GetAllVariables() should return a copy, not reference to internal map")
	}
}

// TestConcurrentAccess tests thread safety of variable operations
func TestConcurrentAccess(t *testing.T) {
	mtbdd := NewUDD()

	// This is a basic concurrency test - in a real scenario you'd want more sophisticated testing
	done := make(chan bool, 2)

	// Goroutine 1: Declare variables
	go func() {
		for i := 0; i < 100; i++ {
			mtbdd.Declare("x", "y", "z")
		}
		done <- true
	}()

	// Goroutine 2: Read variable information
	go func() {
		for i := 0; i < 100; i++ {
			mtbdd.VariableCount()
			mtbdd.GetVariableOrder()
			mtbdd.HasVariable("x")
		}
		done <- true
	}()

	// Wait for both goroutines to complete
	<-done
	<-done

	// Verify final state is consistent
	if count := mtbdd.VariableCount(); count != 3 {
		t.Errorf("Final VariableCount() = %d, want 3", count)
	}
}

// Helper function to compare string slices
func stringSliceEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i, v := range a {
		if v != b[i] {
			return false
		}
	}
	return true
}

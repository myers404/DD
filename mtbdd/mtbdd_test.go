package mtbdd

import (
	"sync"
	"testing"
)

// TestNewMTBDD tests the basic constructor functionality for optimized MTBDD
func TestNewMTBDD(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test that MTBDD is properly initialized
	if mtbdd == nil {
		t.Fatal("NewMTBDD() returned nil")
	}

	// Test that basic terminals exist
	if value, exists := mtbdd.GetTerminalValue(TrueRef); !exists || value != true {
		t.Error("TrueRef not properly initialized")
	}

	if value, exists := mtbdd.GetTerminalValue(FalseRef); !exists || value != false {
		t.Error("FalseRef not properly initialized")
	}

	// Test memory statistics are properly initialized
	stats := mtbdd.GetMemoryStats()
	if stats.TotalNodes != 2 {
		t.Errorf("Expected 2 initial nodes (true/false), got %d", stats.TotalNodes)
	}

	if stats.TerminalNodes != 2 {
		t.Errorf("Expected 2 terminal nodes, got %d", stats.TerminalNodes)
	}

	if stats.DecisionNodes != 0 {
		t.Errorf("Expected 0 decision nodes initially, got %d", stats.DecisionNodes)
	}
}

// TestInitialState tests the initial state of a new optimized MTBDD
func TestInitialState(t *testing.T) {
	mtbdd := NewMTBDD()

	stats := mtbdd.GetMemoryStats()

	// Test that we start with 2 nodes (TrueRef and FalseRef)
	if stats.TotalNodes != 2 {
		t.Errorf("Expected 2 initial nodes, got %d", stats.TotalNodes)
	}

	// Test that terminal count is correct
	if stats.TerminalNodes != 2 {
		t.Errorf("Expected 2 terminal nodes, got %d", stats.TerminalNodes)
	}

	// Test that decision node count is 0
	if stats.DecisionNodes != 0 {
		t.Errorf("Expected 0 decision nodes initially, got %d", stats.DecisionNodes)
	}

	// Test that variables count is 0
	if stats.VariableCount != 0 {
		t.Errorf("Expected 0 variables initially, got %d", stats.VariableCount)
	}

	// Test that all cache types are empty initially
	if stats.BinaryCacheSize != 0 {
		t.Errorf("Expected binary cache size 0 initially, got %d", stats.BinaryCacheSize)
	}

	if stats.UnaryCacheSize != 0 {
		t.Errorf("Expected unary cache size 0 initially, got %d", stats.UnaryCacheSize)
	}

	if stats.TernaryCacheSize != 0 {
		t.Errorf("Expected ternary cache size 0 initially, got %d", stats.TernaryCacheSize)
	}

	if stats.QuantCacheSize != 0 {
		t.Errorf("Expected quantify cache size 0 initially, got %d", stats.QuantCacheSize)
	}

	if stats.ComposeCacheSize != 0 {
		t.Errorf("Expected compose cache size 0 initially, got %d", stats.ComposeCacheSize)
	}

	if stats.CacheSize != 0 {
		t.Errorf("Expected total cache size 0 initially, got %d", stats.CacheSize)
	}

	// Test that variable management is initialized correctly
	if mtbdd.VariableCount() != 0 {
		t.Errorf("Expected 0 variables, got %d", mtbdd.VariableCount())
	}

	variables := mtbdd.GetVariableOrder()
	if len(variables) != 0 {
		t.Errorf("Expected empty variable order, got length %d", len(variables))
	}
}

// TestMultipleInstances tests that multiple MTBDD instances are independent
func TestMultipleInstances(t *testing.T) {
	mtbdd1 := NewMTBDD()
	mtbdd2 := NewMTBDD()

	// Test that instances are different objects
	if mtbdd1 == mtbdd2 {
		t.Error("NewMTBDD() returned the same instance")
	}

	// Test that both have proper initial state
	stats1 := mtbdd1.GetMemoryStats()
	stats2 := mtbdd2.GetMemoryStats()

	if stats1.TotalNodes != 2 || stats2.TotalNodes != 2 {
		t.Error("One or both instances have incorrect initial node count")
	}

	if stats1.TerminalNodes != 2 || stats2.TerminalNodes != 2 {
		t.Error("One or both instances have incorrect number of initial terminals")
	}

	// Test that modifications to one don't affect the other
	mtbdd1.Declare("x")

	if mtbdd1.VariableCount() != 1 {
		t.Error("mtbdd1 should have 1 variable after declaration")
	}

	if mtbdd2.VariableCount() != 0 {
		t.Error("mtbdd2 should still have 0 variables")
	}

	// Test cache independence
	mtbdd1.SetCachedBinaryOp("TEST", TrueRef, FalseRef, TrueRef)

	stats1After := mtbdd1.GetMemoryStats()
	stats2After := mtbdd2.GetMemoryStats()

	if stats1After.BinaryCacheSize == 0 {
		t.Error("mtbdd1 should have cache entry")
	}

	if stats2After.BinaryCacheSize != 0 {
		t.Error("mtbdd2 should not have cache entry")
	}
}

// TestConcurrentCreation tests that NewMTBDD() is safe for concurrent use
func TestConcurrentCreation(t *testing.T) {
	const numGoroutines = 10
	var wg sync.WaitGroup
	instances := make([]*MTBDD, numGoroutines)

	// Create MTBDDs concurrently
	for i := 0; i < numGoroutines; i++ {
		wg.Add(1)
		go func(index int) {
			defer wg.Done()
			instances[index] = NewMTBDD()
		}(i)
	}

	wg.Wait()

	// Verify all instances were created successfully
	for i, instance := range instances {
		if instance == nil {
			t.Errorf("Instance %d is nil", i)
			continue
		}

		// Check basic initialization
		stats := instance.GetMemoryStats()
		if stats.TotalNodes != 2 {
			t.Errorf("Instance %d has incorrect node count: %d", i, stats.TotalNodes)
		}

		if stats.TerminalNodes != 2 {
			t.Errorf("Instance %d has incorrect terminal count: %d", i, stats.TerminalNodes)
		}

		if stats.CacheSize != 0 {
			t.Errorf("Instance %d has non-zero cache size: %d", i, stats.CacheSize)
		}
	}

	// Verify all instances are unique
	for i := 0; i < numGoroutines; i++ {
		for j := i + 1; j < numGoroutines; j++ {
			if instances[i] == instances[j] {
				t.Errorf("Instances %d and %d are the same object", i, j)
			}
		}
	}
}

// TestNodeRefType tests the NodeRef type and constants
func TestNodeRefType(t *testing.T) {
	var ref NodeRef = 42

	// Test that NodeRef behaves as an integer
	if ref != 42 {
		t.Errorf("NodeRef assignment failed: got %d, expected 42", ref)
	}

	// Test predefined constants
	if TrueRef != 0 {
		t.Errorf("TrueRef should be 0, got %d", TrueRef)
	}

	if FalseRef != 1 {
		t.Errorf("FalseRef should be 1, got %d", FalseRef)
	}

	if NullRef == TrueRef || NullRef == FalseRef {
		t.Error("NullRef should be different from TrueRef and FalseRef")
	}
}

// TestBasicOperations tests that basic operations work on a new MTBDD
func TestBasicOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test terminal operations
	trueNode := mtbdd.Constant(true)
	falseNode := mtbdd.Constant(false)

	if trueNode != TrueRef {
		t.Error("Constant(true) should return TrueRef")
	}

	if falseNode != FalseRef {
		t.Error("Constant(false) should return FalseRef")
	}

	// Test terminal value retrieval
	if value, exists := mtbdd.GetTerminalValue(trueNode); !exists || value != true {
		t.Error("Should be able to retrieve true terminal value")
	}

	if value, exists := mtbdd.GetTerminalValue(falseNode); !exists || value != false {
		t.Error("Should be able to retrieve false terminal value")
	}

	// Test terminal checking
	if !mtbdd.IsTerminal(trueNode) {
		t.Error("True node should be terminal")
	}

	if !mtbdd.IsTerminal(falseNode) {
		t.Error("False node should be terminal")
	}
}

// TestCacheSystemInitialization tests the optimized cache system initialization
func TestCacheSystemInitialization(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test that cache access methods work
	result, exists := mtbdd.GetCachedBinaryOp("AND", TrueRef, FalseRef)
	if exists {
		t.Error("Should get cache miss on empty cache")
	}

	result, exists = mtbdd.GetCachedUnaryOp("NOT", TrueRef)
	if exists {
		t.Error("Should get cache miss on empty unary cache")
	}

	result, exists = mtbdd.GetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef)
	if exists {
		t.Error("Should get cache miss on empty ternary cache")
	}

	// Test that cache setting works
	mtbdd.SetCachedBinaryOp("AND", TrueRef, FalseRef, FalseRef)
	result, exists = mtbdd.GetCachedBinaryOp("AND", TrueRef, FalseRef)
	if !exists {
		t.Error("Should get cache hit after setting")
	}
	if result != FalseRef {
		t.Error("Should get correct cached result")
	}

	// Test that cache statistics update
	stats := mtbdd.GetMemoryStats()
	if stats.BinaryCacheSize == 0 {
		t.Error("Binary cache size should be non-zero after setting entry")
	}

	if stats.CacheSize == 0 {
		t.Error("Total cache size should be non-zero after setting entry")
	}

	// Verify cache size calculation
	expectedCacheSize := stats.BinaryCacheSize + stats.UnaryCacheSize +
		stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
	if stats.CacheSize != expectedCacheSize {
		t.Errorf("Total cache size %d should equal sum of individual caches %d",
			stats.CacheSize, expectedCacheSize)
	}
}

// TestVariableManagement tests variable declaration and management
func TestVariableManagement(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test initial state
	if mtbdd.VariableCount() != 0 {
		t.Error("Should start with 0 variables")
	}

	// Test variable declaration
	mtbdd.Declare("x", "y", "z")

	if mtbdd.VariableCount() != 3 {
		t.Errorf("Should have 3 variables after declaration, got %d", mtbdd.VariableCount())
	}

	// Test variable order
	order := mtbdd.GetVariableOrder()
	expectedOrder := []string{"x", "y", "z"}

	if len(order) != len(expectedOrder) {
		t.Errorf("Variable order length mismatch: got %d, expected %d", len(order), len(expectedOrder))
	}

	for i, variable := range expectedOrder {
		if i >= len(order) || order[i] != variable {
			t.Errorf("Variable order mismatch at position %d: got %s, expected %s", i, order[i], variable)
		}
	}

	// Test variable creation
	x, err := mtbdd.Var("x")
	if err != nil {
		t.Errorf("Failed to create variable x: %v", err)
	}

	if mtbdd.IsTerminal(x) {
		t.Error("Variable node should not be terminal")
	}

	// Test level queries
	level, err := mtbdd.LevelOfVar("x")
	if err != nil {
		t.Errorf("Failed to get level of variable x: %v", err)
	}

	if level != 0 {
		t.Errorf("Expected level 0 for first variable, got %d", level)
	}

	// Test variable at level
	variable, err := mtbdd.VarAtLevel(0)
	if err != nil {
		t.Errorf("Failed to get variable at level 0: %v", err)
	}

	if variable != "x" {
		t.Errorf("Expected variable 'x' at level 0, got '%s'", variable)
	}
}

// TestMemoryStatsConsistency tests that memory statistics remain consistent
func TestMemoryStatsConsistency(t *testing.T) {
	mtbdd := NewMTBDD()

	// Get initial stats
	initialStats := mtbdd.GetMemoryStats()

	// Add some variables and operations
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Perform operations that populate different cache types
	// Note: Boolean operations (AND, NOT) use ternary cache via ITE
	// Arithmetic operations populate binary/unary caches

	// Create numeric terminals for arithmetic operations
	num1 := mtbdd.Constant(5)
	num2 := mtbdd.Constant(3)

	mtbdd.Add(num1, num2) // Binary cache (arithmetic)
	mtbdd.Negate(num1)    // Unary cache (arithmetic)
	mtbdd.AND(x, y)       // Ternary cache (boolean via ITE)

	finalStats := mtbdd.GetMemoryStats()

	// Verify node counts increased
	if finalStats.TotalNodes <= initialStats.TotalNodes {
		t.Error("Total nodes should increase after adding variables and operations")
	}

	if finalStats.DecisionNodes <= initialStats.DecisionNodes {
		t.Error("Decision nodes should increase after adding variables")
	}

	// Verify cache consistency
	expectedCacheSize := finalStats.BinaryCacheSize + finalStats.UnaryCacheSize +
		finalStats.TernaryCacheSize + finalStats.QuantCacheSize + finalStats.ComposeCacheSize
	if finalStats.CacheSize != expectedCacheSize {
		t.Errorf("Cache size calculation inconsistent: total=%d, sum=%d",
			finalStats.CacheSize, expectedCacheSize)
	}

	// Verify individual cache types have entries
	if finalStats.BinaryCacheSize == 0 {
		t.Error("Binary cache should have entries after Add operation")
	}

	if finalStats.UnaryCacheSize == 0 {
		t.Error("Unary cache should have entries after Negate operation")
	}

	if finalStats.TernaryCacheSize == 0 {
		t.Error("Ternary cache should have entries after AND operation (via ITE)")
	}

	// Verify DecisionNodes + TerminalNodes = TotalNodes
	if finalStats.DecisionNodes+finalStats.TerminalNodes != finalStats.TotalNodes {
		t.Errorf("DecisionNodes(%d) + TerminalNodes(%d) != TotalNodes(%d)",
			finalStats.DecisionNodes, finalStats.TerminalNodes, finalStats.TotalNodes)
	}
}

// TestErrorHandling tests error conditions
func TestErrorHandling(t *testing.T) {
	mtbdd := NewMTBDD()

	// Test variable not declared
	_, err := mtbdd.Var("undeclared")
	if err == nil {
		t.Error("Should get error for undeclared variable")
	}

	// Test level of undeclared variable
	_, err = mtbdd.LevelOfVar("undeclared")
	if err == nil {
		t.Error("Should get error for level of undeclared variable")
	}

	// Test variable at invalid level
	_, err = mtbdd.VarAtLevel(-1)
	if err == nil {
		t.Error("Should get error for negative level")
	}

	_, err = mtbdd.VarAtLevel(999)
	if err == nil {
		t.Error("Should get error for level beyond range")
	}
}

// TestCacheBehavior tests that caching works correctly
func TestCacheWithCorrectExpectations(t *testing.T) {
	mtbdd := NewMTBDD()

	num1 := mtbdd.Constant(10)
	num2 := mtbdd.Constant(5)

	mtbdd.Add(num1, num2)      // → Binary cache
	mtbdd.Multiply(num1, num2) // → Binary cache
	mtbdd.Negate(num1)         // → Unary cache

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	mtbdd.AND(x, y)          // → Ternary cache (ITE(x, y, false))
	mtbdd.OR(x, y)           // → Ternary cache (ITE(x, true, y))
	mtbdd.NOT(x)             // → Ternary cache (ITE(x, false, true))
	mtbdd.ITE(x, y, TrueRef) // → Ternary cache

	stats := mtbdd.GetMemoryStats()

	if stats.BinaryCacheSize == 0 {
		t.Error("Expected binary cache entries from Add/Multiply operations")
	}

	if stats.UnaryCacheSize == 0 {
		t.Error("Expected unary cache entries from Negate operation")
	}

	if stats.TernaryCacheSize == 0 {
		t.Error("Expected ternary cache entries from boolean operations (via ITE)")
	}

	// Total should be sum of all caches
	expectedTotal := stats.BinaryCacheSize + stats.UnaryCacheSize +
		stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
	if stats.CacheSize != expectedTotal {
		t.Errorf("Total cache size %d != sum of individual caches %d",
			stats.CacheSize, expectedTotal)
	}
}

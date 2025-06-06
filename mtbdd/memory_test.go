package mtbdd

import (
	"strings"
	"testing"
)

// TestClearCaches tests the cache clearing functionality with optimized typed caches
func TestClearCaches(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create numeric terminals for arithmetic operations
	num1 := mtbdd.Constant(10)
	num2 := mtbdd.Constant(5)

	// Perform operations that should populate different cache types
	result1 := mtbdd.Add(num1, num2)      // Binary operation (arithmetic)
	result2 := mtbdd.Multiply(num1, num2) // Binary operation (arithmetic)
	result3 := mtbdd.Negate(num1)         // Unary operation (arithmetic)
	result4 := mtbdd.ITE(x, y, result1)   // Ternary operation
	result5 := mtbdd.AND(x, y)            // Ternary operation (boolean via ITE)

	// Verify operations work
	if result1 == 0 || result2 == 0 || result3 == 0 || result4 == 0 || result5 == 0 {
		t.Error("Basic operations failed")
	}

	// Get initial stats
	initialStats := mtbdd.GetMemoryStats()
	if initialStats.CacheSize == 0 {
		t.Error("Expected cache to have entries after operations")
	}

	// Verify individual cache types have entries
	if initialStats.BinaryCacheSize == 0 {
		t.Error("Expected binary cache to have entries after Add/Multiply operations")
	}

	if initialStats.UnaryCacheSize == 0 {
		t.Error("Expected unary cache to have entries after Negate operation")
	}

	if initialStats.TernaryCacheSize == 0 {
		t.Error("Expected ternary cache to have entries after ITE/AND operations")
	}

	// Verify total cache size is sum of individual caches
	expectedTotal := initialStats.BinaryCacheSize + initialStats.UnaryCacheSize +
		initialStats.TernaryCacheSize + initialStats.QuantCacheSize + initialStats.ComposeCacheSize
	if initialStats.CacheSize != expectedTotal {
		t.Errorf("Total cache size %d should equal sum of individual caches %d",
			initialStats.CacheSize, expectedTotal)
	}

	// Clear caches
	mtbdd.ClearCaches()

	// Verify all cache types are cleared
	clearedStats := mtbdd.GetMemoryStats()
	if clearedStats.CacheSize != 0 {
		t.Errorf("Expected total cache size 0 after clearing, got %d", clearedStats.CacheSize)
	}

	if clearedStats.BinaryCacheSize != 0 {
		t.Errorf("Expected binary cache size 0 after clearing, got %d", clearedStats.BinaryCacheSize)
	}

	if clearedStats.UnaryCacheSize != 0 {
		t.Errorf("Expected unary cache size 0 after clearing, got %d", clearedStats.UnaryCacheSize)
	}

	if clearedStats.TernaryCacheSize != 0 {
		t.Errorf("Expected ternary cache size 0 after clearing, got %d", clearedStats.TernaryCacheSize)
	}

	if clearedStats.QuantCacheSize != 0 {
		t.Errorf("Expected quantify cache size 0 after clearing, got %d", clearedStats.QuantCacheSize)
	}

	if clearedStats.ComposeCacheSize != 0 {
		t.Errorf("Expected compose cache size 0 after clearing, got %d", clearedStats.ComposeCacheSize)
	}

	// Verify operations still work after cache clear (due to hash consing)
	result6 := mtbdd.Add(num1, num2)
	if result6 != result1 {
		t.Error("Operations should produce same results after cache clear due to hash consing")
	}
}

// TestClearSpecificCache tests the selective cache clearing functionality
func TestClearSpecificCache(t *testing.T) {
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

// TestGarbageCollect tests garbage collection functionality
func TestGarbageCollect(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables
	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Create some nodes
	temp1 := mtbdd.AND(x, y)
	temp2 := mtbdd.OR(y, z)
	root := mtbdd.AND(temp1, temp2)

	// Create unreachable nodes
	unreachable1 := mtbdd.XOR(x, z)
	unreachable2 := mtbdd.IMPLIES(y, x)
	_, _ = unreachable1, unreachable2 // Prevent unused variable warnings

	// Get initial stats
	initialStats := mtbdd.GetMemoryStats()
	initialNodeCount := initialStats.TotalNodes

	if initialNodeCount == 0 {
		t.Error("Expected some nodes to exist")
	}

	// Perform garbage collection with only root as reachable
	mtbdd.GarbageCollect([]NodeRef{root})

	// Check that unreachable nodes were removed
	afterGCStats := mtbdd.GetMemoryStats()

	// Should have fewer or equal nodes after GC (unreachable ones removed)
	if afterGCStats.TotalNodes > initialNodeCount {
		t.Errorf("Expected fewer or equal nodes after GC. Before: %d, After: %d",
			initialNodeCount, afterGCStats.TotalNodes)
	}

	// Root should still be evaluable
	assignment := map[string]bool{"x": true, "y": true, "z": false}
	result := mtbdd.Evaluate(root, assignment)
	if result != true {
		t.Error("Root node should still be evaluable after garbage collection")
	}
}

// TestGarbageCollectMultipleRoots tests GC with multiple root nodes
func TestGarbageCollectMultipleRoots(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables
	mtbdd.Declare("a", "b", "c")
	a, _ := mtbdd.Var("a")
	b, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")

	// Create multiple root structures
	root1 := mtbdd.AND(a, b)
	root2 := mtbdd.OR(b, c)
	shared := mtbdd.NOT(b) // Shared by both roots through other operations
	root3 := mtbdd.XOR(shared, c)

	// Create unreachable nodes
	unreachable := mtbdd.EQUIV(a, c)
	_ = unreachable

	// Perform GC with multiple roots
	mtbdd.GarbageCollect([]NodeRef{root1, root2, root3})

	// All roots should still work
	assignment := map[string]bool{"a": true, "b": false, "c": true}

	result1 := mtbdd.Evaluate(root1, assignment)
	result2 := mtbdd.Evaluate(root2, assignment)
	result3 := mtbdd.Evaluate(root3, assignment)

	// Verify results are correct
	if result1 != false { // true AND false = false
		t.Error("Root1 evaluation incorrect after GC")
	}
	if result2 != true { // false OR true = true
		t.Error("Root2 evaluation incorrect after GC")
	}
	// root3 = XOR(NOT(false), true) = XOR(true, true) = false
	if result3 != false {
		t.Error("Root3 evaluation incorrect after GC")
	}
}

// TestGarbageCollectEmptyRoots tests GC with empty root list
func TestGarbageCollectEmptyRoots(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables and create nodes
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	mtbdd.AND(x, y)

	initialStats := mtbdd.GetMemoryStats()

	// GC with no roots - should remove everything except basic terminals
	mtbdd.GarbageCollect([]NodeRef{})

	afterStats := mtbdd.GetMemoryStats()

	// Should have fewer nodes (at minimum, keep true/false terminals)
	if afterStats.TotalNodes >= initialStats.TotalNodes {
		t.Error("Expected fewer nodes after GC with empty roots")
	}

	// Should still be able to create new nodes
	newNode := mtbdd.OR(x, y)
	if newNode == 0 {
		t.Error("Should be able to create new nodes after GC")
	}
}

// TestGetMemoryStats tests memory statistics reporting with new cache fields
func TestGetMemoryStats(t *testing.T) {
	mtbdd := NewMTBDD()

	// Get initial stats
	stats := mtbdd.GetMemoryStats()

	// Should have basic structure
	if stats.TotalNodes < 2 {
		t.Error("Expected at least true/false terminal nodes")
	}

	if stats.TerminalNodes < 2 {
		t.Error("Expected at least 2 terminal nodes (true/false)")
	}

	if stats.DecisionNodes != stats.TotalNodes-stats.TerminalNodes {
		t.Error("Decision nodes should equal total minus terminal nodes")
	}

	// Initially all cache sizes should be 0
	if stats.BinaryCacheSize != 0 {
		t.Error("Expected binary cache size 0 initially")
	}
	if stats.UnaryCacheSize != 0 {
		t.Error("Expected unary cache size 0 initially")
	}
	if stats.TernaryCacheSize != 0 {
		t.Error("Expected ternary cache size 0 initially")
	}
	if stats.QuantCacheSize != 0 {
		t.Error("Expected quantify cache size 0 initially")
	}
	if stats.ComposeCacheSize != 0 {
		t.Error("Expected compose cache size 0 initially")
	}

	// Add some nodes and verify stats update
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

	newStats := mtbdd.GetMemoryStats()

	if newStats.TotalNodes <= stats.TotalNodes {
		t.Error("Expected more nodes after creating variables and operations")
	}

	if newStats.BinaryCacheSize == 0 {
		t.Error("Expected binary cache entries after AND operation")
	}

	if newStats.UnaryCacheSize == 0 {
		t.Error("Expected unary cache entries after NOT operation")
	}

	if newStats.TernaryCacheSize == 0 {
		t.Error("Expected ternary cache entries after ITE operation")
	}

	// Verify total cache size calculation
	expectedTotal := newStats.BinaryCacheSize + newStats.UnaryCacheSize +
		newStats.TernaryCacheSize + newStats.QuantCacheSize + newStats.ComposeCacheSize
	if newStats.CacheSize != expectedTotal {
		t.Errorf("Total cache size %d should equal sum of individual caches %d",
			newStats.CacheSize, expectedTotal)
	}
}

// TestPrintStats tests statistics printing
func TestPrintStats(t *testing.T) {
	mtbdd := NewMTBDD()

	// This is mainly to ensure PrintStats doesn't crash
	// In a real implementation, you might capture stdout to verify output
	mtbdd.PrintStats()

	// Add some complexity and print again
	mtbdd.Declare("a", "b", "c")
	a, _ := mtbdd.Var("a")
	b, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")

	mtbdd.AND(a, b)
	mtbdd.OR(b, c)
	mtbdd.NOT(a)

	mtbdd.PrintStats()

	// Test passes if no panic occurs
}

// TestDump tests the detailed string representation with new cache format
func TestDump(t *testing.T) {
	mtbdd := NewMTBDD()

	// Get dump of empty MTBDD
	dump1 := mtbdd.Dump()
	if dump1 == "" {
		t.Error("Dump should return non-empty string")
	}

	// Should contain optimized structure indication
	if !strings.Contains(dump1, "Optimized") {
		t.Error("Dump should indicate optimized structure")
	}

	// Add some structure
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	result := mtbdd.AND(x, y)

	dump2 := mtbdd.Dump()

	// Dump should be longer with more content
	if len(dump2) <= len(dump1) {
		t.Error("Dump should be longer after adding nodes")
	}

	// Should contain detailed cache information
	if !strings.Contains(dump2, "binary") {
		t.Error("Dump should contain binary cache information")
	}

	if !strings.Contains(dump2, "Cache:") {
		t.Error("Dump should contain cache section with detailed breakdown")
	}

	// Should contain variable names
	if !strings.Contains(dump2, "x") || !strings.Contains(dump2, "y") {
		t.Error("Dump should contain declared variable names")
	}

	// Should show individual cache types
	if !strings.Contains(dump2, "entries") {
		t.Error("Dump should show cache entry counts")
	}

	// Use the result to avoid unused variable warning
	_ = result
}

// TestMemoryStatsAfterOperations tests that stats accurately reflect various operations
func TestMemoryStatsAfterOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	baseStats := mtbdd.GetMemoryStats()

	// Declare variables
	num1 := mtbdd.Constant(10)
	num2 := mtbdd.Constant(5)

	mtbdd.Add(num1, num2)      // → Binary cache
	mtbdd.Multiply(num1, num2) // → Binary cache
	mtbdd.Negate(num1)         // → Unary cache

	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	afterVarStats := mtbdd.GetMemoryStats()

	// Should have more decision nodes for variables
	if afterVarStats.DecisionNodes <= baseStats.DecisionNodes {
		t.Error("Expected more decision nodes after adding variables")
	}

	// Perform various operations to populate different cache types
	mtbdd.AND(x, y)          // → Ternary cache (ITE(x, y, false))
	mtbdd.OR(x, y)           // → Ternary cache (ITE(x, true, y))
	mtbdd.NOT(x)             // → Ternary cache (ITE(x, false, true))
	mtbdd.ITE(x, y, TrueRef) // → Ternary cache

	finalStats := mtbdd.GetMemoryStats()

	// Should have cache entries in multiple types
	if finalStats.BinaryCacheSize == 0 {
		t.Error("Expected binary cache entries after AND/OR operations")
	}

	if finalStats.UnaryCacheSize == 0 {
		t.Error("Expected unary cache entries after NOT operation")
	}

	if finalStats.TernaryCacheSize == 0 {
		t.Error("Expected ternary cache entries after ITE operation")
	}

	// Should have more nodes
	if finalStats.TotalNodes <= afterVarStats.TotalNodes {
		t.Error("Expected more total nodes after complex operations")
	}

	// Verify cache size calculation consistency
	totalCacheSize := finalStats.BinaryCacheSize + finalStats.UnaryCacheSize +
		finalStats.TernaryCacheSize + finalStats.QuantCacheSize + finalStats.ComposeCacheSize
	if finalStats.CacheSize != totalCacheSize {
		t.Errorf("Total cache size %d != sum of individual caches %d",
			finalStats.CacheSize, totalCacheSize)
	}
}

// TestConcurrentMemoryOperations tests thread safety of memory operations
func TestConcurrentMemoryOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables
	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Create some nodes to work with
	root1 := mtbdd.AND(x, y)
	root2 := mtbdd.OR(y, z)

	// Test concurrent access to memory stats
	done := make(chan bool, 10)

	// Multiple goroutines accessing stats
	for i := 0; i < 5; i++ {
		go func() {
			defer func() { done <- true }()
			for j := 0; j < 10; j++ {
				stats := mtbdd.GetMemoryStats()
				if stats.TotalNodes == 0 {
					t.Error("Stats should show some nodes")
					return
				}

				// Verify cache consistency
				totalCache := stats.BinaryCacheSize + stats.UnaryCacheSize +
					stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
				if stats.CacheSize != totalCache {
					t.Error("Cache size calculation inconsistent during concurrent access")
					return
				}
			}
		}()
	}

	// Multiple goroutines performing operations
	for i := 0; i < 5; i++ {
		go func() {
			defer func() { done <- true }()
			for j := 0; j < 5; j++ {
				mtbdd.XOR(root1, root2)
				mtbdd.ClearCaches() // This should be thread-safe
			}
		}()
	}

	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}

	// Should still be in valid state
	finalStats := mtbdd.GetMemoryStats()
	if finalStats.TotalNodes == 0 {
		t.Error("Should have nodes after concurrent operations")
	}
}

// TestCacheEfficiency tests the new cache efficiency metrics
func TestCacheEfficiency(t *testing.T) {
	mtbdd := NewMTBDD()

	// Create some operations to populate caches
	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	mtbdd.AND(x, y)
	mtbdd.OR(y, z)
	mtbdd.NOT(x)
	mtbdd.ITE(x, y, z)

	efficiency := mtbdd.GetCacheEfficiency()

	// Should have efficiency metrics
	if _, exists := efficiency["cache_to_nodes_ratio"]; !exists {
		t.Error("Should have cache_to_nodes_ratio metric")
	}

	if _, exists := efficiency["binary_cache_density"]; !exists {
		t.Error("Should have binary_cache_density metric")
	}

	if _, exists := efficiency["unary_cache_density"]; !exists {
		t.Error("Should have unary_cache_density metric")
	}

	if _, exists := efficiency["ternary_cache_density"]; !exists {
		t.Error("Should have ternary_cache_density metric")
	}
}

// Benchmark tests for memory operations
func BenchmarkClearCaches(b *testing.B) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")

	// Create operations to populate cache
	mtbdd.AND(x, y)
	mtbdd.OR(y, z)
	mtbdd.XOR(x, z)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.ClearCaches()
		// Rebuild some cache entries for next iteration
		if i < b.N-1 {
			mtbdd.AND(x, y)
		}
	}
}

func BenchmarkGetMemoryStats(b *testing.B) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("a", "b", "c", "d")
	a, _ := mtbdd.Var("a")
	b_var, _ := mtbdd.Var("b")
	c, _ := mtbdd.Var("c")
	d, _ := mtbdd.Var("d")

	// Create a moderately complex MTBDD
	complexOp := mtbdd.AND(mtbdd.OR(a, b_var), mtbdd.XOR(c, d))
	_ = complexOp

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.GetMemoryStats()
	}
}

func BenchmarkGarbageCollect(b *testing.B) {
	mtbdd := NewMTBDD()
	mtbdd.Declare("x", "y", "z", "w")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")
	z, _ := mtbdd.Var("z")
	w, _ := mtbdd.Var("w")

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		// Create nodes
		root := mtbdd.AND(mtbdd.OR(x, y), mtbdd.XOR(z, w))

		// Create some garbage
		mtbdd.IMPLIES(x, z)
		mtbdd.EQUIV(y, w)

		// GC with only root preserved
		mtbdd.GarbageCollect([]NodeRef{root})
	}
}

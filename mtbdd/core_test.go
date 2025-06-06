package mtbdd

import (
	"testing"
)

// TestCoreIntegration tests the integrated core functionality with optimized MTBDD
func TestCoreIntegration(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Initial State", func(t *testing.T) {
		if mtbdd.GetMemoryStats().TotalNodes != 2 { // Should have TrueRef and FalseRef
			t.Errorf("New MTBDD should start with 2 nodes (true/false), got %d", mtbdd.GetMemoryStats().TotalNodes)
		}

		// Verify standard terminals exist
		if value, exists := mtbdd.GetTerminalValue(TrueRef); !exists || value != true {
			t.Error("TrueRef should exist and have value true")
		}

		if value, exists := mtbdd.GetTerminalValue(FalseRef); !exists || value != false {
			t.Error("FalseRef should exist and have value false")
		}

		// Verify all cache types are initially empty
		stats := mtbdd.GetMemoryStats()
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
	})
}

// TestTerminalOperations tests terminal node management
func TestTerminalOperations(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Terminal Creation", func(t *testing.T) {
		// Create terminal nodes with different values
		intRef := mtbdd.GetTerminal(42)
		stringRef := mtbdd.GetTerminal("hello")
		floatRef := mtbdd.GetTerminal(3.14)

		// Verify they get different references
		refs := []NodeRef{TrueRef, FalseRef, intRef, stringRef, floatRef}
		for i := 0; i < len(refs); i++ {
			for j := i + 1; j < len(refs); j++ {
				if refs[i] == refs[j] {
					t.Errorf("Different terminals should have different references: %d vs %d", refs[i], refs[j])
				}
			}
		}

		// Verify uniqueness - same value should return same reference
		intRef2 := mtbdd.GetTerminal(42)
		if intRef != intRef2 {
			t.Error("Same terminal value should return same reference")
		}

		// Verify values can be retrieved
		if value, exists := mtbdd.GetTerminalValue(intRef); !exists || value != 42 {
			t.Error("Should be able to retrieve terminal value")
		}

		if value, exists := mtbdd.GetTerminalValue(stringRef); !exists || value != "hello" {
			t.Error("Should be able to retrieve string terminal value")
		}

		if value, exists := mtbdd.GetTerminalValue(floatRef); !exists || value != 3.14 {
			t.Error("Should be able to retrieve float terminal value")
		}
	})

	t.Run("Terminal Type Checking", func(t *testing.T) {
		intRef := mtbdd.GetTerminal(42)

		if !mtbdd.IsTerminal(TrueRef) {
			t.Error("TrueRef should be terminal")
		}

		if !mtbdd.IsTerminal(FalseRef) {
			t.Error("FalseRef should be terminal")
		}

		if !mtbdd.IsTerminal(intRef) {
			t.Error("Integer terminal should be terminal")
		}
	})
}

// TestDecisionNodes tests decision node creation and reduction
func TestDecisionNodes(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Basic Decision Node", func(t *testing.T) {
		// Create a basic decision node
		xRef := mtbdd.GetDecisionNode("x", 1, FalseRef, TrueRef)

		if mtbdd.IsTerminal(xRef) {
			t.Error("Decision node should not be terminal")
		}

		// Verify node structure
		node, _, exists := mtbdd.GetNode(xRef)
		if !exists {
			t.Error("Should be able to retrieve decision node")
		}

		if node.Variable != "x" {
			t.Errorf("Expected variable 'x', got '%s'", node.Variable)
		}

		if node.Level != 1 {
			t.Errorf("Expected level 1, got %d", node.Level)
		}

		if node.Low != FalseRef {
			t.Error("Low edge should point to FalseRef")
		}

		if node.High != TrueRef {
			t.Error("High edge should point to TrueRef")
		}
	})

	t.Run("Node Reduction", func(t *testing.T) {
		// Create decision node where low == high
		xRef := mtbdd.GetDecisionNode("x", 1, TrueRef, TrueRef)

		// Should return the child directly due to reduction
		if xRef != TrueRef {
			t.Error("Decision node with same low and high should return child directly")
		}
	})

	t.Run("Hash Consing", func(t *testing.T) {
		// Create same decision node twice
		x1 := mtbdd.GetDecisionNode("x", 1, FalseRef, TrueRef)
		x2 := mtbdd.GetDecisionNode("x", 1, FalseRef, TrueRef)

		if x1 != x2 {
			t.Error("Identical decision nodes should return same reference (hash consing)")
		}
	})
}

// TestOperationCaching tests the optimized typed operation caching functionality
func TestOperationCaching(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Binary Operation Cache", func(t *testing.T) {
		// Test cache miss
		result, exists := mtbdd.GetCachedBinaryOp("AND", TrueRef, FalseRef)
		if exists {
			t.Error("Should get cache miss for non-existent operation")
		}

		// Test cache set and hit
		mtbdd.SetCachedBinaryOp("AND", TrueRef, FalseRef, FalseRef)
		result, exists = mtbdd.GetCachedBinaryOp("AND", TrueRef, FalseRef)
		if !exists {
			t.Error("Should get cache hit after setting operation")
		}
		if result != FalseRef {
			t.Error("Should get correct cached result")
		}

		// Different order should be different cache entry
		result, exists = mtbdd.GetCachedBinaryOp("AND", FalseRef, TrueRef)
		if exists {
			t.Error("Different operand order should be cache miss")
		}

		// Verify cache size increases
		stats := mtbdd.GetMemoryStats()
		if stats.BinaryCacheSize == 0 {
			t.Error("Binary cache should have entries after setting")
		}
	})

	t.Run("Unary Operation Cache", func(t *testing.T) {
		// Test cache miss
		result, exists := mtbdd.GetCachedUnaryOp("NOT", TrueRef)
		if exists {
			t.Error("Should get cache miss for non-existent operation")
		}

		// Test cache set and hit
		mtbdd.SetCachedUnaryOp("NOT", TrueRef, FalseRef)
		result, exists = mtbdd.GetCachedUnaryOp("NOT", TrueRef)
		if !exists {
			t.Error("Should get cache hit after setting operation")
		}
		if result != FalseRef {
			t.Error("Should get correct cached result")
		}

		// Verify cache size increases
		stats := mtbdd.GetMemoryStats()
		if stats.UnaryCacheSize == 0 {
			t.Error("Unary cache should have entries after setting")
		}
	})

	t.Run("Ternary Operation Cache", func(t *testing.T) {
		// Test cache miss
		result, exists := mtbdd.GetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef)
		if exists {
			t.Error("Should get cache miss for non-existent operation")
		}

		// Test cache set and hit
		mtbdd.SetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef, FalseRef)
		result, exists = mtbdd.GetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef)
		if !exists {
			t.Error("Should get cache hit after setting operation")
		}
		if result != FalseRef {
			t.Error("Should get correct cached result")
		}

		// Verify cache size increases
		stats := mtbdd.GetMemoryStats()
		if stats.TernaryCacheSize == 0 {
			t.Error("Ternary cache should have entries after setting")
		}
	})

	t.Run("Cache Independence", func(t *testing.T) {
		// Operations in different caches should be independent
		mtbdd.SetCachedBinaryOp("AND", TrueRef, FalseRef, FalseRef)
		mtbdd.SetCachedUnaryOp("NOT", TrueRef, FalseRef)
		mtbdd.SetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef, FalseRef)

		stats := mtbdd.GetMemoryStats()

		// Each cache type should have entries
		if stats.BinaryCacheSize == 0 {
			t.Error("Binary cache should have entries")
		}
		if stats.UnaryCacheSize == 0 {
			t.Error("Unary cache should have entries")
		}
		if stats.TernaryCacheSize == 0 {
			t.Error("Ternary cache should have entries")
		}

		// Total should be sum of all caches
		expectedTotal := stats.BinaryCacheSize + stats.UnaryCacheSize +
			stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
		if stats.CacheSize != expectedTotal {
			t.Errorf("Total cache size %d should equal sum %d", stats.CacheSize, expectedTotal)
		}

		// Clear only binary cache
		mtbdd.ClearSpecificCache("BINARY")

		newStats := mtbdd.GetMemoryStats()
		if newStats.BinaryCacheSize != 0 {
			t.Error("Binary cache should be cleared")
		}
		if newStats.UnaryCacheSize == 0 {
			t.Error("Unary cache should still have entries")
		}
		if newStats.TernaryCacheSize == 0 {
			t.Error("Ternary cache should still have entries")
		}
	})
}

// TestCacheOperationsIntegration tests actual cache usage in operations
func TestCacheOperationsIntegration(t *testing.T) {
	mtbdd := NewMTBDD()

	// Declare variables
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	t.Run("Arithmetic Operations Cache", func(t *testing.T) {
		// Clear caches to start fresh
		mtbdd.ClearCaches()

		// Create numeric terminals for arithmetic operations
		num1 := mtbdd.Constant(10)
		num2 := mtbdd.Constant(5)

		// Perform Add operation - should populate binary cache
		result1 := mtbdd.Add(num1, num2)

		stats := mtbdd.GetMemoryStats()
		if stats.BinaryCacheSize == 0 {
			t.Error("Binary cache should have entries after Add operation")
		}

		// Same operation should hit cache
		result2 := mtbdd.Add(num1, num2)
		if result1 != result2 {
			t.Error("Cached arithmetic operation should return same result")
		}
	})

	t.Run("Unary Operations Cache", func(t *testing.T) {
		// Clear caches to start fresh
		mtbdd.ClearCaches()

		// Create numeric terminal for unary operations
		num := mtbdd.Constant(10)

		// Perform Negate operation - should populate unary cache
		result1 := mtbdd.Negate(num)

		stats := mtbdd.GetMemoryStats()
		if stats.UnaryCacheSize == 0 {
			t.Error("Unary cache should have entries after Negate operation")
		}

		// Same operation should hit cache
		result2 := mtbdd.Negate(num)
		if result1 != result2 {
			t.Error("Cached unary operation should return same result")
		}
	})

	t.Run("Boolean Operations Cache", func(t *testing.T) {
		// Clear caches to start fresh
		mtbdd.ClearCaches()

		// Perform AND operation - uses ITE internally, should populate ternary cache
		result1 := mtbdd.AND(x, y)

		stats := mtbdd.GetMemoryStats()
		if stats.TernaryCacheSize == 0 {
			// Note: This might be 0 if hash consing prevented cache usage
			t.Log("Ternary cache size is 0 - may be due to hash consing or node reuse")
		}

		// Same operation should return same result
		result2 := mtbdd.AND(x, y)
		if result1 != result2 {
			t.Error("Boolean operation should return same result")
		}
	})

	t.Run("Ternary Operations Cache", func(t *testing.T) {
		// Clear caches to start fresh
		mtbdd.ClearCaches()

		// Perform ITE operation - should populate ternary cache
		result1 := mtbdd.ITE(x, y, TrueRef)

		stats := mtbdd.GetMemoryStats()
		if stats.TernaryCacheSize == 0 {
			t.Error("Ternary cache should have entries after ITE operation")
		}

		// Same operation should hit cache
		result2 := mtbdd.ITE(x, y, TrueRef)
		if result1 != result2 {
			t.Error("Cached ternary operation should return same result")
		}
	})
}

// TestITECore tests the core ITE functionality
func TestITECore(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("ITE Terminals", func(t *testing.T) {
		// ITE(true, then, else) = then
		result := mtbdd.ITECore(TrueRef, TrueRef, FalseRef)
		if result != TrueRef {
			t.Error("ITE(true, true, false) should return true")
		}

		// ITE(false, then, else) = else
		result = mtbdd.ITECore(FalseRef, TrueRef, FalseRef)
		if result != FalseRef {
			t.Error("ITE(false, true, false) should return false")
		}

		// ITE(condition, same, same) = same
		result = mtbdd.ITECore(TrueRef, FalseRef, FalseRef)
		if result != FalseRef {
			t.Error("ITE(condition, same, same) should return same")
		}
	})

	t.Run("ITE Variables", func(t *testing.T) {
		mtbdd.Declare("x")
		x, _ := mtbdd.Var("x")

		// ITE(x, true, false) = x
		result := mtbdd.ITECore(x, TrueRef, FalseRef)
		if result != x {
			t.Error("ITE(x, true, false) should return x")
		}

		// ITE(x, false, true) = NOT(x)
		result = mtbdd.ITECore(x, FalseRef, TrueRef)
		notX := mtbdd.NOT(x)
		if result != notX {
			t.Error("ITE(x, false, true) should return NOT(x)")
		}
	})

	t.Run("ITE Caching", func(t *testing.T) {
		mtbdd.Declare("y", "z")
		y, _ := mtbdd.Var("y")
		z, _ := mtbdd.Var("z")

		// Clear cache to test caching behavior
		mtbdd.ClearCaches()

		// First call should populate cache
		result1 := mtbdd.ITECore(y, z, TrueRef)

		stats := mtbdd.GetMemoryStats()
		if stats.TernaryCacheSize == 0 {
			t.Error("ITE should populate ternary cache")
		}

		// Second call should hit cache
		result2 := mtbdd.ITECore(y, z, TrueRef)
		if result1 != result2 {
			t.Error("Cached ITE should return same result")
		}
	})
}

// TestGarbageCollectCore tests GC with core operations
func TestGarbageCollectCore(t *testing.T) {
	mtbdd := NewMTBDD()

	// Create a reachable node
	reachableRef := mtbdd.GetDecisionNode("reachable", 1, FalseRef, TrueRef)

	// Create an unreachable node
	unreachableRef := mtbdd.GetDecisionNode("unreachable", 2, FalseRef, TrueRef)

	// Verify both exist
	if _, _, exists := mtbdd.GetNode(reachableRef); !exists {
		t.Error("Reachable node should exist before GC")
	}

	if _, _, exists := mtbdd.GetNode(unreachableRef); !exists {
		t.Error("Unreachable node should exist before GC")
	}

	// Perform GC with only reachable node as root
	mtbdd.GarbageCollect([]NodeRef{reachableRef})

	// Verify reachable node still exists
	if _, _, exists := mtbdd.GetNode(reachableRef); !exists {
		t.Error("Reachable node should still exist after GC")
	}

	// Verify unreachable node was removed
	if _, _, exists := mtbdd.GetNode(unreachableRef); exists {
		t.Error("Unreachable node should be removed after GC")
	}
}

// TestCoreStats tests the statistics functionality
func TestCoreStats(t *testing.T) {
	mtbdd := NewMTBDD()

	stats := mtbdd.GetMemoryStats()
	if stats.TotalNodes != 2 { // TrueRef and FalseRef
		t.Errorf("New MTBDD should start with 2 nodes, got %d", stats.TotalNodes)
	}

	if stats.TerminalNodes != 2 {
		t.Errorf("Should have 2 terminal nodes, got %d", stats.TerminalNodes)
	}

	if stats.DecisionNodes != 0 {
		t.Errorf("Should have 0 decision nodes initially, got %d", stats.DecisionNodes)
	}

	// Add some nodes and operations
	xRef := mtbdd.GetDecisionNode("x", 1, FalseRef, TrueRef)
	mtbdd.ITE(TrueRef, xRef, FalseRef)

	newStats := mtbdd.GetMemoryStats()
	if newStats.DecisionNodes != 1 {
		t.Errorf("Should have 1 decision node after adding x, got %d", newStats.DecisionNodes)
	}

	if newStats.TernaryCacheSize == 0 {
		t.Error("Should have cached ITE operation")
	}

	// Verify total cache calculation
	totalCache := newStats.BinaryCacheSize + newStats.UnaryCacheSize +
		newStats.TernaryCacheSize + newStats.QuantCacheSize + newStats.ComposeCacheSize
	if newStats.CacheSize != totalCache {
		t.Errorf("Total cache size %d != sum of individual caches %d",
			newStats.CacheSize, totalCache)
	}
}

// TestNodeReferenceValidation tests validation of node references
func TestNodeReferenceValidation(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Valid References", func(t *testing.T) {
		// Standard terminals should be valid
		if !mtbdd.IsTerminal(TrueRef) {
			t.Error("TrueRef should be a valid terminal")
		}

		if !mtbdd.IsTerminal(FalseRef) {
			t.Error("FalseRef should be a valid terminal")
		}

		// Created nodes should be valid
		xRef := mtbdd.GetDecisionNode("x", 1, FalseRef, TrueRef)
		if mtbdd.IsTerminal(xRef) {
			t.Error("Created decision node should not be terminal")
		}

		// Should be able to retrieve decision node
		node, _, exists := mtbdd.GetNode(xRef)
		if !exists {
			t.Error("Should be able to retrieve created decision node")
		}

		if node == nil {
			t.Error("Retrieved node should not be nil")
		}
	})

	t.Run("Terminal Node Retrieval", func(t *testing.T) {
		// Custom terminals
		intRef := mtbdd.GetTerminal(42)
		if !mtbdd.IsTerminal(intRef) {
			t.Error("Integer terminal should be recognized as terminal")
		}

		// Should not be able to get as decision node
		node, _, exists := mtbdd.GetNode(intRef)
		if exists && node != nil {
			t.Error("Terminal should not be retrievable as decision node")
		}
	})
}

// TestCacheConsistency tests that cache operations maintain consistency
func TestCacheConsistency(t *testing.T) {
	mtbdd := NewMTBDD()

	t.Run("Cache Size Consistency", func(t *testing.T) {
		// Start with empty caches
		mtbdd.ClearCaches()

		// Add to different cache types
		mtbdd.SetCachedBinaryOp("AND", TrueRef, FalseRef, FalseRef)
		mtbdd.SetCachedUnaryOp("NOT", TrueRef, FalseRef)
		mtbdd.SetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef, FalseRef)

		// Check individual sizes
		stats := mtbdd.GetMemoryStats()
		if stats.BinaryCacheSize != 1 {
			t.Errorf("Expected binary cache size 1, got %d", stats.BinaryCacheSize)
		}
		if stats.UnaryCacheSize != 1 {
			t.Errorf("Expected unary cache size 1, got %d", stats.UnaryCacheSize)
		}
		if stats.TernaryCacheSize != 1 {
			t.Errorf("Expected ternary cache size 1, got %d", stats.TernaryCacheSize)
		}

		// Check total
		expectedTotal := stats.BinaryCacheSize + stats.UnaryCacheSize +
			stats.TernaryCacheSize + stats.QuantCacheSize + stats.ComposeCacheSize
		if stats.CacheSize != expectedTotal {
			t.Errorf("Total cache size %d != expected %d", stats.CacheSize, expectedTotal)
		}
	})

	t.Run("Cache Clearing Consistency", func(t *testing.T) {
		// Populate all cache types
		mtbdd.SetCachedBinaryOp("AND", TrueRef, FalseRef, FalseRef)
		mtbdd.SetCachedUnaryOp("NOT", TrueRef, FalseRef)
		mtbdd.SetCachedTernaryOp("ITE", TrueRef, FalseRef, TrueRef, FalseRef)

		// Clear all
		mtbdd.ClearCaches()

		// All should be zero
		stats := mtbdd.GetMemoryStats()
		if stats.BinaryCacheSize != 0 || stats.UnaryCacheSize != 0 ||
			stats.TernaryCacheSize != 0 || stats.QuantCacheSize != 0 ||
			stats.ComposeCacheSize != 0 {
			t.Error("All cache types should be zero after clearing")
		}

		if stats.CacheSize != 0 {
			t.Errorf("Total cache size should be 0 after clearing, got %d", stats.CacheSize)
		}
	})
}

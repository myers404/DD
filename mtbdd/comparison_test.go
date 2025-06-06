package mtbdd

import (
	"testing"
)

// TestEqual tests the equality comparison operation
func TestEqual(t *testing.T) {
	mtbdd := NewUDD()

	// Test constants - equal values
	node1 := mtbdd.Constant(5)
	node2 := mtbdd.Constant(5)
	result := mtbdd.Equal(node1, node2)

	// Should return boolean true terminal
	value, isTerminal := mtbdd.GetTerminalValue(result)
	if !isTerminal {
		t.Error("Expected terminal node for equal constants")
	}
	if value != true {
		t.Errorf("Expected true for 5 == 5, got %v", value)
	}

	// Test constants - unequal values
	node3 := mtbdd.Constant(3)
	node4 := mtbdd.Constant(7)
	result2 := mtbdd.Equal(node3, node4)

	value2, isTerminal2 := mtbdd.GetTerminalValue(result2)
	if !isTerminal2 {
		t.Error("Expected terminal node for unequal constants")
	}
	if value2 != false {
		t.Errorf("Expected false for 3 == 7, got %v", value2)
	}

	// Test type promotion: int == float
	intNode := mtbdd.Constant(5)
	floatNode := mtbdd.Constant(5.0)
	result3 := mtbdd.Equal(intNode, floatNode)

	value3, isTerminal3 := mtbdd.GetTerminalValue(result3)
	if !isTerminal3 {
		t.Error("Expected terminal node for type-promoted equality")
	}
	if value3 != true {
		t.Errorf("Expected true for 5 == 5.0, got %v", value3)
	}

	// Test with variables
	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")
	node5 := mtbdd.Constant(5)
	node10 := mtbdd.Constant(10)
	conditional := mtbdd.ITE(x, node5, node10) // if x then 5 else 10
	target := mtbdd.Constant(5)
	equal := mtbdd.Equal(conditional, target) // if x then true else false

	// Test evaluation with x=true
	result4 := mtbdd.Evaluate(equal, map[string]bool{"x": true})
	if result4 != true {
		t.Errorf("Expected true when x=true, got %v", result4)
	}

	// Test evaluation with x=false
	result5 := mtbdd.Evaluate(equal, map[string]bool{"x": false})
	if result5 != false {
		t.Errorf("Expected false when x=false, got %v", result5)
	}

	// Test boolean equality
	trueNode := mtbdd.Constant(true)
	falseNode := mtbdd.Constant(false)
	trueEqual := mtbdd.Equal(trueNode, trueNode)
	falseEqual := mtbdd.Equal(trueNode, falseNode)

	value6, _ := mtbdd.GetTerminalValue(trueEqual)
	value7, _ := mtbdd.GetTerminalValue(falseEqual)

	if value6 != true {
		t.Errorf("Expected true for true == true, got %v", value6)
	}
	if value7 != false {
		t.Errorf("Expected false for true == false, got %v", value7)
	}

	// Test string equality
	str1 := mtbdd.Constant("hello")
	str2 := mtbdd.Constant("hello")
	str3 := mtbdd.Constant("world")

	strEqual1 := mtbdd.Equal(str1, str2)
	strEqual2 := mtbdd.Equal(str1, str3)

	value8, _ := mtbdd.GetTerminalValue(strEqual1)
	value9, _ := mtbdd.GetTerminalValue(strEqual2)

	if value8 != true {
		t.Errorf("Expected true for \"hello\" == \"hello\", got %v", value8)
	}
	if value9 != false {
		t.Errorf("Expected false for \"hello\" == \"world\", got %v", value9)
	}
}

// TestLessThan tests the less-than comparison operation
func TestLessThan(t *testing.T) {
	mtbdd := NewUDD()

	// Test constants - true case
	node1 := mtbdd.Constant(3)
	node2 := mtbdd.Constant(5)
	result := mtbdd.LessThan(node1, node2)

	value, isTerminal := mtbdd.GetTerminalValue(result)
	if !isTerminal {
		t.Error("Expected terminal node for less than constants")
	}
	if value != true {
		t.Errorf("Expected true for 3 < 5, got %v", value)
	}

	// Test constants - false case
	node3 := mtbdd.Constant(7)
	node4 := mtbdd.Constant(3)
	result2 := mtbdd.LessThan(node3, node4)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != false {
		t.Errorf("Expected false for 7 < 3, got %v", value2)
	}

	// Test equal values - should be false
	node5 := mtbdd.Constant(5)
	node6 := mtbdd.Constant(5)
	result3 := mtbdd.LessThan(node5, node6)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != false {
		t.Errorf("Expected false for 5 < 5, got %v", value3)
	}

	// Test with floats
	float1 := mtbdd.Constant(3.5)
	float2 := mtbdd.Constant(7.2)
	result4 := mtbdd.LessThan(float1, float2)

	value4, _ := mtbdd.GetTerminalValue(result4)
	if value4 != true {
		t.Errorf("Expected true for 3.5 < 7.2, got %v", value4)
	}

	// Test mixed types
	intNode := mtbdd.Constant(3)
	floatNode := mtbdd.Constant(5.5)
	result5 := mtbdd.LessThan(intNode, floatNode)

	value5, _ := mtbdd.GetTerminalValue(result5)
	if value5 != true {
		t.Errorf("Expected true for 3 < 5.5, got %v", value5)
	}

	// Test with conditional values
	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")
	node2_const := mtbdd.Constant(2)
	node8 := mtbdd.Constant(8)
	conditional := mtbdd.ITE(x, node2_const, node8) // if x then 2 else 8
	node5_const := mtbdd.Constant(5)
	lessThan := mtbdd.LessThan(conditional, node5_const) // if x then true else false

	// Test evaluation
	result6 := mtbdd.Evaluate(lessThan, map[string]bool{"x": true})
	if result6 != true {
		t.Errorf("Expected true when x=true (2 < 5), got %v", result6)
	}

	result7 := mtbdd.Evaluate(lessThan, map[string]bool{"x": false})
	if result7 != false {
		t.Errorf("Expected false when x=false (8 < 5), got %v", result7)
	}

	// Test boolean comparison (false < true)
	falseNode := mtbdd.Constant(false)
	trueNode := mtbdd.Constant(true)
	result8 := mtbdd.LessThan(falseNode, trueNode)

	value8, _ := mtbdd.GetTerminalValue(result8)
	if value8 != true {
		t.Errorf("Expected true for false < true, got %v", value8)
	}
}

// TestLessThanOrEqual tests the less-than-or-equal comparison operation
func TestLessThanOrEqual(t *testing.T) {
	mtbdd := NewUDD()

	// Test less than case
	node1 := mtbdd.Constant(3)
	node2 := mtbdd.Constant(5)
	result := mtbdd.LessThanOrEqual(node1, node2)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for 3 <= 5, got %v", value)
	}

	// Test equal case
	node3 := mtbdd.Constant(5)
	node4 := mtbdd.Constant(5)
	result2 := mtbdd.LessThanOrEqual(node3, node4)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != true {
		t.Errorf("Expected true for 5 <= 5, got %v", value2)
	}

	// Test greater than case
	node5 := mtbdd.Constant(7)
	node6 := mtbdd.Constant(3)
	result3 := mtbdd.LessThanOrEqual(node5, node6)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != false {
		t.Errorf("Expected false for 7 <= 3, got %v", value3)
	}

	// Test with floats
	float1 := mtbdd.Constant(3.5)
	float2 := mtbdd.Constant(3.5)
	result4 := mtbdd.LessThanOrEqual(float1, float2)

	value4, _ := mtbdd.GetTerminalValue(result4)
	if value4 != true {
		t.Errorf("Expected true for 3.5 <= 3.5, got %v", value4)
	}
}

// TestGreaterThan tests the greater-than comparison operation
func TestGreaterThan(t *testing.T) {
	mtbdd := NewUDD()

	// Test constants - true case
	node1 := mtbdd.Constant(8)
	node2 := mtbdd.Constant(3)
	result := mtbdd.GreaterThan(node1, node2)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for 8 > 3, got %v", value)
	}

	// Test constants - false case
	node3 := mtbdd.Constant(2)
	node4 := mtbdd.Constant(7)
	result2 := mtbdd.GreaterThan(node3, node4)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != false {
		t.Errorf("Expected false for 2 > 7, got %v", value2)
	}

	// Test equal values - should be false
	node5 := mtbdd.Constant(5)
	node6 := mtbdd.Constant(5)
	result3 := mtbdd.GreaterThan(node5, node6)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != false {
		t.Errorf("Expected false for 5 > 5, got %v", value3)
	}
}

// TestGreaterThanOrEqual tests the greater-than-or-equal comparison operation
func TestGreaterThanOrEqual(t *testing.T) {
	mtbdd := NewUDD()

	// Test greater than case
	node1 := mtbdd.Constant(8)
	node2 := mtbdd.Constant(3)
	result := mtbdd.GreaterThanOrEqual(node1, node2)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for 8 >= 3, got %v", value)
	}

	// Test equal case
	node3 := mtbdd.Constant(5)
	node4 := mtbdd.Constant(5)
	result2 := mtbdd.GreaterThanOrEqual(node3, node4)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != true {
		t.Errorf("Expected true for 5 >= 5, got %v", value2)
	}

	// Test less than case
	node5 := mtbdd.Constant(2)
	node6 := mtbdd.Constant(7)
	result3 := mtbdd.GreaterThanOrEqual(node5, node6)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != false {
		t.Errorf("Expected false for 2 >= 7, got %v", value3)
	}
}

// TestThreshold tests the threshold comparison operation
func TestThreshold(t *testing.T) {
	mtbdd := NewUDD()

	// Test simple threshold - above
	node1 := mtbdd.Constant(5)
	result := mtbdd.Threshold(node1, 3)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for 5 >= 3, got %v", value)
	}

	// Test simple threshold - below
	node2 := mtbdd.Constant(2)
	result2 := mtbdd.Threshold(node2, 5)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != false {
		t.Errorf("Expected false for 2 >= 5, got %v", value2)
	}

	// Test simple threshold - equal
	node3 := mtbdd.Constant(5)
	result3 := mtbdd.Threshold(node3, 5)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != true {
		t.Errorf("Expected true for 5 >= 5, got %v", value3)
	}

	// Test with float threshold
	floatNode := mtbdd.Constant(5.5)
	result4 := mtbdd.Threshold(floatNode, 5)

	value4, _ := mtbdd.GetTerminalValue(result4)
	if value4 != true {
		t.Errorf("Expected true for 5.5 >= 5, got %v", value4)
	}

	// Test with conditional values
	mtbdd.Declare("x")
	x, _ := mtbdd.Var("x")
	node2_const := mtbdd.Constant(2)
	node8 := mtbdd.Constant(8)
	conditional := mtbdd.ITE(x, node2_const, node8) // if x then 2 else 8
	thresholded := mtbdd.Threshold(conditional, 5)  // if x then false else true

	// Test evaluation
	result5 := mtbdd.Evaluate(thresholded, map[string]bool{"x": true})
	if result5 != false {
		t.Errorf("Expected false when x=true (2 >= 5), got %v", result5)
	}

	result6 := mtbdd.Evaluate(thresholded, map[string]bool{"x": false})
	if result6 != true {
		t.Errorf("Expected true when x=false (8 >= 5), got %v", result6)
	}

	// Test type conversion with various numeric types
	int8Node := mtbdd.Constant(int8(10))
	result7 := mtbdd.Threshold(int8Node, 5)

	value7, _ := mtbdd.GetTerminalValue(result7)
	if value7 != true {
		t.Errorf("Expected true for int8(10) >= 5, got %v", value7)
	}

	// Test with float32
	float32Node := mtbdd.Constant(float32(3.5))
	result8 := mtbdd.Threshold(float32Node, 4.0)

	value8, _ := mtbdd.GetTerminalValue(result8)
	if value8 != false {
		t.Errorf("Expected false for float32(3.5) >= 4.0, got %v", value8)
	}
}

// TestComparisonWithIncomparableTypes tests behavior with non-numeric types
func TestComparisonWithIncomparableTypes(t *testing.T) {
	mtbdd := NewUDD()

	// Test comparing string with number (should be false)
	stringNode := mtbdd.Constant("hello")
	numberNode := mtbdd.Constant(5)
	result := mtbdd.LessThan(stringNode, numberNode)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != false {
		t.Errorf("Expected false for incomparable types, got %v", value)
	}

	// Test comparing nil values
	nilNode1 := mtbdd.Constant(nil)
	nilNode2 := mtbdd.Constant(nil)
	result2 := mtbdd.Equal(nilNode1, nilNode2)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != true {
		t.Errorf("Expected true for nil == nil, got %v", value2)
	}

	// Test threshold with non-numeric value
	result3 := mtbdd.Threshold(stringNode, 5)
	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != false {
		t.Errorf("Expected false for non-numeric threshold, got %v", value3)
	}
}

// TestComparisonCaching tests that comparison operations are properly cached
func TestComparisonCaching(t *testing.T) {
	mtbdd := NewUDD()

	node1 := mtbdd.Constant(5)
	node2 := mtbdd.Constant(3)

	// First call
	result1 := mtbdd.LessThan(node2, node1)

	// Second call - should be cached
	result2 := mtbdd.LessThan(node2, node1)

	// Should return the same node reference
	if result1 != result2 {
		t.Error("Expected cached result to return same node reference")
	}

	// Verify the result is correct
	value, _ := mtbdd.GetTerminalValue(result1)
	if value != true {
		t.Errorf("Expected true for 3 < 5, got %v", value)
	}
}

// TestComparisonEdgeCases tests edge cases and boundary conditions
func TestComparisonEdgeCases(t *testing.T) {
	mtbdd := NewUDD()

	// Test with zero values
	zero1 := mtbdd.Constant(0)
	zero2 := mtbdd.Constant(0.0)
	result := mtbdd.Equal(zero1, zero2)

	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for 0 == 0.0, got %v", value)
	}

	// Test with negative values
	neg1 := mtbdd.Constant(-5)
	neg2 := mtbdd.Constant(-3)
	result2 := mtbdd.LessThan(neg1, neg2)

	value2, _ := mtbdd.GetTerminalValue(result2)
	if value2 != true {
		t.Errorf("Expected true for -5 < -3, got %v", value2)
	}

	// Test with very small float differences
	float1 := mtbdd.Constant(1.0000001)
	float2 := mtbdd.Constant(1.0000002)
	result3 := mtbdd.LessThan(float1, float2)

	value3, _ := mtbdd.GetTerminalValue(result3)
	if value3 != true {
		t.Errorf("Expected true for small float difference, got %v", value3)
	}

	// Test with large numbers
	large1 := mtbdd.Constant(1000000)
	large2 := mtbdd.Constant(999999)
	result4 := mtbdd.GreaterThan(large1, large2)

	value4, _ := mtbdd.GetTerminalValue(result4)
	if value4 != true {
		t.Errorf("Expected true for large number comparison, got %v", value4)
	}
}

// TestStringComparison tests string comparison operations
func TestStringComparison(t *testing.T) {
	mtbdd := NewUDD()

	// Test string equality
	str1 := mtbdd.Constant("apple")
	str2 := mtbdd.Constant("apple")
	str3 := mtbdd.Constant("banana")

	equal1 := mtbdd.Equal(str1, str2)
	equal2 := mtbdd.Equal(str1, str3)

	value1, _ := mtbdd.GetTerminalValue(equal1)
	value2, _ := mtbdd.GetTerminalValue(equal2)

	if value1 != true {
		t.Errorf("Expected true for \"apple\" == \"apple\", got %v", value1)
	}
	if value2 != false {
		t.Errorf("Expected false for \"apple\" == \"banana\", got %v", value2)
	}

	// Test lexicographic string comparison
	result := mtbdd.LessThan(str1, str3) // "apple" < "banana"
	value, _ := mtbdd.GetTerminalValue(result)
	if value != true {
		t.Errorf("Expected true for \"apple\" < \"banana\", got %v", value)
	}
}

// BenchmarkEqual benchmarks the Equal operation performance
func BenchmarkEqual(b *testing.B) {
	mtbdd := NewUDD()
	node1 := mtbdd.Constant(5)
	node2 := mtbdd.Constant(5)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Equal(node1, node2)
	}
}

// BenchmarkLessThan benchmarks the LessThan operation performance
func BenchmarkLessThan(b *testing.B) {
	mtbdd := NewUDD()
	node1 := mtbdd.Constant(3)
	node2 := mtbdd.Constant(5)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.LessThan(node1, node2)
	}
}

// BenchmarkThreshold benchmarks the Threshold operation performance
func BenchmarkThreshold(b *testing.B) {
	mtbdd := NewUDD()
	node := mtbdd.Constant(5)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.Threshold(node, 3)
	}
}

// BenchmarkComparisonWithVariables benchmarks comparison with decision nodes
func BenchmarkComparisonWithVariables(b *testing.B) {
	mtbdd := NewUDD()
	mtbdd.Declare("x", "y")
	x, _ := mtbdd.Var("x")
	y, _ := mtbdd.Var("y")

	// Create a more complex MTBDD
	node1 := mtbdd.Constant(1)
	node2 := mtbdd.Constant(2)
	node3 := mtbdd.Constant(3)
	node4 := mtbdd.Constant(4)

	left := mtbdd.ITE(x, node1, node2)
	right := mtbdd.ITE(y, node3, node4)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		mtbdd.LessThan(left, right)
	}
}

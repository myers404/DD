package mtbdd

import (
	"math"
	"testing"
)

func TestAdd(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ConstantAddition", func(t *testing.T) {
		// Test integer addition
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(3)
		result := mtbdd.Add(node1, node2)

		// Verify result
		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 8 {
			t.Errorf("Expected 8, got %v", value)
		}
	})

	t.Run("FloatAddition", func(t *testing.T) {
		// Test float addition
		node1 := mtbdd.Constant(2.5)
		node2 := mtbdd.Constant(1.5)
		result := mtbdd.Add(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 4.0 {
			t.Errorf("Expected 4.0, got %v", value)
		}
	})

	t.Run("MixedTypeAddition", func(t *testing.T) {
		// Test int + float
		node1 := mtbdd.Constant(5)   // int
		node2 := mtbdd.Constant(2.5) // float64
		result := mtbdd.Add(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 7.5 {
			t.Errorf("Expected 7.5, got %v", value)
		}
	})

	t.Run("ZeroAddition", func(t *testing.T) {
		// Test addition with zero
		node1 := mtbdd.Constant(42)
		node2 := mtbdd.Constant(0)
		result := mtbdd.Add(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 42 {
			t.Errorf("Expected 42, got %v", value)
		}
	})

	t.Run("ConditionalAddition", func(t *testing.T) {
		// Test addition with decision nodes
		mtbdd.Declare("x")
		x, err := mtbdd.Var("x")
		if err != nil {
			t.Fatal(err)
		}

		node10 := mtbdd.Constant(10)
		node20 := mtbdd.Constant(20)
		conditional := mtbdd.ITE(x, node10, node20) // if x then 10 else 20

		node5 := mtbdd.Constant(5)
		result := mtbdd.Add(conditional, node5) // if x then 15 else 25

		// Test with x = true
		value := mtbdd.Evaluate(result, map[string]bool{"x": true})
		if value != 15 {
			t.Errorf("Expected 15 when x=true, got %v", value)
		}

		// Test with x = false
		value = mtbdd.Evaluate(result, map[string]bool{"x": false})
		if value != 25 {
			t.Errorf("Expected 25 when x=false, got %v", value)
		}
	})

	t.Run("BooleanAddition", func(t *testing.T) {
		// Test addition with boolean values (should convert to 0/1)
		nodeTrue := mtbdd.Constant(true)
		nodeFalse := mtbdd.Constant(false)
		result := mtbdd.Add(nodeTrue, nodeFalse)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 1 {
			t.Errorf("Expected 1 (true + false), got %v", value)
		}
	})
}

func TestMultiply(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ConstantMultiplication", func(t *testing.T) {
		// Test integer multiplication
		node1 := mtbdd.Constant(4)
		node2 := mtbdd.Constant(6)
		result := mtbdd.Multiply(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 24 {
			t.Errorf("Expected 24, got %v", value)
		}
	})

	t.Run("MultiplicationByZero", func(t *testing.T) {
		// Test multiplication by zero
		node1 := mtbdd.Constant(42)
		node2 := mtbdd.Constant(0)
		result := mtbdd.Multiply(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 0 {
			t.Errorf("Expected 0, got %v", value)
		}
	})

	t.Run("MultiplicationByOne", func(t *testing.T) {
		// Test multiplication by one
		node1 := mtbdd.Constant(42)
		node2 := mtbdd.Constant(1)
		result := mtbdd.Multiply(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 42 {
			t.Errorf("Expected 42, got %v", value)
		}
	})

	t.Run("FloatMultiplication", func(t *testing.T) {
		// Test float multiplication
		node1 := mtbdd.Constant(2.5)
		node2 := mtbdd.Constant(4.0)
		result := mtbdd.Multiply(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 10.0 {
			t.Errorf("Expected 10.0, got %v", value)
		}
	})

	t.Run("ConditionalMultiplication", func(t *testing.T) {
		// Test multiplication with decision nodes
		mtbdd.Declare("y")
		y, err := mtbdd.Var("y")
		if err != nil {
			t.Fatal(err)
		}

		node3 := mtbdd.Constant(3)
		node7 := mtbdd.Constant(7)
		conditional := mtbdd.ITE(y, node3, node7) // if y then 3 else 7

		node2 := mtbdd.Constant(2)
		result := mtbdd.Multiply(conditional, node2) // if y then 6 else 14

		// Test with y = true
		value := mtbdd.Evaluate(result, map[string]bool{"y": true})
		if value != 6 {
			t.Errorf("Expected 6 when y=true, got %v", value)
		}

		// Test with y = false
		value = mtbdd.Evaluate(result, map[string]bool{"y": false})
		if value != 14 {
			t.Errorf("Expected 14 when y=false, got %v", value)
		}
	})
}

func TestSubtract(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ConstantSubtraction", func(t *testing.T) {
		// Test integer subtraction
		node1 := mtbdd.Constant(10)
		node2 := mtbdd.Constant(3)
		result := mtbdd.Subtract(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 7 {
			t.Errorf("Expected 7, got %v", value)
		}
	})

	t.Run("NegativeResult", func(t *testing.T) {
		// Test subtraction resulting in negative
		node1 := mtbdd.Constant(3)
		node2 := mtbdd.Constant(10)
		result := mtbdd.Subtract(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -7 {
			t.Errorf("Expected -7, got %v", value)
		}
	})

	t.Run("SubtractZero", func(t *testing.T) {
		// Test subtracting zero
		node1 := mtbdd.Constant(42)
		node2 := mtbdd.Constant(0)
		result := mtbdd.Subtract(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 42 {
			t.Errorf("Expected 42, got %v", value)
		}
	})

	t.Run("FloatSubtraction", func(t *testing.T) {
		// Test float subtraction
		node1 := mtbdd.Constant(5.5)
		node2 := mtbdd.Constant(2.5)
		result := mtbdd.Subtract(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.0 {
			t.Errorf("Expected 3.0, got %v", value)
		}
	})
}

func TestMax(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ConstantMax", func(t *testing.T) {
		// Test max of integers
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(8)
		result := mtbdd.Max(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 8 {
			t.Errorf("Expected 8, got %v", value)
		}
	})

	t.Run("MaxWithEqual", func(t *testing.T) {
		// Test max with equal values
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(5)
		result := mtbdd.Max(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 5 {
			t.Errorf("Expected 5, got %v", value)
		}
	})

	t.Run("MaxWithNegative", func(t *testing.T) {
		// Test max with negative numbers
		node1 := mtbdd.Constant(-3)
		node2 := mtbdd.Constant(-8)
		result := mtbdd.Max(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -3 {
			t.Errorf("Expected -3, got %v", value)
		}
	})

	t.Run("FloatMax", func(t *testing.T) {
		// Test max with floats
		node1 := mtbdd.Constant(3.7)
		node2 := mtbdd.Constant(3.2)
		result := mtbdd.Max(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.7 {
			t.Errorf("Expected 3.7, got %v", value)
		}
	})

	t.Run("ConditionalMax", func(t *testing.T) {
		// Test max with decision nodes
		mtbdd.Declare("z")
		z, err := mtbdd.Var("z")
		if err != nil {
			t.Fatal(err)
		}

		node10 := mtbdd.Constant(10)
		node5 := mtbdd.Constant(5)
		conditional := mtbdd.ITE(z, node10, node5) // if z then 10 else 5

		node7 := mtbdd.Constant(7)
		result := mtbdd.Max(conditional, node7) // if z then max(10,7)=10 else max(5,7)=7

		// Test with z = true: max(10, 7) = 10
		value := mtbdd.Evaluate(result, map[string]bool{"z": true})
		if value != 10 {
			t.Errorf("Expected 10 when z=true, got %v", value)
		}

		// Test with z = false: max(5, 7) = 7
		value = mtbdd.Evaluate(result, map[string]bool{"z": false})
		if value != 7 {
			t.Errorf("Expected 7 when z=false, got %v", value)
		}
	})
}

func TestMin(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ConstantMin", func(t *testing.T) {
		// Test min of integers
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(8)
		result := mtbdd.Min(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 5 {
			t.Errorf("Expected 5, got %v", value)
		}
	})

	t.Run("MinWithNegative", func(t *testing.T) {
		// Test min with negative numbers
		node1 := mtbdd.Constant(-3)
		node2 := mtbdd.Constant(-8)
		result := mtbdd.Min(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -8 {
			t.Errorf("Expected -8, got %v", value)
		}
	})

	t.Run("FloatMin", func(t *testing.T) {
		// Test min with floats
		node1 := mtbdd.Constant(3.7)
		node2 := mtbdd.Constant(3.2)
		result := mtbdd.Min(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.2 {
			t.Errorf("Expected 3.2, got %v", value)
		}
	})
}

func TestNegate(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("NegatePositive", func(t *testing.T) {
		// Test negating positive integer
		node := mtbdd.Constant(5)
		result := mtbdd.Negate(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -5 {
			t.Errorf("Expected -5, got %v", value)
		}
	})

	t.Run("NegateNegative", func(t *testing.T) {
		// Test negating negative integer
		node := mtbdd.Constant(-7)
		result := mtbdd.Negate(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 7 {
			t.Errorf("Expected 7, got %v", value)
		}
	})

	t.Run("NegateZero", func(t *testing.T) {
		// Test negating zero
		node := mtbdd.Constant(0)
		result := mtbdd.Negate(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 0 {
			t.Errorf("Expected 0, got %v", value)
		}
	})

	t.Run("NegateFloat", func(t *testing.T) {
		// Test negating float
		node := mtbdd.Constant(3.14)
		result := mtbdd.Negate(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -3.14 {
			t.Errorf("Expected -3.14, got %v", value)
		}
	})

	t.Run("ConditionalNegate", func(t *testing.T) {
		// Test negating decision node
		mtbdd.Declare("w")
		w, err := mtbdd.Var("w")
		if err != nil {
			t.Fatal(err)
		}

		positive := mtbdd.Constant(10)
		negative := mtbdd.Constant(-3)
		conditional := mtbdd.ITE(w, positive, negative) // if w then 10 else -3

		result := mtbdd.Negate(conditional) // if w then -10 else 3

		// Test with w = true: negate(10) = -10
		value := mtbdd.Evaluate(result, map[string]bool{"w": true})
		if value != -10 {
			t.Errorf("Expected -10 when w=true, got %v", value)
		}

		// Test with w = false: negate(-3) = 3
		value = mtbdd.Evaluate(result, map[string]bool{"w": false})
		if value != 3 {
			t.Errorf("Expected 3 when w=false, got %v", value)
		}
	})
}

func TestAbs(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("AbsPositive", func(t *testing.T) {
		// Test abs of positive integer
		node := mtbdd.Constant(7)
		result := mtbdd.Abs(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 7 {
			t.Errorf("Expected 7, got %v", value)
		}
	})

	t.Run("AbsNegative", func(t *testing.T) {
		// Test abs of negative integer
		node := mtbdd.Constant(-7)
		result := mtbdd.Abs(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 7 {
			t.Errorf("Expected 7, got %v", value)
		}
	})

	t.Run("AbsZero", func(t *testing.T) {
		// Test abs of zero
		node := mtbdd.Constant(0)
		result := mtbdd.Abs(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 0 {
			t.Errorf("Expected 0, got %v", value)
		}
	})

	t.Run("AbsFloat", func(t *testing.T) {
		// Test abs of negative float
		node := mtbdd.Constant(-3.14)
		result := mtbdd.Abs(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.14 {
			t.Errorf("Expected 3.14, got %v", value)
		}
	})

	t.Run("ConditionalAbs", func(t *testing.T) {
		// Test abs with decision nodes
		mtbdd.Declare("v")
		v, err := mtbdd.Var("v")
		if err != nil {
			t.Fatal(err)
		}

		negative := mtbdd.Constant(-5)
		positive := mtbdd.Constant(3)
		conditional := mtbdd.ITE(v, negative, positive) // if v then -5 else 3

		result := mtbdd.Abs(conditional) // if v then 5 else 3

		// Test with v = true: abs(-5) = 5
		value := mtbdd.Evaluate(result, map[string]bool{"v": true})
		if value != 5 {
			t.Errorf("Expected 5 when v=true, got %v", value)
		}

		// Test with v = false: abs(3) = 3
		value = mtbdd.Evaluate(result, map[string]bool{"v": false})
		if value != 3 {
			t.Errorf("Expected 3 when v=false, got %v", value)
		}
	})
}

func TestCeil(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("CeilInteger", func(t *testing.T) {
		// Test ceil of integer (should be unchanged)
		node := mtbdd.Constant(5)
		result := mtbdd.Ceil(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 5 {
			t.Errorf("Expected 5, got %v", value)
		}
	})

	t.Run("CeilPositiveFloat", func(t *testing.T) {
		// Test ceil of positive float
		node := mtbdd.Constant(3.7)
		result := mtbdd.Ceil(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 4.0 {
			t.Errorf("Expected 4.0, got %v", value)
		}
	})

	t.Run("CeilNegativeFloat", func(t *testing.T) {
		// Test ceil of negative float
		node := mtbdd.Constant(-2.3)
		result := mtbdd.Ceil(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -2.0 {
			t.Errorf("Expected -2.0, got %v", value)
		}
	})

	t.Run("CeilExactFloat", func(t *testing.T) {
		// Test ceil of exact float (should be unchanged)
		node := mtbdd.Constant(3.0)
		result := mtbdd.Ceil(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.0 {
			t.Errorf("Expected 3.0, got %v", value)
		}
	})
}

func TestFloor(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("FloorInteger", func(t *testing.T) {
		// Test floor of integer (should be unchanged)
		node := mtbdd.Constant(5)
		result := mtbdd.Floor(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 5 {
			t.Errorf("Expected 5, got %v", value)
		}
	})

	t.Run("FloorPositiveFloat", func(t *testing.T) {
		// Test floor of positive float
		node := mtbdd.Constant(3.7)
		result := mtbdd.Floor(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.0 {
			t.Errorf("Expected 3.0, got %v", value)
		}
	})

	t.Run("FloorNegativeFloat", func(t *testing.T) {
		// Test floor of negative float
		node := mtbdd.Constant(-2.3)
		result := mtbdd.Floor(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != -3.0 {
			t.Errorf("Expected -3.0, got %v", value)
		}
	})

	t.Run("FloorExactFloat", func(t *testing.T) {
		// Test floor of exact float (should be unchanged)
		node := mtbdd.Constant(3.0)
		result := mtbdd.Floor(node)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 3.0 {
			t.Errorf("Expected 3.0, got %v", value)
		}
	})
}

func TestArithmeticCaching(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("CacheHit", func(t *testing.T) {
		// Test that repeated operations use cache
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(3)

		// First operation
		result1 := mtbdd.Add(node1, node2)

		// Second identical operation (should hit cache)
		result2 := mtbdd.Add(node1, node2)

		// Results should be identical (same node reference)
		if result1 != result2 {
			t.Error("Expected cached result to return same node reference")
		}

		// Values should be equal
		value1, _ := mtbdd.GetTerminalValue(result1)
		value2, _ := mtbdd.GetTerminalValue(result2)
		if value1 != value2 {
			t.Errorf("Expected same values, got %v and %v", value1, value2)
		}
	})

	t.Run("CacheMiss", func(t *testing.T) {
		// Test that different operations don't interfere
		node1 := mtbdd.Constant(5)
		node2 := mtbdd.Constant(3)
		node3 := mtbdd.Constant(7)

		result1 := mtbdd.Add(node1, node2) // 5 + 3 = 8
		result2 := mtbdd.Add(node1, node3) // 5 + 7 = 12

		value1, _ := mtbdd.GetTerminalValue(result1)
		value2, _ := mtbdd.GetTerminalValue(result2)

		if value1 != 8 {
			t.Errorf("Expected 8, got %v", value1)
		}
		if value2 != 12 {
			t.Errorf("Expected 12, got %v", value2)
		}
	})
}

func TestArithmeticWithInvalidTypes(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("StringValues", func(t *testing.T) {
		// Test arithmetic with string values (should default to 0)
		node1 := mtbdd.Constant("hello")
		node2 := mtbdd.Constant(5)
		result := mtbdd.Add(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 5 { // "hello" converts to 0, so 0 + 5 = 5
			t.Errorf("Expected 5, got %v", value)
		}
	})

	t.Run("NilValues", func(t *testing.T) {
		// Test arithmetic with nil values (should default to 0)
		node1 := mtbdd.Constant(nil)
		node2 := mtbdd.Constant(10)
		result := mtbdd.Add(node1, node2)

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 10 { // nil converts to 0, so 0 + 10 = 10
			t.Errorf("Expected 10, got %v", value)
		}
	})
}

func TestComplexArithmeticExpressions(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("ChainedOperations", func(t *testing.T) {
		// Test chained arithmetic operations: (5 + 3) * 2 - 1
		node5 := mtbdd.Constant(5)
		node3 := mtbdd.Constant(3)
		node2 := mtbdd.Constant(2)
		node1 := mtbdd.Constant(1)

		sum := mtbdd.Add(node5, node3)           // 5 + 3 = 8
		product := mtbdd.Multiply(sum, node2)    // 8 * 2 = 16
		result := mtbdd.Subtract(product, node1) // 16 - 1 = 15

		value, isTerminal := mtbdd.GetTerminalValue(result)
		if !isTerminal {
			t.Error("Expected terminal result")
		}
		if value != 15 {
			t.Errorf("Expected 15, got %v", value)
		}
	})

	t.Run("NestedConditionals", func(t *testing.T) {
		// Test arithmetic with nested conditionals
		mtbdd.Declare("a", "b")
		a, _ := mtbdd.Var("a")
		b, _ := mtbdd.Var("b")

		node2 := mtbdd.Constant(2)
		node4 := mtbdd.Constant(4)
		node6 := mtbdd.Constant(6)
		node8 := mtbdd.Constant(8)

		// if a then (if b then 2 else 4) else (if b then 6 else 8)
		innerTrue := mtbdd.ITE(b, node2, node4)  // if b then 2 else 4
		innerFalse := mtbdd.ITE(b, node6, node8) // if b then 6 else 8
		conditional := mtbdd.ITE(a, innerTrue, innerFalse)

		node10 := mtbdd.Constant(10)
		result := mtbdd.Add(conditional, node10) // Add 10 to all branches

		// Test all combinations
		testCases := []struct {
			aVal, bVal bool
			expected   int
		}{
			{true, true, 12},   // 2 + 10 = 12
			{true, false, 14},  // 4 + 10 = 14
			{false, true, 16},  // 6 + 10 = 16
			{false, false, 18}, // 8 + 10 = 18
		}

		for _, tc := range testCases {
			assignment := map[string]bool{"a": tc.aVal, "b": tc.bVal}
			value := mtbdd.Evaluate(result, assignment)
			if value != tc.expected {
				t.Errorf("Expected %d for a=%t,b=%t, got %v", tc.expected, tc.aVal, tc.bVal, value)
			}
		}
	})
}

func TestArithmeticValueConversions(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("BooleanToNumeric", func(t *testing.T) {
		// Test boolean to numeric conversion
		nodeTrue := mtbdd.Constant(true)   // Should convert to 1
		nodeFalse := mtbdd.Constant(false) // Should convert to 0
		node5 := mtbdd.Constant(5)

		resultTrue := mtbdd.Add(nodeTrue, node5)   // 1 + 5 = 6
		resultFalse := mtbdd.Add(nodeFalse, node5) // 0 + 5 = 5

		valueTrue, _ := mtbdd.GetTerminalValue(resultTrue)
		valueFalse, _ := mtbdd.GetTerminalValue(resultFalse)

		if valueTrue != 6 {
			t.Errorf("Expected 6 for true + 5, got %v", valueTrue)
		}
		if valueFalse != 5 {
			t.Errorf("Expected 5 for false + 5, got %v", valueFalse)
		}
	})

	t.Run("IntegerTypes", func(t *testing.T) {
		// Test various integer types
		node1 := mtbdd.Constant(int8(10))
		node2 := mtbdd.Constant(int16(20))
		node3 := mtbdd.Constant(int32(30))
		node4 := mtbdd.Constant(int64(40))

		result := mtbdd.Add(mtbdd.Add(node1, node2), mtbdd.Add(node3, node4))
		value, _ := mtbdd.GetTerminalValue(result)

		if value != 100 {
			t.Errorf("Expected 100, got %v", value)
		}
	})

	t.Run("FloatTypes", func(t *testing.T) {
		// Test various float types
		node1 := mtbdd.Constant(float32(1.5))
		node2 := mtbdd.Constant(float64(2.5))

		result := mtbdd.Add(node1, node2)
		value, _ := mtbdd.GetTerminalValue(result)

		if value != 4.0 {
			t.Errorf("Expected 4.0, got %v", value)
		}
	})
}

func TestArithmeticSpecialValues(t *testing.T) {
	mtbdd := NewUDD()

	t.Run("InfinityHandling", func(t *testing.T) {
		// Test handling of infinity values
		nodeInf := mtbdd.Constant(math.Inf(1))     // +Inf
		nodeNegInf := mtbdd.Constant(math.Inf(-1)) // -Inf
		node5 := mtbdd.Constant(5)

		resultInf := mtbdd.Add(nodeInf, node5)
		resultNegInf := mtbdd.Add(nodeNegInf, node5)

		valueInf, _ := mtbdd.GetTerminalValue(resultInf)
		valueNegInf, _ := mtbdd.GetTerminalValue(resultNegInf)

		if !math.IsInf(valueInf.(float64), 1) {
			t.Errorf("Expected +Inf, got %v", valueInf)
		}
		if !math.IsInf(valueNegInf.(float64), -1) {
			t.Errorf("Expected -Inf, got %v", valueNegInf)
		}
	})

	t.Run("NaNHandling", func(t *testing.T) {
		// Test handling of NaN values
		nodeNaN := mtbdd.Constant(math.NaN())
		node5 := mtbdd.Constant(5)

		result := mtbdd.Add(nodeNaN, node5)
		value, _ := mtbdd.GetTerminalValue(result)

		if !math.IsNaN(value.(float64)) {
			t.Errorf("Expected NaN, got %v", value)
		}
	})
}

package mtbdd

import (
	"math"
)

func (mtbdd *MTBDD) Add(x, y NodeRef) NodeRef {
	return mtbdd.arithmeticBinaryOp(x, y, "ADD", addValues)
}

func (mtbdd *MTBDD) Multiply(x, y NodeRef) NodeRef {
	return mtbdd.arithmeticBinaryOp(x, y, "MULTIPLY", multiplyValues)
}

func (mtbdd *MTBDD) Subtract(x, y NodeRef) NodeRef {
	return mtbdd.arithmeticBinaryOp(x, y, "SUBTRACT", subtractValues)
}

func (mtbdd *MTBDD) Max(x, y NodeRef) NodeRef {
	return mtbdd.arithmeticBinaryOp(x, y, "MAX", maxValues)
}

func (mtbdd *MTBDD) Min(x, y NodeRef) NodeRef {
	return mtbdd.arithmeticBinaryOp(x, y, "MIN", minValues)
}

func (mtbdd *MTBDD) Negate(nodeRef NodeRef) NodeRef {
	return mtbdd.arithmeticUnaryOp(nodeRef, "NEGATE", negateValue)
}

func (mtbdd *MTBDD) Abs(nodeRef NodeRef) NodeRef {
	return mtbdd.arithmeticUnaryOp(nodeRef, "ABS", absValue)
}

func (mtbdd *MTBDD) Ceil(nodeRef NodeRef) NodeRef {
	return mtbdd.arithmeticUnaryOp(nodeRef, "CEIL", ceilValue)
}

func (mtbdd *MTBDD) Floor(nodeRef NodeRef) NodeRef {
	return mtbdd.arithmeticUnaryOp(nodeRef, "FLOOR", floorValue)
}

// PERFORMANCE OPTIMIZATION: Updated to use fast typed cache
func (mtbdd *MTBDD) arithmeticBinaryOp(x, y NodeRef, operation string, valueOp func(interface{}, interface{}) interface{}) NodeRef {
	// Use optimized cache lookup
	if result, exists := mtbdd.GetCachedBinaryOp(operation, x, y); exists {
		return result
	}

	var result NodeRef

	// Terminal case: both operands are terminals
	if mtbdd.isTerminalInternal(x) && mtbdd.isTerminalInternal(y) {
		xValue, xExists := mtbdd.getTerminalValueInternal(x)
		yValue, yExists := mtbdd.getTerminalValueInternal(y)

		if xExists && yExists {
			resultValue := valueOp(xValue, yValue)
			result = mtbdd.GetTerminal(resultValue)
		} else {
			result = mtbdd.GetTerminal(0)
		}

		mtbdd.SetCachedBinaryOp(operation, x, y, result)
		return result
	}

	// Shannon decomposition
	topLevel, topVar := mtbdd.findTopVariable(x, y)

	xLow, xHigh := mtbdd.getCofactors(x, topVar, topLevel)
	yLow, yHigh := mtbdd.getCofactors(y, topVar, topLevel)

	lowResult := mtbdd.arithmeticBinaryOp(xLow, yLow, operation, valueOp)
	highResult := mtbdd.arithmeticBinaryOp(xHigh, yHigh, operation, valueOp)

	result = mtbdd.GetDecisionNode(topVar, topLevel, lowResult, highResult)

	mtbdd.SetCachedBinaryOp(operation, x, y, result)
	return result
}

// PERFORMANCE OPTIMIZATION: Updated to use fast typed cache
func (mtbdd *MTBDD) arithmeticUnaryOp(x NodeRef, operation string, valueOp func(interface{}) interface{}) NodeRef {
	// Use optimized cache lookup
	if result, exists := mtbdd.GetCachedUnaryOp(operation, x); exists {
		return result
	}

	var result NodeRef

	// Terminal case: operand is a terminal
	if mtbdd.isTerminalInternal(x) {
		xValue, xExists := mtbdd.getTerminalValueInternal(x)

		if xExists {
			resultValue := valueOp(xValue)
			result = mtbdd.GetTerminal(resultValue)
		} else {
			result = mtbdd.GetTerminal(0)
		}

		mtbdd.SetCachedUnaryOp(operation, x, result)
		return result
	}

	// Recursive case: apply operation to both children
	node, _, exists := mtbdd.GetNode(x)
	if !exists || node == nil {
		result = mtbdd.GetTerminal(0)
		mtbdd.SetCachedUnaryOp(operation, x, result)
		return result
	}

	lowResult := mtbdd.arithmeticUnaryOp(node.Low, operation, valueOp)
	highResult := mtbdd.arithmeticUnaryOp(node.High, operation, valueOp)

	result = mtbdd.GetDecisionNode(node.Variable, node.Level, lowResult, highResult)

	mtbdd.SetCachedUnaryOp(operation, x, result)
	return result
}

// Helper function to check if a value is any integer type and extract its int value
func getIntValue(value interface{}) (int, bool) {
	switch v := value.(type) {
	case int:
		return v, true
	case int8:
		return int(v), true
	case int16:
		return int(v), true
	case int32:
		return int(v), true
	case int64:
		return int(v), true
	case uint:
		return int(v), true
	case uint8:
		return int(v), true
	case uint16:
		return int(v), true
	case uint32:
		return int(v), true
	case uint64:
		return int(v), true
	case bool:
		if v {
			return 1, true
		}
		return 0, true
	default:
		return 0, false
	}
}

// PERFORMANCE OPTIMIZATION: Simplified arithmetic operations
func addValues(left, right interface{}) interface{} {
	leftFloat, leftOk := ConvertToFloat64(left)
	rightFloat, rightOk := ConvertToFloat64(right)

	// Treat failed conversions as 0
	if !leftOk {
		leftFloat = 0.0
	}
	if !rightOk {
		rightFloat = 0.0
	}

	// Check if operands are integer-like types (including bool)
	leftInt, leftIsIntLike := getIntValue(left)
	rightInt, rightIsIntLike := getIntValue(right)

	// For failed conversions, treat as integer 0
	if !leftIsIntLike {
		leftInt = 0
	}
	if !rightIsIntLike {
		rightInt = 0
	}

	// Check if we have any actual float types
	_, leftIsFloat32 := left.(float32)
	_, leftIsFloat64 := left.(float64)
	_, rightIsFloat32 := right.(float32)
	_, rightIsFloat64 := right.(float64)

	hasFloatType := leftIsFloat32 || leftIsFloat64 || rightIsFloat32 || rightIsFloat64

	// Return int if we don't have actual float types
	if !hasFloatType {
		return leftInt + rightInt
	} else {
		return leftFloat + rightFloat
	}
}

func multiplyValues(left, right interface{}) interface{} {
	leftFloat, leftOk := ConvertToFloat64(left)
	rightFloat, rightOk := ConvertToFloat64(right)

	// Treat failed conversions as 0
	if !leftOk {
		leftFloat = 0.0
	}
	if !rightOk {
		rightFloat = 0.0
	}

	// Check if both operands are integer-like types (including bool)
	leftInt, leftIsIntLike := getIntValue(left)
	rightInt, rightIsIntLike := getIntValue(right)

	// Return int if both operands are integer-like and conversions succeeded
	if leftOk && rightOk && leftIsIntLike && rightIsIntLike {
		return leftInt * rightInt
	} else {
		return leftFloat * rightFloat
	}
}

func subtractValues(left, right interface{}) interface{} {
	leftFloat, leftOk := ConvertToFloat64(left)
	rightFloat, rightOk := ConvertToFloat64(right)

	// Treat failed conversions as 0
	if !leftOk {
		leftFloat = 0.0
	}
	if !rightOk {
		rightFloat = 0.0
	}

	// Check if both operands are integer-like types (including bool)
	leftInt, leftIsIntLike := getIntValue(left)
	rightInt, rightIsIntLike := getIntValue(right)

	// Return int if both operands are integer-like and conversions succeeded
	if leftOk && rightOk && leftIsIntLike && rightIsIntLike {
		return leftInt - rightInt
	} else {
		return leftFloat - rightFloat
	}
}

func maxValues(left, right interface{}) interface{} {
	leftFloat, leftOk := ConvertToFloat64(left)
	rightFloat, rightOk := ConvertToFloat64(right)

	if !leftOk && !rightOk {
		return 0
	} else if !leftOk {
		return right
	} else if !rightOk {
		return left
	}

	if leftFloat > rightFloat {
		return left
	} else {
		return right
	}
}

func minValues(left, right interface{}) interface{} {
	leftFloat, leftOk := ConvertToFloat64(left)
	rightFloat, rightOk := ConvertToFloat64(right)

	if !leftOk && !rightOk {
		return 0
	} else if !leftOk {
		return right
	} else if !rightOk {
		return left
	}

	if leftFloat < rightFloat {
		return left
	} else {
		return right
	}
}

func negateValue(value interface{}) interface{} {
	switch v := value.(type) {
	case int:
		return -v
	case float64:
		return -v
	default:
		if f, ok := ConvertToFloat64(value); ok {
			return -f
		}
		return 0
	}
}

func absValue(value interface{}) interface{} {
	switch v := value.(type) {
	case int:
		if v < 0 {
			return -v
		}
		return v
	case float64:
		return math.Abs(v)
	default:
		if f, ok := ConvertToFloat64(value); ok {
			return math.Abs(f)
		}
		return 0
	}
}

func ceilValue(value interface{}) interface{} {
	switch v := value.(type) {
	case int:
		return v
	case float64:
		return math.Ceil(v)
	default:
		if f, ok := ConvertToFloat64(value); ok {
			return math.Ceil(f)
		}
		return 0
	}
}

func floorValue(value interface{}) interface{} {
	switch v := value.(type) {
	case int:
		return v
	case float64:
		return math.Floor(v)
	default:
		if f, ok := ConvertToFloat64(value); ok {
			return math.Floor(f)
		}
		return 0
	}
}

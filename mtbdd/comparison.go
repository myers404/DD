package mtbdd

import (
	"strings"
)

func (mtbdd *MTBDD) Equal(x, y NodeRef) NodeRef {
	return mtbdd.comparisonBinaryOp(x, y, "EQUAL",
		func(left, right interface{}) bool {
			return compareValues(left, right, "equal")
		})
}

func (mtbdd *MTBDD) LessThan(x, y NodeRef) NodeRef {
	return mtbdd.comparisonBinaryOp(x, y, "LESSTHAN",
		func(left, right interface{}) bool {
			return compareValues(left, right, "less")
		})
}

func (mtbdd *MTBDD) LessThanOrEqual(x, y NodeRef) NodeRef {
	return mtbdd.comparisonBinaryOp(x, y, "LESSEQUAL",
		func(left, right interface{}) bool {
			return compareValues(left, right, "lessequal")
		})
}

func (mtbdd *MTBDD) GreaterThan(x, y NodeRef) NodeRef {
	return mtbdd.comparisonBinaryOp(x, y, "GREATER",
		func(left, right interface{}) bool {
			return compareValues(left, right, "greater")
		})
}

func (mtbdd *MTBDD) GreaterThanOrEqual(x, y NodeRef) NodeRef {
	return mtbdd.comparisonBinaryOp(x, y, "GREATEREQUAL",
		func(left, right interface{}) bool {
			return compareValues(left, right, "greaterequal")
		})
}

func (mtbdd *MTBDD) Threshold(nodeRef NodeRef, threshold interface{}) NodeRef {
	return mtbdd.comparisonUnaryOp(nodeRef, "THRESHOLD", threshold,
		func(value interface{}) bool {
			return compareValues(value, threshold, "greaterequal")
		})
}

func compareValues(left, right interface{}, operation string) bool {
	if left == nil && right == nil {
		return operation == "equal" || operation == "lessequal" || operation == "greaterequal"
	}
	if left == nil || right == nil {
		return operation != "equal"
	}

	if leftNum, leftOk := tryConvertToNumeric(left); leftOk {
		if rightNum, rightOk := tryConvertToNumeric(right); rightOk {
			return compareNumeric(leftNum, rightNum, operation)
		}
	}

	if leftStr, leftOk := left.(string); leftOk {
		if rightStr, rightOk := right.(string); rightOk {
			return compareStrings(leftStr, rightStr, operation)
		}
	}

	if operation == "equal" {
		return left == right
	}

	return false
}

func tryConvertToNumeric(value interface{}) (float64, bool) {
	if converted, ok := ConvertToFloat64(value); ok {
		return converted, true
	}

	if b, ok := value.(bool); ok {
		if b {
			return 1.0, true
		}
		return 0.0, true
	}

	return 0, false
}

func compareNumeric(left, right float64, operation string) bool {
	switch operation {
	case "equal":
		return left == right
	case "less":
		return left < right
	case "lessequal":
		return left <= right
	case "greater":
		return left > right
	case "greaterequal":
		return left >= right
	default:
		return false
	}
}

func compareStrings(left, right string, operation string) bool {
	switch operation {
	case "equal":
		return left == right
	case "less":
		return strings.Compare(left, right) < 0
	case "lessequal":
		return strings.Compare(left, right) <= 0
	case "greater":
		return strings.Compare(left, right) > 0
	case "greaterequal":
		return strings.Compare(left, right) >= 0
	default:
		return false
	}
}

// PERFORMANCE OPTIMIZATION: Updated to use fast typed cache
func (mtbdd *MTBDD) comparisonBinaryOp(x, y NodeRef, operation string, valueOp func(interface{}, interface{}) bool) NodeRef {
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
			comparisonResult := valueOp(xValue, yValue)
			if comparisonResult {
				result = TrueRef
			} else {
				result = FalseRef
			}
		} else {
			result = FalseRef
		}

		mtbdd.SetCachedBinaryOp(operation, x, y, result)
		return result
	}

	// Shannon decomposition
	topLevel, topVar := mtbdd.findTopVariable(x, y)

	xLow, xHigh := mtbdd.getCofactors(x, topVar, topLevel)
	yLow, yHigh := mtbdd.getCofactors(y, topVar, topLevel)

	lowResult := mtbdd.comparisonBinaryOp(xLow, yLow, operation, valueOp)
	highResult := mtbdd.comparisonBinaryOp(xHigh, yHigh, operation, valueOp)

	result = mtbdd.GetDecisionNode(topVar, topLevel, lowResult, highResult)

	mtbdd.SetCachedBinaryOp(operation, x, y, result)
	return result
}

// PERFORMANCE OPTIMIZATION: Use typed cache with proper key structure
type ThresholdKey struct {
	Op        string
	Node      NodeRef
	Threshold interface{}
}

func (mtbdd *MTBDD) comparisonUnaryOp(x NodeRef, operation string, constant interface{}, valueOp func(interface{}) bool) NodeRef {
	// Create a cache key that includes the constant value
	//cacheKey := ThresholdKey{Op: operation, Node: x, Threshold: constant}

	mtbdd.mu.RLock()
	// For threshold operations, we need a separate cache since they include constants
	// This is a simplified approach - in production, consider a more sophisticated cache
	if operation == "THRESHOLD" {
		// Use a simple approach for now - could be optimized further
		mtbdd.mu.RUnlock()

		var result NodeRef

		// Terminal case
		if mtbdd.isTerminalInternal(x) {
			xValue, xExists := mtbdd.getTerminalValueInternal(x)

			if xExists {
				comparisonResult := valueOp(xValue)
				if comparisonResult {
					result = TrueRef
				} else {
					result = FalseRef
				}
			} else {
				result = FalseRef
			}

			return result
		}

		// Recursive case
		node, _, exists := mtbdd.GetNode(x)
		if !exists || node == nil {
			result = FalseRef
			return result
		}

		lowResult := mtbdd.comparisonUnaryOp(node.Low, operation, constant, valueOp)
		highResult := mtbdd.comparisonUnaryOp(node.High, operation, constant, valueOp)

		result = mtbdd.GetDecisionNode(node.Variable, node.Level, lowResult, highResult)
		return result
	}
	mtbdd.mu.RUnlock()

	// For other unary comparison operations, use the standard unary cache
	if result, exists := mtbdd.GetCachedUnaryOp(operation, x); exists {
		return result
	}

	var result NodeRef

	// Terminal case
	if mtbdd.isTerminalInternal(x) {
		xValue, xExists := mtbdd.getTerminalValueInternal(x)

		if xExists {
			comparisonResult := valueOp(xValue)
			if comparisonResult {
				result = TrueRef
			} else {
				result = FalseRef
			}
		} else {
			result = FalseRef
		}

		mtbdd.SetCachedUnaryOp(operation, x, result)
		return result
	}

	// Recursive case
	node, _, exists := mtbdd.GetNode(x)
	if !exists || node == nil {
		result = FalseRef
		mtbdd.SetCachedUnaryOp(operation, x, result)
		return result
	}

	lowResult := mtbdd.comparisonUnaryOp(node.Low, operation, constant, valueOp)
	highResult := mtbdd.comparisonUnaryOp(node.High, operation, constant, valueOp)

	result = mtbdd.GetDecisionNode(node.Variable, node.Level, lowResult, highResult)

	mtbdd.SetCachedUnaryOp(operation, x, result)
	return result
}

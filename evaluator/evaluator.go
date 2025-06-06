// Package evaluator provides expression evaluation functionality
// This package implements the visitor pattern to evaluate parsed expressions
package evaluator

import (
	"DD/parser" // Replace with your actual module path
	"fmt"
	"math"
)

// ===== TYPE DEFINITIONS =====

// Context provides variable values for expression evaluation
type Context map[string]interface{}

// Value represents a runtime value that can be either a number or boolean
type Value struct {
	Type    ValueType
	Number  float64
	Boolean bool
}

type ValueType int

const (
	ValueTypeNumber ValueType = iota
	ValueTypeBoolean
)

// ===== EVALUATOR IMPLEMENTATION =====

// Evaluator implements the visitor pattern for expression evaluation
type Evaluator struct {
	context Context
}

// NewEvaluator creates a new evaluator with the given variable context
func NewEvaluator(context Context) *Evaluator {
	return &Evaluator{context: context}
}

// ===== PUBLIC API =====

// Evaluate is the main entry point for evaluating expressions
func Evaluate(expr parser.Expression, context Context) (interface{}, error) {
	evaluator := NewEvaluator(context)
	return expr.Accept(evaluator)
}

// EvaluateExpression parses and evaluates an expression in one call
func EvaluateExpression(input string, context Context) (interface{}, error) {
	ast, err := parser.ParseExpression(input)
	if err != nil {
		return nil, err
	}
	return Evaluate(ast, context)
}

// ===== VISITOR IMPLEMENTATION =====

func (e *Evaluator) VisitNumberLiteral(node *parser.NumberLiteral) (interface{}, error) {
	return node.Value, nil
}

func (e *Evaluator) VisitBooleanLiteral(node *parser.BooleanLiteral) (interface{}, error) {
	return node.Value, nil
}

func (e *Evaluator) VisitIdentifier(node *parser.Identifier) (interface{}, error) {
	if value, exists := e.context[node.Name]; exists {
		// Convert numeric types to float64 for consistency
		if num, ok := ToFloat64(value); ok {
			return num, nil
		}
		// Convert boolean types for consistency
		if boolean, ok := ToBool(value); ok {
			return boolean, nil
		}
		// Return value as-is for other types
		return value, nil
	}
	return nil, &parser.ParseError{
		Message:    fmt.Sprintf("Undefined variable '%s'", node.Name),
		Range:      node.GetRange(),
		ErrorType:  "semantic",
		Suggestion: fmt.Sprintf("Define variable '%s' or check spelling", node.Name),
	}
}

func (e *Evaluator) VisitBinaryOperation(node *parser.BinaryOperation) (interface{}, error) {
	// Short-circuit evaluation for logical operators
	if node.Operator == parser.TOKEN_AND {
		leftVal, err := node.Left.Accept(e)
		if err != nil {
			return nil, err
		}

		leftBool, ok := ToBool(leftVal)
		if !ok {
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Left operand of AND must be boolean, got %T", leftVal),
				Range:      node.Left.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Ensure left operand is a boolean expression",
			}
		}
		if !leftBool {
			return false, nil
		}

		// Evaluate right side only if left is true
		rightVal, err := node.Right.Accept(e)
		if err != nil {
			return nil, err
		}
		rightBool, ok := ToBool(rightVal)
		if !ok {
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Right operand of AND must be boolean, got %T", rightVal),
				Range:      node.Right.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Ensure right operand is a boolean expression",
			}
		}
		return rightBool, nil
	}

	if node.Operator == parser.TOKEN_OR {
		leftVal, err := node.Left.Accept(e)
		if err != nil {
			return nil, err
		}

		leftBool, ok := ToBool(leftVal)
		if !ok {
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Left operand of OR must be boolean, got %T", leftVal),
				Range:      node.Left.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Ensure left operand is a boolean expression",
			}
		}
		if leftBool {
			return true, nil
		}

		// Evaluate right side only if left is false
		rightVal, err := node.Right.Accept(e)
		if err != nil {
			return nil, err
		}
		rightBool, ok := ToBool(rightVal)
		if !ok {
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Right operand of OR must be boolean, got %T", rightVal),
				Range:      node.Right.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Ensure right operand is a boolean expression",
			}
		}
		return rightBool, nil
	}

	// For other operators, evaluate both sides
	leftVal, err := node.Left.Accept(e)
	if err != nil {
		return nil, err
	}

	rightVal, err := node.Right.Accept(e)
	if err != nil {
		return nil, err
	}

	return e.applyBinaryOperation(node, leftVal, rightVal)
}

func (e *Evaluator) VisitUnaryOperation(node *parser.UnaryOperation) (interface{}, error) {
	operandVal, err := node.Operand.Accept(e)
	if err != nil {
		return nil, err
	}

	return e.applyUnaryOperation(node, operandVal)
}

func (e *Evaluator) VisitFunctionCall(node *parser.FunctionCall) (interface{}, error) {
	// Evaluate all arguments
	args := make([]interface{}, len(node.Args))
	for i, arg := range node.Args {
		val, err := arg.Accept(e)
		if err != nil {
			return nil, err
		}
		args[i] = val
	}

	return e.applyFunction(node, args)
}

// ===== OPERATION IMPLEMENTATIONS =====

func (e *Evaluator) applyBinaryOperation(node *parser.BinaryOperation, leftVal, rightVal interface{}) (interface{}, error) {
	// Arithmetic operations
	if e.isArithmeticOp(node.Operator) {
		leftNum, rightNum, err := e.getBinaryNumericOperands(node, leftVal, rightVal)
		if err != nil {
			return nil, err
		}

		switch node.Operator {
		case parser.TOKEN_PLUS:
			return leftNum + rightNum, nil
		case parser.TOKEN_MINUS:
			return leftNum - rightNum, nil
		case parser.TOKEN_MULTIPLY:
			return leftNum * rightNum, nil
		case parser.TOKEN_DIVIDE:
			if rightNum == 0 {
				return nil, &parser.ParseError{
					Message:    "Division by zero",
					Range:      node.Right.GetRange(),
					ErrorType:  "semantic",
					Suggestion: "Ensure divisor is not zero",
				}
			}
			return leftNum / rightNum, nil
		case parser.TOKEN_MODULO:
			if rightNum == 0 {
				return nil, &parser.ParseError{
					Message:    "Modulo by zero",
					Range:      node.Right.GetRange(),
					ErrorType:  "semantic",
					Suggestion: "Ensure divisor is not zero",
				}
			}
			return math.Mod(leftNum, rightNum), nil
		case parser.TOKEN_MIN:
			return math.Min(leftNum, rightNum), nil
		case parser.TOKEN_MAX:
			return math.Max(leftNum, rightNum), nil
		}
	}

	// Comparison operations
	if e.isComparisonOp(node.Operator) {
		// Handle equality comparisons (== and !=) - these work on same types
		if node.Operator == parser.TOKEN_EQ || node.Operator == parser.TOKEN_NE {
			// Try numeric comparison first
			leftNum, leftNumOk := ToFloat64(leftVal)
			rightNum, rightNumOk := ToFloat64(rightVal)

			if leftNumOk && rightNumOk {
				// Both are numeric
				switch node.Operator {
				case parser.TOKEN_EQ:
					return leftNum == rightNum, nil
				case parser.TOKEN_NE:
					return leftNum != rightNum, nil
				}
			}

			// Try boolean comparison
			leftBool, leftBoolOk := ToBool(leftVal)
			rightBool, rightBoolOk := ToBool(rightVal)

			if leftBoolOk && rightBoolOk {
				// Both are boolean
				switch node.Operator {
				case parser.TOKEN_EQ:
					return leftBool == rightBool, nil
				case parser.TOKEN_NE:
					return leftBool != rightBool, nil
				}
			}

			// Type mismatch
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Cannot compare %T and %T - operands must be same type", leftVal, rightVal),
				Range:      node.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Ensure both operands are the same type (both numeric or both boolean)",
			}
		}

		// Ordering comparisons (<, <=, >, >=) - these only work on numbers
		leftNum, rightNum, err := e.getBinaryNumericOperands(node, leftVal, rightVal)
		if err != nil {
			return nil, &parser.ParseError{
				Message:    fmt.Sprintf("Ordering operators (%s) require numeric operands, got %T and %T", node.Operator, leftVal, rightVal),
				Range:      node.GetRange(),
				ErrorType:  "semantic",
				Suggestion: "Use numeric expressions for ordering comparisons",
			}
		}

		switch node.Operator {
		case parser.TOKEN_LT:
			return leftNum < rightNum, nil
		case parser.TOKEN_LE:
			return leftNum <= rightNum, nil
		case parser.TOKEN_GT:
			return leftNum > rightNum, nil
		case parser.TOKEN_GE:
			return leftNum >= rightNum, nil
		}
	}

	// Logical operations (XOR, IMPLIES, EQUIV)
	if e.isLogicalOp(node.Operator) {
		leftBool, rightBool, err := e.getBinaryBooleanOperands(node, leftVal, rightVal)
		if err != nil {
			return nil, err
		}

		switch node.Operator {
		case parser.TOKEN_XOR:
			return leftBool != rightBool, nil
		case parser.TOKEN_IMPLIES:
			return !leftBool || rightBool, nil
		case parser.TOKEN_EQUIV:
			return leftBool == rightBool, nil
		}
	}

	return nil, &parser.ParseError{
		Message:   fmt.Sprintf("Unknown binary operator: %s", node.Operator),
		Range:     node.GetRange(),
		ErrorType: "semantic",
	}
}

func (e *Evaluator) applyUnaryOperation(node *parser.UnaryOperation, operandVal interface{}) (interface{}, error) {
	switch node.Operator {
	case parser.TOKEN_MINUS:
		if num, ok := ToFloat64(operandVal); ok {
			return -num, nil
		}
		return nil, &parser.ParseError{
			Message:    fmt.Sprintf("Unary minus requires numeric operand, got %T", operandVal),
			Range:      node.Operand.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a numeric expression",
		}
	case parser.TOKEN_PLUS:
		if num, ok := ToFloat64(operandVal); ok {
			return num, nil
		}
		return nil, &parser.ParseError{
			Message:    fmt.Sprintf("Unary plus requires numeric operand, got %T", operandVal),
			Range:      node.Operand.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a numeric expression",
		}
	case parser.TOKEN_NOT:
		if boolean, ok := ToBool(operandVal); ok {
			return !boolean, nil
		}
		return nil, &parser.ParseError{
			Message:    fmt.Sprintf("Logical NOT requires boolean operand, got %T", operandVal),
			Range:      node.Operand.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a boolean expression",
		}
	}

	return nil, &parser.ParseError{
		Message:   fmt.Sprintf("Unknown unary operator: %s", node.Operator),
		Range:     node.GetRange(),
		ErrorType: "semantic",
	}
}

func (e *Evaluator) applyFunction(node *parser.FunctionCall, args []interface{}) (interface{}, error) {
	switch node.Function {
	case parser.TOKEN_ABS:
		if num, ok := ToFloat64(args[0]); ok {
			return math.Abs(num), nil
		}
		return nil, e.functionTypeError(node, 0, "number", args[0])

	case parser.TOKEN_NEGATE:
		if num, ok := ToFloat64(args[0]); ok {
			return -num, nil
		}
		return nil, e.functionTypeError(node, 0, "number", args[0])

	case parser.TOKEN_CEIL:
		if num, ok := ToFloat64(args[0]); ok {
			return math.Ceil(num), nil
		}
		return nil, e.functionTypeError(node, 0, "number", args[0])

	case parser.TOKEN_FLOOR:
		if num, ok := ToFloat64(args[0]); ok {
			return math.Floor(num), nil
		}
		return nil, e.functionTypeError(node, 0, "number", args[0])

	case parser.TOKEN_THRESHOLD:
		num1, ok1 := ToFloat64(args[0])
		num2, ok2 := ToFloat64(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "number", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "number", args[1])
		}
		return num1 >= num2, nil

	case parser.TOKEN_ITE:
		cond, ok := ToBool(args[0])
		if !ok {
			return nil, e.functionTypeError(node, 0, "boolean", args[0])
		}
		if cond {
			return args[1], nil
		}
		return args[2], nil

	case parser.TOKEN_IMPLIES:
		left, ok1 := ToBool(args[0])
		right, ok2 := ToBool(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "boolean", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "boolean", args[1])
		}
		return !left || right, nil

	case parser.TOKEN_EQUIV:
		left, ok1 := ToBool(args[0])
		right, ok2 := ToBool(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "boolean", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "boolean", args[1])
		}
		return left == right, nil

	case parser.TOKEN_XOR:
		left, ok1 := ToBool(args[0])
		right, ok2 := ToBool(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "boolean", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "boolean", args[1])
		}
		return left != right, nil

	case parser.TOKEN_MIN:
		num1, ok1 := ToFloat64(args[0])
		num2, ok2 := ToFloat64(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "number", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "number", args[1])
		}
		return math.Min(num1, num2), nil

	case parser.TOKEN_MAX:
		num1, ok1 := ToFloat64(args[0])
		num2, ok2 := ToFloat64(args[1])
		if !ok1 {
			return nil, e.functionTypeError(node, 0, "number", args[0])
		}
		if !ok2 {
			return nil, e.functionTypeError(node, 1, "number", args[1])
		}
		return math.Max(num1, num2), nil
	}

	return nil, &parser.ParseError{
		Message:   fmt.Sprintf("Unknown function: %s", node.Function),
		Range:     node.GetRange(),
		ErrorType: "semantic",
	}
}

// ===== HELPER METHODS =====

func (e *Evaluator) isArithmeticOp(op parser.TokenType) bool {
	switch op {
	case parser.TOKEN_PLUS, parser.TOKEN_MINUS, parser.TOKEN_MULTIPLY, parser.TOKEN_DIVIDE, parser.TOKEN_MODULO, parser.TOKEN_MIN, parser.TOKEN_MAX:
		return true
	default:
		return false
	}
}

func (e *Evaluator) isComparisonOp(op parser.TokenType) bool {
	switch op {
	case parser.TOKEN_EQ, parser.TOKEN_NE, parser.TOKEN_LT, parser.TOKEN_LE, parser.TOKEN_GT, parser.TOKEN_GE:
		return true
	default:
		return false
	}
}

func (e *Evaluator) isLogicalOp(op parser.TokenType) bool {
	switch op {
	case parser.TOKEN_XOR, parser.TOKEN_IMPLIES, parser.TOKEN_EQUIV:
		return true
	default:
		return false
	}
}

func (e *Evaluator) getBinaryNumericOperands(node *parser.BinaryOperation, left, right interface{}) (float64, float64, error) {
	leftNum, leftOk := ToFloat64(left)
	rightNum, rightOk := ToFloat64(right)

	if !leftOk {
		return 0, 0, &parser.ParseError{
			Message:    fmt.Sprintf("Left operand must be a number for %s, got %T", node.Operator, left),
			Range:      node.Left.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a numeric expression",
		}
	}
	if !rightOk {
		return 0, 0, &parser.ParseError{
			Message:    fmt.Sprintf("Right operand must be a number for %s, got %T", node.Operator, right),
			Range:      node.Right.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a numeric expression",
		}
	}
	return leftNum, rightNum, nil
}

func (e *Evaluator) getBinaryBooleanOperands(node *parser.BinaryOperation, left, right interface{}) (bool, bool, error) {
	leftBool, leftOk := ToBool(left)
	rightBool, rightOk := ToBool(right)

	if !leftOk {
		return false, false, &parser.ParseError{
			Message:    fmt.Sprintf("Left operand must be boolean for %s, got %T", node.Operator, left),
			Range:      node.Left.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a boolean expression",
		}
	}
	if !rightOk {
		return false, false, &parser.ParseError{
			Message:    fmt.Sprintf("Right operand must be boolean for %s, got %T", node.Operator, right),
			Range:      node.Right.GetRange(),
			ErrorType:  "semantic",
			Suggestion: "Use a boolean expression",
		}
	}
	return leftBool, rightBool, nil
}

func (e *Evaluator) functionTypeError(node *parser.FunctionCall, argIndex int, expectedType string, actualValue interface{}) *parser.ParseError {
	argRange := node.GetRange()
	if argIndex < len(node.Args) {
		argRange = node.Args[argIndex].GetRange()
	}

	return &parser.ParseError{
		Message:    fmt.Sprintf("Argument %d of %s must be %s, got %T", argIndex+1, node.Function, expectedType, actualValue),
		Range:      argRange,
		ErrorType:  "semantic",
		Suggestion: fmt.Sprintf("Use a %s expression", expectedType),
	}
}

// ===== TYPE CONVERSION UTILITIES =====

// ToFloat64 converts various Go numeric types to float64
func ToFloat64(value interface{}) (float64, bool) {
	switch v := value.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int8:
		return float64(v), true
	case int16:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case uint:
		return float64(v), true
	case uint8:
		return float64(v), true
	case uint16:
		return float64(v), true
	case uint32:
		return float64(v), true
	case uint64:
		return float64(v), true
	case Value:
		if v.Type == ValueTypeNumber {
			return v.Number, true
		}
		return 0, false
	default:
		return 0, false
	}
}

// ToBool converts various Go boolean types to bool
func ToBool(value interface{}) (bool, bool) {
	switch v := value.(type) {
	case bool:
		return v, true
	case Value:
		if v.Type == ValueTypeBoolean {
			return v.Boolean, true
		}
		return false, false
	default:
		return false, false
	}
}

// NewNumberValue creates a new numeric value
func NewNumberValue(n float64) Value {
	return Value{Type: ValueTypeNumber, Number: n}
}

// NewBooleanValue creates a new boolean value
func NewBooleanValue(b bool) Value {
	return Value{Type: ValueTypeBoolean, Boolean: b}
}

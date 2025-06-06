// Package parser provides expression parsing and AST definitions
// This file contains pure AST node definitions without evaluation logic
package parser

import (
	"fmt"
	"sort"
	"strings"
)

// ===== VISITOR PATTERN INTERFACE =====

// Visitor defines the interface for processing AST nodes
// Each backend (evaluator, MTBDD compiler, etc.) implements this interface
type Visitor interface {
	VisitNumberLiteral(node *NumberLiteral) (interface{}, error)
	VisitBooleanLiteral(node *BooleanLiteral) (interface{}, error)
	VisitIdentifier(node *Identifier) (interface{}, error)
	VisitBinaryOperation(node *BinaryOperation) (interface{}, error)
	VisitUnaryOperation(node *UnaryOperation) (interface{}, error)
	VisitFunctionCall(node *FunctionCall) (interface{}, error)
}

// ===== CORE AST INTERFACE =====

// Expression is the base interface for all AST nodes
// Simplified to focus on structure rather than behavior
type Expression interface {
	// Accept implements the visitor pattern for extensible processing
	Accept(visitor Visitor) (interface{}, error)

	// GetRange returns the source location of this expression
	GetRange() SourceRange

	// String returns a string representation of this expression
	String() string
}

// ===== AST NODE IMPLEMENTATIONS =====

// NumberLiteral represents a numeric constant
type NumberLiteral struct {
	Value float64
	Range SourceRange
}

func (n *NumberLiteral) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitNumberLiteral(n)
}

func (n *NumberLiteral) GetRange() SourceRange {
	return n.Range
}

func (n *NumberLiteral) String() string {
	return fmt.Sprintf("%.6g", n.Value)
}

// BooleanLiteral represents a boolean constant
type BooleanLiteral struct {
	Value bool
	Range SourceRange
}

func (b *BooleanLiteral) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitBooleanLiteral(b)
}

func (b *BooleanLiteral) GetRange() SourceRange {
	return b.Range
}

func (b *BooleanLiteral) String() string {
	return fmt.Sprintf("%t", b.Value)
}

// Identifier represents a variable reference
type Identifier struct {
	Name  string
	Range SourceRange
}

func (i *Identifier) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitIdentifier(i)
}

func (i *Identifier) GetRange() SourceRange {
	return i.Range
}

func (i *Identifier) String() string {
	return i.Name
}

// BinaryOperation represents binary operations like +, -, AND, OR, etc.
type BinaryOperation struct {
	Left     Expression
	Operator TokenType
	Right    Expression
	Range    SourceRange
}

func (b *BinaryOperation) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitBinaryOperation(b)
}

func (b *BinaryOperation) GetRange() SourceRange {
	return b.Range
}

func (b *BinaryOperation) String() string {
	return fmt.Sprintf("(%s %s %s)", b.Left.String(), b.Operator, b.Right.String())
}

// UnaryOperation represents unary operations like -, +, NOT
type UnaryOperation struct {
	Operator TokenType
	Operand  Expression
	Range    SourceRange
}

func (u *UnaryOperation) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitUnaryOperation(u)
}

func (u *UnaryOperation) GetRange() SourceRange {
	return u.Range
}

func (u *UnaryOperation) String() string {
	return fmt.Sprintf("(%s%s)", u.Operator, u.Operand.String())
}

// FunctionCall represents function calls like ABS(x), ITE(cond, then, else)
type FunctionCall struct {
	Function TokenType
	Args     []Expression
	Range    SourceRange
}

func (f *FunctionCall) Accept(visitor Visitor) (interface{}, error) {
	return visitor.VisitFunctionCall(f)
}

func (f *FunctionCall) GetRange() SourceRange {
	return f.Range
}

func (f *FunctionCall) String() string {
	var argStrs []string
	for _, arg := range f.Args {
		argStrs = append(argStrs, arg.String())
	}
	return fmt.Sprintf("%s(%s)", f.Function, strings.Join(argStrs, ", "))
}

// ===== UTILITY FUNCTIONS =====

// CollectVariables extracts all variable names from an expression
func CollectVariables(expr Expression) []string {
	collector := &VariableCollector{variables: make(map[string]bool)}
	expr.Accept(collector)

	result := make([]string, 0, len(collector.variables))
	for name := range collector.variables {
		result = append(result, name)
	}
	sort.Strings(result)
	return result
}

// GetExpressionType determines the expected result type of an expression
func GetExpressionType(expr Expression) ExpressionType {
	analyzer := &TypeAnalyzer{}
	result, _ := expr.Accept(analyzer)
	if exprType, ok := result.(ExpressionType); ok {
		return exprType
	}
	return TYPE_UNKNOWN
}

// ===== INTERNAL VISITORS FOR UTILITIES =====

// VariableCollector implements Visitor to collect all variable names
type VariableCollector struct {
	variables map[string]bool
}

func (v *VariableCollector) VisitNumberLiteral(node *NumberLiteral) (interface{}, error) {
	return nil, nil
}

func (v *VariableCollector) VisitBooleanLiteral(node *BooleanLiteral) (interface{}, error) {
	return nil, nil
}

func (v *VariableCollector) VisitIdentifier(node *Identifier) (interface{}, error) {
	v.variables[node.Name] = true
	return nil, nil
}

func (v *VariableCollector) VisitBinaryOperation(node *BinaryOperation) (interface{}, error) {
	node.Left.Accept(v)
	node.Right.Accept(v)
	return nil, nil
}

func (v *VariableCollector) VisitUnaryOperation(node *UnaryOperation) (interface{}, error) {
	node.Operand.Accept(v)
	return nil, nil
}

func (v *VariableCollector) VisitFunctionCall(node *FunctionCall) (interface{}, error) {
	for _, arg := range node.Args {
		arg.Accept(v)
	}
	return nil, nil
}

// TypeAnalyzer implements Visitor to determine expression types
type TypeAnalyzer struct{}

func (t *TypeAnalyzer) VisitNumberLiteral(node *NumberLiteral) (interface{}, error) {
	return TYPE_NUMBER, nil
}

func (t *TypeAnalyzer) VisitBooleanLiteral(node *BooleanLiteral) (interface{}, error) {
	return TYPE_BOOLEAN, nil
}

func (t *TypeAnalyzer) VisitIdentifier(node *Identifier) (interface{}, error) {
	return TYPE_UNKNOWN, nil // Type depends on runtime value
}

func (t *TypeAnalyzer) VisitBinaryOperation(node *BinaryOperation) (interface{}, error) {
	switch node.Operator {
	case TOKEN_PLUS, TOKEN_MINUS, TOKEN_MULTIPLY, TOKEN_DIVIDE, TOKEN_MODULO, TOKEN_MIN, TOKEN_MAX:
		return TYPE_NUMBER, nil
	case TOKEN_EQ, TOKEN_NE, TOKEN_LT, TOKEN_LE, TOKEN_GT, TOKEN_GE, TOKEN_AND, TOKEN_OR:
		return TYPE_BOOLEAN, nil
	default:
		return TYPE_UNKNOWN, nil
	}
}

func (t *TypeAnalyzer) VisitUnaryOperation(node *UnaryOperation) (interface{}, error) {
	switch node.Operator {
	case TOKEN_MINUS, TOKEN_PLUS:
		return TYPE_NUMBER, nil
	case TOKEN_NOT:
		return TYPE_BOOLEAN, nil
	default:
		return TYPE_UNKNOWN, nil
	}
}

func (t *TypeAnalyzer) VisitFunctionCall(node *FunctionCall) (interface{}, error) {
	switch node.Function {
	case TOKEN_ABS, TOKEN_NEGATE, TOKEN_CEIL, TOKEN_FLOOR, TOKEN_MIN, TOKEN_MAX:
		return TYPE_NUMBER, nil
	case TOKEN_THRESHOLD, TOKEN_IMPLIES, TOKEN_EQUIV, TOKEN_XOR:
		return TYPE_BOOLEAN, nil
	case TOKEN_ITE:
		return TYPE_UNKNOWN, nil // Depends on then/else branches
	default:
		return TYPE_UNKNOWN, nil
	}
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====

// GetExpressionVariables is a convenience function that matches the old API
func GetExpressionVariables(input string) ([]string, error) {
	ast, err := ParseExpression(input)
	if err != nil {
		return nil, err
	}
	return CollectVariables(ast), nil
}

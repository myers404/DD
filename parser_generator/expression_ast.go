package parser_generator

import (
	"fmt"
	"strconv"
	"strings"
)

// ===== EXPRESSION LANGUAGE AST DEFINITIONS =====

// ExprNode represents nodes in the expression AST
type ExprNode interface {
	String() string
	Accept(visitor ExprVisitor) interface{}
	GetType() ExprType
}

// ExprType represents expression types
type ExprType int

const (
	TypeNumber ExprType = iota
	TypeBoolean
	TypeString
	TypeUnknown
)

func (t ExprType) String() string {
	switch t {
	case TypeNumber:
		return "number"
	case TypeBoolean:
		return "boolean"
	case TypeString:
		return "string"
	default:
		return "unknown"
	}
}

// ExprVisitor defines the visitor pattern for expression AST
type ExprVisitor interface {
	VisitNumber(*NumberExpr) interface{}
	VisitBoolean(*BooleanExpr) interface{}
	VisitString(*StringExpr) interface{}
	VisitIdentifier(*IdentifierExpr) interface{}
	VisitBinary(*BinaryExpr) interface{}
	VisitUnary(*UnaryExpr) interface{}
	VisitCall(*CallExpr) interface{}
	VisitConditional(*ConditionalExpr) interface{}
}

// ===== CONCRETE AST NODE TYPES =====

// NumberExpr represents numeric literals
type NumberExpr struct {
	Value float64
	Pos   int
}

func (n *NumberExpr) String() string {
	if n.Value == float64(int64(n.Value)) {
		return fmt.Sprintf("%.0f", n.Value)
	}
	return fmt.Sprintf("%g", n.Value)
}

func (n *NumberExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitNumber(n)
}

func (n *NumberExpr) GetType() ExprType {
	return TypeNumber
}

// BooleanExpr represents boolean literals
type BooleanExpr struct {
	Value bool
	Pos   int
}

func (b *BooleanExpr) String() string {
	return strconv.FormatBool(b.Value)
}

func (b *BooleanExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitBoolean(b)
}

func (b *BooleanExpr) GetType() ExprType {
	return TypeBoolean
}

// StringExpr represents string literals
type StringExpr struct {
	Value string
	Pos   int
}

func (s *StringExpr) String() string {
	return fmt.Sprintf(`"%s"`, s.Value)
}

func (s *StringExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitString(s)
}

func (s *StringExpr) GetType() ExprType {
	return TypeString
}

// IdentifierExpr represents variable references
type IdentifierExpr struct {
	Name string
	Pos  int
}

func (i *IdentifierExpr) String() string {
	return i.Name
}

func (i *IdentifierExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitIdentifier(i)
}

func (i *IdentifierExpr) GetType() ExprType {
	return TypeUnknown // Type depends on context
}

// BinaryExpr represents binary operations
type BinaryExpr struct {
	Left     ExprNode
	Operator string
	Right    ExprNode
	Pos      int
}

func (b *BinaryExpr) String() string {
	return fmt.Sprintf("(%s %s %s)", b.Left.String(), b.Operator, b.Right.String())
}

func (b *BinaryExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitBinary(b)
}

func (b *BinaryExpr) GetType() ExprType {
	switch b.Operator {
	case "+", "-", "*", "/", "%":
		return TypeNumber
	case "==", "!=", "<", "<=", ">", ">=", "&&", "||":
		return TypeBoolean
	default:
		return TypeUnknown
	}
}

// UnaryExpr represents unary operations
type UnaryExpr struct {
	Operator string
	Operand  ExprNode
	Pos      int
}

func (u *UnaryExpr) String() string {
	return fmt.Sprintf("(%s%s)", u.Operator, u.Operand.String())
}

func (u *UnaryExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitUnary(u)
}

func (u *UnaryExpr) GetType() ExprType {
	switch u.Operator {
	case "-", "+":
		return TypeNumber
	case "!":
		return TypeBoolean
	default:
		return TypeUnknown
	}
}

// CallExpr represents function calls
type CallExpr struct {
	Function string
	Args     []ExprNode
	Pos      int
}

func (c *CallExpr) String() string {
	var args []string
	for _, arg := range c.Args {
		args = append(args, arg.String())
	}
	return fmt.Sprintf("%s(%s)", c.Function, strings.Join(args, ", "))
}

func (c *CallExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitCall(c)
}

func (c *CallExpr) GetType() ExprType {
	// Function return types - could be extended with a type system
	switch c.Function {
	case "abs", "ceil", "floor", "min", "max", "sqrt":
		return TypeNumber
	case "not", "and", "or":
		return TypeBoolean
	default:
		return TypeUnknown
	}
}

// ConditionalExpr represents ternary conditional expressions (if-then-else)
type ConditionalExpr struct {
	Condition ExprNode
	ThenExpr  ExprNode
	ElseExpr  ExprNode
	Pos       int
}

func (c *ConditionalExpr) String() string {
	return fmt.Sprintf("(%s ? %s : %s)",
		c.Condition.String(), c.ThenExpr.String(), c.ElseExpr.String())
}

func (c *ConditionalExpr) Accept(visitor ExprVisitor) interface{} {
	return visitor.VisitConditional(c)
}

func (c *ConditionalExpr) GetType() ExprType {
	// Type is the common type of then and else branches
	thenType := c.ThenExpr.GetType()
	elseType := c.ElseExpr.GetType()

	if thenType == elseType {
		return thenType
	}
	return TypeUnknown
}

// ===== UTILITY FUNCTIONS =====

// CollectVariables extracts all variable names from an expression
func CollectVariables(expr ExprNode) []string {
	collector := &VariableCollector{
		variables: make(map[string]bool),
	}
	expr.Accept(collector)

	var result []string
	for name := range collector.variables {
		result = append(result, name)
	}
	return result
}

// VariableCollector implements ExprVisitor to collect variable names
type VariableCollector struct {
	variables map[string]bool
}

func (v *VariableCollector) VisitNumber(*NumberExpr) interface{} {
	return nil
}

func (v *VariableCollector) VisitBoolean(*BooleanExpr) interface{} {
	return nil
}

func (v *VariableCollector) VisitString(*StringExpr) interface{} {
	return nil
}

func (v *VariableCollector) VisitIdentifier(expr *IdentifierExpr) interface{} {
	v.variables[expr.Name] = true
	return nil
}

func (v *VariableCollector) VisitBinary(expr *BinaryExpr) interface{} {
	expr.Left.Accept(v)
	expr.Right.Accept(v)
	return nil
}

func (v *VariableCollector) VisitUnary(expr *UnaryExpr) interface{} {
	expr.Operand.Accept(v)
	return nil
}

func (v *VariableCollector) VisitCall(expr *CallExpr) interface{} {
	for _, arg := range expr.Args {
		arg.Accept(v)
	}
	return nil
}

func (v *VariableCollector) VisitConditional(expr *ConditionalExpr) interface{} {
	expr.Condition.Accept(v)
	expr.ThenExpr.Accept(v)
	expr.ElseExpr.Accept(v)
	return nil
}

// ValidateTypes performs basic type checking on expressions
func ValidateTypes(expr ExprNode) error {
	validator := &TypeValidator{}
	result := expr.Accept(validator)
	if err, ok := result.(error); ok {
		return err
	}
	return nil
}

// TypeValidator implements ExprVisitor for type checking
type TypeValidator struct{}

func (t *TypeValidator) VisitNumber(*NumberExpr) interface{} {
	return nil
}

func (t *TypeValidator) VisitBoolean(*BooleanExpr) interface{} {
	return nil
}

func (t *TypeValidator) VisitString(*StringExpr) interface{} {
	return nil
}

func (t *TypeValidator) VisitIdentifier(*IdentifierExpr) interface{} {
	return nil
}

func (t *TypeValidator) VisitBinary(expr *BinaryExpr) interface{} {
	if err := ValidateTypes(expr.Left); err != nil {
		return err
	}
	if err := ValidateTypes(expr.Right); err != nil {
		return err
	}

	leftType := expr.Left.GetType()
	rightType := expr.Right.GetType()

	switch expr.Operator {
	case "+", "-", "*", "/", "%":
		if leftType != TypeUnknown && leftType != TypeNumber {
			return fmt.Errorf("arithmetic operator %s requires numeric operands", expr.Operator)
		}
		if rightType != TypeUnknown && rightType != TypeNumber {
			return fmt.Errorf("arithmetic operator %s requires numeric operands", expr.Operator)
		}
	case "&&", "||":
		if leftType != TypeUnknown && leftType != TypeBoolean {
			return fmt.Errorf("logical operator %s requires boolean operands", expr.Operator)
		}
		if rightType != TypeUnknown && rightType != TypeBoolean {
			return fmt.Errorf("logical operator %s requires boolean operands", expr.Operator)
		}
	}

	return nil
}

func (t *TypeValidator) VisitUnary(expr *UnaryExpr) interface{} {
	if err := ValidateTypes(expr.Operand); err != nil {
		return err
	}

	operandType := expr.Operand.GetType()

	switch expr.Operator {
	case "-", "+":
		if operandType != TypeUnknown && operandType != TypeNumber {
			return fmt.Errorf("unary operator %s requires numeric operand", expr.Operator)
		}
	case "!":
		if operandType != TypeUnknown && operandType != TypeBoolean {
			return fmt.Errorf("unary operator %s requires boolean operand", expr.Operator)
		}
	}

	return nil
}

func (t *TypeValidator) VisitCall(expr *CallExpr) interface{} {
	for _, arg := range expr.Args {
		if err := ValidateTypes(arg); err != nil {
			return err
		}
	}

	// Validate function-specific argument types
	switch expr.Function {
	case "abs", "ceil", "floor", "sqrt":
		if len(expr.Args) != 1 {
			return fmt.Errorf("function %s expects 1 argument", expr.Function)
		}
		argType := expr.Args[0].GetType()
		if argType != TypeUnknown && argType != TypeNumber {
			return fmt.Errorf("function %s requires numeric argument", expr.Function)
		}
	case "min", "max":
		if len(expr.Args) != 2 {
			return fmt.Errorf("function %s expects 2 arguments", expr.Function)
		}
		for i, arg := range expr.Args {
			argType := arg.GetType()
			if argType != TypeUnknown && argType != TypeNumber {
				return fmt.Errorf("function %s argument %d must be numeric", expr.Function, i+1)
			}
		}
	}

	return nil
}

func (t *TypeValidator) VisitConditional(expr *ConditionalExpr) interface{} {
	if err := ValidateTypes(expr.Condition); err != nil {
		return err
	}
	if err := ValidateTypes(expr.ThenExpr); err != nil {
		return err
	}
	if err := ValidateTypes(expr.ElseExpr); err != nil {
		return err
	}

	condType := expr.Condition.GetType()
	if condType != TypeUnknown && condType != TypeBoolean {
		return fmt.Errorf("conditional expression requires boolean condition")
	}

	return nil
}

// PrettyPrint formats an expression for readable output
func PrettyPrint(expr ExprNode) string {
	printer := &PrettyPrinter{indent: 0}
	result := expr.Accept(printer)
	return result.(string)
}

// PrettyPrinter implements ExprVisitor for formatted output
type PrettyPrinter struct {
	indent int
}

func (p *PrettyPrinter) VisitNumber(expr *NumberExpr) interface{} {
	return expr.String()
}

func (p *PrettyPrinter) VisitBoolean(expr *BooleanExpr) interface{} {
	return expr.String()
}

func (p *PrettyPrinter) VisitString(expr *StringExpr) interface{} {
	return expr.String()
}

func (p *PrettyPrinter) VisitIdentifier(expr *IdentifierExpr) interface{} {
	return expr.Name
}

func (p *PrettyPrinter) VisitBinary(expr *BinaryExpr) interface{} {
	left := expr.Left.Accept(p).(string)
	right := expr.Right.Accept(p).(string)
	return fmt.Sprintf("(%s %s %s)", left, expr.Operator, right)
}

func (p *PrettyPrinter) VisitUnary(expr *UnaryExpr) interface{} {
	operand := expr.Operand.Accept(p).(string)
	return fmt.Sprintf("%s%s", expr.Operator, operand)
}

func (p *PrettyPrinter) VisitCall(expr *CallExpr) interface{} {
	var args []string
	for _, arg := range expr.Args {
		args = append(args, arg.Accept(p).(string))
	}
	return fmt.Sprintf("%s(%s)", expr.Function, strings.Join(args, ", "))
}

func (p *PrettyPrinter) VisitConditional(expr *ConditionalExpr) interface{} {
	condition := expr.Condition.Accept(p).(string)
	thenExpr := expr.ThenExpr.Accept(p).(string)
	elseExpr := expr.ElseExpr.Accept(p).(string)
	return fmt.Sprintf("if %s then %s else %s", condition, thenExpr, elseExpr)
}

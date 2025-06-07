// Package mtbdd provides MTBDD compilation functionality for parsed expressions
// This package implements the visitor pattern to compile expressions to MTBDD operations
package mtbdd

import (
	"DD/parser" // Replace with your actual module path
	"fmt"
	"sort"
)

// ===== COMPILER CONTEXT =====

// CompilerContext manages MTBDD compilation state and caching
type CompilerContext interface {
	// Core MTBDD access
	MTBDD() *MTBDD

	// Variable management
	DeclareVariable(name string) error
	GetVariable(name string) (NodeRef, error)
	AutoDeclareVariables(names []string) error
	GetDeclaredVariables() []string

	// Constants
	CreateConstant(value interface{}) NodeRef

	// Error handling with source context
	WrapError(err error, expr parser.Expression) error

	// Caching
	GetCached(expr parser.Expression) (NodeRef, bool)
	SetCached(expr parser.Expression, ref NodeRef)
	ClearCache()
}

// StandardCompilerContext provides a complete implementation of CompilerContext
type StandardCompilerContext struct {
	mtbdd         *MTBDD
	declaredVars  map[string]NodeRef
	cache         map[string]NodeRef
	enableCaching bool
}

// NewCompilerContext creates a new MTBDD compiler context
func NewCompilerContext(mtbdd *MTBDD) *StandardCompilerContext {
	return &StandardCompilerContext{
		mtbdd:         mtbdd,
		declaredVars:  make(map[string]NodeRef),
		cache:         make(map[string]NodeRef),
		enableCaching: true,
	}
}

func (ctx *StandardCompilerContext) MTBDD() *MTBDD {
	return ctx.mtbdd
}

func (ctx *StandardCompilerContext) DeclareVariable(name string) error {
	if _, exists := ctx.declaredVars[name]; exists {
		return nil // Already declared
	}

	ctx.mtbdd.Declare(name)
	varRef, err := ctx.mtbdd.Var(name)
	if err != nil {
		return fmt.Errorf("failed to get variable '%s': %w", name, err)
	}

	ctx.declaredVars[name] = varRef
	return nil
}

func (ctx *StandardCompilerContext) GetVariable(name string) (NodeRef, error) {
	if varRef, exists := ctx.declaredVars[name]; exists {
		return varRef, nil
	}
	return NullRef, fmt.Errorf("variable '%s' not declared", name)
}

func (ctx *StandardCompilerContext) AutoDeclareVariables(names []string) error {
	for _, name := range names {
		if err := ctx.DeclareVariable(name); err != nil {
			return err
		}
	}
	return nil
}

func (ctx *StandardCompilerContext) GetDeclaredVariables() []string {
	vars := make([]string, 0, len(ctx.declaredVars))
	for name := range ctx.declaredVars {
		vars = append(vars, name)
	}
	sort.Strings(vars)
	return vars
}

func (ctx *StandardCompilerContext) CreateConstant(value interface{}) NodeRef {
	return ctx.mtbdd.Constant(value)
}

func (ctx *StandardCompilerContext) WrapError(err error, expr parser.Expression) error {
	return &parser.ParseError{
		Message:    fmt.Sprintf("MTBDD compilation error: %v", err),
		Range:      expr.GetRange(),
		ErrorType:  "mtbdd",
		Suggestion: "Check expression compatibility with MTBDD operations",
	}
}

func (ctx *StandardCompilerContext) GetCached(expr parser.Expression) (NodeRef, bool) {
	if !ctx.enableCaching {
		return NullRef, false
	}
	key := expr.String()
	ref, exists := ctx.cache[key]
	return ref, exists
}

func (ctx *StandardCompilerContext) SetCached(expr parser.Expression, ref NodeRef) {
	if ctx.enableCaching {
		ctx.cache[expr.String()] = ref
	}
}

func (ctx *StandardCompilerContext) ClearCache() {
	ctx.cache = make(map[string]NodeRef)
}

// ===== MTBDD COMPILER IMPLEMENTATION =====

// MTBDDCompiler implements the visitor pattern for MTBDD compilation
type MTBDDCompiler struct {
	context CompilerContext
}

// NewMTBDDCompiler creates a new MTBDD compiler
func NewMTBDDCompiler(context CompilerContext) *MTBDDCompiler {
	return &MTBDDCompiler{context: context}
}

// ===== PUBLIC API =====

// Compile is the main entry point for compiling expressions to MTBDD
func Compile(expr parser.Expression, mtbdd *MTBDD) (NodeRef, CompilerContext, error) {
	context := NewCompilerContext(mtbdd)

	// Auto-declare all variables found in the expression
	variables := parser.CollectVariables(expr)
	if err := context.AutoDeclareVariables(variables); err != nil {
		return NullRef, nil, fmt.Errorf("failed to declare variables: %w", err)
	}

	// Compile the expression
	compiler := NewMTBDDCompiler(context)
	result, err := expr.Accept(compiler)
	if err != nil {
		return NullRef, nil, fmt.Errorf("compilation failed: %w", err)
	}

	nodeRef, ok := result.(NodeRef)
	if !ok {
		return NullRef, nil, fmt.Errorf("compilation returned unexpected type: %T", result)
	}

	return nodeRef, context, nil
}

// CompileWithContext compiles using an existing context (for reuse)
func CompileWithContext(expr parser.Expression, context CompilerContext) (NodeRef, error) {
	// Auto-declare any new variables
	variables := parser.CollectVariables(expr)
	if err := context.AutoDeclareVariables(variables); err != nil {
		return NullRef, fmt.Errorf("failed to declare variables: %w", err)
	}

	compiler := NewMTBDDCompiler(context)
	result, err := expr.Accept(compiler)
	if err != nil {
		return NullRef, err
	}

	nodeRef, ok := result.(NodeRef)
	if !ok {
		return NullRef, fmt.Errorf("compilation returned unexpected type: %T", result)
	}

	return nodeRef, nil
}

// CompileMultipleExpressions compiles multiple expressions sharing the same variable space
func CompileMultipleExpressions(expressions []parser.Expression, mtbdd *MTBDD) ([]NodeRef, CompilerContext, error) {
	context := NewCompilerContext(mtbdd)

	// Collect all variables from all expressions
	allVariables := make(map[string]bool)
	for _, expr := range expressions {
		for _, variable := range parser.CollectVariables(expr) {
			allVariables[variable] = true
		}
	}

	// Declare all variables
	variables := make([]string, 0, len(allVariables))
	for variable := range allVariables {
		variables = append(variables, variable)
	}
	if err := context.AutoDeclareVariables(variables); err != nil {
		return nil, nil, fmt.Errorf("failed to declare variables: %w", err)
	}

	// Compile all expressions
	compiler := NewMTBDDCompiler(context)
	results := make([]NodeRef, len(expressions))
	for i, expr := range expressions {
		result, err := expr.Accept(compiler)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to compile expression %d: %w", i, err)
		}
		nodeRef, ok := result.(NodeRef)
		if !ok {
			return nil, nil, fmt.Errorf("compilation %d returned unexpected type: %T", i, result)
		}
		results[i] = nodeRef
	}

	return results, context, nil
}

// ParseAndCompile combines parsing and compilation in one step
func ParseAndCompile(input string, mtbdd *MTBDD) (NodeRef, CompilerContext, error) {
	// Parse expression using your existing parser
	expr, err := parser.ParseExpression(input)
	if err != nil {
		return NullRef, nil, fmt.Errorf("parse error: %w", err)
	}

	// Compile to MTBDD
	return Compile(expr, mtbdd)
}

// ===== VISITOR IMPLEMENTATION =====

func (c *MTBDDCompiler) VisitNumberLiteral(node *parser.NumberLiteral) (interface{}, error) {
	return c.context.CreateConstant(node.Value), nil
}

func (c *MTBDDCompiler) VisitBooleanLiteral(node *parser.BooleanLiteral) (interface{}, error) {
	return c.context.CreateConstant(node.Value), nil
}

func (c *MTBDDCompiler) VisitIdentifier(node *parser.Identifier) (interface{}, error) {
	return c.context.GetVariable(node.Name)
}

func (c *MTBDDCompiler) VisitBinaryOperation(node *parser.BinaryOperation) (interface{}, error) {
	// Check cache first
	if cached, found := c.context.GetCached(node); found {
		return cached, nil
	}

	// Compile operands
	leftResult, err := node.Left.Accept(c)
	if err != nil {
		return NullRef, c.context.WrapError(err, node.Left)
	}
	leftRef, ok := leftResult.(NodeRef)
	if !ok {
		return NullRef, c.context.WrapError(fmt.Errorf("left operand compilation failed"), node.Left)
	}

	rightResult, err := node.Right.Accept(c)
	if err != nil {
		return NullRef, c.context.WrapError(err, node.Right)
	}
	rightRef, ok := rightResult.(NodeRef)
	if !ok {
		return NullRef, c.context.WrapError(fmt.Errorf("right operand compilation failed"), node.Right)
	}

	// Apply operation
	var result NodeRef
	mtbdd := c.context.MTBDD()

	switch node.Operator {
	case parser.TOKEN_PLUS:
		result = mtbdd.Add(leftRef, rightRef)
	case parser.TOKEN_MINUS:
		result = mtbdd.Subtract(leftRef, rightRef)
	case parser.TOKEN_MULTIPLY:
		result = mtbdd.Multiply(leftRef, rightRef)
	case parser.TOKEN_DIVIDE:
		return NullRef, c.context.WrapError(fmt.Errorf("division not supported in MTBDD compilation"), node)
	case parser.TOKEN_MODULO:
		return NullRef, c.context.WrapError(fmt.Errorf("modulo not supported in MTBDD compilation"), node)
	case parser.TOKEN_MIN:
		result = mtbdd.Min(leftRef, rightRef)
	case parser.TOKEN_MAX:
		result = mtbdd.Max(leftRef, rightRef)
	case parser.TOKEN_EQ:
		result = mtbdd.Equal(leftRef, rightRef)
	case parser.TOKEN_NE:
		equal := mtbdd.Equal(leftRef, rightRef)
		result = mtbdd.NOT(equal)
	case parser.TOKEN_LT:
		result = mtbdd.LessThan(leftRef, rightRef)
	case parser.TOKEN_LE:
		result = mtbdd.LessThanOrEqual(leftRef, rightRef)
	case parser.TOKEN_GT:
		result = mtbdd.GreaterThan(leftRef, rightRef)
	case parser.TOKEN_GE:
		result = mtbdd.GreaterThanOrEqual(leftRef, rightRef)
	case parser.TOKEN_AND:
		result = mtbdd.AND(leftRef, rightRef)
	case parser.TOKEN_OR:
		result = mtbdd.OR(leftRef, rightRef)
	case parser.TOKEN_XOR:
		result = mtbdd.XOR(leftRef, rightRef)
	case parser.TOKEN_IMPLIES, parser.TOKEN_IMPLIES_OP:
		result = mtbdd.IMPLIES(leftRef, rightRef)
	case parser.TOKEN_EQUIV, parser.TOKEN_EQUIV_OP:
		result = mtbdd.EQUIV(leftRef, rightRef)
	default:
		return NullRef, c.context.WrapError(fmt.Errorf("unsupported binary operator: %s", node.Operator), node)
	}

	// Cache result
	c.context.SetCached(node, result)
	return result, nil
}

func (c *MTBDDCompiler) VisitUnaryOperation(node *parser.UnaryOperation) (interface{}, error) {
	if cached, found := c.context.GetCached(node); found {
		return cached, nil
	}

	operandResult, err := node.Operand.Accept(c)
	if err != nil {
		return NullRef, c.context.WrapError(err, node.Operand)
	}
	operandRef, ok := operandResult.(NodeRef)
	if !ok {
		return NullRef, c.context.WrapError(fmt.Errorf("operand compilation failed"), node.Operand)
	}

	var result NodeRef
	mtbdd := c.context.MTBDD()

	switch node.Operator {
	case parser.TOKEN_NOT:
		result = mtbdd.NOT(operandRef)
	case parser.TOKEN_MINUS:
		result = mtbdd.Negate(operandRef)
	case parser.TOKEN_PLUS:
		// Unary plus is no-op
		result = operandRef
	default:
		return NullRef, c.context.WrapError(fmt.Errorf("unsupported unary operator: %s", node.Operator), node)
	}

	c.context.SetCached(node, result)
	return result, nil
}

func (c *MTBDDCompiler) VisitFunctionCall(node *parser.FunctionCall) (interface{}, error) {
	if cached, found := c.context.GetCached(node); found {
		return cached, nil
	}

	mtbdd := c.context.MTBDD()

	switch node.Function {
	case parser.TOKEN_ABS:
		if len(node.Args) != 1 {
			return NullRef, c.context.WrapError(fmt.Errorf("ABS requires exactly 1 argument"), node)
		}
		argResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		argRef, ok := argResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("argument compilation failed"), node.Args[0])
		}
		result := mtbdd.Abs(argRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_NEGATE:
		if len(node.Args) != 1 {
			return NullRef, c.context.WrapError(fmt.Errorf("NEGATE requires exactly 1 argument"), node)
		}
		argResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		argRef, ok := argResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("argument compilation failed"), node.Args[0])
		}
		result := mtbdd.Negate(argRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_CEIL:
		if len(node.Args) != 1 {
			return NullRef, c.context.WrapError(fmt.Errorf("CEIL requires exactly 1 argument"), node)
		}
		argResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		argRef, ok := argResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("argument compilation failed"), node.Args[0])
		}
		result := mtbdd.Ceil(argRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_FLOOR:
		if len(node.Args) != 1 {
			return NullRef, c.context.WrapError(fmt.Errorf("FLOOR requires exactly 1 argument"), node)
		}
		argResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		argRef, ok := argResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("argument compilation failed"), node.Args[0])
		}
		result := mtbdd.Floor(argRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_THRESHOLD:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("THRESHOLD requires exactly 2 arguments"), node)
		}

		exprResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		exprRef, ok := exprResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		// Second argument should be a constant - extract its value
		var thresholdValue interface{}
		if numLit, ok := node.Args[1].(*parser.NumberLiteral); ok {
			thresholdValue = numLit.Value
		} else if boolLit, ok := node.Args[1].(*parser.BooleanLiteral); ok {
			thresholdValue = boolLit.Value
		} else {
			return NullRef, c.context.WrapError(fmt.Errorf("THRESHOLD second argument must be a constant"), node)
		}

		result := mtbdd.Threshold(exprRef, thresholdValue)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_ITE:
		if len(node.Args) != 3 {
			return NullRef, c.context.WrapError(fmt.Errorf("ITE requires exactly 3 arguments"), node)
		}

		condResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		condRef, ok := condResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("condition compilation failed"), node.Args[0])
		}

		thenResult, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		thenRef, ok := thenResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("then branch compilation failed"), node.Args[1])
		}

		elseResult, err := node.Args[2].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[2])
		}
		elseRef, ok := elseResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("else branch compilation failed"), node.Args[2])
		}

		result := mtbdd.ITE(condRef, thenRef, elseRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_IMPLIES, parser.TOKEN_IMPLIES_OP:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("IMPLIES requires exactly 2 arguments"), node)
		}

		leftResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		leftRef, ok := leftResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		rightResult, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		rightRef, ok := rightResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("second argument compilation failed"), node.Args[1])
		}

		result := mtbdd.IMPLIES(leftRef, rightRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_EQUIV, parser.TOKEN_EQUIV_OP:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("EQUIV requires exactly 2 arguments"), node)
		}

		leftResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		leftRef, ok := leftResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		rightResult, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		rightRef, ok := rightResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("second argument compilation failed"), node.Args[1])
		}

		result := mtbdd.EQUIV(leftRef, rightRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_XOR:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("XOR requires exactly 2 arguments"), node)
		}

		leftResult, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		leftRef, ok := leftResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		rightResult, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		rightRef, ok := rightResult.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("second argument compilation failed"), node.Args[1])
		}

		result := mtbdd.XOR(leftRef, rightRef)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_MIN:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("MIN requires exactly 2 arguments"), node)
		}

		arg1Result, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		arg1Ref, ok := arg1Result.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		arg2Result, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		arg2Ref, ok := arg2Result.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("second argument compilation failed"), node.Args[1])
		}

		result := mtbdd.Min(arg1Ref, arg2Ref)
		c.context.SetCached(node, result)
		return result, nil

	case parser.TOKEN_MAX:
		if len(node.Args) != 2 {
			return NullRef, c.context.WrapError(fmt.Errorf("MAX requires exactly 2 arguments"), node)
		}

		arg1Result, err := node.Args[0].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[0])
		}
		arg1Ref, ok := arg1Result.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("first argument compilation failed"), node.Args[0])
		}

		arg2Result, err := node.Args[1].Accept(c)
		if err != nil {
			return NullRef, c.context.WrapError(err, node.Args[1])
		}
		arg2Ref, ok := arg2Result.(NodeRef)
		if !ok {
			return NullRef, c.context.WrapError(fmt.Errorf("second argument compilation failed"), node.Args[1])
		}

		result := mtbdd.Max(arg1Ref, arg2Ref)
		c.context.SetCached(node, result)
		return result, nil

	default:
		return NullRef, c.context.WrapError(fmt.Errorf("unsupported function: %s", node.Function), node)
	}
}

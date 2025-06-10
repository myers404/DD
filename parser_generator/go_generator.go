package parser_generator

import (
	"fmt"
	"sort"
	"strings"
)

// GoGenerator generates high-quality Go parser code
type GoGenerator struct {
	config *Config
}

// NewGoGenerator creates a new Go generator
func NewGoGenerator(config *Config) *GoGenerator {
	return &GoGenerator{config: config}
}

// Generate creates complete Go parser code from grammar
// In your go_generator.go Generate method, make sure you have this sequence:

// You'll also need to update your Generate method to call these correctly:
func (g *GoGenerator) Generate(grammar *Grammar) (string, error) {
	var buf strings.Builder

	// Package declaration and imports
	g.generatePackageAndImports(&buf)

	// Core types and error handling
	g.generateCoreTypes(&buf)

	// Token definitions
	g.generateTokenDefinitions(&buf, grammar)

	// Visitor pattern interface
	g.generateVisitorInterface(&buf)

	// Expression interface
	g.generateExpressionInterface(&buf)

	// AST node definitions
	g.generateASTNodeDefinitions(&buf, grammar)

	// Lexer implementation
	g.generateLexerImplementation(&buf, grammar)

	// Parser implementation
	g.generateParserImplementation(&buf, grammar)

	// Utility functions
	g.generateUtilityFunctions(&buf)

	// Public API functions
	g.generatePublicAPIFunctions(&buf)

	return buf.String(), nil
}

// Add these missing methods to your go_generator.go file:

func (g *GoGenerator) generateExpressionInterface(buf *strings.Builder) {
	buf.WriteString(`// ===== CORE AST INTERFACE =====

// Expression is the base interface for all AST nodes
type Expression interface {
	Accept(visitor Visitor) (interface{}, error)
	GetRange() SourceRange
	String() string
}

`)
}

func (g *GoGenerator) generateASTNodeDefinitions(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// ===== AST NODE IMPLEMENTATIONS =====

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

`)
}

func (g *GoGenerator) generateVisitorInterface(buf *strings.Builder) {
	buf.WriteString(`// ===== VISITOR PATTERN INTERFACE =====

// Visitor defines the interface for processing AST nodes
type Visitor interface {
	VisitNumberLiteral(node *NumberLiteral) (interface{}, error)
	VisitBooleanLiteral(node *BooleanLiteral) (interface{}, error)
	VisitIdentifier(node *Identifier) (interface{}, error)
	VisitBinaryOperation(node *BinaryOperation) (interface{}, error)
	VisitUnaryOperation(node *UnaryOperation) (interface{}, error)
	VisitFunctionCall(node *FunctionCall) (interface{}, error)
}

`)
}

func (g *GoGenerator) generateUtilityFunctions(buf *strings.Builder) {
	buf.WriteString(`// ===== UTILITY FUNCTIONS =====

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
	case TOKEN_PLUS, TOKEN_MINUS, TOKEN_MULTIPLY, TOKEN_DIVIDE, TOKEN_MODULO:
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
	case TOKEN_ABS, TOKEN_NEGATE, TOKEN_CEIL, TOKEN_FLOOR:
		return TYPE_NUMBER, nil
	case TOKEN_THRESHOLD, TOKEN_IMPLIES, TOKEN_EQUIV, TOKEN_XOR:
		return TYPE_BOOLEAN, nil
	case TOKEN_ITE:
		return TYPE_UNKNOWN, nil // Depends on then/else branches
	default:
		return TYPE_UNKNOWN, nil
	}
}

`)
}

func (g *GoGenerator) generatePublicAPIFunctions(buf *strings.Builder) {
	buf.WriteString(`// ===== PUBLIC API =====

// ParseExpression is the main entry point for parsing expressions
func ParseExpression(input string) (Expression, error) {
	parser := NewParser(input)
	return parser.Parse()
}

// FormatError formats a ParseError for user-friendly display
func FormatError(err error) string {
	if parseErr, ok := err.(*ParseError); ok {
		return parseErr.ShowError()
	}
	return err.Error()
}

// ValidateExpression validates an expression without evaluating it
func ValidateExpression(input string) error {
	_, err := ParseExpression(input)
	return err
}

// GetExpressionVariables is a convenience function that matches the old API
func GetExpressionVariables(input string) ([]string, error) {
	ast, err := ParseExpression(input)
	if err != nil {
		return nil, err
	}
	return CollectVariables(ast), nil
}
`)
}

func (g *GoGenerator) generatePackageAndImports(buf *strings.Builder) {
	buf.WriteString(fmt.Sprintf(`// Package %s provides expression parsing functionality
// Generated by parser_generator - DO NOT EDIT
package %s

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
	"unicode"
)

`, g.config.PackageName, g.config.PackageName))
}

func (g *GoGenerator) generateCoreTypes(buf *strings.Builder) {
	buf.WriteString(`// ===== SOURCE POSITION TRACKING =====

// Position represents a location in the source text
type Position struct {
	Line   int
	Column int
	Offset int
}

func (p Position) String() string {
	return fmt.Sprintf("line %d, column %d", p.Line, p.Column)
}

// SourceRange represents a range in the source
type SourceRange struct {
	Start Position
	End   Position
	Text  string // The actual source text for this range
}

func (sr SourceRange) String() string {
	if sr.Start.Line == sr.End.Line {
		return fmt.Sprintf("line %d, columns %d-%d", sr.Start.Line, sr.Start.Column, sr.End.Column)
	}
	return fmt.Sprintf("lines %d-%d", sr.Start.Line, sr.End.Line)
}

// ===== ERROR HANDLING =====

// ParseError represents a parsing error with rich context information
type ParseError struct {
	Message    string
	Range      SourceRange
	SourceText string // Full source text for context display
	Suggestion string // Optional suggestion for fixing the error
	ErrorType  string // Category of error: "syntax", "semantic", "lexical"
}

func (e *ParseError) Error() string {
	return fmt.Sprintf("Parse error at %s: %s", e.Range, e.Message)
}

// ShowError displays a user-friendly error with source context
func (e *ParseError) ShowError() string {
	var result strings.Builder

	result.WriteString(fmt.Sprintf("Error: %s\n", e.Message))
	result.WriteString(fmt.Sprintf("  --> %s\n", e.Range))

	// Show source context
	lines := strings.Split(e.SourceText, "\n")
	if e.Range.Start.Line > 0 && e.Range.Start.Line <= len(lines) {
		lineNum := e.Range.Start.Line
		sourceLine := lines[lineNum-1]

		result.WriteString(fmt.Sprintf("   |\n"))
		result.WriteString(fmt.Sprintf("%2d | %s\n", lineNum, sourceLine))
		result.WriteString(fmt.Sprintf("   | "))

		// Add pointer to error location
		for i := 0; i < e.Range.Start.Column-1; i++ {
			if i < len(sourceLine) && sourceLine[i] == '\t' {
				result.WriteString("\t")
			} else {
				result.WriteString(" ")
			}
		}

		// Show error range
		errorLen := e.Range.End.Column - e.Range.Start.Column
		if errorLen <= 0 {
			errorLen = 1
		}
		for i := 0; i < errorLen; i++ {
			result.WriteString("^")
		}
		result.WriteString("\n")
	}

	if e.Suggestion != "" {
		result.WriteString(fmt.Sprintf("\nSuggestion: %s\n", e.Suggestion))
	}

	return result.String()
}

// ===== EXPRESSION TYPE DEFINITIONS =====

// ExpressionType represents the type of an expression result
type ExpressionType int

const (
	TYPE_NUMBER ExpressionType = iota
	TYPE_BOOLEAN
	TYPE_UNKNOWN
)

func (t ExpressionType) String() string {
	switch t {
	case TYPE_NUMBER:
		return "number"
	case TYPE_BOOLEAN:
		return "boolean"
	default:
		return "unknown"
	}
}

`)
}

func (g *GoGenerator) generateTokenDefinitions(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString("// ===== TOKEN DEFINITIONS =====\n\n")
	buf.WriteString("type TokenType int\n\n")
	buf.WriteString("const (\n")

	// Generate token constants
	for i, token := range grammar.Tokens {
		if token.Skip {
			continue // Skip whitespace tokens in enum
		}
		buf.WriteString(fmt.Sprintf("\tTOKEN_%s TokenType = %d\n",
			strings.ToUpper(token.Name), i))
	}

	buf.WriteString("\tTOKEN_EOF\n")
	buf.WriteString("\tTOKEN_INVALID\n")
	buf.WriteString(")\n\n")

	// Generate token names map
	buf.WriteString("var tokenNames = map[TokenType]string{\n")
	for _, token := range grammar.Tokens {
		if token.Skip {
			continue
		}
		displayName := token.Name
		if token.Literal != "" {
			displayName = token.Literal
		}
		buf.WriteString(fmt.Sprintf("\tTOKEN_%s: \"%s\",\n",
			strings.ToUpper(token.Name), displayName))
	}
	buf.WriteString("\tTOKEN_EOF: \"EOF\",\n")
	buf.WriteString("\tTOKEN_INVALID: \"INVALID\",\n")
	buf.WriteString("}\n\n")

	buf.WriteString(`func (t TokenType) String() string {
	if name, exists := tokenNames[t]; exists {
		return name
	}
	return fmt.Sprintf("TOKEN(%d)", int(t))
}

// Token represents a lexical token
type Token struct {
	Type  TokenType
	Value string
	Range SourceRange
}

func (t Token) String() string {
	return fmt.Sprintf("%s('%s')", t.Type, t.Value)
}

`)
}

func (g *GoGenerator) generateASTDefinitions(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// ===== VISITOR PATTERN INTERFACE =====

// Visitor defines the interface for processing AST nodes
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
type Expression interface {
	Accept(visitor Visitor) (interface{}, error)
	GetRange() SourceRange
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

`)
}

func (g *GoGenerator) generateLexerImplementation(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// ===== LEXER =====

type Lexer struct {
	input    string
	position int
	line     int
	column   int
	startPos Position
	keywords map[string]TokenType
}

func NewLexer(input string) *Lexer {
	keywords := map[string]TokenType{
`)

	// Generate keywords map from grammar
	for _, token := range grammar.Tokens {
		if token.Skip {
			continue
		}
		if token.Literal != "" && isIdentifierLike(token.Literal) {
			buf.WriteString(fmt.Sprintf("\t\t\"%s\": TOKEN_%s,\n",
				token.Literal, strings.ToUpper(token.Name)))
			// Also add case variations if it looks like a keyword
			if isAllUpper(token.Literal) {
				lowerVersion := strings.ToLower(token.Literal)
				buf.WriteString(fmt.Sprintf("\t\t\"%s\": TOKEN_%s,\n",
					lowerVersion, strings.ToUpper(token.Name)))
			}
		}
	}

	buf.WriteString(`	}

	return &Lexer{
		input:    input,
		position: 0,
		line:     1,
		column:   1,
		keywords: keywords,
	}
}

func (l *Lexer) currentPos() Position {
	return Position{Line: l.line, Column: l.column, Offset: l.position}
}

func (l *Lexer) peek() rune {
	if l.position >= len(l.input) {
		return 0
	}
	return rune(l.input[l.position])
}

func (l *Lexer) peekNext() rune {
	if l.position+1 >= len(l.input) {
		return 0
	}
	return rune(l.input[l.position+1])
}

func (l *Lexer) advance() rune {
	if l.position >= len(l.input) {
		return 0
	}

	ch := rune(l.input[l.position])
	l.position++

	if ch == '\n' {
		l.line++
		l.column = 1
	} else {
		l.column++
	}

	return ch
}

func (l *Lexer) skipWhitespace() {
	for unicode.IsSpace(l.peek()) {
		l.advance()
	}
}

func (l *Lexer) readNumber() (string, error) {
	var result strings.Builder
	hasDecimal := false

	for {
		ch := l.peek()
		if unicode.IsDigit(ch) {
			result.WriteRune(l.advance())
		} else if ch == '.' && !hasDecimal && unicode.IsDigit(l.peekNext()) {
			hasDecimal = true
			result.WriteRune(l.advance())
		} else {
			break
		}
	}

	return result.String(), nil
}

func (l *Lexer) readIdentifier() string {
	var result strings.Builder

	for {
		ch := l.peek()
		if unicode.IsLetter(ch) || unicode.IsDigit(ch) || ch == '_' {
			result.WriteRune(l.advance())
		} else {
			break
		}
	}

	return result.String()
}

func (l *Lexer) makeToken(tokenType TokenType, value string) Token {
	return Token{
		Type:  tokenType,
		Value: value,
		Range: SourceRange{Start: l.startPos, End: l.currentPos(), Text: value},
	}
}

func (l *Lexer) NextToken() (Token, error) {
	l.skipWhitespace()

	if l.position >= len(l.input) {
		return Token{
			Type:  TOKEN_EOF,
			Value: "",
			Range: SourceRange{Start: l.currentPos(), End: l.currentPos(), Text: ""},
		}, nil
	}

	l.startPos = l.currentPos()
	ch := l.peek()

`)

	// Generate multi-character operators (longest first)
	g.generateLexerOperators(buf, grammar)

	buf.WriteString(`
	// Numbers
	if unicode.IsDigit(ch) {
		value, err := l.readNumber()
		if err != nil {
			return Token{}, &ParseError{
				Message:    err.Error(),
				Range:      SourceRange{Start: l.startPos, End: l.currentPos(), Text: value},
				SourceText: l.input,
				ErrorType:  "lexical",
				Suggestion: "Use a valid number format like 123 or 123.45",
			}
		}
		return l.makeToken(TOKEN_NUMBER, value), nil
	}

	// Identifiers and keywords
	if unicode.IsLetter(ch) {
		value := l.readIdentifier()
		if tokenType, isKeyword := l.keywords[value]; isKeyword {
			return l.makeToken(tokenType, value), nil
		}
		return l.makeToken(TOKEN_IDENTIFIER, value), nil
	}

	// Unknown character
	l.advance()
	return Token{}, &ParseError{
		Message:    fmt.Sprintf("Unexpected character '%c'", ch),
		Range:      SourceRange{Start: l.startPos, End: l.currentPos(), Text: string(ch)},
		SourceText: l.input,
		ErrorType:  "lexical",
		Suggestion: "Remove or replace this character",
	}
}

`)
}

func (g *GoGenerator) generateLexerOperators(buf *strings.Builder, grammar *Grammar) {
	// Collect and sort operators by length (longest first)
	type operator struct {
		literal   string
		tokenName string
	}

	var singleChar []operator
	var multiChar []operator

	for _, token := range grammar.Tokens {
		if token.Skip || token.Literal == "" {
			continue
		}

		op := operator{
			literal:   token.Literal,
			tokenName: strings.ToUpper(token.Name),
		}

		if len(token.Literal) == 1 {
			singleChar = append(singleChar, op)
		} else {
			multiChar = append(multiChar, op)
		}
	}

	// Sort multi-character operators by length (longest first)
	sort.Slice(multiChar, func(i, j int) bool {
		return len(multiChar[i].literal) > len(multiChar[j].literal)
	})

	// Generate multi-character operators with proper lookahead
	if len(multiChar) > 0 {
		buf.WriteString("\t// Multi-character operators\n")
		for _, op := range multiChar {
			literal := op.literal
			tokenName := op.tokenName

			if len(literal) == 2 {
				buf.WriteString(fmt.Sprintf("\tif ch == '%c' && l.peekNext() == '%c' {\n",
					literal[0], literal[1]))
				buf.WriteString("\t\tl.advance()\n")
				buf.WriteString("\t\tl.advance()\n")
				buf.WriteString(fmt.Sprintf("\t\treturn l.makeToken(TOKEN_%s, \"%s\"), nil\n",
					tokenName, literal))
				buf.WriteString("\t}\n")
			} else if len(literal) == 3 {
				buf.WriteString(fmt.Sprintf("\tif ch == '%c' && l.peekNext() == '%c' {\n",
					literal[0], literal[1]))
				buf.WriteString("\t\t// Check third character\n")
				buf.WriteString(fmt.Sprintf("\t\tif l.position+2 < len(l.input) && rune(l.input[l.position+2]) == '%c' {\n", literal[2]))
				buf.WriteString("\t\t\tl.advance()\n")
				buf.WriteString("\t\t\tl.advance()\n")
				buf.WriteString("\t\t\tl.advance()\n")
				buf.WriteString(fmt.Sprintf("\t\t\treturn l.makeToken(TOKEN_%s, \"%s\"), nil\n",
					tokenName, literal))
				buf.WriteString("\t\t}\n")
				buf.WriteString("\t}\n")
			}
		}
		buf.WriteString("\n")
	}

	// Generate single-character operators
	if len(singleChar) > 0 {
		buf.WriteString("\t// Single character tokens\n")
		buf.WriteString("\tswitch ch {\n")
		for _, op := range singleChar {
			buf.WriteString(fmt.Sprintf("\tcase '%s':\n", op.literal))
			buf.WriteString("\t\tl.advance()\n")
			buf.WriteString(fmt.Sprintf("\t\treturn l.makeToken(TOKEN_%s, \"%s\"), nil\n",
				op.tokenName, op.literal))
		}
		buf.WriteString("\t}\n")
	}
}

func (g *GoGenerator) generateParserImplementation(buf *strings.Builder, grammar *Grammar) {
	buf.WriteString(`// ===== PARSER =====

type Parser struct {
	lexer        *Lexer
	currentToken Token
	sourceText   string
}

func NewParser(input string) *Parser {
	lexer := NewLexer(input)
	return &Parser{
		lexer:      lexer,
		sourceText: input,
	}
}

func (p *Parser) advance() error {
	token, err := p.lexer.NextToken()
	if err != nil {
		return err
	}
	p.currentToken = token
	return nil
}

func (p *Parser) expect(tokenType TokenType) error {
	if p.currentToken.Type != tokenType {
		return &ParseError{
			Message:    fmt.Sprintf("Expected %s, got %s", tokenType, p.currentToken.Type),
			Range:      p.currentToken.Range,
			SourceText: p.sourceText,
			ErrorType:  "syntax",
			Suggestion: fmt.Sprintf("Add %s here", tokenType),
		}
	}
	return p.advance()
}

func (p *Parser) match(tokenTypes ...TokenType) bool {
	for _, tokenType := range tokenTypes {
		if p.currentToken.Type == tokenType {
			return true
		}
	}
	return false
}

// Parse parses the input and returns the AST root
func (p *Parser) Parse() (Expression, error) {
	err := p.advance() // Load first token
	if err != nil {
		return nil, err
	}

	expr, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	if p.currentToken.Type != TOKEN_EOF {
		return nil, &ParseError{
			Message:    fmt.Sprintf("Unexpected token after expression: %s", p.currentToken.Type),
			Range:      p.currentToken.Range,
			SourceText: p.sourceText,
			ErrorType:  "syntax",
			Suggestion: "Remove extra tokens or check expression syntax",
		}
	}

	return expr, nil
}

`)

	// Generate parsing methods for each rule
	g.generateParsingMethods(buf, grammar)
}

func (g *GoGenerator) generateRuleMethod(buf *strings.Builder, rule *Rule, grammar *Grammar) {
	methodName := fmt.Sprintf("parse%s", capitalizeFirst(rule.Name))

	buf.WriteString(fmt.Sprintf("// %s implements: %s\n", methodName, rule.Expression.String()))
	buf.WriteString(fmt.Sprintf("func (p *Parser) %s() (Expression, error) {\n", methodName))

	// Analyze the rule and generate appropriate parsing code
	g.generateExpressionParsingCode(buf, rule.Expression, grammar, 1)

	buf.WriteString("}\n\n")
}

func (g *GoGenerator) generateExpressionParsingCode(buf *strings.Builder, expr Expression, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)

	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetTokenByName(e.Name) != nil {
			// It's a token - generate token parsing
			g.generateTokenParsing(buf, e.Name, grammar, indent)
		} else {
			// It's a rule reference
			buf.WriteString(fmt.Sprintf("%sreturn p.parse%s()\n", tabs, capitalizeFirst(e.Name)))
		}

	case *Choice:
		g.generateChoiceParsingCode(buf, e, grammar, indent)

	case *Sequence:
		g.generateSequenceParsingCode(buf, e, grammar, indent)

	case *Repetition:
		g.generateRepetitionParsingCode(buf, e, grammar, indent)

	case *Optional:
		g.generateOptionalParsingCode(buf, e, grammar, indent)

	case *Literal:
		g.generateLiteralParsing(buf, e, indent)

	default:
		buf.WriteString(fmt.Sprintf("%sreturn nil, fmt.Errorf(\"expression type not implemented\")\n", tabs))
	}
}

func (g *GoGenerator) generateChoiceParsingCode(buf *strings.Builder, choice *Choice, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)

	if len(choice.Alternatives) == 0 {
		buf.WriteString(fmt.Sprintf("%sreturn nil, fmt.Errorf(\"empty choice\")\n", tabs))
		return
	}

	if len(choice.Alternatives) == 1 {
		g.generateExpressionParsingCode(buf, choice.Alternatives[0], grammar, indent)
		return
	}

	// For multiple alternatives, generate lookahead-based parsing
	buf.WriteString(fmt.Sprintf("%s// Try alternatives based on lookahead\n", tabs))

	for i, alt := range choice.Alternatives {
		if i > 0 {
			buf.WriteString(fmt.Sprintf("%s} else ", tabs))
		} else {
			buf.WriteString(fmt.Sprintf("%s", tabs))
		}

		// Generate condition for this alternative
		condition := g.generateLookaheadCondition(alt, grammar)
		if condition != "" {
			buf.WriteString(fmt.Sprintf("if %s {\n", condition))
			g.generateExpressionParsingCode(buf, alt, grammar, indent+1)
		} else {
			buf.WriteString("{\n")
			buf.WriteString(fmt.Sprintf("%s\t// Fallback alternative\n", tabs))
			g.generateExpressionParsingCode(buf, alt, grammar, indent+1)
		}
	}

	buf.WriteString(fmt.Sprintf("%s} else {\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\treturn nil, &ParseError{\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tMessage: \"No valid alternative found\",\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tRange: p.currentToken.Range,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tSourceText: p.sourceText,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tErrorType: \"syntax\",\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t}\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}\n", tabs))
}

func (g *GoGenerator) generateLookaheadCondition(expr Expression, grammar *Grammar) string {
	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetTokenByName(e.Name) != nil {
			return fmt.Sprintf("p.currentToken.Type == TOKEN_%s", strings.ToUpper(e.Name))
		}
		// For rule references, we'd need more sophisticated FIRST set analysis
		return ""
	case *Sequence:
		if len(e.Items) > 0 {
			return g.generateLookaheadCondition(e.Items[0], grammar)
		}
	case *Literal:
		// Find the token for this literal
		for _, token := range grammar.Tokens {
			if token.Literal == e.Value {
				return fmt.Sprintf("p.currentToken.Type == TOKEN_%s", strings.ToUpper(token.Name))
			}
		}
	}
	return ""
}

func (g *GoGenerator) generateSequenceParsingCode(buf *strings.Builder, seq *Sequence, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)

	if len(seq.Items) == 0 {
		buf.WriteString(fmt.Sprintf("%sreturn &NumberLiteral{Value: 0, Range: p.currentToken.Range}, nil // empty sequence\n", tabs))
		return
	}

	if len(seq.Items) == 1 {
		g.generateExpressionParsingCode(buf, seq.Items[0], grammar, indent)
		return
	}

	// For multi-item sequences, we need to implement proper left-associative parsing
	buf.WriteString(fmt.Sprintf("%s// Parse sequence\n", tabs))
	buf.WriteString(fmt.Sprintf("%sleft, err := func() (Expression, error) {\n", tabs))
	g.generateExpressionParsingCode(buf, seq.Items[0], grammar, indent+1)
	buf.WriteString(fmt.Sprintf("%s}()\n", tabs))
	buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\treturn nil, err\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))

	for i := 1; i < len(seq.Items); i++ {
		buf.WriteString(fmt.Sprintf("%s// Parse item %d\n", tabs, i+1))
		if g.isOperatorToken(seq.Items[i], grammar) {
			// It's an operator token - expect it and continue
			tokenName := g.getTokenNameFromExpression(seq.Items[i], grammar)
			buf.WriteString(fmt.Sprintf("%sif !p.match(TOKEN_%s) {\n", tabs, strings.ToUpper(tokenName)))
			buf.WriteString(fmt.Sprintf("%s\treturn nil, &ParseError{\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\t\tMessage: \"Expected %s\",\n", tabs, tokenName))
			buf.WriteString(fmt.Sprintf("%s\t\tRange: p.currentToken.Range,\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\t\tSourceText: p.sourceText,\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\t\tErrorType: \"syntax\",\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\t}\n", tabs))
			buf.WriteString(fmt.Sprintf("%s}\n", tabs))
			buf.WriteString(fmt.Sprintf("%soperator := p.currentToken.Type\n", tabs))
			buf.WriteString(fmt.Sprintf("%serr = p.advance()\n", tabs))
			buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\treturn nil, err\n", tabs))
			buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))
		} else {
			// Parse the next item
			buf.WriteString(fmt.Sprintf("%sright, err := func() (Expression, error) {\n", tabs))
			g.generateExpressionParsingCode(buf, seq.Items[i], grammar, indent+1)
			buf.WriteString(fmt.Sprintf("%s}()\n", tabs))
			buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))
			buf.WriteString(fmt.Sprintf("%s\treturn nil, err\n", tabs))
			buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))
		}
	}

	// Create binary operation node if we have operator
	buf.WriteString(fmt.Sprintf("%s// Create binary operation if applicable\n", tabs))
	buf.WriteString(fmt.Sprintf("%sreturn &BinaryOperation{\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\tLeft: left,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\tOperator: operator,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\tRight: right,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\tRange: SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}, nil\n", tabs))
}

func (g *GoGenerator) generateRepetitionParsingCode(buf *strings.Builder, rep *Repetition, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)

	buf.WriteString(fmt.Sprintf("%s// Parse repetition (%d to %d)\n", tabs, rep.Min, rep.Max))
	buf.WriteString(fmt.Sprintf("%sleft, err := func() (Expression, error) {\n", tabs))
	g.generateExpressionParsingCode(buf, rep.Expression, grammar, indent+1)
	buf.WriteString(fmt.Sprintf("%s}()\n", tabs))
	buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))

	if rep.Min == 0 {
		buf.WriteString(fmt.Sprintf("%s\t// Zero repetitions allowed\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\treturn &NumberLiteral{Value: 0, Range: p.currentToken.Range}, nil\n", tabs))
	} else {
		buf.WriteString(fmt.Sprintf("%s\treturn nil, err\n", tabs))
	}

	buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))

	if rep.Max == -1 || rep.Max > 1 {
		buf.WriteString(fmt.Sprintf("%s// Continue parsing while possible\n", tabs))
		buf.WriteString(fmt.Sprintf("%sfor {\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\tif right, err := func() (Expression, error) {\n", tabs))
		g.generateExpressionParsingCode(buf, rep.Expression, grammar, indent+2)
		buf.WriteString(fmt.Sprintf("%s\t}(); err == nil {\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t// Create left-associative tree\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tleft = &BinaryOperation{\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t\tLeft: left,\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t\tOperator: TOKEN_PLUS, // Default operator for sequences\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t\tRight: right,\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t\tRange: SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\t}\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t} else {\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tbreak\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t}\n", tabs))
		buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))
	}

	buf.WriteString(fmt.Sprintf("%sreturn left, nil\n", tabs))
}

func (g *GoGenerator) generateOptionalParsingCode(buf *strings.Builder, opt *Optional, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)

	buf.WriteString(fmt.Sprintf("%s// Parse optional expression\n", tabs))
	buf.WriteString(fmt.Sprintf("%sif expr, err := func() (Expression, error) {\n", tabs))
	g.generateExpressionParsingCode(buf, opt.Expression, grammar, indent+1)
	buf.WriteString(fmt.Sprintf("%s}(); err == nil {\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\treturn expr, nil\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}\n", tabs))
	buf.WriteString(fmt.Sprintf("%s// Optional failed, return default\n", tabs))
	buf.WriteString(fmt.Sprintf("%sreturn &NumberLiteral{Value: 0, Range: p.currentToken.Range}, nil\n", tabs))
}

func (g *GoGenerator) generateTokenParsing(buf *strings.Builder, tokenName string, grammar *Grammar, indent int) {
	tabs := strings.Repeat("\t", indent)
	upperName := strings.ToUpper(tokenName)

	buf.WriteString(fmt.Sprintf("%sif p.currentToken.Type != TOKEN_%s {\n", tabs, upperName))
	buf.WriteString(fmt.Sprintf("%s\treturn nil, &ParseError{\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tMessage: fmt.Sprintf(\"Expected %s, got %%s\", p.currentToken.Type),\n", tabs, tokenName))
	buf.WriteString(fmt.Sprintf("%s\t\tRange: p.currentToken.Range,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tSourceText: p.sourceText,\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t\tErrorType: \"syntax\",\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\t}\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}\n", tabs))
	buf.WriteString(fmt.Sprintf("%svalue := p.currentToken.Value\n", tabs))
	buf.WriteString(fmt.Sprintf("%srange_ := p.currentToken.Range\n", tabs))
	buf.WriteString(fmt.Sprintf("%serr := p.advance()\n", tabs))
	buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))
	buf.WriteString(fmt.Sprintf("%s\treturn nil, err\n", tabs))
	buf.WriteString(fmt.Sprintf("%s}\n\n", tabs))

	// Generate appropriate AST node based on token type
	switch upperName {
	case "NUMBER", "DECIMAL":
		buf.WriteString(fmt.Sprintf("%snum, err := strconv.ParseFloat(value, 64)\n", tabs))
		buf.WriteString(fmt.Sprintf("%sif err != nil {\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\treturn nil, &ParseError{\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tMessage: fmt.Sprintf(\"Invalid number format: %%s\", value),\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tRange: range_,\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tSourceText: p.sourceText,\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t\tErrorType: \"lexical\",\n", tabs))
		buf.WriteString(fmt.Sprintf("%s\t}\n", tabs))
		buf.WriteString(fmt.Sprintf("%s}\n", tabs))
		buf.WriteString(fmt.Sprintf("%sreturn &NumberLiteral{Value: num, Range: range_}, nil\n", tabs))

	case "TRUE", "FALSE", "BOOLEAN":
		buf.WriteString(fmt.Sprintf("%sboolVal := value == \"true\" || value == \"TRUE\"\n", tabs))
		buf.WriteString(fmt.Sprintf("%sreturn &BooleanLiteral{Value: boolVal, Range: range_}, nil\n", tabs))

	case "IDENTIFIER":
		buf.WriteString(fmt.Sprintf("%sreturn &Identifier{Name: value, Range: range_}, nil\n", tabs))

	default:
		buf.WriteString(fmt.Sprintf("%s// Return literal for other tokens\n", tabs))
		buf.WriteString(fmt.Sprintf("%sreturn &Identifier{Name: value, Range: range_}, nil\n", tabs))
	}
}

func (g *GoGenerator) generateLiteralParsing(buf *strings.Builder, literal *Literal, indent int) {
	tabs := strings.Repeat("\t", indent)

	// Find the token that matches this literal
	buf.WriteString(fmt.Sprintf("%s// Parse literal '%s'\n", tabs, literal.Value))
	buf.WriteString(fmt.Sprintf("%sreturn &Identifier{Name: \"%s\", Range: p.currentToken.Range}, nil\n",
		tabs, literal.Value))
}

func (g *GoGenerator) generatePublicAPI(buf *strings.Builder) {
	buf.WriteString(`// ===== UTILITY FUNCTIONS =====

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
	case TOKEN_PLUS, TOKEN_MINUS, TOKEN_MULTIPLY, TOKEN_DIVIDE, TOKEN_MODULO:
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
	case TOKEN_ABS, TOKEN_NEGATE, TOKEN_CEIL, TOKEN_FLOOR:
		return TYPE_NUMBER, nil
	case TOKEN_THRESHOLD, TOKEN_IMPLIES, TOKEN_EQUIV, TOKEN_XOR:
		return TYPE_BOOLEAN, nil
	case TOKEN_ITE:
		return TYPE_UNKNOWN, nil // Depends on then/else branches
	default:
		return TYPE_UNKNOWN, nil
	}
}

// ===== PUBLIC API =====

// ParseExpression is the main entry point for parsing expressions
func ParseExpression(input string) (Expression, error) {
	parser := NewParser(input)
	return parser.Parse()
}

// FormatError formats a ParseError for user-friendly display
func FormatError(err error) string {
	if parseErr, ok := err.(*ParseError); ok {
		return parseErr.ShowError()
	}
	return err.Error()
}

// ValidateExpression validates an expression without evaluating it
func ValidateExpression(input string) error {
	_, err := ParseExpression(input)
	return err
}

// GetExpressionVariables is a convenience function that matches the old API
func GetExpressionVariables(input string) ([]string, error) {
	ast, err := ParseExpression(input)
	if err != nil {
		return nil, err
	}
	return CollectVariables(ast), nil
}
`)
}

// Helper functions
func (g *GoGenerator) isOperatorToken(expr Expression, grammar *Grammar) bool {
	if ruleRef, ok := expr.(*RuleRef); ok {
		token := grammar.GetTokenByName(ruleRef.Name)
		if token != nil && token.Literal != "" {
			// Check if it's an operator-like token
			operators := []string{"+", "-", "*", "/", "%", "==", "!=", "<", "<=", ">", ">=", "&&", "||", "->", "<->"}
			for _, op := range operators {
				if token.Literal == op {
					return true
				}
			}
		}
	}
	return false
}

func (g *GoGenerator) getTokenNameFromExpression(expr Expression, grammar *Grammar) string {
	if ruleRef, ok := expr.(*RuleRef); ok {
		return ruleRef.Name
	}
	return ""
}

func isIdentifierLike(s string) bool {
	if len(s) == 0 {
		return false
	}
	for i, r := range s {
		if i == 0 {
			if !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || r == '_') {
				return false
			}
		} else {
			if !((r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_') {
				return false
			}
		}
	}
	return true
}

func isAllUpper(s string) bool {
	for _, r := range s {
		if r >= 'a' && r <= 'z' {
			return false
		}
	}
	return len(s) > 0
}

func capitalizeFirst(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

// Replace the generateParsingMethods function in go_generator.go

func (g *GoGenerator) generateParsingMethods(buf *strings.Builder, grammar *Grammar) {
	startRule := grammar.StartRule
	if startRule == "" && len(grammar.Rules) > 0 {
		startRule = grammar.Rules[0].Name
	}

	// Only generate main entry point if there's no "expression" rule
	hasExpressionRule := false
	for _, rule := range grammar.Rules {
		if rule.Name == "expression" {
			hasExpressionRule = true
			break
		}
	}

	if !hasExpressionRule {
		// Main entry point
		buf.WriteString(`// parseExpression is the main entry point
func (p *Parser) parseExpression() (Expression, error) {
`)
		if startRule != "" {
			buf.WriteString(fmt.Sprintf("\treturn p.parse%s()\n", capitalizeFirst(startRule)))
		} else {
			buf.WriteString("\treturn nil, fmt.Errorf(\"no start rule defined\")\n")
		}
		buf.WriteString("}\n\n")
	}

	// Generate simple methods for each rule using patterns from your reference parser
	for _, rule := range grammar.Rules {
		g.generateSimpleRuleMethod(buf, rule, grammar)
	}
}

func (g *GoGenerator) generateSimpleRuleMethod(buf *strings.Builder, rule *Rule, grammar *Grammar) {
	methodName := fmt.Sprintf("parse%s", capitalizeFirst(rule.Name))

	buf.WriteString(fmt.Sprintf("// %s implements: %s\n", methodName, rule.Expression.String()))
	buf.WriteString(fmt.Sprintf("func (p *Parser) %s() (Expression, error) {\n", methodName))

	// Analyze the rule and generate appropriate simple parsing code
	g.generateSimpleExpression(buf, rule.Expression, grammar)

	buf.WriteString("}\n\n")
}

func (g *GoGenerator) generateSimpleExpression(buf *strings.Builder, expr Expression, grammar *Grammar) {
	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetTokenByName(e.Name) != nil {
			// It's a token - generate simple token parsing
			g.generateSimpleTokenParsing(buf, e.Name)
		} else {
			// It's a rule reference
			buf.WriteString(fmt.Sprintf("\treturn p.parse%s()\n", capitalizeFirst(e.Name)))
		}

	case *Choice:
		g.generateSimpleChoice(buf, e, grammar)

	case *Sequence:
		g.generateSimpleSequence(buf, e, grammar)

	case *Repetition:
		g.generateSimpleRepetition(buf, e, grammar)

	case *Optional:
		buf.WriteString("\t// Optional - try to parse, ignore errors\n")
		g.generateSimpleExpression(buf, e.Expression, grammar)

	default:
		buf.WriteString("\treturn nil, fmt.Errorf(\"expression type not supported\")\n")
	}
}

func (g *GoGenerator) generateSimpleChoice(buf *strings.Builder, choice *Choice, grammar *Grammar) {
	if len(choice.Alternatives) == 0 {
		buf.WriteString("\treturn nil, fmt.Errorf(\"empty choice\")\n")
		return
	}

	if len(choice.Alternatives) == 1 {
		g.generateSimpleExpression(buf, choice.Alternatives[0], grammar)
		return
	}

	// Generate simple if-else chain based on lookahead
	buf.WriteString("\t// Try alternatives based on current token\n")

	for i, alt := range choice.Alternatives {
		condition := g.getSimpleLookahead(alt, grammar)

		if i == 0 {
			if condition != "" {
				buf.WriteString(fmt.Sprintf("\tif %s {\n", condition))
				g.generateSimpleExpression(buf, alt, grammar)
				buf.WriteString("\t}")
			} else {
				buf.WriteString("\t// First alternative (fallback)\n")
				g.generateSimpleExpression(buf, alt, grammar)
				return
			}
		} else {
			if condition != "" {
				buf.WriteString(fmt.Sprintf(" else if %s {\n", condition))
				g.generateSimpleExpression(buf, alt, grammar)
				buf.WriteString("\t}")
			}
		}
	}

	buf.WriteString(" else {\n")
	buf.WriteString("\t\treturn nil, fmt.Errorf(\"no valid alternative found\")\n")
	buf.WriteString("\t}\n")
}

func (g *GoGenerator) generateSimpleSequence(buf *strings.Builder, seq *Sequence, grammar *Grammar) {
	if len(seq.Items) == 0 {
		buf.WriteString("\treturn &NumberLiteral{Value: 0, Range: p.currentToken.Range}, nil\n")
		return
	}

	if len(seq.Items) == 1 {
		g.generateSimpleExpression(buf, seq.Items[0], grammar)
		return
	}

	// For binary operations, use the standard left-associative pattern
	if len(seq.Items) == 3 {
		// Pattern: left operator right
		leftItem := seq.Items[0]
		opItem := seq.Items[1]
		rightItem := seq.Items[2]

		if g.isOperatorRule(opItem, grammar) {
			buf.WriteString("\tleft, err := func() (Expression, error) {\n")
			buf.WriteString("\t\t")
			g.generateSimpleExpression(buf, leftItem, grammar)
			buf.WriteString("\t}()\n")
			buf.WriteString("\tif err != nil {\n")
			buf.WriteString("\t\treturn nil, err\n")
			buf.WriteString("\t}\n\n")

			buf.WriteString("\t// Check for operator\n")
			tokenName := g.getTokenFromRule(opItem, grammar)
			if tokenName != "" {
				buf.WriteString(fmt.Sprintf("\tif p.currentToken.Type == TOKEN_%s {\n", strings.ToUpper(tokenName)))
				buf.WriteString("\t\toperator := p.currentToken.Type\n")
				buf.WriteString("\t\terr := p.advance()\n")
				buf.WriteString("\t\tif err != nil {\n")
				buf.WriteString("\t\t\treturn nil, err\n")
				buf.WriteString("\t\t}\n\n")

				buf.WriteString("\t\tright, err := func() (Expression, error) {\n")
				buf.WriteString("\t\t\t")
				g.generateSimpleExpression(buf, rightItem, grammar)
				buf.WriteString("\t\t}()\n")
				buf.WriteString("\t\tif err != nil {\n")
				buf.WriteString("\t\t\treturn nil, err\n")
				buf.WriteString("\t\t}\n\n")

				buf.WriteString("\t\treturn &BinaryOperation{\n")
				buf.WriteString("\t\t\tLeft: left,\n")
				buf.WriteString("\t\t\tOperator: operator,\n")
				buf.WriteString("\t\t\tRight: right,\n")
				buf.WriteString("\t\t\tRange: SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},\n")
				buf.WriteString("\t\t}, nil\n")
				buf.WriteString("\t}\n\n")
				buf.WriteString("\treturn left, nil // No operator found\n")
				return
			}
		}
	}

	// Fallback: just parse first item
	buf.WriteString("\t// Sequence - parsing first item only\n")
	g.generateSimpleExpression(buf, seq.Items[0], grammar)
}

func (g *GoGenerator) generateSimpleRepetition(buf *strings.Builder, rep *Repetition, grammar *Grammar) {
	if rep.Min == 0 && rep.Max == -1 {
		// Zero or more - use the pattern from your reference parser
		buf.WriteString("\tleft, err := func() (Expression, error) {\n")
		buf.WriteString("\t\t")
		g.generateSimpleExpression(buf, rep.Expression, grammar)
		buf.WriteString("\t}()\n")
		buf.WriteString("\tif err != nil {\n")
		buf.WriteString("\t\treturn nil, err\n")
		buf.WriteString("\t}\n\n")

		buf.WriteString("\tfor {\n")
		buf.WriteString("\t\tif right, err := func() (Expression, error) {\n")
		buf.WriteString("\t\t\t")
		g.generateSimpleExpression(buf, rep.Expression, grammar)
		buf.WriteString("\t\t}(); err == nil {\n")
		buf.WriteString("\t\t\tleft = &BinaryOperation{\n")
		buf.WriteString("\t\t\t\tLeft: left,\n")
		buf.WriteString("\t\t\t\tOperator: TOKEN_PLUS, // Default for repetition\n")
		buf.WriteString("\t\t\t\tRight: right,\n")
		buf.WriteString("\t\t\t\tRange: SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},\n")
		buf.WriteString("\t\t\t}\n")
		buf.WriteString("\t\t} else {\n")
		buf.WriteString("\t\t\tbreak\n")
		buf.WriteString("\t\t}\n")
		buf.WriteString("\t}\n\n")
		buf.WriteString("\treturn left, nil\n")
	} else {
		// Other repetition types - just parse once for now
		g.generateSimpleExpression(buf, rep.Expression, grammar)
	}
}

func (g *GoGenerator) generateSimpleTokenParsing(buf *strings.Builder, tokenName string) {
	upperName := strings.ToUpper(tokenName)

	buf.WriteString(fmt.Sprintf("\tif p.currentToken.Type != TOKEN_%s {\n", upperName))
	buf.WriteString(fmt.Sprintf("\t\treturn nil, fmt.Errorf(\"expected %s, got %%s\", p.currentToken.Type)\n", tokenName))
	buf.WriteString("\t}\n")
	buf.WriteString("\tvalue := p.currentToken.Value\n")
	buf.WriteString("\trange_ := p.currentToken.Range\n")
	buf.WriteString("\terr := p.advance()\n")
	buf.WriteString("\tif err != nil {\n")
	buf.WriteString("\t\treturn nil, err\n")
	buf.WriteString("\t}\n\n")

	// Generate appropriate AST node
	switch upperName {
	case "NUMBER", "DECIMAL":
		buf.WriteString("\tnum, err := strconv.ParseFloat(value, 64)\n")
		buf.WriteString("\tif err != nil {\n")
		buf.WriteString("\t\treturn nil, fmt.Errorf(\"invalid number: %s\", value)\n")
		buf.WriteString("\t}\n")
		buf.WriteString("\treturn &NumberLiteral{Value: num, Range: range_}, nil\n")

	case "TRUE", "FALSE":
		buf.WriteString("\tboolVal := value == \"true\" || value == \"TRUE\"\n")
		buf.WriteString("\treturn &BooleanLiteral{Value: boolVal, Range: range_}, nil\n")

	case "IDENTIFIER":
		buf.WriteString("\treturn &Identifier{Name: value, Range: range_}, nil\n")

	default:
		buf.WriteString("\treturn &Identifier{Name: value, Range: range_}, nil\n")
	}
}

func (g *GoGenerator) getSimpleLookahead(expr Expression, grammar *Grammar) string {
	switch e := expr.(type) {
	case *RuleRef:
		if grammar.GetTokenByName(e.Name) != nil {
			return fmt.Sprintf("p.currentToken.Type == TOKEN_%s", strings.ToUpper(e.Name))
		}
	case *Sequence:
		if len(e.Items) > 0 {
			return g.getSimpleLookahead(e.Items[0], grammar)
		}
	}
	return ""
}

func (g *GoGenerator) isOperatorRule(expr Expression, grammar *Grammar) bool {
	if ruleRef, ok := expr.(*RuleRef); ok {
		token := grammar.GetTokenByName(ruleRef.Name)
		if token != nil && token.Literal != "" {
			// Check if it's an operator
			operators := []string{"+", "-", "*", "/", "%", "==", "!=", "<", "<=", ">", ">=", "&&", "||", "->", "<->"}
			for _, op := range operators {
				if token.Literal == op {
					return true
				}
			}
		}
	}
	return false
}

func (g *GoGenerator) getTokenFromRule(expr Expression, grammar *Grammar) string {
	if ruleRef, ok := expr.(*RuleRef); ok {
		if grammar.GetTokenByName(ruleRef.Name) != nil {
			return ruleRef.Name
		}
	}
	return ""
}

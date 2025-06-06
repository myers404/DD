// Package parser provides expression parsing functionality
// This file contains the lexer and parser implementation
package parser

import (
	"fmt"
	"strconv"
	"strings"
	"unicode"
)

// ===== LEXER =====

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
		"true":      TOKEN_BOOLEAN,
		"false":     TOKEN_BOOLEAN,
		"TRUE":      TOKEN_BOOLEAN,
		"FALSE":     TOKEN_BOOLEAN,
		"AND":       TOKEN_AND,
		"OR":        TOKEN_OR,
		"NOT":       TOKEN_NOT,
		"MIN":       TOKEN_MIN,
		"MAX":       TOKEN_MAX,
		"ABS":       TOKEN_ABS,
		"NEGATE":    TOKEN_NEGATE,
		"CEIL":      TOKEN_CEIL,
		"FLOOR":     TOKEN_FLOOR,
		"THRESHOLD": TOKEN_THRESHOLD,
		"ITE":       TOKEN_ITE,
		"IMPLIES":   TOKEN_IMPLIES,
		"EQUIV":     TOKEN_EQUIV,
		"XOR":       TOKEN_XOR,
	}

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
		} else if ch == '.' && !hasDecimal {
			hasDecimal = true
			result.WriteRune(l.advance())
			// Ensure there's at least one digit after decimal point
			if !unicode.IsDigit(l.peek()) {
				return "", fmt.Errorf("invalid number format: missing digits after decimal point")
			}
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

	// Single character tokens
	switch ch {
	case '+':
		l.advance()
		return l.makeToken(TOKEN_PLUS, "+"), nil
	case '-':
		l.advance()
		return l.makeToken(TOKEN_MINUS, "-"), nil
	case '*':
		l.advance()
		return l.makeToken(TOKEN_MULTIPLY, "*"), nil
	case '/':
		l.advance()
		return l.makeToken(TOKEN_DIVIDE, "/"), nil
	case '%':
		l.advance()
		return l.makeToken(TOKEN_MODULO, "%"), nil
	case '(':
		l.advance()
		return l.makeToken(TOKEN_LPAREN, "("), nil
	case ')':
		l.advance()
		return l.makeToken(TOKEN_RPAREN, ")"), nil
	case ',':
		l.advance()
		return l.makeToken(TOKEN_COMMA, ","), nil
	}

	// Multi-character operators
	switch ch {
	case '<':
		l.advance()
		if l.peek() == '=' {
			l.advance()
			return l.makeToken(TOKEN_LE, "<="), nil
		}
		return l.makeToken(TOKEN_LT, "<"), nil
	case '>':
		l.advance()
		if l.peek() == '=' {
			l.advance()
			return l.makeToken(TOKEN_GE, ">="), nil
		}
		return l.makeToken(TOKEN_GT, ">"), nil
	case '=':
		l.advance()
		if l.peek() == '=' {
			l.advance()
			return l.makeToken(TOKEN_EQ, "=="), nil
		}
		return Token{}, &ParseError{
			Message:    "Expected '==' for equality comparison",
			Range:      SourceRange{Start: l.startPos, End: l.currentPos(), Text: "="},
			SourceText: l.input,
			ErrorType:  "lexical",
			Suggestion: "Use '==' for equality comparison",
		}
	case '!':
		l.advance()
		if l.peek() == '=' {
			l.advance()
			return l.makeToken(TOKEN_NE, "!="), nil
		}
		return l.makeToken(TOKEN_NOT, "!"), nil
	case '&':
		l.advance()
		if l.peek() == '&' {
			l.advance()
			return l.makeToken(TOKEN_AND, "&&"), nil
		}
		return Token{}, &ParseError{
			Message:    "Expected '&&' for logical AND",
			Range:      SourceRange{Start: l.startPos, End: l.currentPos(), Text: "&"},
			SourceText: l.input,
			ErrorType:  "lexical",
			Suggestion: "Use '&&' or 'AND' for logical AND",
		}
	case '|':
		l.advance()
		if l.peek() == '|' {
			l.advance()
			return l.makeToken(TOKEN_OR, "||"), nil
		}
		return Token{}, &ParseError{
			Message:    "Expected '||' for logical OR",
			Range:      SourceRange{Start: l.startPos, End: l.currentPos(), Text: "|"},
			SourceText: l.input,
			ErrorType:  "lexical",
			Suggestion: "Use '||' or 'OR' for logical OR",
		}
	}

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

// ===== PARSER =====

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

// parseExpression = logical_or
func (p *Parser) parseExpression() (Expression, error) {
	return p.parseLogicalOr()
}

// logical_or = logical_and { ("OR" | "||") logical_and }
func (p *Parser) parseLogicalOr() (Expression, error) {
	left, err := p.parseLogicalAnd()
	if err != nil {
		return nil, err
	}

	for p.match(TOKEN_OR) {
		operator := p.currentToken.Type
		err := p.advance()
		if err != nil {
			return nil, err
		}

		right, err := p.parseLogicalAnd()
		if err != nil {
			return nil, err
		}

		left = &BinaryOperation{
			Left:     left,
			Operator: operator,
			Right:    right,
			Range:    SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},
		}
	}

	return left, nil
}

// logical_and = logical_not { ("AND" | "&&") logical_not }
func (p *Parser) parseLogicalAnd() (Expression, error) {
	left, err := p.parseLogicalNot()
	if err != nil {
		return nil, err
	}

	for p.match(TOKEN_AND) {
		operator := p.currentToken.Type
		err := p.advance()
		if err != nil {
			return nil, err
		}

		right, err := p.parseLogicalNot()
		if err != nil {
			return nil, err
		}

		left = &BinaryOperation{
			Left:     left,
			Operator: operator,
			Right:    right,
			Range:    SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},
		}
	}

	return left, nil
}

// logical_not = ["NOT" | "!"] comparison
func (p *Parser) parseLogicalNot() (Expression, error) {
	if p.match(TOKEN_NOT) {
		operator := p.currentToken.Type
		opRange := p.currentToken.Range
		err := p.advance()
		if err != nil {
			return nil, err
		}

		operand, err := p.parseComparison()
		if err != nil {
			return nil, err
		}

		return &UnaryOperation{
			Operator: operator,
			Operand:  operand,
			Range:    SourceRange{Start: opRange.Start, End: operand.GetRange().End},
		}, nil
	}

	return p.parseComparison()
}

// comparison = arithmetic_expr [ comparison_op arithmetic_expr ]
func (p *Parser) parseComparison() (Expression, error) {
	left, err := p.parseArithmetic()
	if err != nil {
		return nil, err
	}

	if p.match(TOKEN_EQ, TOKEN_NE, TOKEN_LT, TOKEN_LE, TOKEN_GT, TOKEN_GE) {
		operator := p.currentToken.Type
		err := p.advance()
		if err != nil {
			return nil, err
		}

		right, err := p.parseArithmetic()
		if err != nil {
			return nil, err
		}

		return &BinaryOperation{
			Left:     left,
			Operator: operator,
			Right:    right,
			Range:    SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},
		}, nil
	}

	return left, nil
}

// arithmetic_expr = term { ("+" | "-") term }
func (p *Parser) parseArithmetic() (Expression, error) {
	left, err := p.parseTerm()
	if err != nil {
		return nil, err
	}

	for p.match(TOKEN_PLUS, TOKEN_MINUS) {
		operator := p.currentToken.Type
		err := p.advance()
		if err != nil {
			return nil, err
		}

		right, err := p.parseTerm()
		if err != nil {
			return nil, err
		}

		left = &BinaryOperation{
			Left:     left,
			Operator: operator,
			Right:    right,
			Range:    SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},
		}
	}

	return left, nil
}

// term = factor { ("*" | "/" | "%" | "MIN" | "MAX") factor }
func (p *Parser) parseTerm() (Expression, error) {
	left, err := p.parseFactor()
	if err != nil {
		return nil, err
	}

	for p.match(TOKEN_MULTIPLY, TOKEN_DIVIDE, TOKEN_MODULO, TOKEN_MIN, TOKEN_MAX) {
		operator := p.currentToken.Type
		err := p.advance()
		if err != nil {
			return nil, err
		}

		right, err := p.parseFactor()
		if err != nil {
			return nil, err
		}

		left = &BinaryOperation{
			Left:     left,
			Operator: operator,
			Right:    right,
			Range:    SourceRange{Start: left.GetRange().Start, End: right.GetRange().End},
		}
	}

	return left, nil
}

// factor = ["-" | "+"] primary | unary_function
func (p *Parser) parseFactor() (Expression, error) {
	if p.match(TOKEN_MINUS, TOKEN_PLUS) {
		operator := p.currentToken.Type
		opRange := p.currentToken.Range
		err := p.advance()
		if err != nil {
			return nil, err
		}

		operand, err := p.parsePrimary()
		if err != nil {
			return nil, err
		}

		return &UnaryOperation{
			Operator: operator,
			Operand:  operand,
			Range:    SourceRange{Start: opRange.Start, End: operand.GetRange().End},
		}, nil
	}

	// Check for unary functions
	if p.match(TOKEN_ABS, TOKEN_NEGATE, TOKEN_CEIL, TOKEN_FLOOR) {
		return p.parseUnaryFunction()
	}

	// Check for binary functions
	if p.match(TOKEN_THRESHOLD) {
		return p.parseThresholdFunction()
	}

	return p.parsePrimary()
}

// primary = number | boolean | identifier | "(" expression ")" | conditional | function
func (p *Parser) parsePrimary() (Expression, error) {
	switch p.currentToken.Type {
	case TOKEN_NUMBER:
		value, err := strconv.ParseFloat(p.currentToken.Value, 64)
		if err != nil {
			return nil, &ParseError{
				Message:    fmt.Sprintf("Invalid number format: %s", p.currentToken.Value),
				Range:      p.currentToken.Range,
				SourceText: p.sourceText,
				ErrorType:  "lexical",
				Suggestion: "Use a valid number format like 123 or 123.45",
			}
		}

		result := &NumberLiteral{
			Value: value,
			Range: p.currentToken.Range,
		}
		err = p.advance()
		return result, err

	case TOKEN_BOOLEAN:
		value := p.currentToken.Value == "true" || p.currentToken.Value == "TRUE"
		result := &BooleanLiteral{
			Value: value,
			Range: p.currentToken.Range,
		}
		err := p.advance()
		return result, err

	case TOKEN_IDENTIFIER:
		result := &Identifier{
			Name:  p.currentToken.Value,
			Range: p.currentToken.Range,
		}
		err := p.advance()
		return result, err

	case TOKEN_LPAREN:
		err := p.advance() // consume '('
		if err != nil {
			return nil, err
		}

		expr, err := p.parseExpression()
		if err != nil {
			return nil, err
		}

		err = p.expect(TOKEN_RPAREN)
		if err != nil {
			return nil, err
		}

		return expr, nil

	case TOKEN_ITE:
		return p.parseITEFunction()

	case TOKEN_IMPLIES, TOKEN_EQUIV, TOKEN_XOR:
		return p.parseBinaryLogicalFunction()

	case TOKEN_MIN, TOKEN_MAX:
		return p.parseBinaryMathFunction()

	default:
		return nil, &ParseError{
			Message:    fmt.Sprintf("Unexpected token: %s", p.currentToken.Type),
			Range:      p.currentToken.Range,
			SourceText: p.sourceText,
			ErrorType:  "syntax",
			Suggestion: "Expected number, boolean, identifier, or '('",
		}
	}
}

// parseUnaryFunction handles single-argument functions: ABS, NEGATE, CEIL, FLOOR
func (p *Parser) parseUnaryFunction() (Expression, error) {
	function := p.currentToken.Type
	startRange := p.currentToken.Range

	err := p.advance() // consume function name
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_LPAREN)
	if err != nil {
		return nil, err
	}

	arg, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	endPos := p.currentToken.Range.End
	err = p.expect(TOKEN_RPAREN)
	if err != nil {
		return nil, err
	}

	return &FunctionCall{
		Function: function,
		Args:     []Expression{arg},
		Range:    SourceRange{Start: startRange.Start, End: endPos},
	}, nil
}

// parseThresholdFunction handles THRESHOLD(expr, expr)
func (p *Parser) parseThresholdFunction() (Expression, error) {
	function := p.currentToken.Type
	startRange := p.currentToken.Range

	err := p.advance() // consume 'THRESHOLD'
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_LPAREN)
	if err != nil {
		return nil, err
	}

	arg1, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_COMMA)
	if err != nil {
		return nil, err
	}

	arg2, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	endPos := p.currentToken.Range.End
	err = p.expect(TOKEN_RPAREN)
	if err != nil {
		return nil, err
	}

	return &FunctionCall{
		Function: function,
		Args:     []Expression{arg1, arg2},
		Range:    SourceRange{Start: startRange.Start, End: endPos},
	}, nil
}

// parseITEFunction handles ITE(condition, then, else)
func (p *Parser) parseITEFunction() (Expression, error) {
	function := p.currentToken.Type
	startRange := p.currentToken.Range

	err := p.advance() // consume 'ITE'
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_LPAREN)
	if err != nil {
		return nil, err
	}

	condition, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_COMMA)
	if err != nil {
		return nil, err
	}

	thenExpr, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_COMMA)
	if err != nil {
		return nil, err
	}

	elseExpr, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	endPos := p.currentToken.Range.End
	err = p.expect(TOKEN_RPAREN)
	if err != nil {
		return nil, err
	}

	return &FunctionCall{
		Function: function,
		Args:     []Expression{condition, thenExpr, elseExpr},
		Range:    SourceRange{Start: startRange.Start, End: endPos},
	}, nil
}

// parseBinaryLogicalFunction handles IMPLIES, EQUIV, XOR
func (p *Parser) parseBinaryLogicalFunction() (Expression, error) {
	function := p.currentToken.Type
	startRange := p.currentToken.Range

	err := p.advance() // consume function name
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_LPAREN)
	if err != nil {
		return nil, err
	}

	arg1, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_COMMA)
	if err != nil {
		return nil, err
	}

	arg2, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	endPos := p.currentToken.Range.End
	err = p.expect(TOKEN_RPAREN)
	if err != nil {
		return nil, err
	}

	return &FunctionCall{
		Function: function,
		Args:     []Expression{arg1, arg2},
		Range:    SourceRange{Start: startRange.Start, End: endPos},
	}, nil
}

// parseBinaryMathFunction handles MIN, MAX
func (p *Parser) parseBinaryMathFunction() (Expression, error) {
	function := p.currentToken.Type
	startRange := p.currentToken.Range

	err := p.advance() // consume function name
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_LPAREN)
	if err != nil {
		return nil, err
	}

	arg1, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	err = p.expect(TOKEN_COMMA)
	if err != nil {
		return nil, err
	}

	arg2, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	endPos := p.currentToken.Range.End
	err = p.expect(TOKEN_RPAREN)
	if err != nil {
		return nil, err
	}

	return &FunctionCall{
		Function: function,
		Args:     []Expression{arg1, arg2},
		Range:    SourceRange{Start: startRange.Start, End: endPos},
	}, nil
}

// ===== PUBLIC API =====

// ParseExpression is the main entry point for parsing expressions
func ParseExpression(input string) (Expression, error) {
	parser := NewParser(input)
	return parser.Parse()
}

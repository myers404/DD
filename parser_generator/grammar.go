package parser_generator

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// ===== GRAMMAR AST DEFINITIONS =====

// Grammar represents a complete grammar definition
type Grammar struct {
	Name      string            `json:"name"`
	StartRule string            `json:"startRule"`
	Tokens    []*TokenDef       `json:"tokens"`
	Rules     []*Rule           `json:"rules"`
	Options   map[string]string `json:"options"`
}

// TokenDef defines a terminal token
type TokenDef struct {
	Name     string `json:"name"`
	Pattern  string `json:"pattern"`  // Regex pattern
	Literal  string `json:"literal"`  // Literal string
	Skip     bool   `json:"skip"`     // Skip in parsing (whitespace)
	Fragment bool   `json:"fragment"` // Fragment rule
}

// Rule defines a grammar production rule
type Rule struct {
	Name       string     `json:"name"`
	Expression Expression `json:"expression"`
	Action     string     `json:"action"`  // Semantic action
	ASTNode    string     `json:"astNode"` // AST node type
	Public     bool       `json:"public"`  // Public API
}

// Expression interface for all grammar expressions
type Expression interface {
	String() string
}

// Sequence represents a sequence of expressions (A B C)
type Sequence struct {
	Items []Expression `json:"items"`
}

func (s *Sequence) String() string {
	var parts []string
	for _, item := range s.Items {
		parts = append(parts, item.String())
	}
	return strings.Join(parts, " ")
}

// Choice represents alternatives (A | B | C)
type Choice struct {
	Alternatives []Expression `json:"alternatives"`
}

func (c *Choice) String() string {
	var parts []string
	for _, alt := range c.Alternatives {
		parts = append(parts, alt.String())
	}
	return strings.Join(parts, " | ")
}

// Repetition represents repetition operators (*, +, ?)
type Repetition struct {
	Expression Expression `json:"expression"`
	Min        int        `json:"min"`    // Minimum repetitions
	Max        int        `json:"max"`    // Maximum repetitions (-1 = unlimited)
	Greedy     bool       `json:"greedy"` // Greedy matching
}

func (r *Repetition) String() string {
	expr := r.Expression.String()
	if r.Min == 0 && r.Max == -1 {
		return expr + "*"
	} else if r.Min == 1 && r.Max == -1 {
		return expr + "+"
	} else if r.Min == 0 && r.Max == 1 {
		return expr + "?"
	}
	return fmt.Sprintf("%s{%d,%d}", expr, r.Min, r.Max)
}

// Optional represents optional expressions ([A])
type Optional struct {
	Expression Expression `json:"expression"`
}

func (o *Optional) String() string {
	return "[" + o.Expression.String() + "]"
}

// Group represents grouped expressions ((A))
type Group struct {
	Expression Expression `json:"expression"`
}

func (g *Group) String() string {
	return "(" + g.Expression.String() + ")"
}

// RuleRef represents a reference to another rule
type RuleRef struct {
	Name string `json:"name"`
}

func (r *RuleRef) String() string {
	return r.Name
}

// Literal represents a string literal ("hello")
type Literal struct {
	Value         string `json:"value"`
	CaseSensitive bool   `json:"caseSensitive"`
}

func (l *Literal) String() string {
	if l.CaseSensitive {
		return fmt.Sprintf(`"%s"`, l.Value)
	}
	return fmt.Sprintf(`'%s'`, l.Value)
}

// CharClass represents character classes ([a-z])
type CharClass struct {
	Ranges  []CharRange `json:"ranges"`
	Negated bool        `json:"negated"`
	Chars   string      `json:"chars"`
}

type CharRange struct {
	Start rune `json:"start"`
	End   rune `json:"end"`
}

func (c *CharClass) String() string {
	result := "["
	if c.Negated {
		result += "^"
	}
	result += c.Chars
	for _, r := range c.Ranges {
		if r.Start == r.End {
			result += string(r.Start)
		} else {
			result += fmt.Sprintf("%c-%c", r.Start, r.End)
		}
	}
	return result + "]"
}

// Predicate represents lookahead predicates (&A, !A)
type Predicate struct {
	Expression Expression `json:"expression"`
	Positive   bool       `json:"positive"`
}

func (p *Predicate) String() string {
	if p.Positive {
		return "&" + p.Expression.String()
	}
	return "!" + p.Expression.String()
}

// Helper methods for Grammar
func (g *Grammar) GetRuleByName(name string) *Rule {
	for _, rule := range g.Rules {
		if rule.Name == name {
			return rule
		}
	}
	return nil
}

func (g *Grammar) GetTokenByName(name string) *TokenDef {
	for _, token := range g.Tokens {
		if token.Name == name {
			return token
		}
	}
	return nil
}

// Validation methods
func (t *TokenDef) Validate() error {
	if t.Name == "" {
		return fmt.Errorf("token name cannot be empty")
	}
	if t.Pattern != "" && t.Literal != "" {
		return fmt.Errorf("token cannot have both pattern and literal")
	}
	if t.Pattern == "" && t.Literal == "" {
		return fmt.Errorf("token must have either pattern or literal")
	}
	if t.Pattern != "" {
		if _, err := regexp.Compile(t.Pattern); err != nil {
			return fmt.Errorf("invalid regex pattern: %w", err)
		}
	}
	return nil
}

func (r *Rule) Validate() error {
	if r.Name == "" {
		return fmt.Errorf("rule name cannot be empty")
	}
	if r.Expression == nil {
		return fmt.Errorf("rule must have an expression")
	}
	return nil
}

// ===== GRAMMAR PARSER IMPLEMENTATION =====

// GrammarParser parses grammar definition files
type GrammarParser struct {
	input    string
	position int
	line     int
	column   int
}

// NewGrammarParser creates a new grammar parser
func NewGrammarParser(input string) *GrammarParser {
	return &GrammarParser{
		input:  input,
		line:   1,
		column: 1,
	}
}

// ParseGrammar parses the complete grammar
func (p *GrammarParser) ParseGrammar() (*Grammar, error) {
	grammar := &Grammar{
		Options: make(map[string]string),
	}

	for p.position < len(p.input) {
		p.skipWhitespace()
		if p.position >= len(p.input) {
			break
		}

		ch := p.peek()
		if ch == '\n' || ch == '\r' {
			p.advance()
			continue
		}

		if ch == '%' {
			if err := p.parseDirective(grammar); err != nil {
				return nil, err
			}
		} else if ch == '/' && p.peekNext() == '/' {
			p.skipLineComment()
		} else if ch == '/' && p.peekNext() == '*' {
			p.skipBlockComment()
		} else if unicode.IsLetter(rune(ch)) && p.looksLikeRule() {
			rule, err := p.parseRule()
			if err != nil {
				return nil, err
			}
			grammar.Rules = append(grammar.Rules, rule)
		} else {
			p.advance() // Skip unknown characters
		}
	}

	// Set default start rule
	if grammar.StartRule == "" && len(grammar.Rules) > 0 {
		grammar.StartRule = grammar.Rules[0].Name
	}

	return grammar, nil
}

// looksLikeRule checks if current position starts a rule
func (p *GrammarParser) looksLikeRule() bool {
	saved := p.position
	defer func() { p.position = saved }()

	if !unicode.IsLetter(rune(p.peek())) {
		return false
	}

	// Parse identifier
	for p.position < len(p.input) {
		ch := rune(p.peek())
		if !unicode.IsLetter(ch) && !unicode.IsDigit(ch) && ch != '_' {
			break
		}
		p.advance()
	}

	p.skipWhitespace()

	// Check for "->" arrow
	return p.position+1 < len(p.input) && p.peek() == '-' && p.peekNext() == '>'
}

// parseDirective parses grammar directives (%token, %start, etc.)
func (p *GrammarParser) parseDirective(grammar *Grammar) error {
	p.advance() // consume '%'

	directive := p.parseIdentifier()
	if directive == "" {
		return p.error("expected directive name")
	}

	switch directive {
	case "token":
		return p.parseTokenDirective(grammar)
	case "start":
		return p.parseStartDirective(grammar)
	case "name":
		return p.parseNameDirective(grammar)
	default:
		return p.error("unknown directive: " + directive)
	}
}

// parseTokenDirective parses %token directives
func (p *GrammarParser) parseTokenDirective(grammar *Grammar) error {
	p.skipWhitespace()

	name := p.parseIdentifier()
	if name == "" {
		return p.error("expected token name")
	}

	token := &TokenDef{Name: name}
	p.skipWhitespace()

	// Parse pattern or literal
	if p.peek() == '/' {
		pattern, err := p.parseRegex()
		if err != nil {
			return err
		}
		token.Pattern = pattern
	} else if p.peek() == '"' || p.peek() == '\'' {
		literal, err := p.parseString()
		if err != nil {
			return err
		}
		token.Literal = literal
	} else {
		return p.error("expected token pattern or literal")
	}

	// Parse modifiers
	p.skipWhitespace()
	for unicode.IsLetter(rune(p.peek())) {
		modifier := p.parseIdentifier()
		switch modifier {
		case "skip":
			token.Skip = true
		case "fragment":
			token.Fragment = true
		}
		p.skipWhitespace()
	}

	p.skipToEndOfLine()
	grammar.Tokens = append(grammar.Tokens, token)
	return nil
}

// parseStartDirective parses %start directives
func (p *GrammarParser) parseStartDirective(grammar *Grammar) error {
	p.skipWhitespace()
	name := p.parseIdentifier()
	if name == "" {
		return p.error("expected start rule name")
	}
	grammar.StartRule = name
	p.skipToEndOfLine()
	return nil
}

// parseNameDirective parses %name directives
func (p *GrammarParser) parseNameDirective(grammar *Grammar) error {
	p.skipWhitespace()
	name, err := p.parseString()
	if err != nil {
		return err
	}
	grammar.Name = name
	p.skipToEndOfLine()
	return nil
}

// parseRule parses grammar rules
func (p *GrammarParser) parseRule() (*Rule, error) {
	name := p.parseIdentifier()
	if name == "" {
		return nil, p.error("expected rule name")
	}

	rule := &Rule{Name: name, Public: true}
	p.skipWhitespace()

	// Expect "->" arrow
	if !p.expect("->") {
		return nil, p.error("expected '->' after rule name")
	}

	p.skipWhitespace()
	expr, err := p.parseExpression()
	if err != nil {
		return nil, err
	}
	rule.Expression = expr

	p.skipToEndOfLine()
	return rule, nil
}

// parseExpression parses grammar expressions
func (p *GrammarParser) parseExpression() (Expression, error) {
	return p.parseChoice()
}

// parseChoice parses choice expressions (A | B | C)
func (p *GrammarParser) parseChoice() (Expression, error) {
	left, err := p.parseSequence()
	if err != nil {
		return nil, err
	}

	alternatives := []Expression{left}

	for {
		p.skipWhitespace()
		if p.peek() != '|' {
			break
		}
		p.advance()
		p.skipWhitespace()

		alt, err := p.parseSequence()
		if err != nil {
			return nil, err
		}
		alternatives = append(alternatives, alt)
	}

	if len(alternatives) == 1 {
		return alternatives[0], nil
	}
	return &Choice{Alternatives: alternatives}, nil
}

// parseSequence parses sequence expressions (A B C)
func (p *GrammarParser) parseSequence() (Expression, error) {
	var items []Expression

	for {
		p.skipWhitespace()

		if p.position >= len(p.input) ||
			p.peek() == '|' || p.peek() == ')' || p.peek() == ']' || p.isAtLineEnd() {
			break
		}

		item, err := p.parsePostfix()
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	if len(items) == 0 {
		return nil, p.error("empty sequence")
	}
	if len(items) == 1 {
		return items[0], nil
	}
	return &Sequence{Items: items}, nil
}

// parsePostfix parses postfix operators (*, +, ?)
func (p *GrammarParser) parsePostfix() (Expression, error) {
	expr, err := p.parsePrimary()
	if err != nil {
		return nil, err
	}

	p.skipWhitespace()
	ch := p.peek()

	switch ch {
	case '*':
		p.advance()
		return &Repetition{Expression: expr, Min: 0, Max: -1, Greedy: true}, nil
	case '+':
		p.advance()
		return &Repetition{Expression: expr, Min: 1, Max: -1, Greedy: true}, nil
	case '?':
		p.advance()
		return &Optional{Expression: expr}, nil
	default:
		return expr, nil
	}
}

// parsePrimary parses primary expressions
func (p *GrammarParser) parsePrimary() (Expression, error) {
	p.skipWhitespace()
	ch := p.peek()

	switch {
	case ch == '(':
		return p.parseGroup()
	case ch == '"' || ch == '\'':
		return p.parseLiteralExpression()
	case unicode.IsLetter(rune(ch)):
		return p.parseRuleRef()
	default:
		return nil, p.error("unexpected character in expression")
	}
}

// parseGroup parses grouped expressions ((expr))
func (p *GrammarParser) parseGroup() (Expression, error) {
	p.advance() // consume '('
	p.skipWhitespace()

	expr, err := p.parseExpression()
	if err != nil {
		return nil, err
	}

	p.skipWhitespace()
	if p.peek() != ')' {
		return nil, p.error("expected ')' after grouped expression")
	}
	p.advance()

	return &Group{Expression: expr}, nil
}

// parseLiteralExpression parses string literals
func (p *GrammarParser) parseLiteralExpression() (Expression, error) {
	str, err := p.parseString()
	if err != nil {
		return nil, err
	}
	return &Literal{Value: str, CaseSensitive: true}, nil
}

// parseRuleRef parses rule references
func (p *GrammarParser) parseRuleRef() (Expression, error) {
	name := p.parseIdentifier()
	if name == "" {
		return nil, p.error("expected identifier")
	}
	return &RuleRef{Name: name}, nil
}

// Utility methods
func (p *GrammarParser) peek() byte {
	if p.position >= len(p.input) {
		return 0
	}
	return p.input[p.position]
}

func (p *GrammarParser) peekNext() byte {
	if p.position+1 >= len(p.input) {
		return 0
	}
	return p.input[p.position+1]
}

func (p *GrammarParser) advance() byte {
	if p.position >= len(p.input) {
		return 0
	}
	ch := p.input[p.position]
	p.position++
	if ch == '\n' {
		p.line++
		p.column = 1
	} else {
		p.column++
	}
	return ch
}

func (p *GrammarParser) skipWhitespace() {
	for p.position < len(p.input) {
		ch := p.peek()
		if ch == ' ' || ch == '\t' {
			p.advance()
		} else {
			break
		}
	}
}

func (p *GrammarParser) skipToEndOfLine() {
	for p.position < len(p.input) {
		ch := p.peek()
		if ch == '\n' || ch == '\r' {
			break
		}
		p.advance()
	}
}

func (p *GrammarParser) skipLineComment() {
	p.advance() // consume '/'
	p.advance() // consume '/'
	for p.position < len(p.input) && p.peek() != '\n' {
		p.advance()
	}
}

func (p *GrammarParser) skipBlockComment() {
	p.advance() // consume '/'
	p.advance() // consume '*'
	for p.position < len(p.input)-1 {
		if p.peek() == '*' && p.peekNext() == '/' {
			p.advance()
			p.advance()
			break
		}
		p.advance()
	}
}

func (p *GrammarParser) parseIdentifier() string {
	start := p.position
	if !unicode.IsLetter(rune(p.peek())) {
		return ""
	}
	for p.position < len(p.input) {
		ch := rune(p.peek())
		if !unicode.IsLetter(ch) && !unicode.IsDigit(ch) && ch != '_' {
			break
		}
		p.advance()
	}
	return p.input[start:p.position]
}

func (p *GrammarParser) parseString() (string, error) {
	quote := p.peek()
	if quote != '"' && quote != '\'' {
		return "", p.error("expected string literal")
	}

	p.advance() // consume quote
	start := p.position

	for p.position < len(p.input) {
		ch := p.peek()
		if ch == quote {
			result := p.input[start:p.position]
			p.advance() // consume closing quote
			return result, nil
		}
		if ch == '\\' {
			p.advance() // skip backslash
		}
		p.advance()
	}

	return "", p.error("unterminated string literal")
}

func (p *GrammarParser) parseRegex() (string, error) {
	if p.peek() != '/' {
		return "", p.error("expected regex literal")
	}

	p.advance() // consume '/'
	start := p.position

	for p.position < len(p.input) {
		ch := p.peek()
		if ch == '/' {
			result := p.input[start:p.position]
			p.advance() // consume '/'

			// Validate regex
			if _, err := regexp.Compile(result); err != nil {
				return "", fmt.Errorf("invalid regex: %w", err)
			}
			return result, nil
		}
		if ch == '\\' {
			p.advance() // skip backslash
		}
		p.advance()
	}

	return "", p.error("unterminated regex literal")
}

func (p *GrammarParser) parseNumber() (int, error) {
	start := p.position
	if !unicode.IsDigit(rune(p.peek())) {
		return 0, p.error("expected number")
	}
	for p.position < len(p.input) && unicode.IsDigit(rune(p.peek())) {
		p.advance()
	}
	numStr := p.input[start:p.position]
	return strconv.Atoi(numStr)
}

func (p *GrammarParser) expect(expected string) bool {
	if p.position+len(expected) > len(p.input) {
		return false
	}
	if p.input[p.position:p.position+len(expected)] == expected {
		for range expected {
			p.advance()
		}
		return true
	}
	return false
}

func (p *GrammarParser) isAtLineEnd() bool {
	ch := p.peek()
	return ch == '\n' || ch == '\r' || p.position >= len(p.input)
}

func (p *GrammarParser) error(message string) error {
	return fmt.Errorf("parse error at line %d, column %d: %s", p.line, p.column, message)
}

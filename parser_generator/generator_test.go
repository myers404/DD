package parser_generator

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestGrammarParser tests the grammar parser functionality
func TestGrammarParser(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		wantErr  bool
		expected func(*Grammar) bool
	}{
		{
			name: "simple grammar",
			input: `%name "Test Grammar"
%start expr

%token NUMBER /\d+/
%token PLUS "+"

expr -> NUMBER PLUS NUMBER`,
			wantErr: false,
			expected: func(g *Grammar) bool {
				return g.Name == "Test Grammar" &&
					g.StartRule == "expr" &&
					len(g.Tokens) == 2 &&
					len(g.Rules) == 1
			},
		},
		{
			name: "grammar with choices",
			input: `%name "Choice Grammar"
%start expr

%token NUMBER /\d+/
%token IDENTIFIER /[a-zA-Z]+/

expr -> NUMBER | IDENTIFIER`,
			wantErr: false,
			expected: func(g *Grammar) bool {
				return len(g.Rules) == 1 &&
					len(g.Rules[0].Expression.(*Choice).Alternatives) == 2
			},
		},
		{
			name: "grammar with repetition",
			input: `%name "Repetition Grammar"
%start list

%token NUMBER /\d+/
%token COMMA ","

list -> NUMBER (COMMA NUMBER)*`,
			wantErr: false,
			expected: func(g *Grammar) bool {
				return len(g.Rules) == 1
			},
		},
		{
			name: "grammar with undefined reference",
			input: `%name "Bad Grammar"
%start expr

%token PLUS "+"

expr -> NUMBER`,
			wantErr: false, // Parser succeeds, but validation will fail
			expected: func(g *Grammar) bool {
				return g.Name == "Bad Grammar" && len(g.Rules) == 1
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			parser := NewGrammarParser(tt.input)
			grammar, err := parser.ParseGrammar()

			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if tt.expected != nil && !tt.expected(grammar) {
				t.Errorf("Grammar validation failed")
			}
		})
	}
}

// TestGrammarValidation tests grammar validation functionality
func TestGrammarValidation(t *testing.T) {
	config := &Config{
		PackageName: "testparser",
		ModuleName:  "testparser",
	}
	generator := NewGenerator(config)

	tests := []struct {
		name    string
		grammar *Grammar
		wantErr bool
		errMsg  string
	}{
		{
			name: "valid grammar",
			grammar: &Grammar{
				Name:      "Valid",
				StartRule: "expr",
				Tokens: []*TokenDef{
					{Name: "NUMBER", Pattern: `\d+`},
					{Name: "PLUS", Literal: "+"},
				},
				Rules: []*Rule{
					{Name: "expr", Expression: &RuleRef{Name: "NUMBER"}},
				},
				Options: make(map[string]string),
			},
			wantErr: false,
		},
		{
			name: "undefined token reference",
			grammar: &Grammar{
				Name:      "Invalid",
				StartRule: "expr",
				Tokens: []*TokenDef{
					{Name: "PLUS", Literal: "+"},
				},
				Rules: []*Rule{
					{Name: "expr", Expression: &RuleRef{Name: "UNDEFINED"}},
				},
				Options: make(map[string]string),
			},
			wantErr: true,
			errMsg:  "undefined rule or token",
		},
		{
			name: "no tokens defined",
			grammar: &Grammar{
				Name:      "Invalid",
				StartRule: "expr",
				Tokens:    []*TokenDef{},
				Rules: []*Rule{
					{Name: "expr", Expression: &RuleRef{Name: "NUMBER"}},
				},
				Options: make(map[string]string),
			},
			wantErr: true,
			errMsg:  "must define at least one token",
		},
		{
			name: "duplicate token names",
			grammar: &Grammar{
				Name:      "Invalid",
				StartRule: "expr",
				Tokens: []*TokenDef{
					{Name: "TOKEN", Pattern: `\d+`},
					{Name: "TOKEN", Literal: "+"},
				},
				Rules: []*Rule{
					{Name: "expr", Expression: &RuleRef{Name: "TOKEN"}},
				},
				Options: make(map[string]string),
			},
			wantErr: true,
			errMsg:  "duplicate token name",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := generator.Validate(tt.grammar)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got none")
				} else if tt.errMsg != "" && !strings.Contains(err.Error(), tt.errMsg) {
					t.Errorf("Expected error containing '%s', got: %v", tt.errMsg, err)
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
			}
		})
	}
}

// TestGoGeneration tests Go code generation
func TestGoGeneration(t *testing.T) {
	config := &Config{
		PackageName: "testparser",
		ModuleName:  "testparser",
	}
	generator := NewGenerator(config)

	grammar := &Grammar{
		Name:      "Test Expression Language",
		StartRule: "expression",
		Tokens: []*TokenDef{
			{Name: "NUMBER", Pattern: `\d+(\.\d+)?`},
			{Name: "IDENTIFIER", Pattern: `[a-zA-Z][a-zA-Z0-9_]*`},
			{Name: "PLUS", Literal: "+"},
			{Name: "MINUS", Literal: "-"},
			{Name: "MULTIPLY", Literal: "*"},
			{Name: "DIVIDE", Literal: "/"},
			{Name: "LPAREN", Literal: "("},
			{Name: "RPAREN", Literal: ")"},
			{Name: "WHITESPACE", Pattern: `\s+`, Skip: true},
		},
		Rules: []*Rule{
			{Name: "expression", Expression: &RuleRef{Name: "term"}},
			{Name: "term", Expression: &RuleRef{Name: "factor"}},
			{Name: "factor", Expression: &Choice{
				Alternatives: []Expression{
					&RuleRef{Name: "NUMBER"},
					&RuleRef{Name: "IDENTIFIER"},
					&Sequence{Items: []Expression{
						&RuleRef{Name: "LPAREN"},
						&RuleRef{Name: "expression"},
						&RuleRef{Name: "RPAREN"},
					}},
				},
			}},
		},
		Options: make(map[string]string),
	}

	tempDir := t.TempDir()

	err := generator.GenerateGo(grammar, tempDir)
	if err != nil {
		t.Fatalf("Go generation failed: %v", err)
	}

	// Check that parser.go was created
	parserPath := filepath.Join(tempDir, "parser.go")
	if _, err := os.Stat(parserPath); os.IsNotExist(err) {
		t.Errorf("Expected parser.go was not created")
	}

	// Read generated code and verify basic structure
	content, err := os.ReadFile(parserPath)
	if err != nil {
		t.Fatalf("Failed to read generated file: %v", err)
	}

	codeStr := string(content)

	// Check for essential components
	requiredElements := []string{
		"package testparser",
		"type TokenType int",
		"type Lexer struct",
		"type Parser struct",
		"func NewLexer",
		"func NewParser",
		"func ParseExpression",
	}

	for _, element := range requiredElements {
		if !strings.Contains(codeStr, element) {
			t.Errorf("Generated Go code missing: %s", element)
		}
	}
}

// TestTypeScriptGeneration tests TypeScript code generation
func TestTypeScriptGeneration(t *testing.T) {
	config := &Config{
		PackageName: "testparser",
		ModuleName:  "testparser",
	}
	generator := NewGenerator(config)

	grammar := &Grammar{
		Name:      "Test Expression Language",
		StartRule: "expression",
		Tokens: []*TokenDef{
			{Name: "NUMBER", Pattern: `\d+(\.\d+)?`},
			{Name: "IDENTIFIER", Pattern: `[a-zA-Z][a-zA-Z0-9_]*`},
			{Name: "PLUS", Literal: "+"},
			{Name: "WHITESPACE", Pattern: `\s+`, Skip: true},
		},
		Rules: []*Rule{
			{Name: "expression", Expression: &RuleRef{Name: "NUMBER"}},
		},
		Options: make(map[string]string),
	}

	tempDir := t.TempDir()

	err := generator.GenerateTypeScript(grammar, tempDir)
	if err != nil {
		t.Fatalf("TypeScript generation failed: %v", err)
	}

	// Check that parser.ts was created
	parserPath := filepath.Join(tempDir, "parser.ts")
	if _, err := os.Stat(parserPath); os.IsNotExist(err) {
		t.Errorf("Expected parser.ts was not created")
	}

	// Read generated code and verify basic structure
	content, err := os.ReadFile(parserPath)
	if err != nil {
		t.Fatalf("Failed to read generated file: %v", err)
	}

	codeStr := string(content)

	// Check for essential components
	requiredElements := []string{
		"export enum TokenType",
		"export class Lexer",
		"export class Parser",
		"export function parseExpression",
		"export interface Expression",
	}

	for _, element := range requiredElements {
		if !strings.Contains(codeStr, element) {
			t.Errorf("Generated TypeScript code missing: %s", element)
		}
	}
}

// TestExpressionAST tests the expression AST functionality
func TestExpressionAST(t *testing.T) {
	// Test number expression
	numExpr := &NumberExpr{Value: 42.5, Pos: 0}
	if numExpr.GetType() != TypeNumber {
		t.Errorf("Number expression should have number type")
	}
	if numExpr.String() != "42.5" {
		t.Errorf("Number expression string representation incorrect")
	}

	// Test boolean expression
	boolExpr := &BooleanExpr{Value: true, Pos: 0}
	if boolExpr.GetType() != TypeBoolean {
		t.Errorf("Boolean expression should have boolean type")
	}
	if boolExpr.String() != "true" {
		t.Errorf("Boolean expression string representation incorrect")
	}

	// Test identifier expression
	idExpr := &IdentifierExpr{Name: "variable", Pos: 0}
	if idExpr.GetType() != TypeUnknown {
		t.Errorf("Identifier expression should have unknown type")
	}
	if idExpr.String() != "variable" {
		t.Errorf("Identifier expression string representation incorrect")
	}

	// Test binary expression
	binExpr := &BinaryExpr{
		Left:     numExpr,
		Operator: "+",
		Right:    &NumberExpr{Value: 10, Pos: 0},
		Pos:      0,
	}
	if binExpr.GetType() != TypeNumber {
		t.Errorf("Arithmetic binary expression should have number type")
	}

	// Test variable collection
	complexExpr := &BinaryExpr{
		Left:     &IdentifierExpr{Name: "x", Pos: 0},
		Operator: "+",
		Right:    &IdentifierExpr{Name: "y", Pos: 0},
		Pos:      0,
	}

	variables := CollectVariables(complexExpr)
	if len(variables) != 2 {
		t.Errorf("Expected 2 variables, got %d", len(variables))
	}

	expectedVars := map[string]bool{"x": true, "y": true}
	for _, v := range variables {
		if !expectedVars[v] {
			t.Errorf("Unexpected variable: %s", v)
		}
	}
}

// TestTypeValidation tests expression type validation
func TestTypeValidation(t *testing.T) {
	tests := []struct {
		name    string
		expr    ExprNode
		wantErr bool
	}{
		{
			name: "valid arithmetic",
			expr: &BinaryExpr{
				Left:     &NumberExpr{Value: 5, Pos: 0},
				Operator: "+",
				Right:    &NumberExpr{Value: 3, Pos: 0},
			},
			wantErr: false,
		},
		{
			name: "invalid arithmetic - boolean operand",
			expr: &BinaryExpr{
				Left:     &BooleanExpr{Value: true, Pos: 0},
				Operator: "+",
				Right:    &NumberExpr{Value: 3, Pos: 0},
			},
			wantErr: true,
		},
		{
			name: "valid logical",
			expr: &BinaryExpr{
				Left:     &BooleanExpr{Value: true, Pos: 0},
				Operator: "&&",
				Right:    &BooleanExpr{Value: false, Pos: 0},
			},
			wantErr: false,
		},
		{
			name: "valid unary negation",
			expr: &UnaryExpr{
				Operator: "-",
				Operand:  &NumberExpr{Value: 5, Pos: 0},
			},
			wantErr: false,
		},
		{
			name: "invalid unary negation - boolean operand",
			expr: &UnaryExpr{
				Operator: "-",
				Operand:  &BooleanExpr{Value: true, Pos: 0},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidateTypes(tt.expr)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected type validation error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected type validation error: %v", err)
				}
			}
		})
	}
}

// TestLeftRecursionDetection tests left recursion detection
func TestLeftRecursionDetection(t *testing.T) {
	config := &Config{
		PackageName: "testparser",
		ModuleName:  "testparser",
	}
	generator := NewGenerator(config)

	// Grammar with direct left recursion
	leftRecursiveGrammar := &Grammar{
		Name:      "Left Recursive",
		StartRule: "expr",
		Tokens: []*TokenDef{
			{Name: "NUMBER", Pattern: `\d+`},
			{Name: "PLUS", Literal: "+"},
		},
		Rules: []*Rule{
			{Name: "expr", Expression: &Sequence{Items: []Expression{
				&RuleRef{Name: "expr"},
				&RuleRef{Name: "PLUS"},
				&RuleRef{Name: "NUMBER"},
			}}},
		},
		Options: make(map[string]string),
	}

	err := generator.Validate(leftRecursiveGrammar)
	if err == nil {
		t.Errorf("Expected left recursion error but got none")
	}
	if !strings.Contains(err.Error(), "left recursion") {
		t.Errorf("Expected left recursion error, got: %v", err)
	}

	// Grammar without left recursion
	validGrammar := &Grammar{
		Name:      "Valid",
		StartRule: "expr",
		Tokens: []*TokenDef{
			{Name: "NUMBER", Pattern: `\d+`},
			{Name: "PLUS", Literal: "+"},
		},
		Rules: []*Rule{
			{Name: "expr", Expression: &Sequence{Items: []Expression{
				&RuleRef{Name: "NUMBER"},
				&RuleRef{Name: "PLUS"},
				&RuleRef{Name: "expr"},
			}}},
		},
		Options: make(map[string]string),
	}

	err = generator.Validate(validGrammar)
	if err != nil {
		t.Errorf("Unexpected validation error for valid grammar: %v", err)
	}
}

// BenchmarkGeneration benchmarks parser generation performance
func BenchmarkGeneration(b *testing.B) {
	config := &Config{
		PackageName: "benchparser",
		ModuleName:  "benchparser",
	}

	grammar := &Grammar{
		Name:      "Benchmark Grammar",
		StartRule: "expression",
		Tokens: []*TokenDef{
			{Name: "NUMBER", Pattern: `\d+(\.\d+)?`},
			{Name: "IDENTIFIER", Pattern: `[a-zA-Z][a-zA-Z0-9_]*`},
			{Name: "PLUS", Literal: "+"},
			{Name: "MINUS", Literal: "-"},
			{Name: "MULTIPLY", Literal: "*"},
			{Name: "DIVIDE", Literal: "/"},
			{Name: "LPAREN", Literal: "("},
			{Name: "RPAREN", Literal: ")"},
			{Name: "WHITESPACE", Pattern: `\s+`, Skip: true},
		},
		Rules: []*Rule{
			{Name: "expression", Expression: &RuleRef{Name: "term"}},
			{Name: "term", Expression: &RuleRef{Name: "factor"}},
			{Name: "factor", Expression: &Choice{
				Alternatives: []Expression{
					&RuleRef{Name: "NUMBER"},
					&RuleRef{Name: "IDENTIFIER"},
				},
			}},
		},
		Options: make(map[string]string),
	}

	b.Run("Go Generation", func(b *testing.B) {
		generator := NewGenerator(config)
		tempDir := b.TempDir()

		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			err := generator.GenerateGo(grammar, tempDir)
			if err != nil {
				b.Fatalf("Go generation failed: %v", err)
			}
		}
	})

	b.Run("TypeScript Generation", func(b *testing.B) {
		generator := NewGenerator(config)
		tempDir := b.TempDir()

		b.ResetTimer()
		for i := 0; i < b.N; i++ {
			err := generator.GenerateTypeScript(grammar, tempDir)
			if err != nil {
				b.Fatalf("TypeScript generation failed: %v", err)
			}
		}
	})
}

// TestPrettyPrint tests expression pretty printing
func TestPrettyPrint(t *testing.T) {
	expr := &BinaryExpr{
		Left:     &IdentifierExpr{Name: "x", Pos: 0},
		Operator: "+",
		Right: &CallExpr{
			Function: "sqrt",
			Args: []ExprNode{
				&NumberExpr{Value: 16, Pos: 0},
			},
			Pos: 0,
		},
		Pos: 0,
	}

	result := PrettyPrint(expr)
	expected := "(x + sqrt(16))"

	if result != expected {
		t.Errorf("Pretty print result '%s' doesn't match expected '%s'", result, expected)
	}
}

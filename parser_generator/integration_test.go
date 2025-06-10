// integration_test.go - Comprehensive Integration Test
// Tests the complete parser generator workflow

package parser_generator

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestCompleteWorkflow tests the entire parser generation workflow
func TestCompleteWorkflow(t *testing.T) {
	config := &Config{
		PackageName: "integration",
		ModuleName:  "integration",
	}

	generator := NewGenerator(config)
	tempDir := t.TempDir()

	// Step 1: Create a comprehensive grammar
	grammarContent := `%name "Integration Test Language"
%start program

%token NUMBER /\d+(\.\d+)?/
%token IDENTIFIER /[a-zA-Z][a-zA-Z0-9_]*/
%token STRING /"([^"\\]|\\.)*"/
%token PLUS "+"
%token MINUS "-"
%token MULTIPLY "*"
%token DIVIDE "/"
%token ASSIGN "="
%token EQ "=="
%token LT "<"
%token GT ">"
%token LPAREN "("
%token RPAREN ")"
%token LBRACE "{"
%token RBRACE "}"
%token SEMICOLON ";"
%token IF "if"
%token ELSE "else"
%token WHILE "while"
%token WHITESPACE /\s+/ skip

program -> statement_list

statement_list -> statement*

statement -> assignment | if_statement | while_statement | expression_statement

assignment -> IDENTIFIER ASSIGN expression SEMICOLON

if_statement -> IF LPAREN expression RPAREN LBRACE statement_list RBRACE

while_statement -> WHILE LPAREN expression RPAREN LBRACE statement_list RBRACE

expression_statement -> expression SEMICOLON

expression -> comparison

comparison -> addition (EQ addition | LT addition | GT addition)*

addition -> multiplication (PLUS multiplication | MINUS multiplication)*

multiplication -> unary (MULTIPLY unary | DIVIDE unary)*

unary -> MINUS unary | primary

primary -> NUMBER | STRING | IDENTIFIER | LPAREN expression RPAREN
`

	grammarFile := filepath.Join(tempDir, "test.grammar")
	if err := os.WriteFile(grammarFile, []byte(grammarContent), 0644); err != nil {
		t.Fatalf("Failed to write grammar file: %v", err)
	}

	// Step 2: Parse the grammar
	grammar, err := ParseGrammarFile(grammarFile)
	if err != nil {
		t.Fatalf("Failed to parse grammar: %v", err)
	}

	// Verify grammar structure
	if grammar.Name != "Integration Test Language" {
		t.Errorf("Expected grammar name 'Integration Test Language', got '%s'", grammar.Name)
	}

	if grammar.StartRule != "program" {
		t.Errorf("Expected start rule 'program', got '%s'", grammar.StartRule)
	}

	if len(grammar.Tokens) < 10 {
		t.Errorf("Expected at least 10 tokens, got %d", len(grammar.Tokens))
	}

	if len(grammar.Rules) < 5 {
		t.Errorf("Expected at least 5 rules, got %d", len(grammar.Rules))
	}

	// Step 3: Validate the grammar
	if err := generator.Validate(grammar); err != nil {
		t.Fatalf("Grammar validation failed: %v", err)
	}

	// Step 4: Generate Go parser
	goDir := filepath.Join(tempDir, "go")
	if err := generator.GenerateGo(grammar, goDir); err != nil {
		t.Fatalf("Go generation failed: %v", err)
	}

	// Verify Go parser was created
	goParserFile := filepath.Join(goDir, "parser.go")
	if _, err := os.Stat(goParserFile); os.IsNotExist(err) {
		t.Fatalf("Go parser file was not created")
	}

	// Read and verify Go parser content
	goContent, err := os.ReadFile(goParserFile)
	if err != nil {
		t.Fatalf("Failed to read Go parser: %v", err)
	}

	goCode := string(goContent)

	// Check for essential Go components
	goRequirements := []string{
		"package integration",
		"type TokenType int",
		"type Lexer struct",
		"type Parser struct",
		"func NewLexer",
		"func NewParser",
		"func ParseExpression",
		"TOKEN_NUMBER",
		"TOKEN_IDENTIFIER",
		"TOKEN_PLUS",
	}

	for _, req := range goRequirements {
		if !strings.Contains(goCode, req) {
			t.Errorf("Go parser missing required element: %s", req)
		}
	}

	// Step 5: Generate TypeScript parser
	tsDir := filepath.Join(tempDir, "typescript")
	if err := generator.GenerateTypeScript(grammar, tsDir); err != nil {
		t.Fatalf("TypeScript generation failed: %v", err)
	}

	// Verify TypeScript parser was created
	tsParserFile := filepath.Join(tsDir, "parser.ts")
	if _, err := os.Stat(tsParserFile); os.IsNotExist(err) {
		t.Fatalf("TypeScript parser file was not created")
	}

	// Read and verify TypeScript parser content
	tsContent, err := os.ReadFile(tsParserFile)
	if err != nil {
		t.Fatalf("Failed to read TypeScript parser: %v", err)
	}

	tsCode := string(tsContent)

	// Check for essential TypeScript components
	tsRequirements := []string{
		"export enum TokenType",
		"export class Lexer",
		"export class Parser",
		"export function parseExpression",
		"NUMBER = 'NUMBER'",
		"IDENTIFIER = 'IDENTIFIER'",
		"PLUS = 'PLUS'",
	}

	for _, req := range tsRequirements {
		if !strings.Contains(tsCode, req) {
			t.Errorf("TypeScript parser missing required element: %s", req)
		}
	}

	// Step 6: Verify parser quality metrics
	goLines := len(strings.Split(goCode, "\n"))
	tsLines := len(strings.Split(tsCode, "\n"))

	if goLines < 100 {
		t.Errorf("Go parser seems too small (%d lines), might be incomplete", goLines)
	}

	if tsLines < 100 {
		t.Errorf("TypeScript parser seems too small (%d lines), might be incomplete", tsLines)
	}

	// Check that both parsers have similar complexity
	lineDiff := goLines - tsLines
	if lineDiff < 0 {
		lineDiff = -lineDiff
	}

	// Allow up to 50% difference in line count
	maxDiff := (goLines + tsLines) / 4
	if lineDiff > maxDiff {
		t.Logf("Warning: Large difference in parser sizes (Go: %d lines, TS: %d lines)",
			goLines, tsLines)
	}

	t.Logf("Successfully generated parsers - Go: %d lines, TypeScript: %d lines",
		goLines, tsLines)
}

// TestErrorHandling tests various error conditions
func TestErrorHandling(t *testing.T) {
	config := &Config{
		PackageName: "errortest",
		ModuleName:  "errortest",
	}

	generator := NewGenerator(config)

	testCases := []struct {
		name        string
		grammar     string
		expectError bool
		errorMsg    string
	}{
		{
			name:        "empty grammar",
			grammar:     "",
			expectError: true,
			errorMsg:    "grammar must have a name",
		},
		{
			name: "invalid token pattern",
			grammar: `%name "Test"
%start expr
%token BAD /[/
expr -> BAD`,
			expectError: true,
			errorMsg:    "invalid regex",
		},
		{
			name: "undefined token reference",
			grammar: `%name "Test"
%start expr
%token GOOD "+"
expr -> BAD`,
			expectError: true,
			errorMsg:    "undefined",
		},
		{
			name: "left recursive grammar",
			grammar: `%name "Test"
%start expr
%token NUM /\d+/
expr -> expr NUM`,
			expectError: true,
			errorMsg:    "left recursion",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tempDir := t.TempDir()
			grammarFile := filepath.Join(tempDir, "test.grammar")

			if err := os.WriteFile(grammarFile, []byte(tc.grammar), 0644); err != nil {
				t.Fatalf("Failed to write grammar file: %v", err)
			}

			grammar, err := ParseGrammarFile(grammarFile)

			if tc.expectError {
				if err == nil {
					err = generator.Validate(grammar)
				}

				if err == nil {
					t.Errorf("Expected error but got none")
				} else if !strings.Contains(err.Error(), tc.errorMsg) {
					t.Errorf("Expected error containing '%s', got: %v", tc.errorMsg, err)
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
			}
		})
	}
}

// TestGrammarFeatures tests various grammar features
func TestGrammarFeatures(t *testing.T) {
	testCases := []struct {
		name    string
		grammar string
		feature string
	}{
		{
			name: "choice operator",
			grammar: `%name "Test"
%start expr
%token A "a"
%token B "b"
expr -> A | B`,
			feature: "choice",
		},
		{
			name: "sequence",
			grammar: `%name "Test"
%start expr
%token A "a"
%token B "b"
expr -> A B`,
			feature: "sequence",
		},
		{
			name: "repetition",
			grammar: `%name "Test"
%start list
%token ITEM "item"
%token COMMA ","
list -> ITEM (COMMA ITEM)*`,
			feature: "repetition",
		},
		{
			name: "optional",
			grammar: `%name "Test"
%start expr
%token A "a"
%token B "b"
expr -> A B?`,
			feature: "optional",
		},
		{
			name: "grouping",
			grammar: `%name "Test"
%start expr
%token A "a"
%token B "b"
%token C "c"
expr -> (A | B) C`,
			feature: "grouping",
		},
	}

	config := &Config{
		PackageName: "featuretest",
		ModuleName:  "featuretest",
	}

	generator := NewGenerator(config)

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			tempDir := t.TempDir()
			grammarFile := filepath.Join(tempDir, "test.grammar")

			if err := os.WriteFile(grammarFile, []byte(tc.grammar), 0644); err != nil {
				t.Fatalf("Failed to write grammar file: %v", err)
			}

			grammar, err := ParseGrammarFile(grammarFile)
			if err != nil {
				t.Fatalf("Failed to parse grammar: %v", err)
			}

			if err := generator.Validate(grammar); err != nil {
				t.Fatalf("Grammar validation failed: %v", err)
			}

			// Try to generate a parser to ensure the feature works
			outputDir := filepath.Join(tempDir, "output")
			if err := generator.GenerateGo(grammar, outputDir); err != nil {
				t.Fatalf("Failed to generate parser for %s feature: %v", tc.feature, err)
			}

			// Verify parser was created
			parserFile := filepath.Join(outputDir, "parser.go")
			if _, err := os.Stat(parserFile); os.IsNotExist(err) {
				t.Fatalf("Parser file was not created for %s feature", tc.feature)
			}

			t.Logf("Successfully tested %s feature", tc.feature)
		})
	}
}

// TestCrossLanguageConsistency tests that Go and TypeScript output is consistent
func TestCrossLanguageConsistency(t *testing.T) {
	config := &Config{
		PackageName: "consistency",
		ModuleName:  "consistency",
	}

	generator := NewGenerator(config)
	tempDir := t.TempDir()

	// Create a test grammar
	grammarContent := `%name "Consistency Test"
%start expr

%token NUMBER /\d+/
%token PLUS "+"
%token MINUS "-"
%token LPAREN "("
%token RPAREN ")"
%token WHITESPACE /\s+/ skip

expr -> term (PLUS term | MINUS term)*
term -> NUMBER | LPAREN expr RPAREN
`

	grammarFile := filepath.Join(tempDir, "test.grammar")
	if err := os.WriteFile(grammarFile, []byte(grammarContent), 0644); err != nil {
		t.Fatalf("Failed to write grammar file: %v", err)
	}

	grammar, err := ParseGrammarFile(grammarFile)
	if err != nil {
		t.Fatalf("Failed to parse grammar: %v", err)
	}

	// Generate both parsers
	goDir := filepath.Join(tempDir, "go")
	tsDir := filepath.Join(tempDir, "typescript")

	if err := generator.GenerateGo(grammar, goDir); err != nil {
		t.Fatalf("Go generation failed: %v", err)
	}

	if err := generator.GenerateTypeScript(grammar, tsDir); err != nil {
		t.Fatalf("TypeScript generation failed: %v", err)
	}

	// Read both generated files
	goContent, err := os.ReadFile(filepath.Join(goDir, "parser.go"))
	if err != nil {
		t.Fatalf("Failed to read Go parser: %v", err)
	}

	tsContent, err := os.ReadFile(filepath.Join(tsDir, "parser.ts"))
	if err != nil {
		t.Fatalf("Failed to read TypeScript parser: %v", err)
	}

	goCode := string(goContent)
	tsCode := string(tsContent)

	// Check for consistent token definitions
	tokens := []string{"NUMBER", "PLUS", "MINUS", "LPAREN", "RPAREN"}

	for _, token := range tokens {
		goHasToken := strings.Contains(goCode, "TOKEN_"+token)
		tsHasToken := strings.Contains(tsCode, token+" = '"+token+"'")

		if !goHasToken {
			t.Errorf("Go parser missing token: %s", token)
		}

		if !tsHasToken {
			t.Errorf("TypeScript parser missing token: %s", token)
		}
	}

	// Check for consistent parsing methods
	rules := []string{"expr", "term"}

	for _, rule := range rules {
		goMethod := "parse" + strings.Title(rule)
		tsMethod := "parse" + strings.Title(rule)

		goHasMethod := strings.Contains(goCode, "func (p *Parser) "+goMethod)
		tsHasMethod := strings.Contains(tsCode, "private "+tsMethod+"()")

		if !goHasMethod {
			t.Errorf("Go parser missing method: %s", goMethod)
		}

		if !tsHasMethod {
			t.Errorf("TypeScript parser missing method: %s", tsMethod)
		}
	}
	
	if !strings.Contains(goCode, "func ParseExpression") {
		t.Errorf("Go parser missing public API: ParseExpression")
	}

	if !strings.Contains(tsCode, "export function parseExpression") {
		t.Errorf("TypeScript parser missing public API: parseExpression")
	}

	t.Logf("Cross-language consistency verified")
}

// BenchmarkParserGeneration benchmarks the parser generation process
func BenchmarkParserGeneration(b *testing.B) {
	config := &Config{
		PackageName: "benchmark",
		ModuleName:  "benchmark",
	}

	// Create a medium-complexity grammar
	grammarContent := `%name "Benchmark Grammar"
%start program

%token NUMBER /\d+(\.\d+)?/
%token IDENTIFIER /[a-zA-Z][a-zA-Z0-9_]*/
%token STRING /"([^"\\]|\\.)*"/
%token PLUS "+"
%token MINUS "-"
%token MULTIPLY "*"
%token DIVIDE "/"
%token ASSIGN "="
%token EQ "=="
%token LT "<"
%token LPAREN "("
%token RPAREN ")"
%token SEMICOLON ";"
%token WHITESPACE /\s+/ skip

program -> statement*
statement -> assignment | expression_statement
assignment -> IDENTIFIER ASSIGN expression SEMICOLON  
expression_statement -> expression SEMICOLON
expression -> comparison
comparison -> addition (EQ addition | LT addition)*
addition -> multiplication ((PLUS | MINUS) multiplication)*
multiplication -> unary ((MULTIPLY | DIVIDE) unary)*
unary -> MINUS unary | primary
primary -> NUMBER | STRING | IDENTIFIER | LPAREN expression RPAREN
`

	tempDir := b.TempDir()
	grammarFile := filepath.Join(tempDir, "bench.grammar")

	if err := os.WriteFile(grammarFile, []byte(grammarContent), 0644); err != nil {
		b.Fatalf("Failed to write grammar file: %v", err)
	}

	grammar, err := ParseGrammarFile(grammarFile)
	if err != nil {
		b.Fatalf("Failed to parse grammar: %v", err)
	}

	generator := NewGenerator(config)

	b.Run("Go Generation", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			outputDir := filepath.Join(tempDir, "bench_go", fmt.Sprintf("run_%d", i))
			err := generator.GenerateGo(grammar, outputDir)
			if err != nil {
				b.Fatalf("Go generation failed: %v", err)
			}
		}
	})

	b.Run("TypeScript Generation", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			outputDir := filepath.Join(tempDir, "bench_ts", fmt.Sprintf("run_%d", i))
			err := generator.GenerateTypeScript(grammar, outputDir)
			if err != nil {
				b.Fatalf("TypeScript generation failed: %v", err)
			}
		}
	})

	b.Run("Grammar Parsing", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			_, err := ParseGrammarFile(grammarFile)
			if err != nil {
				b.Fatalf("Grammar parsing failed: %v", err)
			}
		}
	})

	b.Run("Grammar Validation", func(b *testing.B) {
		for i := 0; i < b.N; i++ {
			err := generator.Validate(grammar)
			if err != nil {
				b.Fatalf("Grammar validation failed: %v", err)
			}
		}
	})
}

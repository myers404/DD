// Package parser provides expression parsing and AST definitions
// This file contains core types, tokens, and definitions used throughout the parser
package parser

import (
	"fmt"
	"strings"
)

// ===== SOURCE POSITION TRACKING =====

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
	ErrorType  string // Category of error: "syntax", "semantic", "lexical", "mtbdd"
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

// ===== TOKEN DEFINITIONS =====

type TokenType int

const (
	// Literals
	TOKEN_NUMBER TokenType = iota
	TOKEN_BOOLEAN
	TOKEN_IDENTIFIER

	// Arithmetic operators
	TOKEN_PLUS
	TOKEN_MINUS
	TOKEN_MULTIPLY
	TOKEN_DIVIDE
	TOKEN_MODULO

	// Comparison operators
	TOKEN_EQ // ==
	TOKEN_NE // !=
	TOKEN_LT // <
	TOKEN_LE // <=
	TOKEN_GT // >
	TOKEN_GE // >=

	// Logical operators
	TOKEN_AND // AND, &&
	TOKEN_OR  // OR, ||
	TOKEN_NOT // NOT, !

	// Delimiters
	TOKEN_LPAREN // (
	TOKEN_RPAREN // )
	TOKEN_COMMA  // ,

	// Keywords/Functions
	TOKEN_MIN
	TOKEN_MAX
	TOKEN_ABS
	TOKEN_NEGATE
	TOKEN_CEIL
	TOKEN_FLOOR
	TOKEN_THRESHOLD
	TOKEN_ITE
	TOKEN_IMPLIES
	TOKEN_EQUIV
	TOKEN_XOR

	// Special
	TOKEN_EOF
	TOKEN_INVALID
)

var tokenNames = map[TokenType]string{
	TOKEN_NUMBER:     "NUMBER",
	TOKEN_BOOLEAN:    "BOOLEAN",
	TOKEN_IDENTIFIER: "IDENTIFIER",
	TOKEN_PLUS:       "+",
	TOKEN_MINUS:      "-",
	TOKEN_MULTIPLY:   "*",
	TOKEN_DIVIDE:     "/",
	TOKEN_MODULO:     "%",
	TOKEN_EQ:         "==",
	TOKEN_NE:         "!=",
	TOKEN_LT:         "<",
	TOKEN_LE:         "<=",
	TOKEN_GT:         ">",
	TOKEN_GE:         ">=",
	TOKEN_AND:        "AND",
	TOKEN_OR:         "OR",
	TOKEN_NOT:        "NOT",
	TOKEN_LPAREN:     "(",
	TOKEN_RPAREN:     ")",
	TOKEN_COMMA:      ",",
	TOKEN_MIN:        "MIN",
	TOKEN_MAX:        "MAX",
	TOKEN_ABS:        "ABS",
	TOKEN_NEGATE:     "NEGATE",
	TOKEN_CEIL:       "CEIL",
	TOKEN_FLOOR:      "FLOOR",
	TOKEN_THRESHOLD:  "THRESHOLD",
	TOKEN_ITE:        "ITE",
	TOKEN_IMPLIES:    "IMPLIES",
	TOKEN_EQUIV:      "EQUIV",
	TOKEN_XOR:        "XOR",
	TOKEN_EOF:        "EOF",
	TOKEN_INVALID:    "INVALID",
}

func (t TokenType) String() string {
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

// ===== PUBLIC API FUNCTIONS =====

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

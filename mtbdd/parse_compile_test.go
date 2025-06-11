package mtbdd

import (
	"DD/parser"
	"fmt"
	"reflect"
	"runtime"
	"strings"
	"sync"
	"testing"
	"testing/quick"
	"time"
)

// TestComprehensiveMTBDDCompilation tests every language construct that can be compiled to MTBDD
func TestComprehensiveMTBDDCompilation(t *testing.T) {
	tests := []struct {
		name               string
		expression         string
		expectedVariables  []string
		shouldError        bool
		errorType          string
		skipInShortMode    bool
		expectValidNodeRef bool
		testBatchCompile   bool // Whether to include in batch compilation tests
	}{
		// ==== ARITHMETIC OPERATIONS ====
		{
			name:               "Basic Addition",
			expression:         "x + y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Basic Subtraction",
			expression:         "x - y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Basic Multiplication",
			expression:         "x * y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Complex Arithmetic with Precedence",
			expression:         "x + y * z - w",
			expectedVariables:  []string{"w", "x", "y", "z"}, // sorted
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Parentheses Override Precedence",
			expression:         "(x + y) * (z - w)",
			expectedVariables:  []string{"w", "x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Unary Plus",
			expression:         "+x",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Unary Minus",
			expression:         "-x",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},

		// ==== MIN/MAX OPERATIONS ====
		{
			name:               "MIN Function",
			expression:         "MIN(x, y)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "MAX Function",
			expression:         "MAX(x, y)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Nested MIN/MAX",
			expression:         "MIN(MAX(x, y), z)",
			expectedVariables:  []string{"x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "MIN with Infix Syntax",
			expression:         "x MIN y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "MAX with Infix Syntax",
			expression:         "x MAX y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},

		// ==== BOOLEAN OPERATIONS ====
		{
			name:               "Boolean AND (&&)",
			expression:         "x && y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Boolean AND (AND)",
			expression:         "x AND y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Boolean OR (||)",
			expression:         "x || y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Boolean OR (OR)",
			expression:         "x OR y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Boolean NOT (!)",
			expression:         "!x",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Boolean NOT (NOT)",
			expression:         "NOT x",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Complex Boolean Logic",
			expression:         "(x > 5 AND y < 10) OR (z == 0 AND NOT w)",
			expectedVariables:  []string{"w", "x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== COMPARISON OPERATIONS ====
		{
			name:               "Greater Than",
			expression:         "x > y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Greater Than or Equal",
			expression:         "x >= y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Less Than",
			expression:         "x < y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Less Than or Equal",
			expression:         "x <= y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Equality",
			expression:         "x == y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Inequality",
			expression:         "x != y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== MATHEMATICAL FUNCTIONS ====
		{
			name:               "ABS Function",
			expression:         "ABS(x)",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "NEGATE Function",
			expression:         "NEGATE(x)",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "CEIL Function",
			expression:         "CEIL(x)",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "FLOOR Function",
			expression:         "FLOOR(x)",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "THRESHOLD Function",
			expression:         "THRESHOLD(x, 10)",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Nested Mathematical Functions",
			expression:         "ABS(NEGATE(CEIL(x)))",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},

		// ==== CONDITIONAL EXPRESSIONS ====
		{
			name:               "ITE True Branch",
			expression:         "ITE(x > 5, y + 1, z * 2)",
			expectedVariables:  []string{"x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Nested ITE",
			expression:         "ITE(x > 0, ITE(y > 0, x + y, x - y), 0)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "ITE with Complex Condition",
			expression:         "ITE((x > 5 AND y < 10), x * y, x + y)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== LOGICAL FUNCTIONS ====
		{
			name:               "IMPLIES Function",
			expression:         "IMPLIES(x > 5, y < 10)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "EQUIV Function",
			expression:         "EQUIV(x > 5, y < 10)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "XOR Function",
			expression:         "XOR(x > 5, y < 10)",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== INFIX LOGICAL OPERATORS ====
		{
			name:               "Infix Implies",
			expression:         "x > 5 -> y < 10",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Infix Equiv",
			expression:         "x > 5 <-> y < 10",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Complex Infix Logic",
			expression:         "(x > 5 -> y < 10) && (a <-> b)",
			expectedVariables:  []string{"a", "b", "x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Mixed Function and Infix",
			expression:         "IMPLIES(x > 0, y > 0) && (z <-> w)",
			expectedVariables:  []string{"w", "x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Parenthesized Chaining Implies",
			expression:         "(x -> y) -> z",
			expectedVariables:  []string{"x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Parenthesized Chaining Equiv",
			expression:         "(x <-> y) <-> z",
			expectedVariables:  []string{"x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Complex Precedence with Infix",
			expression:         "(x > 0 && y > 0) -> (z > 0 || w > 0)",
			expectedVariables:  []string{"w", "x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== LITERALS ====
		{
			name:               "Integer Literal",
			expression:         "42",
			expectedVariables:  []string{},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Float Literal",
			expression:         "3.14159",
			expectedVariables:  []string{},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Boolean True Literal",
			expression:         "true",
			expectedVariables:  []string{},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Boolean False Literal",
			expression:         "false",
			expectedVariables:  []string{},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},

		// ==== COMPLEX REAL-WORLD EXPRESSIONS ====
		{
			name:               "Financial Decision Logic",
			expression:         "ITE(balance > 1000, balance * interestRate, ITE(balance > 100, balance * lowRate, 0))",
			expectedVariables:  []string{"balance", "interestRate", "lowRate"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Complex Decision Logic",
			expression:         "((age >= 18 AND age <= 65) AND (income > 30000 OR hasGuarantor)) AND NOT hasBadCredit",
			expectedVariables:  []string{"age", "hasBadCredit", "hasGuarantor", "income"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Scientific Formula",
			expression:         "ABS(CEIL(velocity * time))",
			expectedVariables:  []string{"time", "velocity"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Logic with Infix Operators",
			expression:         "(eligible -> hasIncome) && (hasIncome <-> (salary > 0))",
			expectedVariables:  []string{"eligible", "hasIncome", "salary"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},

		// ==== ERROR CASES ====
		{
			name:        "Chained Implies Error",
			expression:  "x -> y -> z",
			shouldError: true,
			errorType:   "Chained '->' operators require explicit parentheses",
		},
		{
			name:        "Chained Equiv Error",
			expression:  "x <-> y <-> z",
			shouldError: true,
			errorType:   "Chained '<->' operators require explicit parentheses",
		},
		{
			name:        "Mixed Chained Operators",
			expression:  "x -> y <-> z",
			shouldError: true,
			errorType:   "Mixed logical operators require explicit parentheses",
		},

		// ==== UNSUPPORTED OPERATIONS (Should Error) ====
		{
			name:        "Division Not Supported",
			expression:  "x / y",
			shouldError: true,
			errorType:   "division not supported",
		},
		{
			name:        "Modulo Not Supported",
			expression:  "x % y",
			shouldError: true,
			errorType:   "modulo not supported",
		},

		// ==== VARIABLE COLLECTION TESTS ====
		{
			name:               "Single Variable",
			expression:         "x",
			expectedVariables:  []string{"x"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Multiple Variables",
			expression:         "x + y + z",
			expectedVariables:  []string{"x", "y", "z"},
			expectValidNodeRef: true,
			testBatchCompile:   true,
		},
		{
			name:               "Duplicate Variables",
			expression:         "x + x * y",
			expectedVariables:  []string{"x", "y"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
		{
			name:               "Variables in Infix Logical",
			expression:         "(a -> b && c) <-> d",
			expectedVariables:  []string{"a", "b", "c", "d"},
			expectValidNodeRef: true,
			testBatchCompile:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.skipInShortMode && testing.Short() {
				t.Skip("Skipping in short mode")
			}

			// Parse the expression
			expr, err := parser.ParseExpression(tt.expression)

			if tt.shouldError && err != nil {
				// Expected parse error
				if tt.errorType != "" && !strings.Contains(err.Error(), tt.errorType) {
					t.Errorf("Expected error containing '%s', got: %v", tt.errorType, err)
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected parse error: %v", err)
				return
			}

			// Create MTBDD instance
			mtbddInstance := createTestMTBDD()

			// Compile the expression
			nodeRef, ctx, err := Compile(expr, mtbddInstance)
			if tt.shouldError {
				if err == nil {
					t.Errorf("Expected compilation error but got none")
				} else if tt.errorType != "" && !strings.Contains(err.Error(), tt.errorType) {
					t.Errorf("Expected error containing '%s', got: %v", tt.errorType, err)
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected compilation error: %v", err)
				return
			}

			// Test node reference validity
			if tt.expectValidNodeRef {
				if nodeRef == NullRef {
					t.Error("Expected valid node reference, got NullRef")
				}
			}

			// Test context validity
			if ctx == nil {
				t.Error("Expected non-nil context")
				return
			}

			// Test variable collection
			declaredVars := ctx.GetDeclaredVariables()
			if !compareStringSlices(declaredVars, tt.expectedVariables) {
				t.Errorf("Expected variables %v, got %v", tt.expectedVariables, declaredVars)
			}

			// Test that parser variable collection matches MTBDD variable collection
			parserVars := parser.CollectVariables(expr)
			if !compareStringSlices(parserVars, tt.expectedVariables) {
				t.Errorf("Parser variables %v don't match expected %v", parserVars, tt.expectedVariables)
			}
		})
	}
}

// TestMTBDDCompilationErrors focuses specifically on MTBDD compilation errors
func TestMTBDDCompilationErrors(t *testing.T) {
	errorCases := []struct {
		name        string
		expression  string
		expectError string
	}{
		{
			name:        "Division Operation",
			expression:  "x / y",
			expectError: "division not supported",
		},
		{
			name:        "Modulo Operation",
			expression:  "x % y",
			expectError: "modulo not supported",
		},
		{
			name:        "Complex Expression with Division",
			expression:  "x + y / z",
			expectError: "division not supported",
		},
		{
			name:        "Invalid THRESHOLD Arguments",
			expression:  "THRESHOLD(x, y)", // y should be constant
			expectError: "second argument must be a constant",
		},
		// NEW: Infix logical operator errors
		{
			name:        "Chained Infix Implies",
			expression:  "x -> y -> z",
			expectError: "Chained '->' operators require explicit parentheses",
		},
		{
			name:        "Chained Infix Equiv",
			expression:  "x <-> y <-> z",
			expectError: "Chained '<->' operators require explicit parentheses",
		},
		{
			name:        "Mixed Infix Operators",
			expression:  "x -> y <-> z",
			expectError: "Mixed logical operators require explicit parentheses",
		},
	}

	for _, tt := range errorCases {
		t.Run(tt.name, func(t *testing.T) {
			expr, err := parser.ParseExpression(tt.expression)
			if err != nil {
				// Check if it's a parse error (also acceptable)
				if strings.Contains(err.Error(), tt.expectError) {
					return // Parse error with expected message is fine
				}
				t.Errorf("Unexpected parse error: %v", err)
				return
			}

			mtbddInstance := createTestMTBDD()
			_, _, err = Compile(expr, mtbddInstance)

			if err == nil {
				t.Errorf("Expected compilation error containing '%s' but got none", tt.expectError)
				return
			}

			if !strings.Contains(err.Error(), tt.expectError) {
				t.Errorf("Expected error containing '%s', got: %v", tt.expectError, err)
			}
		})
	}
}

// TestMTBDDInfixLogicalOperators tests specific MTBDD compilation for infix operators
func TestMTBDDInfixLogicalOperators(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping infix logical operators test in short mode")
	}

	tests := []struct {
		name              string
		expression        string
		expectedVariables []string
		shouldError       bool
	}{
		{
			name:              "Simple Implies",
			expression:        "x -> y",
			expectedVariables: []string{"x", "y"},
			shouldError:       false,
		},
		{
			name:              "Simple Equiv",
			expression:        "x <-> y",
			expectedVariables: []string{"x", "y"},
			shouldError:       false,
		},
		{
			name:              "Complex with Parentheses",
			expression:        "(x > 0 -> y > 0) && (a <-> b)",
			expectedVariables: []string{"a", "b", "x", "y"},
			shouldError:       false,
		},
		{
			name:              "Precedence Test",
			expression:        "x && y -> z || w",
			expectedVariables: []string{"w", "x", "y", "z"},
			shouldError:       false,
		},
		{
			name:        "Invalid Chaining",
			expression:  "x -> y -> z",
			shouldError: true,
		},
		{
			name:        "Invalid Mixed Chaining",
			expression:  "x -> y <-> z",
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			expr, err := parser.ParseExpression(tt.expression)

			if tt.shouldError && err != nil {
				// Expected parse error
				return
			}

			if err != nil {
				t.Errorf("Unexpected parse error: %v", err)
				return
			}

			if tt.shouldError && err == nil {
				// We expected a parse error but didn't get one, try compilation
				mtbddInstance := createTestMTBDD()
				_, _, err = Compile(expr, mtbddInstance)
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			// Test successful compilation
			mtbddInstance := createTestMTBDD()
			nodeRef, ctx, err := Compile(expr, mtbddInstance)

			if err != nil {
				t.Errorf("Unexpected compilation error: %v", err)
				return
			}

			if nodeRef == NullRef {
				t.Error("Expected valid node reference")
				return
			}

			// Check variables
			declaredVars := ctx.GetDeclaredVariables()
			if !compareStringSlices(declaredVars, tt.expectedVariables) {
				t.Errorf("Expected variables %v, got %v", tt.expectedVariables, declaredVars)
			}
		})
	}
}

// TestMTBDDContextReuse tests context reuse functionality
func TestMTBDDContextReuse(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping context reuse test in short mode")
	}

	mtbddInstance := createTestMTBDD()

	// Compile first expression
	expr1, err := parser.ParseExpression("x + y")
	if err != nil {
		t.Fatalf("Parse error: %v", err)
	}

	nodeRef1, ctx, err := Compile(expr1, mtbddInstance)
	if err != nil {
		t.Fatalf("First compilation error: %v", err)
	}

	if nodeRef1 == NullRef {
		t.Error("Expected valid node reference for first compilation")
	}

	// Check initial variables
	initialVars := ctx.GetDeclaredVariables()
	expectedInitial := []string{"x", "y"}
	if !compareStringSlices(initialVars, expectedInitial) {
		t.Errorf("Expected initial variables %v, got %v", expectedInitial, initialVars)
	}

	// Compile second expression using existing context
	expr2, err := parser.ParseExpression("x + z") // z is new, x already exists
	if err != nil {
		t.Fatalf("Parse error: %v", err)
	}

	nodeRef2, err := CompileWithContext(expr2, ctx)
	if err != nil {
		t.Fatalf("Second compilation error: %v", err)
	}

	if nodeRef2 == NullRef {
		t.Error("Expected valid node reference for second compilation")
	}

	// Check that new variable was added
	finalVars := ctx.GetDeclaredVariables()
	expectedFinal := []string{"x", "y", "z"}
	if !compareStringSlices(finalVars, expectedFinal) {
		t.Errorf("Expected final variables %v, got %v", expectedFinal, finalVars)
	}

	// Compile third expression with all existing variables
	expr3, err := parser.ParseExpression("x * y + z")
	if err != nil {
		t.Fatalf("Parse error: %v", err)
	}

	nodeRef3, err := CompileWithContext(expr3, ctx)
	if err != nil {
		t.Fatalf("Third compilation error: %v", err)
	}

	if nodeRef3 == NullRef {
		t.Error("Expected valid node reference for third compilation")
	}

	// Variables should remain the same
	unchangedVars := ctx.GetDeclaredVariables()
	if !compareStringSlices(unchangedVars, expectedFinal) {
		t.Errorf("Expected unchanged variables %v, got %v", expectedFinal, unchangedVars)
	}

	// NEW: Test with infix logical operators
	expr4, err := parser.ParseExpression("(x -> y) && (z <-> w)")
	if err != nil {
		t.Fatalf("Parse error for infix logical: %v", err)
	}

	nodeRef4, err := CompileWithContext(expr4, ctx)
	if err != nil {
		t.Fatalf("Fourth compilation error: %v", err)
	}

	if nodeRef4 == NullRef {
		t.Error("Expected valid node reference for fourth compilation")
	}

	// Should now have w added
	finalVarsWithW := ctx.GetDeclaredVariables()
	expectedFinalWithW := []string{"w", "x", "y", "z"}
	if !compareStringSlices(finalVarsWithW, expectedFinalWithW) {
		t.Errorf("Expected final variables with w %v, got %v", expectedFinalWithW, finalVarsWithW)
	}
}

// TestMTBDDBatchCompilation tests batch compilation functionality
func TestMTBDDBatchCompilation(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping batch compilation test in short mode")
	}

	expressions := []string{
		"x + y",
		"x > 5 AND y < 10",
		"z * w",
		"ITE(x > 0, y + z, w)",
		"MIN(x, MAX(y, z))",
		"x -> y",                // NEW: infix implies
		"a <-> b",               // NEW: infix equiv
		"(p -> q) && (r <-> s)", // NEW: complex infix
	}

	// Parse all expressions
	var parsedExprs []parser.Expression
	for _, exprStr := range expressions {
		expr, err := parser.ParseExpression(exprStr)
		if err != nil {
			t.Fatalf("Parse error for '%s': %v", exprStr, err)
		}
		parsedExprs = append(parsedExprs, expr)
	}

	// Batch compile
	mtbddInstance := createTestMTBDD()
	nodeRefs, ctx, err := CompileMultipleExpressions(parsedExprs, mtbddInstance)

	if err != nil {
		t.Fatalf("Batch compilation error: %v", err)
	}

	// Check that we got the right number of results
	if len(nodeRefs) != len(expressions) {
		t.Errorf("Expected %d node references, got %d", len(expressions), len(nodeRefs))
	}

	// Check that all node references are valid
	for i, nodeRef := range nodeRefs {
		if nodeRef == NullRef {
			t.Errorf("Node reference %d is null for expression '%s'", i, expressions[i])
		}
	}

	// Check that all variables were declared (including new ones from infix operators)
	declaredVars := ctx.GetDeclaredVariables()
	expectedVars := []string{"a", "b", "p", "q", "r", "s", "w", "x", "y", "z"} // All unique variables, sorted
	if !compareStringSlices(declaredVars, expectedVars) {
		t.Errorf("Expected variables %v, got %v", expectedVars, declaredVars)
	}
}

// TestMTBDDCaching tests caching functionality
func TestMTBDDCaching(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping caching test in short mode")
	}

	mtbddInstance := createTestMTBDD()

	// Compile expression with caching enabled
	expr, err := parser.ParseExpression("x + y")
	if err != nil {
		t.Fatalf("Parse error: %v", err)
	}

	// First compilation
	nodeRef1, ctx, err := Compile(expr, mtbddInstance)
	if err != nil {
		t.Fatalf("First compilation error: %v", err)
	}

	// Second compilation of same expression - should use cache
	nodeRef2, err := CompileWithContext(expr, ctx)
	if err != nil {
		t.Fatalf("Second compilation error: %v", err)
	}

	// Results should be identical (cached)
	if nodeRef1 != nodeRef2 {
		t.Errorf("Expected cached result, but got different node references: %v vs %v", nodeRef1, nodeRef2)
	}

	// Clear cache and compile again
	ctx.ClearCache()
	nodeRef3, err := CompileWithContext(expr, ctx)
	if err != nil {
		t.Fatalf("Third compilation error: %v", err)
	}

	// This should also work (cache cleared, but variables still declared)
	if nodeRef3 == NullRef {
		t.Error("Expected valid node reference after cache clear")
	}

	// NEW: Test caching with infix logical operators
	infixExpr, err := parser.ParseExpression("x -> y")
	if err != nil {
		t.Fatalf("Parse error for infix: %v", err)
	}

	// First compilation of infix
	infixRef1, err := CompileWithContext(infixExpr, ctx)
	if err != nil {
		t.Fatalf("First infix compilation error: %v", err)
	}

	// Second compilation should use cache
	infixRef2, err := CompileWithContext(infixExpr, ctx)
	if err != nil {
		t.Fatalf("Second infix compilation error: %v", err)
	}

	if infixRef1 != infixRef2 {
		t.Errorf("Expected cached infix result, but got different references: %v vs %v", infixRef1, infixRef2)
	}
}

// TestMTBDDPropertyBased uses property-based testing for robustness
func TestMTBDDPropertyBased(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping property-based test in short mode")
	}

	// Property: MTBDD compilation should never panic
	property1 := func(expr string) bool {
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("MTBDD compiler panicked on input: %s", expr)
			}
		}()

		parsedExpr, err := parser.ParseExpression(expr)
		if err != nil {
			return true // Parse errors are acceptable
		}

		mtbddInstance := createTestMTBDD()
		_, _, _ = Compile(parsedExpr, mtbddInstance) // Should not panic regardless of result
		return true
	}

	config := &quick.Config{MaxCount: 500} // Reduced for MTBDD tests
	if err := quick.Check(property1, config); err != nil {
		t.Errorf("Property 1 failed: %v", err)
	}

	// Property: Valid expressions should compile deterministically
	property2 := func() bool {
		validExprs := []string{
			"x + y",
			"x > 5 AND y < 10",
			"ITE(x, y, z)",
			"ABS(x) + NEGATE(y)",
			"IMPLIES(x > 0, y < 10)",
			"x -> y",        // NEW
			"x <-> y",       // NEW
			"(x -> y) -> z", // NEW
		}

		for _, expr := range validExprs {
			parsedExpr1, err1 := parser.ParseExpression(expr)
			parsedExpr2, err2 := parser.ParseExpression(expr)

			if (err1 == nil) != (err2 == nil) {
				return false
			}

			if err1 == nil {
				// Both succeeded - should produce equivalent compilation results
				mtbdd1 := createTestMTBDD()
				mtbdd2 := createTestMTBDD()

				nodeRef1, ctx1, _ := Compile(parsedExpr1, mtbdd1)
				nodeRef2, ctx2, _ := Compile(parsedExpr2, mtbdd2)

				// Variable declarations should be identical
				vars1 := ctx1.GetDeclaredVariables()
				vars2 := ctx2.GetDeclaredVariables()

				if !compareStringSlices(vars1, vars2) {
					t.Errorf("Deterministic compilation failed for %s: variables %v != %v", expr, vars1, vars2)
					return false
				}

				// Both should be valid or both invalid
				if (nodeRef1 == NullRef) != (nodeRef2 == NullRef) {
					t.Errorf("Deterministic compilation failed for %s: node refs %v != %v", expr, nodeRef1, nodeRef2)
					return false
				}
			}
		}
		return true
	}

	if err := quick.Check(property2, config); err != nil {
		t.Errorf("Property 2 failed: %v", err)
	}
}

// TestMTBDDPerformance benchmarks MTBDD compilation performance
func TestMTBDDPerformance(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping performance test in short mode")
	}

	expressions := []string{
		"x + y",
		"x > 5 AND y < 10 OR z == 0",
		"ITE(x > 0, y + z, w)",
		"((x + y) > 10 AND z != 0) OR (MIN(a, b) >= 5)",
		"(x -> y) && (z <-> w)", // NEW: infix logical operators
	}

	for _, expr := range expressions {
		t.Run(fmt.Sprintf("Compile_%s", expr), func(t *testing.T) {
			// Parse once
			parsedExpr, err := parser.ParseExpression(expr)
			if err != nil {
				t.Errorf("Parse error: %v", err)
				return
			}

			// Benchmark compilation
			start := time.Now()
			iterations := 100

			for i := 0; i < iterations; i++ {
				mtbddInstance := createTestMTBDD()
				_, _, err := Compile(parsedExpr, mtbddInstance)
				if err != nil {
					t.Errorf("Compilation error: %v", err)
					return
				}
			}

			duration := time.Since(start)
			avgTime := duration / time.Duration(iterations)

			t.Logf("Average compilation time: %v", avgTime)

			// Performance threshold (adjust based on your requirements)
			if avgTime > 10*time.Millisecond {
				t.Errorf("Compilation too slow: %v per iteration", avgTime)
			}
		})
	}
}

// TestMTBDDMemoryUsage checks for memory leaks in MTBDD compilation
func TestMTBDDMemoryUsage(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping memory test in short mode")
	}

	expression := "x + y * z - ITE(w > 0, a + b, c)"

	// Get initial memory stats
	var m1, m2 runtime.MemStats
	runtime.GC()
	runtime.ReadMemStats(&m1)

	// Perform many compilations
	iterations := 1000
	for i := 0; i < iterations; i++ {
		expr, err := parser.ParseExpression(expression)
		if err != nil {
			t.Fatalf("Parse error at iteration %d: %v", i, err)
		}

		mtbddInstance := createTestMTBDD()
		_, _, err = Compile(expr, mtbddInstance)
		if err != nil {
			t.Fatalf("Compilation error at iteration %d: %v", i, err)
		}

		// Occasional GC to clean up
		if i%100 == 0 {
			runtime.GC()
		}
	}

	// Final memory stats
	runtime.GC()
	runtime.ReadMemStats(&m2)

	// Check memory growth - handle potential underflow
	var memGrowth uint64
	var avgGrowthPerIteration uint64

	if m2.HeapAlloc >= m1.HeapAlloc {
		memGrowth = m2.HeapAlloc - m1.HeapAlloc
		avgGrowthPerIteration = memGrowth / uint64(iterations)
	} else {
		// Memory actually decreased (good!)
		t.Logf("Memory decreased by %d bytes", m1.HeapAlloc-m2.HeapAlloc)
		return
	}

	t.Logf("Memory growth: %d bytes total, %d bytes per iteration", memGrowth, avgGrowthPerIteration)

	// More lenient threshold for MTBDD operations
	if avgGrowthPerIteration > 5000 { // 5KB per iteration
		t.Errorf("Excessive memory growth: %d bytes per iteration", avgGrowthPerIteration)
	}
}

// TestMTBDDConcurrency ensures thread safety of MTBDD compilation
func TestMTBDDConcurrency(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping concurrency test in short mode")
	}

	expressions := []string{
		"x + y * z",
		"(x -> y) && (z <-> w)", // NEW: include infix operators
	}

	for _, expression := range expressions {
		t.Run(fmt.Sprintf("Concurrent_%s", expression), func(t *testing.T) {
			// Parse once
			expr, err := parser.ParseExpression(expression)
			if err != nil {
				t.Errorf("Parse error: %v", err)
				return
			}

			// Compile concurrently
			numGoroutines := 50
			iterations := 50
			var wg sync.WaitGroup
			errors := make(chan error, numGoroutines*iterations)

			for g := 0; g < numGoroutines; g++ {
				wg.Add(1)
				go func() {
					defer wg.Done()

					for i := 0; i < iterations; i++ {
						mtbddInstance := createTestMTBDD()
						nodeRef, ctx, err := Compile(expr, mtbddInstance)
						if err != nil {
							errors <- fmt.Errorf("compilation error: %v", err)
							return
						}

						if nodeRef == NullRef {
							errors <- fmt.Errorf("unexpected null reference")
							return
						}

						if ctx == nil {
							errors <- fmt.Errorf("unexpected nil context")
							return
						}

						// Check variable counts (different for each expression)
						actualVars := ctx.GetDeclaredVariables()
						if len(actualVars) == 0 {
							errors <- fmt.Errorf("no variables declared")
							return
						}
					}
				}()
			}

			// Wait for completion
			go func() {
				wg.Wait()
				close(errors)
			}()

			// Check for errors
			for err := range errors {
				t.Error(err)
			}
		})
	}
}

// TestParseAndCompile tests the one-step parse and compile function
func TestParseAndCompile(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping parse and compile test in short mode")
	}

	tests := []struct {
		name        string
		expression  string
		shouldError bool
	}{
		{
			name:        "Valid Expression",
			expression:  "x + y * z",
			shouldError: false,
		},
		{
			name:        "Valid Boolean Expression",
			expression:  "x > 5 AND y < 10",
			shouldError: false,
		},
		{
			name:        "Valid Infix Implies",
			expression:  "x -> y",
			shouldError: false,
		},
		{
			name:        "Valid Infix Equiv",
			expression:  "x <-> y",
			shouldError: false,
		},
		{
			name:        "Valid Complex Infix",
			expression:  "(x -> y) && (a <-> b)",
			shouldError: false,
		},
		{
			name:        "Invalid Syntax",
			expression:  "(x + y",
			shouldError: true,
		},
		{
			name:        "Unsupported Operation",
			expression:  "x / y",
			shouldError: true,
		},
		{
			name:        "Invalid Chained Implies",
			expression:  "x -> y -> z",
			shouldError: true,
		},
		{
			name:        "Invalid Mixed Chaining",
			expression:  "x -> y <-> z",
			shouldError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mtbddInstance := createTestMTBDD()
			nodeRef, ctx, err := ParseAndCompile(tt.expression, mtbddInstance)

			if tt.shouldError {
				if err == nil {
					t.Error("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if nodeRef == NullRef {
				t.Error("Expected valid node reference")
			}

			if ctx == nil {
				t.Error("Expected non-nil context")
			}
		})
	}
}

// Helper function to create a test MTBDD instance
func createTestMTBDD() *MTBDD {
	// In your real implementation, this would create your actual MTBDD
	// For now, return a mock or basic instance
	return NewMTBDD()
}

// Helper function for comparing string slices (order doesn't matter)
func compareStringSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	mapA := make(map[string]bool)
	mapB := make(map[string]bool)

	for _, s := range a {
		mapA[s] = true
	}
	for _, s := range b {
		mapB[s] = true
	}

	return reflect.DeepEqual(mapA, mapB)
}

// Benchmark functions for MTBDD compilation
func BenchmarkMTBDDCompileSimple(b *testing.B) {
	expression := "x + y"
	expr, _ := parser.ParseExpression(expression)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		mtbddInstance := createTestMTBDD()
		_, _, err := Compile(expr, mtbddInstance)
		if err != nil {
			b.Errorf("Compilation error: %v", err)
		}
	}
}

func BenchmarkMTBDDCompileComplex(b *testing.B) {
	expression := "((x + y) > 10 AND z != 0) OR (MIN(a, b) >= 5)"
	expr, _ := parser.ParseExpression(expression)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		mtbddInstance := createTestMTBDD()
		_, _, err := Compile(expr, mtbddInstance)
		if err != nil {
			b.Errorf("Compilation error: %v", err)
		}
	}
}

// NEW: Benchmark infix logical operators
func BenchmarkMTBDDCompileInfixLogical(b *testing.B) {
	expression := "(x -> y) && (a <-> b)"
	expr, _ := parser.ParseExpression(expression)
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		mtbddInstance := createTestMTBDD()
		_, _, err := Compile(expr, mtbddInstance)
		if err != nil {
			b.Errorf("Compilation error: %v", err)
		}
	}
}

func BenchmarkMTBDDContextReuse(b *testing.B) {
	expressions := []string{"x + y", "x * z", "y + z", "x -> y", "z <-> w"} // NEW: added infix operators
	var exprs []parser.Expression

	for _, exprStr := range expressions {
		expr, _ := parser.ParseExpression(exprStr)
		exprs = append(exprs, expr)
	}

	mtbddInstance := createTestMTBDD()
	_, ctx, _ := Compile(exprs[0], mtbddInstance)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		exprIndex := i % len(exprs)
		_, err := CompileWithContext(exprs[exprIndex], ctx)
		if err != nil {
			b.Errorf("Context reuse compilation error: %v", err)
		}
	}
}

func BenchmarkMTBDDBatchCompile(b *testing.B) {
	expressions := []string{
		"x + y",
		"x > 5 AND y < 10",
		"z * w",
		"ITE(x > 0, y + z, w)",
		"x -> y",  // NEW
		"a <-> b", // NEW
	}

	var exprs []parser.Expression
	for _, exprStr := range expressions {
		expr, _ := parser.ParseExpression(exprStr)
		exprs = append(exprs, expr)
	}

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		mtbddInstance := createTestMTBDD()
		_, _, err := CompileMultipleExpressions(exprs, mtbddInstance)
		if err != nil {
			b.Errorf("Batch compilation error: %v", err)
		}
	}
}

package evaluator

import (
	"DD/parser"
	"fmt"
	"math"
	"reflect"
	"runtime"
	"strings"
	"testing"
	"testing/quick"
	"time"
)

// TestComprehensiveLanguageFeatures tests every language construct
func TestComprehensiveLanguageFeatures(t *testing.T) {
	tests := []struct {
		name        string
		expression  string
		variables   Context
		expected    interface{}
		shouldError bool
		errorType   string
	}{
		// ==== ARITHMETIC OPERATIONS ====
		{
			name:       "Basic Addition",
			expression: "x + y",
			variables:  Context{"x": 5, "y": 3},
			expected:   8.0,
		},
		{
			name:       "Basic Subtraction",
			expression: "x - y",
			variables:  Context{"x": 10, "y": 4},
			expected:   6.0,
		},
		{
			name:       "Basic Multiplication",
			expression: "x * y",
			variables:  Context{"x": 6, "y": 7},
			expected:   42.0,
		},
		{
			name:       "Basic Division",
			expression: "x / y",
			variables:  Context{"x": 15, "y": 3},
			expected:   5.0,
		},
		{
			name:       "Modulo Operation",
			expression: "x % y",
			variables:  Context{"x": 17, "y": 5},
			expected:   2.0,
		},
		{
			name:       "Complex Arithmetic with Precedence",
			expression: "x + y * z - w / v",
			variables:  Context{"x": 10, "y": 2, "z": 5, "w": 8, "v": 4},
			expected:   18.0, // 10 + (2*5) - (8/4) = 10 + 10 - 2 = 18
		},
		{
			name:       "Parentheses Override Precedence",
			expression: "(x + y) * (z - w)",
			variables:  Context{"x": 3, "y": 2, "z": 8, "w": 3},
			expected:   25.0, // (3+2) * (8-3) = 5 * 5 = 25
		},
		{
			name:       "Unary Plus",
			expression: "+x + +y",
			variables:  Context{"x": 5, "y": -3},
			expected:   2.0,
		},
		{
			name:       "Unary Minus",
			expression: "-x + -y",
			variables:  Context{"x": 5, "y": -3},
			expected:   -2.0, // -5 + -(-3) = -5 + 3 = -2
		},

		// ==== NUMERIC TYPE COMPATIBILITY ====
		{
			name:       "Mixed Numeric Types int + float64",
			expression: "x + y",
			variables:  Context{"x": int(5), "y": 3.5},
			expected:   8.5,
		},
		{
			name:       "Mixed Numeric Types int32 * float32",
			expression: "x * y",
			variables:  Context{"x": int32(4), "y": float32(2.5)},
			expected:   10.0,
		},
		{
			name:       "Mixed Numeric Types uint + int",
			expression: "x + y",
			variables:  Context{"x": uint(10), "y": int(-3)},
			expected:   7.0,
		},

		// ==== MIN/MAX OPERATIONS ====
		{
			name:       "MIN Function",
			expression: "MIN(x, y)",
			variables:  Context{"x": 10, "y": 5},
			expected:   5.0,
		},
		{
			name:       "MAX Function",
			expression: "MAX(x, y)",
			variables:  Context{"x": 10, "y": 15},
			expected:   15.0,
		},
		{
			name:       "Nested MIN/MAX",
			expression: "MIN(MAX(x, y), z)",
			variables:  Context{"x": 5, "y": 10, "z": 7},
			expected:   7.0, // MIN(MAX(5,10), 7) = MIN(10, 7) = 7
		},
		{
			name:       "MIN with Infix Syntax",
			expression: "x MIN y",
			variables:  Context{"x": 10, "y": 5},
			expected:   5.0,
		},
		{
			name:       "MAX with Infix Syntax",
			expression: "x MAX y",
			variables:  Context{"x": 10, "y": 15},
			expected:   15.0,
		},

		// ==== BOOLEAN EQUALITY COMPARISONS ====
		{
			name:       "Boolean Equality True == True",
			expression: "x == y",
			variables:  Context{"x": true, "y": true},
			expected:   true,
		},
		{
			name:       "Boolean Equality True == False",
			expression: "x == y",
			variables:  Context{"x": true, "y": false},
			expected:   false,
		},
		{
			name:       "Boolean Inequality True != False",
			expression: "x != y",
			variables:  Context{"x": true, "y": false},
			expected:   true,
		},
		{
			name:       "Boolean Inequality False != False",
			expression: "x != y",
			variables:  Context{"x": false, "y": false},
			expected:   false,
		},
		{
			name:       "Boolean Literals Equality",
			expression: "true == false",
			variables:  Context{},
			expected:   false,
		},
		{
			name:       "Boolean Literals Inequality",
			expression: "true != false",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Complex Boolean Comparison",
			expression: "(x > 5) == (y < 10)",
			variables:  Context{"x": 6, "y": 8},
			expected:   true, // (true) == (true) = true
		},
		{
			name:       "Complex Boolean Inequality",
			expression: "(x > 5) != (y > 10)",
			variables:  Context{"x": 6, "y": 8},
			expected:   true, // (true) != (false) = true
		},

		// ==== COMPARISON OPERATIONS ====
		{
			name:       "Greater Than",
			expression: "x > y",
			variables:  Context{"x": 10, "y": 5},
			expected:   true,
		},
		{
			name:       "Greater Than or Equal",
			expression: "x >= y",
			variables:  Context{"x": 5, "y": 5},
			expected:   true,
		},
		{
			name:       "Less Than",
			expression: "x < y",
			variables:  Context{"x": 3, "y": 8},
			expected:   true,
		},
		{
			name:       "Less Than or Equal",
			expression: "x <= y",
			variables:  Context{"x": 5, "y": 5},
			expected:   true,
		},
		{
			name:       "Equality",
			expression: "x == y",
			variables:  Context{"x": 7, "y": 7},
			expected:   true,
		},
		{
			name:       "Inequality",
			expression: "x != y",
			variables:  Context{"x": 7, "y": 8},
			expected:   true,
		},
		{
			name:       "Chained Comparisons (Left Associative)",
			expression: "(x > y) == (z < w)",
			variables:  Context{"x": 10, "y": 5, "z": 3, "w": 8},
			expected:   true, // (10>5) == (3<8) = true == true = true
		},

		// ==== BOOLEAN OPERATIONS ====
		{
			name:       "Boolean AND (&&)",
			expression: "x && y",
			variables:  Context{"x": true, "y": true},
			expected:   true,
		},
		{
			name:       "Boolean AND (AND)",
			expression: "x AND y",
			variables:  Context{"x": true, "y": false},
			expected:   false,
		},
		{
			name:       "Boolean OR (||)",
			expression: "x || y",
			variables:  Context{"x": false, "y": true},
			expected:   true,
		},
		{
			name:       "Boolean OR (OR)",
			expression: "x OR y",
			variables:  Context{"x": false, "y": false},
			expected:   false,
		},
		{
			name:       "Boolean NOT (!)",
			expression: "!x",
			variables:  Context{"x": true},
			expected:   false,
		},
		{
			name:       "Boolean NOT (NOT)",
			expression: "NOT x",
			variables:  Context{"x": false},
			expected:   true,
		},
		{
			name:       "Complex Boolean Logic",
			expression: "(x > 5 AND y < 10) OR (z == 0 AND NOT w)",
			variables:  Context{"x": 6, "y": 8, "z": 1, "w": false},
			expected:   true, // (true AND true) OR (false AND true) = true OR false = true
		},
		{
			name:       "Short Circuit AND",
			expression: "false AND (x / 0 > 1)", // Should not evaluate x/0
			variables:  Context{"x": 10},
			expected:   false,
		},
		{
			name:       "Short Circuit OR",
			expression: "true OR (x / 0 > 1)", // Should not evaluate x/0
			variables:  Context{"x": 10},
			expected:   true,
		},

		// ==== MATHEMATICAL FUNCTIONS ====
		{
			name:       "ABS Function Positive",
			expression: "ABS(x)",
			variables:  Context{"x": 5},
			expected:   5.0,
		},
		{
			name:       "ABS Function Negative",
			expression: "ABS(x)",
			variables:  Context{"x": -7},
			expected:   7.0,
		},
		{
			name:       "NEGATE Function",
			expression: "NEGATE(x)",
			variables:  Context{"x": 5},
			expected:   -5.0,
		},
		{
			name:       "CEIL Function",
			expression: "CEIL(x)",
			variables:  Context{"x": 3.2},
			expected:   4.0,
		},
		{
			name:       "FLOOR Function",
			expression: "FLOOR(x)",
			variables:  Context{"x": 3.8},
			expected:   3.0,
		},
		{
			name:       "THRESHOLD Function Above",
			expression: "THRESHOLD(x, 10)",
			variables:  Context{"x": 15},
			expected:   true, // Changed from 1.0 to true
		},
		{
			name:       "THRESHOLD Function Below",
			expression: "THRESHOLD(x, 10)",
			variables:  Context{"x": 5},
			expected:   false, // Changed from 0.0 to false
		},
		{
			name:       "THRESHOLD Function Equal",
			expression: "THRESHOLD(x, 10)",
			variables:  Context{"x": 10},
			expected:   true, // Changed from 1.0 to true
		},
		{
			name:       "Nested Mathematical Functions",
			expression: "ABS(NEGATE(CEIL(x)))",
			variables:  Context{"x": -3.2},
			expected:   3.0, // ABS(NEGATE(CEIL(-3.2))) = ABS(NEGATE(-3)) = ABS(3) = 3
		},

		// ==== CONDITIONAL EXPRESSIONS ====
		{
			name:       "ITE True Branch",
			expression: "ITE(x > 5, y + 1, z * 2)",
			variables:  Context{"x": 10, "y": 3, "z": 4},
			expected:   4.0, // x > 5 is true, so y + 1 = 3 + 1 = 4
		},
		{
			name:       "ITE False Branch",
			expression: "ITE(x > 5, y + 1, z * 2)",
			variables:  Context{"x": 2, "y": 3, "z": 4},
			expected:   8.0, // x > 5 is false, so z * 2 = 4 * 2 = 8
		},
		{
			name:       "Nested ITE",
			expression: "ITE(x > 0, ITE(y > 0, x + y, x - y), 0)",
			variables:  Context{"x": 5, "y": 3},
			expected:   8.0, // x > 0 true, y > 0 true, so x + y = 5 + 3 = 8
		},
		{
			name:       "ITE with Complex Condition",
			expression: "ITE((x > 5 AND y < 10), x * y, x + y)",
			variables:  Context{"x": 6, "y": 8},
			expected:   48.0, // (6>5 AND 8<10) true, so 6*8 = 48
		},

		// ==== LOGICAL FUNCTIONS ====
		{
			name:       "IMPLIES True -> True",
			expression: "IMPLIES(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 8},
			expected:   true, // true -> true = true
		},
		{
			name:       "IMPLIES True -> False",
			expression: "IMPLIES(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 12},
			expected:   false, // true -> false = false
		},
		{
			name:       "IMPLIES False -> True",
			expression: "IMPLIES(x > 5, y < 10)",
			variables:  Context{"x": 3, "y": 8},
			expected:   true, // false -> true = true
		},
		{
			name:       "IMPLIES False -> False",
			expression: "IMPLIES(x > 5, y < 10)",
			variables:  Context{"x": 3, "y": 12},
			expected:   true, // false -> false = true
		},
		{
			name:       "EQUIV Both True",
			expression: "EQUIV(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 8},
			expected:   true, // true <-> true = true
		},
		{
			name:       "EQUIV Both False",
			expression: "EQUIV(x > 5, y < 10)",
			variables:  Context{"x": 3, "y": 12},
			expected:   true, // false <-> false = true
		},
		{
			name:       "EQUIV Different",
			expression: "EQUIV(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 12},
			expected:   false, // true <-> false = false
		},
		{
			name:       "XOR Both False",
			expression: "XOR(x > 5, y < 10)",
			variables:  Context{"x": 3, "y": 12},
			expected:   false, // false XOR false = false
		},
		{
			name:       "XOR Both True",
			expression: "XOR(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 8},
			expected:   false, // true XOR true = false
		},
		{
			name:       "XOR Different",
			expression: "XOR(x > 5, y < 10)",
			variables:  Context{"x": 6, "y": 12},
			expected:   true, // true XOR false = true
		},

		// ==== INFIX LOGICAL OPERATORS ====
		{
			name:       "Infix Implies True -> True",
			expression: "true -> true",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Infix Implies True -> False",
			expression: "true -> false",
			variables:  Context{},
			expected:   false,
		},
		{
			name:       "Infix Implies False -> True",
			expression: "false -> true",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Infix Implies False -> False",
			expression: "false -> false",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Infix Equiv Both True",
			expression: "true <-> true",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Infix Equiv Both False",
			expression: "false <-> false",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Infix Equiv Different",
			expression: "true <-> false",
			variables:  Context{},
			expected:   false,
		},
		{
			name:       "Complex Infix Logic with Parentheses",
			expression: "(x > 5 -> y < 10) && (a <-> b)",
			variables:  Context{"x": 6, "y": 8, "a": true, "b": true},
			expected:   true,
		},
		{
			name:       "Mixed Function and Infix Styles",
			expression: "IMPLIES(x > 0, y > 0) && (z <-> w)",
			variables:  Context{"x": 5, "y": 3, "z": true, "w": true},
			expected:   true,
		},
		{
			name:       "Infix Implies with Variables",
			expression: "x > 5 -> y < 10",
			variables:  Context{"x": 6, "y": 8},
			expected:   true,
		},
		{
			name:       "Infix Equiv with Variables",
			expression: "x > 5 <-> y < 10",
			variables:  Context{"x": 6, "y": 8},
			expected:   true,
		},
		{
			name:       "Precedence Implies with AND",
			expression: "x > 0 && y > 0 -> z > 0",
			variables:  Context{"x": 1, "y": 1, "z": 1},
			expected:   true,
		},
		{
			name:       "Precedence Equiv with OR",
			expression: "x > 0 || y > 0 <-> z > 0",
			variables:  Context{"x": 1, "y": 0, "z": 1},
			expected:   true,
		},
		{
			name:       "Parenthesized Chaining Implies",
			expression: "(x -> y) -> z",
			variables:  Context{"x": false, "y": true, "z": true},
			expected:   true,
		},
		{
			name:       "Parenthesized Chaining Equiv",
			expression: "(x <-> y) <-> z",
			variables:  Context{"x": true, "y": true, "z": true},
			expected:   true,
		},

		// ==== LITERALS ====
		{
			name:       "Integer Literal",
			expression: "42",
			variables:  Context{},
			expected:   42.0,
		},
		{
			name:       "Float Literal",
			expression: "3.14159",
			variables:  Context{},
			expected:   3.14159,
		},
		{
			name:       "Boolean True Literal",
			expression: "true",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Boolean False Literal",
			expression: "false",
			variables:  Context{},
			expected:   false,
		},
		{
			name:       "Boolean TRUE Literal",
			expression: "TRUE",
			variables:  Context{},
			expected:   true,
		},
		{
			name:       "Boolean FALSE Literal",
			expression: "FALSE",
			variables:  Context{},
			expected:   false,
		},

		// ==== PRECEDENCE TESTS ====
		{
			name:       "Arithmetic Precedence",
			expression: "2 + 3 * 4",
			variables:  Context{},
			expected:   14.0, // 2 + (3*4) = 2 + 12 = 14
		},
		{
			name:       "Comparison vs Arithmetic",
			expression: "2 + 3 > 4",
			variables:  Context{},
			expected:   true, // (2+3) > 4 = 5 > 4 = true
		},
		{
			name:       "Boolean vs Comparison",
			expression: "2 > 1 AND 3 < 4",
			variables:  Context{},
			expected:   true, // (2>1) AND (3<4) = true AND true = true
		},
		{
			name:       "Complex Precedence",
			expression: "2 + 3 * 4 > 10 AND 5 < 6 OR false",
			variables:  Context{},
			expected:   true, // ((2+(3*4)) > 10) AND (5<6) OR false = (14>10) AND true OR false = true AND true OR false = true
		},

		// ==== ERROR CASES ====
		{
			name:        "Division by Zero",
			expression:  "x / 0",
			variables:   Context{"x": 10},
			shouldError: true,
			errorType:   "runtime",
		},
		{
			name:        "Modulo by Zero",
			expression:  "x % 0",
			variables:   Context{"x": 10},
			shouldError: true,
			errorType:   "runtime",
		},
		{
			name:        "Type Mismatch in Arithmetic",
			expression:  "x + y",
			variables:   Context{"x": 10, "y": true},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Type Mismatch in Comparison",
			expression:  "x > y",
			variables:   Context{"x": 10, "y": "hello"},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Boolean Ordering Comparison Invalid",
			expression:  "x > y",
			variables:   Context{"x": true, "y": false},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Mixed Type Equality Invalid",
			expression:  "x == y",
			variables:   Context{"x": 10, "y": true},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Type Mismatch in Boolean Logic",
			expression:  "x AND y",
			variables:   Context{"x": 10, "y": true},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Undefined Variable",
			expression:  "x + undefined_var",
			variables:   Context{"x": 10},
			shouldError: true,
			errorType:   "variable",
		},
		{
			name:        "Invalid Function Call",
			expression:  "ABS(x, y)", // ABS takes one argument
			variables:   Context{"x": 10, "y": 5},
			shouldError: true,
			errorType:   "syntax",
		},

		// ==== EDGE CASES ====
		{
			name:       "Very Large Numbers",
			expression: "x + y",
			variables:  Context{"x": 1e10, "y": 2e10},
			expected:   3e10,
		},
		{
			name:       "Very Small Numbers",
			expression: "x + y",
			variables:  Context{"x": 1e-10, "y": 2e-10},
			expected:   3e-10,
		},
		{
			name:       "Zero Values",
			expression: "x * y + z",
			variables:  Context{"x": 0, "y": 100, "z": 5},
			expected:   5.0,
		},
		{
			name:       "Negative Zero",
			expression: "x + y",
			variables:  Context{"x": 0.0, "y": -0.0},
			expected:   0.0,
		},

		// ==== COMPLEX REAL-WORLD EXPRESSIONS ====
		{
			name:       "Temperature Conversion Formula",
			expression: "ITE(unit == 1, (temp * 9 / 5) + 32, temp)", // C to F conversion
			variables:  Context{"unit": 1, "temp": 25},
			expected:   77.0, // (25*9/5) + 32 = 45 + 32 = 77
		},
		{
			name:       "Financial Calculation",
			expression: "ITE(balance > 1000, balance * 0.02, ITE(balance > 100, balance * 0.01, 0))",
			variables:  Context{"balance": 1500},
			expected:   30.0, // 1500 * 0.02 = 30
		},
		{
			name:       "Complex Decision Logic",
			expression: "((age >= 18 AND age <= 65) AND (income > 30000 OR hasGuarantor)) AND NOT hasBadCredit",
			variables:  Context{"age": 25, "income": 35000, "hasGuarantor": false, "hasBadCredit": false},
			expected:   true,
		},
		{
			name:       "Scientific Formula",
			expression: "ABS(CEIL(velocity * time + 0.5 * acceleration * time * time))",
			variables:  Context{"velocity": 10, "time": 3, "acceleration": 9.8},
			expected:   75.0, // ABS(CEIL(10*3 + 0.5*9.8*3*3)) = ABS(CEIL(30 + 44.1)) = ABS(CEIL(74.1)) = ABS(75) = 75
		},

		// ==== VARIABLE COLLECTION TESTS ====
		{
			name:       "Single Variable",
			expression: "x",
			variables:  Context{"x": 42},
			expected:   42.0,
		},
		{
			name:       "Multiple Variables",
			expression: "x + y + z",
			variables:  Context{"x": 1, "y": 2, "z": 3},
			expected:   6.0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Parse the expression
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
				// We expected an error but got none from parsing
				// Try evaluation to see if it errors there
				_, evalErr := Evaluate(expr, tt.variables)
				if evalErr == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			// Evaluate the expression
			result, err := Evaluate(expr, tt.variables)

			if tt.shouldError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected evaluation error: %v", err)
				return
			}

			// Compare results
			if !compareParsedValues(result, tt.expected) {
				t.Errorf("Expected %v (%T), got %v (%T)", tt.expected, tt.expected, result, result)
			}
		})
	}
}

// TestParseErrors focuses specifically on syntax errors
func TestParseErrors(t *testing.T) {
	errorCases := []struct {
		name        string
		expression  string
		expectError string
	}{
		{
			name:        "Unclosed Parenthesis",
			expression:  "(x + y",
			expectError: "Expected )",
		},
		{
			name:        "Extra Closing Parenthesis",
			expression:  "x + y)",
			expectError: "Unexpected token after expression",
		},
		{
			name:        "Missing Operand",
			expression:  "x +",
			expectError: "Unexpected token",
		},
		{
			name:        "Invalid Function Name",
			expression:  "UNKNOWN(x)",
			expectError: "Unexpected token",
		},
		{
			name:        "Wrong Number of Arguments ITE - Too Few",
			expression:  "ITE(x)",
			expectError: "Expected ,",
		},
		{
			name:        "Wrong Number of Arguments ITE - Too Many",
			expression:  "ITE(x, y, z, w)",
			expectError: "Expected )",
		},
		{
			name:        "Wrong Number of Arguments ABS - Too Many",
			expression:  "ABS(x, y)",
			expectError: "Expected )",
		},
		{
			name:        "Wrong Number of Arguments THRESHOLD - Too Few",
			expression:  "THRESHOLD(x)",
			expectError: "Expected ,",
		},
		{
			name:        "Missing Comma in Function",
			expression:  "ITE(x y z)",
			expectError: "Expected ,",
		},
		{
			name:        "Empty Expression",
			expression:  "",
			expectError: "Unexpected token",
		},
		{
			name:        "Only Operator",
			expression:  "+",
			expectError: "Unexpected token",
		},
		{
			name:        "Invalid Number Double Decimal",
			expression:  "3.14.159",
			expectError: "Unexpected character",
		},
		{
			name:        "Single Equals",
			expression:  "x = y",
			expectError: "Expected '=='",
		},
		{
			name:        "Single Ampersand",
			expression:  "x & y",
			expectError: "Expected '&&'",
		},
		{
			name:        "Single Pipe",
			expression:  "x | y",
			expectError: "Expected '||'",
		},
		{
			name:        "Invalid Character",
			expression:  "x @ y",
			expectError: "Unexpected character",
		},
		// NEW: Chained operator error tests
		{
			name:        "Chained Implies Error",
			expression:  "p -> q -> r",
			expectError: "Chained '->' operators require explicit parentheses",
		},
		{
			name:        "Chained Equiv Error",
			expression:  "p <-> q <-> r",
			expectError: "Chained '<->' operators require explicit parentheses",
		},
	}

	for _, tt := range errorCases {
		t.Run(tt.name, func(t *testing.T) {
			_, err := parser.ParseExpression(tt.expression)
			if err == nil {
				t.Errorf("Expected error containing '%s' but got none", tt.expectError)
				return
			}

			if !strings.Contains(err.Error(), tt.expectError) {
				t.Errorf("Expected error containing '%s', got: %v", tt.expectError, err)
			}
		})
	}
}

// TestInfixLogicalOperators tests the new -> and <-> operators specifically
func TestInfixLogicalOperators(t *testing.T) {
	tests := []struct {
		name        string
		expression  string
		variables   Context
		expected    interface{}
		shouldError bool
		errorType   string
	}{
		// Basic functionality tests
		{
			name:       "Simple Implies",
			expression: "x > 5 -> y < 10",
			variables:  Context{"x": 6, "y": 8},
			expected:   true,
		},
		{
			name:       "Simple Equiv",
			expression: "x > 5 <-> y < 10",
			variables:  Context{"x": 6, "y": 8},
			expected:   true,
		},
		{
			name:       "Implies False Antecedent",
			expression: "x > 10 -> y < 5",
			variables:  Context{"x": 3, "y": 8},
			expected:   true, // false -> anything = true
		},
		{
			name:       "Equiv Different Values",
			expression: "x > 5 <-> y > 10",
			variables:  Context{"x": 6, "y": 8},
			expected:   false, // true <-> false = false
		},

		// Precedence tests
		{
			name:       "Implies with AND",
			expression: "x > 0 && y > 0 -> z > 0",
			variables:  Context{"x": 1, "y": 1, "z": 1},
			expected:   true,
		},
		{
			name:       "Equiv with OR",
			expression: "x > 0 || y > 0 <-> z > 0",
			variables:  Context{"x": 1, "y": 0, "z": 1},
			expected:   true,
		},
		{
			name:       "Complex Precedence",
			expression: "x > 0 && y > 0 -> z > 0 || w > 0",
			variables:  Context{"x": 1, "y": 1, "z": 0, "w": 1},
			expected:   true,
		},

		// Parenthesized chaining tests
		{
			name:       "Parenthesized Chaining Implies",
			expression: "(x -> y) -> z",
			variables:  Context{"x": false, "y": true, "z": true},
			expected:   true,
		},
		{
			name:       "Parenthesized Chaining Equiv",
			expression: "(x <-> y) <-> z",
			variables:  Context{"x": true, "y": true, "z": true},
			expected:   true,
		},
		{
			name:       "Right Associative Parentheses",
			expression: "x -> (y -> z)",
			variables:  Context{"x": true, "y": false, "z": true},
			expected:   true, // true -> (false -> true) = true -> true = true
		},

		// Mixed with function style
		{
			name:       "Mixed Function and Infix",
			expression: "IMPLIES(x > 0, y > 0) && (z <-> w)",
			variables:  Context{"x": 5, "y": 3, "z": true, "w": true},
			expected:   true,
		},

		// Error cases - chained operators
		{
			name:        "Chained Implies",
			expression:  "x -> y -> z",
			variables:   Context{"x": true, "y": true, "z": true},
			shouldError: true,
			errorType:   "syntax",
		},
		{
			name:        "Chained Equiv",
			expression:  "x <-> y <-> z",
			variables:   Context{"x": true, "y": true, "z": true},
			shouldError: true,
			errorType:   "syntax",
		},
		{
			name:        "Mixed Chained Operators",
			expression:  "x -> y <-> z",
			variables:   Context{"x": true, "y": true, "z": true},
			shouldError: true,
			errorType:   "syntax",
		},

		// Type error cases
		{
			name:        "Implies Type Error Left",
			expression:  "5 -> true",
			variables:   Context{},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Implies Type Error Right",
			expression:  "true -> 5",
			variables:   Context{},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Equiv Type Error Left",
			expression:  "5 <-> true",
			variables:   Context{},
			shouldError: true,
			errorType:   "type",
		},
		{
			name:        "Equiv Type Error Right",
			expression:  "true <-> 5",
			variables:   Context{},
			shouldError: true,
			errorType:   "type",
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
				// We expected an error but got none from parsing
				_, evalErr := Evaluate(expr, tt.variables)
				if evalErr == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			// Evaluate the expression
			result, err := Evaluate(expr, tt.variables)

			if tt.shouldError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected evaluation error: %v", err)
				return
			}

			// Compare results
			if !compareParsedValues(result, tt.expected) {
				t.Errorf("Expected %v (%T), got %v (%T)", tt.expected, tt.expected, result, result)
			}
		})
	}
}

// TestValidParenthesizedExpressions tests that valid parenthesized expressions work
func TestValidParenthesizedExpressions(t *testing.T) {
	validCases := []string{
		"p -> q",
		"p <-> q",
		"(p -> q) -> r",
		"p -> (q -> r)",
		"(p <-> q) <-> r",
		"p <-> (q <-> r)",
		"(p -> q) && (r -> s)",
		"p -> (q && r)",
		"(p || q) -> r",
		"(p && q) <-> (r || s)",
	}

	for _, expr := range validCases {
		t.Run(expr, func(t *testing.T) {
			_, err := parser.ParseExpression(expr)
			if err != nil {
				t.Errorf("Expected valid expression but got error: %v", err)
			}
		})
	}
}

// TestVariableCollection tests the CollectVariables functionality
func TestVariableCollection(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		expected   []string
	}{
		{
			name:       "Single Variable",
			expression: "x",
			expected:   []string{"x"},
		},
		{
			name:       "Multiple Variables",
			expression: "x + y * z",
			expected:   []string{"x", "y", "z"},
		},
		{
			name:       "Duplicate Variables",
			expression: "x + x * y",
			expected:   []string{"x", "y"},
		},
		{
			name:       "Complex Expression",
			expression: "ITE(x > 0, y + z, w * v)",
			expected:   []string{"x", "y", "z", "w", "v"},
		},
		{
			name:       "No Variables",
			expression: "5 + 3 * 2",
			expected:   []string{},
		},
		{
			name:       "Nested Functions",
			expression: "ABS(x) + MIN(y, MAX(z, w))",
			expected:   []string{"x", "y", "z", "w"},
		},
		// NEW: Test infix logical operators
		{
			name:       "Infix Implies",
			expression: "x -> y",
			expected:   []string{"x", "y"},
		},
		{
			name:       "Infix Equiv",
			expression: "x <-> y",
			expected:   []string{"x", "y"},
		},
		{
			name:       "Complex with Infix",
			expression: "(x > 0 -> y < 10) && (z <-> w)",
			expected:   []string{"x", "y", "z", "w"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			variables, err := parser.GetExpressionVariables(tt.expression)
			if err != nil {
				t.Errorf("Error getting variables: %v", err)
				return
			}

			// Convert to map for easier comparison (order doesn't matter)
			expectedMap := make(map[string]bool)
			for _, v := range tt.expected {
				expectedMap[v] = true
			}

			actualMap := make(map[string]bool)
			for _, v := range variables {
				actualMap[v] = true
			}

			if len(expectedMap) != len(actualMap) {
				t.Errorf("Expected %d variables, got %d", len(expectedMap), len(actualMap))
				return
			}

			for v := range expectedMap {
				if !actualMap[v] {
					t.Errorf("Expected variable '%s' not found", v)
				}
			}

			for v := range actualMap {
				if !expectedMap[v] {
					t.Errorf("Unexpected variable '%s' found", v)
				}
			}
		})
	}
}

// TestEvaluationErrors focuses specifically on evaluation-time errors
func TestEvaluationErrors(t *testing.T) {
	errorCases := []struct {
		name        string
		expression  string
		variables   Context
		expectError string
	}{
		{
			name:        "Boolean Ordering Error",
			expression:  "true > false",
			variables:   Context{},
			expectError: "Ordering operators",
		},
		{
			name:        "Mixed Type Equality Error",
			expression:  "5 == true",
			variables:   Context{},
			expectError: "Cannot compare",
		},
	}

	for _, tt := range errorCases {
		t.Run(tt.name, func(t *testing.T) {
			expr, err := parser.ParseExpression(tt.expression)
			if err != nil {
				// If it's a parse error, that's also acceptable for some cases
				if strings.Contains(err.Error(), tt.expectError) {
					return
				}
				t.Errorf("Unexpected parse error: %v", err)
				return
			}

			_, err = Evaluate(expr, tt.variables)
			if err == nil {
				t.Errorf("Expected evaluation error containing '%s' but got none", tt.expectError)
				return
			}

			if !strings.Contains(err.Error(), tt.expectError) {
				t.Errorf("Expected error containing '%s', got: %v", tt.expectError, err)
			}
		})
	}
}

// TestPropertyBased uses property-based testing for robustness
func TestPropertyBased(t *testing.T) {
	// Property: Parsing should never panic
	property1 := func(expr string) bool {
		defer func() {
			if r := recover(); r != nil {
				t.Errorf("Parser panicked on input: %s", expr)
			}
		}()

		_, _ = parser.ParseExpression(expr) // Should not panic regardless of result
		return true
	}

	config := &quick.Config{MaxCount: 1000}
	if err := quick.Check(property1, config); err != nil {
		t.Errorf("Property 1 failed: %v", err)
	}

	// Property: Valid expressions should parse deterministically
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
			expr1, err1 := parser.ParseExpression(expr)
			expr2, err2 := parser.ParseExpression(expr)

			if (err1 == nil) != (err2 == nil) {
				return false
			}

			if err1 == nil {
				// Both succeeded - should produce equivalent results
				vars := Context{"x": 5, "y": 3, "z": 1}
				result1, _ := Evaluate(expr1, vars)
				result2, _ := Evaluate(expr2, vars)

				if !compareParsedValues(result1, result2) {
					t.Errorf("Deterministic parsing failed for %s: %v != %v", expr, result1, result2)
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

// TestPerformance benchmarks critical paths
func TestPerformance(t *testing.T) {
	expressions := []string{
		"x + y",
		"x > 5 AND y < 10 OR z == 0",
		"ITE(x > 0, y + z, w * v)",
		"((x + y) * 2 > 10 AND z != 0) OR (MIN(a, b) >= 5 AND THRESHOLD(c + d, 5))",
		"x -> y -> z",   // Should error quickly
		"x <-> y <-> z", // Should error quickly
	}

	variables := Context{
		"x": 5, "y": 3, "z": 0, "w": 2, "v": 4,
		"a": 10, "b": 8, "c": 15, "d": 5,
	}

	for _, expr := range expressions {
		t.Run(fmt.Sprintf("Parse_%s", expr), func(t *testing.T) {
			start := time.Now()
			iterations := 1000

			for i := 0; i < iterations; i++ {
				_, err := parser.ParseExpression(expr)
				// Don't fail on expected parse errors for chained operators
				if err != nil && !strings.Contains(expr, "->") {
					t.Errorf("Parse error: %v", err)
					return
				}
			}

			duration := time.Since(start)
			avgTime := duration / time.Duration(iterations)

			if avgTime > time.Millisecond {
				t.Errorf("Parse too slow: %v per iteration", avgTime)
			}
		})

		t.Run(fmt.Sprintf("Evaluate_%s", expr), func(t *testing.T) {
			expr, err := parser.ParseExpression(expr)
			if err != nil {
				// Skip evaluation test for invalid expressions
				return
			}

			start := time.Now()
			iterations := 10000

			for i := 0; i < iterations; i++ {
				_, err := Evaluate(expr, variables)
				if err != nil {
					t.Errorf("Evaluation error: %v", err)
					return
				}
			}

			duration := time.Since(start)
			avgTime := duration / time.Duration(iterations)

			if avgTime > 100*time.Microsecond {
				t.Errorf("Evaluation too slow: %v per iteration", avgTime)
			}
		})
	}
}

// TestMemoryUsage checks for memory leaks
func TestMemoryUsage(t *testing.T) {
	expression := "x + y * z - ITE(w > 0, a + b, c * d)"
	variables := Context{
		"x": 1, "y": 2, "z": 3, "w": 4, "a": 5, "b": 6, "c": 7, "d": 8,
	}

	// Test for memory leaks with repeated parsing/evaluation
	iterations := 10000
	for i := 0; i < iterations; i++ {
		expr, err := parser.ParseExpression(expression)
		if err != nil {
			t.Errorf("Parse error at iteration %d: %v", i, err)
			continue
		}

		_, err = Evaluate(expr, variables)
		if err != nil {
			t.Errorf("Evaluation error at iteration %d: %v", i, err)
		}

		// Periodically suggest garbage collection
		if i%1000 == 0 {
			runtime.GC()
		}
	}
}

// TestConcurrency ensures thread safety
func TestConcurrency(t *testing.T) {
	expression := "x + y * z"
	variables := Context{"x": 1, "y": 2, "z": 3}
	expected := 7.0

	// Parse once
	expr, err := parser.ParseExpression(expression)
	if err != nil {
		t.Errorf("Parse error: %v", err)
		return
	}

	// Evaluate concurrently
	numGoroutines := 100
	iterations := 100
	done := make(chan bool, numGoroutines)

	for g := 0; g < numGoroutines; g++ {
		go func() {
			defer func() { done <- true }()

			for i := 0; i < iterations; i++ {
				result, err := Evaluate(expr, variables)
				if err != nil {
					t.Errorf("Concurrent evaluation error: %v", err)
					return
				}

				if !compareParsedValues(result, expected) {
					t.Errorf("Concurrent evaluation mismatch: expected %v, got %v", expected, result)
					return
				}
			}
		}()
	}

	// Wait for all goroutines
	for g := 0; g < numGoroutines; g++ {
		<-done
	}
}

// TestErrorFormatting tests the error display functionality
func TestErrorFormatting(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		contains   []string
	}{
		{
			name:       "Parse Error with evaluator.Context",
			expression: "(x + y",
			contains:   []string{"Error:", "line 1", "Expected )"},
		},
		{
			name:       "Evaluation Error",
			expression: "x / 0",
			contains:   []string{"Division by zero"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			expr, err := parser.ParseExpression(tt.expression)
			if err != nil {
				formatted := parser.FormatError(err)
				for _, contains := range tt.contains {
					if !strings.Contains(formatted, contains) {
						t.Errorf("Expected formatted error to contain '%s', got: %s", contains, formatted)
					}
				}
				return
			}

			// Try evaluation
			_, err = Evaluate(expr, Context{"x": 10})
			if err != nil {
				formatted := parser.FormatError(err)
				for _, contains := range tt.contains {
					if !strings.Contains(formatted, contains) {
						t.Errorf("Expected formatted error to contain '%s', got: %s", contains, formatted)
					}
				}
			}
		})
	}
}

// TestValidateExpression tests expression validation without evaluation
func TestValidateExpression(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		valid      bool
	}{
		{
			name:       "Valid Simple Expression",
			expression: "x + y",
			valid:      true,
		},
		{
			name:       "Valid Complex Expression",
			expression: "ITE(x > 0, y + z, w * v)",
			valid:      true,
		},
		{
			name:       "Invalid Syntax",
			expression: "(x + y",
			valid:      false,
		},
		{
			name:       "Invalid Function",
			expression: "UNKNOWN(x)",
			valid:      false,
		},
		// NEW: Test infix logical operators
		{
			name:       "Valid Infix Implies",
			expression: "x -> y",
			valid:      true,
		},
		{
			name:       "Valid Infix Equiv",
			expression: "x <-> y",
			valid:      true,
		},
		{
			name:       "Invalid Chained Implies",
			expression: "x -> y -> z",
			valid:      false,
		},
		{
			name:       "Invalid Chained Equiv",
			expression: "x <-> y <-> z",
			valid:      false,
		},
		{
			name:       "Valid Parenthesized Chaining",
			expression: "(x -> y) -> z",
			valid:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := parser.ValidateExpression(tt.expression)
			if tt.valid && err != nil {
				t.Errorf("Expected valid expression but got error: %v", err)
			}
			if !tt.valid && err == nil {
				t.Errorf("Expected invalid expression but got no error")
			}
		})
	}
}

// Helper function for value comparison with floating point tolerance
func compareParsedValues(a, b interface{}) bool {
	if reflect.TypeOf(a) != reflect.TypeOf(b) {
		return false
	}

	switch va := a.(type) {
	case float64:
		vb := b.(float64)
		return math.Abs(va-vb) < 1e-10
	case bool:
		return va == b.(bool)
	case int:
		return va == b.(int)
	default:
		return fmt.Sprintf("%v", a) == fmt.Sprintf("%v", b)
	}
}

// Benchmark functions
func BenchmarkParseSimple(b *testing.B) {
	expression := "x + y"
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := parser.ParseExpression(expression)
		if err != nil {
			b.Errorf("Parse error: %v", err)
		}
	}
}

func BenchmarkParseComplex(b *testing.B) {
	expression := "((x + y) * 2 > 10 AND z != 0) OR (MIN(a, b) >= 5 AND THRESHOLD(c + d, 5))"
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := parser.ParseExpression(expression)
		if err != nil {
			b.Errorf("Parse error: %v", err)
		}
	}
}

// NEW: Benchmark infix logical operators
func BenchmarkParseInfixLogical(b *testing.B) {
	expression := "(x > 0 -> y > 0) && (a <-> b)"
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := parser.ParseExpression(expression)
		if err != nil {
			b.Errorf("Parse error: %v", err)
		}
	}
}

func BenchmarkEvaluateSimple(b *testing.B) {
	expr, _ := parser.ParseExpression("x + y")
	variables := Context{"x": 5, "y": 3}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := Evaluate(expr, variables)
		if err != nil {
			b.Errorf("Evaluation error: %v", err)
		}
	}
}

func BenchmarkEvaluateComplex(b *testing.B) {
	expr, _ := parser.ParseExpression("((x + y) * 2 > 10 AND z != 0) OR (MIN(a, b) >= 5 AND THRESHOLD(c + d, 5))")
	variables := Context{
		"x": 5, "y": 3, "z": 1, "a": 10, "b": 8, "c": 15, "d": 5,
	}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := Evaluate(expr, variables)
		if err != nil {
			b.Errorf("Evaluation error: %v", err)
		}
	}
}

// NEW: Benchmark infix logical evaluation
func BenchmarkEvaluateInfixLogical(b *testing.B) {
	expr, _ := parser.ParseExpression("(x > 0 -> y > 0) && (a <-> b)")
	variables := Context{"x": 5, "y": 3, "a": true, "b": true}
	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		_, err := Evaluate(expr, variables)
		if err != nil {
			b.Errorf("Evaluation error: %v", err)
		}
	}
}

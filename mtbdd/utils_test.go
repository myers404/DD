package mtbdd

import (
	"reflect"
	"testing"
)

// Tests for Validation Functions

func TestIsValidVariableName(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected bool
	}{
		{"valid simple name", "x", true},
		{"valid name with numbers", "x1", true},
		{"valid name with underscore", "_var", true},
		{"valid complex name", "var_123_test", true},
		{"valid uppercase", "VAR", true},
		{"valid mixed case", "myVar", true},
		{"empty string", "", false},
		{"starts with number", "1x", false},
		{"contains hyphen", "var-name", false},
		{"contains space", "var name", false},
		{"contains special chars", "var$", false},
		{"contains dot", "var.name", false},
		{"only underscore", "_", true},
		{"only numbers after valid start", "x123", true},
		{"unicode characters", "varα", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidVariableName(tt.input)
			if result != tt.expected {
				t.Errorf("IsValidVariableName(%q) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsValidNodeRef(t *testing.T) {
	tests := []struct {
		name     string
		input    NodeRef
		expected bool
	}{
		{"zero reference", NodeRef(0), true},
		{"positive reference", NodeRef(42), true},
		{"large reference", NodeRef(999999), true},
		{"negative reference", NodeRef(-1), false},
		{"null reference", NullRef, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsValidNodeRef(tt.input)
			if result != tt.expected {
				t.Errorf("IsValidNodeRef(%v) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestValidateVariableNames(t *testing.T) {
	tests := []struct {
		name            string
		input           []string
		expectedInvalid string
		expectedValid   bool
	}{
		{"all valid names", []string{"x", "y", "_var"}, "", true},
		{"empty slice", []string{}, "", true},
		{"one invalid name", []string{"x", "1invalid", "y"}, "1invalid", false},
		{"multiple invalid names", []string{"1a", "2b"}, "1a", false},
		{"mixed valid and invalid", []string{"valid", "in-valid", "alsoValid"}, "in-valid", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			invalid, valid := ValidateVariableNames(tt.input)
			if invalid != tt.expectedInvalid || valid != tt.expectedValid {
				t.Errorf("ValidateVariableNames(%v) = (%q, %v); want (%q, %v)",
					tt.input, invalid, valid, tt.expectedInvalid, tt.expectedValid)
			}
		})
	}
}

// Tests for String Manipulation Functions

func TestSanitizeVariableName(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"valid name unchanged", "validName", "validName"},
		{"starts with digit", "123abc", "_123abc"},
		{"contains hyphens", "var-name", "var_name"},
		{"contains spaces", "var name", "var_name"},
		{"empty string", "", "_"},
		{"special characters", "var$name@test", "var_name_test"},
		{"only invalid chars", "@#$", "___"},
		{"unicode characters", "varα", "var_"},
		{"mixed case preserved", "MyVar", "MyVar"},
		{"underscores preserved", "_my_var_", "_my_var_"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SanitizeVariableName(tt.input)
			if result != tt.expected {
				t.Errorf("SanitizeVariableName(%q) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestJoinVariableNames(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected string
	}{
		{"empty slice", []string{}, ""},
		{"single name", []string{"x"}, "x"},
		{"two names", []string{"x", "y"}, "x, y"},
		{"multiple names", []string{"a", "b", "c", "d"}, "a, b, c, d"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := JoinVariableNames(tt.input)
			if result != tt.expected {
				t.Errorf("JoinVariableNames(%v) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSplitVariableNames(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{"empty string", "", []string{}},
		{"single name", "x", []string{"x"}},
		{"two names", "x, y", []string{"x", "y"}},
		{"multiple names", "a, b, c, d", []string{"a", "b", "c", "d"}},
		{"names with extra spaces", " x , y , z ", []string{"x", "y", "z"}},
		{"no spaces", "x,y,z", []string{"x", "y", "z"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := SplitVariableNames(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("SplitVariableNames(%q) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

// Tests for Type Checking Functions

func TestIsNumericType(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected bool
	}{
		{"nil", nil, false},
		{"int", int(42), true},
		{"int8", int8(42), true},
		{"int16", int16(42), true},
		{"int32", int32(42), true},
		{"int64", int64(42), true},
		{"uint", uint(42), true},
		{"uint8", uint8(42), true},
		{"uint16", uint16(42), true},
		{"uint32", uint32(42), true},
		{"uint64", uint64(42), true},
		{"float32", float32(3.14), true},
		{"float64", float64(3.14), true},
		{"bool", true, false},
		{"string", "hello", false},
		{"slice", []int{1, 2, 3}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsNumericType(tt.input)
			if result != tt.expected {
				t.Errorf("IsNumericType(%v) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsBooleanType(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected bool
	}{
		{"true", true, true},
		{"false", false, true},
		{"int", 42, false},
		{"string", "true", false},
		{"nil", nil, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsBooleanType(tt.input)
			if result != tt.expected {
				t.Errorf("IsBooleanType(%v) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestIsStringType(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected bool
	}{
		{"string", "hello", true},
		{"empty string", "", true},
		{"int", 42, false},
		{"bool", true, false},
		{"nil", nil, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := IsStringType(tt.input)
			if result != tt.expected {
				t.Errorf("IsStringType(%v) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestConvertToFloat64(t *testing.T) {
	tests := []struct {
		name          string
		input         interface{}
		expectedValue float64
		expectedOk    bool
	}{
		{"int", int(42), 42.0, true},
		{"int8", int8(42), 42.0, true},
		{"int16", int16(42), 42.0, true},
		{"int32", int32(42), 42.0, true},
		{"int64", int64(42), 42.0, true},
		{"uint", uint(42), 42.0, true},
		{"uint8", uint8(42), 42.0, true},
		{"uint16", uint16(42), 42.0, true},
		{"uint32", uint32(42), 42.0, true},
		{"uint64", uint64(42), 42.0, true},
		{"float32", float32(3.14), 3.140000104904175, true}, // float32 precision
		{"float64", float64(3.14), 3.14, true},
		{"bool", true, 1.0, true},
		{"bool", false, 0.0, true},
		{"string", "hello", 0, false},
		{"nil", nil, 0, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			value, ok := ConvertToFloat64(tt.input)
			if value != tt.expectedValue || ok != tt.expectedOk {
				t.Errorf("ConvertToFloat64(%v) = (%v, %v); want (%v, %v)",
					tt.input, value, ok, tt.expectedValue, tt.expectedOk)
			}
		})
	}
}

func TestConvertToInt(t *testing.T) {
	tests := []struct {
		name          string
		input         interface{}
		expectedValue int
		expectedOk    bool
	}{
		{"int", int(42), 42, true},
		{"int8", int8(42), 42, true},
		{"int16", int16(42), 42, true},
		{"int32", int32(42), 42, true},
		{"int64", int64(42), 42, true},
		{"uint", uint(42), 42, true},
		{"uint8", uint8(42), 42, true},
		{"uint16", uint16(42), 42, true},
		{"uint32", uint32(42), 42, true},
		{"uint64", uint64(42), 42, true},
		{"float32", float32(3.14), 3, true},
		{"float64", float64(3.14), 3, true},
		{"string", "hello", 0, false},
		{"bool", true, 0, false},
		{"nil", nil, 0, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			value, ok := ConvertToInt(tt.input)
			if value != tt.expectedValue || ok != tt.expectedOk {
				t.Errorf("ConvertToInt(%v) = (%v, %v); want (%v, %v)",
					tt.input, value, ok, tt.expectedValue, tt.expectedOk)
			}
		})
	}
}

// Tests for Collection Utilities

func TestContainsString(t *testing.T) {
	tests := []struct {
		name     string
		slice    []string
		item     string
		expected bool
	}{
		{"empty slice", []string{}, "x", false},
		{"item present", []string{"a", "b", "c"}, "b", true},
		{"item not present", []string{"a", "b", "c"}, "d", false},
		{"single item present", []string{"x"}, "x", true},
		{"single item not present", []string{"x"}, "y", false},
		{"duplicate items", []string{"a", "b", "a"}, "a", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ContainsString(tt.slice, tt.item)
			if result != tt.expected {
				t.Errorf("ContainsString(%v, %q) = %v; want %v", tt.slice, tt.item, result, tt.expected)
			}
		})
	}
}

func TestUniqueStrings(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{"empty slice", []string{}, []string{}},
		{"no duplicates", []string{"a", "b", "c"}, []string{"a", "b", "c"}},
		{"with duplicates", []string{"a", "b", "a", "c", "b"}, []string{"a", "b", "c"}},
		{"all same", []string{"x", "x", "x"}, []string{"x"}},
		{"single item", []string{"x"}, []string{"x"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := UniqueStrings(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("UniqueStrings(%v) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestSortedCopy(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected []string
	}{
		{"empty slice", []string{}, []string{}},
		{"already sorted", []string{"a", "b", "c"}, []string{"a", "b", "c"}},
		{"reverse sorted", []string{"c", "b", "a"}, []string{"a", "b", "c"}},
		{"random order", []string{"b", "a", "d", "c"}, []string{"a", "b", "c", "d"}},
		{"single item", []string{"x"}, []string{"x"}},
		{"duplicates", []string{"b", "a", "b"}, []string{"a", "b", "b"}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Test that original is not modified
			original := make([]string, len(tt.input))
			copy(original, tt.input)

			result := SortedCopy(tt.input)

			// Check result is correct
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("SortedCopy(%v) = %v; want %v", tt.input, result, tt.expected)
			}

			// Check original is unchanged
			if !reflect.DeepEqual(tt.input, original) {
				t.Errorf("SortedCopy modified original slice: got %v; want %v", tt.input, original)
			}
		})
	}
}

func TestStringSliceEqual(t *testing.T) {
	tests := []struct {
		name     string
		a        []string
		b        []string
		expected bool
	}{
		{"both empty", []string{}, []string{}, true},
		{"equal slices", []string{"a", "b"}, []string{"a", "b"}, true},
		{"different lengths", []string{"a", "b"}, []string{"a"}, false},
		{"different content", []string{"a", "b"}, []string{"a", "c"}, false},
		{"different order", []string{"a", "b"}, []string{"b", "a"}, false},
		{"one empty", []string{}, []string{"a"}, false},
		{"single equal", []string{"x"}, []string{"x"}, true},
		{"single different", []string{"x"}, []string{"y"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := StringSliceEqual(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("StringSliceEqual(%v, %v) = %v; want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

// Tests for Mathematical Utilities

//func TestMin(t *testing.T) {
//	tests := []struct {
//		name     string
//		a        int
//		b        int
//		expected int
//	}{
//		{"a smaller", 1, 2, 1},
//		{"b smaller", 2, 1, 1},
//		{"equal", 5, 5, 5},
//		{"negative numbers", -3, -1, -3},
//		{"mixed signs", -1, 1, -1},
//		{"zero", 0, 5, 0},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			result := Min(tt.a, tt.b)
//			if result != tt.expected {
//				t.Errorf("Min(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
//			}
//		})
//	}
//}

//func TestMax(t *testing.T) {
//	tests := []struct {
//		name     string
//		a        int
//		b        int
//		expected int
//	}{
//		{"a larger", 2, 1, 2},
//		{"b larger", 1, 2, 2},
//		{"equal", 5, 5, 5},
//		{"negative numbers", -3, -1, -1},
//		{"mixed signs", -1, 1, 1},
//		{"zero", 0, 5, 5},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			result := Max(tt.a, tt.b)
//			if result != tt.expected {
//				t.Errorf("Max(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
//			}
//		})
//	}
//}

//func TestAbs(t *testing.T) {
//	tests := []struct {
//		name     string
//		input    int
//		expected int
//	}{
//		{"positive", 5, 5},
//		{"negative", -5, 5},
//		{"zero", 0, 0},
//		{"large positive", 999999, 999999},
//		{"large negative", -999999, 999999},
//	}
//
//	for _, tt := range tests {
//		t.Run(tt.name, func(t *testing.T) {
//			result := Abs(tt.input)
//			if result != tt.expected {
//				t.Errorf("Abs(%d) = %d; want %d", tt.input, result, tt.expected)
//			}
//		})
//	}
//}

// Tests for Debugging and Formatting Utilities

func TestFormatNodeRef(t *testing.T) {
	tests := []struct {
		name     string
		input    NodeRef
		expected string
	}{
		{"null reference", NullRef, "NULL"},
		{"true reference", TrueRef, "TRUE"},
		{"false reference", FalseRef, "FALSE"},
		{"regular reference", NodeRef(42), "@42"},
		{"zero reference", NodeRef(0), "TRUE"}, // since TrueRef = 0
		{"large reference", NodeRef(999999), "@999999"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatNodeRef(tt.input)
			if result != tt.expected {
				t.Errorf("FormatNodeRef(%v) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatValue(t *testing.T) {
	tests := []struct {
		name     string
		input    interface{}
		expected string
	}{
		{"nil", nil, "nil"},
		{"true", true, "true"},
		{"false", false, "false"},
		{"string", "hello", "\"hello\""},
		{"empty string", "", "\"\""},
		{"int", 42, "42"},
		{"float", 3.14, "3.14"},
		{"zero", 0, "0"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatValue(tt.input)
			if result != tt.expected {
				t.Errorf("FormatValue(%v) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatAssignment(t *testing.T) {
	tests := []struct {
		name     string
		input    map[string]bool
		expected string
	}{
		{"empty assignment", map[string]bool{}, "{}"},
		{"single variable", map[string]bool{"x": true}, "{x=true}"},
		{"multiple variables", map[string]bool{"x": true, "y": false, "z": true}, "{x=true, y=false, z=true}"},
		{"single false", map[string]bool{"a": false}, "{a=false}"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatAssignment(tt.input)
			if result != tt.expected {
				t.Errorf("FormatAssignment(%v) = %q; want %q", tt.input, result, tt.expected)
			}
		})
	}
}

// Tests for Error Utilities

func TestNewVariableError(t *testing.T) {
	err := NewVariableError("myVar", "is undefined")
	expected := "variable 'myVar': is undefined"
	if err.Error() != expected {
		t.Errorf("NewVariableError() = %q; want %q", err.Error(), expected)
	}
}

func TestNewNodeError(t *testing.T) {
	err := NewNodeError(NodeRef(42), "is invalid")
	expected := "node @42: is invalid"
	if err.Error() != expected {
		t.Errorf("NewNodeError() = %q; want %q", err.Error(), expected)
	}
}

// Tests for Cache Key Utilities

func TestCreateCacheKey(t *testing.T) {
	tests := []struct {
		name       string
		operation  string
		components []interface{}
		expected   string
	}{
		{"simple operation", "AND", []interface{}{1, 2}, "AND:1:2"},
		{"no components", "NOT", []interface{}{}, "NOT"},
		{"mixed types", "ITE", []interface{}{1, true, "test"}, "ITE:1:true:test"},
		{"single component", "CACHE", []interface{}{"key"}, "CACHE:key"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CreateCacheKey(tt.operation, tt.components...)
			if result != tt.expected {
				t.Errorf("CreateCacheKey(%s, %v) = %q; want %q", tt.operation, tt.components, result, tt.expected)
			}
		})
	}
}

func TestParseCacheKey(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected []string
	}{
		{"simple key", "AND:1:2", []string{"AND", "1", "2"}},
		{"single component", "NOT", []string{"NOT"}},
		{"complex key", "ITE:1:true:test", []string{"ITE", "1", "true", "test"}},
		{"empty key", "", []string{""}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := ParseCacheKey(tt.input)
			if !reflect.DeepEqual(result, tt.expected) {
				t.Errorf("ParseCacheKey(%q) = %v; want %v", tt.input, result, tt.expected)
			}
		})
	}
}

// Benchmark Tests

func BenchmarkIsValidVariableName(b *testing.B) {
	names := []string{"validName", "1invalid", "_valid", "var-invalid", "x123"}
	for i := 0; i < b.N; i++ {
		for _, name := range names {
			IsValidVariableName(name)
		}
	}
}

func BenchmarkSanitizeVariableName(b *testing.B) {
	names := []string{"123abc", "var-name", "valid", "var$name@test"}
	for i := 0; i < b.N; i++ {
		for _, name := range names {
			SanitizeVariableName(name)
		}
	}
}

func BenchmarkUniqueStrings(b *testing.B) {
	slice := []string{"a", "b", "a", "c", "b", "d", "a", "e"}
	for i := 0; i < b.N; i++ {
		UniqueStrings(slice)
	}
}

func BenchmarkCreateCacheKey(b *testing.B) {
	components := []interface{}{1, 2, 3, true, "test"}
	for i := 0; i < b.N; i++ {
		CreateCacheKey("OPERATION", components...)
	}
}

package mtbdd

import (
	"fmt"
	"sort"
	"strings"
)

func IsValidVariableName(name string) bool {
	if name == "" {
		return false
	}

	first := rune(name[0])
	if !((first >= 'a' && first <= 'z') ||
		(first >= 'A' && first <= 'Z') ||
		first == '_') {
		return false
	}

	for _, r := range name[1:] {
		if !((r >= 'a' && r <= 'z') ||
			(r >= 'A' && r <= 'Z') ||
			(r >= '0' && r <= '9') ||
			r == '_') {
			return false
		}
	}

	return true
}

func IsValidNodeRef(ref NodeRef) bool {
	return ref >= 0
}

func ValidateVariableNames(names []string) (string, bool) {
	for _, name := range names {
		if !IsValidVariableName(name) {
			return name, false
		}
	}
	return "", true
}

func SanitizeVariableName(name string) string {
	if name == "" {
		return "_"
	}

	runes := []rune(name)

	first := runes[0]
	if !((first >= 'a' && first <= 'z') ||
		(first >= 'A' && first <= 'Z') ||
		first == '_') {
		if first >= '0' && first <= '9' {
			runes = append([]rune{'_'}, runes...)
		} else {
			runes[0] = '_'
		}
	}

	for i := 1; i < len(runes); i++ {
		r := runes[i]
		if !((r >= 'a' && r <= 'z') ||
			(r >= 'A' && r <= 'Z') ||
			(r >= '0' && r <= '9') ||
			r == '_') {
			runes[i] = '_'
		}
	}

	return string(runes)
}

func JoinVariableNames(names []string) string {
	return strings.Join(names, ", ")
}

func SplitVariableNames(nameStr string) []string {
	if nameStr == "" {
		return []string{}
	}

	parts := strings.Split(nameStr, ",")
	result := make([]string, len(parts))

	for i, part := range parts {
		result[i] = strings.TrimSpace(part)
	}

	return result
}

func IsNumericType(value interface{}) bool {
	if value == nil {
		return false
	}

	switch value.(type) {
	case int, int8, int16, int32, int64:
		return true
	case uint, uint8, uint16, uint32, uint64:
		return true
	case float32, float64:
		return true
	default:
		return false
	}
}

func IsBooleanType(value interface{}) bool {
	_, ok := value.(bool)
	return ok
}

func IsStringType(value interface{}) bool {
	_, ok := value.(string)
	return ok
}

func ConvertToFloat64(value interface{}) (float64, bool) {
	if value == nil {
		return 0, false
	}

	switch v := value.(type) {
	case int:
		return float64(v), true
	case int8:
		return float64(v), true
	case int16:
		return float64(v), true
	case int32:
		return float64(v), true
	case int64:
		return float64(v), true
	case uint:
		return float64(v), true
	case uint8:
		return float64(v), true
	case uint16:
		return float64(v), true
	case uint32:
		return float64(v), true
	case uint64:
		return float64(v), true
	case float32:
		return float64(v), true
	case float64:
		return v, true
	case bool:
		if v {
			return 1.0, true
		}
		return 0.0, true
	default:
		return 0, false
	}
}

func ConvertToInt(value interface{}) (int, bool) {
	if value == nil {
		return 0, false
	}

	switch v := value.(type) {
	case int:
		return v, true
	case int8:
		return int(v), true
	case int16:
		return int(v), true
	case int32:
		return int(v), true
	case int64:
		return int(v), true
	case uint:
		return int(v), true
	case uint8:
		return int(v), true
	case uint16:
		return int(v), true
	case uint32:
		return int(v), true
	case uint64:
		return int(v), true
	case float32:
		return int(v), true
	case float64:
		return int(v), true
	default:
		return 0, false
	}
}

func ContainsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func UniqueStrings(slice []string) []string {
	seen := make(map[string]bool)
	result := make([]string, 0, len(slice))

	for _, item := range slice {
		if !seen[item] {
			seen[item] = true
			result = append(result, item)
		}
	}

	return result
}

func SortedCopy(slice []string) []string {
	result := make([]string, len(slice))
	copy(result, slice)
	sort.Strings(result)
	return result
}

func StringSliceEqual(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}

	for i, v := range a {
		if v != b[i] {
			return false
		}
	}

	return true
}

func Min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func Max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func Abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func FormatNodeRef(ref NodeRef) string {
	if ref == NullRef {
		return "NULL"
	}
	if ref == TrueRef {
		return "TRUE"
	}
	if ref == FalseRef {
		return "FALSE"
	}
	return fmt.Sprintf("@%d", ref)
}

func FormatValue(value interface{}) string {
	if value == nil {
		return "nil"
	}

	switch v := value.(type) {
	case bool:
		if v {
			return "true"
		}
		return "false"
	case string:
		return fmt.Sprintf("\"%s\"", v)
	default:
		return fmt.Sprintf("%v", v)
	}
}

func FormatAssignment(assignment map[string]bool) string {
	if len(assignment) == 0 {
		return "{}"
	}

	vars := make([]string, 0, len(assignment))
	for v := range assignment {
		vars = append(vars, v)
	}
	sort.Strings(vars)

	parts := make([]string, len(vars))
	for i, v := range vars {
		parts[i] = fmt.Sprintf("%s=%t", v, assignment[v])
	}

	return "{" + strings.Join(parts, ", ") + "}"
}

func NewVariableError(variable, message string) error {
	return fmt.Errorf("variable '%s': %s", variable, message)
}

func NewNodeError(ref NodeRef, message string) error {
	return fmt.Errorf("node %s: %s", FormatNodeRef(ref), message)
}

func CreateCacheKey(operation string, components ...interface{}) string {
	parts := make([]string, len(components)+1)
	parts[0] = operation

	for i, comp := range components {
		parts[i+1] = fmt.Sprintf("%v", comp)
	}

	return strings.Join(parts, ":")
}

func ParseCacheKey(key string) []string {
	return strings.Split(key, ":")
}

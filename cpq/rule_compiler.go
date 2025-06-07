// rule_compiler.go
// Advanced rule compiler for converting CPQ business rules to MTBDD representations
// Handles expression parsing, optimization, and caching for high-performance constraint resolution

package cpq

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"sync"
	"time"

	"DD/mtbdd"
)

// RuleCompiler handles compilation of business rules to MTBDD form
type RuleCompiler struct {
	mtbddEngine      *mtbdd.MTBDD
	variableRegistry *VariableRegistry
	templates        map[string]string
	compilationCache map[string]*CompiledRule
	mutex            sync.RWMutex
	stats            CompilerStats
}

// CompiledRule represents a rule compiled to MTBDD form
type CompiledRule struct {
	ID            string                 `json:"id"`
	OriginalRule  interface{}            `json:"original_rule"` // *RuleDef or *PricingRuleDef
	Expression    string                 `json:"expression"`
	CompiledMTBDD mtbdd.NodeRef          `json:"compiled_mtbdd"`
	Variables     []string               `json:"variables"`
	CompileTime   time.Duration          `json:"compile_time"`
	CacheKey      string                 `json:"cache_key"`
	Metadata      map[string]interface{} `json:"metadata"`
}

// CompilerStats tracks compilation performance
type CompilerStats struct {
	TotalCompilations int64         `json:"total_compilations"`
	CacheHits         int64         `json:"cache_hits"`
	CacheMisses       int64         `json:"cache_misses"`
	AverageTime       time.Duration `json:"average_time"`
	TotalTime         time.Duration `json:"total_time"`
	ErrorCount        int64         `json:"error_count"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewRuleCompiler creates a new rule compiler instance
func NewRuleCompiler(mtbddEngine *mtbdd.MTBDD, variableRegistry *VariableRegistry) *RuleCompiler {
	return &RuleCompiler{
		mtbddEngine:      mtbddEngine,
		variableRegistry: variableRegistry,
		templates:        make(map[string]string),
		compilationCache: make(map[string]*CompiledRule),
		stats:            CompilerStats{},
	}
}

// LoadStandardTemplates loads common rule expression templates
func (rc *RuleCompiler) LoadStandardTemplates() error {
	rc.mutex.Lock()
	defer rc.mutex.Unlock()

	// Mutual exclusion templates
	rc.templates["mutual_exclusion_binary"] = "NOT ({var1} AND {var2})"
	rc.templates["mutual_exclusion_group"] = "NOT ({vars_and})"

	// Dependency templates
	rc.templates["requires_dependency"] = "{var1} -> {var2}"
	rc.templates["requires_any"] = "{var1} -> ({vars_or})"
	rc.templates["requires_all"] = "{var1} -> ({vars_and})"

	// Group quantity templates
	rc.templates["single_select"] = "({group}_count <= 1)"
	rc.templates["required_selection"] = "({group}_count >= 1)"
	rc.templates["max_quantity"] = "({group}_count <= {max})"
	rc.templates["min_quantity"] = "({group}_count >= {min})"

	// Volume pricing templates
	rc.templates["volume_tier"] = "(meta_total_quantity >= {min} AND meta_total_quantity <= {max}) -> tier_{id}_active"
	rc.templates["volume_discount"] = "tier_{id}_active -> price_discount_{percent}"

	// Customer context templates
	rc.templates["customer_segment"] = "cust_{attribute}_{value} -> {effect}"
	rc.templates["customer_bonus"] = "cust_type_{type} ->  price_bonus_{percent}"

	return nil
}

// ===================================================================
// RULE COMPILATION INTERFACE
// ===================================================================

// CompileRule compiles a business rule to MTBDD form
func (rc *RuleCompiler) CompileRule(rule *RuleDef) (*CompiledRule, error) {
	startTime := time.Now()

	rc.mutex.Lock()
	defer rc.mutex.Unlock()
	defer func() {
		rc.stats.TotalCompilations++
		rc.stats.TotalTime += time.Since(startTime)
		rc.stats.AverageTime = time.Duration(int64(rc.stats.TotalTime) / rc.stats.TotalCompilations)
	}()

	// Check cache first
	cacheKey := rc.generateRuleCacheKey(rule)
	if cached, exists := rc.compilationCache[cacheKey]; exists {
		rc.stats.CacheHits++
		return cached, nil
	}
	rc.stats.CacheMisses++

	// Validate rule
	if err := rc.validateRule(rule); err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("rule validation failed: %w", err)
	}

	// Build expression based on rule type
	expression, err := rc.buildRuleExpression(rule)
	if err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("expression building failed: %w", err)
	}

	// Compile expression to MTBDD
	compiledMTBDD, variables, err := rc.compileExpression(expression, rule.ID, string(rule.Type))
	if err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("MTBDD compilation failed: %w", err)
	}

	// Create compiled rule
	compiled := &CompiledRule{
		ID:            rule.ID,
		OriginalRule:  rule,
		Expression:    expression,
		CompiledMTBDD: compiledMTBDD,
		Variables:     variables,
		CompileTime:   time.Since(startTime),
		CacheKey:      cacheKey,
		Metadata: map[string]interface{}{
			"rule_type":   rule.Type,
			"rule_name":   rule.Name,
			"priority":    rule.Priority,
			"is_active":   rule.IsActive,
			"compiled_at": time.Now(),
		},
	}

	// Cache the result
	rc.compilationCache[cacheKey] = compiled

	return compiled, nil
}

// CompilePricingRule compiles a pricing rule to MTBDD form
func (rc *RuleCompiler) CompilePricingRule(rule *PricingRuleDef) (*CompiledRule, error) {
	startTime := time.Now()

	rc.mutex.Lock()
	defer rc.mutex.Unlock()
	defer func() {
		rc.stats.TotalCompilations++
		rc.stats.TotalTime += time.Since(startTime)
		rc.stats.AverageTime = time.Duration(int64(rc.stats.TotalTime) / rc.stats.TotalCompilations)
	}()

	// Check cache first
	cacheKey := rc.generatePricingRuleCacheKey(rule)
	if cached, exists := rc.compilationCache[cacheKey]; exists {
		rc.stats.CacheHits++
		return cached, nil
	}
	rc.stats.CacheMisses++

	// Validate pricing rule
	if err := rc.validatePricingRule(rule); err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("pricing rule validation failed: %w", err)
	}

	// Build expression based on pricing rule type
	expression, err := rc.buildPricingRuleExpression(rule)
	if err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("pricing expression building failed: %w", err)
	}

	// Compile expression to MTBDD
	compiledMTBDD, variables, err := rc.compileExpression(expression, rule.ID, string(rule.Type))
	if err != nil {
		rc.stats.ErrorCount++
		return nil, fmt.Errorf("pricing MTBDD compilation failed: %w", err)
	}

	// Create compiled pricing rule
	compiled := &CompiledRule{
		ID:            rule.ID,
		OriginalRule:  rule,
		Expression:    expression,
		CompiledMTBDD: compiledMTBDD,
		Variables:     variables,
		CompileTime:   time.Since(startTime),
		CacheKey:      cacheKey,
		Metadata: map[string]interface{}{
			"rule_type":          rule.Type,
			"rule_name":          rule.Name,
			"discount_percent":   rule.DiscountPct,
			"customer_attribute": rule.CustomerAttribute,
			"customer_value":     rule.CustomerValue,
			"is_active":          rule.IsActive,
			"compiled_at":        time.Now(),
		},
	}

	// Cache the result
	rc.compilationCache[cacheKey] = compiled

	return compiled, nil
}

// CompileExpression compiles a raw expression string to MTBDD
func (rc *RuleCompiler) CompileExpression(expression string) (*CompiledRule, error) {
	startTime := time.Now()

	// Generate ID for standalone expression
	ruleID := fmt.Sprintf("expr_%d", time.Now().UnixNano())

	// Compile expression to MTBDD
	compiledMTBDD, variables, err := rc.compileExpression(expression, ruleID, "expression")
	if err != nil {
		return nil, fmt.Errorf("expression compilation failed: %w", err)
	}

	return &CompiledRule{
		ID:            ruleID,
		Expression:    expression,
		CompiledMTBDD: compiledMTBDD,
		Variables:     variables,
		CompileTime:   time.Since(startTime),
		Metadata: map[string]interface{}{
			"type":        "standalone_expression",
			"compiled_at": time.Now(),
		},
	}, nil
}

// ===================================================================
// EXPRESSION BUILDING
// ===================================================================

// buildRuleExpression creates MTBDD expression for business rules
func (rc *RuleCompiler) buildRuleExpression(rule *RuleDef) (string, error) {
	switch rule.Type {
	case ExclusionRule:
		return rule.Expression, nil
	case RequirementRule:
		return rc.buildRequirementExpression(rule)
	case VisibilityRule:
		return rc.buildVisibilityExpression(rule)
	case QuantityRule:
		return rc.buildQuantityExpression(rule)
	default:
		// For custom rules, use the expression directly with variable substitution
		return rule.Expression, nil
	}
}

// buildPricingRuleExpression creates MTBDD expression for pricing rules
func (rc *RuleCompiler) buildPricingRuleExpression(rule *PricingRuleDef) (string, error) {
	switch rule.Type {
	case VolumeDiscountRule:
		return rc.buildVolumeDiscountExpression(rule)
	case CustomerContextRule:
		return rc.buildCustomerContextExpression(rule)
	case BundlePricingRule:
		return rc.buildBundlePricingExpression(rule)
	case ConditionalPricingRule:
		return rule.Expression, nil
	default:
		return "", fmt.Errorf("unsupported pricing rule type: %s", rule.Type)
	}
}

// buildExclusionExpression creates mutual exclusion constraint
func (rc *RuleCompiler) buildExclusionExpression(rule *RuleDef) (string, error) {
	// Parse expression to extract option references using regex
	optionPattern := regexp.MustCompile(`opt_([a-zA-Z0-9_]+)_([a-zA-Z0-9_-]+)`)
	matches := optionPattern.FindAllStringSubmatch(rule.Expression, -1)

	if len(matches) < 2 {
		// If we can't parse, return the expression as-is
		return rule.Expression, errors.New("no option pattern found")
	}

	if len(matches) == 2 {
		// Binary exclusion
		template := rc.templates["mutual_exclusion_binary"]
		var1 := BuildOptionVariable(matches[0][1], matches[0][2])
		var2 := BuildOptionVariable(matches[1][1], matches[1][2])

		expression := strings.ReplaceAll(template, "{var1}", var1)
		expression = strings.ReplaceAll(expression, "{var2}", var2)
		return expression, nil
	}

	// Multi-way exclusion
	var vars []string
	for _, match := range matches {
		vars = append(vars, BuildOptionVariable(match[1], match[2]))
	}

	template := rc.templates["mutual_exclusion_group"]
	varsAnd := strings.Join(vars, " AND ")
	expression := strings.ReplaceAll(template, "{vars_and}", varsAnd)

	return expression, nil
}

// buildRequirementExpression creates dependency constraint
func (rc *RuleCompiler) buildRequirementExpression(rule *RuleDef) (string, error) {
	// Parse implication: A -> B or A -> (B OR C)
	parts := strings.Split(rule.Expression, "->")
	if len(parts) != 2 {
		return rule.Expression, errors.New("invalid rule expression")
	}

	antecedent := strings.TrimSpace(parts[0])
	consequent := strings.TrimSpace(parts[1])

	// Remove outer parentheses if present
	consequent = strings.Trim(consequent, "()")

	// Check if consequent is a disjunction (OR) or conjunction (AND)
	if strings.Contains(consequent, " OR ") {
		// Parse OR expression: extract individual variables
		orParts := strings.Split(consequent, " OR ")
		var vars []string
		for _, part := range orParts {
			vars = append(vars, strings.TrimSpace(part))
		}

		template := rc.templates["requires_any"]
		expression := strings.ReplaceAll(template, "{var1}", antecedent)
		varsOr := strings.Join(vars, " OR ")
		expression = strings.ReplaceAll(expression, "{vars_or}", varsOr)
		return expression, nil

	} else if strings.Contains(consequent, " AND ") {
		// Parse AND expression: extract individual variables
		andParts := strings.Split(consequent, " AND ")
		var vars []string
		for _, part := range andParts {
			vars = append(vars, strings.TrimSpace(part))
		}

		template := rc.templates["requires_all"]
		expression := strings.ReplaceAll(template, "{var1}", antecedent)
		varsAnd := strings.Join(vars, " AND ")
		expression = strings.ReplaceAll(expression, "{vars_and}", varsAnd)
		return expression, nil

	} else {
		// Simple implication: A -> B
		template := rc.templates["requires_dependency"]
		expression := strings.ReplaceAll(template, "{var1}", antecedent)
		expression = strings.ReplaceAll(expression, "{var2}", consequent)
		return expression, nil
	}
}

// buildVisibilityExpression creates visibility constraint
func (rc *RuleCompiler) buildVisibilityExpression(rule *RuleDef) (string, error) {
	// Visibility rules control when options are available
	// Usually of form: condition -> option_visible
	return rule.Expression, nil
}

// buildQuantityExpression creates quantity constraint
func (rc *RuleCompiler) buildQuantityExpression(rule *RuleDef) (string, error) {
	// Parse quantity constraints like "group1_count >= 1" or "group1_count <= 3"
	return rule.Expression, nil
}

// buildVolumeDiscountExpression creates volume discount constraint
func (rc *RuleCompiler) buildVolumeDiscountExpression(rule *PricingRuleDef) (string, error) {
	// Build volume tier expression using template
	if rule.MinQuantity > 0 && rule.MaxQuantity > 0 {
		template := rc.templates["volume_tier"]
		expression := strings.ReplaceAll(template, "{min}", fmt.Sprintf("%d", rule.MinQuantity))
		expression = strings.ReplaceAll(expression, "{max}", fmt.Sprintf("%d", rule.MaxQuantity))
		expression = strings.ReplaceAll(expression, "{id}", sanitizeRuleName(rule.ID))
		return expression, nil
	}

	return rule.Expression, nil
}

// buildCustomerContextExpression creates customer context constraint
func (rc *RuleCompiler) buildCustomerContextExpression(rule *PricingRuleDef) (string, error) {
	// Build customer segment expression
	if rule.CustomerAttribute != "" && rule.CustomerValue != "" {
		template := rc.templates["customer_segment"]
		expression := strings.ReplaceAll(template, "{attribute}", sanitizeRuleName(rule.CustomerAttribute))
		expression = strings.ReplaceAll(expression, "{value}", sanitizeRuleName(rule.CustomerValue))

		// Create effect based on discount percentage
		effect := fmt.Sprintf("price_discount_%s", sanitizeRuleName(rule.ID))
		expression = strings.ReplaceAll(expression, "{effect}", effect)

		return expression, nil
	}
	return rule.Expression, nil
}

// buildBundlePricingExpression creates bundle pricing constraint
func (rc *RuleCompiler) buildBundlePricingExpression(rule *PricingRuleDef) (string, error) {
	// Stub: Build bundle pricing expression
	return rule.Expression, nil
}

// ===================================================================
// EXPRESSION COMPILATION
// ===================================================================

// compileExpression performs the actual compilation to MTBDD
func (rc *RuleCompiler) compileExpression(expression, ruleID, ruleType string) (mtbdd.NodeRef, []string, error) {
	mtbddNode, parseContext, err := mtbdd.ParseAndCompile(expression, rc.mtbddEngine)
	if err != nil {
		return 0, nil, fmt.Errorf("MTBDD parsing failed: %w", err)
	}

	// Ensure all variables are registered
	variables := parseContext.GetDeclaredVariables()
	for _, varName := range variables {
		if !rc.variableRegistry.HasVariable(varName) {
			// Determine variable type based on naming convention
			varType := VarTypeBoolean
			if strings.HasPrefix(varName, "price_") {
				varType = VarTypeReal // Pricing variables are typically real numbers
			} else if strings.HasPrefix(varName, "meta_") && strings.Contains(varName, "quantity") {
				varType = VarTypeInteger // Quantity variables are integers
			}

			// Auto-register unknown variables
			_, err := rc.variableRegistry.RegisterVariable(varName, varType, nil)
			if err != nil {
				return 0, nil, fmt.Errorf("failed to register variable %s: %w", varName, err)
			}

			// Also add to MTBDD engine if available
			if rc.mtbddEngine != nil {
				rc.mtbddEngine.AddVar(varName)
			}
		}
	}

	return mtbddNode, variables, nil
}

// ===================================================================
// VALIDATION
// ===================================================================

// validateRule checks rule validity
func (rc *RuleCompiler) validateRule(rule *RuleDef) error {
	if rule == nil {
		return fmt.Errorf("rule cannot be nil")
	}
	if rule.ID == "" {
		return fmt.Errorf("rule ID cannot be empty")
	}
	if rule.Expression == "" {
		return fmt.Errorf("rule expression cannot be empty")
	}
	return nil
}

// validatePricingRule checks pricing rule validity
func (rc *RuleCompiler) validatePricingRule(rule *PricingRuleDef) error {
	if rule == nil {
		return fmt.Errorf("pricing rule cannot be nil")
	}
	if rule.ID == "" {
		return fmt.Errorf("pricing rule ID cannot be empty")
	}
	if rule.Expression == "" {
		return fmt.Errorf("pricing rule expression cannot be empty")
	}
	if rule.DiscountPct < 0 || rule.DiscountPct > 100 {
		return fmt.Errorf("discount percentage must be between 0 and 100")
	}
	return nil
}

// ===================================================================
// CACHE MANAGEMENT
// ===================================================================

// generateRuleCacheKey creates cache key for business rules
func (rc *RuleCompiler) generateRuleCacheKey(rule *RuleDef) string {
	return fmt.Sprintf("rule_%s_%s_%s_%t", rule.ID, rule.Type, rule.Expression, rule.IsActive)
}

// generatePricingRuleCacheKey creates cache key for pricing rules
func (rc *RuleCompiler) generatePricingRuleCacheKey(rule *PricingRuleDef) string {
	return fmt.Sprintf("pricing_%s_%s_%s_%.2f_%t",
		rule.ID, rule.Type, rule.Expression, rule.DiscountPct, rule.IsActive)
}

// ClearCache removes all cached compiled rules
func (rc *RuleCompiler) ClearCache() {
	rc.mutex.Lock()
	defer rc.mutex.Unlock()
	rc.compilationCache = make(map[string]*CompiledRule)
}

// GetCacheStats returns cache performance statistics
func (rc *RuleCompiler) GetCacheStats() map[string]interface{} {
	rc.mutex.RLock()
	defer rc.mutex.RUnlock()

	hitRate := 0.0
	totalOps := rc.stats.CacheHits + rc.stats.CacheMisses
	if totalOps > 0 {
		hitRate = float64(rc.stats.CacheHits) / float64(totalOps)
	}

	return map[string]interface{}{
		"cache_size":         len(rc.compilationCache),
		"cache_hits":         rc.stats.CacheHits,
		"cache_misses":       rc.stats.CacheMisses,
		"cache_hit_rate":     hitRate,
		"total_compilations": rc.stats.TotalCompilations,
		"average_time_ms":    float64(rc.stats.AverageTime.Nanoseconds()) / 1e6,
		"error_count":        rc.stats.ErrorCount,
	}
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// sanitizeRuleName ensures variable names are MTBDD-compatible
func sanitizeRuleName(name string) string {
	// Replace invalid characters with underscores
	re := regexp.MustCompile(`[^a-zA-Z0-9_]`)
	sanitized := re.ReplaceAllString(name, "_")

	// Ensure it starts with a letter or underscore
	if len(sanitized) > 0 && (sanitized[0] >= '0' && sanitized[0] <= '9') {
		sanitized = "_" + sanitized
	}

	return sanitized
}

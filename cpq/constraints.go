// constraints.go - Phase 1: Static Constraints Foundation
// MTBDD-based boolean constraint engine for SMB CPQ
// Performance target: <200ms constraint resolution

package cpq

import (
	"DD/mtbdd"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"
)

// ===================================================================
// CONSTRAINT ENGINE - STATIC MTBDD INTEGRATION
// ===================================================================

// ConstraintEngine handles static boolean constraint evaluation
type ConstraintEngine struct {
	model         *Model
	mtbdd         *mtbdd.MTBDD
	compiledRules map[string]mtbdd.NodeRef
	variables     map[string]mtbdd.NodeRef
	mutex         sync.RWMutex
	stats         ConstraintStats
}

// ConstraintStats tracks engine performance
type ConstraintStats struct {
	TotalEvaluations int64
	AverageTime      time.Duration
	CacheHits        int64
	CompilationTime  time.Duration
}

// NewConstraintEngine creates a new static constraint engine
func NewConstraintEngine(model *Model) (*ConstraintEngine, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	engine := &ConstraintEngine{
		model:         model,
		mtbdd:         mtbdd.NewMTBDD(),
		compiledRules: make(map[string]mtbdd.NodeRef),
		variables:     make(map[string]mtbdd.NodeRef),
	}

	// Compile all static constraints
	if err := engine.compileConstraints(); err != nil {
		return nil, fmt.Errorf("constraint compilation failed: %w", err)
	}

	return engine, nil
}

// compileConstraints compiles all model rules to MTBDD
func (ce *ConstraintEngine) compileConstraints() error {
	startTime := time.Now()

	// Step 1: Declare all variables from options
	if err := ce.declareVariables(); err != nil {
		return fmt.Errorf("variable declaration failed: %w", err)
	}

	// Step 2: Compile each rule using direct ParseAndCompile
	for _, rule := range ce.model.Rules {
		if !rule.IsActive {
			continue
		}

		// Use direct MTBDD ParseAndCompile - simplified approach
		compiledRule, _, err := mtbdd.ParseAndCompile(rule.Expression, ce.mtbdd)
		if err != nil {
			return fmt.Errorf("failed to compile rule %s: %w", rule.ID, err)
		}

		ce.compiledRules[rule.ID] = compiledRule
	}

	// Step 3: Add group constraints (single/multi select limits)
	if err := ce.addGroupConstraints(); err != nil {
		return fmt.Errorf("group constraint generation failed: %w", err)
	}

	ce.stats.CompilationTime = time.Since(startTime)
	return nil
}

// declareVariables declares MTBDD variables for all options
func (ce *ConstraintEngine) declareVariables() error {
	var varNames []string

	// Collect all option variables
	for _, option := range ce.model.Options {
		if option.IsActive {
			varName := fmt.Sprintf("opt_%s", option.ID)
			varNames = append(varNames, varName)
		}
	}

	// Add group count variables for multi-select groups
	for _, group := range ce.model.Groups {
		if group.Type == MultiSelect {
			varName := fmt.Sprintf("group_%s_count", group.ID)
			varNames = append(varNames, varName)
		}
	}

	// Sort for consistent ordering
	sort.Strings(varNames)

	// Declare all variables in MTBDD
	for _, varName := range varNames {
		ce.mtbdd.Declare(varName)
		varRef, err := ce.mtbdd.Var(varName)
		if err != nil {
			return fmt.Errorf("failed to create variable %s: %w", varName, err)
		}
		ce.variables[varName] = varRef
	}

	return nil
}

// addGroupConstraints generates MTBDD constraints for group selection rules
func (ce *ConstraintEngine) addGroupConstraints() error {
	for _, group := range ce.model.Groups {
		switch group.Type {
		case SingleSelect:
			if err := ce.addSingleSelectConstraint(group); err != nil {
				return err
			}
		case MultiSelect:
			if err := ce.addMultiSelectConstraint(group); err != nil {
				return err
			}
		}
	}
	return nil
}

// addSingleSelectConstraint ensures exactly one option selected in group
func (ce *ConstraintEngine) addSingleSelectConstraint(group Group) error {
	options := ce.model.GetOptionsInGroup(group.ID)
	if len(options) == 0 {
		return nil // No constraints needed for empty groups
	}

	// Build expression: exactly one option selected
	var optionVars []string
	for _, opt := range options {
		optionVars = append(optionVars, fmt.Sprintf("opt_%s", opt.ID))
	}

	// Generate "exactly one" constraint expression
	var constraints []string

	// At least one must be selected (if required)
	if group.IsRequired {
		constraints = append(constraints, strings.Join(optionVars, " || "))
	}

	// At most one selected (mutual exclusion)
	for i := 0; i < len(optionVars); i++ {
		for j := i + 1; j < len(optionVars); j++ {
			// NOT (opt_i AND opt_j)
			constraint := fmt.Sprintf("!(%s && %s)", optionVars[i], optionVars[j])
			constraints = append(constraints, constraint)
		}
	}

	// Compile each constraint
	for i, constraintExpr := range constraints {
		ruleID := fmt.Sprintf("group_%s_constraint_%d", group.ID, i)
		compiledConstraint, _, err := mtbdd.ParseAndCompile(constraintExpr, ce.mtbdd)
		if err != nil {
			return fmt.Errorf("failed to compile group constraint for %s: %w", group.ID, err)
		}
		ce.compiledRules[ruleID] = compiledConstraint
	}

	return nil
}

// addMultiSelectConstraint handles min/max selection limits for multi-select groups
func (ce *ConstraintEngine) addMultiSelectConstraint(group Group) error {
	options := ce.model.GetOptionsInGroup(group.ID)
	if len(options) == 0 {
		return nil
	}

	var optionVars []string
	for _, opt := range options {
		optionVars = append(optionVars, fmt.Sprintf("opt_%s", opt.ID))
	}

	// Minimum selections constraint
	if group.MinSelections > 0 {
		if group.MinSelections == 1 {
			// At least one option must be selected
			constraint := strings.Join(optionVars, " || ")
			ruleID := fmt.Sprintf("group_%s_min", group.ID)
			compiledConstraint, _, err := mtbdd.ParseAndCompile(constraint, ce.mtbdd)
			if err != nil {
				return fmt.Errorf("failed to compile min constraint for %s: %w", group.ID, err)
			}
			ce.compiledRules[ruleID] = compiledConstraint
		}
		// For MinSelections > 1, we'd need arithmetic constraints
		// This is simplified for SMB package - complex counting not implemented
	}

	// Maximum selections constraint - simplified approach
	// For small MaxSelections, we can enumerate forbidden combinations
	if group.MaxSelections > 0 && group.MaxSelections < len(optionVars) {
		// For example, if MaxSelections = 2 and we have 4 options,
		// we need to prevent any combination of 3 or more selections
		// This is complex to enumerate, so we'll use a simpler approach
		// and rely on application logic for now

		// Note: Full implementation would use arithmetic MTBDDs
		// For SMB package, we'll handle this in validation layer
	}

	return nil
}

// ===================================================================
// CONSTRAINT EVALUATION METHODS
// ===================================================================

// ValidateSelections checks if selections satisfy all constraints
func (ce *ConstraintEngine) ValidateSelections(selections []Selection) ValidationResult {
	startTime := time.Now()
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	// Convert selections to MTBDD variable assignments
	assignments := ce.selectionsToAssignments(selections)

	var violations []RuleViolation

	// Evaluate each compiled rule
	for ruleID, compiledRule := range ce.compiledRules {
		result := ce.mtbdd.Evaluate(compiledRule, assignments)

		// If rule evaluates to false, it's violated
		if boolResult, ok := result.(bool); ok && !boolResult {
			violation := ce.createViolation(ruleID, selections)
			violations = append(violations, violation)
		}
	}

	// Update stats
	ce.stats.TotalEvaluations++
	elapsed := time.Since(startTime)
	ce.stats.AverageTime = time.Duration((int64(ce.stats.AverageTime)*ce.stats.TotalEvaluations + int64(elapsed)) / (ce.stats.TotalEvaluations + 1))

	return ValidationResult{
		IsValid:      len(violations) == 0,
		Violations:   violations,
		Suggestions:  ce.generateSuggestions(violations),
		ResponseTime: elapsed,
	}
}

// selectionsToAssignments converts user selections to MTBDD variable assignments
func (ce *ConstraintEngine) selectionsToAssignments(selections []Selection) map[string]bool {
	assignments := make(map[string]bool)

	// Initialize all option variables to false
	for _, option := range ce.model.Options {
		if option.IsActive {
			varName := fmt.Sprintf("opt_%s", option.ID)
			assignments[varName] = false
		}
	}

	// Set selected options to true
	for _, selection := range selections {
		if selection.Quantity > 0 {
			varName := fmt.Sprintf("opt_%s", selection.OptionID)
			assignments[varName] = true
		}
	}

	// Calculate group counts for multi-select groups
	for _, group := range ce.model.Groups {
		if group.Type == MultiSelect {
			count := 0
			for _, selection := range selections {
				if option, err := ce.model.GetOption(selection.OptionID); err == nil {
					if option.GroupID == group.ID && selection.Quantity > 0 {
						count++
					}
				}
			}
			varName := fmt.Sprintf("group_%s_count", group.ID)
			// For simplicity, convert count to boolean (>0)
			assignments[varName] = count > 0
		}
	}

	return assignments
}

// createViolation creates a rule violation with user-friendly information
func (ce *ConstraintEngine) createViolation(ruleID string, selections []Selection) RuleViolation {
	// Find the rule definition
	for _, rule := range ce.model.Rules {
		if rule.ID == ruleID {
			return RuleViolation{
				RuleID:          ruleID,
				RuleName:        rule.Name,
				Message:         rule.Message,
				AffectedOptions: ce.findAffectedOptions(rule, selections),
			}
		}
	}

	// Handle generated group constraints
	if strings.Contains(ruleID, "group_") && strings.Contains(ruleID, "_constraint") {
		groupID := ce.extractGroupIDFromRuleID(ruleID)
		if group, err := ce.model.GetGroup(groupID); err == nil {
			return RuleViolation{
				RuleID:          ruleID,
				RuleName:        fmt.Sprintf("%s Selection Rule", group.Name),
				Message:         ce.generateGroupViolationMessage(*group),
				AffectedOptions: ce.getGroupOptionIDs(groupID),
			}
		}
	}

	// Fallback for unknown rules
	return RuleViolation{
		RuleID:          ruleID,
		RuleName:        "Unknown Rule",
		Message:         "A constraint was violated",
		AffectedOptions: []string{},
	}
}

// Helper methods for violation handling
func (ce *ConstraintEngine) findAffectedOptions(rule Rule, selections []Selection) []string {
	// Simple implementation: extract option IDs from rule expression
	var affected []string
	for _, option := range ce.model.Options {
		if strings.Contains(rule.Expression, option.ID) {
			affected = append(affected, option.ID)
		}
	}
	return affected
}

func (ce *ConstraintEngine) extractGroupIDFromRuleID(ruleID string) string {
	// Extract group ID from rule ID like "group_groupid_constraint_0"
	parts := strings.Split(ruleID, "_")
	if len(parts) >= 2 {
		return parts[1]
	}
	return ""
}

func (ce *ConstraintEngine) generateGroupViolationMessage(group Group) string {
	switch group.Type {
	case SingleSelect:
		if group.IsRequired {
			return fmt.Sprintf("Please select exactly one option from %s", group.Name)
		}
		return fmt.Sprintf("Please select at most one option from %s", group.Name)
	case MultiSelect:
		if group.MinSelections > 0 {
			return fmt.Sprintf("Please select at least %d options from %s", group.MinSelections, group.Name)
		}
		return fmt.Sprintf("Selection limit exceeded for %s", group.Name)
	default:
		return fmt.Sprintf("Selection constraint violated for %s", group.Name)
	}
}

func (ce *ConstraintEngine) getGroupOptionIDs(groupID string) []string {
	var optionIDs []string
	for _, option := range ce.model.Options {
		if option.GroupID == groupID && option.IsActive {
			optionIDs = append(optionIDs, option.ID)
		}
	}
	return optionIDs
}

func (ce *ConstraintEngine) generateSuggestions(violations []RuleViolation) []string {
	var suggestions []string

	for _, violation := range violations {
		switch {
		case strings.Contains(violation.Message, "exactly one"):
			suggestions = append(suggestions, "Choose only one option from this group")
		case strings.Contains(violation.Message, "at least"):
			suggestions = append(suggestions, "Select more options to meet minimum requirements")
		case strings.Contains(violation.RuleName, "requires"):
			suggestions = append(suggestions, "Add required options to your selection")
		case strings.Contains(violation.RuleName, "excludes"):
			suggestions = append(suggestions, "Remove conflicting options from your selection")
		}
	}

	// Remove duplicates
	uniqueSuggestions := make(map[string]bool)
	var result []string
	for _, suggestion := range suggestions {
		if !uniqueSuggestions[suggestion] {
			uniqueSuggestions[suggestion] = true
			result = append(result, suggestion)
		}
	}

	return result
}

// ===================================================================
// ENGINE INFORMATION AND STATS
// ===================================================================

// GetStats returns current engine performance statistics
func (ce *ConstraintEngine) GetStats() ConstraintStats {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()
	return ce.stats
}

// GetCompiledRuleCount returns the number of compiled rules
func (ce *ConstraintEngine) GetCompiledRuleCount() int {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()
	return len(ce.compiledRules)
}

// GetDeclaredVariables returns all declared MTBDD variables
func (ce *ConstraintEngine) GetDeclaredVariables() []string {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	var variables []string
	for varName := range ce.variables {
		variables = append(variables, varName)
	}
	sort.Strings(variables)
	return variables
}

// IsValidConfiguration quickly checks if a configuration is valid
func (ce *ConstraintEngine) IsValidConfiguration(selections []Selection) bool {
	result := ce.ValidateSelections(selections)
	return result.IsValid
}

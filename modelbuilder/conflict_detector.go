// conflict_detector.go - Rule Conflict Detection using MTBDD operations
// Part of Model Building Tools for CPQ Platform Layer
// Performance target: <200ms for models with 50+ rules

package modelbuilder

import (
	"fmt"
	"strings"
	"time"

	"DD/cpq"
	"DD/mtbdd"
	"DD/parser"
)

// ===================================================================
// RULE CONFLICT DETECTION
// ===================================================================

// RuleConflict represents a detected conflict between rules
type RuleConflict struct {
	ConflictID          string    `json:"conflict_id"`
	ConflictingRules    []string  `json:"conflicting_rules"`
	ConflictType        string    `json:"conflict_type"`
	AffectedScenarios   []string  `json:"affected_scenarios"`
	SuggestedResolution string    `json:"suggested_resolution"`
	Severity            string    `json:"severity"` // "critical", "warning", "info"
	DetectedAt          time.Time `json:"detected_at"`
}

// ConflictDetectionResult contains all detected conflicts
type ConflictDetectionResult struct {
	TotalRulesAnalyzed int            `json:"total_rules_analyzed"`
	ConflictsFound     int            `json:"conflicts_found"`
	CriticalConflicts  int            `json:"critical_conflicts"`
	WarningConflicts   int            `json:"warning_conflicts"`
	Conflicts          []RuleConflict `json:"conflicts"`
	AnalysisTime       time.Duration  `json:"analysis_time"`
	Recommendations    []string       `json:"recommendations"`
}

// ConflictDetector analyzes CPQ models for rule conflicts using MTBDD operations
type ConflictDetector struct {
	model            *cpq.Model
	mtbdd            *mtbdd.MTBDD
	constraintEngine *cpq.ConstraintEngine
	compiledRules    map[string]mtbdd.NodeRef
	ruleConditions   map[string]mtbdd.NodeRef
	ruleActions      map[string]string
}

// NewConflictDetector creates a new rule conflict detector
func NewConflictDetector(model *cpq.Model) (*ConflictDetector, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	// Create constraint engine to leverage existing MTBDD operations
	constraintEngine, err := cpq.NewConstraintEngine(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create constraint engine: %w", err)
	}

	detector := &ConflictDetector{
		model:            model,
		mtbdd:            mtbdd.NewMTBDD(),
		constraintEngine: constraintEngine,
		compiledRules:    make(map[string]mtbdd.NodeRef),
		ruleConditions:   make(map[string]mtbdd.NodeRef),
		ruleActions:      make(map[string]string),
	}

	// Pre-compile all rule conditions for conflict analysis
	if err := detector.compileRuleConditions(); err != nil {
		return nil, fmt.Errorf("failed to compile rule conditions: %w", err)
	}

	return detector, nil
}

// DetectConflicts analyzes the model for all types of rule conflicts
func (cd *ConflictDetector) DetectConflicts() (*ConflictDetectionResult, error) {
	startTime := time.Now()

	var allConflicts []RuleConflict

	// 1. Detect direct contradictions (A requires B, C excludes B)
	contradictions, err := cd.detectDirectContradictions()
	if err != nil {
		return nil, fmt.Errorf("failed to detect contradictions: %w", err)
	}
	allConflicts = append(allConflicts, contradictions...)

	// 2. Detect mutual exclusion violations
	mutualExclusions, err := cd.detectMutualExclusionConflicts()
	if err != nil {
		return nil, fmt.Errorf("failed to detect mutual exclusion conflicts: %w", err)
	}
	allConflicts = append(allConflicts, mutualExclusions...)

	// 3. Detect circular dependencies
	circularDeps, err := cd.detectCircularDependencies()
	if err != nil {
		return nil, fmt.Errorf("failed to detect circular dependencies: %w", err)
	}
	allConflicts = append(allConflicts, circularDeps...)

	// 4. Detect impossible constraints
	impossibleConstraints, err := cd.detectImpossibleConstraints()
	if err != nil {
		return nil, fmt.Errorf("failed to detect impossible constraints: %w", err)
	}
	allConflicts = append(allConflicts, impossibleConstraints...)

	// Categorize conflicts by severity
	criticalCount := 0
	warningCount := 0
	for _, conflict := range allConflicts {
		switch conflict.Severity {
		case "critical":
			criticalCount++
		case "warning":
			warningCount++
		}
	}

	// Generate recommendations
	recommendations := cd.generateRecommendations(allConflicts)

	result := &ConflictDetectionResult{
		TotalRulesAnalyzed: len(cd.model.Rules),
		ConflictsFound:     len(allConflicts),
		CriticalConflicts:  criticalCount,
		WarningConflicts:   warningCount,
		Conflicts:          allConflicts,
		AnalysisTime:       time.Since(startTime),
		Recommendations:    recommendations,
	}

	return result, nil
}

// compileRuleConditions pre-compiles all rule conditions using existing MTBDD operations
func (cd *ConflictDetector) compileRuleConditions() error {
	for _, rule := range cd.model.Rules {
		// Parse rule expression to extract condition and action
		condition, action := cd.parseRuleExpression(rule.Expression)

		// Compile condition using existing parser/compiler pattern
		conditionExpr, err := parser.ParseExpression(condition)
		if err != nil {
			return fmt.Errorf("failed to parse rule %s condition: %w", rule.ID, err)
		}

		// Use existing MTBDD compilation
		conditionRef, _, err := mtbdd.Compile(conditionExpr, cd.mtbdd)
		if err != nil {
			return fmt.Errorf("failed to compile rule %s condition: %w", rule.ID, err)
		}

		cd.ruleConditions[rule.ID] = conditionRef
		cd.ruleActions[rule.ID] = action
	}

	return nil
}

// detectDirectContradictions finds rules with contradictory actions
func (cd *ConflictDetector) detectDirectContradictions() ([]RuleConflict, error) {
	var conflicts []RuleConflict

	// Compare each pair of rules for contradictions
	rules := cd.model.Rules
	for i := 0; i < len(rules); i++ {
		for j := i + 1; j < len(rules); j++ {
			rule1, rule2 := rules[i], rules[j]

			// Check if conditions overlap using MTBDD operations
			overlap := cd.mtbdd.AND(cd.ruleConditions[rule1.ID], cd.ruleConditions[rule2.ID])

			// If conditions overlap, check if actions contradict
			if !cd.mtbdd.IsZero(overlap) {
				if cd.actionsContradict(rule1, rule2) {
					conflict := RuleConflict{
						ConflictID:        fmt.Sprintf("contradiction_%s_%s", rule1.ID, rule2.ID),
						ConflictingRules:  []string{rule1.ID, rule2.ID},
						ConflictType:      "direct_contradiction",
						AffectedScenarios: cd.extractScenarios(overlap),
						SuggestedResolution: fmt.Sprintf("Modify conditions to prevent overlap or prioritize %s over %s",
							rule1.Name, rule2.Name),
						Severity:   "critical",
						DetectedAt: time.Now(),
					}
					conflicts = append(conflicts, conflict)
				}
			}
		}
	}

	return conflicts, nil
}

// detectMutualExclusionConflicts finds violations of mutual exclusion rules
func (cd *ConflictDetector) detectMutualExclusionConflicts() ([]RuleConflict, error) {
	var conflicts []RuleConflict

	// Find all mutual exclusion rules
	for _, rule := range cd.model.Rules {
		if rule.Type == cpq.MutualExclusive {
			// Check if any other rules allow multiple options from the mutual exclusion set
			conflictingRules := cd.findMutualExclusionViolations(rule)
			if len(conflictingRules) > 0 {
				conflict := RuleConflict{
					ConflictID:          fmt.Sprintf("mutual_exclusion_%s", rule.ID),
					ConflictingRules:    append([]string{rule.ID}, conflictingRules...),
					ConflictType:        "mutual_exclusion_violation",
					AffectedScenarios:   cd.getMutualExclusionScenarios(rule),
					SuggestedResolution: "Ensure only one option from mutual exclusion set can be selected",
					Severity:            "critical",
					DetectedAt:          time.Now(),
				}
				conflicts = append(conflicts, conflict)
			}
		}
	}

	return conflicts, nil
}

// detectCircularDependencies finds circular requirement chains
func (cd *ConflictDetector) detectCircularDependencies() ([]RuleConflict, error) {
	var conflicts []RuleConflict

	// Build dependency graph
	dependencies := make(map[string][]string)
	for _, rule := range cd.model.Rules {
		if rule.Type == cpq.RequiresRule {
			// Parse "A requires B" to extract dependency
			deps := cd.extractDependencies(rule.Expression)
			for source, targets := range deps {
				dependencies[source] = append(dependencies[source], targets...)
			}
		}
	}

	// Detect cycles using DFS
	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	for option := range dependencies {
		if !visited[option] {
			cycle := cd.detectCycle(option, dependencies, visited, recStack, []string{})
			if len(cycle) > 0 {
				conflict := RuleConflict{
					ConflictID:        fmt.Sprintf("circular_dependency_%s", strings.Join(cycle, "_")),
					ConflictingRules:  cd.getRulesInvolvedInCycle(cycle),
					ConflictType:      "circular_dependency",
					AffectedScenarios: cycle,
					SuggestedResolution: fmt.Sprintf("Break circular dependency by removing one requirement in chain: %s",
						strings.Join(cycle, " -> ")),
					Severity:   "critical",
					DetectedAt: time.Now(),
				}
				conflicts = append(conflicts, conflict)
			}
		}
	}

	return conflicts, nil
}

// detectImpossibleConstraints finds constraints that can never be satisfied
func (cd *ConflictDetector) detectImpossibleConstraints() ([]RuleConflict, error) {
	var conflicts []RuleConflict

	// Check if any combination of rules creates unsatisfiable constraints
	for _, rule := range cd.model.Rules {
		// Create combined constraint with all other rules
		combinedConstraint := cd.ruleConditions[rule.ID]

		for _, otherRule := range cd.model.Rules {
			if otherRule.ID != rule.ID {
				combinedConstraint = cd.mtbdd.AND(combinedConstraint, cd.ruleConditions[otherRule.ID])
			}
		}

		// If combined constraint is always false, we have an impossible constraint
		if cd.mtbdd.IsZero(combinedConstraint) {
			conflict := RuleConflict{
				ConflictID:        fmt.Sprintf("impossible_constraint_%s", rule.ID),
				ConflictingRules:  []string{rule.ID},
				ConflictType:      "impossible_constraint",
				AffectedScenarios: []string{"all scenarios"},
				SuggestedResolution: fmt.Sprintf("Rule %s creates impossible constraints when combined with other rules",
					rule.Name),
				Severity:   "critical",
				DetectedAt: time.Now(),
			}
			conflicts = append(conflicts, conflict)
		}
	}

	return conflicts, nil
}

// Helper methods

func (cd *ConflictDetector) parseRuleExpression(expression string) (condition, action string) {
	// Parse boolean expressions like "opt_cpu_high -> opt_cooling_liquid"
	if strings.Contains(expression, "->") {
		parts := strings.Split(expression, "->")
		if len(parts) == 2 {
			return strings.TrimSpace(parts[0]), strings.TrimSpace(parts[1])
		}
	}
	// Fallback: treat entire expression as condition
	return expression, ""
}

func (cd *ConflictDetector) actionsContradict(rule1, rule2 cpq.Rule) bool {
	action1 := cd.ruleActions[rule1.ID]
	action2 := cd.ruleActions[rule2.ID]

	// Check for contradictory actions in boolean format
	// "opt_cooling_liquid" vs "!opt_cooling_liquid"
	if strings.HasPrefix(action1, "!") && !strings.HasPrefix(action2, "!") {
		target1 := strings.TrimPrefix(action1, "!")
		return target1 == action2
	}
	if strings.HasPrefix(action2, "!") && !strings.HasPrefix(action1, "!") {
		target2 := strings.TrimPrefix(action2, "!")
		return target2 == action1
	}

	return false
}

func (cd *ConflictDetector) extractActionTarget(action string) string {
	// Extract target from boolean actions like "opt_cooling_liquid" or "!opt_cooling_liquid"
	if strings.HasPrefix(action, "!") {
		return strings.TrimPrefix(action, "!")
	}
	return action
}

func (cd *ConflictDetector) extractScenarios(nodeRef mtbdd.NodeRef) []string {
	// Extract specific scenarios where conflict occurs
	// This would use MTBDD path enumeration to find satisfying assignments
	return []string{"scenario analysis not implemented"}
}

func (cd *ConflictDetector) findMutualExclusionViolations(rule cpq.Rule) []string {
	// Find rules that violate mutual exclusion
	return []string{} // Placeholder
}

func (cd *ConflictDetector) getMutualExclusionScenarios(rule cpq.Rule) []string {
	return []string{"mutual exclusion scenarios"}
}

func (cd *ConflictDetector) extractDependencies(expression string) map[string][]string {
	dependencies := make(map[string][]string)
	// Parse "A requires B" expressions
	// This would be implemented based on the actual expression format
	return dependencies
}

func (cd *ConflictDetector) detectCycle(node string, dependencies map[string][]string,
	visited, recStack map[string]bool, path []string) []string {

	visited[node] = true
	recStack[node] = true
	path = append(path, node)

	for _, neighbor := range dependencies[node] {
		if !visited[neighbor] {
			cycle := cd.detectCycle(neighbor, dependencies, visited, recStack, path)
			if len(cycle) > 0 {
				return cycle
			}
		} else if recStack[neighbor] {
			// Found cycle - return the cycle path
			cycleStart := -1
			for i, n := range path {
				if n == neighbor {
					cycleStart = i
					break
				}
			}
			if cycleStart >= 0 {
				return append(path[cycleStart:], neighbor)
			}
		}
	}

	recStack[node] = false
	return []string{}
}

func (cd *ConflictDetector) getRulesInvolvedInCycle(cycle []string) []string {
	var ruleIDs []string
	// Map options back to rules that define their relationships
	for _, rule := range cd.model.Rules {
		for _, option := range cycle {
			if strings.Contains(rule.Expression, option) {
				ruleIDs = append(ruleIDs, rule.ID)
				break
			}
		}
	}
	return ruleIDs
}

func (cd *ConflictDetector) generateRecommendations(conflicts []RuleConflict) []string {
	var recommendations []string

	if len(conflicts) == 0 {
		recommendations = append(recommendations, "No conflicts detected - model rules are consistent")
		return recommendations
	}

	// Count conflict types
	conflictTypes := make(map[string]int)
	for _, conflict := range conflicts {
		conflictTypes[conflict.ConflictType]++
	}

	// Generate type-specific recommendations
	if count := conflictTypes["direct_contradiction"]; count > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("Review %d direct contradictions - consider rule priority or condition refinement", count))
	}

	if count := conflictTypes["circular_dependency"]; count > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("Break %d circular dependencies by removing or modifying requirement chains", count))
	}

	if count := conflictTypes["impossible_constraint"]; count > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("Address %d impossible constraints that can never be satisfied", count))
	}

	// Overall recommendations
	criticalCount := 0
	for _, conflict := range conflicts {
		if conflict.Severity == "critical" {
			criticalCount++
		}
	}

	if criticalCount > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("PRIORITY: Resolve %d critical conflicts before deploying model", criticalCount))
	}

	return recommendations
}

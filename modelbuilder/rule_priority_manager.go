// rule_priority_manager.go - Rule Priority Management for CPQ Models
// Part of Model Building Tools for CPQ Platform Layer
// Performance target: <200ms for priority operations on 50+ rules

package modelbuilder

import (
	"fmt"
	"sort"
	"strings"
	"time"

	"DD/cpq"
)

// ===================================================================
// RULE PRIORITY MANAGEMENT
// ===================================================================

// PriorityConflict represents a priority assignment conflict
type PriorityConflict struct {
	ConflictID    string   `json:"conflict_id"`
	ConflictType  string   `json:"conflict_type"` // "duplicate", "gap", "invalid_range"
	AffectedRules []string `json:"affected_rules"`
	CurrentValues []int    `json:"current_values"`
	Message       string   `json:"message"`
	Suggestion    string   `json:"suggestion"`
	Severity      string   `json:"severity"`
}

// PriorityAssignment represents a rule's priority assignment
type PriorityAssignment struct {
	RuleID            string `json:"rule_id"`
	RuleName          string `json:"rule_name"`
	RuleType          string `json:"rule_type"`
	CurrentPriority   int    `json:"current_priority"`
	SuggestedPriority int    `json:"suggested_priority"`
	AssignmentReason  string `json:"assignment_reason"`
	IsManualOverride  bool   `json:"is_manual_override"`
}

// PriorityAnalysis contains comprehensive priority analysis results
type PriorityAnalysis struct {
	TotalRules             int                  `json:"total_rules"`
	RulesWithPriorities    int                  `json:"rules_with_priorities"`
	RulesWithoutPriorities int                  `json:"rules_without_priorities"`
	ConflictsFound         int                  `json:"conflicts_found"`
	Conflicts              []PriorityConflict   `json:"conflicts"`
	Assignments            []PriorityAssignment `json:"assignments"`
	ExecutionOrder         []string             `json:"execution_order"`
	AnalysisTime           time.Duration        `json:"analysis_time"`
	Recommendations        []string             `json:"recommendations"`
}

// PriorityManagerConfig contains configuration for priority management
type PriorityManagerConfig struct {
	AutoAssignPriorities   bool                 `json:"auto_assign_priorities"`
	PriorityGap            int                  `json:"priority_gap"`            // Gap between auto-assigned priorities
	ReserveHighPriorities  int                  `json:"reserve_high_priorities"` // Number of high priorities to reserve
	ReserveLowPriorities   int                  `json:"reserve_low_priorities"`  // Number of low priorities to reserve
	RuleTypeBasePriorities map[cpq.RuleType]int `json:"rule_type_base_priorities"`
	ManualOverrides        map[string]int       `json:"manual_overrides"`
}

// RulePriorityManager manages rule priorities and execution order
type RulePriorityManager struct {
	model  *cpq.Model
	config PriorityManagerConfig
}

// NewRulePriorityManager creates a new rule priority manager
func NewRulePriorityManager(model *cpq.Model) (*RulePriorityManager, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	// Default configuration
	config := PriorityManagerConfig{
		AutoAssignPriorities:  true,
		PriorityGap:           10,
		ReserveHighPriorities: 5,
		ReserveLowPriorities:  5,
		RuleTypeBasePriorities: map[cpq.RuleType]int{
			cpq.ValidationRule:  100, // Highest priority - validation first
			cpq.RequiresRule:    200, // Dependencies second
			cpq.ExcludesRule:    300, // Exclusions third
			cpq.MutualExclusive: 400, // Mutual exclusions fourth
			cpq.PricingRule:     500, // Pricing calculations last
		},
		ManualOverrides: make(map[string]int),
	}

	manager := &RulePriorityManager{
		model:  model,
		config: config,
	}

	return manager, nil
}

// NewRulePriorityManagerWithConfig creates a manager with custom configuration
func NewRulePriorityManagerWithConfig(model *cpq.Model, config PriorityManagerConfig) (*RulePriorityManager, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	manager := &RulePriorityManager{
		model:  model,
		config: config,
	}

	return manager, nil
}

// AnalyzePriorities performs comprehensive priority analysis
func (rpm *RulePriorityManager) AnalyzePriorities() (*PriorityAnalysis, error) {
	startTime := time.Now()

	// Count rules with and without priorities
	rulesWithPriorities := 0
	rulesWithoutPriorities := 0
	for _, rule := range rpm.model.Rules {
		if rule.Priority > 0 {
			rulesWithPriorities++
		} else {
			rulesWithoutPriorities++
		}
	}

	// Detect priority conflicts
	conflicts := rpm.detectPriorityConflicts()

	// Generate suggested assignments
	assignments := rpm.generatePriorityAssignments()

	// Calculate execution order
	executionOrder := rpm.calculateExecutionOrder(assignments)

	// Generate recommendations
	recommendations := rpm.generateRecommendations(conflicts, assignments)

	analysis := &PriorityAnalysis{
		TotalRules:             len(rpm.model.Rules),
		RulesWithPriorities:    rulesWithPriorities,
		RulesWithoutPriorities: rulesWithoutPriorities,
		ConflictsFound:         len(conflicts),
		Conflicts:              conflicts,
		Assignments:            assignments,
		ExecutionOrder:         executionOrder,
		AnalysisTime:           time.Since(startTime),
		Recommendations:        recommendations,
	}

	return analysis, nil
}

// ApplyPriorityAssignments applies suggested priority assignments to the model
func (rpm *RulePriorityManager) ApplyPriorityAssignments(assignments []PriorityAssignment) error {
	// Create map of assignments for quick lookup
	assignmentMap := make(map[string]int)
	for _, assignment := range assignments {
		assignmentMap[assignment.RuleID] = assignment.SuggestedPriority
	}

	// Apply assignments to model rules
	for i := range rpm.model.Rules {
		rule := &rpm.model.Rules[i]
		if newPriority, exists := assignmentMap[rule.ID]; exists {
			rule.Priority = newPriority
		}
	}

	return nil
}

// SetManualPriority sets a manual priority override for a specific rule
func (rpm *RulePriorityManager) SetManualPriority(ruleID string, priority int) error {
	// Validate rule exists
	ruleExists := false
	for _, rule := range rpm.model.Rules {
		if rule.ID == ruleID {
			ruleExists = true
			break
		}
	}

	if !ruleExists {
		return fmt.Errorf("rule with ID '%s' not found", ruleID)
	}

	if priority < 0 {
		return fmt.Errorf("priority must be non-negative, got %d", priority)
	}

	// Set manual override
	rpm.config.ManualOverrides[ruleID] = priority

	return nil
}

// ClearManualPriority removes a manual priority override
func (rpm *RulePriorityManager) ClearManualPriority(ruleID string) {
	delete(rpm.config.ManualOverrides, ruleID)
}

// OptimizeExecutionOrder optimizes rule execution order for performance
func (rpm *RulePriorityManager) OptimizeExecutionOrder() (*PriorityAnalysis, error) {
	// Analyze current state
	analysis, err := rpm.AnalyzePriorities()
	if err != nil {
		return nil, fmt.Errorf("failed to analyze priorities: %w", err)
	}

	// Generate optimized assignments
	optimizedAssignments := rpm.generateOptimizedAssignments()

	// Update analysis with optimized assignments
	analysis.Assignments = optimizedAssignments
	analysis.ExecutionOrder = rpm.calculateExecutionOrder(optimizedAssignments)

	return analysis, nil
}

// detectPriorityConflicts identifies priority assignment conflicts
func (rpm *RulePriorityManager) detectPriorityConflicts() []PriorityConflict {
	var conflicts []PriorityConflict

	// Group rules by priority
	priorityGroups := make(map[int][]string)
	for _, rule := range rpm.model.Rules {
		if rule.Priority > 0 {
			priorityGroups[rule.Priority] = append(priorityGroups[rule.Priority], rule.ID)
		}
	}

	// Detect duplicate priorities
	for priority, ruleIDs := range priorityGroups {
		if len(ruleIDs) > 1 {
			conflicts = append(conflicts, PriorityConflict{
				ConflictID:    fmt.Sprintf("duplicate_priority_%d", priority),
				ConflictType:  "duplicate",
				AffectedRules: ruleIDs,
				CurrentValues: []int{priority},
				Message:       fmt.Sprintf("Multiple rules have priority %d", priority),
				Suggestion:    "Assign unique priorities to ensure predictable execution order",
				Severity:      "warning",
			})
		}
	}

	// Detect large gaps in priorities
	if len(priorityGroups) > 1 {
		var priorities []int
		for priority := range priorityGroups {
			priorities = append(priorities, priority)
		}
		sort.Ints(priorities)

		for i := 1; i < len(priorities); i++ {
			gap := priorities[i] - priorities[i-1]
			if gap > rpm.config.PriorityGap*5 { // Large gap threshold
				conflicts = append(conflicts, PriorityConflict{
					ConflictID:    fmt.Sprintf("large_gap_%d_%d", priorities[i-1], priorities[i]),
					ConflictType:  "gap",
					AffectedRules: []string{}, // Not specific to rules
					CurrentValues: []int{priorities[i-1], priorities[i]},
					Message:       fmt.Sprintf("Large priority gap between %d and %d", priorities[i-1], priorities[i]),
					Suggestion:    "Consider reorganizing priorities to reduce gaps",
					Severity:      "info",
				})
			}
		}
	}

	return conflicts
}

// generatePriorityAssignments creates suggested priority assignments
func (rpm *RulePriorityManager) generatePriorityAssignments() []PriorityAssignment {
	var assignments []PriorityAssignment

	// Group rules by type for systematic assignment
	rulesByType := make(map[cpq.RuleType][]cpq.Rule)
	for _, rule := range rpm.model.Rules {
		rulesByType[rule.Type] = append(rulesByType[rule.Type], rule)
	}

	// Assign priorities by type
	for ruleType, basePriority := range rpm.config.RuleTypeBasePriorities {
		rules := rulesByType[ruleType]

		for i, rule := range rules {
			// Check for manual override
			suggestedPriority := basePriority + (i * rpm.config.PriorityGap)
			isManualOverride := false
			assignmentReason := fmt.Sprintf("Auto-assigned based on rule type (%s)", ruleType)

			if manualPriority, exists := rpm.config.ManualOverrides[rule.ID]; exists {
				suggestedPriority = manualPriority
				isManualOverride = true
				assignmentReason = "Manual override"
			}

			assignment := PriorityAssignment{
				RuleID:            rule.ID,
				RuleName:          rule.Name,
				RuleType:          string(ruleType),
				CurrentPriority:   rule.Priority,
				SuggestedPriority: suggestedPriority,
				AssignmentReason:  assignmentReason,
				IsManualOverride:  isManualOverride,
			}

			assignments = append(assignments, assignment)
		}
	}

	// Sort assignments by suggested priority
	sort.Slice(assignments, func(i, j int) bool {
		return assignments[i].SuggestedPriority < assignments[j].SuggestedPriority
	})

	return assignments
}

// generateOptimizedAssignments creates performance-optimized priority assignments
func (rpm *RulePriorityManager) generateOptimizedAssignments() []PriorityAssignment {
	// Start with basic assignments
	assignments := rpm.generatePriorityAssignments()

	// Apply optimization strategies
	rpm.optimizeByDependencies(assignments)
	rpm.optimizeByComplexity(assignments)
	rpm.optimizeByFrequency(assignments)

	// Re-sort after optimization
	sort.Slice(assignments, func(i, j int) bool {
		return assignments[i].SuggestedPriority < assignments[j].SuggestedPriority
	})

	return assignments
}

// optimizeByDependencies adjusts priorities based on rule dependencies
func (rpm *RulePriorityManager) optimizeByDependencies(assignments []PriorityAssignment) {
	// Build dependency graph
	dependencies := rpm.buildDependencyGraph()

	// Adjust priorities to respect dependencies
	for i := range assignments {
		assignment := &assignments[i]

		// If rule has dependencies, ensure it comes after them
		if deps, exists := dependencies[assignment.RuleID]; exists {
			maxDepPriority := 0
			for _, dep := range deps {
				for j := range assignments {
					if assignments[j].RuleID == dep && assignments[j].SuggestedPriority > maxDepPriority {
						maxDepPriority = assignments[j].SuggestedPriority
					}
				}
			}

			if maxDepPriority > 0 && assignment.SuggestedPriority <= maxDepPriority {
				assignment.SuggestedPriority = maxDepPriority + rpm.config.PriorityGap
				assignment.AssignmentReason += " (adjusted for dependencies)"
			}
		}
	}
}

// optimizeByComplexity adjusts priorities based on rule complexity
func (rpm *RulePriorityManager) optimizeByComplexity(assignments []PriorityAssignment) {
	// Calculate complexity scores for rules
	complexityScores := rpm.calculateRuleComplexityScores()

	// Simple rules should generally execute first (lower priority numbers)
	for i := range assignments {
		assignment := &assignments[i]
		if complexity, exists := complexityScores[assignment.RuleID]; exists {
			// Adjust priority based on complexity (simple rules first)
			if complexity < 2.0 { // Simple rule
				assignment.SuggestedPriority -= 5
				assignment.AssignmentReason += " (simple rule priority boost)"
			} else if complexity > 5.0 { // Complex rule
				assignment.SuggestedPriority += 5
				assignment.AssignmentReason += " (complex rule penalty)"
			}
		}
	}
}

// optimizeByFrequency adjusts priorities based on expected execution frequency
func (rpm *RulePriorityManager) optimizeByFrequency(assignments []PriorityAssignment) {
	// This is a simplified frequency optimization
	// In practice, you might use actual usage statistics

	for i := range assignments {
		assignment := &assignments[i]

		// Validation rules are executed frequently - prioritize them
		if assignment.RuleType == string(cpq.ValidationRule) {
			assignment.SuggestedPriority -= 10
			assignment.AssignmentReason += " (high frequency optimization)"
		}

		// Pricing rules are executed less frequently - lower priority
		if assignment.RuleType == string(cpq.PricingRule) {
			assignment.SuggestedPriority += 10
			assignment.AssignmentReason += " (low frequency optimization)"
		}
	}
}

// calculateExecutionOrder determines optimal rule execution order
func (rpm *RulePriorityManager) calculateExecutionOrder(assignments []PriorityAssignment) []string {
	// Sort assignments by priority (lowest first)
	sortedAssignments := make([]PriorityAssignment, len(assignments))
	copy(sortedAssignments, assignments)

	sort.Slice(sortedAssignments, func(i, j int) bool {
		return sortedAssignments[i].SuggestedPriority < sortedAssignments[j].SuggestedPriority
	})

	// Extract execution order
	var executionOrder []string
	for _, assignment := range sortedAssignments {
		executionOrder = append(executionOrder, assignment.RuleID)
	}

	return executionOrder
}

// buildDependencyGraph builds a graph of rule dependencies
func (rpm *RulePriorityManager) buildDependencyGraph() map[string][]string {
	dependencies := make(map[string][]string)

	// Analyze rule expressions to find dependencies
	for _, rule := range rpm.model.Rules {
		if rule.Type == cpq.RequiresRule {
			// Parse "A -> B" to find that B depends on A
			deps := rpm.extractExpressionDependencies(rule.Expression)
			for target, sources := range deps {
				dependencies[target] = append(dependencies[target], sources...)
			}
		}
	}

	return dependencies
}

// extractExpressionDependencies extracts dependencies from rule expressions
func (rpm *RulePriorityManager) extractExpressionDependencies(expression string) map[string][]string {
	dependencies := make(map[string][]string)

	// Simplified dependency extraction for "A -> B" patterns
	if strings.Contains(expression, "->") {
		parts := strings.Split(expression, "->")
		if len(parts) == 2 {
			source := strings.TrimSpace(parts[0])
			target := strings.TrimSpace(parts[1])

			// Find rule IDs that handle these options
			sourceRules := rpm.findRulesHandling(source)
			targetRules := rpm.findRulesHandling(target)

			for _, targetRule := range targetRules {
				dependencies[targetRule] = append(dependencies[targetRule], sourceRules...)
			}
		}
	}

	return dependencies
}

// findRulesHandling finds rules that handle a specific option
func (rpm *RulePriorityManager) findRulesHandling(option string) []string {
	var ruleIDs []string

	for _, rule := range rpm.model.Rules {
		if strings.Contains(rule.Expression, option) {
			ruleIDs = append(ruleIDs, rule.ID)
		}
	}

	return ruleIDs
}

// calculateRuleComplexityScores calculates complexity scores for rules
func (rpm *RulePriorityManager) calculateRuleComplexityScores() map[string]float64 {
	scores := make(map[string]float64)

	for _, rule := range rpm.model.Rules {
		complexity := 1.0 // Base complexity

		// Add complexity for logical operators
		expression := rule.Expression
		complexity += float64(strings.Count(expression, "AND")) * 0.5
		complexity += float64(strings.Count(expression, "OR")) * 0.5
		complexity += float64(strings.Count(expression, "NOT")) * 0.3
		complexity += float64(strings.Count(expression, "->")) * 0.4

		// Add complexity for parentheses (nesting)
		complexity += float64(strings.Count(expression, "(")) * 0.2

		// Add complexity based on rule type
		switch rule.Type {
		case cpq.ValidationRule:
			complexity += 0.5
		case cpq.RequiresRule:
			complexity += 1.0
		case cpq.ExcludesRule:
			complexity += 1.0
		case cpq.MutualExclusive:
			complexity += 1.5
		case cpq.PricingRule:
			complexity += 2.0
		}

		scores[rule.ID] = complexity
	}

	return scores
}

// generateRecommendations creates recommendations based on analysis
func (rpm *RulePriorityManager) generateRecommendations(conflicts []PriorityConflict, assignments []PriorityAssignment) []string {
	var recommendations []string

	// Recommendations based on conflicts
	if len(conflicts) == 0 {
		recommendations = append(recommendations, "No priority conflicts detected - rule execution order is well-defined")
	} else {
		recommendations = append(recommendations, fmt.Sprintf("Resolve %d priority conflicts for predictable rule execution", len(conflicts)))

		duplicateCount := 0
		for _, conflict := range conflicts {
			if conflict.ConflictType == "duplicate" {
				duplicateCount++
			}
		}

		if duplicateCount > 0 {
			recommendations = append(recommendations, fmt.Sprintf("Assign unique priorities to %d rules with duplicate priorities", duplicateCount))
		}
	}

	// Recommendations based on assignments
	manualOverrides := 0
	unassignedRules := 0

	for _, assignment := range assignments {
		if assignment.IsManualOverride {
			manualOverrides++
		}
		if assignment.CurrentPriority == 0 {
			unassignedRules++
		}
	}

	if unassignedRules > 0 {
		recommendations = append(recommendations, fmt.Sprintf("Apply priority assignments to %d rules without priorities", unassignedRules))
	}

	if manualOverrides > len(assignments)/2 {
		recommendations = append(recommendations, "Consider reviewing manual priority overrides for consistency")
	}

	// Performance recommendations
	if len(rpm.model.Rules) > 50 {
		recommendations = append(recommendations, "Large rule set detected - consider performance optimization")
	}

	return recommendations
}

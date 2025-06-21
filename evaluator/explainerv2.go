// explainerv2.go - Consolidated dependency graph explainer visitor
package evaluator

import (
	"DD/parser"
	"fmt"
	"sort"
	"strings"
	"time"
)

// ===================================================================
// RELATIONSHIP TYPES
// ===================================================================

// Dependency represents a "requires" relationship
type Dependency struct {
	Source      string   `json:"source"`      // Variable that creates the dependency
	Target      string   `json:"target"`      // Variable that is required
	Conditions  []string `json:"conditions"`  // Additional conditions for this dependency
	RuleID      string   `json:"rule_id"`     // Rule that creates this dependency
	RuleName    string   `json:"rule_name"`   // Human-readable rule name
	Explanation string   `json:"explanation"` // User-friendly explanation
}

// Exclusion represents a "conflicts with" relationship
type Exclusion struct {
	Source      string   `json:"source"`      // Variable that creates the exclusion
	Target      string   `json:"target"`      // Variable that is excluded
	Conditions  []string `json:"conditions"`  // Conditions under which exclusion applies
	RuleID      string   `json:"rule_id"`
	RuleName    string   `json:"rule_name"`
	Explanation string   `json:"explanation"`
}

// Implication represents complex conditional relationships
type Implication struct {
	Conditions  []string `json:"conditions"`  // Variables that must be true
	Consequence string   `json:"consequence"` // What happens when conditions are met
	Type        string   `json:"type"`        // "requires", "excludes", "enables"
	RuleID      string   `json:"rule_id"`
	RuleName    string   `json:"rule_name"`
	Explanation string   `json:"explanation"`
}

// RuleExplanation contains complete analysis of a single rule
type RuleExplanation struct {
	RuleID       string         `json:"rule_id"`
	RuleName     string         `json:"rule_name"`
	Expression   string         `json:"expression"`
	Dependencies []Dependency   `json:"dependencies"`
	Exclusions   []Exclusion    `json:"exclusions"`
	Implications []Implication  `json:"implications"`
	Variables    []string       `json:"variables"`  // All variables in this rule
	Complexity   int            `json:"complexity"` // Complexity score for prioritization
}

// ===================================================================
// COMPILED GRAPH TYPES
// ===================================================================

// CompiledDependencyGraph is a standalone structure with transitive closure
type CompiledDependencyGraph struct {
	// Direct relationships (from AST analysis)
	DirectDependencies map[string][]string `json:"direct_dependencies"`
	DirectExclusions   map[string][]string `json:"direct_exclusions"`

	// Transitive closure (computed)
	TransitiveDependencies map[string][]string `json:"transitive_dependencies"`
	TransitiveExclusions   map[string][]string `json:"transitive_exclusions"`

	// Topological information
	RuleEvaluationOrder []string       `json:"rule_evaluation_order"`
	DependencyLevels    map[string]int `json:"dependency_levels"`

	// Explanation data
	RuleExplanations       map[string]RuleExplanation `json:"rule_explanations"`
	DependencyExplanations map[string]string          `json:"dependency_explanations"`
	VariableDisplayNames   map[string]string          `json:"variable_display_names"`

	// Graph metadata
	Variables          []string         `json:"variables"`
	Rules              []string         `json:"rules"`
	HasCycles          bool             `json:"has_cycles"`
	CyclicDependencies [][]string       `json:"cyclic_dependencies"`
	CompilationStats   CompilationStats `json:"compilation_stats"`
}

// CompilationStats tracks performance and complexity metrics
type CompilationStats struct {
	TotalRules             int   `json:"total_rules"`
	TotalVariables         int   `json:"total_variables"`
	DirectDependencies     int   `json:"direct_dependencies"`
	TransitiveDependencies int   `json:"transitive_dependencies"`
	MaxDependencyDepth     int   `json:"max_dependency_depth"`
	CompilationTimeMs      int64 `json:"compilation_time_ms"`
	CyclesDetected         int   `json:"cycles_detected"`
}

// DependencyPath represents a path through the dependency graph
type DependencyPath struct {
	From        string   `json:"from"`
	To          string   `json:"to"`
	Path        []string `json:"path"`
	Length      int      `json:"length"`
	Explanation string   `json:"explanation"`
}

// EnhancedExplanation provides rich context for why options are unavailable
type EnhancedExplanation struct {
	Type            string           `json:"type"`
	Message         string           `json:"message"`
	BlockingRule    string           `json:"blocking_rule"`
	DependencyPaths []DependencyPath `json:"dependency_paths"`
	Suggestions     []string         `json:"suggestions"`
	Severity        string           `json:"severity"`
}

// ConditionAnalysis is used internally for analyzing expressions
type ConditionAnalysis struct {
	variables             []string // Primary variables in condition
	additionalConstraints []string // Additional constraint variables
	description           string   // Human-readable description
}

// ===================================================================
// EXPLAINER - MAIN VISITOR IMPLEMENTATION
// ===================================================================

// Explainer is a visitor that extracts dependency relationships from constraint rules
// and compiles them into a dependency graph with transitive closure for rich explanations
type Explainer struct {
	// Current rule context
	currentRuleID   string
	currentRuleName string

	// Extracted relationships
	dependencies     map[string][]Dependency
	exclusions       map[string][]Exclusion
	implications     map[string][]Implication
	ruleExplanations map[string]RuleExplanation
	variableNames    map[string]string // var_id -> display_name

	// Graph structures
	directGraph  map[string][]string // variable -> directly depends on
	reverseGraph map[string][]string // variable -> directly depended by
	ruleGraph    map[string][]string // rule -> rules it depends on

	// Compilation state
	isCompiled    bool
	compiledGraph *CompiledDependencyGraph
}

// NewExplainer creates a new explainer visitor
func NewExplainer() *Explainer {
	return &Explainer{
		dependencies:     make(map[string][]Dependency),
		exclusions:       make(map[string][]Exclusion),
		implications:     make(map[string][]Implication),
		ruleExplanations: make(map[string]RuleExplanation),
		variableNames:    make(map[string]string),
		directGraph:      make(map[string][]string),
		reverseGraph:     make(map[string][]string),
		ruleGraph:        make(map[string][]string),
		isCompiled:       false,
	}
}

// ===================================================================
// CONFIGURATION METHODS
// ===================================================================

// SetCurrentRule sets the context for the rule being processed
func (e *Explainer) SetCurrentRule(ruleID, ruleName, expression string) {
	e.currentRuleID = ruleID
	e.currentRuleName = ruleName

	// Initialize rule explanation
	e.ruleExplanations[ruleID] = RuleExplanation{
		RuleID:       ruleID,
		RuleName:     ruleName,
		Expression:   expression,
		Dependencies: []Dependency{},
		Exclusions:   []Exclusion{},
		Implications: []Implication{},
		Variables:    []string{},
		Complexity:   0,
	}

	// Mark as needing recompilation
	e.isCompiled = false
}

// SetVariableDisplayName sets human-readable name for a variable
func (e *Explainer) SetVariableDisplayName(varID, displayName string) {
	e.variableNames[varID] = displayName
}

// ===================================================================
// VISITOR PATTERN IMPLEMENTATION
// ===================================================================

// VisitBinaryOperation handles binary operations
func (e *Explainer) VisitBinaryOperation(node *parser.BinaryOperation) (interface{}, error) {
	switch node.Operator {
	case parser.TOKEN_IMPLIES_OP:
		return e.handleImplication(node)
	case parser.TOKEN_AND:
		return e.handleConjunction(node)
	case parser.TOKEN_OR:
		return e.handleDisjunction(node)
	case parser.TOKEN_EQ:
		return e.handleEquality(node)
	case parser.TOKEN_NE:
		return e.handleInequality(node)
	default:
		// For other operations, just process children
		node.Left.Accept(e)
		node.Right.Accept(e)
		return nil, nil
	}
}

// VisitUnaryOperation handles unary operations
func (e *Explainer) VisitUnaryOperation(node *parser.UnaryOperation) (interface{}, error) {
	switch node.Operator {
	case parser.TOKEN_NOT:
		return e.handleNegation(node)
	default:
		node.Operand.Accept(e)
		return nil, nil
	}
}

// VisitIdentifier handles variable references
func (e *Explainer) VisitIdentifier(node *parser.Identifier) (interface{}, error) {
	// Add variable to current rule's variable list
	if ruleExpl, exists := e.ruleExplanations[e.currentRuleID]; exists {
		// Create a copy and update the variables
		updatedExpl := ruleExpl
		updatedExpl.Variables = append(updatedExpl.Variables, node.Name)
		e.ruleExplanations[e.currentRuleID] = updatedExpl
	}
	return node.Name, nil
}

// VisitNumberLiteral handles numeric literals
func (e *Explainer) VisitNumberLiteral(node *parser.NumberLiteral) (interface{}, error) {
	return node.Value, nil
}

// VisitBooleanLiteral handles boolean literals
func (e *Explainer) VisitBooleanLiteral(node *parser.BooleanLiteral) (interface{}, error) {
	return node.Value, nil
}

// VisitFunctionCall handles function calls
func (e *Explainer) VisitFunctionCall(node *parser.FunctionCall) (interface{}, error) {
	switch node.Function {
	case parser.TOKEN_IMPLIES:
		return e.handleImpliesFunction(node)
	default:
		// For other functions like EXCLUDES, check the function name string
		funcName := node.Function.String()
		if strings.ToUpper(funcName) == "EXCLUDES" {
			return e.handleExcludesFunction(node)
		}
		// Process arguments for other functions
		for _, arg := range node.Args {
			arg.Accept(e)
		}
		return nil, nil
	}
}

// ===================================================================
// OPERATION HANDLERS
// ===================================================================

// handleImplication processes "A -> B" implications
func (e *Explainer) handleImplication(node *parser.BinaryOperation) (interface{}, error) {
	// First visit both sides to collect variables
	node.Left.Accept(e)
	node.Right.Accept(e)

	// Then extract for dependency analysis
	conditions := e.extractConditionVariables(node.Left)
	consequences := e.extractConsequenceVariables(node.Right)

	// Create dependencies for each condition -> consequence pair
	for _, condition := range conditions.variables {
		for _, consequence := range consequences.variables {
			dependency := Dependency{
				Source:      condition,
				Target:      consequence,
				Conditions:  conditions.additionalConstraints,
				RuleID:      e.currentRuleID,
				RuleName:    e.currentRuleName,
				Explanation: e.generateDependencyExplanation(condition, consequence, conditions.additionalConstraints),
			}

			e.addDependency(dependency)
		}
	}

	// Create implication record
	implication := Implication{
		Conditions:  conditions.variables,
		Consequence: consequences.description,
		Type:        "requires",
		RuleID:      e.currentRuleID,
		RuleName:    e.currentRuleName,
		Explanation: e.generateImplicationExplanation(conditions, consequences),
	}

	e.addImplication(implication)

	return nil, nil
}

// handleNegation processes "NOT A" expressions
func (e *Explainer) handleNegation(node *parser.UnaryOperation) (interface{}, error) {
	// First visit the operand to collect variables
	node.Operand.Accept(e)
	
	// Extract variables from negated expression
	variables := e.extractVariables(node.Operand)

	// NOT typically indicates exclusion
	for _, variable := range variables {
		exclusion := Exclusion{
			Source:      "any", // This exclusion applies broadly
			Target:      variable,
			Conditions:  []string{},
			RuleID:      e.currentRuleID,
			RuleName:    e.currentRuleName,
			Explanation: fmt.Sprintf("%s is not allowed", e.getDisplayName(variable)),
		}

		e.addExclusion(exclusion)
	}

	return nil, nil
}

// handleConjunction processes "A AND B" expressions
func (e *Explainer) handleConjunction(node *parser.BinaryOperation) (interface{}, error) {
	// Process both sides
	node.Left.Accept(e)
	node.Right.Accept(e)
	return nil, nil
}

// handleDisjunction processes "A OR B" expressions
func (e *Explainer) handleDisjunction(node *parser.BinaryOperation) (interface{}, error) {
	// Process both sides
	node.Left.Accept(e)
	node.Right.Accept(e)
	return nil, nil
}

// handleEquality processes "A == B" expressions
func (e *Explainer) handleEquality(node *parser.BinaryOperation) (interface{}, error) {
	node.Left.Accept(e)
	node.Right.Accept(e)
	return nil, nil
}

// handleInequality processes "A != B" expressions
func (e *Explainer) handleInequality(node *parser.BinaryOperation) (interface{}, error) {
	node.Left.Accept(e)
	node.Right.Accept(e)
	return nil, nil
}

// handleImpliesFunction processes IMPLIES(A, B) function calls
func (e *Explainer) handleImpliesFunction(node *parser.FunctionCall) (interface{}, error) {
	if len(node.Args) != 2 {
		return nil, fmt.Errorf("IMPLIES function requires exactly 2 arguments")
	}

	// Create a synthetic implication node
	syntheticNode := &parser.BinaryOperation{
		Left:     node.Args[0],
		Operator: parser.TOKEN_IMPLIES_OP,
		Right:    node.Args[1],
	}

	return e.handleImplication(syntheticNode)
}

// handleExcludesFunction processes EXCLUDES(A, B) function calls
func (e *Explainer) handleExcludesFunction(node *parser.FunctionCall) (interface{}, error) {
	if len(node.Args) != 2 {
		return nil, fmt.Errorf("EXCLUDES function requires exactly 2 arguments")
	}

	// First visit arguments to collect variables
	node.Args[0].Accept(e)
	node.Args[1].Accept(e)

	sourceVars := e.extractVariables(node.Args[0])
	targetVars := e.extractVariables(node.Args[1])

	for _, source := range sourceVars {
		for _, target := range targetVars {
			exclusion := Exclusion{
				Source:      source,
				Target:      target,
				Conditions:  []string{},
				RuleID:      e.currentRuleID,
				RuleName:    e.currentRuleName,
				Explanation: fmt.Sprintf("%s excludes %s", e.getDisplayName(source), e.getDisplayName(target)),
			}
			e.addExclusion(exclusion)
		}
	}

	return nil, nil
}

// ===================================================================
// VARIABLE EXTRACTION HELPERS
// ===================================================================

// Note: ConditionAnalysis type is already defined in explanation_visitor.go

// extractConditionVariables analyzes the left side of implications
func (e *Explainer) extractConditionVariables(expr parser.Expression) ConditionAnalysis {
	variables := e.extractVariables(expr)

	// For simple cases, first variable is primary
	primary := []string{}
	additional := []string{}

	if len(variables) > 0 {
		primary = append(primary, variables[0])
		if len(variables) > 1 {
			additional = variables[1:]
		}
	}

	description := e.generateConditionDescription(expr, variables)

	return ConditionAnalysis{
		variables:             primary,
		additionalConstraints: additional,
		description:           description,
	}
}

// extractConsequenceVariables analyzes the right side of implications
func (e *Explainer) extractConsequenceVariables(expr parser.Expression) ConditionAnalysis {
	variables := e.extractVariables(expr)
	description := e.generateConsequenceDescription(expr, variables)

	return ConditionAnalysis{
		variables:             variables,
		additionalConstraints: []string{},
		description:           description,
	}
}

// extractVariables recursively extracts all variables from an expression
func (e *Explainer) extractVariables(expr parser.Expression) []string {
	var variables []string

	switch node := expr.(type) {
	case *parser.Identifier:
		variables = append(variables, node.Name)
	case *parser.BinaryOperation:
		variables = append(variables, e.extractVariables(node.Left)...)
		variables = append(variables, e.extractVariables(node.Right)...)
	case *parser.UnaryOperation:
		variables = append(variables, e.extractVariables(node.Operand)...)
	case *parser.FunctionCall:
		for _, arg := range node.Args {
			variables = append(variables, e.extractVariables(arg)...)
		}
	}

	return e.deduplicateStrings(variables)
}

// ===================================================================
// RELATIONSHIP MANAGEMENT
// ===================================================================

// addDependency adds a dependency relationship
func (e *Explainer) addDependency(dep Dependency) {
	e.dependencies[dep.Source] = append(e.dependencies[dep.Source], dep)

	// Add to rule explanation - preserve existing fields
	if ruleExpl, exists := e.ruleExplanations[e.currentRuleID]; exists {
		// Create a copy and update only dependencies
		updatedExpl := ruleExpl
		updatedExpl.Dependencies = append(updatedExpl.Dependencies, dep)
		e.ruleExplanations[e.currentRuleID] = updatedExpl
	}

	// Build graph structure for transitive closure
	e.directGraph[dep.Source] = append(e.directGraph[dep.Source], dep.Target)
	e.reverseGraph[dep.Target] = append(e.reverseGraph[dep.Target], dep.Source)

	// Mark as needing recompilation
	e.isCompiled = false
}

// addExclusion adds an exclusion relationship
func (e *Explainer) addExclusion(excl Exclusion) {
	e.exclusions[excl.Source] = append(e.exclusions[excl.Source], excl)

	// Add to rule explanation - preserve existing fields
	if ruleExpl, exists := e.ruleExplanations[e.currentRuleID]; exists {
		// Create a copy and update only exclusions
		updatedExpl := ruleExpl
		updatedExpl.Exclusions = append(updatedExpl.Exclusions, excl)
		e.ruleExplanations[e.currentRuleID] = updatedExpl
	}

	// Build exclusion graph (bidirectional)
	e.directGraph[excl.Source] = append(e.directGraph[excl.Source], "!"+excl.Target)
	e.directGraph[excl.Target] = append(e.directGraph[excl.Target], "!"+excl.Source)

	e.isCompiled = false
}

// addImplication adds an implication relationship
func (e *Explainer) addImplication(impl Implication) {
	for _, condition := range impl.Conditions {
		e.implications[condition] = append(e.implications[condition], impl)
	}

	// Add to rule explanation - preserve existing fields
	if ruleExpl, exists := e.ruleExplanations[e.currentRuleID]; exists {
		// Create a copy and update only implications
		updatedExpl := ruleExpl
		updatedExpl.Implications = append(updatedExpl.Implications, impl)
		e.ruleExplanations[e.currentRuleID] = updatedExpl
	}
}

// ===================================================================
// COMPILATION METHODS
// ===================================================================

// Compile builds the complete dependency graph with transitive closure
func (e *Explainer) Compile() (*CompiledDependencyGraph, error) {
	if e.isCompiled && e.compiledGraph != nil {
		return e.compiledGraph, nil
	}

	startTime := time.Now()

	// Deduplicate variables in rule explanations before copying
	cleanedRuleExplanations := make(map[string]RuleExplanation)
	for ruleID, ruleExpl := range e.ruleExplanations {
		ruleExpl.Variables = e.deduplicateStrings(ruleExpl.Variables)
		cleanedRuleExplanations[ruleID] = ruleExpl
	}

	// Initialize compiled graph
	graph := &CompiledDependencyGraph{
		DirectDependencies:     e.buildDirectDependencyMap(),
		DirectExclusions:       e.buildDirectExclusionMap(),
		TransitiveDependencies: make(map[string][]string),
		TransitiveExclusions:   make(map[string][]string),
		DependencyLevels:       make(map[string]int),
		RuleExplanations:       cleanedRuleExplanations,
		DependencyExplanations: e.buildDependencyExplanationMap(),
		VariableDisplayNames:   e.variableNames,
		Variables:              e.getAllVariables(),
		Rules:                  e.getAllRules(),
		HasCycles:              false,
		CyclicDependencies:     [][]string{},
	}

	// Step 1: Detect cycles
	cycles := e.detectCycles()
	graph.HasCycles = len(cycles) > 0
	graph.CyclicDependencies = cycles

	if graph.HasCycles {
		return graph, fmt.Errorf("dependency cycles detected: %v", cycles)
	}

	// Step 2: Compute transitive closure
	graph.TransitiveDependencies = e.computeTransitiveClosure(graph.DirectDependencies)
	graph.TransitiveExclusions = e.computeTransitiveClosure(graph.DirectExclusions)

	// Step 3: Compute topological order
	graph.RuleEvaluationOrder = e.computeTopologicalOrder()
	graph.DependencyLevels = e.computeDependencyLevels(graph.TransitiveDependencies)

	// Step 4: Compile statistics
	graph.CompilationStats = e.computeCompilationStats(graph, startTime)

	e.compiledGraph = graph
	e.isCompiled = true

	return graph, nil
}

// computeTransitiveClosure uses Floyd-Warshall algorithm
func (e *Explainer) computeTransitiveClosure(directDeps map[string][]string) map[string][]string {
	// Get all variables
	variables := e.getAllVariables()

	// Initialize adjacency matrix
	adj := make(map[string]map[string]bool)
	for _, v := range variables {
		adj[v] = make(map[string]bool)
	}

	// Fill direct dependencies
	for source, targets := range directDeps {
		// Ensure source has an entry in adj
		if adj[source] == nil {
			adj[source] = make(map[string]bool)
		}
		for _, target := range targets {
			// Ensure target has an entry in adj
			if adj[target] == nil {
				adj[target] = make(map[string]bool)
			}
			adj[source][target] = true
		}
	}

	// Floyd-Warshall for transitive closure
	for _, k := range variables {
		for _, i := range variables {
			for _, j := range variables {
				if adj[i][k] && adj[k][j] {
					adj[i][j] = true
				}
			}
		}
	}

	// Convert back to map format
	transitive := make(map[string][]string)
	for source := range adj {
		var targets []string
		for target, exists := range adj[source] {
			if exists && source != target {
				targets = append(targets, target)
			}
		}
		if len(targets) > 0 {
			sort.Strings(targets)
			transitive[source] = targets
		}
	}

	return transitive
}

// computeTopologicalOrder uses Kahn's algorithm
func (e *Explainer) computeTopologicalOrder() []string {
	// Calculate in-degrees for all rules
	inDegree := make(map[string]int)
	allRules := e.getAllRules()

	// Initialize in-degrees
	for _, rule := range allRules {
		inDegree[rule] = 0
	}

	// Calculate in-degrees based on rule dependencies
	for rule := range e.ruleGraph {
		for _, dependency := range e.ruleGraph[rule] {
			inDegree[dependency]++
		}
	}

	// Kahn's algorithm
	var queue []string
	for rule, degree := range inDegree {
		if degree == 0 {
			queue = append(queue, rule)
		}
	}

	var result []string
	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]
		result = append(result, current)

		// Reduce in-degree of dependent rules
		for _, dependent := range e.ruleGraph[current] {
			inDegree[dependent]--
			if inDegree[dependent] == 0 {
				queue = append(queue, dependent)
			}
		}
	}

	return result
}

// detectCycles uses DFS to find dependency cycles
func (e *Explainer) detectCycles() [][]string {
	var cycles [][]string
	visited := make(map[string]bool)
	recStack := make(map[string]bool)

	for variable := range e.directGraph {
		if !visited[variable] {
			cycle := e.dfsDetectCycle(variable, visited, recStack, []string{})
			if len(cycle) > 0 {
				cycles = append(cycles, cycle)
			}
		}
	}

	return cycles
}

// dfsDetectCycle performs DFS cycle detection
func (e *Explainer) dfsDetectCycle(node string, visited, recStack map[string]bool, path []string) []string {
	visited[node] = true
	recStack[node] = true
	path = append(path, node)

	for _, neighbor := range e.directGraph[node] {
		// Skip exclusions in cycle detection
		if strings.HasPrefix(neighbor, "!") {
			continue
		}

		if !visited[neighbor] {
			if cycle := e.dfsDetectCycle(neighbor, visited, recStack, path); len(cycle) > 0 {
				return cycle
			}
		} else if recStack[neighbor] {
			// Found cycle - extract it
			cycleStart := -1
			for i, v := range path {
				if v == neighbor {
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
	return nil
}

// computeDependencyLevels calculates how deep each variable is in dependency tree
func (e *Explainer) computeDependencyLevels(transitiveDeps map[string][]string) map[string]int {
	levels := make(map[string]int)

	// Variables with no dependencies are level 0
	for _, variable := range e.getAllVariables() {
		if len(transitiveDeps[variable]) == 0 {
			levels[variable] = 0
		}
	}

	// Iteratively assign levels
	changed := true
	for changed {
		changed = false
		for variable, deps := range transitiveDeps {
			if _, assigned := levels[variable]; assigned {
				continue
			}

			// Check if all dependencies have levels assigned
			maxDepLevel := -1
			allAssigned := true
			for _, dep := range deps {
				if depLevel, hasLevel := levels[dep]; hasLevel {
					if depLevel > maxDepLevel {
						maxDepLevel = depLevel
					}
				} else {
					allAssigned = false
					break
				}
			}

			if allAssigned {
				levels[variable] = maxDepLevel + 1
				changed = true
			}
		}
	}

	return levels
}

// ===================================================================
// QUERY INTERFACE
// ===================================================================

// GetDependencies returns all dependencies for a given variable
func (e *Explainer) GetDependencies(variable string) []Dependency {
	return e.dependencies[variable]
}

// GetExclusions returns all exclusions for a given variable
func (e *Explainer) GetExclusions(variable string) []Exclusion {
	return e.exclusions[variable]
}

// GetRuleExplanation returns complete explanation for a rule
func (e *Explainer) GetRuleExplanation(ruleID string) (RuleExplanation, bool) {
	explanation, exists := e.ruleExplanations[ruleID]
	return explanation, exists
}

// ===================================================================
// UTILITY METHODS
// ===================================================================

// getAllVariables returns all unique variables
func (e *Explainer) getAllVariables() []string {
	varMap := make(map[string]bool)

	// Collect from dependencies
	for source := range e.dependencies {
		varMap[source] = true
		for _, dep := range e.dependencies[source] {
			varMap[dep.Target] = true
		}
	}

	// Collect from exclusions
	for source := range e.exclusions {
		varMap[source] = true
		for _, excl := range e.exclusions[source] {
			varMap[excl.Target] = true
		}
	}

	// Collect from direct graph
	for source := range e.directGraph {
		varMap[source] = true
		for _, target := range e.directGraph[source] {
			// Skip exclusion markers
			if !strings.HasPrefix(target, "!") {
				varMap[target] = true
			}
		}
	}

	// Collect from rule explanations
	for _, ruleExpl := range e.ruleExplanations {
		for _, v := range ruleExpl.Variables {
			varMap[v] = true
		}
	}

	var variables []string
	for variable := range varMap {
		if variable != "any" { // Skip special "any" source
			variables = append(variables, variable)
		}
	}

	sort.Strings(variables)
	return variables
}

// getAllRules returns all rule IDs
func (e *Explainer) getAllRules() []string {
	var rules []string
	for ruleID := range e.ruleExplanations {
		rules = append(rules, ruleID)
	}
	sort.Strings(rules)
	return rules
}

// buildDirectDependencyMap builds clean dependency map
func (e *Explainer) buildDirectDependencyMap() map[string][]string {
	result := make(map[string][]string)
	for source, deps := range e.dependencies {
		var targets []string
		for _, dep := range deps {
			targets = append(targets, dep.Target)
		}
		result[source] = e.deduplicateStrings(targets)
	}
	return result
}

// buildDirectExclusionMap builds clean exclusion map
func (e *Explainer) buildDirectExclusionMap() map[string][]string {
	result := make(map[string][]string)
	for source, excls := range e.exclusions {
		var targets []string
		for _, excl := range excls {
			targets = append(targets, excl.Target)
		}
		result[source] = e.deduplicateStrings(targets)
	}
	return result
}

// buildDependencyExplanationMap builds explanation lookup map
func (e *Explainer) buildDependencyExplanationMap() map[string]string {
	result := make(map[string]string)
	for _, deps := range e.dependencies {
		for _, dep := range deps {
			key := fmt.Sprintf("%s->%s", dep.Source, dep.Target)
			result[key] = dep.Explanation
		}
	}
	return result
}

// computeCompilationStats calculates compilation statistics
func (e *Explainer) computeCompilationStats(graph *CompiledDependencyGraph, startTime time.Time) CompilationStats {
	directDepCount := 0
	for _, deps := range graph.DirectDependencies {
		directDepCount += len(deps)
	}

	transitiveDepCount := 0
	for _, deps := range graph.TransitiveDependencies {
		transitiveDepCount += len(deps)
	}

	maxDepth := 0
	for _, level := range graph.DependencyLevels {
		if level > maxDepth {
			maxDepth = level
		}
	}

	return CompilationStats{
		TotalRules:             len(graph.Rules),
		TotalVariables:         len(graph.Variables),
		DirectDependencies:     directDepCount,
		TransitiveDependencies: transitiveDepCount,
		MaxDependencyDepth:     maxDepth,
		CompilationTimeMs:      time.Since(startTime).Milliseconds(),
		CyclesDetected:         len(graph.CyclicDependencies),
	}
}

// ===================================================================
// EXPLANATION GENERATION HELPERS
// ===================================================================

// generateDependencyExplanation creates user-friendly dependency explanations
func (e *Explainer) generateDependencyExplanation(source, target string, conditions []string) string {
	sourceName := e.getDisplayName(source)
	targetName := e.getDisplayName(target)

	if len(conditions) == 0 {
		return fmt.Sprintf("%s requires %s", sourceName, targetName)
	}

	conditionNames := make([]string, len(conditions))
	for i, condition := range conditions {
		conditionNames[i] = e.getDisplayName(condition)
	}

	return fmt.Sprintf("%s requires %s when %s", sourceName, targetName, strings.Join(conditionNames, " and "))
}

// generateImplicationExplanation creates explanations for complex implications
func (e *Explainer) generateImplicationExplanation(conditions, consequences ConditionAnalysis) string {
	return fmt.Sprintf("When %s, then %s", conditions.description, consequences.description)
}

// generateConditionDescription creates readable descriptions of conditions
func (e *Explainer) generateConditionDescription(expr parser.Expression, variables []string) string {
	if len(variables) == 1 {
		return e.getDisplayName(variables[0])
	}

	// For complex expressions, try to generate smart descriptions
	switch node := expr.(type) {
	case *parser.BinaryOperation:
		if node.Operator == parser.TOKEN_AND {
			leftVars := e.extractVariables(node.Left)
			rightVars := e.extractVariables(node.Right)
			return fmt.Sprintf("%s and %s",
				e.generateConditionDescription(node.Left, leftVars),
				e.generateConditionDescription(node.Right, rightVars))
		}
		if node.Operator == parser.TOKEN_OR {
			leftVars := e.extractVariables(node.Left)
			rightVars := e.extractVariables(node.Right)
			return fmt.Sprintf("%s or %s",
				e.generateConditionDescription(node.Left, leftVars),
				e.generateConditionDescription(node.Right, rightVars))
		}
	}

	// Fallback to variable list
	displayNames := make([]string, len(variables))
	for i, variable := range variables {
		displayNames[i] = e.getDisplayName(variable)
	}
	return strings.Join(displayNames, " and ")
}

// generateConsequenceDescription creates readable descriptions of consequences
func (e *Explainer) generateConsequenceDescription(expr parser.Expression, variables []string) string {
	return e.generateConditionDescription(expr, variables)
}

// getDisplayName gets human-readable name for variable
func (e *Explainer) getDisplayName(variable string) string {
	if displayName, exists := e.variableNames[variable]; exists {
		return displayName
	}

	// Generate display name from variable ID
	if strings.HasPrefix(variable, "opt_") {
		clean := strings.TrimPrefix(variable, "opt_")
		parts := strings.Split(clean, "_")
		for i, part := range parts {
			if len(part) > 0 {
				parts[i] = strings.ToUpper(part[:1]) + strings.ToLower(part[1:])
			}
		}
		return strings.Join(parts, " ")
	}

	// Title case for other variables
	words := strings.Split(strings.ReplaceAll(variable, "_", " "), " ")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, " ")
}

// deduplicateStrings removes duplicate strings from slice
func (e *Explainer) deduplicateStrings(slice []string) []string {
	keys := make(map[string]bool)
	var result []string

	for _, item := range slice {
		if !keys[item] {
			keys[item] = true
			result = append(result, item)
		}
	}

	return result
}

// ===================================================================
// QUERY METHODS FOR COMPILED GRAPH
// ===================================================================

// GetTransitiveDependencies returns all variables that target transitively depends on
func (cdg *CompiledDependencyGraph) GetTransitiveDependencies(target string) []string {
	if deps, exists := cdg.TransitiveDependencies[target]; exists {
		return deps
	}
	return []string{}
}

// GetDependencyPath finds path between two variables in dependency graph
func (cdg *CompiledDependencyGraph) GetDependencyPath(from, to string) *DependencyPath {
	// Use BFS to find shortest path
	queue := [][]string{{from}}
	visited := make(map[string]bool)
	visited[from] = true

	for len(queue) > 0 {
		path := queue[0]
		queue = queue[1:]
		current := path[len(path)-1]

		if current == to {
			return &DependencyPath{
				From:        from,
				To:          to,
				Path:        path,
				Length:      len(path) - 1,
				Explanation: cdg.generatePathExplanation(path),
			}
		}

		for _, neighbor := range cdg.DirectDependencies[current] {
			if !visited[neighbor] {
				visited[neighbor] = true
				newPath := make([]string, len(path)+1)
				copy(newPath, path)
				newPath[len(path)] = neighbor
				queue = append(queue, newPath)
			}
		}
	}

	return nil // No path found
}

// GetRelevantRulesForOption returns all rules that could affect given option
func (cdg *CompiledDependencyGraph) GetRelevantRulesForOption(optionID string) []string {
	var relevantRules []string

	// Find all variables that transitively affect this option
	affectingVars := []string{optionID}

	// Add all variables that transitively depend on these
	for variable := range cdg.TransitiveDependencies {
		deps := cdg.TransitiveDependencies[variable]
		for _, dep := range deps {
			if dep == optionID {
				affectingVars = append(affectingVars, variable)
				break
			}
		}
	}

	// Find rules that mention any of these variables
	for ruleID, ruleExpl := range cdg.RuleExplanations {
		for _, ruleVar := range ruleExpl.Variables {
			for _, affectingVar := range affectingVars {
				if ruleVar == affectingVar {
					relevantRules = append(relevantRules, ruleID)
					goto nextRule
				}
			}
		}
	nextRule:
	}

	return cdg.deduplicateStrings(relevantRules)
}

// ExplainUnavailabilityWithPaths generates rich explanations using dependency paths
func (cdg *CompiledDependencyGraph) ExplainUnavailabilityWithPaths(
	optionID string, currentSelections map[string]bool) []EnhancedExplanation {

	var explanations []EnhancedExplanation

	// Get all variables that transitively affect this option
	relevantRules := cdg.GetRelevantRulesForOption(optionID)

	for _, ruleID := range relevantRules {
		ruleExpl := cdg.RuleExplanations[ruleID]

		// Check if rule is currently violated
		if cdg.isRuleViolated(ruleExpl, currentSelections) {
			// Find dependency paths that explain the violation
			paths := cdg.findBlockingPaths(optionID, ruleExpl, currentSelections)

			explanation := EnhancedExplanation{
				Type:            "dependency_chain",
				Message:         cdg.generateChainExplanation(paths),
				BlockingRule:    ruleID,
				DependencyPaths: paths,
				Suggestions:     cdg.generateSuggestions(paths, currentSelections),
				Severity:        cdg.calculateSeverity(paths),
			}

			explanations = append(explanations, explanation)
		}
	}

	return explanations
}

// ===================================================================
// HELPER METHODS FOR COMPILED GRAPH
// ===================================================================

func (cdg *CompiledDependencyGraph) generatePathExplanation(path []string) string {
	if len(path) < 2 {
		return ""
	}

	var parts []string
	for i := 0; i < len(path)-1; i++ {
		source := path[i]
		target := path[i+1]

		sourceName := cdg.getDisplayName(source)
		targetName := cdg.getDisplayName(target)

		parts = append(parts, fmt.Sprintf("%s requires %s", sourceName, targetName))
	}

	return strings.Join(parts, ", which ")
}

func (cdg *CompiledDependencyGraph) getDisplayName(variable string) string {
	if displayName, exists := cdg.VariableDisplayNames[variable]; exists {
		return displayName
	}

	// Generate display name from variable ID
	if strings.HasPrefix(variable, "opt_") {
		clean := strings.TrimPrefix(variable, "opt_")
		parts := strings.Split(clean, "_")
		for i, part := range parts {
			if len(part) > 0 {
				parts[i] = strings.ToUpper(part[:1]) + strings.ToLower(part[1:])
			}
		}
		return strings.Join(parts, " ")
	}

	// Title case for other variables
	words := strings.Split(strings.ReplaceAll(variable, "_", " "), " ")
	for i, word := range words {
		if len(word) > 0 {
			words[i] = strings.ToUpper(word[:1]) + strings.ToLower(word[1:])
		}
	}
	return strings.Join(words, " ")
}

func (cdg *CompiledDependencyGraph) isRuleViolated(
	ruleExpl RuleExplanation, selections map[string]bool) bool {

	// Simple implementation - check if any dependencies are not satisfied
	for _, dep := range ruleExpl.Dependencies {
		sourceSelected := selections[dep.Source]
		targetSelected := selections[dep.Target]

		// If source is selected but target is not, rule is violated
		if sourceSelected && !targetSelected {
			return true
		}
	}

	// Check exclusions
	for _, excl := range ruleExpl.Exclusions {
		sourceSelected := selections[excl.Source]
		targetSelected := selections[excl.Target]

		// If both source and excluded target are selected, rule is violated
		if sourceSelected && targetSelected {
			return true
		}
	}

	return false
}

func (cdg *CompiledDependencyGraph) findBlockingPaths(
	optionID string, ruleExpl RuleExplanation, selections map[string]bool) []DependencyPath {

	var paths []DependencyPath

	// Find paths from selected options to the unavailable option
	for variable, selected := range selections {
		if selected {
			if path := cdg.GetDependencyPath(variable, optionID); path != nil {
				paths = append(paths, *path)
			}
		}
	}

	return paths
}

func (cdg *CompiledDependencyGraph) generateChainExplanation(paths []DependencyPath) string {
	if len(paths) == 0 {
		return "Option is unavailable due to constraint violations"
	}

	if len(paths) == 1 {
		return paths[0].Explanation
	}

	return fmt.Sprintf("Option is unavailable due to %d dependency chains", len(paths))
}

func (cdg *CompiledDependencyGraph) generateSuggestions(
	paths []DependencyPath, selections map[string]bool) []string {

	var suggestions []string

	for _, path := range paths {
		if len(path.Path) >= 2 {
			// Suggest changing the first selected item in the path
			firstSelected := path.Path[0]
			if selections[firstSelected] {
				suggestion := fmt.Sprintf("Change %s to enable this option",
					cdg.getDisplayName(firstSelected))
				suggestions = append(suggestions, suggestion)
			}
		}
	}

	return cdg.deduplicateStrings(suggestions)
}

func (cdg *CompiledDependencyGraph) calculateSeverity(paths []DependencyPath) string {
	if len(paths) == 0 {
		return "low"
	}

	if len(paths) > 2 {
		return "high"
	}

	// Check path lengths
	for _, path := range paths {
		if path.Length > 3 {
			return "high"
		}
	}

	return "medium"
}

func (cdg *CompiledDependencyGraph) deduplicateStrings(slice []string) []string {
	keys := make(map[string]bool)
	var result []string

	for _, item := range slice {
		if !keys[item] {
			keys[item] = true
			result = append(result, item)
		}
	}

	return result
}
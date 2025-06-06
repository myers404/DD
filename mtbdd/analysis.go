package mtbdd

import (
	"fmt"
)

// Evaluate evaluates an MTBDD at a given variable assignment
func (mtbdd *MTBDD) Evaluate(nodeRef NodeRef, assignment map[string]bool) interface{} {
	return mtbdd.evaluateRecursive(nodeRef, assignment)
}

func (mtbdd *MTBDD) evaluateRecursive(nodeRef NodeRef, assignment map[string]bool) interface{} {
	// Check if this is a terminal node
	if mtbdd.isTerminalInternal(nodeRef) {
		if value, exists := mtbdd.getTerminalValueInternal(nodeRef); exists {
			return value
		}
		return nil
	}

	// Get the decision node
	node, _, exists := mtbdd.GetNode(nodeRef)
	if !exists || node == nil {
		return nil
	}

	// Check the variable assignment
	variableValue, hasAssignment := assignment[node.Variable]

	if hasAssignment && variableValue {
		return mtbdd.evaluateRecursive(node.High, assignment)
	} else {
		return mtbdd.evaluateRecursive(node.Low, assignment)
	}
}

// Sat finds a satisfying assignment for the given MTBDD
func (mtbdd *MTBDD) Sat(nodeRef NodeRef) (map[string]bool, bool) {
	assignment := make(map[string]bool)
	if mtbdd.satRecursive(nodeRef, assignment) {
		return assignment, true
	}
	return nil, false
}

func (mtbdd *MTBDD) satRecursive(nodeRef NodeRef, assignment map[string]bool) bool {
	// Check if this is a terminal node
	if mtbdd.isTerminalInternal(nodeRef) {
		if value, exists := mtbdd.getTerminalValueInternal(nodeRef); exists {
			return isTruthy(value)
		}
		return false
	}

	// Get the decision node
	node, _, exists := mtbdd.GetNode(nodeRef)
	if !exists || node == nil {
		return false
	}

	// Try setting variable to true
	assignment[node.Variable] = true
	if mtbdd.satRecursive(node.High, assignment) {
		return true
	}

	// Try setting variable to false
	assignment[node.Variable] = false
	if mtbdd.satRecursive(node.Low, assignment) {
		return true
	}

	// Backtrack
	delete(assignment, node.Variable)
	return false
}

// AllSat finds all satisfying assignments for the given MTBDD
func (mtbdd *MTBDD) AllSat(nodeRef NodeRef) []map[string]bool {
	// Get the support variables for this formula
	support := mtbdd.Support(nodeRef)
	supportVars := make([]string, 0, len(support))
	for variable := range support {
		supportVars = append(supportVars, variable)
	}

	// Sort variables by level to ensure consistent ordering
	mtbdd.mu.RLock()
	for i := 0; i < len(supportVars)-1; i++ {
		for j := i + 1; j < len(supportVars); j++ {
			level1, exists1 := mtbdd.varToLevel[supportVars[i]]
			level2, exists2 := mtbdd.varToLevel[supportVars[j]]
			if exists1 && exists2 && level1 > level2 {
				supportVars[i], supportVars[j] = supportVars[j], supportVars[i]
			}
		}
	}
	mtbdd.mu.RUnlock()

	var assignments []map[string]bool
	currentAssignment := make(map[string]bool)
	mtbdd.allSatRecursiveWithSupport(nodeRef, supportVars, currentAssignment, &assignments)
	return assignments
}

func (mtbdd *MTBDD) allSatRecursiveWithSupport(nodeRef NodeRef, supportVars []string, assignment map[string]bool, assignments *[]map[string]bool) {
	// Check if this is a terminal node
	if mtbdd.isTerminalInternal(nodeRef) {
		if value, exists := mtbdd.getTerminalValueInternal(nodeRef); exists {
			if isTruthy(value) {
				// Generate all complete assignments by assigning all unassigned support variables
				unassignedVars := make([]string, 0)
				for _, variable := range supportVars {
					if _, isAssigned := assignment[variable]; !isAssigned {
						unassignedVars = append(unassignedVars, variable)
					}
				}

				// Generate all combinations for unassigned variables
				mtbdd.generateCompleteAssignments(assignment, unassignedVars, 0, assignments)
			}
		}
		return
	}

	// Get the decision node
	node, _, exists := mtbdd.GetNode(nodeRef)
	if !exists || node == nil {
		return
	}

	// Try both branches
	assignment[node.Variable] = true
	mtbdd.allSatRecursiveWithSupport(node.High, supportVars, assignment, assignments)

	assignment[node.Variable] = false
	mtbdd.allSatRecursiveWithSupport(node.Low, supportVars, assignment, assignments)

	// Backtrack
	delete(assignment, node.Variable)
}

func (mtbdd *MTBDD) generateCompleteAssignments(partialAssignment map[string]bool, unassignedVars []string, index int, assignments *[]map[string]bool) {
	if index == len(unassignedVars) {
		// All variables assigned, create complete assignment
		completeAssignment := make(map[string]bool)
		for k, v := range partialAssignment {
			completeAssignment[k] = v
		}
		*assignments = append(*assignments, completeAssignment)
		return
	}

	variable := unassignedVars[index]

	// Try both true and false for this variable
	partialAssignment[variable] = true
	mtbdd.generateCompleteAssignments(partialAssignment, unassignedVars, index+1, assignments)

	partialAssignment[variable] = false
	mtbdd.generateCompleteAssignments(partialAssignment, unassignedVars, index+1, assignments)

	// Backtrack
	delete(partialAssignment, variable)
}

// CountSat counts the number of satisfying assignments for the given MTBDD
func (mtbdd *MTBDD) CountSat(nodeRef NodeRef) int {
	// Get the support variables for this formula
	support := mtbdd.Support(nodeRef)
	supportVars := make([]string, 0, len(support))
	for variable := range support {
		supportVars = append(supportVars, variable)
	}

	// Sort variables by level to ensure consistent ordering
	mtbdd.mu.RLock()
	for i := 0; i < len(supportVars)-1; i++ {
		for j := i + 1; j < len(supportVars); j++ {
			level1, exists1 := mtbdd.varToLevel[supportVars[i]]
			level2, exists2 := mtbdd.varToLevel[supportVars[j]]
			if exists1 && exists2 && level1 > level2 {
				supportVars[i], supportVars[j] = supportVars[j], supportVars[i]
			}
		}
	}
	mtbdd.mu.RUnlock()

	memo := make(map[string]int)
	assigned := make(map[string]bool)
	return mtbdd.countSatRecursiveWithSupport(nodeRef, supportVars, assigned, memo)
}

func (mtbdd *MTBDD) countSatRecursiveWithSupport(nodeRef NodeRef, supportVars []string, assigned map[string]bool, memo map[string]int) int {
	// Create cache key based on node and assigned variables
	cacheKey := mtbdd.createCountSatCacheKey(nodeRef, assigned)
	if count, exists := memo[cacheKey]; exists {
		return count
	}

	var result int

	// Check if this is a terminal node
	if mtbdd.isTerminalInternal(nodeRef) {
		if value, exists := mtbdd.getTerminalValueInternal(nodeRef); exists {
			if isTruthy(value) {
				// Count unassigned variables in support
				unassignedCount := 0
				for _, variable := range supportVars {
					if _, isAssigned := assigned[variable]; !isAssigned {
						unassignedCount++
					}
				}
				// Each unassigned variable can take 2 values (true/false)
				// So total assignments = 2^unassignedCount
				result = 1 << unassignedCount // 2^unassignedCount
			} else {
				result = 0
			}
		} else {
			result = 0
		}
	} else {
		node, _, exists := mtbdd.GetNode(nodeRef)
		if !exists || node == nil {
			result = 0
		} else {
			// Mark this variable as assigned and recurse
			assigned[node.Variable] = false
			lowCount := mtbdd.countSatRecursiveWithSupport(node.Low, supportVars, assigned, memo)

			assigned[node.Variable] = true
			highCount := mtbdd.countSatRecursiveWithSupport(node.High, supportVars, assigned, memo)

			// Remove from assigned map to backtrack
			delete(assigned, node.Variable)

			result = lowCount + highCount
		}
	}

	memo[cacheKey] = result
	return result
}

func (mtbdd *MTBDD) createCountSatCacheKey(nodeRef NodeRef, assigned map[string]bool) string {
	key := fmt.Sprintf("node:%d", nodeRef)

	// Add assigned variables in sorted order for consistent caching
	variables := make([]string, 0, len(assigned))
	for variable := range assigned {
		variables = append(variables, variable)
	}

	// Simple sort
	for i := 0; i < len(variables)-1; i++ {
		for j := i + 1; j < len(variables); j++ {
			if variables[i] > variables[j] {
				variables[i], variables[j] = variables[j], variables[i]
			}
		}
	}

	for _, variable := range variables {
		if assigned[variable] {
			key += fmt.Sprintf(":%s=T", variable)
		} else {
			key += fmt.Sprintf(":%s=F", variable)
		}
	}

	return key
}

// Support computes the support variables of an MTBDD
func (mtbdd *MTBDD) Support(nodeRef NodeRef) map[string]struct{} {
	support := make(map[string]struct{})
	visited := make(map[NodeRef]bool)
	mtbdd.supportRecursive(nodeRef, support, visited)
	return support
}

func (mtbdd *MTBDD) supportRecursive(nodeRef NodeRef, support map[string]struct{}, visited map[NodeRef]bool) {
	if visited[nodeRef] {
		return
	}
	visited[nodeRef] = true

	// Check if this is a terminal node
	if mtbdd.isTerminalInternal(nodeRef) {
		return
	}

	// Get the decision node
	node, _, exists := mtbdd.GetNode(nodeRef)
	if !exists || node == nil {
		return
	}

	// Add variable to support
	support[node.Variable] = struct{}{}

	// Recurse on children
	mtbdd.supportRecursive(node.Low, support, visited)
	mtbdd.supportRecursive(node.High, support, visited)
}

// LinearFunction creates an MTBDD representing a linear function
func (mtbdd *MTBDD) LinearFunction(coefficients map[string]interface{}, constant interface{}) NodeRef {
	constantValue, err := mtbdd.ConvertToNumeric(constant)
	if err != nil {
		constantValue = 0
	}

	if len(coefficients) == 0 {
		return mtbdd.Constant(constantValue)
	}

	return mtbdd.buildLinearRecursive(coefficients, constantValue, getSortedVariableNames(coefficients))
}

func (mtbdd *MTBDD) buildLinearRecursive(coefficients map[string]interface{}, baseValue interface{}, variables []string) NodeRef {
	if len(variables) == 0 {
		return mtbdd.Constant(baseValue)
	}

	variable := variables[0]
	remainingVars := variables[1:]

	// Validate variable name
	if !IsValidVariableName(variable) {
		return mtbdd.buildLinearRecursive(coefficients, baseValue, remainingVars)
	}

	// Ensure variable is declared
	if !mtbdd.HasVariable(variable) {
		mtbdd.Declare(variable)
	}

	// Get coefficient for this variable
	coeff, exists := coefficients[variable]
	if !exists {
		return mtbdd.buildLinearRecursive(coefficients, baseValue, remainingVars)
	}

	coeffValue, err := mtbdd.ConvertToNumeric(coeff)
	if err != nil {
		return mtbdd.buildLinearRecursive(coefficients, baseValue, remainingVars)
	}

	// Build low branch (variable = false)
	lowBranch := mtbdd.buildLinearRecursive(coefficients, baseValue, remainingVars)

	// Build high branch (variable = true)
	highValue := mtbdd.addValues(baseValue, coeffValue)
	highBranch := mtbdd.buildLinearRecursive(coefficients, highValue, remainingVars)

	// Get variable node
	varNode, err := mtbdd.Var(variable)
	if err != nil {
		return lowBranch
	}

	return mtbdd.ITECore(varNode, highBranch, lowBranch)
}

// CountingSolution creates an MTBDD that counts the number of true variables
func (mtbdd *MTBDD) CountingSolution(variables []string) NodeRef {
	if len(variables) == 0 {
		return mtbdd.Constant(0)
	}

	// Filter and validate variables
	validVars := make([]string, 0, len(variables))
	for _, variable := range variables {
		if IsValidVariableName(variable) {
			if !mtbdd.HasVariable(variable) {
				mtbdd.Declare(variable)
			}
			validVars = append(validVars, variable)
		}
	}

	return mtbdd.buildCountingRecursive(validVars, 0)
}

func (mtbdd *MTBDD) buildCountingRecursive(variables []string, currentCount int) NodeRef {
	if len(variables) == 0 {
		return mtbdd.Constant(currentCount)
	}

	variable := variables[0]
	remainingVars := variables[1:]

	// Build low branch (variable = false, count unchanged)
	lowBranch := mtbdd.buildCountingRecursive(remainingVars, currentCount)

	// Build high branch (variable = true, count incremented)
	highBranch := mtbdd.buildCountingRecursive(remainingVars, currentCount+1)

	// Get variable node
	varNode, err := mtbdd.Var(variable)
	if err != nil {
		return lowBranch
	}

	return mtbdd.ITECore(varNode, highBranch, lowBranch)
}

// WeightedFormula creates an MTBDD representing a weighted sum of variables
func (mtbdd *MTBDD) WeightedFormula(variables []string, weights map[string]interface{}, defaultWeight interface{}) NodeRef {
	if len(variables) == 0 {
		return mtbdd.Constant(0)
	}

	defaultValue, err := mtbdd.ConvertToNumeric(defaultWeight)
	if err != nil {
		defaultValue = 0
	}

	// Create coefficient map with defaults
	coefficients := make(map[string]interface{})
	for _, variable := range variables {
		if weight, exists := weights[variable]; exists {
			coefficients[variable] = weight
		} else {
			coefficients[variable] = defaultValue
		}
	}

	return mtbdd.LinearFunction(coefficients, 0)
}

// Helper functions

func getSortedVariableNames(coefficients map[string]interface{}) []string {
	variables := make([]string, 0, len(coefficients))
	for variable := range coefficients {
		if IsValidVariableName(variable) {
			variables = append(variables, variable)
		}
	}

	// Simple bubble sort
	for i := 0; i < len(variables)-1; i++ {
		for j := i + 1; j < len(variables); j++ {
			if variables[i] > variables[j] {
				variables[i], variables[j] = variables[j], variables[i]
			}
		}
	}

	return variables
}

func (mtbdd *MTBDD) addValues(left, right interface{}) interface{} {
	leftNum, leftErr := mtbdd.ConvertToNumeric(left)
	rightNum, rightErr := mtbdd.ConvertToNumeric(right)

	if leftErr != nil || rightErr != nil {
		return 0
	}

	// Try to preserve integer types when possible
	leftInt, leftIsInt := leftNum.(int)
	rightInt, rightIsInt := rightNum.(int)

	if leftIsInt && rightIsInt {
		return leftInt + rightInt
	} else {
		// Convert to float64 for mixed arithmetic
		leftFloat, _ := ConvertToFloat64(leftNum)
		rightFloat, _ := ConvertToFloat64(rightNum)
		return leftFloat + rightFloat
	}
}

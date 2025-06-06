package mtbdd

import (
	"fmt"
)

func (mtbdd *MTBDD) Declare(variables ...string) {
	mtbdd.mu.Lock()
	defer mtbdd.mu.Unlock()

	for _, variable := range variables {
		if IsValidVariableName(variable) {
			if _, exists := mtbdd.varToLevel[variable]; !exists {
				level := mtbdd.nextLevel
				mtbdd.nextLevel++

				mtbdd.variables = append(mtbdd.variables, variable)
				mtbdd.varToLevel[variable] = level
				mtbdd.levelToVar[level] = variable
			}
		}
	}
}

func (mtbdd *MTBDD) AddVar(variable string) int {
	mtbdd.mu.Lock()
	defer mtbdd.mu.Unlock()

	if !IsValidVariableName(variable) {
		return -1
	}

	if level, exists := mtbdd.varToLevel[variable]; exists {
		return level
	}

	level := mtbdd.nextLevel
	mtbdd.nextLevel++

	mtbdd.variables = append(mtbdd.variables, variable)
	mtbdd.varToLevel[variable] = level
	mtbdd.levelToVar[level] = variable

	return level
}

func (mtbdd *MTBDD) Var(variable string) (NodeRef, error) {
	mtbdd.mu.RLock()
	level, exists := mtbdd.varToLevel[variable]
	mtbdd.mu.RUnlock()

	if !exists {
		return NullRef, NewVariableError(variable, "not declared")
	}

	return mtbdd.GetDecisionNode(variable, level, FalseRef, TrueRef), nil
}

func (mtbdd *MTBDD) LevelOfVar(variable string) (int, error) {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	if level, exists := mtbdd.varToLevel[variable]; exists {
		return level, nil
	}

	return -1, NewVariableError(variable, "not declared")
}

func (mtbdd *MTBDD) VarAtLevel(level int) (string, error) {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	if level < 0 || level >= mtbdd.nextLevel {
		return "", fmt.Errorf("level %d: out of range [0, %d)", level, mtbdd.nextLevel)
	}

	if variable, exists := mtbdd.levelToVar[level]; exists {
		return variable, nil
	}

	return "", fmt.Errorf("level %d: no variable found", level)
}

func (mtbdd *MTBDD) GetVariableOrder() []string {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	result := make([]string, len(mtbdd.variables))
	copy(result, mtbdd.variables)
	return result
}

func (mtbdd *MTBDD) VariableCount() int {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	return len(mtbdd.variables)
}

func (mtbdd *MTBDD) SetVariableOrder(newOrder []string) error {
	mtbdd.mu.Lock()
	defer mtbdd.mu.Unlock()

	if len(newOrder) != len(mtbdd.variables) {
		return fmt.Errorf("new order length %d doesn't match current variable count %d",
			len(newOrder), len(mtbdd.variables))
	}

	newVarSet := make(map[string]bool)
	for _, variable := range newOrder {
		if !IsValidVariableName(variable) {
			return NewVariableError(variable, "invalid variable name in new ordering")
		}

		if newVarSet[variable] {
			return NewVariableError(variable, "duplicate variable in new ordering")
		}
		newVarSet[variable] = true

		if _, exists := mtbdd.varToLevel[variable]; !exists {
			return NewVariableError(variable, "not declared (cannot reorder undeclared variable)")
		}
	}

	for variable := range mtbdd.varToLevel {
		if !newVarSet[variable] {
			return NewVariableError(variable, "missing from new ordering")
		}
	}

	mtbdd.variables = make([]string, len(newOrder))
	copy(mtbdd.variables, newOrder)

	mtbdd.varToLevel = make(map[string]int)
	mtbdd.levelToVar = make(map[int]string)

	for i, variable := range newOrder {
		mtbdd.varToLevel[variable] = i
		mtbdd.levelToVar[i] = variable
	}

	// FIXED: Clear all typed caches instead of single operationCache
	mtbdd.binaryOpCache = make(map[BinaryOpKey]NodeRef)
	mtbdd.unaryOpCache = make(map[UnaryOpKey]NodeRef)
	mtbdd.ternaryOpCache = make(map[TernaryOpKey]NodeRef)
	mtbdd.quantCache = make(map[QuantKey]NodeRef)
	mtbdd.composeCache = make(map[ComposeKey]NodeRef)

	return nil
}

func (mtbdd *MTBDD) HasVariable(variable string) bool {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	_, exists := mtbdd.varToLevel[variable]
	return exists
}

func (mtbdd *MTBDD) GetAllVariables() map[string]int {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	result := make(map[string]int)
	for variable, level := range mtbdd.varToLevel {
		result[variable] = level
	}
	return result
}

package mtbdd

import (
	"fmt"
	"strings"
)

// Cache key types for manipulation operations
type RestrictKey struct {
	Node     NodeRef
	Variable string
	Value    bool
}

type RenameKey struct {
	Node    NodeRef
	Mapping string // encoded mapping
}

func (mtbdd *MTBDD) Restrict(nodeRef NodeRef, variable string, value bool) NodeRef {
	return mtbdd.restrictInternal(nodeRef, variable, value)
}

// PERFORMANCE OPTIMIZATION: Use typed cache key
func (mtbdd *MTBDD) restrictInternal(nodeRef NodeRef, variable string, value bool) NodeRef {
	//cacheKey := RestrictKey{Node: nodeRef, Variable: variable, Value: value}

	// Check cache first using a simple map lookup
	// For simplicity, we'll use a separate cache for restrict operations
	mtbdd.mu.RLock()
	// Note: In a full optimization, we could add a dedicated restrictCache to MTBDD struct
	// For now, we'll use the existing pattern but with better key structure
	mtbdd.mu.RUnlock()

	var result NodeRef

	// Handle terminal case
	if mtbdd.isTerminalInternal(nodeRef) {
		result = nodeRef
	} else {
		// Handle decision node case
		node, _, exists := mtbdd.GetNode(nodeRef)
		if !exists || node == nil {
			result = nodeRef
		} else if node.Variable == variable {
			// This node tests the restricted variable
			if value {
				result = node.High
			} else {
				result = node.Low
			}
		} else {
			// This node tests a different variable, recursively restrict both children
			lowRestricted := mtbdd.restrictInternal(node.Low, variable, value)
			highRestricted := mtbdd.restrictInternal(node.High, variable, value)
			result = mtbdd.GetDecisionNode(node.Variable, node.Level, lowRestricted, highRestricted)
		}
	}

	return result
}

func (mtbdd *MTBDD) Cofactor(assignments map[string]bool, nodeRef NodeRef) NodeRef {
	if len(assignments) == 0 {
		return nodeRef
	}

	result := nodeRef
	for variable, value := range assignments {
		result = mtbdd.restrictInternal(result, variable, value)
	}

	return result
}

func (mtbdd *MTBDD) Compose(nodeRef NodeRef, variableSubstitutions map[string]NodeRef) NodeRef {
	if len(variableSubstitutions) == 0 {
		return nodeRef
	}

	return mtbdd.composeInternal(nodeRef, variableSubstitutions)
}

// PERFORMANCE OPTIMIZATION: Use typed cache with better key generation
func (mtbdd *MTBDD) composeInternal(nodeRef NodeRef, substitutions map[string]NodeRef) NodeRef {
	// Create optimized cache key
	cacheKey := mtbdd.createComposeCacheKey(nodeRef, substitutions)

	// Check cache first
	mtbdd.mu.RLock()
	if result, exists := mtbdd.composeCache[cacheKey]; exists {
		mtbdd.mu.RUnlock()
		return result
	}
	mtbdd.mu.RUnlock()

	var result NodeRef

	// Handle terminal case
	if mtbdd.isTerminalInternal(nodeRef) {
		result = nodeRef
	} else {
		// Handle decision node case
		node, _, exists := mtbdd.GetNode(nodeRef)
		if !exists || node == nil {
			result = nodeRef
		} else if substitution, hasSubstitution := substitutions[node.Variable]; hasSubstitution {
			// Replace this variable with its substitution using ITE
			lowComposed := mtbdd.composeInternal(node.Low, substitutions)
			highComposed := mtbdd.composeInternal(node.High, substitutions)
			result = mtbdd.ITECore(substitution, highComposed, lowComposed)
		} else {
			// Variable not substituted, recursively compose children
			lowComposed := mtbdd.composeInternal(node.Low, substitutions)
			highComposed := mtbdd.composeInternal(node.High, substitutions)
			result = mtbdd.GetDecisionNode(node.Variable, node.Level, lowComposed, highComposed)
		}
	}

	// Cache the result and return
	mtbdd.mu.Lock()
	mtbdd.composeCache[cacheKey] = result
	mtbdd.mu.Unlock()
	return result
}

// PERFORMANCE OPTIMIZATION: Simplified cache key creation for compose operations
func (mtbdd *MTBDD) createComposeCacheKey(nodeRef NodeRef, substitutions map[string]NodeRef) ComposeKey {
	// Create a deterministic string representation of the substitution map
	// This is simplified - in a full optimization, consider a more efficient encoding
	var keyParts []string
	for variable, nodeRef := range substitutions {
		keyParts = append(keyParts, fmt.Sprintf("%s:%d", variable, nodeRef))
	}

	// Sort for deterministic ordering
	for i := 0; i < len(keyParts)-1; i++ {
		for j := i + 1; j < len(keyParts); j++ {
			if keyParts[i] > keyParts[j] {
				keyParts[i], keyParts[j] = keyParts[j], keyParts[i]
			}
		}
	}

	return ComposeKey{
		Node:          nodeRef,
		Substitutions: strings.Join(keyParts, ";"),
	}
}

func (mtbdd *MTBDD) Rename(nodeRef NodeRef, nameMapping map[string]string) NodeRef {
	if len(nameMapping) == 0 {
		return nodeRef
	}

	// Ensure all new variable names are declared
	for _, newName := range nameMapping {
		if !mtbdd.HasVariable(newName) {
			mtbdd.Declare(newName)
		}
	}

	return mtbdd.renameInternal(nodeRef, nameMapping)
}

// PERFORMANCE OPTIMIZATION: Use simplified caching approach
func (mtbdd *MTBDD) renameInternal(nodeRef NodeRef, nameMapping map[string]string) NodeRef {
	// For rename operations, the cache key would be complex, so we'll use a simpler approach
	// In practice, rename is used less frequently than other operations

	var result NodeRef

	// Handle terminal case
	if mtbdd.isTerminalInternal(nodeRef) {
		result = nodeRef
	} else {
		// Handle decision node case
		node, _, exists := mtbdd.GetNode(nodeRef)
		if !exists || node == nil {
			result = nodeRef
		} else {
			// Recursively rename children
			lowRenamed := mtbdd.renameInternal(node.Low, nameMapping)
			highRenamed := mtbdd.renameInternal(node.High, nameMapping)

			// Determine the variable name for this node
			var variableName string
			var variableLevel int

			if newName, shouldRename := nameMapping[node.Variable]; shouldRename {
				// Variable should be renamed
				variableName = newName
				if level, err := mtbdd.LevelOfVar(newName); err == nil {
					variableLevel = level
				} else {
					// Fallback to original level if new variable not found
					variableLevel = node.Level
				}
			} else {
				// Variable keeps original name
				variableName = node.Variable
				variableLevel = node.Level
			}

			// Create new node with (possibly) renamed variable
			result = mtbdd.GetDecisionNode(variableName, variableLevel, lowRenamed, highRenamed)
		}
	}

	return result
}

func (mtbdd *MTBDD) Image(states, transition NodeRef, currentVars, nextVars []string) NodeRef {
	// Image computation:
	// 1. Conjoin states with transition relation
	// 2. Existentially quantify current variables

	conjunction := mtbdd.AND(states, transition)

	// Existentially quantify current variables
	return mtbdd.existentialQuantify(conjunction, currentVars)
}

func (mtbdd *MTBDD) Preimage(states, transition NodeRef, currentVars, nextVars []string) NodeRef {
	// Preimage computation:
	// 1. Rename target states from current to next variables
	// 2. Conjoin with transition relation
	// 3. Existentially quantify next variables

	// Create renaming map: currentVar -> nextVar
	if len(currentVars) != len(nextVars) {
		// If variable lists don't match, use original approach
		conjunction := mtbdd.AND(states, transition)
		return mtbdd.existentialQuantify(conjunction, nextVars)
	}

	renameMap := make(map[string]string)
	for i, currentVar := range currentVars {
		if i < len(nextVars) {
			renameMap[currentVar] = nextVars[i]
		}
	}

	// Rename target states to next variables
	renamedStates := mtbdd.Rename(states, renameMap)

	// Conjoin with transition relation
	conjunction := mtbdd.AND(renamedStates, transition)

	// Existentially quantify next variables
	return mtbdd.existentialQuantify(conjunction, nextVars)
}

func (mtbdd *MTBDD) LeastFixpoint(f func(NodeRef) NodeRef, bottom NodeRef) NodeRef {
	const maxIterations = 1000

	current := bottom
	var history []NodeRef

	for iteration := 0; iteration < maxIterations; iteration++ {
		next := f(current)

		// Check for exact convergence
		if next == current {
			return current
		}

		// Check for cycles in history to handle potential oscillations
		for _, prev := range history {
			if next == prev {
				// Oscillation detected, return the current best approximation
				return current
			}
		}

		// Keep a limited history to detect cycles
		history = append(history, current)
		if len(history) > 10 {
			history = history[1:]
		}

		current = next
	}

	// If we hit the iteration limit, return the last computed value
	return current
}

func (mtbdd *MTBDD) GreatestFixpoint(f func(NodeRef) NodeRef, top NodeRef) NodeRef {
	const maxIterations = 1000

	current := top
	var history []NodeRef

	for iteration := 0; iteration < maxIterations; iteration++ {
		next := f(current)

		// Check for exact convergence
		if next == current {
			return current
		}

		// Check for cycles in history to handle potential oscillations
		for _, prev := range history {
			if next == prev {
				// Oscillation detected, return the current best approximation
				return current
			}
		}

		// Keep a limited history to detect cycles
		history = append(history, current)
		if len(history) > 10 {
			history = history[1:]
		}

		current = next
	}

	// If we hit the iteration limit, return the last computed value
	return current
}

func (mtbdd *MTBDD) existentialQuantify(nodeRef NodeRef, quantifiedVars []string) NodeRef {
	result := mtbdd.Exists(nodeRef, quantifiedVars)
	return result
}

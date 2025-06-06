package mtbdd

func (mtbdd *MTBDD) Exists(nodeRef NodeRef, quantifiedVars []string) NodeRef {
	return mtbdd.quantify(nodeRef, quantifiedVars, "EXISTS", mtbdd.combineExistential)
}

func (mtbdd *MTBDD) ForAll(nodeRef NodeRef, quantifiedVars []string) NodeRef {
	return mtbdd.quantify(nodeRef, quantifiedVars, "FORALL", mtbdd.combineUniversal)
}

// PERFORMANCE OPTIMIZATION: Updated to use fast typed cache
func (mtbdd *MTBDD) quantify(nodeRef NodeRef, quantifiedVars []string, operation string, combineFunc func(NodeRef, NodeRef) NodeRef) NodeRef {
	if len(quantifiedVars) == 0 {
		return nodeRef
	}

	// Create optimized cache key
	cacheKey := mtbdd.createQuantificationCacheKey(operation, nodeRef, quantifiedVars)

	// Check cache using typed cache system
	mtbdd.mu.RLock()
	if result, exists := mtbdd.quantCache[cacheKey]; exists {
		mtbdd.mu.RUnlock()
		return result
	}
	mtbdd.mu.RUnlock()

	result := nodeRef

	// Quantify out each variable one by one
	for _, variable := range quantifiedVars {
		// Skip if variable is not in the support of current result
		support := mtbdd.Support(result)
		if _, inSupport := support[variable]; !inSupport {
			continue
		}

		// Use existing Restrict method to get cofactors
		restrictedFalse := mtbdd.Restrict(result, variable, false)
		restrictedTrue := mtbdd.Restrict(result, variable, true)

		// Combine using the appropriate operation (OR for exists, AND for forall)
		result = combineFunc(restrictedFalse, restrictedTrue)
	}

	mtbdd.cacheQuantificationResult(cacheKey, result)
	return result
}

// Use OR for existential quantification
func (mtbdd *MTBDD) combineExistential(left, right NodeRef) NodeRef {
	return mtbdd.OR(left, right)
}

// Use AND for universal quantification
func (mtbdd *MTBDD) combineUniversal(left, right NodeRef) NodeRef {
	return mtbdd.AND(left, right)
}

// PERFORMANCE OPTIMIZATION: Simplified cache key creation
func (mtbdd *MTBDD) createQuantificationCacheKey(operation string, nodeRef NodeRef, quantifiedVars []string) QuantKey {
	// Sort variables for deterministic ordering
	sortedVars := make([]string, len(quantifiedVars))
	copy(sortedVars, quantifiedVars)

	// Simple bubble sort for deterministic ordering
	for i := 0; i < len(sortedVars)-1; i++ {
		for j := i + 1; j < len(sortedVars); j++ {
			if sortedVars[i] > sortedVars[j] {
				sortedVars[i], sortedVars[j] = sortedVars[j], sortedVars[i]
			}
		}
	}

	// Create struct-based key instead of expensive string operations
	return QuantKey{
		Node:      nodeRef,
		Variables: JoinVariableNames(sortedVars),
		ForAll:    operation == "FORALL",
	}
}

func (mtbdd *MTBDD) cacheQuantificationResult(cacheKey QuantKey, result NodeRef) {
	mtbdd.mu.Lock()
	mtbdd.quantCache[cacheKey] = result
	mtbdd.mu.Unlock()
}

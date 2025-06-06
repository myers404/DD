package mtbdd

func (mtbdd *MTBDD) Constant(value interface{}) NodeRef {
	return mtbdd.GetTerminal(value)
}

func (mtbdd *MTBDD) GetTerminalValue(nodeRef NodeRef) (interface{}, bool) {
	// Delegate to internal method
	return mtbdd.getTerminalValueInternal(nodeRef)
}

func (mtbdd *MTBDD) IsTerminal(nodeRef NodeRef) bool {
	// Delegate to internal method
	return mtbdd.isTerminalInternal(nodeRef)
}

func (mtbdd *MTBDD) CollectTerminals(nodeRef NodeRef) []interface{} {
	visited := make(map[NodeRef]bool)
	terminalValues := make(map[interface{}]bool)

	var collect func(NodeRef)
	collect = func(ref NodeRef) {
		if visited[ref] {
			return
		}
		visited[ref] = true

		mtbdd.mu.RLock()
		if terminal, exists := mtbdd.terminals[ref]; exists {
			mtbdd.mu.RUnlock()
			terminalValues[terminal.Value] = true
			return
		}

		if node, exists := mtbdd.nodes[ref]; exists {
			mtbdd.mu.RUnlock()
			collect(node.Low)
			collect(node.High)
		} else {
			mtbdd.mu.RUnlock()
		}
	}

	collect(nodeRef)

	result := make([]interface{}, 0, len(terminalValues))
	for value := range terminalValues {
		result = append(result, value)
	}

	return result
}

func (mtbdd *MTBDD) NodeCount(nodeRef NodeRef) int {
	visited := make(map[NodeRef]bool)

	var count func(NodeRef) int
	count = func(ref NodeRef) int {
		if visited[ref] {
			return 0
		}

		mtbdd.mu.RLock()
		_, terminalExists := mtbdd.terminals[ref]
		node, decisionExists := mtbdd.nodes[ref]
		mtbdd.mu.RUnlock()

		if !terminalExists && !decisionExists {
			return 0
		}

		visited[ref] = true
		nodeCount := 1

		if decisionExists {
			nodeCount += count(node.Low)
			nodeCount += count(node.High)
		}

		return nodeCount
	}

	return count(nodeRef)
}

func (mtbdd *MTBDD) IsBooleanFunction(nodeRef NodeRef) bool {
	visited := make(map[NodeRef]bool)

	var check func(NodeRef) bool
	check = func(ref NodeRef) bool {
		if visited[ref] {
			return true
		}
		visited[ref] = true

		mtbdd.mu.RLock()
		if terminal, exists := mtbdd.terminals[ref]; exists {
			mtbdd.mu.RUnlock()
			_, isBool := terminal.Value.(bool)
			return isBool
		}

		if node, exists := mtbdd.nodes[ref]; exists {
			mtbdd.mu.RUnlock()
			return check(node.Low) && check(node.High)
		} else {
			mtbdd.mu.RUnlock()
			return false
		}
	}

	return check(nodeRef)
}

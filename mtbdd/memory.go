package mtbdd

import (
	"fmt"
	"sort"
	"strings"
)

type MemoryStats struct {
	TotalNodes       int
	DecisionNodes    int
	TerminalNodes    int
	CacheSize        int
	BinaryCacheSize  int
	UnaryCacheSize   int
	TernaryCacheSize int
	QuantCacheSize   int
	ComposeCacheSize int
	UniqueNodes      int
	VariableCount    int
	CacheHitRatio    float64
	NextNodeRef      int
	MaxLevel         int
}

func (mtbdd *MTBDD) ClearCaches() {
	mtbdd.ClearOperationCache()
}

func (mtbdd *MTBDD) GarbageCollect(rootNodes []NodeRef) {
	mtbdd.garbageCollectInternal(rootNodes)
}

// PERFORMANCE OPTIMIZATION: Updated to include detailed cache statistics
func (mtbdd *MTBDD) GetMemoryStats() MemoryStats {
	coreStats := mtbdd.GetCoreStats()

	varCount := mtbdd.VariableCount()

	var maxLevel int
	if varCount > 0 {
		maxLevel = varCount - 1
	}

	mtbdd.mu.RLock()
	nextRef := int(mtbdd.nextRef)
	binaryCacheSize := len(mtbdd.binaryOpCache)
	unaryCacheSize := len(mtbdd.unaryOpCache)
	ternaryCacheSize := len(mtbdd.ternaryOpCache)
	quantCacheSize := len(mtbdd.quantCache)
	composeCacheSize := len(mtbdd.composeCache)
	mtbdd.mu.RUnlock()

	totalCacheSize := binaryCacheSize + unaryCacheSize + ternaryCacheSize + quantCacheSize + composeCacheSize

	return MemoryStats{
		TotalNodes:       coreStats.NodeCount,
		DecisionNodes:    coreStats.DecisionNodes,
		TerminalNodes:    coreStats.TerminalNodes,
		CacheSize:        totalCacheSize,
		BinaryCacheSize:  binaryCacheSize,
		UnaryCacheSize:   unaryCacheSize,
		TernaryCacheSize: ternaryCacheSize,
		QuantCacheSize:   quantCacheSize,
		ComposeCacheSize: composeCacheSize,
		UniqueNodes:      coreStats.UniqueNodes,
		VariableCount:    varCount,
		NextNodeRef:      nextRef,
		MaxLevel:         maxLevel,
		CacheHitRatio:    0.0,
	}
}

func (mtbdd *MTBDD) PrintStats() {
	stats := mtbdd.GetMemoryStats()

	fmt.Println("=== MTBDD Memory Statistics (Optimized) ===")
	fmt.Printf("Nodes:          %d total (%d decision, %d terminal)\n",
		stats.TotalNodes, stats.DecisionNodes, stats.TerminalNodes)
	fmt.Printf("Cache:          %d total operation results cached\n", stats.CacheSize)
	fmt.Printf("  Binary ops:   %d\n", stats.BinaryCacheSize)
	fmt.Printf("  Unary ops:    %d\n", stats.UnaryCacheSize)
	fmt.Printf("  Ternary ops:  %d\n", stats.TernaryCacheSize)
	fmt.Printf("  Quantify:     %d\n", stats.QuantCacheSize)
	fmt.Printf("  Compose:      %d\n", stats.ComposeCacheSize)
	fmt.Printf("Unique table:   %d entries\n", stats.UniqueNodes)
	fmt.Printf("Variables:      %d declared (max level %d)\n",
		stats.VariableCount, stats.MaxLevel)
	fmt.Printf("Next node ref:  %d\n", stats.NextNodeRef)

	if stats.TotalNodes > 0 {
		terminalRatio := float64(stats.TerminalNodes) / float64(stats.TotalNodes) * 100
		fmt.Printf("Terminal ratio: %.1f%%\n", terminalRatio)
	}

	if stats.UniqueNodes > 0 && stats.TotalNodes > 0 {
		sharingRatio := float64(stats.TotalNodes) / float64(stats.UniqueNodes) * 100
		fmt.Printf("Sharing ratio:  %.1f%% (%.1fx compression)\n",
			sharingRatio, float64(stats.UniqueNodes)/float64(stats.TotalNodes))
	}

	if stats.CacheSize > 0 {
		fmt.Printf("Cache density:  %.2f entries per node\n",
			float64(stats.CacheSize)/float64(stats.TotalNodes))
	}

	fmt.Println("==============================================")
}

func (mtbdd *MTBDD) Dump() string {
	var builder strings.Builder

	builder.WriteString("=== MTBDD Structure Dump (Optimized) ===\n\n")

	stats := mtbdd.GetMemoryStats()
	builder.WriteString(fmt.Sprintf("Statistics: %d total nodes (%d decision, %d terminal)\n",
		stats.TotalNodes, stats.DecisionNodes, stats.TerminalNodes))
	builder.WriteString(fmt.Sprintf("Cache: %d entries (%d binary, %d unary, %d ternary, %d quant, %d compose), Variables: %d\n\n",
		stats.CacheSize, stats.BinaryCacheSize, stats.UnaryCacheSize,
		stats.TernaryCacheSize, stats.QuantCacheSize, stats.ComposeCacheSize, stats.VariableCount))

	builder.WriteString("Variables:\n")
	mtbdd.mu.RLock()
	if len(mtbdd.variables) == 0 {
		builder.WriteString("  (none declared)\n")
	} else {
		for level, variable := range mtbdd.variables {
			builder.WriteString(fmt.Sprintf("  Level %d: %s\n", level, variable))
		}
	}
	builder.WriteString("\n")

	builder.WriteString("Terminals:\n")
	terminalRefs := make([]NodeRef, 0, len(mtbdd.terminals))
	for ref := range mtbdd.terminals {
		terminalRefs = append(terminalRefs, ref)
	}
	sort.Slice(terminalRefs, func(i, j int) bool {
		return terminalRefs[i] < terminalRefs[j]
	})

	for _, ref := range terminalRefs {
		terminal := mtbdd.terminals[ref]
		builder.WriteString(fmt.Sprintf("  @%d: %s\n", ref, FormatValue(terminal.Value)))
	}
	builder.WriteString("\n")

	builder.WriteString("Nodes:\n")
	if len(mtbdd.nodes) == 0 {
		builder.WriteString("  (no decision nodes)\n")
	} else {
		nodeRefs := make([]NodeRef, 0, len(mtbdd.nodes))
		for ref := range mtbdd.nodes {
			nodeRefs = append(nodeRefs, ref)
		}
		sort.Slice(nodeRefs, func(i, j int) bool {
			return nodeRefs[i] < nodeRefs[j]
		})

		for _, ref := range nodeRefs {
			node := mtbdd.nodes[ref]
			builder.WriteString(fmt.Sprintf("  @%d: var=%s[%d] low=@%d high=@%d\n",
				ref, node.Variable, node.Level, node.Low, node.High))
		}
	}
	builder.WriteString("\n")

	builder.WriteString("Cache Statistics:\n")
	builder.WriteString(fmt.Sprintf("  Binary operations: %d entries\n", stats.BinaryCacheSize))
	builder.WriteString(fmt.Sprintf("  Unary operations:  %d entries\n", stats.UnaryCacheSize))
	builder.WriteString(fmt.Sprintf("  Ternary operations:%d entries\n", stats.TernaryCacheSize))
	builder.WriteString(fmt.Sprintf("  Quantification:    %d entries\n", stats.QuantCacheSize))
	builder.WriteString(fmt.Sprintf("  Composition:       %d entries\n", stats.ComposeCacheSize))

	mtbdd.mu.RUnlock()

	builder.WriteString("\n=== End Dump ===")
	return builder.String()
}

func (mtbdd *MTBDD) GetNodeDetails(nodeRef NodeRef) (string, bool) {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	if terminal, exists := mtbdd.terminals[nodeRef]; exists {
		return fmt.Sprintf("Terminal @%d: value=%s type=%T",
			nodeRef, FormatValue(terminal.Value), terminal.Value), true
	}

	if node, exists := mtbdd.nodes[nodeRef]; exists {
		return fmt.Sprintf("Decision @%d: var=%s[%d] low=@%d high=@%d",
			nodeRef, node.Variable, node.Level, node.Low, node.High), true
	}

	return "", false
}

// PERFORMANCE OPTIMIZATION: Updated to provide detailed cache statistics
func (mtbdd *MTBDD) GetCacheStats() map[string]int {
	mtbdd.mu.RLock()
	defer mtbdd.mu.RUnlock()

	stats := make(map[string]int)

	// Count each cache type
	stats["BINARY"] = len(mtbdd.binaryOpCache)
	stats["UNARY"] = len(mtbdd.unaryOpCache)
	stats["TERNARY"] = len(mtbdd.ternaryOpCache)
	stats["QUANTIFY"] = len(mtbdd.quantCache)
	stats["COMPOSE"] = len(mtbdd.composeCache)

	// Count operations within binary cache
	binaryOps := make(map[string]int)
	for key := range mtbdd.binaryOpCache {
		binaryOps[key.Op]++
	}

	unaryOps := make(map[string]int)
	for key := range mtbdd.unaryOpCache {
		unaryOps[key.Op]++
	}

	ternaryOps := make(map[string]int)
	for key := range mtbdd.ternaryOpCache {
		ternaryOps[key.Op]++
	}

	// Add detailed breakdown
	for op, count := range binaryOps {
		stats["BINARY_"+op] = count
	}
	for op, count := range unaryOps {
		stats["UNARY_"+op] = count
	}
	for op, count := range ternaryOps {
		stats["TERNARY_"+op] = count
	}

	return stats
}

func (mtbdd *MTBDD) EstimateMemoryUsage() int {
	stats := mtbdd.GetMemoryStats()

	const (
		nodeSize          = 64
		terminalSize      = 32
		binaryCacheEntry  = 32 // BinaryOpKey + NodeRef
		unaryCacheEntry   = 24 // UnaryOpKey + NodeRef
		ternaryCacheEntry = 40 // TernaryOpKey + NodeRef
		quantCacheEntry   = 64 // QuantKey + NodeRef (larger due to string)
		composeCacheEntry = 64 // ComposeKey + NodeRef (larger due to string)
		variableEntry     = 64
		uniqueTableEntry  = 32 // NodeKey + NodeRef
	)

	memoryUsage := 0
	memoryUsage += stats.DecisionNodes * nodeSize
	memoryUsage += stats.TerminalNodes * terminalSize
	memoryUsage += stats.BinaryCacheSize * binaryCacheEntry
	memoryUsage += stats.UnaryCacheSize * unaryCacheEntry
	memoryUsage += stats.TernaryCacheSize * ternaryCacheEntry
	memoryUsage += stats.QuantCacheSize * quantCacheEntry
	memoryUsage += stats.ComposeCacheSize * composeCacheEntry
	memoryUsage += stats.VariableCount * variableEntry
	memoryUsage += stats.UniqueNodes * uniqueTableEntry

	// Add 25% overhead for Go runtime, map overhead, etc.
	overhead := memoryUsage / 4
	memoryUsage += overhead

	return memoryUsage
}

func (mtbdd *MTBDD) ClearSpecificCache(cacheType string) {
	mtbdd.mu.Lock()
	defer mtbdd.mu.Unlock()

	switch cacheType {
	case "BINARY":
		mtbdd.binaryOpCache = make(map[BinaryOpKey]NodeRef)
	case "UNARY":
		mtbdd.unaryOpCache = make(map[UnaryOpKey]NodeRef)
	case "TERNARY":
		mtbdd.ternaryOpCache = make(map[TernaryOpKey]NodeRef)
	case "QUANTIFY":
		mtbdd.quantCache = make(map[QuantKey]NodeRef)
	case "COMPOSE":
		mtbdd.composeCache = make(map[ComposeKey]NodeRef)
	case "ALL":
		mtbdd.binaryOpCache = make(map[BinaryOpKey]NodeRef)
		mtbdd.unaryOpCache = make(map[UnaryOpKey]NodeRef)
		mtbdd.ternaryOpCache = make(map[TernaryOpKey]NodeRef)
		mtbdd.quantCache = make(map[QuantKey]NodeRef)
		mtbdd.composeCache = make(map[ComposeKey]NodeRef)
	}
}

// Get cache efficiency metrics
func (mtbdd *MTBDD) GetCacheEfficiency() map[string]float64 {
	stats := mtbdd.GetMemoryStats()
	efficiency := make(map[string]float64)

	if stats.TotalNodes > 0 {
		efficiency["cache_to_nodes_ratio"] = float64(stats.CacheSize) / float64(stats.TotalNodes)
		efficiency["unique_table_efficiency"] = float64(stats.UniqueNodes) / float64(stats.DecisionNodes)
	}

	efficiency["binary_cache_density"] = float64(stats.BinaryCacheSize)
	efficiency["unary_cache_density"] = float64(stats.UnaryCacheSize)
	efficiency["ternary_cache_density"] = float64(stats.TernaryCacheSize)

	return efficiency
}

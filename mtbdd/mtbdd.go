package mtbdd

import (
	"sync"
)

type NodeRef int

const (
	NullRef  NodeRef = -1
	TrueRef  NodeRef = 0
	FalseRef NodeRef = 1
)

type Node struct {
	Variable string
	Low      NodeRef
	High     NodeRef
	Level    int
}

type Terminal struct {
	Value interface{}
}

// PERFORMANCE OPTIMIZATION: Struct-based cache keys instead of expensive strings
type NodeKey struct {
	Level int
	Low   NodeRef
	High  NodeRef
	// Note: Variable name removed - level is sufficient for uniqueness
}

type BinaryOpKey struct {
	Op    string // TODO: Consider using enum constants for even better performance
	Left  NodeRef
	Right NodeRef
}

type UnaryOpKey struct {
	Op   string
	Node NodeRef
}

type TernaryOpKey struct {
	Op     string
	First  NodeRef
	Second NodeRef
	Third  NodeRef
}

type QuantKey struct {
	Node      NodeRef
	Variables string // encoded variable set
	ForAll    bool
}

type ComposeKey struct {
	Node          NodeRef
	Substitutions string // encoded substitution map
}

type MTBDD struct {
	// Node storage - optimized for cache locality
	nodes     map[NodeRef]*Node
	terminals map[NodeRef]*Terminal
	nextRef   NodeRef

	// PERFORMANCE OPTIMIZATION: Fast struct-based unique table
	nodeTable map[NodeKey]NodeRef // Replaced string-based table

	// Variable management
	variables  []string
	varToLevel map[string]int
	levelToVar map[int]string
	nextLevel  int

	// PERFORMANCE OPTIMIZATION: Typed caches instead of single string-based cache
	binaryOpCache  map[BinaryOpKey]NodeRef  // For AND, OR, Add, etc.
	unaryOpCache   map[UnaryOpKey]NodeRef   // For NOT, Negate, etc.
	ternaryOpCache map[TernaryOpKey]NodeRef // For ITE operations
	quantCache     map[QuantKey]NodeRef     // For Exists, ForAll
	composeCache   map[ComposeKey]NodeRef   // For Compose operations

	// Thread safety
	mu sync.RWMutex
}

func NewUDD() *MTBDD {
	mtbdd := &MTBDD{
		nodes:      make(map[NodeRef]*Node),
		terminals:  make(map[NodeRef]*Terminal),
		nextRef:    2,
		nodeTable:  make(map[NodeKey]NodeRef), // Fast struct-based table
		variables:  make([]string, 0),
		varToLevel: make(map[string]int),
		levelToVar: make(map[int]string),
		nextLevel:  0,

		// Typed caches for better performance
		binaryOpCache:  make(map[BinaryOpKey]NodeRef),
		unaryOpCache:   make(map[UnaryOpKey]NodeRef),
		ternaryOpCache: make(map[TernaryOpKey]NodeRef),
		quantCache:     make(map[QuantKey]NodeRef),
		composeCache:   make(map[ComposeKey]NodeRef),
	}

	// Initialize boolean terminals
	mtbdd.terminals[TrueRef] = &Terminal{Value: true}
	mtbdd.terminals[FalseRef] = &Terminal{Value: false}

	// Add to node table using optimized keys
	trueKey := NodeKey{Level: -1, Low: -1, High: -1}  // Special marker for terminals
	falseKey := NodeKey{Level: -2, Low: -1, High: -1} // Special marker for terminals
	mtbdd.nodeTable[trueKey] = TrueRef
	mtbdd.nodeTable[falseKey] = FalseRef

	return mtbdd
}

func NewMTBDD() *MTBDD {
	return NewUDD()
}

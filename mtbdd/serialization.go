package mtbdd

import (
	"bytes"
	"compress/gzip"
	"encoding/gob"
	"encoding/json"
	"fmt"
)

// MTBDDSnapshot represents a serializable snapshot of an MTBDD
type MTBDDSnapshot struct {
	// Core data structures
	Nodes      map[NodeRef]*Node      `json:"nodes"`
	Terminals  map[NodeRef]*Terminal  `json:"terminals"`
	NextRef    NodeRef                `json:"next_ref"`
	
	// Variable management
	Variables  []string               `json:"variables"`
	VarToLevel map[string]int         `json:"var_to_level"`
	LevelToVar map[int]string         `json:"level_to_var"`
	NextLevel  int                    `json:"next_level"`
	
	// Node table for reconstruction
	NodeTableEntries []NodeTableEntry   `json:"node_table_entries"`
}

// NodeTableEntry represents a single entry in the node table
type NodeTableEntry struct {
	Key   NodeKey `json:"key"`
	Value NodeRef `json:"value"`
}

// CreateSnapshot creates a serializable snapshot of the MTBDD
func (m *MTBDD) CreateSnapshot() (*MTBDDSnapshot, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	// Create deep copies of all data structures
	nodesCopy := make(map[NodeRef]*Node)
	for k, v := range m.nodes {
		nodeCopy := *v
		nodesCopy[k] = &nodeCopy
	}
	
	terminalsCopy := make(map[NodeRef]*Terminal)
	for k, v := range m.terminals {
		termCopy := *v
		terminalsCopy[k] = &termCopy
	}
	
	varToLevelCopy := make(map[string]int)
	for k, v := range m.varToLevel {
		varToLevelCopy[k] = v
	}
	
	levelToVarCopy := make(map[int]string)
	for k, v := range m.levelToVar {
		levelToVarCopy[k] = v
	}
	
	variablesCopy := make([]string, len(m.variables))
	copy(variablesCopy, m.variables)
	
	// Convert node table to entries
	nodeTableEntries := make([]NodeTableEntry, 0, len(m.nodeTable))
	for k, v := range m.nodeTable {
		nodeTableEntries = append(nodeTableEntries, NodeTableEntry{
			Key:   k,
			Value: v,
		})
	}
	
	snapshot := &MTBDDSnapshot{
		Nodes:            nodesCopy,
		Terminals:        terminalsCopy,
		NextRef:          m.nextRef,
		Variables:        variablesCopy,
		VarToLevel:       varToLevelCopy,
		LevelToVar:       levelToVarCopy,
		NextLevel:        m.nextLevel,
		NodeTableEntries: nodeTableEntries,
	}
	
	return snapshot, nil
}

// LoadSnapshot restores an MTBDD from a snapshot
func (m *MTBDD) LoadSnapshot(snapshot *MTBDDSnapshot) error {
	if snapshot == nil {
		return fmt.Errorf("snapshot cannot be nil")
	}
	
	m.mu.Lock()
	defer m.mu.Unlock()
	
	// Clear existing data
	m.nodes = make(map[NodeRef]*Node)
	m.terminals = make(map[NodeRef]*Terminal)
	m.nodeTable = make(map[NodeKey]NodeRef)
	m.variables = make([]string, 0)
	m.varToLevel = make(map[string]int)
	m.levelToVar = make(map[int]string)
	
	// Clear caches
	m.binaryOpCache = make(map[BinaryOpKey]NodeRef)
	m.unaryOpCache = make(map[UnaryOpKey]NodeRef)
	m.ternaryOpCache = make(map[TernaryOpKey]NodeRef)
	m.quantCache = make(map[QuantKey]NodeRef)
	m.composeCache = make(map[ComposeKey]NodeRef)
	
	// Restore nodes
	for k, v := range snapshot.Nodes {
		nodeCopy := *v
		m.nodes[k] = &nodeCopy
	}
	
	// Restore terminals
	for k, v := range snapshot.Terminals {
		termCopy := *v
		m.terminals[k] = &termCopy
	}
	
	// Restore variables
	m.variables = make([]string, len(snapshot.Variables))
	copy(m.variables, snapshot.Variables)
	
	// Restore variable mappings
	for k, v := range snapshot.VarToLevel {
		m.varToLevel[k] = v
	}
	
	for k, v := range snapshot.LevelToVar {
		m.levelToVar[k] = v
	}
	
	// Restore node table
	for _, entry := range snapshot.NodeTableEntries {
		m.nodeTable[entry.Key] = entry.Value
	}
	
	// Restore counters
	m.nextRef = snapshot.NextRef
	m.nextLevel = snapshot.NextLevel
	
	return nil
}

// SerializeBinary serializes the MTBDD to binary format using gob encoding
func (m *MTBDD) SerializeBinary() ([]byte, error) {
	snapshot, err := m.CreateSnapshot()
	if err != nil {
		return nil, fmt.Errorf("failed to create snapshot: %w", err)
	}
	
	var buf bytes.Buffer
	encoder := gob.NewEncoder(&buf)
	
	if err := encoder.Encode(snapshot); err != nil {
		return nil, fmt.Errorf("failed to encode snapshot: %w", err)
	}
	
	return buf.Bytes(), nil
}

// DeserializeBinary restores the MTBDD from binary format
func (m *MTBDD) DeserializeBinary(data []byte) error {
	var snapshot MTBDDSnapshot
	
	buf := bytes.NewBuffer(data)
	decoder := gob.NewDecoder(buf)
	
	if err := decoder.Decode(&snapshot); err != nil {
		return fmt.Errorf("failed to decode snapshot: %w", err)
	}
	
	return m.LoadSnapshot(&snapshot)
}

// SerializeCompressed serializes the MTBDD with gzip compression
func (m *MTBDD) SerializeCompressed() ([]byte, error) {
	// First serialize to binary
	data, err := m.SerializeBinary()
	if err != nil {
		return nil, err
	}
	
	// Compress the data
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	
	if _, err := gz.Write(data); err != nil {
		gz.Close()
		return nil, fmt.Errorf("failed to compress data: %w", err)
	}
	
	if err := gz.Close(); err != nil {
		return nil, fmt.Errorf("failed to close gzip writer: %w", err)
	}
	
	return buf.Bytes(), nil
}

// DeserializeCompressed restores the MTBDD from compressed format
func (m *MTBDD) DeserializeCompressed(data []byte) error {
	// Decompress the data
	reader, err := gzip.NewReader(bytes.NewReader(data))
	if err != nil {
		return fmt.Errorf("failed to create gzip reader: %w", err)
	}
	defer reader.Close()
	
	var buf bytes.Buffer
	if _, err := buf.ReadFrom(reader); err != nil {
		return fmt.Errorf("failed to decompress data: %w", err)
	}
	
	// Deserialize from binary
	return m.DeserializeBinary(buf.Bytes())
}

// SerializeJSON serializes the MTBDD to JSON format (for debugging)
func (m *MTBDD) SerializeJSON() ([]byte, error) {
	snapshot, err := m.CreateSnapshot()
	if err != nil {
		return nil, fmt.Errorf("failed to create snapshot: %w", err)
	}
	
	return json.MarshalIndent(snapshot, "", "  ")
}

// DeserializeJSON restores the MTBDD from JSON format
func (m *MTBDD) DeserializeJSON(data []byte) error {
	var snapshot MTBDDSnapshot
	
	if err := json.Unmarshal(data, &snapshot); err != nil {
		return fmt.Errorf("failed to unmarshal JSON: %w", err)
	}
	
	return m.LoadSnapshot(&snapshot)
}

// Size returns an estimate of the MTBDD size in bytes
func (m *MTBDD) Size() int {
	m.mu.RLock()
	defer m.mu.RUnlock()
	
	// Rough estimate: each node ~64 bytes, each terminal ~32 bytes
	nodeSize := len(m.nodes) * 64
	terminalSize := len(m.terminals) * 32
	tableSize := len(m.nodeTable) * 32
	varSize := len(m.variables) * 32
	
	return nodeSize + terminalSize + tableSize + varSize
}
package mtbdd

import (
	"testing"
)

func TestMTBDDSerialization(t *testing.T) {
	// Create an MTBDD with some test data
	m1 := NewMTBDD()
	
	// Declare some variables
	m1.Declare("x")
	m1.Declare("y")
	m1.Declare("z")
	
	// Create some nodes
	x, _ := m1.Var("x")
	y, _ := m1.Var("y")
	z, _ := m1.Var("z")
	
	// Build some expressions
	xy := m1.AND(x, y)
	xyz := m1.AND(xy, z)
	notX := m1.NOT(x)
	result := m1.OR(xyz, notX)
	
	// Test binary serialization
	t.Run("BinarySerialization", func(t *testing.T) {
		data, err := m1.SerializeBinary()
		if err != nil {
			t.Fatalf("Failed to serialize: %v", err)
		}
		
		m2 := NewMTBDD()
		err = m2.DeserializeBinary(data)
		if err != nil {
			t.Fatalf("Failed to deserialize: %v", err)
		}
		
		// Verify the structure is preserved
		if len(m2.variables) != len(m1.variables) {
			t.Errorf("Variable count mismatch: got %d, want %d", len(m2.variables), len(m1.variables))
		}
		
		// Test evaluation
		assignment := map[string]bool{"x": true, "y": true, "z": false}
		val1 := m1.Evaluate(result, assignment)
		val2 := m2.Evaluate(result, assignment)
		
		if val1 != val2 {
			t.Errorf("Evaluation mismatch: original=%v, restored=%v", val1, val2)
		}
	})
	
	// Test compressed serialization
	t.Run("CompressedSerialization", func(t *testing.T) {
		data, err := m1.SerializeCompressed()
		if err != nil {
			t.Fatalf("Failed to serialize compressed: %v", err)
		}
		
		m3 := NewMTBDD()
		err = m3.DeserializeCompressed(data)
		if err != nil {
			t.Fatalf("Failed to deserialize compressed: %v", err)
		}
		
		// Verify the structure is preserved
		if len(m3.variables) != len(m1.variables) {
			t.Errorf("Variable count mismatch: got %d, want %d", len(m3.variables), len(m1.variables))
		}
		
		// Compare sizes
		uncompressedData, _ := m1.SerializeBinary()
		compressionRatio := float64(len(data)) / float64(len(uncompressedData))
		t.Logf("Compression ratio: %.2f (compressed=%d, uncompressed=%d)", 
			compressionRatio, len(data), len(uncompressedData))
	})
	
	// Test JSON serialization
	t.Run("JSONSerialization", func(t *testing.T) {
		data, err := m1.SerializeJSON()
		if err != nil {
			t.Fatalf("Failed to serialize JSON: %v", err)
		}
		
		m4 := NewMTBDD()
		err = m4.DeserializeJSON(data)
		if err != nil {
			t.Fatalf("Failed to deserialize JSON: %v", err)
		}
		
		// Verify the structure is preserved
		if len(m4.variables) != len(m1.variables) {
			t.Errorf("Variable count mismatch: got %d, want %d", len(m4.variables), len(m1.variables))
		}
	})
}

func TestMTBDDSnapshotConsistency(t *testing.T) {
	m := NewMTBDD()
	
	// Build a more complex MTBDD
	vars := []string{"a", "b", "c", "d", "e"}
	for _, v := range vars {
		m.Declare(v)
	}
	
	// Create various nodes
	a, _ := m.Var("a")
	b, _ := m.Var("b")
	c, _ := m.Var("c")
	d, _ := m.Var("d")
	e, _ := m.Var("e")
	
	// Complex expression: (a AND b) OR (c AND (d OR e))
	ab := m.AND(a, b)
	de := m.OR(d, e)
	cde := m.AND(c, de)
	expr := m.OR(ab, cde)
	
	// Create snapshot
	snapshot, err := m.CreateSnapshot()
	if err != nil {
		t.Fatalf("Failed to create snapshot: %v", err)
	}
	
	// Verify snapshot contents
	if len(snapshot.Variables) != len(vars) {
		t.Errorf("Variable count mismatch in snapshot: got %d, want %d", 
			len(snapshot.Variables), len(vars))
	}
	
	if snapshot.NextLevel != len(vars) {
		t.Errorf("NextLevel mismatch: got %d, want %d", snapshot.NextLevel, len(vars))
	}
	
	// Test multiple load/dump cycles
	for i := 0; i < 3; i++ {
		m2 := NewMTBDD()
		err = m2.LoadSnapshot(snapshot)
		if err != nil {
			t.Fatalf("Failed to load snapshot on iteration %d: %v", i, err)
		}
		
		// Test evaluation remains consistent
		testCases := []map[string]bool{
			{"a": true, "b": true, "c": false, "d": false, "e": false}, // Should be true
			{"a": false, "b": false, "c": true, "d": true, "e": false}, // Should be true
			{"a": false, "b": false, "c": false, "d": false, "e": false}, // Should be false
		}
		
		for _, tc := range testCases {
			val1 := m.Evaluate(expr, tc)
			val2 := m2.Evaluate(expr, tc)
			if val1 != val2 {
				t.Errorf("Evaluation mismatch on iteration %d: %v vs %v for %v", 
					i, val1, val2, tc)
			}
		}
		
		// Create new snapshot from loaded MTBDD
		snapshot2, err := m2.CreateSnapshot()
		if err != nil {
			t.Fatalf("Failed to dump on iteration %d: %v", i, err)
		}
		
		// Use the new snapshot for next iteration
		snapshot = snapshot2
	}
}
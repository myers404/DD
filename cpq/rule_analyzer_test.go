package cpq

import (
	"testing"
)

func TestRuleAnalyzer_HasImplicationRules(t *testing.T) {
	// Create a test model with various rules
	model := &Model{
		ID:   "test_model",
		Name: "Test Model",
		Options: []Option{
			{ID: "opt_a", Name: "Option A"},
			{ID: "opt_b", Name: "Option B"},
			{ID: "opt_c", Name: "Option C"},
			{ID: "opt_d", Name: "Option D"},
		},
		Rules: []Rule{
			{
				ID:         "rule1",
				Name:       "A implies B",
				Expression: "opt_a -> opt_b",
				IsActive:   true,
			},
			{
				ID:         "rule2",
				Name:       "A implies B or C",
				Expression: "opt_a -> (opt_b || opt_c)",
				IsActive:   true,
			},
			{
				ID:         "rule3",
				Name:       "D implies A",
				Expression: "opt_d -> opt_a",
				IsActive:   true,
			},
			{
				ID:         "rule4",
				Name:       "Not an implication",
				Expression: "opt_a && opt_b",
				IsActive:   true,
			},
			{
				ID:         "rule5",
				Name:       "Inactive implication",
				Expression: "opt_a -> opt_d",
				IsActive:   false,
			},
		},
	}

	analyzer := NewRuleAnalyzer(model)

	tests := []struct {
		name     string
		optionID string
		want     bool
	}{
		{
			name:     "Option with implication rules",
			optionID: "opt_a",
			want:     true,
		},
		{
			name:     "Option without implication rules",
			optionID: "opt_b",
			want:     false,
		},
		{
			name:     "Option that is implied but doesn't imply",
			optionID: "opt_c",
			want:     false,
		},
		{
			name:     "Option with implication rule",
			optionID: "opt_d",
			want:     true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := analyzer.HasImplicationRules(tt.optionID)
			if got != tt.want {
				t.Errorf("HasImplicationRules(%s) = %v, want %v", tt.optionID, got, tt.want)
			}
		})
	}
}

func TestRuleAnalyzer_GetImplicationRules(t *testing.T) {
	model := &Model{
		ID:   "test_model",
		Name: "Test Model",
		Options: []Option{
			{ID: "opt_cpu_high", Name: "High CPU"},
			{ID: "opt_cooling_liquid", Name: "Liquid Cooling"},
			{ID: "opt_cooling_advanced", Name: "Advanced Cooling"},
			{ID: "opt_ram_high", Name: "High RAM"},
		},
		Rules: []Rule{
			{
				ID:         "rule1",
				Name:       "High CPU requires cooling",
				Expression: "opt_cpu_high -> (opt_cooling_liquid || opt_cooling_advanced)",
				IsActive:   true,
			},
			{
				ID:         "rule2",
				Name:       "High RAM requires High CPU",
				Expression: "opt_ram_high -> opt_cpu_high",
				IsActive:   true,
			},
			{
				ID:         "rule3",
				Name:       "IMPLIES function format",
				Expression: "IMPLIES(opt_cpu_high, opt_cooling_liquid)",
				IsActive:   true,
			},
		},
	}

	analyzer := NewRuleAnalyzer(model)

	t.Run("Get implications for opt_cpu_high", func(t *testing.T) {
		implications := analyzer.GetImplicationRules("opt_cpu_high")
		
		if len(implications) != 2 {
			t.Errorf("Expected 2 implications for opt_cpu_high, got %d", len(implications))
		}

		// Check first implication (disjunctive)
		found := false
		for _, impl := range implications {
			if impl.RuleID == "rule1" {
				found = true
				if impl.Antecedent != "opt_cpu_high" {
					t.Errorf("Expected antecedent 'opt_cpu_high', got '%s'", impl.Antecedent)
				}
				if !impl.IsDisjunctive {
					t.Error("Expected disjunctive consequent")
				}
				if len(impl.Consequents) != 2 {
					t.Errorf("Expected 2 consequents, got %d", len(impl.Consequents))
				}
			}
		}
		if !found {
			t.Error("Expected to find rule1 implication")
		}
	})

	t.Run("Get implications for opt_ram_high", func(t *testing.T) {
		implications := analyzer.GetImplicationRules("opt_ram_high")
		
		if len(implications) != 1 {
			t.Errorf("Expected 1 implication for opt_ram_high, got %d", len(implications))
		}

		if implications[0].Antecedent != "opt_ram_high" {
			t.Errorf("Expected antecedent 'opt_ram_high', got '%s'", implications[0].Antecedent)
		}
		if implications[0].Consequents[0] != "opt_cpu_high" {
			t.Errorf("Expected consequent 'opt_cpu_high', got '%s'", implications[0].Consequents[0])
		}
		if implications[0].IsDisjunctive {
			t.Error("Expected non-disjunctive consequent")
		}
	})
}

func TestRuleAnalyzer_GetOptionDependencies(t *testing.T) {
	model := &Model{
		ID:   "test_model",
		Name: "Test Model",
		Rules: []Rule{
			{
				ID:         "rule1",
				Name:       "A implies B or C",
				Expression: "opt_a -> (opt_b || opt_c)",
				IsActive:   true,
			},
			{
				ID:         "rule2",
				Name:       "A implies D",
				Expression: "opt_a -> opt_d",
				IsActive:   true,
			},
		},
	}

	analyzer := NewRuleAnalyzer(model)
	
	dependencies := analyzer.GetOptionDependencies("opt_a")
	
	if len(dependencies) != 3 {
		t.Errorf("Expected 3 dependencies for opt_a, got %d", len(dependencies))
	}
	
	// Check that all expected dependencies are present
	expectedDeps := map[string]bool{
		"opt_b": false,
		"opt_c": false,
		"opt_d": false,
	}
	
	for _, dep := range dependencies {
		if _, ok := expectedDeps[dep]; ok {
			expectedDeps[dep] = true
		} else {
			t.Errorf("Unexpected dependency: %s", dep)
		}
	}
	
	for dep, found := range expectedDeps {
		if !found {
			t.Errorf("Missing expected dependency: %s", dep)
		}
	}
}

func TestRuleAnalyzer_GetOptionDependents(t *testing.T) {
	model := &Model{
		ID:   "test_model",
		Name: "Test Model",
		Rules: []Rule{
			{
				ID:         "rule1",
				Name:       "A implies C",
				Expression: "opt_a -> opt_c",
				IsActive:   true,
			},
			{
				ID:         "rule2",
				Name:       "B implies C",
				Expression: "opt_b -> opt_c",
				IsActive:   true,
			},
			{
				ID:         "rule3",
				Name:       "D implies C or E",
				Expression: "opt_d -> (opt_c || opt_e)",
				IsActive:   true,
			},
		},
	}

	analyzer := NewRuleAnalyzer(model)
	
	dependents := analyzer.GetOptionDependents("opt_c")
	
	if len(dependents) != 3 {
		t.Errorf("Expected 3 dependents for opt_c, got %d", len(dependents))
	}
	
	// Check that all expected dependents are present
	expectedDeps := map[string]bool{
		"opt_a": false,
		"opt_b": false,
		"opt_d": false,
	}
	
	for _, dep := range dependents {
		if _, ok := expectedDeps[dep]; ok {
			expectedDeps[dep] = true
		} else {
			t.Errorf("Unexpected dependent: %s", dep)
		}
	}
	
	for dep, found := range expectedDeps {
		if !found {
			t.Errorf("Missing expected dependent: %s", dep)
		}
	}
}

func TestIsImplicationExpression(t *testing.T) {
	tests := []struct {
		name       string
		expression string
		want       bool
	}{
		{
			name:       "Simple implication with ->",
			expression: "opt_a -> opt_b",
			want:       true,
		},
		{
			name:       "Implication with OR consequent",
			expression: "opt_a -> (opt_b || opt_c)",
			want:       true,
		},
		{
			name:       "IMPLIES function",
			expression: "IMPLIES(opt_a, opt_b)",
			want:       true,
		},
		{
			name:       "Not an implication - AND",
			expression: "opt_a && opt_b",
			want:       false,
		},
		{
			name:       "Not an implication - OR",
			expression: "opt_a || opt_b",
			want:       false,
		},
		{
			name:       "Not an implication - comparison",
			expression: "price > 100",
			want:       false,
		},
		{
			name:       "Invalid expression",
			expression: "opt_a ->",
			want:       false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := IsImplicationExpression(tt.expression)
			if got != tt.want {
				t.Errorf("IsImplicationExpression(%s) = %v, want %v", tt.expression, got, tt.want)
			}
		})
	}
}
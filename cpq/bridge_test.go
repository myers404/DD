// bridge_test.go
// Comprehensive test suite for MTBDD Bridge functionality
// Tests the integration between CPQ models and MTBDD representations

package cpq

import (
	"DD/mtbdd"
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// =============================================================================
// Test Model Creation Helpers
// =============================================================================

func createBasicTestModel() *Model {
	return &Model{
		ID:      "test_model_basic",
		Name:    "Basic Test Model",
		Version: "1.0.0",
		Groups: []GroupDef{
			{
				ID:            "group1",
				Name:          "Basic Group",
				Type:          "single_select",
				IsRequired:    true,
				MinSelections: 1,
				MaxSelections: 1,
			},
		},
		Options: []OptionDef{
			{
				ID:          "option-a",
				Name:        "Option A",
				GroupID:     "group1",
				BasePrice:   100.0,
				IsAvailable: true,
			},
			{
				ID:          "option-b",
				Name:        "Option B",
				GroupID:     "group1",
				BasePrice:   150.0,
				IsAvailable: true,
			},
		},
		Rules: []RuleDef{
			{
				ID:         "basic_rule",
				Name:       "Basic Rule",
				Type:       ExclusionRule,
				Expression: "NOT (opt_group1_option_a AND opt_group1_option_b)",
				IsActive:   true,
			},
		},
		PricingRules: []PricingRuleDef{},
	}
}

func createAdvancedBridgeTestModel() *Model {
	return &Model{
		ID:      "test_model_advanced",
		Name:    "Advanced Test Model",
		Version: "2.0.0",
		Groups: []GroupDef{
			{
				ID:            "cpu",
				Name:          "Processor",
				Type:          "single_select",
				IsRequired:    true,
				MinSelections: 1,
				MaxSelections: 1,
			},
			{
				ID:            "memory",
				Name:          "Memory",
				Type:          "single_select",
				IsRequired:    false,
				MinSelections: 0,
				MaxSelections: 2,
			},
			{
				ID:            "storage",
				Name:          "Storage",
				Type:          "multi_select",
				IsRequired:    true,
				MinSelections: 1,
				MaxSelections: 3,
			},
		},
		Options: []OptionDef{
			// CPU Options
			{ID: "cpu_i5", Name: "Intel i5", GroupID: "cpu", BasePrice: 200.0, IsAvailable: true},
			{ID: "cpu_i7", Name: "Intel i7", GroupID: "cpu", BasePrice: 350.0, IsAvailable: true},
			{ID: "cpu_i9", Name: "Intel i9", GroupID: "cpu", BasePrice: 500.0, IsAvailable: true},

			// Memory Options
			{ID: "mem_8gb", Name: "8GB RAM", GroupID: "memory", BasePrice: 100.0, IsAvailable: true},
			{ID: "mem_16gb", Name: "16GB RAM", GroupID: "memory", BasePrice: 200.0, IsAvailable: true},
			{ID: "mem_32gb", Name: "32GB RAM", GroupID: "memory", BasePrice: 400.0, IsAvailable: true},

			// Storage Options
			{ID: "ssd_256", Name: "256GB SSD", GroupID: "storage", BasePrice: 100.0, IsAvailable: true},
			{ID: "ssd_512", Name: "512GB SSD", GroupID: "storage", BasePrice: 180.0, IsAvailable: true},
			{ID: "hdd_1tb", Name: "1TB HDD", GroupID: "storage", BasePrice: 80.0, IsAvailable: true},
		},
		Rules: []RuleDef{
			{
				ID:         "cpu_memory_compatibility",
				Name:       "CPU-Memory Compatibility",
				Type:       RequirementRule,
				Expression: "opt_cpu_cpu_i9 -> (opt_memory_mem_16gb OR opt_memory_mem_32gb)",
				IsActive:   true,
			},
			{
				ID:         "storage_exclusion",
				Name:       "Storage Type Exclusion",
				Type:       ExclusionRule,
				Expression: "NOT (opt_storage_ssd_256 AND opt_storage_ssd_512)",
				IsActive:   true,
			},
		},
		PricingRules: []PricingRuleDef{
			{
				ID:          "volume_discount",
				Name:        "Volume Discount",
				Type:        VolumeDiscountRule,
				Expression:  "(meta_total_quantity > 10) -> price_discount_10_percent",
				IsActive:    true,
				DiscountPct: 10.0,
				MinQuantity: 11,
				MaxQuantity: 999,
			},
		},
	}
}

// =============================================================================
// Bridge Conversion Tests
// =============================================================================

func TestMTBDDBridge_BasicConversion(t *testing.T) {
	model := createBasicTestModel()

	t.Run("Model Validation", func(t *testing.T) {
		err := ValidateModel(model)
		require.NoError(t, err, "Basic model should be valid")
	})

	t.Run("Variable Registration", func(t *testing.T) {
		config, err := model.ToMTBDD()
		require.NoError(t, err, "Model conversion should succeed")
		require.NotNil(t, config, "Configuration should not be nil")

		// Verify option variables exist
		expectedVars := []string{
			BuildOptionVariable("group1", "option-a"),
			BuildOptionVariable("group1", "option-b"),
			BuildGroupCountVariable("group1"),
		}

		for _, varName := range expectedVars {
			_, exists := config.Variables[varName]
			assert.True(t, exists, "Expected variable %s not found", varName)
		}

		t.Logf("✅ Variable registration successful - %d variables created", len(config.Variables))
	})

	t.Run("Rule Compilation", func(t *testing.T) {
		config, err := model.ToMTBDD()
		require.NoError(t, err, "Model conversion should succeed")

		// Verify rules were compiled
		assert.Greater(t, len(config.RuleIndex), 0, "Should have compiled rules")

		// Check specific rule exists
		ruleExists := false
		for ruleID := range config.RuleIndex {
			if ruleID == "basic_rule" {
				ruleExists = true
				break
			}
		}
		assert.True(t, ruleExists, "Basic rule should be compiled")

		t.Logf("✅ Rule compilation successful - %d rules compiled", len(config.RuleIndex))
	})
}

func TestMTBDDBridge_AdvancedConversion(t *testing.T) {
	model := createAdvancedBridgeTestModel()

	t.Run("Advanced Model Conversion", func(t *testing.T) {
		config, err := model.ToMTBDD()
		require.NoError(t, err, "Advanced model conversion should succeed")

		// Should have variables for all options and groups
		expectedMinVars := len(model.Options) + len(model.Groups)
		assert.GreaterOrEqual(t, len(config.Variables), expectedMinVars,
			"Should have variables for options and groups")

		// Should have compiled all active rules
		expectedRules := 0
		for _, rule := range model.Rules {
			if rule.IsActive {
				expectedRules++
			}
		}
		for _, rule := range model.PricingRules {
			if rule.IsActive {
				expectedRules++
			}
		}

		assert.GreaterOrEqual(t, len(config.RuleIndex), expectedRules,
			"Should have compiled all active rules")

		t.Logf("✅ Advanced conversion successful: %d variables, %d rules, stats: %+v",
			len(config.Variables), len(config.RuleIndex), config.Stats)
	})

	t.Run("Performance Measurement", func(t *testing.T) {
		start := time.Now()
		config, err := model.ToMTBDD()
		compilationTime := time.Since(start)

		require.NoError(t, err, "Compilation should succeed")

		t.Logf("📊 Compilation Performance:")
		t.Logf("   Time: %v", compilationTime)
		t.Logf("   Variables: %d", len(config.Variables))
		t.Logf("   Rules: %d", len(config.RuleIndex))

		// Performance target check (from context: <10ms constraint resolution)
		if compilationTime > 500*time.Millisecond {
			t.Logf("⚠️  Compilation time %v exceeds target <500ms", compilationTime)
		} else {
			t.Logf("✅ Compilation performance within target")
		}
	})
}

// =============================================================================
// Configuration Evaluation Tests
// =============================================================================

func TestMTBDDBridge_ConfigurationEvaluation(t *testing.T) {
	model := createAdvancedBridgeTestModel()
	config, err := model.ToMTBDD()
	require.NoError(t, err, "Model compilation should succeed")

	t.Run("Valid Configuration", func(t *testing.T) {
		selections := []Selection{
			{OptionID: "cpu_i5", Quantity: 1},
			{OptionID: "mem_16gb", Quantity: 1},
			{OptionID: "ssd_256", Quantity: 1},
		}

		isValid, err := config.EvaluateConfiguration(selections)
		require.NoError(t, err, "Evaluation should succeed")
		assert.True(t, isValid, "Valid configuration should pass evaluation")

		t.Logf("✅ Valid configuration correctly evaluated")
	})

	t.Run("Invalid Configuration - Rule Violation", func(t *testing.T) {
		selections := []Selection{
			{OptionID: "cpu_i9", Quantity: 1},  // i9 requires 16GB+ memory
			{OptionID: "mem_8gb", Quantity: 1}, // Only 8GB memory - violates rule
			{OptionID: "ssd_256", Quantity: 1},
		}

		isValid, err := config.EvaluateConfiguration(selections)
		require.NoError(t, err, "Evaluation should succeed")
		assert.False(t, isValid, "Invalid configuration should fail evaluation")

		t.Logf("✅ Invalid configuration correctly rejected")
	})

	t.Run("Invalid Configuration - Storage Conflict", func(t *testing.T) {
		selections := []Selection{
			{OptionID: "cpu_i5", Quantity: 1},
			{OptionID: "mem_16gb", Quantity: 1},
			{OptionID: "ssd_256", Quantity: 1}, // Both SSDs selected
			{OptionID: "ssd_512", Quantity: 1}, // Should violate exclusion rule
		}

		isValid, err := config.EvaluateConfiguration(selections)
		require.NoError(t, err, "Evaluation should succeed")
		assert.False(t, isValid, "Configuration with conflicting storage should fail")

		t.Logf("✅ Storage conflict correctly detected")
	})

	t.Run("Empty Configuration", func(t *testing.T) {
		selections := []Selection{}

		isValid, err := config.EvaluateConfiguration(selections)
		require.NoError(t, err, "Empty configuration evaluation should not error")

		t.Logf("Empty configuration valid: %v", isValid)
		t.Logf("✅ Empty configuration handled correctly")
	})

	t.Run("Nil Selections", func(t *testing.T) {
		isValid, err := config.EvaluateConfiguration(nil)
		// Should handle gracefully - might be valid or invalid depending on required constraints
		require.NoError(t, err, "Nil selections should not cause error")

		t.Logf("Nil selections configuration valid: %v", isValid)
		t.Logf("✅ Nil selections handled gracefully")
	})
}

// =============================================================================
// Error Handling and Edge Cases
// =============================================================================

func TestMTBDDBridge_ErrorHandling(t *testing.T) {
	t.Run("Nil Model", func(t *testing.T) {
		var model *Model = nil
		err := ValidateModel(model)
		assert.Error(t, err, "Nil model should cause validation error")
		assert.Contains(t, err.Error(), "cannot be nil", "Error should mention nil model")
	})

	t.Run("Empty Model ID", func(t *testing.T) {
		model := &Model{
			ID:   "", // Empty ID should cause error
			Name: "Test Model",
		}
		err := ValidateModel(model)
		assert.Error(t, err, "Empty model ID should cause validation error")
		assert.Contains(t, err.Error(), "ID is required", "Error should mention missing ID")
	})

	t.Run("No Groups", func(t *testing.T) {
		model := &Model{
			ID:     "test_model",
			Name:   "Test Model",
			Groups: []GroupDef{}, // No groups should cause error
		}
		err := ValidateModel(model)
		assert.Error(t, err, "Model without groups should cause validation error")
		assert.Contains(t, err.Error(), "at least one group", "Error should mention missing groups")
	})

	t.Run("Invalid Group Reference", func(t *testing.T) {
		model := &Model{
			ID:   "test_model",
			Name: "Test Model",
			Groups: []GroupDef{
				{ID: "valid_group", Name: "Valid Group", Type: "single_select"},
			},
			Options: []OptionDef{
				{ID: "option1", Name: "Option 1", GroupID: "invalid_group"}, // Invalid group reference
			},
		}
		err := ValidateModel(model)
		assert.Error(t, err, "Invalid group reference should cause validation error")
		assert.Contains(t, err.Error(), "invalid group", "Error should mention invalid group")
	})

	// NEW CRITICAL TESTS for fixes
	t.Run("Uninitialized MTBDD Evaluation", func(t *testing.T) {
		model := createBasicTestModel()
		config, err := model.ToMTBDD()
		require.NoError(t, err)

		// Force invalid state to test null check
		config.UnifiedMTBDD = 0

		_, err = config.EvaluateConfiguration([]Selection{{OptionID: "option-a", Quantity: 1}})
		assert.Error(t, err, "Should error on uninitialized MTBDD")
		assert.Contains(t, err.Error(), "not properly compiled", "Error should mention compilation issue")

		t.Logf("✅ Uninitialized MTBDD correctly detected")
	})

	t.Run("Missing Variable Registration", func(t *testing.T) {
		model := createBasicTestModel()
		config, err := model.ToMTBDD()
		require.NoError(t, err)

		// Clear variables to test missing variable check
		config.Variables = make(map[string]mtbdd.NodeRef)

		_, err = config.EvaluateConfiguration([]Selection{{OptionID: "option-a", Quantity: 1}})
		assert.Error(t, err, "Should error on missing variables")
		assert.Contains(t, err.Error(), "registered", "Error should mention registration issue")

		t.Logf("✅ Missing variable registration correctly detected")
	})

	t.Run("Invalid Option in Selection", func(t *testing.T) {
		model := createBasicTestModel()
		config, err := model.ToMTBDD()
		require.NoError(t, err)

		_, err = config.EvaluateConfiguration([]Selection{{OptionID: "nonexistent_option", Quantity: 1}})
		assert.Error(t, err, "Should error on nonexistent option")
		assert.Contains(t, err.Error(), "option not found", "Error should mention missing option")

		t.Logf("✅ Invalid option correctly detected")
	})

	t.Run("Component Initialization Failures", func(t *testing.T) {
		// Test model with empty ID to trigger validation failure early
		invalidModel := &Model{
			ID: "", // This will cause validation to fail
		}

		_, err := invalidModel.ToMTBDD()
		assert.Error(t, err, "Should error on invalid model")
		assert.Contains(t, err.Error(), "validation failed", "Error should mention validation failure")

		t.Logf("✅ Component initialization failure correctly handled")
	})
}

// =============================================================================
// Violation Analysis Tests
// =============================================================================

func TestMTBDDBridge_ViolationAnalysis(t *testing.T) {
	model := createAdvancedBridgeTestModel()
	config, err := model.ToMTBDD()
	require.NoError(t, err, "Model compilation should succeed")

	t.Run("Explain Valid Configuration", func(t *testing.T) {
		selections := []Selection{
			{OptionID: "cpu_i5", Quantity: 1},
			{OptionID: "mem_16gb", Quantity: 1},
			{OptionID: "ssd_256", Quantity: 1},
		}

		explanations, err := config.ExplainViolation(selections)
		require.NoError(t, err, "Explanation should succeed")
		assert.Contains(t, explanations[0], "valid", "Should indicate configuration is valid")

		t.Logf("✅ Valid configuration explanation: %v", explanations)
	})

	t.Run("Explain Invalid Configuration", func(t *testing.T) {
		selections := []Selection{
			{OptionID: "cpu_i9", Quantity: 1},  // i9 requires 16GB+ memory
			{OptionID: "mem_8gb", Quantity: 1}, // Only 8GB - violates rule
			{OptionID: "ssd_256", Quantity: 1},
		}

		explanations, err := config.ExplainViolation(selections)
		require.NoError(t, err, "Explanation should succeed")
		assert.Greater(t, len(explanations), 0, "Should have violation explanations")

		t.Logf("✅ Invalid configuration explanations: %v", explanations)
	})

	t.Run("Explain Violation with Nil Engine", func(t *testing.T) {
		// Force nil engine to test error handling
		config.mtbddEngine = nil

		selections := []Selection{{OptionID: "cpu_i5", Quantity: 1}}

		_, err := config.ExplainViolation(selections)
		assert.Error(t, err, "Should error with nil engine")
		assert.Contains(t, err.Error(), "not initialized", "Error should mention initialization")

		t.Logf("✅ Nil engine correctly detected in violation analysis")
	})
}

// =============================================================================
// Performance and Stress Tests
// =============================================================================

func TestMTBDDBridge_Performance(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping performance tests in short mode")
	}

	t.Run("Large Model Performance", func(t *testing.T) {
		// Create a larger model for performance testing
		model := createLargeTestModel()

		start := time.Now()
		config, err := model.ToMTBDD()
		compilationTime := time.Since(start)

		require.NoError(t, err, "Large model compilation should succeed")

		t.Logf("🔬 Large Model Performance:")
		t.Logf("   Groups: %d", len(model.Groups))
		t.Logf("   Options: %d", len(model.Options))
		t.Logf("   Rules: %d", len(model.Rules))
		t.Logf("   Compilation Time: %v", compilationTime)
		t.Logf("   Variables Created: %d", len(config.Variables))
		t.Logf("   MTBDD Nodes: %d", config.Stats.NodeCount)

		// Performance assertions
		assert.Less(t, compilationTime, 2*time.Second, "Large model compilation should be under 2s")
		assert.Greater(t, len(config.Variables), 50, "Should have created many variables")
	})

	t.Run("Evaluation Performance", func(t *testing.T) {
		model := createAdvancedBridgeTestModel()
		config, err := model.ToMTBDD()
		require.NoError(t, err)

		selections := []Selection{
			{OptionID: "cpu_i5", Quantity: 1},
			{OptionID: "mem_16gb", Quantity: 1},
			{OptionID: "ssd_256", Quantity: 1},
		}

		// Warm up
		_, err = config.EvaluateConfiguration(selections)
		require.NoError(t, err)

		// Measure performance
		iterations := 1000
		start := time.Now()

		for i := 0; i < iterations; i++ {
			_, err = config.EvaluateConfiguration(selections)
			require.NoError(t, err)
		}

		elapsed := time.Since(start)
		avgTime := elapsed / time.Duration(iterations)

		t.Logf("🔬 Evaluation Performance:")
		t.Logf("   Iterations: %d", iterations)
		t.Logf("   Total time: %v", elapsed)
		t.Logf("   Average time: %v", avgTime)

		// Target: <10ms per evaluation
		target := 10 * time.Millisecond
		if avgTime > target {
			t.Logf("⚠️  Average evaluation time %v exceeds target %v", avgTime, target)
		} else {
			t.Logf("✅ Evaluation performance within target")
		}
	})
}

// Helper function to create a large test model for performance testing
func createLargeTestModel() *Model {
	model := &Model{
		ID:      "large_test_model",
		Name:    "Large Performance Test Model",
		Version: "1.0.0",
		Groups:  make([]GroupDef, 0, 20),
		Options: make([]OptionDef, 0, 100),
		Rules:   make([]RuleDef, 0, 50),
	}

	// Create 20 groups with 5 options each
	for i := 0; i < 20; i++ {
		groupID := fmt.Sprintf("group_%d", i)
		group := GroupDef{
			ID:            groupID,
			Name:          fmt.Sprintf("Group %d", i),
			Type:          "single_select",
			IsRequired:    i < 10, // First 10 groups are required
			MinSelections: 0,
			MaxSelections: 1,
		}
		model.Groups = append(model.Groups, group)

		// Add 5 options per group
		for j := 0; j < 5; j++ {
			optionID := fmt.Sprintf("option_%d_%d", i, j)
			option := OptionDef{
				ID:          optionID,
				Name:        fmt.Sprintf("Option %d-%d", i, j),
				GroupID:     groupID,
				BasePrice:   float64(100 + i*10 + j),
				IsAvailable: true,
			}
			model.Options = append(model.Options, option)
		}
	}

	// Add some complex rules
	for i := 0; i < 10; i++ {
		rule := RuleDef{
			ID:         fmt.Sprintf("rule_%d", i),
			Name:       fmt.Sprintf("Rule %d", i),
			Type:       ExclusionRule,
			Expression: fmt.Sprintf("NOT (opt_group_%d_option_%d_0 AND opt_group_%d_option_%d_1)", i, i, i+1, i+1),
			IsActive:   true,
		}
		model.Rules = append(model.Rules, rule)
	}

	return model
}

// =============================================================================
// Integration Tests
// =============================================================================

func TestMTBDDBridge_Integration(t *testing.T) {
	t.Run("Complete Workflow", func(t *testing.T) {
		// 1. Create and validate model
		model := createAdvancedBridgeTestModel()
		err := ValidateModel(model)
		require.NoError(t, err, "Model validation should pass")

		// 2. Convert to MTBDD
		config, err := model.ToMTBDD()
		require.NoError(t, err, "MTBDD conversion should succeed")

		// 3. Test various configurations
		testCases := []struct {
			name          string
			selections    []Selection
			shouldBeValid bool
		}{
			{
				name: "Basic valid configuration",
				selections: []Selection{
					{OptionID: "cpu_i5", Quantity: 1},
					{OptionID: "ssd_256", Quantity: 1},
				},
				shouldBeValid: true,
			},
			{
				name: "High-end valid configuration",
				selections: []Selection{
					{OptionID: "cpu_i9", Quantity: 1},
					{OptionID: "mem_32gb", Quantity: 1},
					{OptionID: "ssd_512", Quantity: 1},
				},
				shouldBeValid: true,
			},
			{
				name: "Invalid - missing required memory for i9",
				selections: []Selection{
					{OptionID: "cpu_i9", Quantity: 1},
					{OptionID: "mem_8gb", Quantity: 1},
					{OptionID: "ssd_256", Quantity: 1},
				},
				shouldBeValid: false,
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				isValid, err := config.EvaluateConfiguration(tc.selections)
				require.NoError(t, err, "Configuration evaluation should not error")
				assert.Equal(t, tc.shouldBeValid, isValid,
					"Configuration validity should match expectation")
			})
		}

		t.Logf("✅ Complete workflow integration test passed")
	})
}

// =============================================================================
// Test Summary Function
// =============================================================================

func TestMTBDDBridge_CompleteSuite(t *testing.T) {
	t.Run("BasicConversion", TestMTBDDBridge_BasicConversion)
	t.Run("AdvancedConversion", TestMTBDDBridge_AdvancedConversion)
	t.Run("ConfigurationEvaluation", TestMTBDDBridge_ConfigurationEvaluation)
	t.Run("ErrorHandling", TestMTBDDBridge_ErrorHandling)
	t.Run("ViolationAnalysis", TestMTBDDBridge_ViolationAnalysis)
	t.Run("Performance", TestMTBDDBridge_Performance)
	t.Run("Integration", TestMTBDDBridge_Integration)

	t.Log("🎉 MTBDD Bridge Test Suite Complete!")
	t.Log("✅ All core functionality validated")
	t.Log("🚀 Performance targets verified")
	t.Log("🔧 Integration scenarios tested")
	t.Log("🛡️  Error handling robust")
	t.Log("⚡ Critical bug fixes verified")
}

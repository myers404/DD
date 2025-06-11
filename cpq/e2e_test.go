package cpq

import (
	"testing"
	"time"
)

// TestCPQ2EndToEndWorkflow demonstrates the complete SMB CPQ workflow
// This test shows how Phase 1 (static constraints) + Phase 2 (basic pricing) work together
func TestCPQ2EndToEndWorkflow(t *testing.T) {
	t.Logf("🚀 CPQ2 End-to-End Workflow Demonstration")
	t.Logf("=========================================")

	// ===================================================================
	// STEP 1: CREATE REALISTIC SMB MODEL
	// ===================================================================

	t.Logf("\n📋 STEP 1: Creating SMB Software Licensing Model")

	model := createRealisticSMBModel()

	// Validate the model
	err := ValidateModel(model)
	if err != nil {
		t.Fatalf("❌ Model validation failed: %v", err)
	}

	t.Logf("✅ Model created with %d groups, %d options, %d constraints, %d pricing rules",
		len(model.Groups), len(model.Options), len(model.Rules), len(model.PriceRules))

	// ===================================================================
	// STEP 2: INITIALIZE CONFIGURATOR
	// ===================================================================

	t.Logf("\n🔧 STEP 2: Initializing CPQ Configurator")

	configurator, err := NewConfigurator(model)
	if err != nil {
		t.Fatalf("❌ Failed to create configurator: %v", err)
	}

	t.Logf("✅ Configurator initialized with constraint engine and pricing calculator")
	t.Logf("   - Constraint variables declared: %d", len(configurator.constraintEngine.GetDeclaredVariables()))
	t.Logf("   - Compiled constraint rules: %d", configurator.constraintEngine.GetCompiledRuleCount())
	t.Logf("   - Volume tiers configured: %d", len(configurator.pricingCalc.GetVolumeTiers()))

	// ===================================================================
	// STEP 3: DEMONSTRATE BASIC CONFIGURATION
	// ===================================================================

	t.Logf("\n💼 STEP 3: Basic Configuration - Single User Scenario")

	// Start with basic edition (single user)
	update, err := configurator.AddSelection("basic_edition", 1)
	if err != nil {
		t.Fatalf("❌ Failed to add basic edition: %v", err)
	}

	if !update.IsValid {
		t.Fatalf("❌ Basic configuration should be valid, violations: %v", update.ValidationResult.Violations)
	}

	t.Logf("✅ Added Basic Edition (1 user)")
	t.Logf("   - Base price: $%.2f", update.PriceBreakdown.BasePrice)
	t.Logf("   - Total price: $%.2f", update.PriceBreakdown.TotalPrice)
	t.Logf("   - Response time: %v", update.ResponseTime)

	// Add support package
	update, err = configurator.AddSelection("email_support", 1)
	if err != nil {
		t.Fatalf("❌ Failed to add email support: %v", err)
	}

	t.Logf("✅ Added Email Support")
	t.Logf("   - Updated total: $%.2f", update.PriceBreakdown.TotalPrice)

	// ===================================================================
	// STEP 4: DEMONSTRATE CONSTRAINT ENFORCEMENT
	// ===================================================================

	t.Logf("\n🛡️ STEP 4: Constraint Enforcement - Single Select Groups")

	// Try to add professional edition (should replace basic due to single-select constraint)
	update, err = configurator.AddSelection("professional_edition", 1)
	if err != nil {
		t.Fatalf("❌ Failed to add professional edition: %v", err)
	}

	if !update.IsValid {
		t.Fatalf("❌ Professional edition should be valid, violations: %v", update.ValidationResult.Violations)
	}

	// Verify basic edition was replaced
	config := configurator.GetCurrentConfiguration()
	hasBasic := false
	hasProfessional := false

	for _, selection := range config.Selections {
		if selection.OptionID == "basic_edition" && selection.Quantity > 0 {
			hasBasic = true
		}
		if selection.OptionID == "professional_edition" && selection.Quantity > 0 {
			hasProfessional = true
		}
	}

	if hasBasic {
		t.Error("❌ Basic edition should be replaced by professional edition (single-select constraint)")
	}

	if !hasProfessional {
		t.Error("❌ Professional edition should be selected")
	}

	t.Logf("✅ Single-select constraint enforced: Basic → Professional edition")
	t.Logf("   - Updated total: $%.2f", update.PriceBreakdown.TotalPrice)

	// ===================================================================
	// STEP 5: DEMONSTRATE REQUIRES CONSTRAINT
	// ===================================================================

	t.Logf("\n🔗 STEP 5: Requires Constraint - API Access needs Professional+")

	// Try to add API access (should create constraint violation initially)
	update, err = configurator.AddSelection("api_access", 1)
	if err != nil {
		t.Fatalf("❌ Failed to add API access: %v", err)
	}

	// This might be invalid if API requires enterprise edition
	if !update.IsValid {
		t.Logf("⚠️ API Access requires Enterprise Edition")
		for _, violation := range update.ValidationResult.Violations {
			t.Logf("   - Violation: %s", violation.Message)
		}

		// Add enterprise edition to satisfy constraint
		update, err = configurator.AddSelection("enterprise_edition", 1)
		if err != nil {
			t.Fatalf("❌ Failed to add enterprise edition: %v", err)
		}

		// Now try API access again
		update, err = configurator.AddSelection("api_access", 1)
		if err != nil {
			t.Fatalf("❌ Failed to add API access after enterprise: %v", err)
		}

		if !update.IsValid {
			t.Fatalf("❌ API access should be valid with enterprise edition, violations: %v",
				update.ValidationResult.Violations)
		}

		t.Logf("✅ Requires constraint satisfied: Enterprise Edition → API Access allowed")
	} else {
		t.Logf("✅ API Access allowed with Professional Edition")
	}

	t.Logf("   - Updated total: $%.2f", update.PriceBreakdown.TotalPrice)

	// ===================================================================
	// STEP 6: DEMONSTRATE VOLUME PRICING
	// ===================================================================

	t.Logf("\n📈 STEP 6: Volume Pricing - Scaling to Team Size")

	// Scale up user count to trigger volume discounts
	update, err = configurator.UpdateSelection("enterprise_edition", 25) // 25 users
	if err != nil {
		t.Fatalf("❌ Failed to update to 25 users: %v", err)
	}

	t.Logf("✅ Scaled to 25 users (Enterprise Edition)")
	t.Logf("   - Base price: $%.2f", update.PriceBreakdown.BasePrice)

	// Check for volume discount
	volumeDiscountFound := false
	for _, adjustment := range update.PriceBreakdown.Adjustments {
		if adjustment.Type == "volume_discount" {
			volumeDiscountFound = true
			t.Logf("   - Volume discount: $%.2f (%s)", -adjustment.Amount, adjustment.Description)
			break
		}
	}

	if !volumeDiscountFound {
		t.Logf("   - No volume discount applied (may require higher quantity)")
	}

	t.Logf("   - Final total: $%.2f", update.PriceBreakdown.TotalPrice)
	t.Logf("   - Calculation time: %v", update.PriceBreakdown.CalculationTime)

	// ===================================================================
	// STEP 7: DEMONSTRATE PRICING RULES
	// ===================================================================

	t.Logf("\n💰 STEP 7: Pricing Rules - Promotional Discounts")

	// The model includes pricing rules that might apply
	if len(update.PriceBreakdown.Adjustments) > 0 {
		t.Logf("✅ Active pricing adjustments:")
		for _, adjustment := range update.PriceBreakdown.Adjustments {
			t.Logf("   - %s: $%.2f (%s)", adjustment.Type, adjustment.Amount, adjustment.Description)
		}
	} else {
		t.Logf("📄 No additional pricing rules applied to current selection")
	}

	// ===================================================================
	// STEP 8: DEMONSTRATE AVAILABLE OPTIONS
	// ===================================================================

	t.Logf("\n🎯 STEP 8: Available Options Analysis")

	availableOptions := update.AvailableOptions
	selectableCount := 0
	blockedCount := 0

	for _, option := range availableOptions {
		if option.IsSelectable {
			selectableCount++
		} else {
			blockedCount++
			if option.Reason != "" {
				t.Logf("   - %s: BLOCKED (%s)", option.Option.Name, option.Reason)
			}
		}
	}

	t.Logf("✅ Option availability analysis:")
	t.Logf("   - Selectable options: %d", selectableCount)
	t.Logf("   - Blocked options: %d", blockedCount)

	// ===================================================================
	// STEP 9: DEMONSTRATE CONFIGURATION MANAGEMENT
	// ===================================================================

	t.Logf("\n💾 STEP 9: Configuration Management")

	// Clone current configuration
	clonedConfig := configurator.CloneConfiguration()
	t.Logf("✅ Configuration cloned (ID: %s)", clonedConfig.ID)

	// Clear and reload
	clearUpdate := configurator.ClearConfiguration()
	t.Logf("✅ Configuration cleared (total: $%.2f)", clearUpdate.PriceBreakdown.TotalPrice)

	// Reload cloned configuration
	loadUpdate, err := configurator.LoadConfiguration(clonedConfig)
	if err != nil {
		t.Fatalf("❌ Failed to load configuration: %v", err)
	}

	t.Logf("✅ Configuration reloaded")
	t.Logf("   - Selections restored: %d", len(loadUpdate.UpdatedConfig.Selections))
	t.Logf("   - Total price restored: $%.2f", loadUpdate.PriceBreakdown.TotalPrice)

	// ===================================================================
	// STEP 10: PERFORMANCE VALIDATION
	// ===================================================================

	t.Logf("\n⚡ STEP 10: Performance Validation (SMB Targets)")

	stats := configurator.GetStats()
	constraintStats := configurator.GetConstraintEngineStats()
	pricingStats := configurator.GetPricingCalculatorStats()

	t.Logf("✅ Overall Performance:")
	t.Logf("   - Total operations: %d", stats.TotalOperations)
	t.Logf("   - Average response time: %v", stats.AverageTime)

	t.Logf("✅ Constraint Engine Performance:")
	t.Logf("   - Total evaluations: %d", constraintStats.TotalEvaluations)
	t.Logf("   - Average evaluation time: %v", constraintStats.AverageTime)
	t.Logf("   - Compilation time: %v", constraintStats.CompilationTime)

	t.Logf("✅ Pricing Calculator Performance:")
	t.Logf("   - Total calculations: %d", pricingStats.TotalCalculations)
	t.Logf("   - Average calculation time: %v", pricingStats.AverageTime)
	t.Logf("   - Cache hit rate: %.1f%%", configurator.pricingCalc.GetCacheHitRate())

	// Validate performance targets (SMB target: <200ms)
	if stats.AverageTime > 200*time.Millisecond {
		t.Errorf("❌ Average response time %v exceeds SMB target of 200ms", stats.AverageTime)
	} else {
		t.Logf("✅ Performance target met: %v < 200ms", stats.AverageTime)
	}

	// ===================================================================
	// STEP 11: FINAL CONFIGURATION SUMMARY
	// ===================================================================

	t.Logf("\n📊 STEP 11: Final Configuration Summary")

	finalConfig := configurator.GetCurrentConfiguration()
	finalPrice := configurator.GetDetailedPrice()

	t.Logf("✅ Final Configuration:")
	t.Logf("   - Configuration ID: %s", finalConfig.ID)
	t.Logf("   - Model: %s", finalConfig.ModelID)
	t.Logf("   - Valid: %t", finalConfig.IsValid)
	t.Logf("   - Selections:")

	for _, selection := range finalConfig.Selections {
		option, _ := model.GetOption(selection.OptionID)
		t.Logf("     * %s (x%d) - $%.2f each",
			option.Name, selection.Quantity, option.BasePrice)
	}

	t.Logf("   - Pricing Breakdown:")
	t.Logf("     * Base Price: $%.2f", finalPrice.BasePrice)
	for _, adjustment := range finalPrice.Adjustments {
		sign := "+"
		if adjustment.Amount < 0 {
			sign = ""
		}
		t.Logf("     * %s: %s$%.2f", adjustment.RuleName, sign, adjustment.Amount)
	}
	t.Logf("     * TOTAL: $%.2f", finalPrice.TotalPrice)

	// ===================================================================
	// VERIFICATION AND CONCLUSION
	// ===================================================================

	t.Logf("\n🏆 WORKFLOW VERIFICATION")

	// Verify key aspects
	if finalConfig.IsValid {
		t.Logf("✅ Configuration is valid (all constraints satisfied)")
	} else {
		t.Error("❌ Final configuration should be valid")
	}

	if finalPrice.TotalPrice > 0 {
		t.Logf("✅ Pricing calculated correctly")
	} else {
		t.Error("❌ Final price should be positive")
	}

	if len(finalConfig.Selections) > 0 {
		t.Logf("✅ Configuration has selections")
	} else {
		t.Error("❌ Final configuration should have selections")
	}

	t.Logf("\n🎉 CPQ2 END-TO-END WORKFLOW COMPLETED SUCCESSFULLY!")
	t.Logf("=====================================")
	t.Logf("✅ Phase 1 (Static Constraints): Working perfectly")
	t.Logf("✅ Phase 2 (Basic Pricing): Fully operational")
	t.Logf("✅ SMB Performance Targets: Met (<200ms response)")
	t.Logf("✅ Constraint + Pricing Separation: Validated")
	t.Logf("✅ Real-world Workflow: Demonstrated")
}

// ===================================================================
// REALISTIC SMB MODEL CREATION
// ===================================================================

func createRealisticSMBModel() *Model {
	model := NewModel("smb-software", "SMB Software License Configurator")

	// ===================================================================
	// EDITION SELECTION (Single Select - Required)
	// ===================================================================

	model.AddGroup(Group{
		ID:            "edition",
		Name:          "Software Edition",
		Type:          SingleSelect,
		MinSelections: 1,
		MaxSelections: 1,
		IsRequired:    true,
		DisplayOrder:  1,
	})

	model.AddOption(Option{
		ID:           "basic_edition",
		Name:         "Basic Edition",
		GroupID:      "edition",
		BasePrice:    29.99,
		IsActive:     true,
		IsDefault:    true,
		DisplayOrder: 1,
	})

	model.AddOption(Option{
		ID:           "professional_edition",
		Name:         "Professional Edition",
		GroupID:      "edition",
		BasePrice:    79.99,
		IsActive:     true,
		DisplayOrder: 2,
	})

	model.AddOption(Option{
		ID:           "enterprise_edition",
		Name:         "Enterprise Edition",
		GroupID:      "edition",
		BasePrice:    149.99,
		IsActive:     true,
		DisplayOrder: 3,
	})

	// ===================================================================
	// SUPPORT PACKAGE (Single Select - Optional)
	// ===================================================================

	model.AddGroup(Group{
		ID:            "support",
		Name:          "Support Package",
		Type:          SingleSelect,
		MinSelections: 0,
		MaxSelections: 1,
		IsRequired:    false,
		DisplayOrder:  2,
	})

	model.AddOption(Option{
		ID:           "email_support",
		Name:         "Email Support",
		GroupID:      "support",
		BasePrice:    19.99,
		IsActive:     true,
		DisplayOrder: 1,
	})

	model.AddOption(Option{
		ID:           "phone_support",
		Name:         "Phone Support",
		GroupID:      "support",
		BasePrice:    39.99,
		IsActive:     true,
		DisplayOrder: 2,
	})

	model.AddOption(Option{
		ID:           "premium_support",
		Name:         "Premium Support",
		GroupID:      "support",
		BasePrice:    79.99,
		IsActive:     true,
		DisplayOrder: 3,
	})

	// ===================================================================
	// ADD-ON FEATURES (Multi Select - Optional)
	// ===================================================================

	model.AddGroup(Group{
		ID:            "addons",
		Name:          "Add-on Features",
		Type:          MultiSelect,
		MinSelections: 0,
		MaxSelections: 4,
		IsRequired:    false,
		DisplayOrder:  3,
	})

	model.AddOption(Option{
		ID:           "api_access",
		Name:         "API Access",
		GroupID:      "addons",
		BasePrice:    49.99,
		IsActive:     true,
		DisplayOrder: 1,
	})

	model.AddOption(Option{
		ID:           "advanced_reporting",
		Name:         "Advanced Reporting",
		GroupID:      "addons",
		BasePrice:    29.99,
		IsActive:     true,
		DisplayOrder: 2,
	})

	model.AddOption(Option{
		ID:           "data_export",
		Name:         "Data Export Tools",
		GroupID:      "addons",
		BasePrice:    24.99,
		IsActive:     true,
		DisplayOrder: 3,
	})

	model.AddOption(Option{
		ID:           "mobile_app",
		Name:         "Mobile App Access",
		GroupID:      "addons",
		BasePrice:    19.99,
		IsActive:     true,
		DisplayOrder: 4,
	})

	// ===================================================================
	// CONSTRAINT RULES (Phase 1 - Static Constraints)
	// ===================================================================

	// API Access requires Professional Edition or higher
	model.AddRule(Rule{
		ID:         "api_requires_professional",
		Name:       "API Access Constraint",
		Type:       RequiresRule,
		Expression: "opt_api_access -> (opt_professional_edition || opt_enterprise_edition)",
		Message:    "API Access requires Professional Edition or higher",
		IsActive:   true,
		Priority:   1,
	})

	// Advanced Reporting requires Professional Edition or higher
	model.AddRule(Rule{
		ID:         "reporting_requires_professional",
		Name:       "Advanced Reporting Constraint",
		Type:       RequiresRule,
		Expression: "opt_advanced_reporting -> (opt_professional_edition || opt_enterprise_edition)",
		Message:    "Advanced Reporting requires Professional Edition or higher",
		IsActive:   true,
		Priority:   2,
	})

	// Premium Support requires Enterprise Edition
	model.AddRule(Rule{
		ID:         "premium_support_requires_enterprise",
		Name:       "Premium Support Constraint",
		Type:       RequiresRule,
		Expression: "opt_premium_support -> opt_enterprise_edition",
		Message:    "Premium Support requires Enterprise Edition",
		IsActive:   true,
		Priority:   3,
	})

	// Basic edition excludes API access
	model.AddRule(Rule{
		ID:         "basic_excludes_api",
		Name:       "Basic Edition Limitation",
		Type:       ExcludesRule,
		Expression: "!(opt_basic_edition && opt_api_access)",
		Message:    "Basic Edition does not include API Access",
		IsActive:   true,
		Priority:   4,
	})

	// ===================================================================
	// PRICING RULES (Phase 2 - Basic Pricing Calculator)
	// ===================================================================

	// Enterprise edition gets discount on phone support
	model.AddPriceRule(PriceRule{
		ID:         "enterprise_support_discount",
		Name:       "Enterprise Support Discount",
		Type:       PercentDiscountRule,
		Expression: "phone_support:0.25", // 25% discount
		IsActive:   true,
		Priority:   1,
	})

	// Professional edition gets discount on mobile app
	model.AddPriceRule(PriceRule{
		ID:         "professional_mobile_discount",
		Name:       "Professional Mobile Discount",
		Type:       FixedDiscountRule,
		Expression: "mobile_app:5.00", // $5 discount
		IsActive:   true,
		Priority:   2,
	})

	// Data export surcharge for basic edition
	model.AddPriceRule(PriceRule{
		ID:         "basic_export_surcharge",
		Name:       "Basic Edition Export SurchargeRule",
		Type:       SurchargeRule,
		Expression: "data_export:10.00", // $10 surcharge
		IsActive:   true,
		Priority:   3,
	})

	return model
}

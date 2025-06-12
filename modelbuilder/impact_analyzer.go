// impact_analyzer.go - Rule Change Impact Analysis using CPQ Configurator
// Part of Model Building Tools for CPQ Platform Layer
// Performance target: <500ms for comprehensive configuration testing

package modelbuilder

import (
	"fmt"
	"sort"
	"time"

	"DD/cpq"
)

// ===================================================================
// IMPACT ANALYSIS
// ===================================================================

// ConfigurationChange represents a change in configuration validity or pricing
type ConfigurationChange struct {
	ConfigurationID string                `json:"configuration_id"`
	ChangeType      string                `json:"change_type"` // "validity", "pricing", "options"
	Before          ConfigurationSnapshot `json:"before"`
	After           ConfigurationSnapshot `json:"after"`
	Impact          string                `json:"impact"` // "broken", "fixed", "price_increase", "price_decrease"
	Details         string                `json:"details"`
}

// ConfigurationSnapshot captures state before/after rule changes
type ConfigurationSnapshot struct {
	IsValid        bool                `json:"is_valid"`
	TotalPrice     float64             `json:"total_price"`
	Violations     []cpq.RuleViolation `json:"violations"`
	AvailableCount int                 `json:"available_options_count"`
	Selections     []cpq.Selection     `json:"selections"`
}

// ImpactAnalysis contains comprehensive analysis of rule change effects
type ImpactAnalysis struct {
	RuleChange             RuleChangeDescription `json:"rule_change"`
	TotalConfigurations    int                   `json:"total_configurations"`
	AffectedConfigurations int                   `json:"affected_configurations"`
	ValidityChanges        []ConfigurationChange `json:"validity_changes"`
	PricingChanges         []ConfigurationChange `json:"pricing_changes"`
	OptionChanges          []ConfigurationChange `json:"option_changes"`
	Summary                ImpactSummary         `json:"summary"`
	RecommendedActions     []string              `json:"recommended_actions"`
	AnalysisTime           time.Duration         `json:"analysis_time"`
	TestCoverage           TestCoverageStats     `json:"test_coverage"`
}

// RuleChangeDescription describes what rule change is being analyzed
type RuleChangeDescription struct {
	Type        string    `json:"type"` // "add", "modify", "remove"
	RuleID      string    `json:"rule_id"`
	RuleName    string    `json:"rule_name"`
	OldRule     *cpq.Rule `json:"old_rule,omitempty"`
	NewRule     *cpq.Rule `json:"new_rule,omitempty"`
	Description string    `json:"description"`
}

// ImpactSummary provides high-level impact statistics
type ImpactSummary struct {
	ConfigurationsBroken int `json:"configurations_broken"`
	ConfigurationsFixed  int `json:"configurations_fixed"`
	PriceIncreases       int `json:"price_increases"`
	PriceDecreases       int `json:"price_decreases"`
	OptionsRestricted    int `json:"options_restricted"`
	OptionsExpanded      int `json:"options_expanded"`
	TotalImpactScore     int `json:"total_impact_score"` // 0-100 scale
}

// TestCoverageStats shows how comprehensive the impact analysis was
type TestCoverageStats struct {
	GroupsCovered      int           `json:"groups_covered"`
	OptionsCovered     int           `json:"options_covered"`
	CombinationsTested int           `json:"combinations_tested"`
	CoveragePercentage float64       `json:"coverage_percentage"`
	TestGenerationTime time.Duration `json:"test_generation_time"`
}

// ImpactAnalyzer analyzes how rule changes affect existing configurations
type ImpactAnalyzer struct {
	model                *cpq.Model
	originalConfigurator *cpq.Configurator
	testConfigurations   []cpq.Configuration
	testGenerator        *TestConfigurationGenerator
}

// TestConfigurationGenerator creates comprehensive test configurations
type TestConfigurationGenerator struct {
	model           *cpq.Model
	maxCombinations int
	groupCoverage   bool
	optionCoverage  bool
}

// NewImpactAnalyzer creates a new impact analyzer
func NewImpactAnalyzer(model *cpq.Model) (*ImpactAnalyzer, error) {
	if model == nil {
		return nil, fmt.Errorf("model cannot be nil")
	}

	// Create original configurator for baseline testing
	originalConfigurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create original configurator: %w", err)
	}

	analyzer := &ImpactAnalyzer{
		model:                model,
		originalConfigurator: originalConfigurator,
		testGenerator: &TestConfigurationGenerator{
			model:           model,
			maxCombinations: 1000, // Configurable limit for performance
			groupCoverage:   true,
			optionCoverage:  true,
		},
	}

	return analyzer, nil
}

// AnalyzeRuleChange performs comprehensive impact analysis for a rule change
func (ia *ImpactAnalyzer) AnalyzeRuleChange(changeType string, oldRule *cpq.Rule, newRule *cpq.Rule) (*ImpactAnalysis, error) {
	startTime := time.Now()

	// 1. Generate comprehensive test configurations
	testConfigs, coverage, err := ia.generateTestConfigurations()
	if err != nil {
		return nil, fmt.Errorf("failed to generate test configurations: %w", err)
	}

	// 2. Create rule change description
	ruleChange := ia.createRuleChangeDescription(changeType, oldRule, newRule)

	// 3. Create modified model for comparison
	modifiedModel, err := ia.createModifiedModel(changeType, oldRule, newRule)
	if err != nil {
		return nil, fmt.Errorf("failed to create modified model: %w", err)
	}

	// 4. Create configurator with modified model
	modifiedConfigurator, err := cpq.NewConfigurator(modifiedModel)
	if err != nil {
		return nil, fmt.Errorf("failed to create modified configurator: %w", err)
	}

	// 5. Compare configurations between original and modified models
	validityChanges, pricingChanges, optionChanges, err := ia.compareConfigurations(
		testConfigs, ia.originalConfigurator, modifiedConfigurator)
	if err != nil {
		return nil, fmt.Errorf("failed to compare configurations: %w", err)
	}

	// 6. Generate summary and recommendations
	summary := ia.generateSummary(validityChanges, pricingChanges, optionChanges)
	recommendations := ia.generateRecommendations(ruleChange, summary, validityChanges, pricingChanges)

	analysis := &ImpactAnalysis{
		RuleChange:             ruleChange,
		TotalConfigurations:    len(testConfigs),
		AffectedConfigurations: len(validityChanges) + len(pricingChanges) + len(optionChanges),
		ValidityChanges:        validityChanges,
		PricingChanges:         pricingChanges,
		OptionChanges:          optionChanges,
		Summary:                summary,
		RecommendedActions:     recommendations,
		AnalysisTime:           time.Since(startTime),
		TestCoverage:           coverage,
	}

	return analysis, nil
}

// generateTestConfigurations creates comprehensive test configurations covering the model
func (ia *ImpactAnalyzer) generateTestConfigurations() ([]cpq.Configuration, TestCoverageStats, error) {
	startTime := time.Now()

	var testConfigs []cpq.Configuration

	// 1. Generate single-option configurations (individual coverage)
	singleOptionConfigs := ia.generateSingleOptionConfigurations()
	testConfigs = append(testConfigs, singleOptionConfigs...)

	// 2. Generate group-based configurations (group coverage)
	groupConfigs := ia.generateGroupBasedConfigurations()
	testConfigs = append(testConfigs, groupConfigs...)

	// 3. Generate random combinations (combination coverage)
	randomConfigs := ia.generateRandomCombinations(200) // Limit for performance
	testConfigs = append(testConfigs, randomConfigs...)

	// 4. Generate edge case configurations
	edgeCaseConfigs := ia.generateEdgeCaseConfigurations()
	testConfigs = append(testConfigs, edgeCaseConfigs...)

	// Remove duplicates and validate
	uniqueConfigs := ia.removeDuplicateConfigurations(testConfigs)

	// Calculate coverage statistics
	coverage := TestCoverageStats{
		GroupsCovered:      ia.countGroupsCovered(uniqueConfigs),
		OptionsCovered:     ia.countOptionsCovered(uniqueConfigs),
		CombinationsTested: len(uniqueConfigs),
		CoveragePercentage: ia.calculateCoveragePercentage(uniqueConfigs),
		TestGenerationTime: time.Since(startTime),
	}

	return uniqueConfigs, coverage, nil
}

// compareConfigurations compares test configurations between original and modified models
func (ia *ImpactAnalyzer) compareConfigurations(testConfigs []cpq.Configuration,
	originalConfig, modifiedConfig *cpq.Configurator) ([]ConfigurationChange, []ConfigurationChange, []ConfigurationChange, error) {

	var validityChanges []ConfigurationChange
	var pricingChanges []ConfigurationChange
	var optionChanges []ConfigurationChange

	for i, config := range testConfigs {
		configID := fmt.Sprintf("test_config_%d", i)

		// Test with original model
		originalSnapshot, err := ia.createConfigurationSnapshot(config, originalConfig)
		if err != nil {
			continue // Skip configurations that can't be tested
		}

		// Test with modified model
		modifiedSnapshot, err := ia.createConfigurationSnapshot(config, modifiedConfig)
		if err != nil {
			continue // Skip configurations that can't be tested
		}

		// Compare validity
		if originalSnapshot.IsValid != modifiedSnapshot.IsValid {
			change := ConfigurationChange{
				ConfigurationID: configID,
				ChangeType:      "validity",
				Before:          originalSnapshot,
				After:           modifiedSnapshot,
				Impact:          ia.determineValidityImpact(originalSnapshot, modifiedSnapshot),
				Details:         ia.generateValidityChangeDetails(originalSnapshot, modifiedSnapshot),
			}
			validityChanges = append(validityChanges, change)
		}

		// Compare pricing (only for valid configurations)
		if originalSnapshot.IsValid && modifiedSnapshot.IsValid {
			priceDiff := modifiedSnapshot.TotalPrice - originalSnapshot.TotalPrice
			if !floatsEqual(originalSnapshot.TotalPrice, modifiedSnapshot.TotalPrice) {
				change := ConfigurationChange{
					ConfigurationID: configID,
					ChangeType:      "pricing",
					Before:          originalSnapshot,
					After:           modifiedSnapshot,
					Impact:          ia.determinePricingImpact(priceDiff),
					Details:         fmt.Sprintf("Price changed by $%.2f", priceDiff),
				}
				pricingChanges = append(pricingChanges, change)
			}
		}

		// Compare available options
		if originalSnapshot.AvailableCount != modifiedSnapshot.AvailableCount {
			change := ConfigurationChange{
				ConfigurationID: configID,
				ChangeType:      "options",
				Before:          originalSnapshot,
				After:           modifiedSnapshot,
				Impact:          ia.determineOptionsImpact(originalSnapshot, modifiedSnapshot),
				Details: fmt.Sprintf("Available options changed from %d to %d",
					originalSnapshot.AvailableCount, modifiedSnapshot.AvailableCount),
			}
			optionChanges = append(optionChanges, change)
		}
	}

	return validityChanges, pricingChanges, optionChanges, nil
}

// Helper methods for configuration generation

func (ia *ImpactAnalyzer) generateSingleOptionConfigurations() []cpq.Configuration {
	var configs []cpq.Configuration

	for _, option := range ia.model.Options {
		config := cpq.Configuration{
			ID:         fmt.Sprintf("single_%s", option.ID),
			ModelID:    ia.model.ID,
			Selections: []cpq.Selection{{OptionID: option.ID, Quantity: 1}},
			IsValid:    false, // Will be determined during testing
		}
		configs = append(configs, config)
	}

	return configs
}

func (ia *ImpactAnalyzer) generateGroupBasedConfigurations() []cpq.Configuration {
	var configs []cpq.Configuration

	for _, group := range ia.model.Groups {
		// Get options for this group
		groupOptions := ia.getOptionsForGroup(group.ID)

		// Generate configurations based on group type
		switch group.Type {
		case cpq.SingleSelect:
			// One configuration per option in the group
			for _, option := range groupOptions {
				config := cpq.Configuration{
					ID:         fmt.Sprintf("group_%s_option_%s", group.ID, option.ID),
					ModelID:    ia.model.ID,
					Selections: []cpq.Selection{{OptionID: option.ID, Quantity: 1}},
					IsValid:    false,
				}
				configs = append(configs, config)
			}
		case cpq.MultiSelect:
			// Multiple configurations with different combinations
			if len(groupOptions) > 1 {
				// Two options
				config := cpq.Configuration{
					ID:      fmt.Sprintf("group_%s_multi_2", group.ID),
					ModelID: ia.model.ID,
					Selections: []cpq.Selection{
						{OptionID: groupOptions[0].ID, Quantity: 1},
						{OptionID: groupOptions[1].ID, Quantity: 1},
					},
					IsValid: false,
				}
				configs = append(configs, config)
			}
		}
	}

	return configs
}

func (ia *ImpactAnalyzer) generateRandomCombinations(maxCount int) []cpq.Configuration {
	var configs []cpq.Configuration

	for i := 0; i < maxCount && i < len(ia.model.Options)*2; i++ {
		// Randomly select 1-5 options
		numSelections := 1 + (i % 5)
		var selections []cpq.Selection

		for j := 0; j < numSelections && j < len(ia.model.Options); j++ {
			optionIndex := (i + j) % len(ia.model.Options)
			selection := cpq.Selection{
				OptionID: ia.model.Options[optionIndex].ID,
				Quantity: 1,
			}
			selections = append(selections, selection)
		}

		config := cpq.Configuration{
			ID:         fmt.Sprintf("random_%d", i),
			ModelID:    ia.model.ID,
			Selections: selections,
			IsValid:    false,
		}
		configs = append(configs, config)
	}

	return configs
}

func (ia *ImpactAnalyzer) generateEdgeCaseConfigurations() []cpq.Configuration {
	var configs []cpq.Configuration

	// Empty configuration
	emptyConfig := cpq.Configuration{
		ID:         "empty_config",
		ModelID:    ia.model.ID,
		Selections: []cpq.Selection{},
		IsValid:    false,
	}
	configs = append(configs, emptyConfig)

	// All options configuration (stress test)
	var allSelections []cpq.Selection
	for _, option := range ia.model.Options {
		allSelections = append(allSelections, cpq.Selection{
			OptionID: option.ID,
			Quantity: 1,
		})
	}

	allConfig := cpq.Configuration{
		ID:         "all_options_config",
		ModelID:    ia.model.ID,
		Selections: allSelections,
		IsValid:    false,
	}
	configs = append(configs, allConfig)

	return configs
}

// Helper methods for analysis

func (ia *ImpactAnalyzer) createConfigurationSnapshot(config cpq.Configuration, configurator *cpq.Configurator) (ConfigurationSnapshot, error) {
	// Reset configurator to clean state
	configurator.ClearConfiguration()

	var finalUpdate cpq.ConfigurationUpdate
	var finalErr error

	// Apply all selections and track the final state
	for _, selection := range config.Selections {
		update, err := configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			// If we can't add the selection, create a snapshot with error state
			return ConfigurationSnapshot{
				IsValid:        false,
				TotalPrice:     0,
				Violations:     []cpq.RuleViolation{{Message: fmt.Sprintf("Failed to add selection: %v", err)}},
				AvailableCount: 0,
				Selections:     config.Selections,
			}, nil
		}
		finalUpdate = update
		finalErr = err
	}

	// If no selections were applied, get the current empty state
	if len(config.Selections) == 0 {
		finalUpdate = configurator.ClearConfiguration() // This gives us the empty state
	}

	// Create snapshot from the final configuration update
	snapshot := ConfigurationSnapshot{
		IsValid:        finalUpdate.IsValid,
		TotalPrice:     finalUpdate.PriceBreakdown.TotalPrice,
		Violations:     finalUpdate.ValidationResult.Violations,
		AvailableCount: len(finalUpdate.AvailableOptions),
		Selections:     finalUpdate.UpdatedConfig.Selections,
	}

	return snapshot, finalErr
}

func (ia *ImpactAnalyzer) createRuleChangeDescription(changeType string, oldRule *cpq.Rule, newRule *cpq.Rule) RuleChangeDescription {
	desc := RuleChangeDescription{
		Type:    changeType,
		OldRule: oldRule,
		NewRule: newRule,
	}

	switch changeType {
	case "add":
		desc.RuleID = newRule.ID
		desc.RuleName = newRule.Name
		desc.Description = fmt.Sprintf("Adding new rule: %s", newRule.Name)
	case "modify":
		desc.RuleID = newRule.ID
		desc.RuleName = newRule.Name
		desc.Description = fmt.Sprintf("Modifying rule: %s", newRule.Name)
	case "remove":
		desc.RuleID = oldRule.ID
		desc.RuleName = oldRule.Name
		desc.Description = fmt.Sprintf("Removing rule: %s", oldRule.Name)
	}

	return desc
}

func (ia *ImpactAnalyzer) createModifiedModel(changeType string, oldRule *cpq.Rule, newRule *cpq.Rule) (*cpq.Model, error) {
	// Create a copy of the original model
	modifiedModel := &cpq.Model{
		ID:          ia.model.ID + "_modified",
		Name:        ia.model.Name + " (Modified)",
		Description: ia.model.Description,
		Version:     ia.model.Version,
		Groups:      make([]cpq.Group, len(ia.model.Groups)),
		Options:     make([]cpq.Option, len(ia.model.Options)),
		Rules:       make([]cpq.Rule, 0, len(ia.model.Rules)),
		PriceRules:  make([]cpq.PriceRule, len(ia.model.PriceRules)),
		CreatedAt:   ia.model.CreatedAt,
		UpdatedAt:   time.Now(),
		IsActive:    ia.model.IsActive,
	}

	// Copy groups, options, and price rules
	copy(modifiedModel.Groups, ia.model.Groups)
	copy(modifiedModel.Options, ia.model.Options)
	copy(modifiedModel.PriceRules, ia.model.PriceRules)

	// Apply rule changes
	switch changeType {
	case "add":
		// Copy all existing rules and add the new one
		modifiedModel.Rules = append(modifiedModel.Rules, ia.model.Rules...)
		modifiedModel.Rules = append(modifiedModel.Rules, *newRule)
	case "modify":
		// Copy all rules except the one being modified, then add the modified version
		for _, rule := range ia.model.Rules {
			if rule.ID != oldRule.ID {
				modifiedModel.Rules = append(modifiedModel.Rules, rule)
			}
		}
		modifiedModel.Rules = append(modifiedModel.Rules, *newRule)
	case "remove":
		// Copy all rules except the one being removed
		for _, rule := range ia.model.Rules {
			if rule.ID != oldRule.ID {
				modifiedModel.Rules = append(modifiedModel.Rules, rule)
			}
		}
	default:
		return nil, fmt.Errorf("unsupported change type: %s", changeType)
	}

	return modifiedModel, nil
}

// Additional helper methods

func (ia *ImpactAnalyzer) getOptionsForGroup(groupID string) []cpq.Option {
	var options []cpq.Option
	for _, option := range ia.model.Options {
		if option.GroupID == groupID {
			options = append(options, option)
		}
	}
	return options
}

func (ia *ImpactAnalyzer) removeDuplicateConfigurations(configs []cpq.Configuration) []cpq.Configuration {
	seen := make(map[string]bool)
	var unique []cpq.Configuration

	for _, config := range configs {
		// Create a key based on selections
		key := ia.configurationKey(config)
		if !seen[key] {
			seen[key] = true
			unique = append(unique, config)
		}
	}

	return unique
}

func (ia *ImpactAnalyzer) configurationKey(config cpq.Configuration) string {
	// Sort selections for consistent key generation
	selections := make([]cpq.Selection, len(config.Selections))
	copy(selections, config.Selections)

	sort.Slice(selections, func(i, j int) bool {
		return selections[i].OptionID < selections[j].OptionID
	})

	key := ""
	for _, sel := range selections {
		key += fmt.Sprintf("%s:%d;", sel.OptionID, sel.Quantity)
	}
	return key
}

func (ia *ImpactAnalyzer) countGroupsCovered(configs []cpq.Configuration) int {
	groupsCovered := make(map[string]bool)
	for _, config := range configs {
		for _, selection := range config.Selections {
			// Find which group this option belongs to
			for _, option := range ia.model.Options {
				if option.ID == selection.OptionID {
					groupsCovered[option.GroupID] = true
					break
				}
			}
		}
	}
	return len(groupsCovered)
}

func (ia *ImpactAnalyzer) countOptionsCovered(configs []cpq.Configuration) int {
	optionsCovered := make(map[string]bool)
	for _, config := range configs {
		for _, selection := range config.Selections {
			optionsCovered[selection.OptionID] = true
		}
	}
	return len(optionsCovered)
}

func (ia *ImpactAnalyzer) calculateCoveragePercentage(configs []cpq.Configuration) float64 {
	totalOptions := len(ia.model.Options)
	if totalOptions == 0 {
		return 100.0
	}

	optionsCovered := ia.countOptionsCovered(configs)
	return float64(optionsCovered) / float64(totalOptions) * 100.0
}

func (ia *ImpactAnalyzer) determineValidityImpact(before, after ConfigurationSnapshot) string {
	if before.IsValid && !after.IsValid {
		return "broken"
	} else if !before.IsValid && after.IsValid {
		return "fixed"
	}
	return "unchanged"
}

func (ia *ImpactAnalyzer) determinePricingImpact(priceDiff float64) string {
	if priceDiff > 0.01 { // More than 1 cent increase
		return "price_increase"
	} else if priceDiff < -0.01 { // More than 1 cent decrease
		return "price_decrease"
	}
	return "price_unchanged"
}

func (ia *ImpactAnalyzer) determineOptionsImpact(before, after ConfigurationSnapshot) string {
	if before.AvailableCount > after.AvailableCount {
		return "options_restricted"
	} else if before.AvailableCount < after.AvailableCount {
		return "options_expanded"
	}
	return "options_unchanged"
}

func (ia *ImpactAnalyzer) generateValidityChangeDetails(before, after ConfigurationSnapshot) string {
	if before.IsValid && !after.IsValid {
		return fmt.Sprintf("Configuration became invalid. New violations: %d", len(after.Violations))
	} else if !before.IsValid && after.IsValid {
		return fmt.Sprintf("Configuration became valid. Resolved violations: %d", len(before.Violations))
	}
	return "No validity change"
}

func (ia *ImpactAnalyzer) generateSummary(validityChanges, pricingChanges, optionChanges []ConfigurationChange) ImpactSummary {
	summary := ImpactSummary{}

	// Count validity impacts
	for _, change := range validityChanges {
		switch change.Impact {
		case "broken":
			summary.ConfigurationsBroken++
		case "fixed":
			summary.ConfigurationsFixed++
		}
	}

	// Count pricing impacts
	for _, change := range pricingChanges {
		switch change.Impact {
		case "price_increase":
			summary.PriceIncreases++
		case "price_decrease":
			summary.PriceDecreases++
		}
	}

	// Count option impacts
	for _, change := range optionChanges {
		switch change.Impact {
		case "options_restricted":
			summary.OptionsRestricted++
		case "options_expanded":
			summary.OptionsExpanded++
		}
	}

	// Calculate total impact score (0-100)
	totalChanges := len(validityChanges) + len(pricingChanges) + len(optionChanges)
	if totalChanges == 0 {
		summary.TotalImpactScore = 0
	} else {
		// Weight different types of changes
		criticalScore := summary.ConfigurationsBroken * 10
		moderateScore := (summary.PriceIncreases + summary.OptionsRestricted) * 5
		positiveScore := (summary.ConfigurationsFixed + summary.PriceDecreases + summary.OptionsExpanded) * 2

		rawScore := criticalScore + moderateScore - positiveScore
		summary.TotalImpactScore = min(100, max(0, rawScore))
	}

	return summary
}

func (ia *ImpactAnalyzer) generateRecommendations(ruleChange RuleChangeDescription, summary ImpactSummary,
	validityChanges, pricingChanges []ConfigurationChange) []string {

	var recommendations []string

	// High impact recommendations
	if summary.ConfigurationsBroken > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("CRITICAL: %d configurations will be broken by this change. Review before deployment.",
				summary.ConfigurationsBroken))
	}

	if summary.TotalImpactScore > 50 {
		recommendations = append(recommendations,
			"HIGH IMPACT: This change significantly affects existing configurations. Consider phased rollout.")
	}

	// Specific recommendations based on change type
	if ruleChange.Type == "add" && summary.OptionsRestricted > 0 {
		recommendations = append(recommendations,
			"New rule restricts configuration options. Notify users of reduced flexibility.")
	}

	if summary.PriceIncreases > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("%d configurations will have price increases. Consider customer communication.",
				summary.PriceIncreases))
	}

	// Positive impacts
	if summary.ConfigurationsFixed > 0 {
		recommendations = append(recommendations,
			fmt.Sprintf("POSITIVE: %d previously invalid configurations will become valid.",
				summary.ConfigurationsFixed))
	}

	// Default recommendation
	if len(recommendations) == 0 {
		recommendations = append(recommendations,
			"Low impact change detected. Safe to deploy with standard testing.")
	}

	return recommendations
}

// Utility functions
func abs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}

// floatsEqual compares two floats for equality within a small tolerance
func floatsEqual(a, b float64) bool {
	return abs(a-b) < 0.01 // Tolerance of 1 cent for pricing
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

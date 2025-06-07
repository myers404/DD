// configuration_operations.go
// Configuration operations and builder patterns for CPQ system
// Provides fluent API for building and manipulating configurations with validation

package cpq

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// ConfigurationOperations provides high-level operations for configuration management
type ConfigurationOperations struct {
	engine           *ConfigurationEngine
	mtbddConfig      *MTBDDConfiguration
	operationHistory []OperationRecord
	mutex            sync.RWMutex
	metrics          *OperationsMetrics
	options          OperationsOptions
}

// ConfigurationBuilder provides a fluent interface for building configurations
type ConfigurationBuilder struct {
	model      *Model
	operations *ConfigurationOperations
	selections []Selection
	context    *ConfigurationContext
	buildSteps []BuildStep
	errors     []error
	metadata   map[string]interface{}
	config     BuilderConfig
}

// OperationRecord tracks configuration operations for audit and debugging
type OperationRecord struct {
	ID          string                 `json:"id"`
	Type        string                 `json:"type"`
	Timestamp   time.Time              `json:"timestamp"`
	UserID      string                 `json:"user_id,omitempty"`
	SessionID   string                 `json:"session_id,omitempty"`
	Description string                 `json:"description"`
	BeforeState *Configuration         `json:"before_state,omitempty"`
	AfterState  *Configuration         `json:"after_state,omitempty"`
	Success     bool                   `json:"success"`
	Error       string                 `json:"error,omitempty"`
	Duration    time.Duration          `json:"duration"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// BuildStep represents a step in the configuration building process
type BuildStep struct {
	StepNumber  int                    `json:"step_number"`
	Type        string                 `json:"type"`
	Description string                 `json:"description"`
	Success     bool                   `json:"success"`
	Timestamp   time.Time              `json:"timestamp"`
	Data        interface{}            `json:"data,omitempty"`
	Error       string                 `json:"error,omitempty"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// OperationsMetrics tracks operations performance
type OperationsMetrics struct {
	TotalOperations  int64         `json:"total_operations"`
	SuccessfulBuilds int64         `json:"successful_builds"`
	FailedBuilds     int64         `json:"failed_builds"`
	AverageBuildTime time.Duration `json:"average_build_time"`
	TotalBuildTime   time.Duration `json:"total_build_time"`
	CacheHitRate     float64       `json:"cache_hit_rate"`
	mutex            sync.Mutex
}

// OperationsOptions configures operations behavior
type OperationsOptions struct {
	EnableAuditTrail   bool          `json:"enable_audit_trail"`
	MaxHistorySize     int           `json:"max_history_size"`
	EnableMetrics      bool          `json:"enable_metrics"`
	ValidateOnEachStep bool          `json:"validate_on_each_step"`
	AutoCorrectEnabled bool          `json:"auto_correct_enabled"`
	TimeoutDuration    time.Duration `json:"timeout_duration"`
}

// BuilderConfig configures builder behavior
type BuilderConfig struct {
	StrictValidation     bool `json:"strict_validation"`
	AllowPartialBuilds   bool `json:"allow_partial_builds"`
	AutoSatisfyRequired  bool `json:"auto_satisfy_required"`
	EnableOptimizations  bool `json:"enable_optimizations"`
	ValidateAfterEachAdd bool `json:"validate_after_each_add"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewConfigurationOperations creates a new configuration operations manager
func NewConfigurationOperations(engine *ConfigurationEngine, mtbddConfig *MTBDDConfiguration) *ConfigurationOperations {
	return &ConfigurationOperations{
		engine:           engine,
		mtbddConfig:      mtbddConfig,
		operationHistory: make([]OperationRecord, 0, 1000),
		metrics:          NewOperationsMetrics(),
		options: OperationsOptions{
			EnableAuditTrail:   true,
			MaxHistorySize:     1000,
			EnableMetrics:      true,
			ValidateOnEachStep: false,
			AutoCorrectEnabled: true,
			TimeoutDuration:    30 * time.Second,
		},
	}
}

// NewOperationsMetrics creates a new operations metrics tracker
func NewOperationsMetrics() *OperationsMetrics {
	return &OperationsMetrics{}
}

// ===================================================================
// CONFIGURATION BUILDING
// ===================================================================

// NewConfigurationBuilder creates a new configuration builder
func (ops *ConfigurationOperations) NewConfigurationBuilder(model *Model) *ConfigurationBuilder {
	return &ConfigurationBuilder{
		model:      model,
		operations: ops,
		selections: make([]Selection, 0),
		buildSteps: make([]BuildStep, 0),
		errors:     make([]error, 0),
		metadata:   make(map[string]interface{}),
		config: BuilderConfig{
			StrictValidation:     true,
			AllowPartialBuilds:   false,
			AutoSatisfyRequired:  true,
			EnableOptimizations:  true,
			ValidateAfterEachAdd: false,
		},
	}
}

// WithContext sets the configuration context
func (builder *ConfigurationBuilder) WithContext(context *ConfigurationContext) *ConfigurationBuilder {
	builder.context = context
	builder.addBuildStep("set_context", "Configuration context set", true, context)
	return builder
}

// WithConfig sets builder configuration options
func (builder *ConfigurationBuilder) WithConfig(config BuilderConfig) *ConfigurationBuilder {
	builder.config = config
	builder.addBuildStep("set_config", "Builder configuration set", true, config)
	return builder
}

// AddSelection adds a selection to the configuration
func (builder *ConfigurationBuilder) AddSelection(optionID string, quantity int) *ConfigurationBuilder {
	selection := Selection{
		OptionID: optionID,
		Quantity: quantity,
		Metadata: make(map[string]interface{}),
	}

	// Validate selection before adding if enabled
	if builder.config.ValidateAfterEachAdd {
		testSelections := append(builder.selections, selection)
		isValid, err := builder.operations.engine.IsValidCombination(testSelections)

		if err != nil {
			builder.errors = append(builder.errors, fmt.Errorf("failed to validate selection %s: %w", optionID, err))
			builder.addBuildStep("add_selection_failed", fmt.Sprintf("Failed to add %s", optionID), false, selection)
			return builder
		}

		if !isValid && builder.config.StrictValidation {
			builder.errors = append(builder.errors, fmt.Errorf("selection %s creates invalid configuration", optionID))
			builder.addBuildStep("add_selection_invalid", fmt.Sprintf("Invalid selection %s", optionID), false, selection)
			return builder
		}
	}

	// Find and update existing selection or add new one
	found := false
	for i, existing := range builder.selections {
		if existing.OptionID == optionID {
			builder.selections[i].Quantity = quantity
			found = true
			break
		}
	}

	if !found {
		builder.selections = append(builder.selections, selection)
	}

	builder.addBuildStep("add_selection", fmt.Sprintf("Added %s (qty: %d)", optionID, quantity), true, selection)
	return builder
}

// AddMultipleSelections adds multiple selections at once
func (builder *ConfigurationBuilder) AddMultipleSelections(selections []Selection) *ConfigurationBuilder {
	for _, selection := range selections {
		builder.AddSelection(selection.OptionID, selection.Quantity)
	}
	return builder
}

// AddSelectionFromGroup adds the first available option from a group
func (builder *ConfigurationBuilder) AddSelectionFromGroup(groupID string, quantity int) *ConfigurationBuilder {
	availableOptions, err := builder.operations.engine.GetAvailableOptions(groupID, builder.selections)
	if err != nil {
		builder.errors = append(builder.errors, fmt.Errorf("failed to get options for group %s: %w", groupID, err))
		builder.addBuildStep("add_from_group_failed", fmt.Sprintf("Failed to get options from group %s", groupID), false, groupID)
		return builder
	}

	if len(availableOptions) == 0 {
		builder.errors = append(builder.errors, fmt.Errorf("no available options in group %s", groupID))
		builder.addBuildStep("add_from_group_empty", fmt.Sprintf("No options available in group %s", groupID), false, groupID)
		return builder
	}

	// Add the first available option (could be enhanced with selection strategy)
	firstOption := availableOptions[0]
	return builder.AddSelection(firstOption.ID, quantity)
}

// RemoveSelection removes a selection from the configuration
func (builder *ConfigurationBuilder) RemoveSelection(optionID string) *ConfigurationBuilder {
	var newSelections []Selection
	removed := false

	for _, selection := range builder.selections {
		if selection.OptionID != optionID {
			newSelections = append(newSelections, selection)
		} else {
			removed = true
		}
	}

	if !removed {
		builder.errors = append(builder.errors, fmt.Errorf("selection %s not found", optionID))
		builder.addBuildStep("remove_selection_not_found", fmt.Sprintf("Selection %s not found", optionID), false, optionID)
		return builder
	}

	builder.selections = newSelections
	builder.addBuildStep("remove_selection", fmt.Sprintf("Removed %s", optionID), true, optionID)
	return builder
}

// ClearSelections removes all selections
func (builder *ConfigurationBuilder) ClearSelections() *ConfigurationBuilder {
	cleared := len(builder.selections)
	builder.selections = make([]Selection, 0)
	builder.addBuildStep("clear_selections", fmt.Sprintf("Cleared %d selections", cleared), true, cleared)
	return builder
}

// SetQuantity updates the quantity for an existing selection
func (builder *ConfigurationBuilder) SetQuantity(optionID string, quantity int) *ConfigurationBuilder {
	found := false
	for i, selection := range builder.selections {
		if selection.OptionID == optionID {
			oldQuantity := selection.Quantity
			builder.selections[i].Quantity = quantity
			found = true
			builder.addBuildStep("set_quantity", fmt.Sprintf("Updated %s quantity: %d -> %d", optionID, oldQuantity, quantity), true, map[string]interface{}{
				"option_id":    optionID,
				"old_quantity": oldQuantity,
				"new_quantity": quantity,
			})
			break
		}
	}

	if !found {
		builder.errors = append(builder.errors, fmt.Errorf("selection %s not found for quantity update", optionID))
		builder.addBuildStep("set_quantity_failed", fmt.Sprintf("Selection %s not found", optionID), false, optionID)
	}

	return builder
}

// SatisfyRequiredGroups automatically adds selections for required groups
func (builder *ConfigurationBuilder) SatisfyRequiredGroups() *ConfigurationBuilder {
	if !builder.config.AutoSatisfyRequired {
		builder.addBuildStep("skip_required", "Auto-satisfy required groups disabled", true, nil)
		return builder
	}

	satisfied := 0
	for _, group := range builder.model.Groups {
		if !group.IsRequired {
			continue
		}

		// Check if group already has selections
		hasSelection := false
		for _, selection := range builder.selections {
			if builder.getOptionGroupID(selection.OptionID) == group.ID {
				hasSelection = true
				break
			}
		}

		if !hasSelection {
			// Add first available option from required group
			builder.AddSelectionFromGroup(group.ID, 1)
			satisfied++
		}
	}

	builder.addBuildStep("satisfy_required", fmt.Sprintf("Satisfied %d required groups", satisfied), true, satisfied)
	return builder
}

// ApplyRecommendations applies AI-generated recommendations
func (builder *ConfigurationBuilder) ApplyRecommendations() *ConfigurationBuilder {
	// This could integrate with a recommendation engine
	// For now, implement basic logic
	recommendations := builder.generateBasicRecommendations()

	applied := 0
	for _, rec := range recommendations {
		switch rec.Type {
		case "add_popular_option":
			if optionID, ok := rec.Data.(string); ok {
				builder.AddSelection(optionID, 1)
				applied++
			}
		case "increase_quantity":
			if data, ok := rec.Data.(map[string]interface{}); ok {
				if optionID, ok := data["option_id"].(string); ok {
					if quantity, ok := data["quantity"].(int); ok {
						builder.SetQuantity(optionID, quantity)
						applied++
					}
				}
			}
		}
	}

	builder.addBuildStep("apply_recommendations", fmt.Sprintf("Applied %d recommendations", applied), true, applied)
	return builder
}

// OptimizeConfiguration applies optimization strategies
func (builder *ConfigurationBuilder) OptimizeConfiguration() *ConfigurationBuilder {
	if !builder.config.EnableOptimizations {
		return builder
	}

	optimizations := 0

	// Remove redundant selections
	builder.removeRedundantSelections()
	optimizations++

	// Consolidate compatible options
	builder.consolidateCompatibleOptions()
	optimizations++

	// Apply volume optimizations
	builder.applyVolumeOptimizations()
	optimizations++

	builder.addBuildStep("optimize", fmt.Sprintf("Applied %d optimizations", optimizations), true, optimizations)
	return builder
}

// Build creates the final configuration
func (builder *ConfigurationBuilder) Build() (*Configuration, error) {
	startTime := time.Now()
	buildID := fmt.Sprintf("build_%d", time.Now().UnixNano())

	if len(builder.errors) > 0 && !builder.config.AllowPartialBuilds {
		return nil, fmt.Errorf("configuration build failed with %d errors: %v", len(builder.errors), builder.errors[0])
	}

	// Final validation
	isValid, err := builder.operations.engine.IsValidCombination(builder.selections)
	if err != nil {
		builder.addBuildStep("build_validation_error", fmt.Sprintf("Final validation failed: %s", err.Error()), false, err)
		return nil, fmt.Errorf("final validation failed: %w", err)
	}

	if !isValid && builder.config.StrictValidation {
		builder.addBuildStep("build_invalid", "Final configuration is invalid", false, nil)
		return nil, fmt.Errorf("final configuration is invalid")
	}

	// Create configuration
	config := &Configuration{
		ID:         generateConfigurationID(),
		ModelID:    builder.model.ID,
		Selections: builder.selections,
		Context:    builder.context,
		IsValid:    isValid,
		Timestamp:  time.Now(),
		Metadata:   builder.metadata,
	}

	// Add build metadata
	config.Metadata["build_id"] = buildID
	config.Metadata["build_steps"] = len(builder.buildSteps)
	config.Metadata["build_duration"] = time.Since(startTime)
	config.Metadata["build_errors"] = len(builder.errors)
	config.Metadata["strict_validation"] = builder.config.StrictValidation

	builder.addBuildStep("build_complete", fmt.Sprintf("Configuration built successfully: %s", config.ID), true, config.ID)

	// Record operation
	if builder.operations.options.EnableAuditTrail {
		builder.operations.recordOperation("build_configuration", buildID, "", true, "", nil, config, time.Since(startTime), map[string]interface{}{
			"steps":  len(builder.buildSteps),
			"errors": len(builder.errors),
		})
	}

	// Update metrics
	if builder.operations.options.EnableMetrics {
		builder.operations.updateMetrics("build", time.Since(startTime), true)
	}

	return config, nil
}

// BuildAsync builds the configuration asynchronously
func (builder *ConfigurationBuilder) BuildAsync() <-chan BuildResult {
	resultChan := make(chan BuildResult, 1)

	go func() {
		defer close(resultChan)

		config, err := builder.Build()
		resultChan <- BuildResult{
			Configuration: config,
			Error:         err,
			BuildSteps:    builder.buildSteps,
			Duration:      time.Since(time.Now()),
		}
	}()

	return resultChan
}

// ===================================================================
// CONFIGURATION ANALYSIS AND UTILITIES
// ===================================================================

// AnalyzeConfiguration provides detailed analysis of a configuration
func (ops *ConfigurationOperations) AnalyzeConfiguration(config *Configuration) (*ConfigurationAnalysis, error) {
	startTime := time.Now()

	analysis := &ConfigurationAnalysis{
		ConfigurationID: config.ID,
		Timestamp:       time.Now(),
		Summary:         make(map[string]interface{}),
		GroupAnalysis:   make(map[string]*GroupAnalysis),
		Recommendations: make([]AnalysisRecommendation, 0),
		Performance:     make(map[string]interface{}),
	}

	// Basic statistics
	analysis.Summary["total_selections"] = len(config.Selections)
	analysis.Summary["total_quantity"] = config.GetTotalQuantity()
	analysis.Summary["is_valid"] = config.IsValid
	analysis.Summary["has_context"] = config.Context != nil

	// Group analysis
	for _, group := range ops.mtbddConfig.Model.Groups {
		groupAnalysis := &GroupAnalysis{
			GroupID:       group.ID,
			GroupName:     group.Name,
			IsRequired:    group.IsRequired,
			Selections:    make([]Selection, 0),
			TotalQuantity: 0,
			Analysis:      make(map[string]interface{}),
		}

		// Count selections in this group
		for _, selection := range config.Selections {
			if ops.getOptionGroupID(selection.OptionID) == group.ID {
				groupAnalysis.Selections = append(groupAnalysis.Selections, selection)
				groupAnalysis.TotalQuantity += selection.Quantity
			}
		}

		// Analyze group constraints
		groupAnalysis.Analysis["meets_minimum"] = groupAnalysis.TotalQuantity >= group.MinSelections
		if group.MaxSelections > 0 {
			groupAnalysis.Analysis["meets_maximum"] = groupAnalysis.TotalQuantity <= group.MaxSelections
		} else {
			groupAnalysis.Analysis["meets_maximum"] = true
		}

		groupAnalysis.Analysis["selection_count"] = len(groupAnalysis.Selections)
		groupAnalysis.Analysis["coverage_rate"] = float64(len(groupAnalysis.Selections)) / float64(len(ops.getGroupOptions(group.ID)))

		analysis.GroupAnalysis[group.ID] = groupAnalysis
	}

	// Generate recommendations
	recommendations := ops.generateAnalysisRecommendations(config, analysis)
	analysis.Recommendations = recommendations

	// Performance metrics
	analysis.Performance["analysis_time_ms"] = float64(time.Since(startTime).Nanoseconds()) / 1e6
	analysis.Performance["groups_analyzed"] = len(analysis.GroupAnalysis)
	analysis.Performance["recommendations_generated"] = len(analysis.Recommendations)

	return analysis, nil
}

// CompareConfigurations compares two configurations and highlights differences
func (ops *ConfigurationOperations) CompareConfigurations(config1, config2 *Configuration) (*ConfigurationComparison, error) {
	comparison := &ConfigurationComparison{
		Config1ID:   config1.ID,
		Config2ID:   config2.ID,
		Timestamp:   time.Now(),
		Differences: make([]ConfigurationDifference, 0),
		Summary:     make(map[string]interface{}),
	}

	// Create maps for easier comparison
	selections1 := make(map[string]int)
	selections2 := make(map[string]int)

	for _, sel := range config1.Selections {
		selections1[sel.OptionID] = sel.Quantity
	}

	for _, sel := range config2.Selections {
		selections2[sel.OptionID] = sel.Quantity
	}

	// Find differences
	allOptions := make(map[string]bool)
	for optionID := range selections1 {
		allOptions[optionID] = true
	}
	for optionID := range selections2 {
		allOptions[optionID] = true
	}

	for optionID := range allOptions {
		qty1, exists1 := selections1[optionID]
		qty2, exists2 := selections2[optionID]

		var diffType string
		var description string

		if exists1 && !exists2 {
			diffType = "removed"
			description = fmt.Sprintf("Option %s removed (was %d)", optionID, qty1)
		} else if !exists1 && exists2 {
			diffType = "added"
			description = fmt.Sprintf("Option %s added (%d)", optionID, qty2)
		} else if qty1 != qty2 {
			diffType = "quantity_changed"
			description = fmt.Sprintf("Option %s quantity changed: %d -> %d", optionID, qty1, qty2)
		} else {
			continue // No difference
		}

		comparison.Differences = append(comparison.Differences, ConfigurationDifference{
			Type:        diffType,
			OptionID:    optionID,
			Description: description,
			OldValue:    qty1,
			NewValue:    qty2,
			Metadata:    make(map[string]interface{}),
		})
	}

	// Summary statistics
	comparison.Summary["total_differences"] = len(comparison.Differences)
	comparison.Summary["config1_selections"] = len(config1.Selections)
	comparison.Summary["config2_selections"] = len(config2.Selections)
	comparison.Summary["config1_quantity"] = config1.GetTotalQuantity()
	comparison.Summary["config2_quantity"] = config2.GetTotalQuantity()

	return comparison, nil
}

// ===================================================================
// HELPER METHODS
// ===================================================================

// addBuildStep adds a step to the build process
func (builder *ConfigurationBuilder) addBuildStep(stepType, description string, success bool, data interface{}) {
	step := BuildStep{
		StepNumber:  len(builder.buildSteps) + 1,
		Type:        stepType,
		Description: description,
		Success:     success,
		Timestamp:   time.Now(),
		Data:        data,
		Metadata:    make(map[string]interface{}),
	}

	if !success && len(builder.errors) > 0 {
		step.Error = builder.errors[len(builder.errors)-1].Error()
	}

	builder.buildSteps = append(builder.buildSteps, step)
}

// getOptionGroupID returns the group ID for an option
func (builder *ConfigurationBuilder) getOptionGroupID(optionID string) string {
	for _, option := range builder.model.Options {
		if option.ID == optionID {
			return option.GroupID
		}
	}
	return ""
}

// getOptionGroupID returns the group ID for an option (operations version)
func (ops *ConfigurationOperations) getOptionGroupID(optionID string) string {
	for _, option := range ops.mtbddConfig.Model.Options {
		if option.ID == optionID {
			return option.GroupID
		}
	}
	return ""
}

// getGroupOptions returns all options for a group
func (ops *ConfigurationOperations) getGroupOptions(groupID string) []OptionDef {
	var options []OptionDef
	for _, option := range ops.mtbddConfig.Model.Options {
		if option.GroupID == groupID {
			options = append(options, option)
		}
	}
	return options
}

// generateBasicRecommendations generates simple recommendations
func (builder *ConfigurationBuilder) generateBasicRecommendations() []Recommendation {
	recommendations := make([]Recommendation, 0)

	// Recommend popular options (simplified)
	for _, group := range builder.model.Groups {
		if group.IsRequired {
			hasSelection := false
			for _, selection := range builder.selections {
				if builder.getOptionGroupID(selection.OptionID) == group.ID {
					hasSelection = true
					break
				}
			}

			if !hasSelection {
				// Find default option for group
				for _, option := range builder.model.Options {
					if option.GroupID == group.ID && option.IsDefault {
						recommendations = append(recommendations, Recommendation{
							Type:        "add_popular_option",
							Description: fmt.Sprintf("Add default option for required group %s", group.Name),
							Data:        option.ID,
							Priority:    10,
						})
						break
					}
				}
			}
		}
	}

	return recommendations
}

// Optimization methods
func (builder *ConfigurationBuilder) removeRedundantSelections() {
	// Remove duplicate selections (keeping latest)
	seen := make(map[string]bool)
	var unique []Selection

	for i := len(builder.selections) - 1; i >= 0; i-- {
		selection := builder.selections[i]
		if !seen[selection.OptionID] {
			unique = append([]Selection{selection}, unique...)
			seen[selection.OptionID] = true
		}
	}

	builder.selections = unique
}

func (builder *ConfigurationBuilder) consolidateCompatibleOptions() {
	// This could implement logic to combine compatible options
	// For now, just ensure selections are sorted by option ID
	sort.Slice(builder.selections, func(i, j int) bool {
		return builder.selections[i].OptionID < builder.selections[j].OptionID
	})
}

func (builder *ConfigurationBuilder) applyVolumeOptimizations() {
	// Apply volume-based optimizations
	totalQuantity := 0
	for _, selection := range builder.selections {
		totalQuantity += selection.Quantity
	}

	// If close to volume tier boundary, suggest optimization
	if totalQuantity >= 9 && totalQuantity < 11 {
		builder.metadata["volume_optimization_suggestion"] = "Consider increasing quantity to 11 for volume tier discount"
	}
}

// recordOperation records an operation for audit trail
func (ops *ConfigurationOperations) recordOperation(
	operationType, operationID, userID string,
	success bool, errorMsg string,
	beforeState, afterState *Configuration,
	duration time.Duration,
	metadata map[string]interface{},
) {
	if !ops.options.EnableAuditTrail {
		return
	}

	ops.mutex.Lock()
	defer ops.mutex.Unlock()

	record := OperationRecord{
		ID:          operationID,
		Type:        operationType,
		Timestamp:   time.Now(),
		UserID:      userID,
		Description: fmt.Sprintf("%s operation", operationType),
		BeforeState: beforeState,
		AfterState:  afterState,
		Success:     success,
		Error:       errorMsg,
		Duration:    duration,
		Metadata:    metadata,
	}

	ops.operationHistory = append(ops.operationHistory, record)

	// Trim history if it exceeds max size
	if len(ops.operationHistory) > ops.options.MaxHistorySize {
		ops.operationHistory = ops.operationHistory[1:]
	}
}

// updateMetrics updates operations metrics
func (ops *ConfigurationOperations) updateMetrics(operationType string, duration time.Duration, success bool) {
	if !ops.options.EnableMetrics {
		return
	}

	ops.metrics.mutex.Lock()
	defer ops.metrics.mutex.Unlock()

	ops.metrics.TotalOperations++
	ops.metrics.TotalBuildTime += duration

	if success {
		ops.metrics.SuccessfulBuilds++
	} else {
		ops.metrics.FailedBuilds++
	}

	if ops.metrics.TotalOperations > 0 {
		ops.metrics.AverageBuildTime = time.Duration(int64(ops.metrics.TotalBuildTime) / ops.metrics.TotalOperations)
	}
}

// generateAnalysisRecommendations generates recommendations based on analysis
func (ops *ConfigurationOperations) generateAnalysisRecommendations(config *Configuration, analysis *ConfigurationAnalysis) []AnalysisRecommendation {
	recommendations := make([]AnalysisRecommendation, 0)

	// Check for missing required groups
	for groupID, groupAnalysis := range analysis.GroupAnalysis {
		if groupAnalysis.IsRequired && groupAnalysis.TotalQuantity == 0 {
			recommendations = append(recommendations, AnalysisRecommendation{
				Type:        "add_required_selection",
				Priority:    10,
				Description: fmt.Sprintf("Add selection to required group: %s", groupAnalysis.GroupName),
				GroupID:     groupID,
				ActionType:  "add",
			})
		}
	}

	// Check for volume optimization opportunities
	totalQuantity := config.GetTotalQuantity()
	if totalQuantity >= 9 && totalQuantity < 11 {
		recommendations = append(recommendations, AnalysisRecommendation{
			Type:        "volume_optimization",
			Priority:    5,
			Description: "Consider increasing quantity to 11 for volume tier discount",
			ActionType:  "optimize",
		})
	}

	return recommendations
}

// ===================================================================
// SUPPORTING TYPES
// ===================================================================

// BuildResult represents the result of an async build operation
type BuildResult struct {
	Configuration *Configuration `json:"configuration"`
	Error         error          `json:"error"`
	BuildSteps    []BuildStep    `json:"build_steps"`
	Duration      time.Duration  `json:"duration"`
}

// Recommendation represents a configuration recommendation
type Recommendation struct {
	Type        string      `json:"type"`
	Description string      `json:"description"`
	Data        interface{} `json:"data"`
	Priority    int         `json:"priority"`
}

// ConfigurationAnalysis represents detailed configuration analysis
type ConfigurationAnalysis struct {
	ConfigurationID string                    `json:"configuration_id"`
	Timestamp       time.Time                 `json:"timestamp"`
	Summary         map[string]interface{}    `json:"summary"`
	GroupAnalysis   map[string]*GroupAnalysis `json:"group_analysis"`
	Recommendations []AnalysisRecommendation  `json:"recommendations"`
	Performance     map[string]interface{}    `json:"performance"`
}

// GroupAnalysis represents analysis of a configuration group
type GroupAnalysis struct {
	GroupID       string                 `json:"group_id"`
	GroupName     string                 `json:"group_name"`
	IsRequired    bool                   `json:"is_required"`
	Selections    []Selection            `json:"selections"`
	TotalQuantity int                    `json:"total_quantity"`
	Analysis      map[string]interface{} `json:"analysis"`
}

// AnalysisRecommendation represents a recommendation from analysis
type AnalysisRecommendation struct {
	Type        string `json:"type"`
	Priority    int    `json:"priority"`
	Description string `json:"description"`
	GroupID     string `json:"group_id,omitempty"`
	OptionID    string `json:"option_id,omitempty"`
	ActionType  string `json:"action_type"`
}

// ConfigurationComparison represents a comparison between configurations
type ConfigurationComparison struct {
	Config1ID   string                    `json:"config1_id"`
	Config2ID   string                    `json:"config2_id"`
	Timestamp   time.Time                 `json:"timestamp"`
	Differences []ConfigurationDifference `json:"differences"`
	Summary     map[string]interface{}    `json:"summary"`
}

// ConfigurationDifference represents a difference between configurations
type ConfigurationDifference struct {
	Type        string                 `json:"type"`
	OptionID    string                 `json:"option_id"`
	Description string                 `json:"description"`
	OldValue    int                    `json:"old_value"`
	NewValue    int                    `json:"new_value"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// GetOperationHistory returns the operation history
func (ops *ConfigurationOperations) GetOperationHistory() []OperationRecord {
	ops.mutex.RLock()
	defer ops.mutex.RUnlock()

	result := make([]OperationRecord, len(ops.operationHistory))
	copy(result, ops.operationHistory)
	return result
}

// GetMetrics returns current operations metrics
func (ops *ConfigurationOperations) GetMetrics() map[string]interface{} {
	ops.metrics.mutex.Lock()
	defer ops.metrics.mutex.Unlock()

	successRate := 0.0
	if ops.metrics.TotalOperations > 0 {
		successRate = float64(ops.metrics.SuccessfulBuilds) / float64(ops.metrics.TotalOperations)
	}

	return map[string]interface{}{
		"total_operations":      ops.metrics.TotalOperations,
		"successful_builds":     ops.metrics.SuccessfulBuilds,
		"failed_builds":         ops.metrics.FailedBuilds,
		"success_rate":          successRate,
		"average_build_time_ms": float64(ops.metrics.AverageBuildTime.Nanoseconds()) / 1e6,
		"cache_hit_rate":        ops.metrics.CacheHitRate,
	}
}

// ClearHistory clears the operation history
func (ops *ConfigurationOperations) ClearHistory() {
	ops.mutex.Lock()
	defer ops.mutex.Unlock()
	ops.operationHistory = make([]OperationRecord, 0, ops.options.MaxHistorySize)
}

// SetOptions updates operations options
func (ops *ConfigurationOperations) SetOptions(options OperationsOptions) {
	ops.mutex.Lock()
	defer ops.mutex.Unlock()
	ops.options = options
}

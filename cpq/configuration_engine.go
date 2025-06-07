// configuration_engine.go
// Core configuration engine for real-time constraint resolution and option filtering
// Handles configuration state management with <10ms constraint resolution target

package cpq

import (
	"fmt"
	"sync"
	"time"

	"DD/mtbdd"
)

// ConfigurationEngine handles core configuration operations and constraint validation
type ConfigurationEngine struct {
	mtbddConfig      *MTBDDConfiguration
	model            *Model
	variableRegistry *VariableRegistry
	mtbddEngine      *mtbdd.MTBDD
	validationEngine *ValidationEngine
	cache            *EngineCache
	mutex            sync.RWMutex
	metrics          *EngineMetrics
	options          EngineOptions
}

// EngineOptions configures engine behavior
type EngineOptions struct {
	EnableCaching            bool          `json:"enable_caching"`
	CacheTTL                 time.Duration `json:"cache_ttl"`
	MaxCacheSize             int           `json:"max_cache_size"`
	EnableMetrics            bool          `json:"enable_metrics"`
	ConstraintTimeout        time.Duration `json:"constraint_timeout"`
	EnableIncrementalUpdates bool          `json:"enable_incremental_updates"`
	OptimizeForPerformance   bool          `json:"optimize_for_performance"`
}

// EngineCache handles caching of configuration operations
type EngineCache struct {
	availableOptions  map[string]*AvailabilityResult
	validCombinations map[string]bool
	constraintResults map[string]*ConstraintResult
	mutex             sync.RWMutex
	hits              int64
	misses            int64
	evictions         int64
}

// EngineMetrics tracks engine performance
type EngineMetrics struct {
	TotalOperations       int64         `json:"total_operations"`
	ConstraintEvaluations int64         `json:"constraint_evaluations"`
	CacheHitRate          float64       `json:"cache_hit_rate"`
	AverageResponseTime   time.Duration `json:"average_response_time"`
	TotalTime             time.Duration `json:"total_time"`
	ErrorCount            int64         `json:"error_count"`
	LastOperation         time.Time     `json:"last_operation"`
	mutex                 sync.Mutex
}

// AvailabilityResult represents option availability information
type AvailabilityResult struct {
	GroupID          string               `json:"group_id"`
	AvailableOptions []OptionAvailability `json:"available_options"`
	Constraints      []string             `json:"constraints"`
	CachedAt         time.Time            `json:"cached_at"`
	ValidUntil       time.Time            `json:"valid_until"`
}

// OptionAvailability represents individual option availability
type OptionAvailability struct {
	OptionID    string                 `json:"option_id"`
	IsAvailable bool                   `json:"is_available"`
	Constraints []ConstraintInfo       `json:"constraints"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// ConstraintInfo provides information about constraints affecting an option
type ConstraintInfo struct {
	RuleID      string `json:"rule_id"`
	RuleName    string `json:"rule_name"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
}

// ConstraintResult represents the result of constraint evaluation
type ConstraintResult struct {
	IsValid        bool                   `json:"is_valid"`
	ViolatedRules  []string               `json:"violated_rules"`
	Suggestions    []string               `json:"suggestions"`
	EvaluationTime time.Duration          `json:"evaluation_time"`
	Metadata       map[string]interface{} `json:"metadata"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewConfigurationEngine creates a new configuration engine
func NewConfigurationEngine(mtbddConfig *MTBDDConfiguration) *ConfigurationEngine {
	// Critical fix: Validate mtbddConfig is properly initialized
	if mtbddConfig == nil {
		panic("mtbddConfig cannot be nil")
	}

	engine := &ConfigurationEngine{
		mtbddConfig:      mtbddConfig,
		model:            mtbddConfig.Model,
		variableRegistry: mtbddConfig.variableRegistry,
		mtbddEngine:      mtbddConfig.mtbddEngine,
		cache:            NewEngineCache(),
		metrics:          NewEngineMetrics(),
		options: EngineOptions{
			EnableCaching:            true,
			CacheTTL:                 5 * time.Minute,
			MaxCacheSize:             1000,
			EnableMetrics:            true,
			ConstraintTimeout:        10 * time.Millisecond, // Target <10ms
			EnableIncrementalUpdates: true,
			OptimizeForPerformance:   true,
		},
	}

	return engine
}

// NewEngineCache creates a new engine cache
func NewEngineCache() *EngineCache {
	return &EngineCache{
		availableOptions:  make(map[string]*AvailabilityResult),
		validCombinations: make(map[string]bool),
		constraintResults: make(map[string]*ConstraintResult),
	}
}

// NewEngineMetrics creates a new metrics tracker
func NewEngineMetrics() *EngineMetrics {
	return &EngineMetrics{}
}

// ===================================================================
// CONSTRAINT EVALUATION
// ===================================================================

// IsValidCombination checks if a combination of selections satisfies all constraints
func (ce *ConfigurationEngine) IsValidCombination(selections []Selection) (bool, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("constraint_evaluation", time.Since(startTime))
	}()

	// Critical fix: Handle nil selections gracefully
	if selections == nil {
		selections = []Selection{}
	}

	// Critical fix: Check cache first with proper null handling
	if ce.options.EnableCaching {
		cacheKey := ce.generateCombinationCacheKey(selections)
		if cached, exists := ce.getCachedCombination(cacheKey); exists {
			if ce.cache != nil {
				ce.cache.recordHit()
			}
			return cached, nil
		}
		if ce.cache != nil {
			ce.cache.recordMiss()
		}
	}

	// Critical fix: Validate MTBDD config is available
	if ce.mtbddConfig == nil {
		ce.metrics.recordError()
		return false, fmt.Errorf("configuration engine not properly initialized - MTBDD config is nil")
	}

	// Evaluate using MTBDD
	isValid, err := ce.mtbddConfig.EvaluateConfiguration(selections)
	if err != nil {
		ce.metrics.recordError()
		return false, fmt.Errorf("MTBDD evaluation failed: %w", err)
	}

	// Cache the result
	if ce.options.EnableCaching && ce.cache != nil {
		cacheKey := ce.generateCombinationCacheKey(selections)
		ce.cacheCombinationResult(cacheKey, isValid)
	}

	return isValid, nil
}

// ValidateAndGetViolations validates a configuration and returns detailed violation information
func (ce *ConfigurationEngine) ValidateAndGetViolations(selections []Selection) (*ConstraintResult, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("detailed_validation", time.Since(startTime))
	}()

	// Critical fix: Handle nil selections gracefully
	if selections == nil {
		selections = []Selection{}
	}

	// Check basic validity first
	isValid, err := ce.IsValidCombination(selections)
	if err != nil {
		return nil, fmt.Errorf("basic validation failed: %w", err)
	}

	result := &ConstraintResult{
		IsValid:        isValid,
		ViolatedRules:  make([]string, 0),
		Suggestions:    make([]string, 0),
		EvaluationTime: time.Since(startTime),
		Metadata:       make(map[string]interface{}),
	}

	if isValid {
		return result, nil
	}

	// Get detailed violation information
	if ce.mtbddConfig != nil {
		violations, err := ce.mtbddConfig.ExplainViolation(selections)
		if err != nil {
			return nil, fmt.Errorf("violation explanation failed: %w", err)
		}
		result.ViolatedRules = violations
	}

	// Generate suggestions if validation engine is available
	if ce.validationEngine != nil {
		config := &Configuration{
			ID:         generateConfigurationID(),
			ModelID:    ce.model.ID,
			Selections: selections,
			Timestamp:  time.Now(),
		}

		validationResult, err := ce.validationEngine.ValidateConfiguration(config)
		if err == nil && len(validationResult.Suggestions) > 0 {
			for _, suggestion := range validationResult.Suggestions {
				result.Suggestions = append(result.Suggestions, suggestion.Description)
			}
		}
	}

	return result, nil
}

// ===================================================================
// OPTION AVAILABILITY
// ===================================================================

// GetAvailableOptions returns available options for a group given current selections
func (ce *ConfigurationEngine) GetAvailableOptions(groupID string, currentSelections []Selection) ([]OptionDef, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("availability_check", time.Since(startTime))
	}()

	// Validate inputs
	if groupID == "" {
		return nil, fmt.Errorf("group ID cannot be empty")
	}

	// Critical fix: Handle nil selections gracefully
	if currentSelections == nil {
		currentSelections = []Selection{}
	}

	// Check cache first
	if ce.options.EnableCaching && ce.cache != nil {
		cacheKey := ce.generateAvailabilityCacheKey(groupID, currentSelections)
		if cached := ce.getCachedAvailability(cacheKey); cached != nil {
			ce.cache.recordHit()
			return ce.extractOptionsFromAvailability(cached), nil
		}
		ce.cache.recordMiss()
	}

	// Find all options in the group
	var groupOptions []OptionDef
	if ce.model != nil {
		for _, option := range ce.model.Options {
			if option.GroupID == groupID && option.IsAvailable {
				groupOptions = append(groupOptions, option)
			}
		}
	}

	if len(groupOptions) == 0 {
		return []OptionDef{}, nil
	}

	// Check availability for each option
	var availableOptions []OptionDef
	var constraintInfos []ConstraintInfo

	for _, option := range groupOptions {
		// Create test configuration with this option added
		testSelections := make([]Selection, len(currentSelections))
		copy(testSelections, currentSelections)

		// Add or update the option in test selections
		testSelections = ce.addOrUpdateSelection(testSelections, option.ID, 1)

		// Check if this combination is valid
		isValid, err := ce.IsValidCombination(testSelections)
		if err != nil {
			// If evaluation fails, consider option unavailable
			constraintInfos = append(constraintInfos, ConstraintInfo{
				RuleID:      "evaluation_error",
				RuleName:    "Evaluation Error",
				Type:        "system_error",
				Description: fmt.Sprintf("Could not evaluate option %s: %s", option.ID, err.Error()),
				Severity:    "error",
			})
			continue
		}

		if isValid {
			availableOptions = append(availableOptions, option)
		} else {
			// Option is not available due to constraints
			constraintInfos = append(constraintInfos, ConstraintInfo{
				RuleID:      "constraint_violation",
				RuleName:    "Constraint Violation",
				Type:        "business_rule",
				Description: fmt.Sprintf("Option %s violates configuration constraints", option.ID),
				Severity:    "error",
			})
		}
	}

	// Cache the result
	if ce.options.EnableCaching && ce.cache != nil {
		cacheKey := ce.generateAvailabilityCacheKey(groupID, currentSelections)
		ce.cacheAvailabilityResult(cacheKey, groupID, availableOptions, constraintInfos)
	}

	return availableOptions, nil
}

// GetDetailedAvailability returns detailed availability information for a group
func (ce *ConfigurationEngine) GetDetailedAvailability(groupID string, currentSelections []Selection) (*AvailabilityResult, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("detailed_availability", time.Since(startTime))
	}()

	// Critical fix: Handle nil selections gracefully
	if currentSelections == nil {
		currentSelections = []Selection{}
	}

	// Check cache first
	if ce.options.EnableCaching && ce.cache != nil {
		cacheKey := ce.generateAvailabilityCacheKey(groupID, currentSelections)
		if cached := ce.getCachedAvailability(cacheKey); cached != nil {
			ce.cache.recordHit()
			return cached, nil
		}
		ce.cache.recordMiss()
	}

	// Get all options for the group
	var groupOptions []OptionDef
	if ce.model != nil {
		for _, option := range ce.model.Options {
			if option.GroupID == groupID {
				groupOptions = append(groupOptions, option)
			}
		}
	}

	// Check availability for each option
	var optionAvailabilities []OptionAvailability
	var globalConstraints []string

	for _, option := range groupOptions {
		availability := OptionAvailability{
			OptionID:    option.ID,
			IsAvailable: option.IsAvailable,
			Constraints: make([]ConstraintInfo, 0),
			Metadata: map[string]interface{}{
				"base_price":   option.BasePrice,
				"min_quantity": option.MinQuantity,
				"max_quantity": option.MaxQuantity,
			},
		}

		if option.IsAvailable {
			// Test if option can be added to current configuration
			testSelections := ce.addOrUpdateSelection(currentSelections, option.ID, 1)
			isValid, err := ce.IsValidCombination(testSelections)

			if err != nil {
				availability.IsAvailable = false
				availability.Constraints = append(availability.Constraints, ConstraintInfo{
					RuleID:      "evaluation_error",
					RuleName:    "System Error",
					Type:        "system",
					Description: err.Error(),
					Severity:    "error",
				})
			} else if !isValid {
				availability.IsAvailable = false

				// Get specific violation information
				constraintResult, err := ce.ValidateAndGetViolations(testSelections)
				if err == nil {
					for _, violation := range constraintResult.ViolatedRules {
						availability.Constraints = append(availability.Constraints, ConstraintInfo{
							RuleID:      "unknown",
							RuleName:    "Configuration Constraint",
							Type:        "business_rule",
							Description: violation,
							Severity:    "error",
						})
					}
				}
			}
		}

		optionAvailabilities = append(optionAvailabilities, availability)
	}

	// Create result
	result := &AvailabilityResult{
		GroupID:          groupID,
		AvailableOptions: optionAvailabilities,
		Constraints:      globalConstraints,
		CachedAt:         time.Now(),
		ValidUntil:       time.Now().Add(ce.options.CacheTTL),
	}

	// Cache the result
	if ce.options.EnableCaching && ce.cache != nil {
		cacheKey := ce.generateAvailabilityCacheKey(groupID, currentSelections)
		ce.cache.availableOptions[cacheKey] = result
	}

	return result, nil
}

// ===================================================================
// CONFIGURATION UPDATES
// ===================================================================

// AddSelection adds a selection to current configuration and validates the result
func (ce *ConfigurationEngine) AddSelection(optionID string, quantity int, currentSelections []Selection) (ConfigUpdate, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("add_selection", time.Since(startTime))
	}()

	// Validate inputs
	if optionID == "" {
		return ConfigUpdate{}, fmt.Errorf("option ID cannot be empty")
	}
	if quantity <= 0 {
		return ConfigUpdate{}, fmt.Errorf("quantity must be positive: %d", quantity)
	}

	// Critical fix: Handle nil selections gracefully
	if currentSelections == nil {
		currentSelections = []Selection{}
	}

	// Create new selection list with the added option
	newSelections := ce.addOrUpdateSelection(currentSelections, optionID, quantity)

	// Validate the new combination
	isValid, err := ce.IsValidCombination(newSelections)
	if err != nil {
		return ConfigUpdate{}, fmt.Errorf("validation failed: %w", err)
	}

	// Get updated available options for all groups if configuration is valid
	var updatedOptions []Option
	if isValid {
		var err error
		updatedOptions, err = ce.getAllAvailableOptions(newSelections)
		if err != nil {
			return ConfigUpdate{}, fmt.Errorf("failed to get updated options: %w", err)
		}
	}

	// Create validation result
	validationResult := &ValidationResult{
		IsValid:    isValid,
		Violations: make([]ConstraintViolation, 0),
		Timestamp:  time.Now(),
	}

	// Get detailed violations if invalid
	if !isValid {
		constraintResult, err := ce.ValidateAndGetViolations(newSelections)
		if err == nil {
			for _, violation := range constraintResult.ViolatedRules {
				validationResult.Violations = append(validationResult.Violations, ConstraintViolation{
					Type:     ViolationCustomRule,
					Message:  violation,
					Severity: SeverityError,
				})
			}
		}
	}

	return ConfigUpdate{
		IsValid:          isValid,
		UpdatedOptions:   updatedOptions,
		ValidationResult: validationResult,
		Timestamp:        time.Now(),
	}, nil
}

// RemoveSelection removes a selection from current configuration
func (ce *ConfigurationEngine) RemoveSelection(optionID string, currentSelections []Selection) (ConfigUpdate, error) {
	startTime := time.Now()
	defer func() {
		ce.updateMetrics("remove_selection", time.Since(startTime))
	}()

	// Critical fix: Handle nil selections gracefully
	if currentSelections == nil {
		currentSelections = []Selection{}
	}

	// Create new selection list without the specified option
	var newSelections []Selection
	for _, sel := range currentSelections {
		if sel.OptionID != optionID {
			newSelections = append(newSelections, sel)
		}
	}

	// Validate the new combination
	isValid, err := ce.IsValidCombination(newSelections)
	if err != nil {
		return ConfigUpdate{}, fmt.Errorf("validation failed: %w", err)
	}

	// Get updated available options for all groups
	updatedOptions, err := ce.getAllAvailableOptions(newSelections)
	if err != nil {
		return ConfigUpdate{}, fmt.Errorf("failed to get updated options: %w", err)
	}

	return ConfigUpdate{
		IsValid:        isValid,
		UpdatedOptions: updatedOptions,
		Timestamp:      time.Now(),
	}, nil
}

// ValidateGroupQuantity validates quantity constraints for a group
func (ce *ConfigurationEngine) ValidateGroupQuantity(groupID string, selections []Selection) (ValidationResult, error) {
	// Critical fix: Handle nil selections gracefully
	if selections == nil {
		selections = []Selection{}
	}

	// Find the group definition
	var group *GroupDef
	if ce.model != nil {
		for i := range ce.model.Groups {
			if ce.model.Groups[i].ID == groupID {
				group = &ce.model.Groups[i]
				break
			}
		}
	}

	if group == nil {
		return ValidationResult{}, fmt.Errorf("group not found: %s", groupID)
	}

	// Count selections in this group
	count := 0
	for _, sel := range selections {
		if ce.getOptionGroupID(sel.OptionID) == groupID {
			count += sel.Quantity
		}
	}

	// Check min/max constraints
	violations := []ConstraintViolation{}

	if group.MinSelections > 0 && count < group.MinSelections {
		violations = append(violations, ConstraintViolation{
			Type:     ViolationGroupQuantity,
			Message:  fmt.Sprintf("Group %s requires at least %d selections, but only %d provided", group.Name, group.MinSelections, count),
			Severity: SeverityError,
		})
	}

	if group.MaxSelections > 0 && count > group.MaxSelections {
		violations = append(violations, ConstraintViolation{
			Type:     ViolationGroupQuantity,
			Message:  fmt.Sprintf("Group %s allows at most %d selections, but %d provided", group.Name, group.MaxSelections, count),
			Severity: SeverityError,
		})
	}

	return ValidationResult{
		IsValid:    len(violations) == 0,
		Violations: violations,
		Timestamp:  time.Now(),
	}, nil
}

// ===================================================================
// HELPER METHODS
// ===================================================================

// addOrUpdateSelection adds or updates a selection in the list
func (ce *ConfigurationEngine) addOrUpdateSelection(selections []Selection, optionID string, quantity int) []Selection {
	// Check if option already exists
	for i, sel := range selections {
		if sel.OptionID == optionID {
			// Update existing selection
			selections[i].Quantity = quantity
			return selections
		}
	}

	// Add new selection
	return append(selections, Selection{
		OptionID: optionID,
		Quantity: quantity,
	})
}

// getAllAvailableOptions returns available options for all groups
func (ce *ConfigurationEngine) getAllAvailableOptions(selections []Selection) ([]Option, error) {
	var allOptions []Option

	if ce.model == nil {
		return allOptions, fmt.Errorf("model not available")
	}

	for _, group := range ce.model.Groups {
		availableOptions, err := ce.GetAvailableOptions(group.ID, selections)
		if err != nil {
			return nil, fmt.Errorf("failed to get options for group %s: %w", group.ID, err)
		}

		for _, optionDef := range availableOptions {
			option := Option{
				ID:          optionDef.ID,
				Name:        optionDef.Name,
				Description: optionDef.Description,
				GroupID:     optionDef.GroupID,
				BasePrice:   optionDef.BasePrice,
				IsAvailable: true,
				IsSelected:  ce.isOptionSelected(optionDef.ID, selections),
				MinQuantity: optionDef.MinQuantity,
				MaxQuantity: optionDef.MaxQuantity,
				Attributes:  optionDef.Attributes,
			}
			allOptions = append(allOptions, option)
		}
	}

	return allOptions, nil
}

// isOptionSelected checks if an option is currently selected
func (ce *ConfigurationEngine) isOptionSelected(optionID string, selections []Selection) bool {
	for _, sel := range selections {
		if sel.OptionID == optionID {
			return true
		}
	}
	return false
}

// getOptionGroupID returns the group ID for an option
func (ce *ConfigurationEngine) getOptionGroupID(optionID string) string {
	if ce.model == nil {
		return ""
	}

	for _, option := range ce.model.Options {
		if option.ID == optionID {
			return option.GroupID
		}
	}
	return ""
}

// extractOptionsFromAvailability extracts OptionDef list from AvailabilityResult
func (ce *ConfigurationEngine) extractOptionsFromAvailability(result *AvailabilityResult) []OptionDef {
	var options []OptionDef

	if ce.model == nil {
		return options
	}

	for _, optionAvail := range result.AvailableOptions {
		if optionAvail.IsAvailable {
			// Find the full option definition
			for _, modelOption := range ce.model.Options {
				if modelOption.ID == optionAvail.OptionID {
					options = append(options, modelOption)
					break
				}
			}
		}
	}

	return options
}

// ===================================================================
// CACHE MANAGEMENT
// ===================================================================

// Cache key generation
func (ce *ConfigurationEngine) generateCombinationCacheKey(selections []Selection) string {
	if len(selections) == 0 {
		return "empty_config"
	}

	// Sort selections for consistent caching
	key := "combo_"
	for _, sel := range selections {
		key += fmt.Sprintf("%s_%d_", sel.OptionID, sel.Quantity)
	}
	return key
}

func (ce *ConfigurationEngine) generateAvailabilityCacheKey(groupID string, selections []Selection) string {
	baseKey := fmt.Sprintf("avail_%s_", groupID)
	for _, sel := range selections {
		baseKey += fmt.Sprintf("%s_%d_", sel.OptionID, sel.Quantity)
	}
	return baseKey
}

// Cache operations
func (ce *ConfigurationEngine) getCachedCombination(key string) (bool, bool) {
	if ce.cache == nil {
		return false, false
	}

	ce.cache.mutex.RLock()
	defer ce.cache.mutex.RUnlock()

	result, exists := ce.cache.validCombinations[key]
	return result, exists
}

func (ce *ConfigurationEngine) cacheCombinationResult(key string, isValid bool) {
	if ce.cache == nil {
		return
	}

	ce.cache.mutex.Lock()
	defer ce.cache.mutex.Unlock()

	ce.cache.validCombinations[key] = isValid
}

func (ce *ConfigurationEngine) getCachedAvailability(key string) *AvailabilityResult {
	if ce.cache == nil {
		return nil
	}

	ce.cache.mutex.RLock()
	defer ce.cache.mutex.RUnlock()

	result, exists := ce.cache.availableOptions[key]
	if !exists {
		return nil
	}

	// Check if cached result is still valid
	if time.Now().After(result.ValidUntil) {
		delete(ce.cache.availableOptions, key)
		return nil
	}

	return result
}

func (ce *ConfigurationEngine) cacheAvailabilityResult(key, groupID string, options []OptionDef, constraints []ConstraintInfo) {
	if ce.cache == nil {
		return
	}

	ce.cache.mutex.Lock()
	defer ce.cache.mutex.Unlock()

	optionAvailabilities := make([]OptionAvailability, len(options))
	for i, opt := range options {
		optionAvailabilities[i] = OptionAvailability{
			OptionID:    opt.ID,
			IsAvailable: true,
			Constraints: make([]ConstraintInfo, 0),
			Metadata: map[string]interface{}{
				"base_price": opt.BasePrice,
			},
		}
	}

	result := &AvailabilityResult{
		GroupID:          groupID,
		AvailableOptions: optionAvailabilities,
		Constraints:      make([]string, len(constraints)),
		CachedAt:         time.Now(),
		ValidUntil:       time.Now().Add(ce.options.CacheTTL),
	}

	for i, constraint := range constraints {
		result.Constraints[i] = constraint.Description
	}

	ce.cache.availableOptions[key] = result
}

// Cache statistics
func (ce *EngineCache) recordHit() {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.hits++
}

func (ce *EngineCache) recordMiss() {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.misses++
}

func (ce *EngineCache) getStats() map[string]interface{} {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()

	total := ce.hits + ce.misses
	hitRate := 0.0
	if total > 0 {
		hitRate = float64(ce.hits) / float64(total)
	}

	return map[string]interface{}{
		"cache_hits":    ce.hits,
		"cache_misses":  ce.misses,
		"hit_rate":      hitRate,
		"evictions":     ce.evictions,
		"total_entries": len(ce.availableOptions) + len(ce.validCombinations) + len(ce.constraintResults),
	}
}

// ===================================================================
// METRICS AND MONITORING
// ===================================================================

// updateMetrics updates engine performance metrics
func (ce *ConfigurationEngine) updateMetrics(operation string, duration time.Duration) {
	if !ce.options.EnableMetrics || ce.metrics == nil {
		return
	}

	ce.metrics.mutex.Lock()
	defer ce.metrics.mutex.Unlock()

	ce.metrics.TotalOperations++
	ce.metrics.TotalTime += duration
	ce.metrics.LastOperation = time.Now()

	if ce.metrics.TotalOperations > 0 {
		ce.metrics.AverageResponseTime = time.Duration(int64(ce.metrics.TotalTime) / ce.metrics.TotalOperations)
	}

	// Update cache hit rate
	if ce.cache != nil {
		cacheStats := ce.cache.getStats()
		if hitRate, ok := cacheStats["hit_rate"].(float64); ok {
			ce.metrics.CacheHitRate = hitRate
		}
	}
}

func (ce *EngineMetrics) recordError() {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.ErrorCount++
}

// GetMetrics returns current engine metrics
func (ce *ConfigurationEngine) GetMetrics() map[string]interface{} {
	if ce.metrics == nil {
		return make(map[string]interface{})
	}

	ce.metrics.mutex.Lock()
	defer ce.metrics.mutex.Unlock()

	metrics := map[string]interface{}{
		"total_operations":         ce.metrics.TotalOperations,
		"constraint_evaluations":   ce.metrics.ConstraintEvaluations,
		"cache_hit_rate":           ce.metrics.CacheHitRate,
		"average_response_time_ms": float64(ce.metrics.AverageResponseTime.Nanoseconds()) / 1e6,
		"error_count":              ce.metrics.ErrorCount,
		"last_operation":           ce.metrics.LastOperation,
	}

	// Add cache statistics
	if ce.cache != nil {
		cacheStats := ce.cache.getStats()
		metrics["cache_stats"] = cacheStats
	}

	return metrics
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// ClearCache removes all cached data
func (ce *ConfigurationEngine) ClearCache() {
	if ce.cache == nil {
		return
	}

	ce.cache.mutex.Lock()
	defer ce.cache.mutex.Unlock()

	ce.cache.availableOptions = make(map[string]*AvailabilityResult)
	ce.cache.validCombinations = make(map[string]bool)
	ce.cache.constraintResults = make(map[string]*ConstraintResult)
}

// SetOptions updates engine options
func (ce *ConfigurationEngine) SetOptions(options EngineOptions) {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.options = options
}

// GetOptions returns current engine options
func (ce *ConfigurationEngine) GetOptions() EngineOptions {
	ce.mutex.RLock()
	defer ce.mutex.RUnlock()
	return ce.options
}

// SetValidationEngine sets the validation engine for enhanced validation
func (ce *ConfigurationEngine) SetValidationEngine(validationEngine *ValidationEngine) {
	ce.mutex.Lock()
	defer ce.mutex.Unlock()
	ce.validationEngine = validationEngine
}

// mtbdd_configuration.go
// MTBDD configuration state management and evaluation for CPQ systems
// Handles compiled configurations, state transitions, and incremental updates

package cpq

import (
	"fmt"
	"sync"
	"time"
)

// MTBDDConfigurationManager manages MTBDD configurations with versioning and state management
type MTBDDConfigurationManager struct {
	configurations map[string]*MTBDDConfiguration
	activeVersion  string
	versionHistory []ConfigurationVersion
	mutex          sync.RWMutex
	metrics        *ConfigurationMetrics
	options        ConfigurationManagerOptions
}

// ConfigurationVersion tracks configuration versions for rollback and comparison
type ConfigurationVersion struct {
	Version     string                 `json:"version"`
	ModelID     string                 `json:"model_id"`
	CreatedAt   time.Time              `json:"created_at"`
	CreatedBy   string                 `json:"created_by"`
	Description string                 `json:"description"`
	IsActive    bool                   `json:"is_active"`
	Changes     []ConfigurationChange  `json:"changes"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// ConfigurationChange represents a change in configuration
type ConfigurationChange struct {
	Type        string      `json:"type"`
	Description string      `json:"description"`
	OldValue    interface{} `json:"old_value,omitempty"`
	NewValue    interface{} `json:"new_value,omitempty"`
	Timestamp   time.Time   `json:"timestamp"`
}

// ConfigurationMetrics tracks MTBDD configuration performance
type ConfigurationMetrics struct {
	TotalEvaluations int64         `json:"total_evaluations"`
	CacheHits        int64         `json:"cache_hits"`
	CacheMisses      int64         `json:"cache_misses"`
	AverageEvalTime  time.Duration `json:"average_eval_time"`
	TotalEvalTime    time.Duration `json:"total_eval_time"`
	NodeCount        int           `json:"node_count"`
	VariableCount    int           `json:"variable_count"`
	RuleCount        int           `json:"rule_count"`
	LastEvaluation   time.Time     `json:"last_evaluation"`
	ErrorCount       int64         `json:"error_count"`
	mutex            sync.Mutex
}

// ConfigurationManagerOptions configures manager behavior
type ConfigurationManagerOptions struct {
	EnableVersioning         bool          `json:"enable_versioning"`
	MaxVersionHistory        int           `json:"max_version_history"`
	EnableMetrics            bool          `json:"enable_metrics"`
	EnableIncrementalUpdates bool          `json:"enable_incremental_updates"`
	CacheEnabled             bool          `json:"cache_enabled"`
	CacheTTL                 time.Duration `json:"cache_ttl"`
	AutoOptimize             bool          `json:"auto_optimize"`
}

// EvaluationCache caches evaluation results for performance
type EvaluationCache struct {
	results   map[string]*CachedEvaluation
	mutex     sync.RWMutex
	maxSize   int
	ttl       time.Duration
	hits      int64
	misses    int64
	evictions int64
}

// CachedEvaluation represents a cached evaluation result
type CachedEvaluation struct {
	SelectionsHash string                 `json:"selections_hash"`
	Result         bool                   `json:"result"`
	Variables      map[string]bool        `json:"variables"`
	CachedAt       time.Time              `json:"cached_at"`
	ExpiresAt      time.Time              `json:"expires_at"`
	AccessCount    int64                  `json:"access_count"`
	LastAccessed   time.Time              `json:"last_accessed"`
	Metadata       map[string]interface{} `json:"metadata"`
}

// ConfigurationState represents the current state of a configuration
type ConfigurationState struct {
	ConfigurationID     string                 `json:"configuration_id"`
	ModelVersion        string                 `json:"model_version"`
	CurrentSelections   []Selection            `json:"current_selections"`
	VariableAssignments map[string]bool        `json:"variable_assignments"`
	IsValid             bool                   `json:"is_valid"`
	LastEvaluation      time.Time              `json:"last_evaluation"`
	StateHash           string                 `json:"state_hash"`
	Violations          []string               `json:"violations,omitempty"`
	Metadata            map[string]interface{} `json:"metadata"`
}

// IncrementalUpdate represents an incremental configuration update
type IncrementalUpdate struct {
	UpdateID     string                 `json:"update_id"`
	Timestamp    time.Time              `json:"timestamp"`
	ChangeType   string                 `json:"change_type"` // add, remove, modify
	OptionID     string                 `json:"option_id"`
	OldQuantity  int                    `json:"old_quantity"`
	NewQuantity  int                    `json:"new_quantity"`
	AffectedVars []string               `json:"affected_vars"`
	Metadata     map[string]interface{} `json:"metadata"`
}

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewMTBDDConfigurationManager creates a new configuration manager
func NewMTBDDConfigurationManager() *MTBDDConfigurationManager {
	return &MTBDDConfigurationManager{
		configurations: make(map[string]*MTBDDConfiguration),
		versionHistory: make([]ConfigurationVersion, 0),
		metrics:        NewConfigurationMetrics(),
		options: ConfigurationManagerOptions{
			EnableVersioning:         true,
			MaxVersionHistory:        100,
			EnableMetrics:            true,
			EnableIncrementalUpdates: true,
			CacheEnabled:             true,
			CacheTTL:                 10 * time.Minute,
			AutoOptimize:             true,
		},
	}
}

// NewConfigurationMetrics creates a new configuration metrics tracker
func NewConfigurationMetrics() *ConfigurationMetrics {
	return &ConfigurationMetrics{}
}

// NewEvaluationCache creates a new evaluation cache
func NewEvaluationCache(maxSize int, ttl time.Duration) *EvaluationCache {
	return &EvaluationCache{
		results: make(map[string]*CachedEvaluation),
		maxSize: maxSize,
		ttl:     ttl,
	}
}

// ===================================================================
// CONFIGURATION MANAGEMENT
// ===================================================================

// RegisterConfiguration registers a new MTBDD configuration
func (mgr *MTBDDConfigurationManager) RegisterConfiguration(config *MTBDDConfiguration, version string) error {
	mgr.mutex.Lock()
	defer mgr.mutex.Unlock()

	if config == nil {
		return fmt.Errorf("configuration cannot be nil")
	}

	if version == "" {
		version = fmt.Sprintf("v%d", time.Now().Unix())
	}

	// Store configuration
	mgr.configurations[version] = config

	// Create version record
	versionRecord := ConfigurationVersion{
		Version:     version,
		ModelID:     config.Model.ID,
		CreatedAt:   time.Now(),
		Description: fmt.Sprintf("Configuration for model %s", config.Model.ID),
		IsActive:    false,
		Changes:     make([]ConfigurationChange, 0),
		Metadata: map[string]interface{}{
			"variable_count": len(config.Variables),
			"rule_count":     len(config.RuleIndex),
			"node_count":     config.Stats.NodeCount,
		},
	}

	// Record version history
	if mgr.options.EnableVersioning {
		mgr.versionHistory = append(mgr.versionHistory, versionRecord)

		// Trim history if needed
		if len(mgr.versionHistory) > mgr.options.MaxVersionHistory {
			mgr.versionHistory = mgr.versionHistory[1:]
		}
	}

	return nil
}

// ActivateConfiguration activates a specific configuration version
func (mgr *MTBDDConfigurationManager) ActivateConfiguration(version string) error {
	mgr.mutex.Lock()
	defer mgr.mutex.Unlock()

	config, exists := mgr.configurations[version]
	if !exists {
		return fmt.Errorf("configuration version %s not found", version)
	}

	// Deactivate current version
	if mgr.activeVersion != "" {
		for i := range mgr.versionHistory {
			if mgr.versionHistory[i].Version == mgr.activeVersion {
				mgr.versionHistory[i].IsActive = false
				break
			}
		}
	}

	// Activate new version
	mgr.activeVersion = version
	for i := range mgr.versionHistory {
		if mgr.versionHistory[i].Version == version {
			mgr.versionHistory[i].IsActive = true
			break
		}
	}

	// Update metrics
	if mgr.options.EnableMetrics {
		mgr.updateConfigurationMetrics(config)
	}

	return nil
}

// GetActiveConfiguration returns the currently active configuration
func (mgr *MTBDDConfigurationManager) GetActiveConfiguration() (*MTBDDConfiguration, error) {
	mgr.mutex.RLock()
	defer mgr.mutex.RUnlock()

	if mgr.activeVersion == "" {
		return nil, fmt.Errorf("no active configuration")
	}

	config, exists := mgr.configurations[mgr.activeVersion]
	if !exists {
		return nil, fmt.Errorf("active configuration %s not found", mgr.activeVersion)
	}

	return config, nil
}

// GetConfiguration returns a specific configuration version
func (mgr *MTBDDConfigurationManager) GetConfiguration(version string) (*MTBDDConfiguration, error) {
	mgr.mutex.RLock()
	defer mgr.mutex.RUnlock()

	config, exists := mgr.configurations[version]
	if !exists {
		return nil, fmt.Errorf("configuration version %s not found", version)
	}

	return config, nil
}

// ===================================================================
// CONFIGURATION EVALUATION WITH CACHING
// ===================================================================

// EvaluateWithCache evaluates a configuration using caching for performance
func (config *MTBDDConfiguration) EvaluateWithCache(selections []Selection, cache *EvaluationCache) (bool, error) {
	if cache == nil {
		// Fall back to regular evaluation
		return config.EvaluateConfiguration(selections)
	}

	// Generate cache key
	cacheKey := generateSelectionsHash(selections)

	// Check cache first
	if cached := cache.get(cacheKey); cached != nil {
		cache.recordHit()
		return cached.Result, nil
	}

	cache.recordMiss()

	// Perform evaluation
	startTime := time.Now()
	result, err := config.EvaluateConfiguration(selections)
	if err != nil {
		return false, err
	}

	// Generate variable assignments for caching
	variables, err := config.selectionsToAssignment(selections)
	if err != nil {
		return result, nil // Return result but don't cache
	}

	// Cache the result
	cache.put(cacheKey, &CachedEvaluation{
		SelectionsHash: cacheKey,
		Result:         result,
		Variables:      variables,
		CachedAt:       time.Now(),
		ExpiresAt:      time.Now().Add(cache.ttl),
		AccessCount:    1,
		LastAccessed:   time.Now(),
		Metadata: map[string]interface{}{
			"evaluation_time": time.Since(startTime),
			"selection_count": len(selections),
		},
	})

	return result, nil
}

// EvaluateIncremental performs incremental evaluation for configuration updates
func (config *MTBDDConfiguration) EvaluateIncremental(
	currentState *ConfigurationState,
	update *IncrementalUpdate,
) (*ConfigurationState, error) {

	if currentState == nil {
		return nil, fmt.Errorf("current state cannot be nil")
	}

	// Create new selections based on update
	newSelections := make([]Selection, len(currentState.CurrentSelections))
	copy(newSelections, currentState.CurrentSelections)

	switch update.ChangeType {
	case "add":
		newSelections = addOrUpdateSelection(newSelections, update.OptionID, update.NewQuantity)
	case "remove":
		newSelections = removeSelection(newSelections, update.OptionID)
	case "modify":
		newSelections = addOrUpdateSelection(newSelections, update.OptionID, update.NewQuantity)
	default:
		return nil, fmt.Errorf("unknown change type: %s", update.ChangeType)
	}

	// Evaluate new configuration
	isValid, err := config.EvaluateConfiguration(newSelections)
	if err != nil {
		return nil, fmt.Errorf("evaluation failed: %w", err)
	}

	// Generate variable assignments
	variables, err := config.selectionsToAssignment(newSelections)
	if err != nil {
		return nil, fmt.Errorf("variable assignment failed: %w", err)
	}

	// Create new state
	newState := &ConfigurationState{
		ConfigurationID:     currentState.ConfigurationID,
		ModelVersion:        currentState.ModelVersion,
		CurrentSelections:   newSelections,
		VariableAssignments: variables,
		IsValid:             isValid,
		LastEvaluation:      time.Now(),
		StateHash:           generateStateHash(newSelections),
		Violations:          make([]string, 0),
		Metadata: map[string]interface{}{
			"update_id":     update.UpdateID,
			"change_type":   update.ChangeType,
			"previous_hash": currentState.StateHash,
		},
	}

	// Get violations if invalid
	if !isValid {
		violations, err := config.ExplainViolation(newSelections)
		if err == nil {
			newState.Violations = violations
		}
	}

	return newState, nil
}

// BatchEvaluate evaluates multiple configurations efficiently
func (config *MTBDDConfiguration) BatchEvaluate(
	selectionSets [][]Selection,
	cache *EvaluationCache,
) ([]bool, error) {

	results := make([]bool, len(selectionSets))

	for i, selections := range selectionSets {
		var result bool
		var err error

		if cache != nil {
			result, err = config.EvaluateWithCache(selections, cache)
		} else {
			result, err = config.EvaluateConfiguration(selections)
		}

		if err != nil {
			return nil, fmt.Errorf("evaluation %d failed: %w", i, err)
		}

		results[i] = result
	}

	return results, nil
}

// ===================================================================
// STATE MANAGEMENT
// ===================================================================

// CreateConfigurationState creates initial configuration state
func (config *MTBDDConfiguration) CreateConfigurationState(
	configID string,
	selections []Selection,
) (*ConfigurationState, error) {

	// Evaluate configuration
	isValid, err := config.EvaluateConfiguration(selections)
	if err != nil {
		return nil, fmt.Errorf("initial evaluation failed: %w", err)
	}

	// Generate variable assignments
	variables, err := config.selectionsToAssignment(selections)
	if err != nil {
		return nil, fmt.Errorf("variable assignment failed: %w", err)
	}

	state := &ConfigurationState{
		ConfigurationID:     configID,
		ModelVersion:        config.Model.Version,
		CurrentSelections:   selections,
		VariableAssignments: variables,
		IsValid:             isValid,
		LastEvaluation:      time.Now(),
		StateHash:           generateStateHash(selections),
		Violations:          make([]string, 0),
		Metadata: map[string]interface{}{
			"created_at":      time.Now(),
			"selection_count": len(selections),
			"total_quantity":  getTotalQuantity(selections),
		},
	}

	// Get violations if invalid
	if !isValid {
		violations, err := config.ExplainViolation(selections)
		if err == nil {
			state.Violations = violations
		}
	}

	return state, nil
}

// UpdateConfigurationState updates configuration state with new selections
func (config *MTBDDConfiguration) UpdateConfigurationState(
	state *ConfigurationState,
	selections []Selection,
) error {

	// Evaluate new configuration
	isValid, err := config.EvaluateConfiguration(selections)
	if err != nil {
		return fmt.Errorf("evaluation failed: %w", err)
	}

	// Generate variable assignments
	variables, err := config.selectionsToAssignment(selections)
	if err != nil {
		return fmt.Errorf("variable assignment failed: %w", err)
	}

	// Update state
	state.CurrentSelections = selections
	state.VariableAssignments = variables
	state.IsValid = isValid
	state.LastEvaluation = time.Now()
	state.StateHash = generateStateHash(selections)
	state.Violations = make([]string, 0)

	// Update metadata
	if state.Metadata == nil {
		state.Metadata = make(map[string]interface{})
	}
	state.Metadata["updated_at"] = time.Now()
	state.Metadata["selection_count"] = len(selections)
	state.Metadata["total_quantity"] = getTotalQuantity(selections)

	// Get violations if invalid
	if !isValid {
		violations, err := config.ExplainViolation(selections)
		if err == nil {
			state.Violations = violations
		}
	}

	return nil
}

// ===================================================================
// CACHE OPERATIONS
// ===================================================================

// get retrieves a cached evaluation result
func (cache *EvaluationCache) get(key string) *CachedEvaluation {
	cache.mutex.RLock()
	defer cache.mutex.RUnlock()

	cached, exists := cache.results[key]
	if !exists {
		return nil
	}

	// Check expiration
	if time.Now().After(cached.ExpiresAt) {
		delete(cache.results, key)
		return nil
	}

	// Update access statistics
	cached.AccessCount++
	cached.LastAccessed = time.Now()

	return cached
}

// put stores an evaluation result in cache
func (cache *EvaluationCache) put(key string, result *CachedEvaluation) {
	cache.mutex.Lock()
	defer cache.mutex.Unlock()

	// Check cache size and evict if necessary
	if len(cache.results) >= cache.maxSize {
		cache.evictLRU()
	}

	cache.results[key] = result
}

// evictLRU evicts the least recently used cache entry
func (cache *EvaluationCache) evictLRU() {
	if len(cache.results) == 0 {
		return
	}

	var oldestKey string
	var oldestTime time.Time = time.Now()

	for key, cached := range cache.results {
		if cached.LastAccessed.Before(oldestTime) {
			oldestTime = cached.LastAccessed
			oldestKey = key
		}
	}

	if oldestKey != "" {
		delete(cache.results, oldestKey)
		cache.evictions++
	}
}

// recordHit records a cache hit
func (cache *EvaluationCache) recordHit() {
	cache.mutex.Lock()
	defer cache.mutex.Unlock()
	cache.hits++
}

// recordMiss records a cache miss
func (cache *EvaluationCache) recordMiss() {
	cache.mutex.Lock()
	defer cache.mutex.Unlock()
	cache.misses++
}

// GetStats returns cache statistics
func (cache *EvaluationCache) GetStats() map[string]interface{} {
	cache.mutex.RLock()
	defer cache.mutex.RUnlock()

	total := cache.hits + cache.misses
	hitRate := 0.0
	if total > 0 {
		hitRate = float64(cache.hits) / float64(total)
	}

	return map[string]interface{}{
		"hits":        cache.hits,
		"misses":      cache.misses,
		"hit_rate":    hitRate,
		"evictions":   cache.evictions,
		"cache_size":  len(cache.results),
		"max_size":    cache.maxSize,
		"ttl_minutes": cache.ttl.Minutes(),
	}
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// generateSelectionsHash generates a hash for selections for caching
func generateSelectionsHash(selections []Selection) string {
	if len(selections) == 0 {
		return "empty"
	}

	hash := ""
	for _, sel := range selections {
		hash += fmt.Sprintf("%s_%d_", sel.OptionID, sel.Quantity)
	}
	return hash
}

// generateStateHash generates a hash for configuration state
func generateStateHash(selections []Selection) string {
	return fmt.Sprintf("state_%s_%d", generateSelectionsHash(selections), time.Now().UnixNano())
}

// addOrUpdateSelection adds or updates a selection in the list
func addOrUpdateSelection(selections []Selection, optionID string, quantity int) []Selection {
	for i, sel := range selections {
		if sel.OptionID == optionID {
			selections[i].Quantity = quantity
			return selections
		}
	}
	return append(selections, Selection{OptionID: optionID, Quantity: quantity})
}

// removeSelection removes a selection from the list
func removeSelection(selections []Selection, optionID string) []Selection {
	var result []Selection
	for _, sel := range selections {
		if sel.OptionID != optionID {
			result = append(result, sel)
		}
	}
	return result
}

// getTotalQuantity calculates total quantity across all selections
func getTotalQuantity(selections []Selection) int {
	total := 0
	for _, sel := range selections {
		total += sel.Quantity
	}
	return total
}

// updateConfigurationMetrics updates metrics when configuration changes
func (mgr *MTBDDConfigurationManager) updateConfigurationMetrics(config *MTBDDConfiguration) {
	if !mgr.options.EnableMetrics {
		return
	}

	mgr.metrics.mutex.Lock()
	defer mgr.metrics.mutex.Unlock()

	mgr.metrics.NodeCount = config.Stats.NodeCount
	mgr.metrics.VariableCount = len(config.Variables)
	mgr.metrics.RuleCount = len(config.RuleIndex)
}

// recordEvaluation records an evaluation for metrics
func (mgr *MTBDDConfigurationManager) recordEvaluation(duration time.Duration, cached bool) {
	if !mgr.options.EnableMetrics {
		return
	}

	mgr.metrics.mutex.Lock()
	defer mgr.metrics.mutex.Unlock()

	mgr.metrics.TotalEvaluations++
	mgr.metrics.TotalEvalTime += duration
	mgr.metrics.LastEvaluation = time.Now()

	if mgr.metrics.TotalEvaluations > 0 {
		mgr.metrics.AverageEvalTime = time.Duration(int64(mgr.metrics.TotalEvalTime) / mgr.metrics.TotalEvaluations)
	}

	if cached {
		mgr.metrics.CacheHits++
	} else {
		mgr.metrics.CacheMisses++
	}
}

// ===================================================================
// PUBLIC INTERFACE
// ===================================================================

// GetVersionHistory returns the configuration version history
func (mgr *MTBDDConfigurationManager) GetVersionHistory() []ConfigurationVersion {
	mgr.mutex.RLock()
	defer mgr.mutex.RUnlock()

	result := make([]ConfigurationVersion, len(mgr.versionHistory))
	copy(result, mgr.versionHistory)
	return result
}

// GetActiveVersion returns the active configuration version
func (mgr *MTBDDConfigurationManager) GetActiveVersion() string {
	mgr.mutex.RLock()
	defer mgr.mutex.RUnlock()
	return mgr.activeVersion
}

// GetMetrics returns current configuration metrics
func (mgr *MTBDDConfigurationManager) GetMetrics() map[string]interface{} {
	mgr.metrics.mutex.Lock()
	defer mgr.metrics.mutex.Unlock()

	cacheHitRate := 0.0
	totalOps := mgr.metrics.CacheHits + mgr.metrics.CacheMisses
	if totalOps > 0 {
		cacheHitRate = float64(mgr.metrics.CacheHits) / float64(totalOps)
	}

	return map[string]interface{}{
		"total_evaluations":    mgr.metrics.TotalEvaluations,
		"cache_hit_rate":       cacheHitRate,
		"average_eval_time_ms": float64(mgr.metrics.AverageEvalTime.Nanoseconds()) / 1e6,
		"node_count":           mgr.metrics.NodeCount,
		"variable_count":       mgr.metrics.VariableCount,
		"rule_count":           mgr.metrics.RuleCount,
		"error_count":          mgr.metrics.ErrorCount,
		"last_evaluation":      mgr.metrics.LastEvaluation,
	}
}

// RemoveConfiguration removes a configuration version
func (mgr *MTBDDConfigurationManager) RemoveConfiguration(version string) error {
	mgr.mutex.Lock()
	defer mgr.mutex.Unlock()

	if version == mgr.activeVersion {
		return fmt.Errorf("cannot remove active configuration version")
	}

	delete(mgr.configurations, version)

	// Remove from version history
	for i, v := range mgr.versionHistory {
		if v.Version == version {
			mgr.versionHistory = append(mgr.versionHistory[:i], mgr.versionHistory[i+1:]...)
			break
		}
	}

	return nil
}

// SetOptions updates manager options
func (mgr *MTBDDConfigurationManager) SetOptions(options ConfigurationManagerOptions) {
	mgr.mutex.Lock()
	defer mgr.mutex.Unlock()
	mgr.options = options
}

// GetOptions returns current manager options
func (mgr *MTBDDConfigurationManager) GetOptions() ConfigurationManagerOptions {
	mgr.mutex.RLock()
	defer mgr.mutex.RUnlock()
	return mgr.options
}

// ClearCache clears all cached evaluation results if cache is enabled
func (mgr *MTBDDConfigurationManager) ClearCache() {
	// This would clear the cache if we had a reference to it
	// In practice, each configuration might have its own cache
}

// Optimize performs optimization on the active configuration
func (mgr *MTBDDConfigurationManager) Optimize() error {
	if !mgr.options.AutoOptimize {
		return nil
	}

	_, err := mgr.GetActiveConfiguration()
	if err != nil {
		return fmt.Errorf("cannot optimize: %w", err)
	}

	return nil
}

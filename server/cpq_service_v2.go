// cpq_service_v2.go - Enhanced CPQ Service with Repository Pattern
// Integrates database and cache repositories for better performance and persistence

package server

import (
	"fmt"
	"sync"
	"time"

	"DD/cache"
	"DD/cpq"
	"DD/modelbuilder"
	"DD/repository"
)

// CPQServiceV2 provides unified access to all CPQ functionality with database support
type CPQServiceV2 struct {
	// Repositories
	modelRepo  repository.ModelRepository
	configRepo repository.ConfigurationRepository
	cache      cache.CacheRepository

	// In-memory components for performance
	configurators map[string]*cpq.Configurator // Model ID -> Configurator
	modelCache    map[string]*cpq.Model        // Model ID -> Model (L1 cache)

	// Model builder tools
	conflictDetector *modelbuilder.ConflictDetector
	impactAnalyzer   *modelbuilder.ImpactAnalyzer
	modelValidator   *modelbuilder.ModelValidator
	priorityManager  *modelbuilder.RulePriorityManager

	// Statistics and synchronization
	stats     *SystemStats
	mutex     sync.RWMutex
	startTime time.Time

	// Configuration
	cacheTTL time.Duration
}

// NewCPQServiceV2 creates an enhanced CPQ service with repository support
func NewCPQServiceV2(
	modelRepo repository.ModelRepository,
	configRepo repository.ConfigurationRepository,
	cacheRepo cache.CacheRepository,
) (*CPQServiceV2, error) {
	service := &CPQServiceV2{
		modelRepo:     modelRepo,
		configRepo:    configRepo,
		cache:         cacheRepo,
		configurators: make(map[string]*cpq.Configurator),
		modelCache:    make(map[string]*cpq.Model),
		stats: &SystemStats{
			StartTime: time.Now(),
		},
		startTime: time.Now(),
		cacheTTL:  1 * time.Hour, // Default cache TTL
	}

	// Load initial models from database
	if err := service.loadModels(); err != nil {
		return nil, fmt.Errorf("failed to load models: %w", err)
	}

	return service, nil
}

// Model Operations

// AddModel adds a new model to the service and database
func (s *CPQServiceV2) AddModel(model *cpq.Model, userID string) error {
	// Validate model
	if err := model.Validate(); err != nil {
		return fmt.Errorf("model validation failed: %w", err)
	}

	// Save to database
	if err := s.modelRepo.CreateModel(model, userID); err != nil {
		return fmt.Errorf("failed to save model to database: %w", err)
	}

	// Create configurator
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to create configurator: %w", err)
	}

	// Update in-memory cache
	s.mutex.Lock()
	s.modelCache[model.ID] = model
	s.configurators[model.ID] = configurator
	s.mutex.Unlock()

	// Update distributed cache
	if err := s.cache.SetModel(model.ID, model, s.cacheTTL); err != nil {
		// Log but don't fail
		fmt.Printf("Warning: failed to cache model %s: %v\n", model.ID, err)
	}

	// Invalidate model list cache
	s.cache.Delete("models:list")

	s.updateStats(func(stats *SystemStats) {
		stats.ModelsCount++
	})

	return nil
}

// GetModel retrieves a model by ID with caching
func (s *CPQServiceV2) GetModel(modelID string) (*cpq.Model, error) {
	// Check L1 cache (in-memory)
	s.mutex.RLock()
	if model, exists := s.modelCache[modelID]; exists {
		s.mutex.RUnlock()
		return model, nil
	}
	s.mutex.RUnlock()

	// Check L2 cache (distributed)
	if model, found := s.cache.GetModel(modelID); found {
		// Update L1 cache
		s.mutex.Lock()
		s.modelCache[modelID] = model
		s.mutex.Unlock()
		return model, nil
	}

	// Load from database
	model, err := s.modelRepo.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	// Create configurator
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create configurator: %w", err)
	}

	// Update caches
	s.mutex.Lock()
	s.modelCache[modelID] = model
	s.configurators[modelID] = configurator
	s.mutex.Unlock()

	// Update distributed cache
	s.cache.SetModel(modelID, model, s.cacheTTL)

	return model, nil
}

// ListModels returns all available models with caching
func (s *CPQServiceV2) ListModels() ([]*cpq.Model, error) {
	// Check cache for model list
	cacheKey := "models:list"
	if cached, found := s.cache.Get(cacheKey); found {
		if models, ok := cached.([]*cpq.Model); ok {
			return models, nil
		}
	}

	// Load from database
	models, err := s.modelRepo.ListModels()
	if err != nil {
		return nil, err
	}

	// Cache the list
	s.cache.Set(cacheKey, models, 5*time.Minute)

	return models, nil
}

// UpdateModel updates a model in database and invalidates caches
func (s *CPQServiceV2) UpdateModel(modelID string, updates *cpq.Model) error {
	// Update in database
	if err := s.modelRepo.UpdateModel(modelID, updates); err != nil {
		return err
	}

	// Invalidate caches
	s.mutex.Lock()
	delete(s.modelCache, modelID)
	delete(s.configurators, modelID)
	s.mutex.Unlock()

	s.cache.InvalidateModel(modelID)
	s.cache.Delete("models:list")

	return nil
}

// DeleteModel soft deletes a model
func (s *CPQServiceV2) DeleteModel(modelID string) error {
	// Delete from database
	if err := s.modelRepo.DeleteModel(modelID); err != nil {
		return err
	}

	// Remove from caches
	s.mutex.Lock()
	delete(s.modelCache, modelID)
	delete(s.configurators, modelID)
	s.mutex.Unlock()

	s.cache.InvalidateModel(modelID)
	s.cache.Delete("models:list")

	s.updateStats(func(stats *SystemStats) {
		stats.ModelsCount--
	})

	return nil
}

// Configuration Operations

// CreateConfiguration creates a new configuration
func (s *CPQServiceV2) CreateConfiguration(modelID string, userID *string) (*cpq.Configuration, error) {
	// Verify model exists
	_, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	config := &cpq.Configuration{
		// ID will be generated by PostgreSQL
		ModelID:    modelID,
		Selections: make([]cpq.Selection, 0),
		IsValid:    true,
		TotalPrice: 0.0,
		Status:     "draft",
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	// Save to database
	if err := s.configRepo.CreateConfiguration(config, userID); err != nil {
		return nil, fmt.Errorf("failed to create configuration: %w", err)
	}

	// Cache it
	s.cache.SetConfiguration(config.ID, config, 30*time.Minute)

	s.updateStats(func(stats *SystemStats) {
		stats.ConfigurationsCount++
		stats.TotalRequests++
	})

	return config, nil
}

// UpdateConfiguration updates an existing configuration
func (s *CPQServiceV2) UpdateConfiguration(modelID string, configID string, selections []cpq.Selection) (*cpq.ConfigurationUpdate, error) {
	// Get configurator
	configurator, err := s.getConfigurator(modelID)
	if err != nil {
		return nil, err
	}

	// Create configuration object
	config := &cpq.Configuration{
		ID:         configID,
		ModelID:    modelID,
		Selections: selections,
		UpdatedAt:  time.Now(),
	}

	// Process update by clearing and re-adding selections
	start := time.Now()
	
	// Clear current selections
	currentConfig := configurator.GetCurrentConfiguration()
	for _, sel := range currentConfig.Selections {
		configurator.RemoveSelection(sel.OptionID)
	}
	
	// Add new selections and capture the last update for available options
	var lastUpdate *cpq.ConfigurationUpdate
	for _, sel := range selections {
		update, err := configurator.AddSelection(sel.OptionID, sel.Quantity)
		if err != nil {
			return nil, fmt.Errorf("failed to add selection %s: %w", sel.OptionID, err)
		}
		lastUpdate = &update
	}
	
	// If no selections, get current state
	if lastUpdate == nil {
		validation := configurator.ValidateCurrentConfiguration()
		pricing := configurator.GetDetailedPrice()
		
		// Get available options by making a dummy add
		var availableOptions []cpq.AvailableOption
		if len(s.modelCache[modelID].Options) > 0 {
			// Try to add first option to get available options
			testUpdate, err := configurator.AddSelection(s.modelCache[modelID].Options[0].ID, 1)
			if err == nil {
				availableOptions = testUpdate.AvailableOptions
				// Remove the test selection
				configurator.RemoveSelection(s.modelCache[modelID].Options[0].ID)
			}
		}
		
		lastUpdate = &cpq.ConfigurationUpdate{
			UpdatedConfig:    *config,
			ValidationResult: validation,
			PriceBreakdown:   pricing,
			AvailableOptions: availableOptions,
			IsValid:          validation.IsValid,
		}
	}
	
	// Update config from last update
	config.IsValid = lastUpdate.IsValid
	config.Selections = selections
	update := lastUpdate
	
	duration := time.Since(start)

	// Update configuration in database
	config.IsValid = update.IsValid
	config.TotalPrice = update.PriceBreakdown.TotalPrice
	if err := s.configRepo.SaveConfiguration(config); err != nil {
		return nil, fmt.Errorf("failed to save configuration: %w", err)
	}

	// Update cache
	s.cache.SetConfiguration(configID, config, 30*time.Minute)
	s.cache.SetAvailableOptions(configID, update.AvailableOptions, 5*time.Minute)
	s.cache.SetValidationResult(configID, &update.ValidationResult, 5*time.Minute)

	// Update stats
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
		if !update.ValidationResult.IsValid {
			stats.ErrorCount++
		}
	})

	return update, nil
}

// GetConfiguration retrieves a configuration
func (s *CPQServiceV2) GetConfiguration(configID string, userID *string) (*cpq.Configuration, error) {
	// Check cache first
	if config, found := s.cache.GetConfiguration(configID); found {
		return config, nil
	}

	// Load from database
	config, err := s.configRepo.GetConfiguration(configID, userID)
	if err != nil {
		return nil, err
	}

	// Cache it
	s.cache.SetConfiguration(configID, config, 30*time.Minute)

	return config, nil
}

// ValidateConfiguration validates a configuration
func (s *CPQServiceV2) ValidateConfiguration(modelID string, configID string) (*cpq.ValidationResult, error) {
	// Check cache first
	if result, found := s.cache.GetValidationResult(configID); found {
		return result, nil
	}

	// Get configuration
	_, err := s.GetConfiguration(configID, nil)
	if err != nil {
		return nil, err
	}

	// Get configurator
	configurator, err := s.getConfigurator(modelID)
	if err != nil {
		return nil, err
	}

	// Validate
	start := time.Now()
	result := configurator.ValidateCurrentConfiguration()
	duration := time.Since(start)

	// Cache result
	s.cache.SetValidationResult(configID, &result, 5*time.Minute)

	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return &result, nil
}

// CalculatePricing calculates pricing for a configuration
func (s *CPQServiceV2) CalculatePricing(modelID string, selections []cpq.Selection) (*cpq.PricingResult, error) {
	configurator, err := s.getConfigurator(modelID)
	if err != nil {
		return nil, err
	}

	start := time.Now()
	result, err := configurator.CalculatePricing(selections)
	if err != nil {
		return nil, fmt.Errorf("pricing calculation failed: %w", err)
	}
	duration := time.Since(start)

	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return result, nil
}

// Model Builder Operations (same as before)

func (s *CPQServiceV2) ValidateModel(modelID string) (*modelbuilder.ValidationReport, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	validator, err := modelbuilder.NewModelValidator(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create model validator: %w", err)
	}

	return validator.ValidateModel()
}

func (s *CPQServiceV2) DetectConflicts(modelID string) ([]modelbuilder.RuleConflict, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	detector, err := modelbuilder.NewConflictDetector(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create conflict detector: %w", err)
	}

	result, err := detector.DetectConflicts()
	if err != nil {
		return nil, err
	}

	return result.Conflicts, nil
}

func (s *CPQServiceV2) AnalyzeImpact(modelID string, ruleChanges []RuleChange) (*modelbuilder.ImpactAnalysis, error) {
	// For now, use the old method signature with a single rule change
	if len(ruleChanges) == 0 {
		return nil, fmt.Errorf("no rule changes provided")
	}
	
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	analyzer, err := modelbuilder.NewImpactAnalyzer(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create impact analyzer: %w", err)
	}

	// Use the first rule change for now (temporary implementation)
	change := ruleChanges[0]
	return analyzer.AnalyzeRuleChange(change.Type, change.OldRule, change.NewRule)
}

func (s *CPQServiceV2) OptimizePriorities(modelID string, priorities map[string]int) (*modelbuilder.PriorityAnalysis, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	manager, err := modelbuilder.NewRulePriorityManager(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create priority manager: %w", err)
	}

	// Apply manual priorities if provided
	for ruleID, priority := range priorities {
		if err := manager.SetManualPriority(ruleID, priority); err != nil {
			return nil, fmt.Errorf("failed to set priority for rule %s: %w", ruleID, err)
		}
	}

	// Optimize and analyze
	return manager.OptimizeExecutionOrder()
}

// Statistics Operations

func (s *CPQServiceV2) GetStats() SystemStats {
	s.stats.mutex.RLock()
	defer s.stats.mutex.RUnlock()

	// Create copy without mutex to avoid race conditions
	cacheStats := s.cache.Stats()
	return SystemStats{
		StartTime:           s.stats.StartTime,
		TotalRequests:       s.stats.TotalRequests,
		ActiveSessions:      s.stats.ActiveSessions,
		CacheHitRate:        cacheStats.HitRate,
		AvgResponseTime:     s.stats.AvgResponseTime,
		MemoryUsage:         cacheStats.Size,
		ConfigurationsCount: s.stats.ConfigurationsCount,
		ModelsCount:         s.stats.ModelsCount,
		ErrorCount:          s.stats.ErrorCount,
	}
}

// Helper methods

func (s *CPQServiceV2) loadModels() error {
	models, err := s.modelRepo.ListModels()
	if err != nil {
		return err
	}

	for _, model := range models {
		// Get full model with all data
		fullModel, err := s.modelRepo.GetModel(model.ID)
		if err != nil {
			continue
		}

		// Create configurator
		configurator, err := cpq.NewConfigurator(fullModel)
		if err != nil {
			continue
		}

		// Update in-memory cache
		s.modelCache[model.ID] = fullModel
		s.configurators[model.ID] = configurator

		// Update distributed cache
		s.cache.SetModel(model.ID, fullModel, s.cacheTTL)
	}

	s.updateStats(func(stats *SystemStats) {
		stats.ModelsCount = len(models)
	})

	return nil
}

func (s *CPQServiceV2) getConfigurator(modelID string) (*cpq.Configurator, error) {
	s.mutex.RLock()
	configurator, exists := s.configurators[modelID]
	s.mutex.RUnlock()

	if exists {
		return configurator, nil
	}

	// Load model and create configurator
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	configurator, err = cpq.NewConfigurator(model)
	if err != nil {
		return nil, err
	}

	s.mutex.Lock()
	s.configurators[modelID] = configurator
	s.mutex.Unlock()

	return configurator, nil
}

func (s *CPQServiceV2) updateStats(fn func(*SystemStats)) {
	s.stats.mutex.Lock()
	defer s.stats.mutex.Unlock()
	fn(s.stats)
}

// HealthCheck performs a health check on the service
func (s *CPQServiceV2) HealthCheck() error {
	// Check database connectivity
	if _, err := s.modelRepo.ListModels(); err != nil {
		return fmt.Errorf("database health check failed: %w", err)
	}

	// Check cache connectivity
	stats := s.cache.Stats()
	if stats.Size == 0 && stats.Hits == 0 && stats.Misses == 0 {
		// Try a test operation to verify cache is working
		testKey := "health:check"
		s.cache.Set(testKey, "ok", 1*time.Second)
		if _, found := s.cache.Get(testKey); !found {
			return fmt.Errorf("cache health check failed")
		}
		s.cache.Delete(testKey)
	}

	return nil
}

// CalculatePrice calculates pricing for a configuration
func (s *CPQServiceV2) CalculatePrice(modelID string, configID string) (*cpq.PricingResult, error) {
	// Get configuration
	config, err := s.GetConfiguration(configID, nil)
	if err != nil {
		return nil, err
	}
	
	return s.CalculatePricing(modelID, config.Selections)
}

// GetConfigurator returns the configurator for a model
func (s *CPQServiceV2) GetConfigurator(modelID string) (*cpq.Configurator, error) {
	return s.getConfigurator(modelID)
}

// ManagePriorities manages rule priorities for a model
func (s *CPQServiceV2) ManagePriorities(modelID string) (*modelbuilder.PriorityAnalysis, error) {
	// Get model
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	// Create priority manager
	manager, err := modelbuilder.NewRulePriorityManager(model)
	if err != nil {
		return nil, err
	}
	
	// Auto-optimize priorities
	return manager.OptimizeExecutionOrder()
}

// Group Operations

// AddGroup adds a new group to a model
func (s *CPQServiceV2) AddGroup(modelID string, group *cpq.Group) error {
	// Add to database
	if err := s.modelRepo.AddGroup(modelID, group); err != nil {
		return err
	}
	
	// Invalidate caches
	s.invalidateModelCache(modelID)
	return nil
}

// UpdateGroup updates an existing group
func (s *CPQServiceV2) UpdateGroup(modelID, groupID string, group *cpq.Group) error {
	// Update in database
	if err := s.modelRepo.UpdateGroup(modelID, groupID, group); err != nil {
		return err
	}
	
	// Invalidate caches
	s.invalidateModelCache(modelID)
	return nil
}

// DeleteGroup soft deletes a group
func (s *CPQServiceV2) DeleteGroup(modelID, groupID string) error {
	// Delete from database
	if err := s.modelRepo.DeleteGroup(modelID, groupID); err != nil {
		return err
	}
	
	// Invalidate caches
	s.invalidateModelCache(modelID)
	return nil
}

// invalidateModelCache invalidates all caches for a model
func (s *CPQServiceV2) invalidateModelCache(modelID string) {
	s.mutex.Lock()
	delete(s.modelCache, modelID)
	delete(s.configurators, modelID)
	s.mutex.Unlock()
	
	s.cache.InvalidateModel(modelID)
	s.cache.Delete("models:list")
}

// Option operations

// AddOption adds a new option to a model
func (s *CPQServiceV2) AddOption(modelID string, option *cpq.Option) error {
	if err := s.modelRepo.AddOption(modelID, option); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}

// UpdateOption updates an existing option
func (s *CPQServiceV2) UpdateOption(modelID, optionID string, option *cpq.Option) error {
	if err := s.modelRepo.UpdateOption(modelID, optionID, option); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}

// DeleteOption deletes an option (soft delete)
func (s *CPQServiceV2) DeleteOption(modelID, optionID string) error {
	if err := s.modelRepo.DeleteOption(modelID, optionID); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}

// Rule operations

// AddRule adds a new rule to a model
func (s *CPQServiceV2) AddRule(modelID string, rule *cpq.Rule) error {
	if err := s.modelRepo.AddRule(modelID, rule); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}

// UpdateRule updates an existing rule
func (s *CPQServiceV2) UpdateRule(modelID, ruleID string, rule *cpq.Rule) error {
	if err := s.modelRepo.UpdateRule(modelID, ruleID, rule); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}

// DeleteRule deletes a rule (soft delete)
func (s *CPQServiceV2) DeleteRule(modelID, ruleID string) error {
	if err := s.modelRepo.DeleteRule(modelID, ruleID); err != nil {
		return err
	}

	// Invalidate cache
	s.invalidateModelCache(modelID)
	return nil
}
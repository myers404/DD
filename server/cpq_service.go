// cpq_service.go - Core CPQ Business Logic Service
// Integrates with existing CPQ backend components and provides unified interface

package server

import (
	"fmt"
	"sync"
	"time"

	"DD/cpq"          // Main CPQ package
	"DD/modelbuilder" // Model building tools
)

// CPQService provides unified access to all CPQ functionality
type CPQService struct {
	configurators    map[string]*cpq.Configurator // Model ID -> Configurator
	models           map[string]*cpq.Model        // Model ID -> Model
	conflictDetector *modelbuilder.ConflictDetector
	impactAnalyzer   *modelbuilder.ImpactAnalyzer
	modelValidator   *modelbuilder.ModelValidator
	priorityManager  *modelbuilder.RulePriorityManager
	stats            *SystemStats
	mutex            sync.RWMutex
	startTime        time.Time
}

// SystemStats tracks system-wide statistics
type SystemStats struct {
	StartTime           time.Time     `json:"start_time"`
	TotalRequests       int64         `json:"total_requests"`
	ActiveSessions      int           `json:"active_sessions"`
	CacheHitRate        float64       `json:"cache_hit_rate"`
	AvgResponseTime     time.Duration `json:"avg_response_time"`
	MemoryUsage         int64         `json:"memory_usage"`
	ConfigurationsCount int           `json:"configurations_count"`
	ModelsCount         int           `json:"models_count"`
	ErrorCount          int64         `json:"error_count"`
	mutex               sync.RWMutex
}

// NewCPQService creates and initializes the CPQ service
func NewCPQService() (*CPQService, error) {
	service := &CPQService{
		configurators: make(map[string]*cpq.Configurator),
		models:        make(map[string]*cpq.Model),
		stats: &SystemStats{
			StartTime: time.Now(),
		},
		startTime: time.Now(),
	}

	// Load default models (in production, this would come from database)
	if err := service.loadDefaultModels(); err != nil {
		return nil, fmt.Errorf("failed to load default models: %w", err)
	}

	return service, nil
}

// loadDefaultModels loads default CPQ models for demonstration
func (s *CPQService) loadDefaultModels() error {
	// Create sample model for demonstration
	model := s.createSampleModel()

	if err := s.AddModel(model); err != nil {
		return fmt.Errorf("failed to add sample model: %w", err)
	}

	return nil
}

// createSampleModel creates a sample CPQ model for demonstration
func (s *CPQService) createSampleModel() *cpq.Model {
	model := &cpq.Model{
		ID:          "sample-laptop",
		Name:        "Sample Laptop Configuration",
		Description: "Demonstration laptop configuration model",
		Version:     "1.0.0",
		Options:     []cpq.Option{},
		Groups:      []cpq.Group{},
		Rules:       []cpq.Rule{},
		PriceRules:  []cpq.PriceRule{},
	}

	// Add sample options
	model.Options = []cpq.Option{
		{ID: "opt_cpu_basic", Name: "Basic CPU", BasePrice: 200.0, GroupID: "grp_cpu"},
		{ID: "opt_cpu_high", Name: "High Performance CPU", BasePrice: 500.0, GroupID: "grp_cpu"},
		{ID: "opt_ram_8gb", Name: "8GB RAM", BasePrice: 100.0, GroupID: "grp_memory"},
		{ID: "opt_ram_16gb", Name: "16GB RAM", BasePrice: 200.0, GroupID: "grp_memory"},
		{ID: "opt_storage_ssd", Name: "256GB SSD", BasePrice: 150.0, GroupID: "grp_storage"},
		{ID: "opt_storage_hdd", Name: "1TB HDD", BasePrice: 80.0, GroupID: "grp_storage"},
	}

	// Add sample groups
	model.Groups = []cpq.Group{
		{
			ID:        "grp_cpu",
			Name:      "CPU Selection",
			Type:      "single-select",
			OptionIDs: []string{"opt_cpu_basic", "opt_cpu_high"},
		},
		{
			ID:        "grp_memory",
			Name:      "Memory Selection",
			Type:      "single-select",
			OptionIDs: []string{"opt_ram_8gb", "opt_ram_16gb"},
		},
		{
			ID:        "grp_storage",
			Name:      "Storage Selection",
			Type:      "single-select",
			OptionIDs: []string{"opt_storage_ssd", "opt_storage_hdd"},
		},
	}

	// Add sample rules
	model.Rules = []cpq.Rule{
		{
			ID:         "rule_cpu_memory",
			Name:       "High CPU requires 16GB RAM",
			Type:       "requires",
			Expression: "opt_cpu_high -> opt_ram_16gb",
			Priority:   100,
		},
	}

	// Add sample pricing rules
	model.PriceRules = []cpq.PriceRule{
		{
			ID:         "pricing_volume_discount",
			Name:       "Volume Discount",
			Type:       "volume_tier",
			Expression: "total_quantity >= 10",
		},
	}

	return model
}

// Model Management

// AddModel adds a new model to the service
func (s *CPQService) AddModel(model *cpq.Model) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Validate model
	if err := model.Validate(); err != nil {
		return fmt.Errorf("model validation failed: %w", err)
	}

	// Create configurator for the model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to create configurator: %w", err)
	}

	// Store model and configurator
	s.models[model.ID] = model
	s.configurators[model.ID] = configurator

	s.updateStats(func(stats *SystemStats) {
		stats.ModelsCount++
	})

	return nil
}

// GetModel retrieves a model by ID
func (s *CPQService) GetModel(modelID string) (*cpq.Model, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	model, exists := s.models[modelID]
	if !exists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	return model, nil
}

// ListModels returns all available models
func (s *CPQService) ListModels() []*cpq.Model {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	models := make([]*cpq.Model, 0, len(s.models))
	for _, model := range s.models {
		models = append(models, model)
	}

	return models
}

// Configuration Management

// CreateConfiguration creates a new configuration for a model
func (s *CPQService) CreateConfiguration(modelID string) (*cpq.Configuration, error) {
	// Validate that the model exists
	s.mutex.RLock()
	_, modelExists := s.models[modelID]
	s.mutex.RUnlock()

	if !modelExists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	config := cpq.Configuration{
		ID:         generateConfigID(),
		ModelID:    modelID,
		Selections: make([]cpq.Selection, 0),
		IsValid:    true,
		TotalPrice: 0.0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	s.updateStats(func(stats *SystemStats) {
		stats.ConfigurationsCount++
		stats.TotalRequests++
	})

	return &config, nil
}

// Helper function to generate unique configuration IDs
func generateConfigID() string {
	return fmt.Sprintf("config-%d", time.Now().UnixNano())
}

// UpdateConfiguration updates an existing configuration
func (s *CPQService) UpdateConfiguration(modelID string, configID string, selections []cpq.Selection) (*cpq.ConfigurationUpdate, error) {
	s.mutex.RLock()
	configurator, exists := s.configurators[modelID]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	start := time.Now()

	// Apply selections
	var result cpq.ConfigurationUpdate
	var err error

	for _, selection := range selections {
		result, err = configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			s.updateStats(func(stats *SystemStats) {
				stats.ErrorCount++
			})
			return nil, fmt.Errorf("failed to add selection %s: %w", selection.OptionID, err)
		}
	}

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return &result, nil
}

// ValidateConfiguration validates a configuration
func (s *CPQService) ValidateConfiguration(modelID string, configID string) (*cpq.ValidationResult, error) {
	s.mutex.RLock()
	configurator, exists := s.configurators[modelID]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	start := time.Now()

	result := configurator.ValidateCurrentConfiguration()

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return &result, nil
}

// CalculatePrice calculates pricing for a configuration
func (s *CPQService) CalculatePrice(modelID string, configID string) (*cpq.PriceBreakdown, error) {
	s.mutex.RLock()
	configurator, exists := s.configurators[modelID]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	start := time.Now()

	pricing := configurator.GetDetailedPrice()

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return &pricing, nil
}

// Model Building Tools

// ValidateModel validates a model using the model validator
func (s *CPQService) ValidateModel(modelID string) (*modelbuilder.ValidationReport, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	validator, err := modelbuilder.NewModelValidator(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create model validator: %w", err)
	}

	start := time.Now()

	result, err := validator.ValidateModel()
	if err != nil {
		return nil, fmt.Errorf("model validation failed: %w", err)
	}

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return result, nil
}

// DetectConflicts detects rule conflicts in a model
func (s *CPQService) DetectConflicts(modelID string) ([]modelbuilder.RuleConflict, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	detector, err := modelbuilder.NewConflictDetector(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create conflict detector: %w", err)
	}

	start := time.Now()

	result, err := detector.DetectConflicts()
	if err != nil {
		return nil, fmt.Errorf("conflict detection failed: %w", err)
	}

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return result.Conflicts, nil
}

// AnalyzeImpact analyzes the impact of rule changes
func (s *CPQService) AnalyzeImpact(modelID string, changeType string, oldRule *cpq.Rule, newRule *cpq.Rule) (*modelbuilder.ImpactAnalysis, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	analyzer, err := modelbuilder.NewImpactAnalyzer(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create impact analyzer: %w", err)
	}

	start := time.Now()

	impact, err := analyzer.AnalyzeRuleChange(changeType, oldRule, newRule)
	if err != nil {
		return nil, fmt.Errorf("impact analysis failed: %w", err)
	}

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return impact, nil
}

// ManagePriorities manages rule priorities
func (s *CPQService) ManagePriorities(modelID string) (*modelbuilder.PriorityAnalysis, error) {
	model, err := s.GetModel(modelID)
	if err != nil {
		return nil, err
	}

	manager, err := modelbuilder.NewRulePriorityManager(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create priority manager: %w", err)
	}

	start := time.Now()

	result, err := manager.AnalyzePriorities()
	if err != nil {
		return nil, fmt.Errorf("priority management failed: %w", err)
	}

	duration := time.Since(start)
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests++
		stats.AvgResponseTime = (stats.AvgResponseTime + duration) / 2
	})

	return result, nil
}

// Statistics and Monitoring

// GetSystemStats returns current system statistics
func (s *CPQService) GetSystemStats() *SystemStats {
	s.stats.mutex.RLock()
	defer s.stats.mutex.RUnlock()

	// Create copy to avoid race conditions
	statsCopy := *s.stats
	return &statsCopy
}

// updateStats safely updates system statistics
func (s *CPQService) updateStats(updateFunc func(*SystemStats)) {
	s.stats.mutex.Lock()
	defer s.stats.mutex.Unlock()
	updateFunc(s.stats)
}

// ResetStats resets system statistics
func (s *CPQService) ResetStats() {
	s.updateStats(func(stats *SystemStats) {
		stats.TotalRequests = 0
		stats.ErrorCount = 0
		stats.AvgResponseTime = 0
		stats.StartTime = time.Now()
	})
}

// Health check
func (s *CPQService) HealthCheck() error {
	// Verify core components are accessible
	if len(s.models) == 0 {
		return fmt.Errorf("no models loaded")
	}

	if len(s.configurators) == 0 {
		return fmt.Errorf("no configurators available")
	}

	return nil
}

func (s *CPQService) GetConfigurator(modelID string) (*cpq.Configurator, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	configurator, exists := s.configurators[modelID]
	if !exists {
		return nil, fmt.Errorf("configurator not found for model: %s", modelID)
	}

	return configurator, nil
}

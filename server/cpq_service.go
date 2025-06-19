// cpq_service.go - Core CPQ Business Logic Service
// Integrates with existing CPQ backend components and provides unified interface

package server

import (
	"crypto/rand"
	"fmt"
	mathrand "math/rand"
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

	// Models will be loaded from database when needed

	return service, nil
}

// Model Management

// Note: AddModel method is in cpq_service_ext.go to match interface signature

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

// Note: ListModels method is in cpq_service_ext.go to match interface signature

// DeleteModel removes a model from the service
func (s *CPQService) DeleteModel(modelID string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Check if model exists
	if _, exists := s.models[modelID]; !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}

	// Remove model and configurator
	delete(s.models, modelID)
	delete(s.configurators, modelID)

	s.updateStats(func(stats *SystemStats) {
		stats.ModelsCount--
	})

	return nil
}

// Configuration Management

// Note: CreateConfiguration method is in cpq_service_ext.go to match interface signature

// Helper function to generate unique configuration IDs
func generateConfigID() string {
	// Generate a UUID v4 for PostgreSQL compatibility
	return generateUUID()
}

func generateUUID() string {
	// Simple UUID v4 generation
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		// Fallback to timestamp-based ID if random fails
		return fmt.Sprintf("%d-%d-%d-%d", time.Now().Unix(), time.Now().UnixNano(), mathrand.Int31(), mathrand.Int31())
	}
	// Set version (4) and variant bits
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
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

// CalculatePriceBreakdown calculates pricing breakdown for a configuration
func (s *CPQService) CalculatePriceBreakdown(modelID string, configID string) (*cpq.PriceBreakdown, error) {
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

// Note: AnalyzeImpact method is in cpq_service_ext.go to match interface signature

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
	// Service is healthy even with no models loaded
	// Models can be loaded dynamically as needed
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

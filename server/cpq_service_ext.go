// cpq_service_ext.go - Extension methods for CPQService to implement CPQServiceInterface

package server

import (
	"fmt"
	"time"
	
	"DD/cpq"
	"DD/modelbuilder"
)

// CalculatePrice wrapper to match interface signature
func (s *CPQService) CalculatePrice(modelID string, configID string) (*cpq.PricingResult, error) {
	breakdown, err := s.CalculatePriceBreakdown(modelID, configID)
	if err != nil {
		return nil, err
	}
	
	// Convert PriceBreakdown to PricingResult
	return &cpq.PricingResult{
		BasePrice:   breakdown.BasePrice,
		Adjustments: breakdown.Adjustments,
		TotalPrice:  breakdown.TotalPrice,
		Breakdown:   breakdown,
	}, nil
}

// These methods extend CPQService to fully implement CPQServiceInterface

// AddModel with userID parameter (for interface compatibility)
func (s *CPQService) AddModel(model *cpq.Model, userID string) error {
	// The in-memory implementation doesn't use userID
	// Call the original AddModel method
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

// CreateConfiguration with userID parameter (for interface compatibility)
func (s *CPQService) CreateConfiguration(modelID string, userID *string) (*cpq.Configuration, error) {
	// The in-memory implementation doesn't use userID
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

// UpdateModel - Add this method to satisfy the interface
func (s *CPQService) UpdateModel(modelID string, updates *cpq.Model) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Check if model exists
	if _, exists := s.models[modelID]; !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}

	// Validate the updated model
	if err := updates.Validate(); err != nil {
		return fmt.Errorf("model validation failed: %w", err)
	}

	// Create new configurator
	configurator, err := cpq.NewConfigurator(updates)
	if err != nil {
		return fmt.Errorf("failed to create configurator: %w", err)
	}

	// Update model and configurator
	s.models[modelID] = updates
	s.configurators[modelID] = configurator

	return nil
}

// GetConfiguration - Add this method to satisfy the interface
func (s *CPQService) GetConfiguration(configID string, userID *string) (*cpq.Configuration, error) {
	// This is a simplified implementation as the in-memory service doesn't persist configurations
	// In a real implementation, you would retrieve the configuration from storage
	return nil, fmt.Errorf("GetConfiguration not implemented for in-memory service")
}

// CalculatePricing - Add this method to satisfy the interface
func (s *CPQService) CalculatePricing(modelID string, selections []cpq.Selection) (*cpq.PricingResult, error) {
	s.mutex.RLock()
	configurator, exists := s.configurators[modelID]
	s.mutex.RUnlock()

	if !exists {
		return nil, fmt.Errorf("model not found: %s", modelID)
	}

	// Calculate pricing
	result, err := configurator.CalculatePricing(selections)
	if err != nil {
		return nil, fmt.Errorf("pricing calculation failed: %w", err)
	}

	return result, nil
}

// AnalyzeImpact - Update method signature to match interface
func (s *CPQService) AnalyzeImpact(modelID string, ruleChanges []RuleChange) (*modelbuilder.ImpactAnalysis, error) {
	// For now, return an error as the in-memory service doesn't support the new interface
	// The actual implementation uses a different method signature
	return nil, fmt.Errorf("AnalyzeImpact with RuleChange array not implemented for in-memory service")
}

// OptimizePriorities - Add this method to satisfy the interface
func (s *CPQService) OptimizePriorities(modelID string, priorities map[string]int) (*modelbuilder.PriorityAnalysis, error) {
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

// GetStats - Rename GetSystemStats to GetStats to match interface
func (s *CPQService) GetStats() SystemStats {
	s.stats.mutex.RLock()
	defer s.stats.mutex.RUnlock()

	// Create copy without mutex to avoid race conditions
	return SystemStats{
		StartTime:           s.stats.StartTime,
		TotalRequests:       s.stats.TotalRequests,
		ActiveSessions:      s.stats.ActiveSessions,
		CacheHitRate:        s.stats.CacheHitRate,
		AvgResponseTime:     s.stats.AvgResponseTime,
		MemoryUsage:         s.stats.MemoryUsage,
		ConfigurationsCount: s.stats.ConfigurationsCount,
		ModelsCount:         s.stats.ModelsCount,
		ErrorCount:          s.stats.ErrorCount,
	}
}

// ListModels - Update return type to match interface
func (s *CPQService) ListModels() ([]*cpq.Model, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	models := make([]*cpq.Model, 0, len(s.models))
	for _, model := range s.models {
		models = append(models, model)
	}

	return models, nil
}

// Group Operations

// AddGroup adds a new group to a model
func (s *CPQService) AddGroup(modelID string, group *cpq.Group) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Check for duplicate ID
	for _, existingGroup := range model.Groups {
		if existingGroup.ID == group.ID {
			return fmt.Errorf("group with ID %s already exists", group.ID)
		}
	}
	
	// Add group to model
	model.Groups = append(model.Groups, *group)
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// UpdateGroup updates an existing group
func (s *CPQService) UpdateGroup(modelID, groupID string, group *cpq.Group) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and update group
	found := false
	for i, existingGroup := range model.Groups {
		if existingGroup.ID == groupID {
			model.Groups[i] = *group
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("group not found: %s", groupID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// DeleteGroup soft deletes a group
func (s *CPQService) DeleteGroup(modelID, groupID string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and remove group
	found := false
	for i, group := range model.Groups {
		if group.ID == groupID {
			// Set as inactive instead of removing
			model.Groups[i].IsActive = false
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("group not found: %s", groupID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}
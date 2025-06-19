// cpq_service_ext_rules.go - Rule operations for CPQService

package server

import (
	"fmt"
	"DD/cpq"
)

// Rule Operations

// AddRule adds a new rule to a model
func (s *CPQService) AddRule(modelID string, rule *cpq.Rule) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Check for duplicate ID
	for _, existingRule := range model.Rules {
		if existingRule.ID == rule.ID {
			return fmt.Errorf("rule with ID %s already exists", rule.ID)
		}
	}
	
	// Add rule to model
	model.Rules = append(model.Rules, *rule)
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// UpdateRule updates an existing rule
func (s *CPQService) UpdateRule(modelID, ruleID string, rule *cpq.Rule) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and update rule
	found := false
	for i, existingRule := range model.Rules {
		if existingRule.ID == ruleID {
			model.Rules[i] = *rule
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("rule not found: %s", ruleID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// DeleteRule soft deletes a rule
func (s *CPQService) DeleteRule(modelID, ruleID string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and mark rule as inactive
	found := false
	for i, rule := range model.Rules {
		if rule.ID == ruleID {
			// Set as inactive instead of removing
			model.Rules[i].IsActive = false
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("rule not found: %s", ruleID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}
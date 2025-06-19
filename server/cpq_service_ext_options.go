// cpq_service_ext_options.go - Option operations for CPQService

package server

import (
	"fmt"
	"DD/cpq"
)

// Option Operations

// AddOption adds a new option to a model
func (s *CPQService) AddOption(modelID string, option *cpq.Option) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Check for duplicate ID
	for _, existingOption := range model.Options {
		if existingOption.ID == option.ID {
			return fmt.Errorf("option with ID %s already exists", option.ID)
		}
	}
	
	// Add option to model
	model.Options = append(model.Options, *option)
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// UpdateOption updates an existing option
func (s *CPQService) UpdateOption(modelID, optionID string, option *cpq.Option) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and update option
	found := false
	for i, existingOption := range model.Options {
		if existingOption.ID == optionID {
			model.Options[i] = *option
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("option not found: %s", optionID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}

// DeleteOption soft deletes an option
func (s *CPQService) DeleteOption(modelID, optionID string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	
	model, exists := s.models[modelID]
	if !exists {
		return fmt.Errorf("model not found: %s", modelID)
	}
	
	// Find and remove option
	found := false
	for i, option := range model.Options {
		if option.ID == optionID {
			// Set as inactive instead of removing
			model.Options[i].IsActive = false
			found = true
			break
		}
	}
	
	if !found {
		return fmt.Errorf("option not found: %s", optionID)
	}
	
	// Recreate configurator with updated model
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return fmt.Errorf("failed to recreate configurator: %w", err)
	}
	s.configurators[modelID] = configurator
	
	return nil
}
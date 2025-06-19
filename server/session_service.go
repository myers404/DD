package server

import (
	"fmt"
	"sync"

	"DD/cpq"
)

// SessionService provides session-based configuration management
type SessionService struct {
	sessionStore   SessionStore
	cpqService     *CPQServiceV2
	sessionManager *SessionManager
	mutex          sync.RWMutex
}

// NewSessionService creates a new session service
func NewSessionService(sessionStore SessionStore, cpqService *CPQServiceV2) *SessionService {
	service := &SessionService{
		sessionStore: sessionStore,
		cpqService:   cpqService,
	}
	
	// Create session manager
	service.sessionManager = NewSessionManager(sessionStore, nil)
	
	return service
}

// CreateConfigurationSession creates a new configuration session
func (s *SessionService) CreateConfigurationSession(modelID, userID string) (*ConfigurationSession, error) {
	// Get model from CPQ service
	model, err := s.cpqService.GetModel(modelID)
	if err != nil {
		return nil, fmt.Errorf("model not found: %w", err)
	}
	
	// Create a new configurator for this session
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return nil, fmt.Errorf("failed to create configurator: %w", err)
	}
	
	// Create session in store
	session, err := s.sessionStore.CreateSession(modelID, userID, configurator)
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}
	
	return session, nil
}

// GetSession retrieves an existing session
func (s *SessionService) GetSession(sessionID string) (*ConfigurationSession, error) {
	session, err := s.sessionStore.GetSession(sessionID)
	if err != nil {
		return nil, err
	}
	
	// If configurator is not loaded, reconstruct it
	if session.Configurator == nil {
		model, err := s.cpqService.GetModel(session.ModelID)
		if err != nil {
			return nil, fmt.Errorf("failed to get model for session: %w", err)
		}
		
		configurator, err := cpq.NewConfigurator(model)
		if err != nil {
			return nil, fmt.Errorf("failed to create configurator: %w", err)
		}
		
		// Apply saved selections
		for optionID, quantity := range session.Selections {
			_, err = configurator.AddSelection(optionID, quantity)
			if err != nil {
				// Log but continue - option might no longer be valid
				continue
			}
		}
		
		session.Configurator = configurator
	}
	
	return session, nil
}

// UpdateSessionConfiguration updates configuration in a session
func (s *SessionService) UpdateSessionConfiguration(sessionID string, selections []cpq.Selection) (*cpq.ConfigurationUpdate, error) {
	// Get session
	session, err := s.GetSession(sessionID)
	if err != nil {
		return nil, err
	}
	
	// Get current configuration to find existing selections
	currentConfig := session.Configurator.GetCurrentConfiguration()
	
	// Remove all existing selections
	for _, sel := range currentConfig.Selections {
		_, _ = session.Configurator.RemoveSelection(sel.OptionID)
	}
	
	// Apply new selections
	var result cpq.ConfigurationUpdate
	for _, selection := range selections {
		result, err = session.Configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			return nil, fmt.Errorf("failed to add selection %s: %w", selection.OptionID, err)
		}
	}
	
	// Update session selections
	newSelections := make(map[string]int)
	config := session.Configurator.GetCurrentConfiguration()
	for _, sel := range config.Selections {
		newSelections[sel.OptionID] = sel.Quantity
	}
	session.Selections = newSelections
	
	// Cache validation and pricing results
	session.ValidationState = &result.ValidationResult
	if result.PricingResult != nil {
		session.PricingState = result.PricingResult
	}
	
	// Save session state
	if err := s.sessionStore.SaveSession(session); err != nil {
		return nil, fmt.Errorf("failed to save session: %w", err)
	}
	
	return &result, nil
}

// ValidateSessionConfiguration validates a session's configuration
func (s *SessionService) ValidateSessionConfiguration(sessionID string) (*cpq.ValidationResult, error) {
	session, err := s.GetSession(sessionID)
	if err != nil {
		return nil, err
	}
	
	result := session.Configurator.ValidateCurrentConfiguration()
	
	// Cache the result
	session.ValidationState = &result
	s.sessionStore.SaveSession(session)
	
	return &result, nil
}

// CompleteSession marks a session as completed
func (s *SessionService) CompleteSession(sessionID string) error {
	return s.sessionStore.UpdateStatus(sessionID, SessionStatusCompleted)
}

// GetUserSessions retrieves all active sessions for a user
func (s *SessionService) GetUserSessions(userID string) ([]*ConfigurationSession, error) {
	return s.sessionStore.GetUserSessions(userID)
}

// GetModelSessions retrieves all sessions for a specific model with filtering and sorting
func (s *SessionService) GetModelSessions(modelID, status, sortBy, sortOrder string) ([]*ConfigurationSession, error) {
	return s.sessionStore.GetModelSessions(modelID, status, sortBy, sortOrder)
}

// ExtendSessionExpiry extends a session's expiration
func (s *SessionService) ExtendSessionExpiry(sessionID string, days int) error {
	return s.sessionStore.ExtendExpiry(sessionID, days)
}

// GetStatistics returns session statistics
func (s *SessionService) GetStatistics() (map[string]interface{}, error) {
	sessionStats, err := s.sessionStore.GetStatistics()
	if err != nil {
		// Don't fail if we can't get session stats
		sessionStats = &SessionStatistics{}
	}
	
	return map[string]interface{}{
		"active_sessions":    sessionStats.ActiveSessions,
		"total_sessions":     sessionStats.TotalSessions,
		"session_statistics": sessionStats,
	}, nil
}

// StartCleanupWorker starts background cleanup of expired sessions
func (s *SessionService) StartCleanupWorker() {
	s.sessionManager.StartCleanupWorker()
}
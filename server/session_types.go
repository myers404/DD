package server

import (
	"time"

	"DD/cpq"
)

// ConfigurationSession represents a user's configuration session
type ConfigurationSession struct {
	ID           string                    `json:"id" db:"id"`
	ModelID      string                    `json:"model_id" db:"model_id"`
	ModelVersion int                       `json:"model_version" db:"model_version"`
	Configurator *cpq.Configurator         `json:"-"` // Not stored in DB, reconstructed from snapshot
	Selections   map[string]int            `json:"selections" db:"selections"`
	UserID       string                    `json:"user_id" db:"user_id"`
	SessionToken string                    `json:"session_token" db:"session_token"`
	Status       string                    `json:"status" db:"status"`
	CreatedAt    time.Time                 `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time                 `json:"updated_at" db:"updated_at"`
	AccessedAt   time.Time                 `json:"accessed_at" db:"accessed_at"`
	ExpiresAt    time.Time                 `json:"expires_at" db:"expires_at"`
	IsDirty      bool                      `json:"is_dirty"`
	
	// Cached states
	ValidationState *cpq.ValidationResult  `json:"validation_state,omitempty" db:"validation_state"`
	PricingState    *cpq.PricingResult     `json:"pricing_state,omitempty" db:"pricing_state"`
	
	// Metadata
	Metadata map[string]interface{}        `json:"metadata" db:"metadata"`
}

// SessionStatus constants
const (
	SessionStatusDraft      = "draft"
	SessionStatusValidated  = "validated"
	SessionStatusCompleted  = "completed"
	SessionStatusAbandoned  = "abandoned"
)

// SessionStore interface for session persistence
type SessionStore interface {
	// Create a new session
	CreateSession(modelID, userID string, configurator *cpq.Configurator) (*ConfigurationSession, error)
	
	// Get session by ID
	GetSession(sessionID string) (*ConfigurationSession, error)
	
	// Get session by token
	GetSessionByToken(token string) (*ConfigurationSession, error)
	
	// Save session state
	SaveSession(session *ConfigurationSession) error
	
	// Update session selections
	UpdateSelections(sessionID string, selections map[string]int) error
	
	// Update session status
	UpdateStatus(sessionID string, status string) error
	
	// Extend session expiry
	ExtendExpiry(sessionID string, days int) error
	
	// Delete session
	DeleteSession(sessionID string) error
	
	// Cleanup expired sessions
	CleanupExpiredSessions() (int, error)
	
	// Get user's active sessions
	GetUserSessions(userID string) ([]*ConfigurationSession, error)
	
	// Get model's sessions with filtering and sorting
	GetModelSessions(modelID, status, sortBy, sortOrder string) ([]*ConfigurationSession, error)
	
	// Get session statistics
	GetStatistics() (*SessionStatistics, error)
}

// SessionStatistics holds aggregate session data
type SessionStatistics struct {
	TotalSessions          int64         `json:"total_sessions"`
	ActiveSessions         int64         `json:"active_sessions"`
	DraftSessions          int64         `json:"draft_sessions"`
	ValidatedSessions      int64         `json:"validated_sessions"`
	CompletedSessions      int64         `json:"completed_sessions"`
	AbandonedSessions      int64         `json:"abandoned_sessions"`
	AvgSessionDuration     time.Duration `json:"avg_session_duration"`
	AvgSelectionsPerSession float64      `json:"avg_selections_per_session"`
}

// SessionManager handles session lifecycle
type SessionManager struct {
	store        SessionStore
	cpqService   *CPQService
	sessionTTL   time.Duration
	cleanupInterval time.Duration
}

// NewSessionManager creates a new session manager
func NewSessionManager(store SessionStore, cpqService *CPQService) *SessionManager {
	return &SessionManager{
		store:           store,
		cpqService:      cpqService,
		sessionTTL:      30 * 24 * time.Hour, // 30 days default
		cleanupInterval: 1 * time.Hour,       // Cleanup every hour
	}
}

// CreateConfigurationSession creates a new configuration session
func (sm *SessionManager) CreateConfigurationSession(modelID, userID string) (*ConfigurationSession, error) {
	// Get the model
	model, err := sm.cpqService.GetModel(modelID)
	if err != nil {
		return nil, err
	}
	
	// Create a new configurator instance for this session
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return nil, err
	}
	
	// Create session in store
	session, err := sm.store.CreateSession(modelID, userID, configurator)
	if err != nil {
		return nil, err
	}
	
	return session, nil
}

// GetSession retrieves a session and reconstructs its configurator
func (sm *SessionManager) GetSession(sessionID string) (*ConfigurationSession, error) {
	session, err := sm.store.GetSession(sessionID)
	if err != nil {
		return nil, err
	}
	
	// Session will have configurator reconstructed from MTBDD snapshot
	return session, nil
}

// UpdateSelections updates session selections and runs validation
func (sm *SessionManager) UpdateSelections(sessionID string, selections []cpq.Selection) (*cpq.ConfigurationUpdate, error) {
	// Get session
	session, err := sm.GetSession(sessionID)
	if err != nil {
		return nil, err
	}
	
	// Apply selections to configurator
	var result cpq.ConfigurationUpdate
	for _, selection := range selections {
		result, err = session.Configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			return nil, err
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
	
	// Save session
	session.IsDirty = true
	if err := sm.store.SaveSession(session); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// CompleteSession marks a session as completed
func (sm *SessionManager) CompleteSession(sessionID string) error {
	return sm.store.UpdateStatus(sessionID, SessionStatusCompleted)
}

// StartCleanupWorker starts a background worker to clean expired sessions
func (sm *SessionManager) StartCleanupWorker() {
	ticker := time.NewTicker(sm.cleanupInterval)
	go func() {
		for range ticker.C {
			count, err := sm.store.CleanupExpiredSessions()
			if err != nil {
				// Log error in production
				continue
			}
			if count > 0 {
				// Log cleanup info in production
			}
		}
	}()
}
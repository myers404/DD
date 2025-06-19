package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"DD/cpq"
	"DD/mtbdd"
	
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// PostgresSessionStore implements SessionStore using PostgreSQL
type PostgresSessionStore struct {
	db *sqlx.DB
}

// NewPostgresSessionStore creates a new PostgreSQL session store
func NewPostgresSessionStore(db *sqlx.DB) *PostgresSessionStore {
	return &PostgresSessionStore{db: db}
}

// CreateSession creates a new configuration session
func (s *PostgresSessionStore) CreateSession(modelID, userID string, configurator *cpq.Configurator) (*ConfigurationSession, error) {
	// Generate session ID and token
	sessionID := uuid.New().String()
	sessionToken := generateSessionToken()
	
	// Get current configuration
	config := configurator.GetCurrentConfiguration()
	
	// For now, we'll store an empty MTBDD snapshot
	// In a full implementation, we'd serialize the actual MTBDD state
	mtbddSnapshot := []byte("{}")
	
	// Create selections map
	selections := make(map[string]int)
	for _, sel := range config.Selections {
		selections[sel.OptionID] = sel.Quantity
	}
	
	// Prepare session
	session := &ConfigurationSession{
		ID:           sessionID,
		ModelID:      modelID,
		ModelVersion: 1, // Default version
		Selections:   selections,
		UserID:       userID,
		SessionToken: sessionToken,
		Status:       SessionStatusDraft,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		AccessedAt:   time.Now(),
		ExpiresAt:    time.Now().Add(30 * 24 * time.Hour),
		Metadata:     make(map[string]interface{}),
	}
	
	// Insert into database
	query := `
		INSERT INTO configuration_sessions (
			id, model_id, model_version, mtbdd_snapshot, selections,
			user_id, session_token, status, created_at, updated_at, 
			accessed_at, expires_at, metadata
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
		)`
	
	selectionsJSON, _ := json.Marshal(selections)
	metadataJSON, _ := json.Marshal(session.Metadata)
	
	_, err := s.db.Exec(query,
		session.ID,
		session.ModelID,
		session.ModelVersion,
		mtbddSnapshot,
		selectionsJSON,
		session.UserID,
		session.SessionToken,
		session.Status,
		session.CreatedAt,
		session.UpdatedAt,
		session.AccessedAt,
		session.ExpiresAt,
		metadataJSON,
	)
	
	if err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}
	
	// Set the configurator on the session
	session.Configurator = configurator
	
	return session, nil
}

// GetSession retrieves a session and reconstructs its configurator
func (s *PostgresSessionStore) GetSession(sessionID string) (*ConfigurationSession, error) {
	var session ConfigurationSession
	var mtbddSnapshot []byte
	var selectionsJSON, validationJSON, pricingJSON, metadataJSON []byte
	
	query := `
		SELECT 
			id, model_id, model_version, mtbdd_snapshot, selections,
			validation_state, pricing_state, user_id, session_token,
			status, created_at, updated_at, accessed_at, expires_at, metadata
		FROM configuration_sessions
		WHERE id = $1 AND expires_at > NOW()`
	
	err := s.db.QueryRow(query, sessionID).Scan(
		&session.ID,
		&session.ModelID,
		&session.ModelVersion,
		&mtbddSnapshot,
		&selectionsJSON,
		&validationJSON,
		&pricingJSON,
		&session.UserID,
		&session.SessionToken,
		&session.Status,
		&session.CreatedAt,
		&session.UpdatedAt,
		&session.AccessedAt,
		&session.ExpiresAt,
		&metadataJSON,
	)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found or expired")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	
	// Unmarshal JSON fields
	json.Unmarshal(selectionsJSON, &session.Selections)
	json.Unmarshal(metadataJSON, &session.Metadata)
	
	if validationJSON != nil {
		var validationState cpq.ValidationResult
		json.Unmarshal(validationJSON, &validationState)
		session.ValidationState = &validationState
	}
	
	if pricingJSON != nil {
		var pricingState cpq.PricingResult
		json.Unmarshal(pricingJSON, &pricingState)
		session.PricingState = &pricingState
	}
	
	// Reconstruct configurator from MTBDD snapshot
	if err := s.reconstructConfigurator(&session, mtbddSnapshot); err != nil {
		return nil, fmt.Errorf("failed to reconstruct configurator: %w", err)
	}
	
	// Update accessed_at
	s.db.Exec("UPDATE configuration_sessions SET accessed_at = NOW() WHERE id = $1", sessionID)
	
	return &session, nil
}

// GetSessionByToken retrieves a session by its token
func (s *PostgresSessionStore) GetSessionByToken(token string) (*ConfigurationSession, error) {
	var sessionID string
	
	query := `SELECT id FROM configuration_sessions WHERE session_token = $1 AND expires_at > NOW()`
	err := s.db.QueryRow(query, token).Scan(&sessionID)
	
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found or expired")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get session by token: %w", err)
	}
	
	return s.GetSession(sessionID)
}

// SaveSession saves the current session state
func (s *PostgresSessionStore) SaveSession(session *ConfigurationSession) error {
	// For now, we'll store an empty MTBDD snapshot
	mtbddSnapshot := []byte("{}")
	
	// Prepare JSON fields
	selectionsJSON, _ := json.Marshal(session.Selections)
	metadataJSON, _ := json.Marshal(session.Metadata)
	
	var validationJSON, pricingJSON []byte
	if session.ValidationState != nil {
		validationJSON, _ = json.Marshal(session.ValidationState)
	}
	if session.PricingState != nil {
		pricingJSON, _ = json.Marshal(session.PricingState)
	}
	
	query := `
		UPDATE configuration_sessions SET
			mtbdd_snapshot = $2,
			selections = $3,
			validation_state = $4,
			pricing_state = $5,
			metadata = $6,
			updated_at = NOW(),
			accessed_at = NOW()
		WHERE id = $1`
	
	_, err := s.db.Exec(query,
		session.ID,
		mtbddSnapshot,
		selectionsJSON,
		validationJSON,
		pricingJSON,
		metadataJSON,
	)
	
	if err != nil {
		return fmt.Errorf("failed to save session: %w", err)
	}
	
	session.IsDirty = false
	return nil
}

// UpdateSelections updates only the selections for a session
func (s *PostgresSessionStore) UpdateSelections(sessionID string, selections map[string]int) error {
	selectionsJSON, _ := json.Marshal(selections)
	
	query := `
		UPDATE configuration_sessions SET
			selections = $2,
			updated_at = NOW(),
			accessed_at = NOW()
		WHERE id = $1`
	
	_, err := s.db.Exec(query, sessionID, selectionsJSON)
	return err
}

// UpdateStatus updates the session status
func (s *PostgresSessionStore) UpdateStatus(sessionID string, status string) error {
	query := `
		UPDATE configuration_sessions SET
			status = $2,
			updated_at = NOW()
		WHERE id = $1`
	
	_, err := s.db.Exec(query, sessionID, status)
	return err
}

// ExtendExpiry extends the session expiry time
func (s *PostgresSessionStore) ExtendExpiry(sessionID string, days int) error {
	query := `
		UPDATE configuration_sessions SET
			expires_at = NOW() + INTERVAL '%d days',
			accessed_at = NOW()
		WHERE id = $1`
	
	_, err := s.db.Exec(fmt.Sprintf(query, days), sessionID)
	return err
}

// DeleteSession removes a session
func (s *PostgresSessionStore) DeleteSession(sessionID string) error {
	_, err := s.db.Exec("DELETE FROM configuration_sessions WHERE id = $1", sessionID)
	return err
}

// CleanupExpiredSessions removes expired sessions
func (s *PostgresSessionStore) CleanupExpiredSessions() (int, error) {
	var count int
	err := s.db.QueryRow("SELECT cleanup_expired_sessions()").Scan(&count)
	return count, err
}

// GetUserSessions retrieves all active sessions for a user
func (s *PostgresSessionStore) GetUserSessions(userID string) ([]*ConfigurationSession, error) {
	query := `
		SELECT 
			id, model_id, status, created_at, updated_at, expires_at,
			selections, validation_state->>'is_valid' as is_valid
		FROM configuration_sessions
		WHERE user_id = $1 AND expires_at > NOW()
		ORDER BY updated_at DESC`
	
	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var sessions []*ConfigurationSession
	for rows.Next() {
		var session ConfigurationSession
		var selectionsJSON []byte
		var isValid sql.NullString
		
		err := rows.Scan(
			&session.ID,
			&session.ModelID,
			&session.Status,
			&session.CreatedAt,
			&session.UpdatedAt,
			&session.ExpiresAt,
			&selectionsJSON,
			&isValid,
		)
		if err != nil {
			continue
		}
		
		json.Unmarshal(selectionsJSON, &session.Selections)
		session.UserID = userID
		
		sessions = append(sessions, &session)
	}
	
	return sessions, nil
}

// GetModelSessions retrieves all sessions for a specific model with filtering and sorting
func (s *PostgresSessionStore) GetModelSessions(modelID, status, sortBy, sortOrder string) ([]*ConfigurationSession, error) {
	// Build query with filtering and sorting
	query := `
		SELECT 
			id, model_id, user_id, status, created_at, updated_at, accessed_at, expires_at,
			selections, validation_state, pricing_state, metadata
		FROM configuration_sessions
		WHERE model_id = $1`
	
	args := []interface{}{modelID}
	argCount := 1
	
	// Add status filter if provided
	if status != "" && status != "all" {
		argCount++
		// Map frontend status to database status
		dbStatus := status
		if status == "complete" {
			dbStatus = "completed"
		} else if status == "incomplete" {
			dbStatus = "draft"
		}
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, dbStatus)
	}
	
	// Add sorting
	validSortColumns := map[string]string{
		"created_at":  "created_at",
		"updated_at":  "updated_at",
		"createdAt":   "created_at",
		"updatedAt":   "updated_at",
		"price":       "pricing_state->>'total_price'",
	}
	
	sortColumn, ok := validSortColumns[sortBy]
	if !ok {
		sortColumn = "created_at"
	}
	
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}
	
	query += fmt.Sprintf(" ORDER BY %s %s", sortColumn, sortOrder)
	
	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	
	var sessions []*ConfigurationSession
	for rows.Next() {
		var session ConfigurationSession
		var selectionsJSON, validationJSON, pricingJSON, metadataJSON []byte
		
		err := rows.Scan(
			&session.ID,
			&session.ModelID,
			&session.UserID,
			&session.Status,
			&session.CreatedAt,
			&session.UpdatedAt,
			&session.AccessedAt,
			&session.ExpiresAt,
			&selectionsJSON,
			&validationJSON,
			&pricingJSON,
			&metadataJSON,
		)
		if err != nil {
			continue
		}
		
		// Unmarshal JSON fields
		if selectionsJSON != nil {
			json.Unmarshal(selectionsJSON, &session.Selections)
		}
		if validationJSON != nil {
			var validationState cpq.ValidationResult
			json.Unmarshal(validationJSON, &validationState)
			session.ValidationState = &validationState
		}
		if pricingJSON != nil {
			var pricingState cpq.PricingResult
			json.Unmarshal(pricingJSON, &pricingState)
			session.PricingState = &pricingState
		}
		if metadataJSON != nil {
			json.Unmarshal(metadataJSON, &session.Metadata)
		}
		
		sessions = append(sessions, &session)
	}
	
	return sessions, nil
}

// GetStatistics retrieves session statistics
func (s *PostgresSessionStore) GetStatistics() (*SessionStatistics, error) {
	var stats SessionStatistics
	
	query := `SELECT * FROM get_session_statistics()`
	
	err := s.db.QueryRow(query).Scan(
		&stats.TotalSessions,
		&stats.ActiveSessions,
		&stats.DraftSessions,
		&stats.ValidatedSessions,
		&stats.CompletedSessions,
		&stats.AbandonedSessions,
		&pq.NullTime{}, // For interval, we'll handle separately
		&stats.AvgSelectionsPerSession,
	)
	
	return &stats, err
}

// reconstructConfigurator rebuilds the configurator from MTBDD snapshot
func (s *PostgresSessionStore) reconstructConfigurator(session *ConfigurationSession, mtbddSnapshot []byte) error {
	// First, we need to get the model
	// In a real implementation, you'd have a model service/repository
	// For now, we'll assume the model is available through some means
	
	// Create a new MTBDD and deserialize
	mtbddInstance := mtbdd.NewMTBDD()
	if err := mtbddInstance.DeserializeCompressed(mtbddSnapshot); err != nil {
		return fmt.Errorf("failed to deserialize MTBDD: %w", err)
	}
	
	// NOTE: In a complete implementation, you would:
	// 1. Fetch the model from the database
	// 2. Create a new configurator with that model
	// 3. Replace the constraint engine's MTBDD with the deserialized one
	// 4. Apply the saved selections
	
	// For now, we'll mark this as a TODO
	// TODO: Complete configurator reconstruction
	
	return fmt.Errorf("configurator reconstruction not fully implemented")
}

// generateSessionToken creates a secure random token
func generateSessionToken() string {
	return uuid.New().String() + "-" + uuid.New().String()
}
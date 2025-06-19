package server

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"DD/cpq"
	"github.com/gorilla/mux"
)

// ConfigurationHandlersV2 handles session-based configuration endpoints
type ConfigurationHandlersV2 struct {
	service *SessionService
}

// NewConfigurationHandlersV2 creates new session-based handlers
func NewConfigurationHandlersV2(service *SessionService) *ConfigurationHandlersV2 {
	return &ConfigurationHandlersV2{
		service: service,
	}
}

// CreateConfiguration creates a new configuration session
func (h *ConfigurationHandlersV2) CreateConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req struct {
		ModelID     string                 `json:"model_id"`
		Name        string                 `json:"name"`
		Description string                 `json:"description"`
		Metadata    map[string]interface{} `json:"metadata"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	if req.ModelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Get user ID from context (set by auth middleware)
	userID := GetUserIDFromContext(r.Context())

	// Create configuration session
	session, err := h.service.CreateConfigurationSession(req.ModelID, userID)
	if err != nil {
		WriteErrorResponse(w, "CONFIG_CREATE_FAILED", "Failed to create configuration", err.Error(), http.StatusBadRequest)
		return
	}

	// Return session info
	response := map[string]interface{}{
		"session_id":       session.ID,
		"session_token":    session.SessionToken,
		"configuration_id": session.ID, // For backwards compatibility
		"model_id":         session.ModelID,
		"status":           session.Status,
		"expires_at":       session.ExpiresAt,
		"created_at":       session.CreatedAt,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// GetConfiguration retrieves a configuration session
func (h *ConfigurationHandlersV2) GetConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	// Try to get session by ID or token
	session, err := h.service.GetSession(sessionID)
	if err != nil {
		// Try by token if ID fails
		session, err = h.service.sessionStore.GetSessionByToken(sessionID)
		if err != nil {
			WriteNotFoundResponse(w, "Configuration session")
			return
		}
	}

	// Get current configuration from session
	config := session.Configurator.GetCurrentConfiguration()
	
	response := map[string]interface{}{
		"id":               session.ID,
		"session_id":       session.ID,
		"model_id":         session.ModelID,
		"status":           session.Status,
		"selections":       config.Selections,
		"is_valid":         config.IsValid,
		"total_price":      config.TotalPrice,
		"validation_state": session.ValidationState,
		"pricing_state":    session.PricingState,
		"created_at":       session.CreatedAt,
		"updated_at":       session.UpdatedAt,
		"expires_at":       session.ExpiresAt,
		"metadata":         session.Metadata,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// UpdateConfiguration updates a configuration session
func (h *ConfigurationHandlersV2) UpdateConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	var req struct {
		Selections []SelectionRequest             `json:"selections"`
		Metadata   map[string]interface{}         `json:"metadata"`
		Action     string                         `json:"action"` // Optional: "validate", "price", "complete"
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Convert selections
	selections := make([]cpq.Selection, len(req.Selections))
	for i, sel := range req.Selections {
		selections[i] = cpq.Selection{
			OptionID: sel.OptionID,
			Quantity: sel.Quantity,
		}
	}

	// Update configuration
	result, err := h.service.UpdateSessionConfiguration(sessionID, selections)
	if err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update configuration", err.Error(), http.StatusBadRequest)
		return
	}

	// Handle optional actions
	switch req.Action {
	case "complete":
		h.service.CompleteSession(sessionID)
	case "validate":
		// Already validated during update
	case "price":
		// Already priced during update
	}

	// Get updated session for response
	session, _ := h.service.GetSession(sessionID)

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	
	// Return update result with session info
	response := map[string]interface{}{
		"session_id":        sessionID,
		"configuration":     result.UpdatedConfig,
		"validation_result": result.ValidationResult,
		"price_breakdown":   result.PriceBreakdown,
		"available_options": result.AvailableOptions,
		"session_status":    session.Status,
		"expires_at":        session.ExpiresAt,
	}
	
	WriteSuccessResponse(w, response, meta)
}

// AddSelections adds selections to a configuration session
func (h *ConfigurationHandlersV2) AddSelections(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	var req struct {
		Selections []SelectionRequest `json:"selections"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Convert selections
	selections := make([]cpq.Selection, len(req.Selections))
	for i, sel := range req.Selections {
		selections[i] = cpq.Selection{
			OptionID: sel.OptionID,
			Quantity: sel.Quantity,
		}
	}

	// Add selections
	result, err := h.service.UpdateSessionConfiguration(sessionID, selections)
	if err != nil {
		WriteErrorResponse(w, "SELECTION_FAILED", "Failed to add selections", err.Error(), http.StatusBadRequest)
		return
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, result, meta)
}

// ValidateConfiguration validates a session's configuration
func (h *ConfigurationHandlersV2) ValidateConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	// Validate configuration
	result, err := h.service.ValidateSessionConfiguration(sessionID)
	if err != nil {
		WriteErrorResponse(w, "VALIDATION_FAILED", "Failed to validate configuration", err.Error(), http.StatusBadRequest)
		return
	}

	response := &ValidationResponse{
		IsValid:   result.IsValid,
		Result:    result,
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// CalculatePrice calculates pricing for a session
func (h *ConfigurationHandlersV2) CalculatePrice(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	// Get session first
	session, err := h.service.GetSession(sessionID)
	if err != nil {
		WriteErrorResponse(w, "SESSION_NOT_FOUND", "Session not found", err.Error(), http.StatusNotFound)
		return
	}
	
	// Validate configuration
	validationResult := session.Configurator.ValidateCurrentConfiguration()
	if !validationResult.IsValid {
		WriteErrorResponse(w, "INVALID_CONFIG", "Configuration must be valid to calculate price", "", http.StatusBadRequest)
		return
	}
	
	// Get pricing from configurator
	pricing := session.Configurator.GetDetailedPrice()
	
	// Create pricing result
	pricingResult := &cpq.PricingResult{
		BasePrice:  pricing.BasePrice,
		TotalPrice: pricing.TotalPrice,
		Breakdown:  &pricing,
	}

	response := &PricingResponse{
		Breakdown: pricingResult,
		Total:     pricing.TotalPrice,
		Currency:  "USD",
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetUserSessions retrieves all active sessions for the current user
func (h *ConfigurationHandlersV2) GetUserSessions(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	userID := GetUserIDFromContext(r.Context())

	sessions, err := h.service.GetUserSessions(userID)
	if err != nil {
		WriteErrorResponse(w, "SESSIONS_FETCH_FAILED", "Failed to get user sessions", err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response format
	sessionList := make([]map[string]interface{}, len(sessions))
	for i, session := range sessions {
		sessionList[i] = map[string]interface{}{
			"id":              session.ID,
			"model_id":        session.ModelID,
			"status":          session.Status,
			"selection_count": len(session.Selections),
			"created_at":      session.CreatedAt,
			"updated_at":      session.UpdatedAt,
			"expires_at":      session.ExpiresAt,
		}
	}

	response := map[string]interface{}{
		"sessions": sessionList,
		"count":    len(sessions),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelConfigurations retrieves all configurations for a specific model
func (h *ConfigurationHandlersV2) GetModelConfigurations(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["modelId"]
	
	// Log the request
	log.Printf("📋 GetModelConfigurations called for model: %s", modelID)

	// Get query parameters for filtering and sorting
	query := r.URL.Query()
	status := query.Get("status")
	sortBy := query.Get("sort_by")
	sortOrder := query.Get("sort_order")
	
	// Default sort
	if sortBy == "" {
		sortBy = "created_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}

	// Get all sessions for this model
	sessions, err := h.service.GetModelSessions(modelID, status, sortBy, sortOrder)
	if err != nil {
		WriteErrorResponse(w, "FETCH_FAILED", "Failed to get configurations", err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response format matching frontend expectations
	configurations := make([]map[string]interface{}, len(sessions))
	for i, session := range sessions {
		// Get user info if available
		userEmail := "Unknown User"
		if session.UserID != "" {
			userEmail = session.UserID // In real app, would look up user email
		}

		// Calculate total price
		totalPrice := float64(0)
		if session.PricingState != nil {
			totalPrice = session.PricingState.TotalPrice
		}

		// Get selected options with details
		selectedOptions := []map[string]interface{}{}
		for optionID, quantity := range session.Selections {
			selectedOptions = append(selectedOptions, map[string]interface{}{
				"option_id": optionID,
				"quantity":  quantity,
				"name":      optionID, // In real app, would look up option name
			})
		}

		// Determine configuration status
		configStatus := "incomplete"
		if session.Status == "completed" {
			configStatus = "complete"
		}

		// Check validity
		isValid := true
		var validationErrors []string
		if session.ValidationState != nil && !session.ValidationState.IsValid {
			isValid = false
			for _, violation := range session.ValidationState.Violations {
				validationErrors = append(validationErrors, violation.Message)
			}
		}

		configurations[i] = map[string]interface{}{
			"id":                 session.ID,
			"model_id":           session.ModelID,
			"user_id":            session.UserID,
			"user_email":         userEmail,
			"name":               fmt.Sprintf("Configuration %s", session.ID[:8]),
			"status":             configStatus,
			"is_valid":           isValid,
			"validation_errors":  validationErrors,
			"selections":         selectedOptions,
			"selection_count":    len(session.Selections),
			"total_price":        totalPrice,
			"created_at":         session.CreatedAt,
			"updated_at":         session.UpdatedAt,
			"accessed_at":        session.AccessedAt,
			"expires_at":         session.ExpiresAt,
			"session_status":     session.Status,
			"metadata":           session.Metadata,
		}
	}

	response := map[string]interface{}{
		"configurations": configurations,
		"total":          len(configurations),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// ExtendSession extends a session's expiration
func (h *ConfigurationHandlersV2) ExtendSession(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	var req struct {
		Days int `json:"days"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	if req.Days <= 0 || req.Days > 90 {
		WriteBadRequestResponse(w, "Days must be between 1 and 90")
		return
	}

	if err := h.service.ExtendSessionExpiry(sessionID, req.Days); err != nil {
		WriteErrorResponse(w, "EXTEND_FAILED", "Failed to extend session", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"session_id": sessionID,
		"extended":   true,
		"days":       req.Days,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// CompleteSession marks a session as completed
func (h *ConfigurationHandlersV2) CompleteSession(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sessionID := vars["id"]

	if err := h.service.CompleteSession(sessionID); err != nil {
		WriteErrorResponse(w, "COMPLETE_FAILED", "Failed to complete session", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"session_id": sessionID,
		"status":     SessionStatusCompleted,
		"completed":  true,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetSystemStats returns system statistics including session data
func (h *ConfigurationHandlersV2) GetSystemStats(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	stats, err := h.service.GetStatistics()
	if err != nil {
		WriteErrorResponse(w, "STATS_FAILED", "Failed to get statistics", err.Error(), http.StatusInternalServerError)
		return
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, stats, meta)
}

// Helper function to get user ID from context (placeholder)
func GetUserIDFromContext(ctx interface{}) string {
	// In a real implementation, this would extract the user ID from the JWT context
	// For now, return a default
	return "default-user"
}
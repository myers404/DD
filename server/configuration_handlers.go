// configuration_handlers.go - Configuration Management API Endpoints
// Handles all configuration-related HTTP requests with full CRUD operations

package server

import (
	"fmt"
	"net/http"
	"time"

	"DD/cpq"
	"github.com/gorilla/mux"
)

// ConfigurationHandlers provides HTTP handlers for configuration operations
type ConfigurationHandlers struct {
	service *CPQService
}

// NewConfigurationHandlers creates new configuration handlers
func NewConfigurationHandlers(service *CPQService) *ConfigurationHandlers {
	return &ConfigurationHandlers{
		service: service,
	}
}

// setupConfigurationRoutes sets up all configuration-related routes
func (s *Server) setupConfigurationRoutes(router *mux.Router) {
	handlers := NewConfigurationHandlers(s.cpqService)

	// Configuration CRUD operations
	router.HandleFunc("", handlers.CreateConfiguration).Methods("POST")
	router.HandleFunc("/{id}", handlers.GetConfiguration).Methods("GET")
	router.HandleFunc("/{id}", handlers.UpdateConfiguration).Methods("PUT")
	router.HandleFunc("/{id}", handlers.PatchConfiguration).Methods("PATCH")
	router.HandleFunc("/{id}", handlers.DeleteConfiguration).Methods("DELETE")

	// Configuration operations
	router.HandleFunc("/{id}/validate", handlers.ValidateCurrentConfiguration).Methods("POST")
	router.HandleFunc("/{id}/price", handlers.CalculatePrice).Methods("POST")
	router.HandleFunc("/{id}/summary", handlers.GetConfigurationSummary).Methods("GET")
	router.HandleFunc("/{id}/clone", handlers.CloneConfiguration).Methods("POST")

	// Selection management
	router.HandleFunc("/{id}/selections", handlers.AddSelections).Methods("POST")
	router.HandleFunc("/{id}/selections/{option_id}", handlers.UpdateSelection).Methods("PUT")
	router.HandleFunc("/{id}/selections/{option_id}", handlers.RemoveSelection).Methods("DELETE")
	router.HandleFunc("/{id}/available-options", handlers.GetAvailableOptions).Methods("GET")
	router.HandleFunc("/{id}/constraints", handlers.GetConstraints).Methods("GET")

	// Bulk operations
	router.HandleFunc("/{id}/bulk-selections", handlers.BulkSelections).Methods("POST")

	// Real-time validation (standalone endpoint)
	router.HandleFunc("/validate-selection", handlers.ValidateSelection).Methods("POST")
}

// Configuration CRUD Operations

// CreateConfiguration creates a new configuration
func (h *ConfigurationHandlers) CreateConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	// Parse request
	var req ConfigurationRequest
	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate required fields
	if req.ModelID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"model_id": "Model ID is required",
		})
		return
	}

	// Create configuration
	config, err := h.service.CreateConfiguration(req.ModelID)
	if err != nil {
		WriteErrorResponse(w, "CREATION_FAILED", "Failed to create configuration", err.Error(), http.StatusBadRequest)
		return
	}

	// Convert to response format
	response := &ConfigurationResponse{
		ID:          config.ID,
		ModelID:     config.ModelID,
		Name:        req.Name,
		Description: req.Description,
		IsValid:     config.IsValid,
		Selections:  config.Selections,
		CreatedAt:   time.Now().UTC(),
		UpdatedAt:   time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// GetConfiguration retrieves a configuration by ID
func (h *ConfigurationHandlers) GetConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	// Extract configuration ID
	vars := mux.Vars(r)
	configID := vars["id"]

	if configID == "" {
		WriteBadRequestResponse(w, "Configuration ID is required")
		return
	}

	// For this demo, we'll get the current configuration from a configurator
	// In production, you'd fetch from storage by ID
	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Get current configuration from configurator
	configurator, exists := h.service.configurators[modelID]
	if !exists {
		WriteNotFoundResponse(w, "Model")
		return
	}

	config := configurator.GetCurrentConfiguration()
	validation := configurator.ValidateCurrentConfiguration()
	price := configurator.GetDetailedPrice()

	response := &ConfigurationResponse{
		ID:         configID,
		ModelID:    config.ModelID,
		IsValid:    config.IsValid,
		Selections: config.Selections,
		Price:      &price,
		Validation: &validation,
		CreatedAt:  time.Now().UTC(),
		UpdatedAt:  time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// UpdateConfiguration updates an entire configuration
func (h *ConfigurationHandlers) UpdateConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	// Extract configuration ID
	vars := mux.Vars(r)
	configID := vars["id"]

	// Parse request
	var req struct {
		ModelID     string             `json:"model_id"`
		Selections  []SelectionRequest `json:"selections"`
		Name        string             `json:"name"`
		Description string             `json:"description"`
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
	result, err := h.service.UpdateConfiguration(req.ModelID, configID, selections)
	if err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update configuration", err.Error(), http.StatusBadRequest)
		return
	}

	response := &ConfigurationResponse{
		ID:          configID,
		ModelID:     req.ModelID,
		Name:        req.Name,
		Description: req.Description,
		IsValid:     result.IsValid,
		Selections:  result.UpdatedConfig.Selections,
		Price:       &result.PriceBreakdown,
		Validation:  &result.ValidationResult,
		UpdatedAt:   time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// PatchConfiguration partially updates a configuration
func (h *ConfigurationHandlers) PatchConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	var req struct {
		Name        *string `json:"name,omitempty"`
		Description *string `json:"description,omitempty"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// In production, you'd update the stored configuration
	// For demo, return success with updated timestamp
	response := map[string]interface{}{
		"id":         configID,
		"updated_at": time.Now().UTC(),
	}

	if req.Name != nil {
		response["name"] = *req.Name
	}
	if req.Description != nil {
		response["description"] = *req.Description
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeleteConfiguration deletes a configuration
func (h *ConfigurationHandlers) DeleteConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	// In production, you'd delete from storage
	// For demo, return success
	response := map[string]interface{}{
		"id":         configID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Configuration Operations

// ValidateCurrentConfiguration validates a configuration
func (h *ConfigurationHandlers) ValidateCurrentConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Validate configuration
	validation, err := h.service.ValidateConfiguration(modelID, configID)
	if err != nil {
		WriteErrorResponse(w, "VALIDATION_FAILED", "Failed to validate configuration", err.Error(), http.StatusBadRequest)
		return
	}

	response := &ValidationResponse{
		IsValid:   validation.IsValid,
		Result:    validation,
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// CalculatePrice calculates pricing for a configuration
func (h *ConfigurationHandlers) CalculatePrice(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Calculate pricing
	pricing, err := h.service.CalculatePrice(modelID, configID)
	if err != nil {
		WriteErrorResponse(w, "PRICING_FAILED", "Failed to calculate price", err.Error(), http.StatusBadRequest)
		return
	}

	response := &PricingResponse{
		Breakdown: pricing,
		Total:     pricing.TotalPrice,
		Currency:  "USD",
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetConfigurationSummary gets a configuration summary
func (h *ConfigurationHandlers) GetConfigurationSummary(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Get configurator
	configurator, exists := h.service.configurators[modelID]
	if !exists {
		WriteNotFoundResponse(w, "Model")
		return
	}

	config := configurator.GetCurrentConfiguration()
	validation := configurator.ValidateCurrentConfiguration()
	pricing := configurator.GetDetailedPrice()

	summary := map[string]interface{}{
		"id":               configID,
		"model_id":         config.ModelID,
		"is_valid":         config.IsValid,
		"selection_count":  len(config.Selections),
		"total_price":      pricing.TotalPrice,
		"validation_score": getValidationScore(validation),
		"last_updated":     time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, summary, meta)
}

// CloneConfiguration clones an existing configuration
func (h *ConfigurationHandlers) CloneConfiguration(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	sourceConfigID := vars["id"]

	var req struct {
		Name        string `json:"name,omitempty"`
		Description string `json:"description,omitempty"`
	}

	ParseJSONRequest(r, &req) // Optional body

	// Create new configuration based on existing one
	// In production, you'd copy the source configuration
	newConfigID := fmt.Sprintf("cloned-%s-%d", sourceConfigID, time.Now().Unix())

	response := map[string]interface{}{
		"id":          newConfigID,
		"source_id":   sourceConfigID,
		"name":        req.Name,
		"description": req.Description,
		"created_at":  time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// Selection Management

// AddSelections adds selections to a configuration
func (h *ConfigurationHandlers) AddSelections(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	var req struct {
		ModelID    string             `json:"model_id"`
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
	result, err := h.service.UpdateConfiguration(req.ModelID, configID, selections)
	if err != nil {
		WriteErrorResponse(w, "SELECTION_FAILED", "Failed to add selections", err.Error(), http.StatusBadRequest)
		return
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, result, meta)
}

// UpdateSelection updates a specific selection
func (h *ConfigurationHandlers) UpdateSelection(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]
	optionID := vars["option_id"]

	var req struct {
		Quantity int `json:"quantity"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	response := map[string]interface{}{
		"config_id":  configID,
		"option_id":  optionID,
		"quantity":   req.Quantity,
		"updated_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// RemoveSelection removes a selection from a configuration
func (h *ConfigurationHandlers) RemoveSelection(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]
	optionID := vars["option_id"]

	response := map[string]interface{}{
		"config_id":  configID,
		"option_id":  optionID,
		"removed":    true,
		"removed_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetAvailableOptions gets available options for a configuration
func (h *ConfigurationHandlers) GetAvailableOptions(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	configurator, err := h.service.GetConfigurator(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Get current configuration to know current state
	config := configurator.GetCurrentConfiguration()

	// Get available options by trying a dummy selection (if current is empty)
	// or by calling a method that returns options
	var availableOptions []cpq.AvailableOption

	if len(config.Selections) == 0 {
		// For empty configuration, try adding any option to get available options
		model, err := h.service.GetModel(modelID)
		if err != nil {
			WriteErrorResponse(w, "MODEL_ERROR", "Failed to get model", err.Error(), http.StatusInternalServerError)
			return
		}

		if len(model.Options) > 0 {
			// Try adding first option to get update with available options
			update, err := configurator.AddSelection(model.Options[0].ID, 1)
			if err == nil {
				availableOptions = update.AvailableOptions
				// Remove the test selection
				configurator.RemoveSelection(model.Options[0].ID)
			}
		}
	} else {
		// For existing configuration, trigger an update to get available options
		// Try updating an existing selection to get fresh available options
		if len(config.Selections) > 0 {
			firstSelection := config.Selections[0]
			update, err := configurator.UpdateSelection(firstSelection.OptionID, firstSelection.Quantity)
			if err == nil {
				availableOptions = update.AvailableOptions
			}
		}
	}

	response := map[string]interface{}{
		"config_id":         configID,
		"available_options": availableOptions,
		"total_count":       len(availableOptions),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetConstraints gets active constraints for a configuration
func (h *ConfigurationHandlers) GetConstraints(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	modelID := r.URL.Query().Get("model_id")
	if modelID == "" {
		WriteBadRequestResponse(w, "Model ID is required")
		return
	}

	// Get model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	response := map[string]interface{}{
		"config_id":   configID,
		"constraints": model.Rules,
		"total_count": len(model.Rules),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// BulkSelections performs bulk selection operations
func (h *ConfigurationHandlers) BulkSelections(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	configID := vars["id"]

	var req BulkSelectionRequest
	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	response := map[string]interface{}{
		"config_id":     configID,
		"operations":    len(req.Selections),
		"success_count": len(req.Selections), // Assume all succeed for demo
		"failed_count":  0,
		"processed_at":  time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// ValidateSelection validates a selection in real-time
func (h *ConfigurationHandlers) ValidateSelection(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req struct {
		ModelID  string `json:"model_id"`
		OptionID string `json:"option_id"`
		Quantity int    `json:"quantity"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Get configurator
	configurator, exists := h.service.configurators[req.ModelID]
	if !exists {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Test the selection
	result, err := configurator.AddSelection(req.OptionID, req.Quantity)

	var response interface{}
	if err != nil {
		response = map[string]interface{}{
			"valid":     false,
			"error":     err.Error(),
			"option_id": req.OptionID,
			"quantity":  req.Quantity,
		}
	} else {
		response = map[string]interface{}{
			"valid":      result.IsValid,
			"validation": result.ValidationResult,
			"option_id":  req.OptionID,
			"quantity":   req.Quantity,
		}
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Helper Functions

// getValidationScore calculates a validation score based on validation results
func getValidationScore(validation cpq.ValidationResult) float64 {
	if validation.IsValid {
		return 100.0
	}

	// Calculate score based on error severity
	score := 100.0
	for _, _ = range validation.Violations {
		score -= 5.0
	}

	if score < 0 {
		score = 0
	}

	return score
}

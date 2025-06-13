// response_types.go - API Response Types and Utilities
// Provides consistent response formatting and error handling

package server

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"DD/cpq"
	"DD/modelbuilder"
)

// APIResponse represents a standard API response wrapper
type APIResponse struct {
	Success   bool         `json:"success"`
	Data      interface{}  `json:"data,omitempty"`
	Error     *APIError    `json:"error,omitempty"`
	Meta      *APIMetadata `json:"meta,omitempty"`
	Timestamp time.Time    `json:"timestamp"`
}

// APIError represents detailed error information
type APIError struct {
	Code      string            `json:"code"`
	Message   string            `json:"message"`
	Details   string            `json:"details,omitempty"`
	Fields    map[string]string `json:"fields,omitempty"`
	RequestID string            `json:"request_id,omitempty"`
}

// APIMetadata provides additional response metadata
type APIMetadata struct {
	RequestID    string        `json:"request_id,omitempty"`
	ResponseTime time.Duration `json:"response_time"`
	Version      string        `json:"version"`
	TotalCount   int           `json:"total_count,omitempty"`
	PageSize     int           `json:"page_size,omitempty"`
	Page         int           `json:"page,omitempty"`
}

// Configuration API Types

// ConfigurationRequest represents a configuration creation request
type ConfigurationRequest struct {
	ModelID     string `json:"model_id" validate:"required"`
	Name        string `json:"name,omitempty"`
	Description string `json:"description,omitempty"`
}

// ConfigurationResponse represents a configuration response
type ConfigurationResponse struct {
	ID          string                `json:"id"`
	ModelID     string                `json:"model_id"`
	Name        string                `json:"name"`
	Description string                `json:"description"`
	IsValid     bool                  `json:"is_valid"`
	Selections  []cpq.Selection       `json:"selections"`
	Price       *cpq.PriceBreakdown   `json:"price,omitempty"`
	Validation  *cpq.ValidationResult `json:"validation,omitempty"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
}

// SelectionRequest represents a selection addition/update request
type SelectionRequest struct {
	OptionID string `json:"option_id" validate:"required"`
	Quantity int    `json:"quantity" validate:"min=1"`
}

// BulkSelectionRequest represents bulk selection operations
type BulkSelectionRequest struct {
	Selections []SelectionRequest `json:"selections" validate:"required"`
}

// Model API Types

// ModelResponse represents a model response
type ModelResponse struct {
	ID           string           `json:"id"`
	Name         string           `json:"name"`
	Description  string           `json:"description"`
	Version      string           `json:"version"`
	Options      []cpq.Option     `json:"options"`
	Groups       []cpq.Group      `json:"groups"`
	Rules        []cpq.Rule       `json:"rules"`
	PricingRules []cpq.PriceRule  `json:"price_rules"`
	Statistics   *ModelStatistics `json:"statistics,omitempty"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
}

// ModelStatistics represents model usage statistics
type ModelStatistics struct {
	ConfigurationsCount int           `json:"configurations_count"`
	SuccessRate         float64       `json:"success_rate"`
	AvgConfigTime       time.Duration `json:"avg_config_time"`
	PopularOptions      []string      `json:"popular_options"`
}

// ModelListResponse represents a list of models
type ModelListResponse struct {
	Models []ModelResponse `json:"models"`
	Total  int             `json:"total"`
}

// Validation API Types

// ValidationResponse represents validation results
type ValidationResponse struct {
	IsValid     bool                           `json:"is_valid"`
	Result      *cpq.ValidationResult          `json:"result"`
	ModelHealth *modelbuilder.ValidationReport `json:"model_health,omitempty"`
	Timestamp   time.Time                      `json:"timestamp"`
}

// ConflictResponse represents rule conflict detection results
type ConflictResponse struct {
	Conflicts     []modelbuilder.RuleConflict `json:"conflicts"`
	ConflictCount int                         `json:"conflict_count"`
	Severity      string                      `json:"severity"`
	Timestamp     time.Time                   `json:"timestamp"`
}

// ImpactResponse represents impact analysis results
type ImpactResponse struct {
	Analysis  *modelbuilder.ImpactAnalysis `json:"analysis"`
	Summary   string                       `json:"summary"`
	Timestamp time.Time                    `json:"timestamp"`
}

// PriorityResponse represents priority management results
type PriorityResponse struct {
	Result    *modelbuilder.PriorityAnalysis `json:"result"`
	Summary   string                         `json:"summary"`
	Timestamp time.Time                      `json:"timestamp"`
}

// Pricing API Types

// PricingRequest represents a pricing calculation request
type PricingRequest struct {
	ModelID    string                 `json:"model_id" validate:"required"`
	Selections []SelectionRequest     `json:"selections" validate:"required"`
	CustomerID string                 `json:"customer_id,omitempty"`
	Context    map[string]interface{} `json:"context,omitempty"`
}

// PricingResponse represents pricing calculation results
type PricingResponse struct {
	Breakdown *cpq.PriceBreakdown `json:"breakdown"`
	Total     float64             `json:"total"`
	Currency  string              `json:"currency"`
	Timestamp time.Time           `json:"timestamp"`
}

// Analytics API Types

// AnalyticsResponse represents analytics data
type AnalyticsResponse struct {
	MetricName  string      `json:"metric_name"`
	Data        interface{} `json:"data"`
	TimeRange   string      `json:"time_range"`
	Aggregation string      `json:"aggregation"`
	Timestamp   time.Time   `json:"timestamp"`
}

// Batch API Types

// BatchRequest represents a batch operation request
type BatchRequest struct {
	Operations []BatchOperation `json:"operations" validate:"required"`
	Parallel   bool             `json:"parallel"`
}

// BatchOperation represents a single operation in a batch
type BatchOperation struct {
	ID       string      `json:"id"`
	Type     string      `json:"type" validate:"required"`
	ModelID  string      `json:"model_id,omitempty"`
	ConfigID string      `json:"config_id,omitempty"`
	Data     interface{} `json:"data,omitempty"`
}

// BatchResponse represents batch operation results
type BatchResponse struct {
	Results   []BatchOperationResult `json:"results"`
	Success   int                    `json:"success"`
	Failed    int                    `json:"failed"`
	Total     int                    `json:"total"`
	Timestamp time.Time              `json:"timestamp"`
}

// BatchOperationResult represents a single operation result in a batch
type BatchOperationResult struct {
	ID      string      `json:"id"`
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

// Response Helper Functions

// NewSuccessResponse creates a successful API response
func NewSuccessResponse(data interface{}, meta *APIMetadata) *APIResponse {
	return &APIResponse{
		Success:   true,
		Data:      data,
		Meta:      meta,
		Timestamp: time.Now().UTC(),
	}
}

// NewErrorResponse creates an error API response
func NewErrorResponse(code, message, details string, statusCode int) *APIResponse {
	return &APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
		Timestamp: time.Now().UTC(),
	}
}

// NewValidationErrorResponse creates a validation error response
func NewValidationErrorResponse(fields map[string]string) *APIResponse {
	return &APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "VALIDATION_ERROR",
			Message: "Request validation failed",
			Fields:  fields,
		},
		Timestamp: time.Now().UTC(),
	}
}

// Response Writing Helpers

// WriteResponse writes an API response to the HTTP response writer
func WriteResponse(w http.ResponseWriter, response *APIResponse, statusCode int) {
	w.Header().Set("Content-Type", "application/json")

	// Set response time header if metadata is available
	if response.Meta != nil && response.Meta.ResponseTime > 0 {
		w.Header().Set("X-Response-Time", response.Meta.ResponseTime.String())
	}

	// Set request ID header if available
	if response.Meta != nil && response.Meta.RequestID != "" {
		w.Header().Set("X-Request-ID", response.Meta.RequestID)
	}

	w.WriteHeader(statusCode)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		// Fallback error response
		http.Error(w, "Internal server error", http.StatusInternalServerError)
	}
}

// WriteSuccessResponse writes a successful response
func WriteSuccessResponse(w http.ResponseWriter, data interface{}, meta *APIMetadata) {
	response := NewSuccessResponse(data, meta)
	WriteResponse(w, response, http.StatusOK)
}

// WriteCreatedResponse writes a created response (201)
func WriteCreatedResponse(w http.ResponseWriter, data interface{}, meta *APIMetadata) {
	response := NewSuccessResponse(data, meta)
	WriteResponse(w, response, http.StatusCreated)
}

// WriteErrorResponse writes an error response
func WriteErrorResponse(w http.ResponseWriter, code, message, details string, statusCode int) {
	response := NewErrorResponse(code, message, details, statusCode)
	WriteResponse(w, response, statusCode)
}

// WriteBadRequestResponse writes a bad request error
func WriteBadRequestResponse(w http.ResponseWriter, message string) {
	WriteErrorResponse(w, "BAD_REQUEST", message, "", http.StatusBadRequest)
}

// WriteNotFoundResponse writes a not found error
func WriteNotFoundResponse(w http.ResponseWriter, resource string) {
	message := fmt.Sprintf("%s not found", resource)
	WriteErrorResponse(w, "NOT_FOUND", message, "", http.StatusNotFound)
}

// WriteValidationErrorResponse writes a validation error
func WriteValidationErrorResponse(w http.ResponseWriter, fields map[string]string) {
	response := NewValidationErrorResponse(fields)
	WriteResponse(w, response, http.StatusBadRequest)
}

// WriteInternalErrorResponse writes an internal server error
func WriteInternalErrorResponse(w http.ResponseWriter, err error) {
	WriteErrorResponse(w, "INTERNAL_ERROR", "Internal server error", err.Error(), http.StatusInternalServerError)
}

// Request Parsing Helpers

// ParseJSONRequest parses JSON request body into target struct
func ParseJSONRequest(r *http.Request, target interface{}) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields() // Strict parsing

	if err := decoder.Decode(target); err != nil {
		return fmt.Errorf("invalid JSON: %w", err)
	}

	return nil
}

// ExtractPathParam extracts a path parameter from the request
func ExtractPathParam(r *http.Request, param string) (string, error) {
	// This would use mux.Vars(r) in practice
	// For now, simplified implementation
	value := r.URL.Query().Get(param)
	if value == "" {
		return "", fmt.Errorf("missing required parameter: %s", param)
	}
	return value, nil
}

// Performance Monitoring Helpers

// StartTimer returns a function to measure elapsed time
func StartTimer() func() time.Duration {
	start := time.Now()
	return func() time.Duration {
		return time.Since(start)
	}
}

// CreateMetadata creates response metadata with timing information
func CreateMetadata(requestID string, duration time.Duration) *APIMetadata {
	return &APIMetadata{
		RequestID:    requestID,
		ResponseTime: duration,
		Version:      "v1",
	}
}

// CreatePagedMetadata creates metadata for paged responses
func CreatePagedMetadata(requestID string, duration time.Duration, total, page, pageSize int) *APIMetadata {
	return &APIMetadata{
		RequestID:    requestID,
		ResponseTime: duration,
		Version:      "v1",
		TotalCount:   total,
		Page:         page,
		PageSize:     pageSize,
	}
}

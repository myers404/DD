// configuration_handlers_test.go - Unit Tests for Configuration Handlers
// Comprehensive test suite for all configuration management endpoints

package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/mux"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// Test Setup and Helpers

func setupTestConfigurationHandlers(t *testing.T) (*ConfigurationHandlers, *CPQService) {
	// Create test CPQ service
	service, err := NewCPQService()
	require.NoError(t, err, "Failed to create test CPQ service")

	// Create handlers
	handlers := NewConfigurationHandlers(service)
	require.NotNil(t, handlers, "Failed to create configuration handlers")

	return handlers, service
}

func createTestRequest(method, url string, body interface{}) *http.Request {
	var req *http.Request
	var err error

	if body != nil {
		jsonBody, _ := json.Marshal(body)
		req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		req.Header.Set("Content-Type", "application/json")
	} else {
		req, err = http.NewRequest(method, url, nil)
	}

	if err != nil {
		panic(fmt.Sprintf("Failed to create test request: %v", err))
	}

	req.Header.Set("X-Request-ID", "test-request-123")
	return req
}

func executeRequest(handler http.HandlerFunc, req *http.Request) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)
	return rr
}

func parseAPIResponse(t *testing.T, rr *httptest.ResponseRecorder) *APIResponse {
	var response APIResponse
	err := json.Unmarshal(rr.Body.Bytes(), &response)
	require.NoError(t, err, "Failed to parse API response")
	return &response
}

// Configuration CRUD Tests

func TestCreateConfiguration(t *testing.T) {
	handlers, service := setupTestConfigurationHandlers(t)

	tests := []struct {
		name             string
		requestBody      interface{}
		expectedStatus   int
		expectedSuccess  bool
		validateResponse func(t *testing.T, response *APIResponse)
	}{
		{
			name: "Valid configuration creation",
			requestBody: ConfigurationRequest{
				ModelID:     "sample-laptop",
				Name:        "Test Configuration",
				Description: "Test configuration description",
			},
			expectedStatus:  http.StatusCreated,
			expectedSuccess: true,
			validateResponse: func(t *testing.T, response *APIResponse) {
				assert.True(t, response.Success)
				assert.NotNil(t, response.Data)
				assert.NotNil(t, response.Meta)

				// Verify response data structure
				data, ok := response.Data.(*ConfigurationResponse)
				if ok {
					assert.NotEmpty(t, data.ID)
					assert.Equal(t, "sample-laptop", data.ModelID)
					assert.Equal(t, "Test Configuration", data.Name)
				}
			},
		},
		{
			name: "Missing model ID",
			requestBody: ConfigurationRequest{
				Name: "Test Configuration",
			},
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
			validateResponse: func(t *testing.T, response *APIResponse) {
				assert.False(t, response.Success)
				assert.NotNil(t, response.Error)
				assert.Equal(t, "VALIDATION_ERROR", response.Error.Code)
			},
		},
		{
			name: "Invalid model ID",
			requestBody: ConfigurationRequest{
				ModelID: "nonexistent-model",
				Name:    "Test Configuration",
			},
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
			validateResponse: func(t *testing.T, response *APIResponse) {
				assert.False(t, response.Success)
				assert.NotNil(t, response.Error)
				assert.Equal(t, "CREATION_FAILED", response.Error.Code)
			},
		},
		{
			name:            "Invalid JSON body",
			requestBody:     "invalid json",
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
			validateResponse: func(t *testing.T, response *APIResponse) {
				assert.False(t, response.Success)
				assert.NotNil(t, response.Error)
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := createTestRequest("POST", "/api/v1/configurations", tt.requestBody)
			rr := executeRequest(handlers.CreateConfiguration, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			response := parseAPIResponse(t, rr)
			assert.Equal(t, tt.expectedSuccess, response.Success)

			if tt.validateResponse != nil {
				tt.validateResponse(t, response)
			}
		})
	}

	// Verify service state after tests
	models := service.ListModels()
	assert.Len(t, models, 1, "Expected 1 model in service")
}

func TestGetConfiguration(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	tests := []struct {
		name            string
		configID        string
		modelID         string
		expectedStatus  int
		expectedSuccess bool
	}{
		{
			name:            "Valid configuration retrieval",
			configID:        "test-config-123",
			modelID:         "sample-laptop",
			expectedStatus:  http.StatusOK,
			expectedSuccess: true,
		},
		{
			name:            "Missing model ID",
			configID:        "test-config-123",
			modelID:         "",
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
		},
		{
			name:            "Invalid model ID",
			configID:        "test-config-123",
			modelID:         "nonexistent-model",
			expectedStatus:  http.StatusNotFound,
			expectedSuccess: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url := fmt.Sprintf("/api/v1/configurations/%s", tt.configID)
			if tt.modelID != "" {
				url += fmt.Sprintf("?model_id=%s", tt.modelID)
			}

			req := createTestRequest("GET", url, nil)

			// Add URL vars for mux
			req = mux.SetURLVars(req, map[string]string{"id": tt.configID})

			rr := executeRequest(handlers.GetConfiguration, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			response := parseAPIResponse(t, rr)
			assert.Equal(t, tt.expectedSuccess, response.Success)

			if response.Success {
				assert.NotNil(t, response.Data)
				assert.NotNil(t, response.Meta)
			}
		})
	}
}

func TestUpdateConfiguration(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	tests := []struct {
		name            string
		configID        string
		requestBody     interface{}
		expectedStatus  int
		expectedSuccess bool
	}{
		{
			name:     "Valid configuration update",
			configID: "test-config-123",
			requestBody: map[string]interface{}{
				"model_id": "sample-laptop",
				"name":     "Updated Configuration",
				"selections": []SelectionRequest{
					{OptionID: "opt_cpu_basic", Quantity: 1},
					{OptionID: "opt_ram_8gb", Quantity: 1},
				},
			},
			expectedStatus:  http.StatusOK,
			expectedSuccess: true,
		},
		{
			name:            "Invalid JSON body",
			configID:        "test-config-123",
			requestBody:     "invalid json",
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := createTestRequest("PUT", fmt.Sprintf("/api/v1/configurations/%s", tt.configID), tt.requestBody)
			req = mux.SetURLVars(req, map[string]string{"id": tt.configID})

			rr := executeRequest(handlers.UpdateConfiguration, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			response := parseAPIResponse(t, rr)
			assert.Equal(t, tt.expectedSuccess, response.Success)
		})
	}
}

func TestDeleteConfiguration(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	req := createTestRequest("DELETE", fmt.Sprintf("/api/v1/configurations/%s", configID), nil)
	req = mux.SetURLVars(req, map[string]string{"id": configID})

	rr := executeRequest(handlers.DeleteConfiguration, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)
	assert.NotNil(t, response.Data)
}

// Configuration Operations Tests

func TestValidateConfiguration(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	tests := []struct {
		name            string
		configID        string
		modelID         string
		expectedStatus  int
		expectedSuccess bool
	}{
		{
			name:            "Valid configuration validation",
			configID:        "test-config-123",
			modelID:         "sample-laptop",
			expectedStatus:  http.StatusOK,
			expectedSuccess: true,
		},
		{
			name:            "Missing model ID",
			configID:        "test-config-123",
			modelID:         "",
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			url := fmt.Sprintf("/api/v1/configurations/%s/validate", tt.configID)
			if tt.modelID != "" {
				url += fmt.Sprintf("?model_id=%s", tt.modelID)
			}

			req := createTestRequest("POST", url, nil)
			req = mux.SetURLVars(req, map[string]string{"id": tt.configID})

			rr := executeRequest(handlers.ValidateCurrentConfiguration, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			response := parseAPIResponse(t, rr)
			assert.Equal(t, tt.expectedSuccess, response.Success)

			if response.Success {
				// Verify validation response structure
				data := response.Data.(map[string]interface{})
				assert.Contains(t, data, "is_valid")
				assert.Contains(t, data, "result")
				assert.Contains(t, data, "timestamp")
			}
		})
	}
}

func TestGetConfigurationSummary(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	url := fmt.Sprintf("/api/v1/configurations/%s/summary?model_id=sample-laptop", configID)

	req := createTestRequest("GET", url, nil)
	req = mux.SetURLVars(req, map[string]string{"id": configID})

	rr := executeRequest(handlers.GetConfigurationSummary, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify summary response structure
	data := response.Data.(map[string]interface{})
	assert.Contains(t, data, "id")
	assert.Contains(t, data, "model_id")
	assert.Contains(t, data, "is_valid")
	assert.Contains(t, data, "selection_count")
	assert.Contains(t, data, "total_price")
	assert.Contains(t, data, "validation_score")
}

func TestCloneConfiguration(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	sourceConfigID := "test-config-123"
	requestBody := map[string]string{
		"name":        "Cloned Configuration",
		"description": "Cloned from test config",
	}

	req := createTestRequest("POST", fmt.Sprintf("/api/v1/configurations/%s/clone", sourceConfigID), requestBody)
	req = mux.SetURLVars(req, map[string]string{"id": sourceConfigID})

	rr := executeRequest(handlers.CloneConfiguration, req)

	assert.Equal(t, http.StatusCreated, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify clone response structure
	data := response.Data.(map[string]interface{})
	assert.Contains(t, data, "id")
	assert.Contains(t, data, "source_id")
	assert.Equal(t, sourceConfigID, data["source_id"])
	assert.Equal(t, "Cloned Configuration", data["name"])
}

// Selection Management Tests

func TestAddSelections(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	requestBody := map[string]interface{}{
		"model_id": "sample-laptop",
		"selections": []SelectionRequest{
			{OptionID: "opt_cpu_basic", Quantity: 1},
			{OptionID: "opt_ram_8gb", Quantity: 1},
		},
	}

	req := createTestRequest("POST", fmt.Sprintf("/api/v1/configurations/%s/selections", configID), requestBody)
	req = mux.SetURLVars(req, map[string]string{"id": configID})

	rr := executeRequest(handlers.AddSelections, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)
}

func TestUpdateSelection(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	optionID := "opt_cpu_basic"
	requestBody := map[string]int{
		"quantity": 2,
	}

	req := createTestRequest("PUT", fmt.Sprintf("/api/v1/configurations/%s/selections/%s", configID, optionID), requestBody)
	req = mux.SetURLVars(req, map[string]string{
		"id":        configID,
		"option_id": optionID,
	})

	rr := executeRequest(handlers.UpdateSelection, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify update response
	data := response.Data.(map[string]interface{})
	assert.Equal(t, configID, data["config_id"])
	assert.Equal(t, optionID, data["option_id"])
	assert.Equal(t, float64(2), data["quantity"]) // JSON unmarshals numbers as float64
}

func TestRemoveSelection(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	optionID := "opt_cpu_basic"

	req := createTestRequest("DELETE", fmt.Sprintf("/api/v1/configurations/%s/selections/%s", configID, optionID), nil)
	req = mux.SetURLVars(req, map[string]string{
		"id":        configID,
		"option_id": optionID,
	})

	rr := executeRequest(handlers.RemoveSelection, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify removal response
	data := response.Data.(map[string]interface{})
	assert.Equal(t, configID, data["config_id"])
	assert.Equal(t, optionID, data["option_id"])
	assert.True(t, data["removed"].(bool))
}

func TestGetAvailableOptions(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	url := fmt.Sprintf("/api/v1/configurations/%s/available-options?model_id=sample-laptop", configID)

	req := createTestRequest("GET", url, nil)
	req = mux.SetURLVars(req, map[string]string{"id": configID})

	rr := executeRequest(handlers.GetAvailableOptions, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify available options response
	data := response.Data.(map[string]interface{})
	assert.Contains(t, data, "config_id")
	assert.Contains(t, data, "available_options")
	assert.Contains(t, data, "total_count")
}

func TestBulkSelections(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	configID := "test-config-123"
	requestBody := BulkSelectionRequest{
		Selections: []SelectionRequest{
			{OptionID: "opt_cpu_basic", Quantity: 1},
			{OptionID: "opt_ram_8gb", Quantity: 1},
			{OptionID: "opt_storage_ssd", Quantity: 1},
		},
	}

	req := createTestRequest("POST", fmt.Sprintf("/api/v1/configurations/%s/bulk-selections", configID), requestBody)
	req = mux.SetURLVars(req, map[string]string{"id": configID})

	rr := executeRequest(handlers.BulkSelections, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	response := parseAPIResponse(t, rr)
	assert.True(t, response.Success)

	// Verify bulk operations response
	data := response.Data.(map[string]interface{})
	assert.Equal(t, configID, data["config_id"])
	assert.Equal(t, float64(3), data["operations"])
	assert.Equal(t, float64(3), data["success_count"])
	assert.Equal(t, float64(0), data["failed_count"])
}

func TestValidateSelection(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	tests := []struct {
		name            string
		requestBody     interface{}
		expectedStatus  int
		expectedSuccess bool
	}{
		{
			name: "Valid selection validation",
			requestBody: map[string]interface{}{
				"model_id":  "sample-laptop",
				"option_id": "opt_cpu_basic",
				"quantity":  1,
			},
			expectedStatus:  http.StatusOK,
			expectedSuccess: true,
		},
		{
			name: "Invalid model ID",
			requestBody: map[string]interface{}{
				"model_id":  "nonexistent-model",
				"option_id": "opt_cpu_basic",
				"quantity":  1,
			},
			expectedStatus:  http.StatusNotFound,
			expectedSuccess: false,
		},
		{
			name:            "Invalid JSON body",
			requestBody:     "invalid json",
			expectedStatus:  http.StatusBadRequest,
			expectedSuccess: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := createTestRequest("POST", "/api/v1/configurations/validate-selection", tt.requestBody)

			rr := executeRequest(handlers.ValidateSelection, req)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			response := parseAPIResponse(t, rr)
			assert.Equal(t, tt.expectedSuccess, response.Success)

			if response.Success {
				// Verify validation response structure
				data := response.Data.(map[string]interface{})
				assert.Contains(t, data, "valid")
				assert.Contains(t, data, "option_id")
				assert.Contains(t, data, "quantity")
			}
		})
	}
}

// Performance Tests

// Fixes for configuration_handlers_test.go

// Fix 1: Performance test expectations
// Replace the performance test section with these corrected expectations:

func TestConfigurationHandlersPerformance(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	// Test response time requirements (<200ms target)
	tests := []struct {
		name         string
		handler      http.HandlerFunc
		request      *http.Request
		maxDuration  time.Duration
		expectedCode int // Add expected status code
	}{
		{
			name:         "CreateConfiguration performance",
			handler:      handlers.CreateConfiguration,
			request:      createTestRequest("POST", "/api/v1/configurations", ConfigurationRequest{ModelID: "sample-laptop"}),
			maxDuration:  200 * time.Millisecond,
			expectedCode: http.StatusCreated, // 201, not 200
		},
		{
			name:    "GetConfiguration performance",
			handler: handlers.GetConfiguration,
			request: func() *http.Request {
				req := createTestRequest("GET", "/api/v1/configurations/test?model_id=sample-laptop", nil)
				return mux.SetURLVars(req, map[string]string{"id": "test"})
			}(),
			maxDuration:  200 * time.Millisecond,
			expectedCode: http.StatusOK, // 200 is correct for GET
		},
		{
			name:    "ValidateConfiguration performance",
			handler: handlers.ValidateCurrentConfiguration, // Use correct method name
			request: func() *http.Request {
				req := createTestRequest("POST", "/api/v1/configurations/test/validate?model_id=sample-laptop", nil)
				return mux.SetURLVars(req, map[string]string{"id": "test"})
			}(),
			maxDuration:  200 * time.Millisecond,
			expectedCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			start := time.Now()

			rr := executeRequest(tt.handler, tt.request)

			duration := time.Since(start)

			// Verify response is successful with correct status code
			assert.Equal(t, tt.expectedCode, rr.Code, "Handler should return correct status code")

			// Verify performance requirement
			assert.Less(t, duration, tt.maxDuration,
				fmt.Sprintf("Handler should complete within %v, took %v", tt.maxDuration, duration))

			// Verify response contains timing information in metadata
			response := parseAPIResponse(t, rr)
			if response.Success && response.Meta != nil {
				assert.Greater(t, response.Meta.ResponseTime, time.Duration(0), "Response time should be tracked in metadata")
			}
		})
	}
}

// Fix 2: Error handling test
// Replace the error handling test with this safer version:

func TestConfigurationHandlersErrorHandling(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	// Test various error scenarios
	tests := []struct {
		name           string
		handler        http.HandlerFunc
		request        *http.Request
		expectedStatus int
		expectedError  string
	}{
		{
			name:           "Invalid content type for CreateConfiguration",
			handler:        handlers.CreateConfiguration,
			request:        createInvalidRequest(), // Use helper to create safe invalid request
			expectedStatus: http.StatusBadRequest,
			expectedError:  "Invalid request body",
		},
		{
			name:    "Missing path parameter for GetConfiguration",
			handler: handlers.GetConfiguration,
			request: func() *http.Request {
				req := createTestRequest("GET", "/api/v1/configurations/?model_id=sample-laptop", nil)
				return mux.SetURLVars(req, map[string]string{}) // Empty vars
			}(),
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:    "Non-existent model for GetConfiguration",
			handler: handlers.GetConfiguration,
			request: func() *http.Request {
				req := createTestRequest("GET", "/api/v1/configurations/test?model_id=nonexistent-model", nil)
				return mux.SetURLVars(req, map[string]string{"id": "test"})
			}(),
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rr := executeRequest(tt.handler, tt.request)

			assert.Equal(t, tt.expectedStatus, rr.Code)

			// Only parse response if we got a JSON response
			if rr.Header().Get("Content-Type") == "application/json" {
				response := parseAPIResponse(t, rr)
				assert.False(t, response.Success)
				assert.NotNil(t, response.Error)

				if tt.expectedError != "" {
					assert.Contains(t, response.Error.Message, tt.expectedError)
				}
			}
		})
	}
}

// Helper function to create a safe invalid request
func createInvalidRequest() *http.Request {
	// Create a request with invalid JSON but valid structure to avoid panic
	req, _ := http.NewRequest("POST", "/api/v1/configurations", strings.NewReader(`{"invalid": json`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "test-error-request")
	return req
}

// Concurrency Tests

func TestConfigurationHandlersConcurrency(t *testing.T) {
	handlers, _ := setupTestConfigurationHandlers(t)

	// Test concurrent requests
	numRequests := 10
	results := make(chan *httptest.ResponseRecorder, numRequests)

	// Launch concurrent requests
	for i := 0; i < numRequests; i++ {
		go func(id int) {
			req := createTestRequest("POST", "/api/v1/configurations", ConfigurationRequest{
				ModelID: "sample-laptop",
				Name:    fmt.Sprintf("Concurrent Config %d", id),
			})

			rr := executeRequest(handlers.CreateConfiguration, req)
			results <- rr
		}(i)
	}

	// Collect results
	successCount := 0
	for i := 0; i < numRequests; i++ {
		rr := <-results
		if rr.Code == http.StatusCreated {
			successCount++
		}
	}

	// All requests should succeed
	assert.Equal(t, numRequests, successCount,
		"All concurrent requests should succeed")
}

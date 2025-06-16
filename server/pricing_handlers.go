// pricing_handlers.go - Pricing Operations API Endpoints
// Handles all pricing-related HTTP requests and calculations

package server

import (
	"fmt"
	"net/http"
	"time"

	"DD/cpq"
	"github.com/gorilla/mux"
)

// PricingHandlers provides HTTP handlers for pricing operations
type PricingHandlers struct {
	service *CPQService
}

// NewPricingHandlers creates new pricing handlers
func NewPricingHandlers(service *CPQService) *PricingHandlers {
	return &PricingHandlers{
		service: service,
	}
}

// setupPricingRoutes sets up all pricing-related routes
func (s *Server) setupPricingRoutes(router *mux.Router) {
	handlers := NewPricingHandlers(s.cpqService)

	// Core pricing operations
	router.HandleFunc("/calculate", handlers.CalculatePrice).Methods("POST", "OPTIONS")
	router.HandleFunc("/simulate", handlers.SimulatePricing).Methods("POST", "OPTIONS")
	router.HandleFunc("/validate", handlers.ValidatePricing).Methods("POST", "OPTIONS")

	// Pricing structure queries
	router.HandleFunc("/rules/{model_id}", handlers.GetPriceRules).Methods("GET", "OPTIONS")
	router.HandleFunc("/volume-tiers", handlers.GetVolumeTiers).Methods("GET", "OPTIONS")
	router.HandleFunc("/volume-tiers/{model_id}", handlers.GetModelVolumeTiers).Methods("GET", "OPTIONS")

	// Bulk pricing operations
	router.HandleFunc("/bulk-calculate", handlers.BulkCalculate).Methods("POST", "OPTIONS")
	router.HandleFunc("/batch-simulate", handlers.BatchSimulate).Methods("POST", "OPTIONS")
}

// Core Pricing Operations

// CalculatePrice calculates pricing for a specific selection set
func (h *PricingHandlers) CalculatePrice(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req PricingRequest
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

	if len(req.Selections) == 0 {
		WriteValidationErrorResponse(w, map[string]string{
			"selections": "At least one selection is required",
		})
		return
	}

	// Get model
	model, err := h.service.GetModel(req.ModelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Create temporary configurator for pricing calculation
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		WriteErrorResponse(w, "CONFIGURATOR_FAILED", "Failed to create configurator", err.Error(), http.StatusInternalServerError)
		return
	}

	// Apply selections
	for _, selection := range req.Selections {
		_, err := configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			WriteErrorResponse(w, "SELECTION_FAILED", fmt.Sprintf("Failed to add selection %s", selection.OptionID), err.Error(), http.StatusBadRequest)
			return
		}
	}

	// Calculate pricing
	pricing := configurator.GetDetailedPrice()

	// Apply customer-specific context if provided
	if req.CustomerID != "" {
		pricing = h.applyCustomerPricing(pricing, req.CustomerID, req.Context)
	}

	response := &PricingResponse{
		Breakdown: &pricing,
		Total:     pricing.TotalPrice,
		Currency:  "USD",
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// SimulatePricing simulates pricing scenarios
func (h *PricingHandlers) SimulatePricing(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req struct {
		ModelID     string           `json:"model_id" validate:"required"`
		Scenarios   []PricingRequest `json:"scenarios" validate:"required"`
		CompareMode string           `json:"compare_mode,omitempty"` // "side_by_side", "best_price", "summary"
	}

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

	if len(req.Scenarios) == 0 {
		WriteValidationErrorResponse(w, map[string]string{
			"scenarios": "At least one scenario is required",
		})
		return
	}

	// Get model
	model, err := h.service.GetModel(req.ModelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Calculate pricing for each scenario
	results := make([]map[string]interface{}, len(req.Scenarios))

	for i, scenario := range req.Scenarios {
		// Create temporary configurator
		configurator, err := cpq.NewConfigurator(model)
		if err != nil {
			WriteErrorResponse(w, "SIMULATION_FAILED", "Failed to create configurator for simulation", err.Error(), http.StatusInternalServerError)
			return
		}

		// Apply selections
		var pricing cpq.PriceBreakdown
		selectionSuccess := true
		var selectionError string

		for _, selection := range scenario.Selections {
			_, err := configurator.AddSelection(selection.OptionID, selection.Quantity)
			if err != nil {
				selectionSuccess = false
				selectionError = err.Error()
				break
			}
		}

		if selectionSuccess {
			pricing = configurator.GetDetailedPrice()

			// Apply customer-specific pricing if provided
			if scenario.CustomerID != "" {
				pricing = h.applyCustomerPricing(pricing, scenario.CustomerID, scenario.Context)
			}
		}

		results[i] = map[string]interface{}{
			"scenario_id": fmt.Sprintf("scenario_%d", i+1),
			"success":     selectionSuccess,
			"error":       selectionError,
			"selections":  scenario.Selections,
			"pricing":     pricing,
			"total_price": pricing.TotalPrice,
			"customer_id": scenario.CustomerID,
		}
	}

	// Generate comparison analysis
	comparison := h.generatePricingComparison(results, req.CompareMode)
	successfulScenarios := h.getSuccessfulScenarios(results)

	// FIX: Changed field names to match test expectations
	response := map[string]interface{}{
		"model_id":             req.ModelID,
		"results":              results, // Changed from "scenarios"
		"comparison":           comparison,
		"total_count":          len(results),
		"successful_scenarios": successfulScenarios, // Changed from "success_count"
		"compare_mode":         req.CompareMode,
		"timestamp":            time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// ValidatePricing validates pricing configuration
func (h *PricingHandlers) ValidatePricing(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	// FIX: Accept PricingRequest directly for configuration validation
	var req PricingRequest
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

	// Get model
	model, err := h.service.GetModel(req.ModelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Validate the pricing configuration
	isValid := true
	validationErrors := []string{}
	var priceBreakdown *cpq.PriceBreakdown

	// Create configurator to test the configuration
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		isValid = false
		validationErrors = append(validationErrors, fmt.Sprintf("Failed to create configurator: %v", err))
	} else {
		// Try to apply selections
		for _, selection := range req.Selections {
			_, err := configurator.AddSelection(selection.OptionID, selection.Quantity)
			if err != nil {
				isValid = false
				validationErrors = append(validationErrors, fmt.Sprintf("Invalid selection %s: %v", selection.OptionID, err))
			}
		}

		// If valid, calculate pricing breakdown
		if isValid {
			pricing := configurator.GetDetailedPrice()
			priceBreakdown = &pricing

			// Apply customer-specific pricing if provided
			if req.CustomerID != "" {
				*priceBreakdown = h.applyCustomerPricing(*priceBreakdown, req.CustomerID, req.Context)
			}
		}
	}

	validationResult := map[string]interface{}{
		"errors":      validationErrors,
		"error_count": len(validationErrors),
	}

	// FIX: Response structure to match test expectations
	response := map[string]interface{}{
		"is_valid":          isValid,
		"validation_result": validationResult,
		"price_breakdown":   priceBreakdown,
		"model_id":          req.ModelID,
		"validated_at":      time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Helper Functions

// applyCustomerPricing applies customer-specific pricing modifications
func (h *PricingHandlers) applyCustomerPricing(pricing cpq.PriceBreakdown, customerID string, context map[string]interface{}) cpq.PriceBreakdown {
	// In production, this would look up customer-specific pricing rules
	// For demo, apply a sample customer discount
	if customerID == "enterprise_customer" {
		pricing.Adjustments = append(pricing.Adjustments, cpq.PriceAdjustment{
			RuleName: "Enterprise Customer Discount",
			Amount:   -pricing.BasePrice * 0.05, // 5% discount
		})
		pricing.TotalPrice = pricing.BasePrice + pricing.BasePrice*-0.05
	}

	return pricing
}

// generatePricingComparison generates comparison analysis between scenarios
func (h *PricingHandlers) generatePricingComparison(results []map[string]interface{}, compareMode string) map[string]interface{} {
	comparison := map[string]interface{}{
		"mode": compareMode,
	}

	switch compareMode {
	case "best_price":
		bestPrice := -1.0
		bestScenario := -1

		for i, result := range results {
			if result["success"].(bool) {
				if price, ok := result["total_price"].(float64); ok {
					if bestPrice < 0 || price < bestPrice {
						bestPrice = price
						bestScenario = i
					}
				}
			}
		}

		comparison["best_price"] = bestPrice
		comparison["best_scenario"] = bestScenario

	case "summary":
		prices := []float64{}
		for _, result := range results {
			if result["success"].(bool) {
				if price, ok := result["total_price"].(float64); ok {
					prices = append(prices, price)
				}
			}
		}

		if len(prices) > 0 {
			min, max, avg := h.calculatePriceStats(prices)
			comparison["min_price"] = min
			comparison["max_price"] = max
			comparison["avg_price"] = avg
			comparison["price_range"] = max - min
		}

	default: // side_by_side or no comparison
		comparison["type"] = "side_by_side"
	}

	return comparison
}

// getSuccessfulScenarios returns successful scenarios details
func (h *PricingHandlers) getSuccessfulScenarios(results []map[string]interface{}) []map[string]interface{} {
	successful := []map[string]interface{}{}
	for _, result := range results {
		if result["success"].(bool) {
			successful = append(successful, result)
		}
	}
	return successful
}

// countSuccessfulScenarios counts successful pricing scenarios
func (h *PricingHandlers) countSuccessfulScenarios(results []map[string]interface{}) int {
	count := 0
	for _, result := range results {
		if result["success"].(bool) {
			count++
		}
	}
	return count
}

// calculatePriceStats calculates min, max, and average prices
func (h *PricingHandlers) calculatePriceStats(prices []float64) (min, max, avg float64) {
	if len(prices) == 0 {
		return 0, 0, 0
	}

	min = prices[0]
	max = prices[0]
	sum := 0.0

	for _, price := range prices {
		if price < min {
			min = price
		}
		if price > max {
			max = price
		}
		sum += price
	}

	avg = sum / float64(len(prices))
	return
}

// Pricing Structure Queries

// GetPriceRules retrieves pricing rules for a model
func (h *PricingHandlers) GetPriceRules(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["model_id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Filter by rule type if specified
	ruleType := r.URL.Query().Get("type")

	priceRules := model.PriceRules
	if ruleType != "" {
		filteredRules := []cpq.PriceRule{}
		for _, rule := range model.PriceRules {
			if string(rule.Type) == ruleType {
				filteredRules = append(filteredRules, rule)
			}
		}
		priceRules = filteredRules
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"rules":      priceRules,
		"rule_count": len(priceRules),
		"rule_types": h.getPriceRuleTypes(model.PriceRules),
		"filter":     ruleType,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetVolumeTiers retrieves global volume tier structure
func (h *PricingHandlers) GetVolumeTiers(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	volumeTiers := h.getGlobalVolumeTiers()

	response := map[string]interface{}{
		"tiers":          volumeTiers,
		"tier_count":     len(volumeTiers),
		"currency":       "USD",
		"effective_date": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelVolumeTiers retrieves volume tiers specific to a model
func (h *PricingHandlers) GetModelVolumeTiers(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["model_id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Get effective volume tiers for this model
	// For now, return global tiers - in production, this would merge model-specific rules
	effectiveTiers := h.getGlobalVolumeTiers()

	// Extract volume-based pricing rules for reference
	volumeRules := []cpq.PriceRule{}
	for _, rule := range model.PriceRules {
		if rule.Type == "volume_tier" || rule.Type == "volume_discount" {
			volumeRules = append(volumeRules, rule)
		}
	}

	// FIX: Change response structure to match test expectations
	response := map[string]interface{}{
		"model_id":     modelID,
		"tiers":        effectiveTiers,      // Changed from "base_tiers"
		"tier_count":   len(effectiveTiers), // Changed from "rule_count"
		"volume_rules": volumeRules,         // Keep for reference
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Bulk Operations

// BulkCalculate performs bulk pricing calculations
func (h *PricingHandlers) BulkCalculate(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req struct {
		Requests []PricingRequest `json:"requests" validate:"required"`
		Parallel bool             `json:"parallel"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	if len(req.Requests) == 0 {
		WriteValidationErrorResponse(w, map[string]string{
			"requests": "At least one pricing request is required",
		})
		return
	}

	// Limit bulk requests to prevent abuse
	maxBulkRequests := 100
	if len(req.Requests) > maxBulkRequests {
		WriteErrorResponse(w, "BULK_LIMIT_EXCEEDED",
			fmt.Sprintf("Bulk requests limited to %d items", maxBulkRequests),
			"", http.StatusBadRequest)
		return
	}

	// Process requests
	results := make([]map[string]interface{}, len(req.Requests))

	if req.Parallel {
		// Process in parallel (simplified for demo)
		for i, pricingReq := range req.Requests {
			results[i] = h.processSinglePricingRequest(pricingReq, i)
		}
	} else {
		// Process sequentially
		for i, pricingReq := range req.Requests {
			results[i] = h.processSinglePricingRequest(pricingReq, i)
		}
	}

	// Calculate summary statistics
	successCount := 0
	totalValue := 0.0

	for _, result := range results {
		if result["success"].(bool) {
			successCount++
			if total, ok := result["total_price"].(float64); ok {
				totalValue += total
			}
		}
	}

	response := map[string]interface{}{
		"results": results,
		"summary": map[string]interface{}{
			"total_requests":      len(req.Requests),
			"successful_requests": successCount,
			"failed_requests":     len(req.Requests) - successCount,
			"total_value":         totalValue,
			"parallel_processing": req.Parallel,
		},
		"processed_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// BatchSimulate performs batch pricing simulations
func (h *PricingHandlers) BatchSimulate(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var req struct {
		Simulations []struct {
			ModelID     string           `json:"model_id"`
			Scenarios   []PricingRequest `json:"scenarios"`
			CompareMode string           `json:"compare_mode,omitempty"`
		} `json:"simulations" validate:"required"`
		Parallel bool `json:"parallel"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	if len(req.Simulations) == 0 {
		WriteValidationErrorResponse(w, map[string]string{
			"simulations": "At least one simulation is required",
		})
		return
	}

	// Process each simulation
	results := make([]map[string]interface{}, len(req.Simulations))

	for i, simulation := range req.Simulations {
		// Create a temporary simulation request
		simReq := struct {
			ModelID     string           `json:"model_id"`
			Scenarios   []PricingRequest `json:"scenarios"`
			CompareMode string           `json:"compare_mode"`
		}{
			ModelID:     simulation.ModelID,
			Scenarios:   simulation.Scenarios,
			CompareMode: simulation.CompareMode,
		}

		// Get model
		_, err := h.service.GetModel(simReq.ModelID)
		if err != nil {
			results[i] = map[string]interface{}{
				"simulation_id": fmt.Sprintf("sim_%d", i+1),
				"success":       false,
				"error":         fmt.Sprintf("Model not found: %s", simReq.ModelID),
			}
			continue
		}

		// Process scenarios for this simulation
		scenarioResults := make([]map[string]interface{}, len(simReq.Scenarios))
		for j, scenario := range simReq.Scenarios {
			scenarioResults[j] = h.processSinglePricingRequest(scenario, j)
		}

		// Generate comparison
		comparison := h.generatePricingComparison(scenarioResults, simReq.CompareMode)
		successfulScenarios := h.getSuccessfulScenarios(scenarioResults)

		results[i] = map[string]interface{}{
			"simulation_id":        fmt.Sprintf("sim_%d", i+1),
			"model_id":             simReq.ModelID,
			"success":              true,
			"results":              scenarioResults,
			"comparison":           comparison,
			"successful_scenarios": successfulScenarios,
			"scenario_count":       len(scenarioResults),
		}
	}

	response := map[string]interface{}{
		"batch_results": results,
		"summary": map[string]interface{}{
			"total_simulations":   len(req.Simulations),
			"successful_sims":     h.countSuccessfulResults(results),
			"parallel_processing": req.Parallel,
		},
		"processed_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Additional Helper Functions

// getPriceRuleTypes extracts unique pricing rule types
func (h *PricingHandlers) getPriceRuleTypes(rules []cpq.PriceRule) []string {
	typeSet := make(map[string]bool)
	types := []string{}

	for _, rule := range rules {
		if !typeSet[string(rule.Type)] {
			typeSet[string(rule.Type)] = true
			types = append(types, string(rule.Type))
		}
	}

	return types
}

// getGlobalVolumeTiers returns the global volume tier structure
func (h *PricingHandlers) getGlobalVolumeTiers() []map[string]interface{} {
	return []map[string]interface{}{
		{
			"tier":         1,
			"name":         "Individual",
			"min_quantity": 1,
			"max_quantity": 4,
			"discount":     0.0,
			"description":  "Standard individual pricing",
		},
		{
			"tier":         2,
			"name":         "Small Business",
			"min_quantity": 5,
			"max_quantity": 19,
			"discount":     0.05,
			"description":  "5% discount for small business volumes",
		},
		{
			"tier":         3,
			"name":         "Medium Business",
			"min_quantity": 20,
			"max_quantity": 99,
			"discount":     0.10,
			"description":  "10% discount for medium business volumes",
		},
		{
			"tier":         4,
			"name":         "Enterprise",
			"min_quantity": 100,
			"max_quantity": -1,
			"discount":     0.15,
			"description":  "15% discount for enterprise volumes",
		},
	}
}

// processSinglePricingRequest processes a single pricing request
func (h *PricingHandlers) processSinglePricingRequest(req PricingRequest, index int) map[string]interface{} {
	// Get model
	model, err := h.service.GetModel(req.ModelID)
	if err != nil {
		return map[string]interface{}{
			"index":   index,
			"success": false,
			"error":   fmt.Sprintf("Model not found: %s", req.ModelID),
		}
	}

	// Create configurator
	configurator, err := cpq.NewConfigurator(model)
	if err != nil {
		return map[string]interface{}{
			"index":   index,
			"success": false,
			"error":   fmt.Sprintf("Failed to create configurator: %v", err),
		}
	}

	// Apply selections
	for _, selection := range req.Selections {
		_, err := configurator.AddSelection(selection.OptionID, selection.Quantity)
		if err != nil {
			return map[string]interface{}{
				"index":   index,
				"success": false,
				"error":   fmt.Sprintf("Failed to add selection %s: %v", selection.OptionID, err),
			}
		}
	}

	// Calculate pricing
	pricing := configurator.GetDetailedPrice()

	// Apply customer pricing if specified
	if req.CustomerID != "" {
		pricing = h.applyCustomerPricing(pricing, req.CustomerID, req.Context)
	}

	return map[string]interface{}{
		"index":       index,
		"success":     true,
		"model_id":    req.ModelID,
		"selections":  req.Selections,
		"pricing":     pricing,
		"total_price": pricing.TotalPrice,
		"customer_id": req.CustomerID,
	}
}

// countSuccessfulResults counts successful batch results
func (h *PricingHandlers) countSuccessfulResults(results []map[string]interface{}) int {
	count := 0
	for _, result := range results {
		if result["success"].(bool) {
			count++
		}
	}
	return count
}

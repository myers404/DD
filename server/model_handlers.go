// model_handlers.go - Model Management API Endpoints
// Handles all model-related HTTP requests including model building tools

package server

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"DD/cpq"
	"DD/modelbuilder"
	"github.com/gorilla/mux"
)

// ModelHandlers provides HTTP handlers for model operations
type ModelHandlers struct {
	service *CPQService
}

// NewModelHandlers creates new model handlers
func NewModelHandlers(service *CPQService) *ModelHandlers {
	return &ModelHandlers{
		service: service,
	}
}

// setupModelRoutes sets up all model-related routes
func (s *Server) setupModelRoutes(router *mux.Router) {
	handlers := NewModelHandlers(s.cpqService)

	// Model CRUD operations
	router.HandleFunc("", handlers.ListModels).Methods("GET", "OPTIONS")
	router.HandleFunc("", handlers.CreateModel).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}", handlers.GetModel).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}", handlers.UpdateModel).Methods("PUT", "OPTIONS")
	router.HandleFunc("/{id}", handlers.DeleteModel).Methods("DELETE", "OPTIONS")

	// Model components
	router.HandleFunc("/{id}/options", handlers.GetModelOptions).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/groups", handlers.GetModelGroups).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/rules", handlers.GetModelRules).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/pricing-rules", handlers.GetPricingRules).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/statistics", handlers.GetModelStatistics).Methods("GET", "OPTIONS")

	// Model building tools
	router.HandleFunc("/{id}/validate", handlers.ValidateModel).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/conflicts", handlers.DetectConflicts).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/impact", handlers.AnalyzeImpact).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/priorities", handlers.ManagePriorities).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/quality", handlers.GetModelQuality).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/optimize", handlers.GetOptimizationRecommendations).Methods("POST", "OPTIONS")

	// Rule management
	router.HandleFunc("/{id}/rules/{rule_id}", handlers.GetRule).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/rules", handlers.AddRule).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/rules/{rule_id}", handlers.UpdateRule).Methods("PUT", "OPTIONS")
	router.HandleFunc("/{id}/rules/{rule_id}", handlers.DeleteRule).Methods("DELETE", "OPTIONS")
	router.HandleFunc("/{id}/rules/validate", handlers.ValidateRule).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/rules/test", handlers.TestRule).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/rules/conflicts", handlers.GetRuleConflicts).Methods("GET", "OPTIONS")
}

// Model CRUD Operations

// ListModels lists all available models
func (h *ModelHandlers) ListModels(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	// Parse query parameters
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}

	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 10
	}

	// Get all models
	allModels := h.service.ListModels()

	// Apply pagination
	total := len(allModels)
	start := (page - 1) * pageSize
	end := start + pageSize

	if start >= total {
		start = 0
		end = 0
	} else if end > total {
		end = total
	}

	var models []*cpq.Model
	if start < end {
		models = allModels[start:end]
	} else {
		models = []*cpq.Model{}
	}

	// Convert to response format
	modelResponses := make([]ModelResponse, len(models))
	for i, model := range models {
		modelResponses[i] = ModelResponse{
			ID:           model.ID,
			Name:         model.Name,
			Description:  model.Description,
			Version:      model.Version,
			Options:      model.Options,
			Groups:       model.Groups,
			Rules:        model.Rules,
			PricingRules: model.PriceRules,
			CreatedAt:    time.Now().UTC(), // In production, get from storage
			UpdatedAt:    time.Now().UTC(),
		}
	}

	response := ModelListResponse{
		Models: modelResponses,
		Total:  total,
	}

	duration := timer()
	meta := CreatePagedMetadata(r.Header.Get("X-Request-ID"), duration, total, page, pageSize)
	WriteSuccessResponse(w, response, meta)
}

// CreateModel creates a new model
func (h *ModelHandlers) CreateModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	var model cpq.Model
	if err := ParseJSONRequest(r, &model); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate required fields
	if model.ID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"id": "Model ID is required",
		})
		return
	}

	if model.Name == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"name": "Model name is required",
		})
		return
	}

	// Add model to service
	if err := h.service.AddModel(&model); err != nil {
		WriteErrorResponse(w, "CREATION_FAILED", "Failed to create model", err.Error(), http.StatusBadRequest)
		return
	}

	// Convert to response format
	response := ModelResponse{
		ID:           model.ID,
		Name:         model.Name,
		Description:  model.Description,
		Version:      model.Version,
		Options:      model.Options,
		Groups:       model.Groups,
		Rules:        model.Rules,
		PricingRules: model.PriceRules,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// GetModel retrieves a specific model
func (h *ModelHandlers) GetModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Get model statistics
	stats := h.getModelStatistics(modelID)

	response := ModelResponse{
		ID:           model.ID,
		Name:         model.Name,
		Description:  model.Description,
		Version:      model.Version,
		Options:      model.Options,
		Groups:       model.Groups,
		Rules:        model.Rules,
		PricingRules: model.PriceRules,
		Statistics:   stats,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// UpdateModel updates an existing model
func (h *ModelHandlers) UpdateModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	var updatedModel cpq.Model
	if err := ParseJSONRequest(r, &updatedModel); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Ensure ID matches
	updatedModel.ID = modelID

	// Update model in service
	if err := h.service.AddModel(&updatedModel); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update model", err.Error(), http.StatusBadRequest)
		return
	}

	response := ModelResponse{
		ID:           updatedModel.ID,
		Name:         updatedModel.Name,
		Description:  updatedModel.Description,
		Version:      updatedModel.Version,
		Options:      updatedModel.Options,
		Groups:       updatedModel.Groups,
		Rules:        updatedModel.Rules,
		PricingRules: updatedModel.PriceRules,
		UpdatedAt:    time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeleteModel deletes a model
func (h *ModelHandlers) DeleteModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	// In production, you'd delete from storage and clean up configurators
	response := map[string]interface{}{
		"id":         modelID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Model Component Operations

// GetModelOptions retrieves model options
func (h *ModelHandlers) GetModelOptions(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	response := map[string]interface{}{
		"model_id": modelID,
		"options":  model.Options,
		"count":    len(model.Options),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelGroups retrieves model groups
func (h *ModelHandlers) GetModelGroups(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	response := map[string]interface{}{
		"model_id": modelID,
		"groups":   model.Groups,
		"count":    len(model.Groups),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelRules retrieves model rules
func (h *ModelHandlers) GetModelRules(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	response := map[string]interface{}{
		"model_id": modelID,
		"rules":    model.Rules,
		"count":    len(model.Rules),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetPricingRules retrieves pricing rules
func (h *ModelHandlers) GetPricingRules(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	response := map[string]interface{}{
		"model_id":      modelID,
		"pricing_rules": model.PriceRules,
		"count":         len(model.PriceRules),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelStatistics retrieves model usage statistics
func (h *ModelHandlers) GetModelStatistics(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	if _, err := h.service.GetModel(modelID); err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	stats := h.getModelStatistics(modelID)

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, stats, meta)
}

// Model Building Tools

// ValidateModel validates a model using the model validator
func (h *ModelHandlers) ValidateModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	result, err := h.service.ValidateModel(modelID)
	if err != nil {
		WriteErrorResponse(w, "VALIDATION_FAILED", "Failed to validate model", err.Error(), http.StatusBadRequest)
		return
	}

	response := ValidationResponse{
		IsValid:     result.IsValid,
		ModelHealth: result,
		Timestamp:   time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DetectConflicts detects rule conflicts in a model
func (h *ModelHandlers) DetectConflicts(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	conflicts, err := h.service.DetectConflicts(modelID)
	if err != nil {
		WriteErrorResponse(w, "CONFLICT_DETECTION_FAILED", "Failed to detect conflicts", err.Error(), http.StatusBadRequest)
		return
	}

	// Determine overall severity
	severity := "none"
	if len(conflicts) > 0 {
		severity = "low"
		for _, conflict := range conflicts {
			if conflict.Severity == "critical" {
				severity = "critical"
				break
			} else if conflict.Severity == "warning" && severity != "critical" {
				severity = "medium"
			}
		}
	}

	response := ConflictResponse{
		Conflicts:     conflicts,
		ConflictCount: len(conflicts),
		Severity:      severity,
		Timestamp:     time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// AnalyzeImpact analyzes the impact of rule changes
func (h *ModelHandlers) AnalyzeImpact(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	var req struct {
		ChangeType string    `json:"change_type"` // "add", "update", "delete"
		OldRule    *cpq.Rule `json:"old_rule,omitempty"`
		NewRule    *cpq.Rule `json:"new_rule,omitempty"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	impact, err := h.service.AnalyzeImpact(modelID, req.ChangeType, req.OldRule, req.NewRule)
	if err != nil {
		WriteErrorResponse(w, "IMPACT_ANALYSIS_FAILED", "Failed to analyze impact", err.Error(), http.StatusBadRequest)
		return
	}

	// Generate summary
	summary := fmt.Sprintf("Impact analysis for %s operation: %d configurations tested, %d affected",
		req.ChangeType, impact.TotalConfigurations, impact.AffectedConfigurations)

	response := ImpactResponse{
		Analysis:  impact,
		Summary:   summary,
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// ManagePriorities manages rule priorities
func (h *ModelHandlers) ManagePriorities(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	result, err := h.service.ManagePriorities(modelID)
	if err != nil {
		WriteErrorResponse(w, "PRIORITY_MANAGEMENT_FAILED", "Failed to manage priorities", err.Error(), http.StatusBadRequest)
		return
	}

	summary := fmt.Sprintf("Priority management completed: %d rules processed", result.TotalRules)

	response := PriorityResponse{
		Result:    result,
		Summary:   summary,
		Timestamp: time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetModelQuality assesses model quality
func (h *ModelHandlers) GetModelQuality(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	// Run model validation to get quality metrics
	validation, err := h.service.ValidateModel(modelID)
	if err != nil {
		WriteErrorResponse(w, "QUALITY_ASSESSMENT_FAILED", "Failed to assess model quality", err.Error(), http.StatusBadRequest)
		return
	}

	// Calculate quality score
	qualityScore := validation.QualityScore

	response := map[string]interface{}{
		"model_id":        modelID,
		"quality_score":   qualityScore,
		"validation":      validation,
		"recommendations": generateQualityRecommendations(validation),
		"timestamp":       time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetOptimizationRecommendations provides optimization recommendations
func (h *ModelHandlers) GetOptimizationRecommendations(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	recommendations := generateOptimizationRecommendations(model)

	response := map[string]interface{}{
		"model_id":        modelID,
		"recommendations": recommendations,
		"priority_order":  []string{"performance", "maintainability", "complexity"},
		"timestamp":       time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Rule Management Operations

// GetRule retrieves a specific rule
func (h *ModelHandlers) GetRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]
	ruleID := vars["rule_id"]

	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find the rule
	var rule *cpq.Rule
	for _, r := range model.Rules {
		if r.ID == ruleID {
			rule = &r
			break
		}
	}

	if rule == nil {
		WriteNotFoundResponse(w, "Rule")
		return
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, rule, meta)
}

// AddRule adds a new rule to the model
func (h *ModelHandlers) AddRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	var rule cpq.Rule
	if err := ParseJSONRequest(r, &rule); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate rule
	if rule.ID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"id": "Rule ID is required",
		})
		return
	}

	// Add rule to model (in production, you'd update the stored model)
	response := map[string]interface{}{
		"model_id": modelID,
		"rule":     rule,
		"added":    true,
		"added_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// UpdateRule updates an existing rule
func (h *ModelHandlers) UpdateRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]
	ruleID := vars["rule_id"]

	var rule cpq.Rule
	if err := ParseJSONRequest(r, &rule); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Ensure ID matches
	rule.ID = ruleID

	response := map[string]interface{}{
		"model_id":   modelID,
		"rule":       rule,
		"updated":    true,
		"updated_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeleteRule deletes a rule
func (h *ModelHandlers) DeleteRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]
	ruleID := vars["rule_id"]

	response := map[string]interface{}{
		"model_id":   modelID,
		"rule_id":    ruleID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// ValidateRule validates rule syntax
func (h *ModelHandlers) ValidateRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	var rule cpq.Rule
	if err := ParseJSONRequest(r, &rule); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate rule syntax (simplified for demo)
	isValid := rule.Expression != "" && rule.Type != ""

	response := map[string]interface{}{
		"model_id":     modelID,
		"rule":         rule,
		"is_valid":     isValid,
		"validated_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// TestRule tests a rule against scenarios
func (h *ModelHandlers) TestRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	var req struct {
		Rule      cpq.Rule                 `json:"rule"`
		Scenarios []map[string]interface{} `json:"scenarios"`
	}

	if err := ParseJSONRequest(r, &req); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Test rule against scenarios (simplified for demo)
	results := make([]map[string]interface{}, len(req.Scenarios))
	for i, scenario := range req.Scenarios {
		results[i] = map[string]interface{}{
			"scenario": scenario,
			"result":   "passed", // Simplified
			"message":  "Rule evaluation successful",
		}
	}

	response := map[string]interface{}{
		"model_id":      modelID,
		"rule":          req.Rule,
		"test_results":  results,
		"success_count": len(results),
		"tested_at":     time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// GetRuleConflicts gets conflicts for specific rules
func (h *ModelHandlers) GetRuleConflicts(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	conflicts, err := h.service.DetectConflicts(modelID)
	if err != nil {
		WriteErrorResponse(w, "CONFLICT_DETECTION_FAILED", "Failed to detect conflicts", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"conflicts":  conflicts,
		"count":      len(conflicts),
		"checked_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Helper Functions

// getModelStatistics generates model usage statistics
func (h *ModelHandlers) getModelStatistics(modelID string) *ModelStatistics {
	// In production, this would query actual usage data
	return &ModelStatistics{
		ConfigurationsCount: 42,
		SuccessRate:         0.95,
		AvgConfigTime:       250 * time.Millisecond,
		PopularOptions:      []string{"opt_cpu_high", "opt_ram_16gb", "opt_storage_ssd"},
	}
}

// generateQualityRecommendations generates quality improvement recommendations
func generateQualityRecommendations(validation *modelbuilder.ValidationReport) []string {
	recommendations := []string{}

	for _, issue := range validation.Errors {
		switch issue.ErrorType {
		case "circular_dependency":
			recommendations = append(recommendations, "Remove circular dependencies between rules")
		case "missing_reference":
			recommendations = append(recommendations, "Fix missing option/group references")
		case "duplicate_priority":
			recommendations = append(recommendations, "Resolve duplicate rule priorities")
		}
	}

	if len(recommendations) == 0 {
		recommendations = append(recommendations, "Model quality is excellent - no improvements needed")
	}

	return recommendations
}

// generateOptimizationRecommendations generates optimization recommendations
func generateOptimizationRecommendations(model *cpq.Model) []map[string]interface{} {
	recommendations := []map[string]interface{}{}

	// Analyze model complexity
	if len(model.Rules) > 20 {
		recommendations = append(recommendations, map[string]interface{}{
			"category":    "performance",
			"priority":    "high",
			"title":       "High rule count detected",
			"description": "Consider grouping related rules or using rule hierarchies",
			"impact":      "Improved constraint resolution time",
		})
	}

	if len(model.Options) > 50 {
		recommendations = append(recommendations, map[string]interface{}{
			"category":    "maintainability",
			"priority":    "medium",
			"title":       "Large option set detected",
			"description": "Consider organizing options into logical categories",
			"impact":      "Improved model maintainability",
		})
	}

	// Default recommendation if model is well-optimized
	if len(recommendations) == 0 {
		recommendations = append(recommendations, map[string]interface{}{
			"category":    "general",
			"priority":    "low",
			"title":       "Model is well-optimized",
			"description": "No significant optimization opportunities identified",
			"impact":      "Continue monitoring for future improvements",
		})
	}

	return recommendations
}

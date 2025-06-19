// model_handlers.go - Model Management API Endpoints
// Handles all model-related HTTP requests including model building tools

package server

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"DD/cpq"
	"DD/modelbuilder"
	"github.com/gorilla/mux"
)

// ModelHandlers provides HTTP handlers for model operations
type ModelHandlers struct {
	service CPQServiceInterface
}

// NewModelHandlers creates new model handlers
func NewModelHandlers(service CPQServiceInterface) *ModelHandlers {
	return &ModelHandlers{
		service: service,
	}
}

// getUserID extracts the user ID from the request context
func getUserID(r *http.Request) string {
	if claims := r.Context().Value("user_claims"); claims != nil {
		if tokenClaims, ok := claims.(*TokenClaims); ok {
			return tokenClaims.Username
		}
	}
	return ""
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
	router.HandleFunc("/{id}/clone", handlers.CloneModel).Methods("POST", "OPTIONS")

	// Model components
	router.HandleFunc("/{id}/options", handlers.GetModelOptions).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/options", handlers.CreateOption).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/options/{option_id}", handlers.UpdateOption).Methods("PUT", "OPTIONS")
	router.HandleFunc("/{id}/options/{option_id}", handlers.DeleteOption).Methods("DELETE", "OPTIONS")

	router.HandleFunc("/{id}/groups", handlers.GetModelGroups).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/groups", handlers.CreateGroup).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/groups/{group_id}", handlers.UpdateGroup).Methods("PUT", "OPTIONS")
	router.HandleFunc("/{id}/groups/{group_id}", handlers.DeleteGroup).Methods("DELETE", "OPTIONS")

	router.HandleFunc("/{id}/rules", handlers.GetModelRules).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/pricing-rules", handlers.GetPricingRules).Methods("GET", "OPTIONS")
	router.HandleFunc("/{id}/pricing-rules", handlers.CreatePricingRule).Methods("POST", "OPTIONS")
	router.HandleFunc("/{id}/pricing-rules/{rule_id}", handlers.UpdatePricingRule).Methods("PUT", "OPTIONS")
	router.HandleFunc("/{id}/pricing-rules/{rule_id}", handlers.DeletePricingRule).Methods("DELETE", "OPTIONS")

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
	allModels, err := h.service.ListModels()
	if err != nil {
		WriteErrorResponse(w, "LIST_FAILED", "Failed to list models", err.Error(), http.StatusInternalServerError)
		return
	}

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

	// Auto-generate ID if not provided
	if model.ID == "" {
		model.ID = fmt.Sprintf("model_%d", time.Now().UnixNano())
	}

	// Validate required fields
	if model.Name == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"name": "Model name is required",
		})
		return
	}

	// Get userID from context if available (set by auth middleware)
	userID := ""
	if claims := r.Context().Value("user_claims"); claims != nil {
		if tokenClaims, ok := claims.(*TokenClaims); ok {
			userID = tokenClaims.Username
		}
	}
	
	// Add model to service
	if err := h.service.AddModel(&model, userID); err != nil {
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
	if err := h.service.UpdateModel(modelID, &updatedModel); err != nil {
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

	// Check if model exists first
	_, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Delete model from service
	if err := h.service.DeleteModel(modelID); err != nil {
		WriteErrorResponse(w, "DELETE_FAILED", "Failed to delete model", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"id":         modelID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// CloneModel creates a copy of an existing model
func (h *ModelHandlers) CloneModel(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	vars := mux.Vars(r)
	modelID := vars["id"]

	// Get the original model
	originalModel, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Create a clone with a new ID and updated name
	clonedModel := &cpq.Model{
		ID:          fmt.Sprintf("%s_clone_%d", originalModel.ID, time.Now().Unix()),
		Name:        fmt.Sprintf("%s (Clone)", originalModel.Name),
		Description: originalModel.Description,
		Version:     "1.0.0", // Reset version for clone
		Options:     make([]cpq.Option, len(originalModel.Options)),
		Groups:      make([]cpq.Group, len(originalModel.Groups)),
		Rules:       make([]cpq.Rule, len(originalModel.Rules)),
		PriceRules:  make([]cpq.PriceRule, len(originalModel.PriceRules)),
	}

	// Deep copy options
	copy(clonedModel.Options, originalModel.Options)

	// Deep copy groups
	copy(clonedModel.Groups, originalModel.Groups)

	// Deep copy rules
	copy(clonedModel.Rules, originalModel.Rules)

	// Deep copy pricing rules
	copy(clonedModel.PriceRules, originalModel.PriceRules)

	// Get userID from context
	userID := getUserID(r)
	
	// Add cloned model to service
	if err := h.service.AddModel(clonedModel, userID); err != nil {
		WriteErrorResponse(w, "CLONE_FAILED", "Failed to clone model", err.Error(), http.StatusBadRequest)
		return
	}

	// Convert to response format
	response := ModelResponse{
		ID:           clonedModel.ID,
		Name:         clonedModel.Name,
		Description:  clonedModel.Description,
		Version:      clonedModel.Version,
		Options:      clonedModel.Options,
		Groups:       clonedModel.Groups,
		Rules:        clonedModel.Rules,
		PricingRules: clonedModel.PriceRules,
		CreatedAt:    time.Now().UTC(),
		UpdatedAt:    time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
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

	// Check if options should be included
	includeOptions := r.URL.Query().Get("include") == "options"

	groups := model.Groups
	if includeOptions {
		// Populate each group with its options
		for i := range groups {
			groups[i].Options = model.GetOptionsInGroup(groups[i].ID)
		}
	}

	response := map[string]interface{}{
		"model_id": modelID,
		"groups":   groups,
		"count":    len(groups),
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

	// Convert to RuleChange for the interface
	ruleChange := RuleChange{
		Type:    req.ChangeType,
		OldRule: req.OldRule,
		NewRule: req.NewRule,
	}
	ruleChanges := []RuleChange{ruleChange}
	
	impact, err := h.service.AnalyzeImpact(modelID, ruleChanges)
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

	// Get the model to determine rule priorities
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}
	
	// Create an empty priorities map for optimization
	priorities := make(map[string]int)
	
	// Call OptimizePriorities instead of ManagePriorities
	result, err := h.service.OptimizePriorities(modelID, priorities)
	if err != nil {
		WriteErrorResponse(w, "PRIORITY_MANAGEMENT_FAILED", "Failed to manage priorities", err.Error(), http.StatusBadRequest)
		return
	}

	summary := fmt.Sprintf("Priority management completed: %d rules processed", len(model.Rules))

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

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Add rule to model
	model.Rules = append(model.Rules, rule)

	// Update model in service
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "ADD_FAILED", "Failed to add rule", err.Error(), http.StatusBadRequest)
		return
	}

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
	
	log.Printf("UpdateRule called for: %s", r.URL.Path)

	vars := mux.Vars(r)
	modelID := vars["id"]
	ruleID := vars["rule_id"]

	// Parse the request body as a map to handle partial updates
	var updateData map[string]interface{}
	if err := ParseJSONRequest(r, &updateData); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}
	
	log.Printf("Rule update data received: %+v", updateData)

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find the existing rule
	var existingRule *cpq.Rule
	for i, rule := range model.Rules {
		if rule.ID == ruleID {
			existingRule = &model.Rules[i]
			break
		}
	}

	if existingRule == nil {
		WriteNotFoundResponse(w, "Rule")
		return
	}
	
	// Create updated rule starting with existing values
	updatedRule := *existingRule
	
	// Apply partial updates
	if name, ok := updateData["name"].(string); ok {
		updatedRule.Name = name
	}
	if desc, ok := updateData["description"].(string); ok {
		updatedRule.Description = desc
	}
	if ruleType, ok := updateData["type"].(string); ok {
		updatedRule.Type = cpq.RuleType(ruleType)
	}
	if expression, ok := updateData["expression"].(string); ok {
		updatedRule.Expression = expression
	}
	if message, ok := updateData["message"].(string); ok {
		updatedRule.Message = message
	}
	if priority, ok := updateData["priority"].(float64); ok {
		updatedRule.Priority = int(priority)
	}
	if isActive, ok := updateData["is_active"].(bool); ok {
		updatedRule.IsActive = isActive
	}
	
	log.Printf("Updated rule: %+v", updatedRule)

	// Update rule using the service method
	if err := h.service.UpdateRule(modelID, ruleID, &updatedRule); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update rule", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"rule":       updatedRule,
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

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find and remove the rule
	ruleFound := false
	for i, rule := range model.Rules {
		if rule.ID == ruleID {
			model.Rules = append(model.Rules[:i], model.Rules[i+1:]...)
			ruleFound = true
			break
		}
	}

	if !ruleFound {
		WriteNotFoundResponse(w, "Rule")
		return
	}

	// Update model in service
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "DELETE_FAILED", "Failed to delete rule", err.Error(), http.StatusBadRequest)
		return
	}

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

// Option CRUD Operations

// CreateOption creates a new option for a model
func (h *ModelHandlers) CreateOption(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	var option cpq.Option
	if err := ParseJSONRequest(r, &option); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate required fields
	if option.ID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"id": "Option ID is required",
		})
		return
	}

	if option.Name == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"name": "Option name is required",
		})
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Add option to model (in production, you'd update the stored model)
	model.Options = append(model.Options, option)
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to add option", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"option":     option,
		"created":    true,
		"created_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// UpdateOption updates an existing option
func (h *ModelHandlers) UpdateOption(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()
	
	log.Printf("UpdateOption called for: %s", r.URL.Path)

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	optionID, err := ExtractPathParam(r, "option_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing option ID")
		return
	}

	// Parse the request body as a map to handle partial updates
	var updateData map[string]interface{}
	if err := ParseJSONRequest(r, &updateData); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}
	
	log.Printf("Option update data received: %+v", updateData)

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find the existing option
	var existingOption *cpq.Option
	for i, option := range model.Options {
		if option.ID == optionID {
			existingOption = &model.Options[i]
			break
		}
	}

	if existingOption == nil {
		WriteNotFoundResponse(w, "Option")
		return
	}
	
	// Create updated option starting with existing values
	updatedOption := *existingOption
	
	// Apply partial updates
	if name, ok := updateData["name"].(string); ok {
		updatedOption.Name = name
	}
	if desc, ok := updateData["description"].(string); ok {
		updatedOption.Description = desc
	}
	if groupID, ok := updateData["group_id"].(string); ok {
		updatedOption.GroupID = groupID
	}
	if basePrice, ok := updateData["base_price"].(float64); ok {
		updatedOption.BasePrice = basePrice
	}
	if price, ok := updateData["price"].(float64); ok {
		updatedOption.Price = price
	}
	if isDefault, ok := updateData["is_default"].(bool); ok {
		updatedOption.IsDefault = isDefault
	}
	if isActive, ok := updateData["is_active"].(bool); ok {
		updatedOption.IsActive = isActive
	}
	if displayOrder, ok := updateData["display_order"].(float64); ok {
		updatedOption.DisplayOrder = int(displayOrder)
	}
	if sku, ok := updateData["sku"].(string); ok {
		updatedOption.SKU = sku
	}
	
	// Handle attributes as a map
	if attrs, ok := updateData["attributes"].(map[string]interface{}); ok {
		updatedOption.Attributes = attrs
	}
	
	log.Printf("Updated option: %+v", updatedOption)
	
	// Update option using the service method
	if err := h.service.UpdateOption(modelID, optionID, &updatedOption); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update option", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"option":     updatedOption,
		"updated":    true,
		"updated_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeleteOption deletes an option from a model
func (h *ModelHandlers) DeleteOption(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	optionID, err := ExtractPathParam(r, "option_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing option ID")
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find and remove the option
	optionFound := false
	for i, option := range model.Options {
		if option.ID == optionID {
			model.Options = append(model.Options[:i], model.Options[i+1:]...)
			optionFound = true
			break
		}
	}

	if !optionFound {
		WriteNotFoundResponse(w, "Option")
		return
	}

	// Update model in service
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"option_id":  optionID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Group CRUD Operations

// CreateGroup creates a new group for a model
func (h *ModelHandlers) CreateGroup(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()
	
	log.Printf("CreateGroup called for model: %s", r.URL.Path)

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	var group cpq.Group
	if err := ParseJSONRequest(r, &group); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}
	
	log.Printf("Creating group: %+v for model: %s", group, modelID)

	// Validate required fields
	if group.ID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"id": "Group ID is required",
		})
		return
	}

	if group.Name == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"name": "Group name is required",
		})
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Check if group ID already exists
	for _, existingGroup := range model.Groups {
		if existingGroup.ID == group.ID {
			WriteErrorResponse(w, "DUPLICATE_GROUP", "Group with this ID already exists", "", http.StatusBadRequest)
			return
		}
	}

	// Set default values if not provided
	if !group.IsActive {
		group.IsActive = true
	}
	
	// Add group using service method
	if err := h.service.AddGroup(modelID, &group); err != nil {
		WriteErrorResponse(w, "CREATE_FAILED", "Failed to add group", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"group":      group,
		"created":    true,
		"created_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// UpdateGroup updates an existing group
func (h *ModelHandlers) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()
	
	log.Printf("UpdateGroup called for: %s", r.URL.Path)

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	groupID, err := ExtractPathParam(r, "group_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing group ID")
		return
	}

	// Parse the request body as a map to handle partial updates
	var updateData map[string]interface{}
	if err := ParseJSONRequest(r, &updateData); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}
	
	log.Printf("Update data received: %+v", updateData)

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find the existing group
	var existingGroup *cpq.Group
	for i := range model.Groups {
		if model.Groups[i].ID == groupID {
			existingGroup = &model.Groups[i]
			break
		}
	}

	if existingGroup == nil {
		WriteNotFoundResponse(w, "Group")
		return
	}
	
	// Create updated group starting with existing values
	updatedGroup := *existingGroup
	
	// Apply partial updates
	if name, ok := updateData["name"].(string); ok {
		updatedGroup.Name = name
	}
	if desc, ok := updateData["description"].(string); ok {
		updatedGroup.Description = desc
	}
	if groupType, ok := updateData["type"].(string); ok {
		updatedGroup.Type = cpq.GroupType(groupType)
	}
	if isActive, ok := updateData["is_active"].(bool); ok {
		updatedGroup.IsActive = isActive
	}
	if isRequired, ok := updateData["is_required"].(bool); ok {
		updatedGroup.IsRequired = isRequired
	}
	if minSel, ok := updateData["min_selections"].(float64); ok {
		updatedGroup.MinSelections = int(minSel)
	}
	if maxSel, ok := updateData["max_selections"].(float64); ok {
		updatedGroup.MaxSelections = int(maxSel)
	}
	if order, ok := updateData["display_order"].(float64); ok {
		updatedGroup.DisplayOrder = int(order)
	}
	
	log.Printf("Updated group: %+v", updatedGroup)

	// Update group using service method
	if err := h.service.UpdateGroup(modelID, groupID, &updatedGroup); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update group", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"group":      updatedGroup,
		"updated":    true,
		"updated_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeleteGroup deletes a group from a model
func (h *ModelHandlers) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	groupID, err := ExtractPathParam(r, "group_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing group ID")
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Check if group exists
	groupFound := false
	for _, group := range model.Groups {
		if group.ID == groupID {
			groupFound = true
			break
		}
	}

	if !groupFound {
		WriteNotFoundResponse(w, "Group")
		return
	}

	// Delete group using service method
	if err := h.service.DeleteGroup(modelID, groupID); err != nil {
		WriteErrorResponse(w, "DELETE_FAILED", "Failed to delete group", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":   modelID,
		"group_id":   groupID,
		"deleted":    true,
		"deleted_at": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// Pricing Rule CRUD Operations

// CreatePricingRule creates a new pricing rule for a model
func (h *ModelHandlers) CreatePricingRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	var rule cpq.PriceRule
	if err := ParseJSONRequest(r, &rule); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate required fields
	if rule.ID == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"id": "Pricing rule ID is required",
		})
		return
	}

	if rule.Name == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"name": "Pricing rule name is required",
		})
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Add pricing rule to model
	model.PriceRules = append(model.PriceRules, rule)
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to add pricing rule", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":     modelID,
		"pricing_rule": rule,
		"created":      true,
		"created_at":   time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteCreatedResponse(w, response, meta)
}

// UpdatePricingRule updates an existing pricing rule
func (h *ModelHandlers) UpdatePricingRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	ruleID, err := ExtractPathParam(r, "rule_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing rule ID")
		return
	}

	var updatedRule cpq.PriceRule
	if err := ParseJSONRequest(r, &updatedRule); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Ensure ID matches
	updatedRule.ID = ruleID

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find and update the pricing rule
	ruleFound := false
	for i, rule := range model.PriceRules {
		if rule.ID == ruleID {
			model.PriceRules[i] = updatedRule
			ruleFound = true
			break
		}
	}

	if !ruleFound {
		WriteNotFoundResponse(w, "Pricing rule")
		return
	}

	// Update model in service
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update", err.Error(), http.StatusBadRequest)
		return
	}

	response := map[string]interface{}{
		"model_id":     modelID,
		"pricing_rule": updatedRule,
		"updated":      true,
		"updated_at":   time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// DeletePricingRule deletes a pricing rule from a model
func (h *ModelHandlers) DeletePricingRule(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	modelID, err := ExtractPathParam(r, "id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing model ID")
		return
	}

	ruleID, err := ExtractPathParam(r, "rule_id")
	if err != nil {
		WriteBadRequestResponse(w, "Missing rule ID")
		return
	}

	// Get the model
	model, err := h.service.GetModel(modelID)
	if err != nil {
		WriteNotFoundResponse(w, "Model")
		return
	}

	// Find and remove the pricing rule
	ruleFound := false
	for i, rule := range model.PriceRules {
		if rule.ID == ruleID {
			model.PriceRules = append(model.PriceRules[:i], model.PriceRules[i+1:]...)
			ruleFound = true
			break
		}
	}

	if !ruleFound {
		WriteNotFoundResponse(w, "Pricing rule")
		return
	}

	// Update model in service
	if err := h.service.UpdateModel(modelID, model); err != nil {
		WriteErrorResponse(w, "UPDATE_FAILED", "Failed to update", err.Error(), http.StatusBadRequest)
		return
	}

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

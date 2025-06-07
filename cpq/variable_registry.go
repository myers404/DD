// variable_registry.go
// Comprehensive variable registry for CPQ-MTBDD bridge with type-safe variable management
// Handles variable naming, registration, validation, and consistency checking

package cpq

import (
	"fmt"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"
)

// VariableRegistry manages all variables used in MTBDD compilation
type VariableRegistry struct {
	variables       map[string]*VariableInfo
	typeIndex       map[VarType][]string
	sourceIndex     map[string][]string // Maps source types to variable names
	nextIndex       int
	mutex           sync.RWMutex
	stats           RegistryStats
	validationRules []VarValidationRule
}

// VariableInfo contains metadata about a registered variable
type VariableInfo struct {
	Name       string                 `json:"name"`
	Type       VarType                `json:"type"`
	MTBDDIndex int                    `json:"mtbdd_index"`
	Source     interface{}            `json:"source"` // Original CPQ element (OptionDef, GroupDef, etc.)
	CreatedAt  time.Time              `json:"created_at"`
	LastUsed   time.Time              `json:"last_used"`
	UseCount   int                    `json:"use_count"`
	Metadata   map[string]interface{} `json:"metadata"`
	IsActive   bool                   `json:"is_active"`
}

// VarType defines the types of variables
type VarType string

const (
	VarTypeBoolean VarType = "boolean"
	VarTypeInteger VarType = "integer"
	VarTypeReal    VarType = "real"
	VarTypeMeta    VarType = "meta"
)

// RegistryStats tracks registry performance and usage
type RegistryStats struct {
	TotalVariables   int   `json:"total_variables"`
	ActiveVariables  int   `json:"active_variables"`
	BooleanVariables int   `json:"boolean_variables"`
	IntegerVariables int   `json:"integer_variables"`
	RealVariables    int   `json:"real_variables"`
	MetaVariables    int   `json:"meta_variables"`
	TotalLookups     int64 `json:"total_lookups"`
	CacheHits        int64 `json:"cache_hits"`
	ValidationErrors int   `json:"validation_errors"`
}

// VarValidationRule defines custom validation for variables
type VarValidationRule struct {
	Name      string
	Pattern   *regexp.Regexp
	Validator func(*VariableInfo) error
}

// Variable naming prefixes following CPQ architecture patterns
const (
	OptionPrefix   = "opt_"    // Boolean variables for option selection
	GroupPrefix    = "grp_"    // Integer variables for group quantities
	CustomerPrefix = "cust_"   // Boolean variables for customer context
	PricingPrefix  = "price_"  // Boolean/Real variables for pricing rules
	BundlePrefix   = "bundle_" // Boolean variables for bundle selection
	StatePrefix    = "state_"  // Boolean variables for derived state
	MetaPrefix     = "meta_"   // Meta variables for system state
)

// ===================================================================
// CONSTRUCTOR AND INITIALIZATION
// ===================================================================

// NewVariableRegistry creates a new variable registry
func NewVariableRegistry() *VariableRegistry {
	registry := &VariableRegistry{
		variables:   make(map[string]*VariableInfo),
		typeIndex:   make(map[VarType][]string),
		sourceIndex: make(map[string][]string),
		nextIndex:   0,
		stats:       RegistryStats{},
	}

	// Load default validation rules
	registry.loadDefaultValidationRules()

	return registry
}

// loadDefaultValidationRules sets up standard variable validation
func (vr *VariableRegistry) loadDefaultValidationRules() {
	vr.validationRules = []VarValidationRule{
		{
			Name:    "valid_name_format",
			Pattern: regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`),
			Validator: func(info *VariableInfo) error {
				if !regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`).MatchString(info.Name) {
					return fmt.Errorf("invalid variable name format: %s", info.Name)
				}
				return nil
			},
		},
		{
			Name: "no_reserved_keywords",
			Validator: func(info *VariableInfo) error {
				reserved := []string{"true", "false", "and", "or", "not", "if", "then", "else"}
				lowerName := strings.ToLower(info.Name)
				for _, keyword := range reserved {
					if lowerName == keyword {
						return fmt.Errorf("variable name '%s' is a reserved keyword", info.Name)
					}
				}
				return nil
			},
		},
		{
			Name: "max_name_length",
			Validator: func(info *VariableInfo) error {
				if len(info.Name) > 100 {
					return fmt.Errorf("variable name too long: %d characters (max 100)", len(info.Name))
				}
				return nil
			},
		},
	}
}

// ===================================================================
// VARIABLE REGISTRATION
// ===================================================================

// RegisterVariable registers a new variable with the registry
func (vr *VariableRegistry) RegisterVariable(name string, varType VarType, source interface{}) (*VariableInfo, error) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	// Check if variable already exists
	if existing, exists := vr.variables[name]; exists {
		// Update last used time and increment use count
		existing.LastUsed = time.Now()
		existing.UseCount++
		return existing, nil
	}

	// Create new variable info
	info := &VariableInfo{
		Name:       name,
		Type:       varType,
		MTBDDIndex: vr.nextIndex,
		Source:     source,
		CreatedAt:  time.Now(),
		LastUsed:   time.Now(),
		UseCount:   1,
		Metadata:   make(map[string]interface{}),
		IsActive:   true,
	}

	// Validate the variable
	if err := vr.validateVariable(info); err != nil {
		vr.stats.ValidationErrors++
		return nil, fmt.Errorf("variable validation failed: %w", err)
	}

	// Add source metadata
	vr.addSourceMetadata(info, source)

	// Register the variable
	vr.variables[name] = info
	vr.typeIndex[varType] = append(vr.typeIndex[varType], name)

	// Update source index
	sourceType := vr.getSourceType(source)
	vr.sourceIndex[sourceType] = append(vr.sourceIndex[sourceType], name)

	// Update stats
	vr.updateStatsAfterRegistration(varType)
	vr.nextIndex++

	return info, nil
}

// RegisterOptionVariable registers a variable for an option
func (vr *VariableRegistry) RegisterOptionVariable(groupID, optionID string, option *OptionDef) (*VariableInfo, error) {
	name := BuildOptionVariable(groupID, optionID)
	return vr.RegisterVariable(name, VarTypeBoolean, option)
}

// RegisterGroupVariable registers a variable for a group quantity
func (vr *VariableRegistry) RegisterGroupVariable(groupID string, group *GroupDef) (*VariableInfo, error) {
	name := BuildGroupCountVariable(groupID)
	return vr.RegisterVariable(name, VarTypeInteger, group)
}

// RegisterCustomerVariable registers a variable for customer context
func (vr *VariableRegistry) RegisterCustomerVariable(attribute, value string, context interface{}) (*VariableInfo, error) {
	name := BuildCustomerVariable(attribute, value)
	return vr.RegisterVariable(name, VarTypeBoolean, context)
}

// RegisterPricingVariable registers a variable for pricing rules
func (vr *VariableRegistry) RegisterPricingVariable(pricingID string, rule *PricingRuleDef) (*VariableInfo, error) {
	name := BuildPricingVariable(pricingID)
	varType := VarTypeBoolean

	// Use real type for discount percentages
	if rule != nil && rule.DiscountPct > 0 {
		varType = VarTypeReal
	}

	return vr.RegisterVariable(name, varType, rule)
}

// RegisterMetaVariable registers a meta/system variable
func (vr *VariableRegistry) RegisterMetaVariable(metaType string, source interface{}) (*VariableInfo, error) {
	name := BuildMetaVariable(metaType)
	return vr.RegisterVariable(name, VarTypeMeta, source)
}

// ===================================================================
// VARIABLE LOOKUP AND ACCESS
// ===================================================================

// GetVariable retrieves variable information by name
func (vr *VariableRegistry) GetVariable(name string) (*VariableInfo, bool) {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	vr.stats.TotalLookups++

	if info, exists := vr.variables[name]; exists {
		vr.stats.CacheHits++
		// Update last used time (requires upgrading to write lock)
		go func() {
			vr.mutex.Lock()
			info.LastUsed = time.Now()
			info.UseCount++
			vr.mutex.Unlock()
		}()
		return info, true
	}

	return nil, false
}

// HasVariable checks if a variable exists
func (vr *VariableRegistry) HasVariable(name string) bool {
	_, exists := vr.GetVariable(name)
	return exists
}

// GetVariablesByType returns all variables of a specific type
func (vr *VariableRegistry) GetVariablesByType(varType VarType) []*VariableInfo {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	names, exists := vr.typeIndex[varType]
	if !exists {
		return []*VariableInfo{}
	}

	variables := make([]*VariableInfo, 0, len(names))
	for _, name := range names {
		if info, exists := vr.variables[name]; exists && info.IsActive {
			variables = append(variables, info)
		}
	}

	return variables
}

// GetVariablesBySource returns variables from a specific source type
func (vr *VariableRegistry) GetVariablesBySource(sourceType string) []*VariableInfo {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	names, exists := vr.sourceIndex[sourceType]
	if !exists {
		return []*VariableInfo{}
	}

	variables := make([]*VariableInfo, 0, len(names))
	for _, name := range names {
		if info, exists := vr.variables[name]; exists && info.IsActive {
			variables = append(variables, info)
		}
	}

	return variables
}

// GetAllVariables returns all registered variables
func (vr *VariableRegistry) GetAllVariables() map[string]*VariableInfo {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	// Return a copy to prevent external modification
	result := make(map[string]*VariableInfo, len(vr.variables))
	for name, info := range vr.variables {
		if info.IsActive {
			result[name] = info
		}
	}

	return result
}

// GetVariableNames returns sorted list of all variable names
func (vr *VariableRegistry) GetVariableNames() []string {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	names := make([]string, 0, len(vr.variables))
	for name, info := range vr.variables {
		if info.IsActive {
			names = append(names, name)
		}
	}

	sort.Strings(names)
	return names
}

// ===================================================================
// VARIABLE MANAGEMENT
// ===================================================================

// UpdateVariable updates an existing variable's metadata
func (vr *VariableRegistry) UpdateVariable(name string, info *VariableInfo) error {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	existing, exists := vr.variables[name]
	if !exists {
		return fmt.Errorf("variable not found: %s", name)
	}

	// Validate the updated info
	if err := vr.validateVariable(info); err != nil {
		return fmt.Errorf("updated variable validation failed: %w", err)
	}

	// Preserve creation time and MTBDD index
	info.CreatedAt = existing.CreatedAt
	info.MTBDDIndex = existing.MTBDDIndex
	info.LastUsed = time.Now()

	vr.variables[name] = info
	return nil
}

// DeactivateVariable marks a variable as inactive without removing it
func (vr *VariableRegistry) DeactivateVariable(name string) error {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	info, exists := vr.variables[name]
	if !exists {
		return fmt.Errorf("variable not found: %s", name)
	}

	info.IsActive = false
	info.LastUsed = time.Now()

	// Update stats
	vr.stats.ActiveVariables--
	vr.updateVariableTypeCount(info.Type, -1)

	return nil
}

// ReactivateVariable marks a variable as active
func (vr *VariableRegistry) ReactivateVariable(name string) error {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	info, exists := vr.variables[name]
	if !exists {
		return fmt.Errorf("variable not found: %s", name)
	}

	info.IsActive = true
	info.LastUsed = time.Now()

	// Update stats
	vr.stats.ActiveVariables++
	vr.updateVariableTypeCount(info.Type, 1)

	return nil
}

// RemoveVariable permanently removes a variable from the registry
func (vr *VariableRegistry) RemoveVariable(name string) error {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()

	info, exists := vr.variables[name]
	if !exists {
		return fmt.Errorf("variable not found: %s", name)
	}

	// Remove from all indices
	delete(vr.variables, name)
	vr.removeFromTypeIndex(info.Type, name)
	vr.removeFromSourceIndex(info, name)

	// Update stats
	vr.stats.TotalVariables--
	if info.IsActive {
		vr.stats.ActiveVariables--
	}
	vr.updateVariableTypeCount(info.Type, -1)

	return nil
}

// ===================================================================
// VALIDATION AND CONSISTENCY
// ===================================================================

// ValidateConsistency checks registry consistency and returns any errors
func (vr *VariableRegistry) ValidateConsistency() []error {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	var errors []error

	// Check each variable against validation rules
	for name, info := range vr.variables {
		for _, rule := range vr.validationRules {
			if err := rule.Validator(info); err != nil {
				errors = append(errors, fmt.Errorf("variable %s: %w", name, err))
			}
		}

		// Check basic consistency
		if info.Name != name {
			errors = append(errors, fmt.Errorf("variable name mismatch: key=%s, info.Name=%s", name, info.Name))
		}

		if info.MTBDDIndex < 0 {
			errors = append(errors, fmt.Errorf("variable %s has invalid MTBDD index: %d", name, info.MTBDDIndex))
		}
	}

	// Check type index consistency
	for varType, names := range vr.typeIndex {
		for _, name := range names {
			if info, exists := vr.variables[name]; !exists {
				errors = append(errors, fmt.Errorf("type index references missing variable: %s", name))
			} else if info.Type != varType {
				errors = append(errors, fmt.Errorf("type index mismatch for variable %s: index=%s, actual=%s",
					name, varType, info.Type))
			}
		}
	}

	return errors
}

// validateVariable validates a single variable against all rules
func (vr *VariableRegistry) validateVariable(info *VariableInfo) error {
	if info == nil {
		return fmt.Errorf("variable info cannot be nil")
	}

	for _, rule := range vr.validationRules {
		if err := rule.Validator(info); err != nil {
			return err
		}
	}

	return nil
}

// ===================================================================
// STATISTICS AND MONITORING
// ===================================================================

// GetStats returns current registry statistics
func (vr *VariableRegistry) GetStats() RegistryStats {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	// Recalculate active count
	activeCount := 0
	for _, info := range vr.variables {
		if info.IsActive {
			activeCount++
		}
	}
	vr.stats.ActiveVariables = activeCount

	return vr.stats
}

// GetDetailedStats returns comprehensive statistics
func (vr *VariableRegistry) GetDetailedStats() map[string]interface{} {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	stats := vr.GetStats()

	// Calculate cache hit rate
	hitRate := 0.0
	if stats.TotalLookups > 0 {
		hitRate = float64(stats.CacheHits) / float64(stats.TotalLookups)
	}

	// Get variable usage statistics
	usageStats := vr.calculateUsageStats()

	return map[string]interface{}{
		"total_variables":  stats.TotalVariables,
		"active_variables": stats.ActiveVariables,
		"by_type": map[string]int{
			"boolean": stats.BooleanVariables,
			"integer": stats.IntegerVariables,
			"real":    stats.RealVariables,
			"meta":    stats.MetaVariables,
		},
		"lookup_performance": map[string]interface{}{
			"total_lookups": stats.TotalLookups,
			"cache_hits":    stats.CacheHits,
			"hit_rate":      hitRate,
		},
		"usage_statistics":  usageStats,
		"validation_errors": stats.ValidationErrors,
		"next_index":        vr.nextIndex,
	}
}

// calculateUsageStats computes variable usage statistics
func (vr *VariableRegistry) calculateUsageStats() map[string]interface{} {
	totalUse := 0
	maxUse := 0
	recentlyUsed := 0
	cutoff := time.Now().Add(-24 * time.Hour)

	for _, info := range vr.variables {
		totalUse += info.UseCount
		if info.UseCount > maxUse {
			maxUse = info.UseCount
		}
		if info.LastUsed.After(cutoff) {
			recentlyUsed++
		}
	}

	avgUse := 0.0
	if len(vr.variables) > 0 {
		avgUse = float64(totalUse) / float64(len(vr.variables))
	}

	return map[string]interface{}{
		"total_use_count":   totalUse,
		"average_use_count": avgUse,
		"max_use_count":     maxUse,
		"recently_used_24h": recentlyUsed,
	}
}

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

// updateStatsAfterRegistration updates statistics after variable registration
func (vr *VariableRegistry) updateStatsAfterRegistration(varType VarType) {
	vr.stats.TotalVariables++
	vr.stats.ActiveVariables++
	vr.updateVariableTypeCount(varType, 1)
}

// updateVariableTypeCount updates type-specific counters
func (vr *VariableRegistry) updateVariableTypeCount(varType VarType, delta int) {
	switch varType {
	case VarTypeBoolean:
		vr.stats.BooleanVariables += delta
	case VarTypeInteger:
		vr.stats.IntegerVariables += delta
	case VarTypeReal:
		vr.stats.RealVariables += delta
	case VarTypeMeta:
		vr.stats.MetaVariables += delta
	}
}

// addSourceMetadata adds metadata based on source object
func (vr *VariableRegistry) addSourceMetadata(info *VariableInfo, source interface{}) {
	switch src := source.(type) {
	case *OptionDef:
		info.Metadata["source_type"] = "option"
		info.Metadata["group_id"] = src.GroupID
		info.Metadata["base_price"] = src.BasePrice
		info.Metadata["is_available"] = src.IsAvailable
	case *GroupDef:
		info.Metadata["source_type"] = "group"
		info.Metadata["group_type"] = src.Type
		info.Metadata["is_required"] = src.IsRequired
		info.Metadata["min_selections"] = src.MinSelections
		info.Metadata["max_selections"] = src.MaxSelections
	case *PricingRuleDef:
		info.Metadata["source_type"] = "pricing_rule"
		info.Metadata["discount_pct"] = src.DiscountPct
		info.Metadata["customer_attribute"] = src.CustomerAttribute
		info.Metadata["customer_value"] = src.CustomerValue
	default:
		info.Metadata["source_type"] = "unknown"
	}
}

// getSourceType determines source type string
func (vr *VariableRegistry) getSourceType(source interface{}) string {
	switch source.(type) {
	case *OptionDef:
		return "option"
	case *GroupDef:
		return "group"
	case *PricingRuleDef:
		return "pricing_rule"
	case *RuleDef:
		return "rule"
	default:
		return "unknown"
	}
}

// removeFromTypeIndex removes variable from type index
func (vr *VariableRegistry) removeFromTypeIndex(varType VarType, name string) {
	names := vr.typeIndex[varType]
	for i, n := range names {
		if n == name {
			vr.typeIndex[varType] = append(names[:i], names[i+1:]...)
			break
		}
	}
}

// removeFromSourceIndex removes variable from source index
func (vr *VariableRegistry) removeFromSourceIndex(info *VariableInfo, name string) {
	sourceType := vr.getSourceType(info.Source)
	names := vr.sourceIndex[sourceType]
	for i, n := range names {
		if n == name {
			vr.sourceIndex[sourceType] = append(names[:i], names[i+1:]...)
			break
		}
	}
}

// ===================================================================
// VARIABLE NAMING UTILITIES
// ===================================================================

// BuildOptionVariable creates a variable name for an option
func BuildOptionVariable(groupID, optionID string) string {
	return fmt.Sprintf("%s%s_%s", OptionPrefix,
		sanitizeVariableName(groupID), sanitizeVariableName(optionID))
}

// BuildGroupCountVariable creates a variable name for group quantity
func BuildGroupCountVariable(groupID string) string {
	return fmt.Sprintf("%s%s_count", GroupPrefix, sanitizeVariableName(groupID))
}

// BuildCustomerVariable creates a variable name for customer context
func BuildCustomerVariable(attribute, value string) string {
	return fmt.Sprintf("%s%s_%s", CustomerPrefix,
		sanitizeVariableName(attribute), sanitizeVariableName(value))
}

// BuildPricingVariable creates a variable name for pricing rules
func BuildPricingVariable(pricingID string) string {
	return fmt.Sprintf("%s%s", PricingPrefix, sanitizeVariableName(pricingID))
}

// BuildBundleVariable creates a variable name for bundles
func BuildBundleVariable(bundleID string) string {
	return fmt.Sprintf("%s%s", BundlePrefix, sanitizeVariableName(bundleID))
}

// BuildStateVariable creates a variable name for derived state
func BuildStateVariable(stateType, identifier string) string {
	return fmt.Sprintf("%s%s_%s", StatePrefix,
		sanitizeVariableName(stateType), sanitizeVariableName(identifier))
}

// BuildMetaVariable creates a variable name for meta information
func BuildMetaVariable(metaType string) string {
	return fmt.Sprintf("%s%s", MetaPrefix, sanitizeVariableName(metaType))
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// isValidVariableName checks if a variable name follows MTBDD conventions
func isValidVariableName(name string) bool {
	if len(name) == 0 {
		return false
	}

	// Must start with letter or underscore
	first := name[0]
	if !((first >= 'a' && first <= 'z') || (first >= 'A' && first <= 'Z') || first == '_') {
		return false
	}

	// Rest must be alphanumeric or underscore
	for _, char := range name[1:] {
		if !((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
			(char >= '0' && char <= '9') || char == '_') {
			return false
		}
	}

	return true
}

// sanitizeVariableName ensures variable names are MTBDD-compatible
func sanitizeVariableName(name string) string {
	if name == "" {
		return "empty"
	}

	// Replace invalid characters with underscores
	var result strings.Builder

	for i, char := range name {
		if i == 0 {
			// First character must be letter or underscore
			if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char == '_' {
				result.WriteRune(char)
			} else {
				result.WriteRune('_')
			}
		} else {
			// Subsequent characters can be alphanumeric or underscore
			if (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') ||
				(char >= '0' && char <= '9') || char == '_' {
				result.WriteRune(char)
			} else {
				result.WriteRune('_')
			}
		}
	}

	sanitized := result.String()

	// Ensure non-empty result
	if len(sanitized) == 0 {
		return "var"
	}

	return sanitized
}

// ResetCounter resets the variable index counter (for testing)
func (vr *VariableRegistry) ResetCounter() {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()
	vr.nextIndex = 0
}

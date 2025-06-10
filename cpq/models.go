// models.go
// Core data models for CPQ system with comprehensive type definitions
// Defines CPQ model structure, configurations, rules, and pricing data

package cpq

import (
	"fmt"
	"time"
)

// ===================================================================
// CORE CPQ MODEL DEFINITIONS
// ===================================================================

// CPQModel represents a complete CPQ product configuration model
type Model struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Description  string                 `json:"description"`
	Version      string                 `json:"version"`
	Groups       []GroupDef             `json:"groups"`
	Options      []OptionDef            `json:"options"`
	Rules        []RuleDef              `json:"rules"`
	PricingRules []PricingRuleDef       `json:"pricing_rules"`
	Bundles      []BundleDef            `json:"bundles"`
	Metadata     map[string]interface{} `json:"metadata"`
	IsActive     bool                   `json:"is_active"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	CreatedBy    string                 `json:"created_by"`
	UpdatedBy    string                 `json:"updated_by"`
}

// GroupDef defines a logical grouping of options with constraints
type GroupDef struct {
	ID              string                 `json:"id"`
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Type            GroupType              `json:"type"` // single_select, multi_select, quantity
	IsRequired      bool                   `json:"is_required"`
	MinSelections   int                    `json:"min_selections"`
	MaxSelections   int                    `json:"max_selections"`
	DisplayOrder    int                    `json:"display_order"`
	DefaultOptionID string                 `json:"default_option_id,omitempty"`
	Attributes      map[string]interface{} `json:"attributes"`
	Metadata        map[string]interface{} `json:"metadata"`
	IsActive        bool                   `json:"is_active"`
	IsCollapsible   bool                   `json:"is_collapsible"`
	DefaultState    string                 `json:"default_state,omitempty"`
}

// OptionDef defines an individual configurable option
type OptionDef struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Description  string                 `json:"description"`
	GroupID      string                 `json:"group_id"`
	BasePrice    float64                `json:"base_price"`
	IsAvailable  bool                   `json:"is_available"`
	IsDefault    bool                   `json:"is_default"`
	MinQuantity  int                    `json:"min_quantity"`
	MaxQuantity  int                    `json:"max_quantity"`
	DisplayOrder int                    `json:"display_order"`
	SKU          string                 `json:"sku,omitempty"`
	Category     string                 `json:"category,omitempty"`
	Tags         []string               `json:"tags,omitempty"`
	Attributes   map[string]interface{} `json:"attributes"`
	Metadata     map[string]interface{} `json:"metadata"`
	IsActive     bool                   `json:"is_active"`
	ParentID     string                 `json:"parent_id,omitempty"`
	PriceType    PriceType              `json:"price_type"`
	PriceFormula string                 `json:"price_formula,omitempty"`
	StepQuantity int                    `json:"step_quantity"`
	IsRequired   bool                   `json:"is_required"`
	IsHidden     bool                   `json:"is_hidden"`
}

// RuleDef defines business rules and constraints
type RuleDef struct {
	ID           string                 `json:"id"`
	Name         string                 `json:"name"`
	Description  string                 `json:"description"`
	Type         RuleType               `json:"type"`
	Expression   string                 `json:"expression"`
	Priority     int                    `json:"priority"`
	IsActive     bool                   `json:"is_active"`
	ErrorMsg     string                 `json:"error_msg,omitempty"`
	WarningMsg   string                 `json:"warning_msg,omitempty"`
	Metadata     map[string]interface{} `json:"metadata"`
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
	Tags         []string               `json:"tags,omitempty"`
	Condition    ConditionDef           `json:"condition"`
	Action       ActionDef              `json:"action"`
	ErrorMessage string                 `json:"error_message,omitempty"`
}

// PricingRuleDef defines pricing rules and discounts
type PricingRuleDef struct {
	ID                string                 `json:"id"`
	Name              string                 `json:"name"`
	Description       string                 `json:"description"`
	Type              PricingRuleType        `json:"type"`
	Expression        string                 `json:"expression"`
	DiscountPct       float64                `json:"discount_pct"`
	FixedDiscount     float64                `json:"fixed_discount"`
	MinQuantity       int                    `json:"min_quantity,omitempty"`
	MaxQuantity       int                    `json:"max_quantity,omitempty"`
	CustomerAttribute string                 `json:"customer_attribute,omitempty"`
	CustomerValue     string                 `json:"customer_value,omitempty"`
	ValidFrom         *time.Time             `json:"valid_from,omitempty"`
	ValidTo           *time.Time             `json:"valid_to,omitempty"`
	Priority          int                    `json:"priority"`
	IsActive          bool                   `json:"is_active"`
	Metadata          map[string]interface{} `json:"metadata"`
	CreatedAt         time.Time              `json:"created_at"`
	UpdatedAt         time.Time              `json:"updated_at"`
	Conditions        []ConditionDef         `json:"conditions"`
	PricingAction     PricingActionDef       `json:"pricing_action"`
	CustomerSegments  []string               `json:"customer_segments,omitempty"`
	ValidUntil        *time.Time             `json:"valid_until,omitempty"`
}

// BundleDef defines product bundles with special pricing
type BundleDef struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	OptionIDs   []string               `json:"option_ids"`
	BundlePrice float64                `json:"bundle_price"`
	DiscountPct float64                `json:"discount_pct"`
	IsActive    bool                   `json:"is_active"`
	MinQuantity int                    `json:"min_quantity"`
	MaxQuantity int                    `json:"max_quantity"`
	Attributes  map[string]interface{} `json:"attributes"`
	Metadata    map[string]interface{} `json:"metadata"`
	CreatedAt   time.Time              `json:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at"`
}

// ===================================================================
// CONFIGURATION DEFINITIONS
// ===================================================================

// Configuration represents a user's product configuration
type Configuration struct {
	ID         string                 `json:"id"`
	ModelID    string                 `json:"model_id"`
	Name       string                 `json:"name,omitempty"`
	Selections []Selection            `json:"selections"`
	Context    *ConfigurationContext  `json:"context,omitempty"`
	IsValid    bool                   `json:"is_valid"`
	Timestamp  time.Time              `json:"timestamp"`
	ExpiresAt  *time.Time             `json:"expires_at,omitempty"`
	CreatedBy  string                 `json:"created_by,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
}

// Selection represents a user's choice for a specific option
type Selection struct {
	OptionID string                 `json:"option_id"`
	Quantity int                    `json:"quantity"`
	Notes    string                 `json:"notes,omitempty"`
	Metadata map[string]interface{} `json:"metadata,omitempty"`
}

// ConfigurationContext provides additional context for configuration
type ConfigurationContext struct {
	Customer    *Customer              `json:"customer,omitempty"`
	Environment string                 `json:"environment,omitempty"` // development, staging, production
	Channel     string                 `json:"channel,omitempty"`     // web, mobile, api, sales
	Language    string                 `json:"language,omitempty"`
	Currency    string                 `json:"currency,omitempty"`
	Region      string                 `json:"region,omitempty"`
	SessionID   string                 `json:"session_id,omitempty"`
	UserAgent   string                 `json:"user_agent,omitempty"`
	IPAddress   string                 `json:"ip_address,omitempty"`
	Referrer    string                 `json:"referrer,omitempty"`
	Timestamp   time.Time              `json:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// Customer represents customer information for context-aware pricing
type Customer struct {
	ID         string                 `json:"id"`
	Name       string                 `json:"name,omitempty"`
	Email      string                 `json:"email,omitempty"`
	Company    string                 `json:"company,omitempty"`
	Segment    string                 `json:"segment,omitempty"`
	Attributes map[string]interface{} `json:"attributes,omitempty"`
	CreatedAt  time.Time              `json:"created_at"`
	UpdatedAt  time.Time              `json:"updated_at"`
}

// ===================================================================
// OPERATIONAL DEFINITIONS
// ===================================================================

// ConfigUpdate represents the result of a configuration change
type ConfigUpdate struct {
	IsValid           bool                   `json:"is_valid"`
	UpdatedOptions    []Option               `json:"updated_options"`
	ValidationResult  *ValidationResult      `json:"validation_result,omitempty"`
	PriceBreakdown    *PriceBreakdown        `json:"price_breakdown,omitempty"`
	Suggestions       []ResolutionSuggestion `json:"suggestions,omitempty"`
	Timestamp         time.Time              `json:"timestamp"`
	UpdateType        string                 `json:"update_type,omitempty"` // add, remove, modify
	PerformanceInfo   *PerformanceInfo       `json:"performance_info,omitempty"`
	UpdatedSelections []Selection            `json:"updated_selections"`
	AddedOptions      []string               `json:"added_options"`
	RemovedOptions    []string               `json:"removed_options"`
	PriceImpact       *PriceImpact           `json:"price_impact,omitempty"`
}

// Option represents an option with current availability and selection state
type Option struct {
	ID          string                 `json:"id"`
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	GroupID     string                 `json:"group_id"`
	BasePrice   float64                `json:"base_price"`
	IsAvailable bool                   `json:"is_available"`
	IsSelected  bool                   `json:"is_selected"`
	MinQuantity int                    `json:"min_quantity"`
	MaxQuantity int                    `json:"max_quantity"`
	Attributes  map[string]interface{} `json:"attributes,omitempty"`
	Constraints []ConstraintInfo       `json:"constraints,omitempty"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// ===================================================================
// VALIDATION DEFINITIONS
// ===================================================================

// ValidationResult represents validation feedback
type ValidationResult struct {
	IsValid         bool                   `json:"is_valid"`
	Violations      []ConstraintViolation  `json:"violations"`
	Suggestions     []ResolutionSuggestion `json:"suggestions"`
	ValidationID    string                 `json:"validation_id"`
	Timestamp       time.Time              `json:"timestamp"`
	ConfigurationID string                 `json:"configuration_id"`
	Performance     PerformanceMetrics     `json:"performance"`
	Context         *ValidationContext     `json:"context,omitempty"`
}

// ConstraintViolation represents a rule violation
type ConstraintViolation struct {
	Type            ViolationType          `json:"type"`
	RuleID          string                 `json:"rule_id"`
	Message         string                 `json:"message"`
	DetailedMessage string                 `json:"detailed_message"`
	Severity        Severity               `json:"severity"`
	OptionIDs       []string               `json:"option_ids"`
	Context         ViolationContext       `json:"context"`
	Suggestions     []string               `json:"suggestions,omitempty"`
	Metadata        map[string]interface{} `json:"metadata,omitempty"`
}

// ViolationContext provides additional context for violations
type ViolationContext struct {
	GroupID         string   `json:"group_id,omitempty"`
	GroupName       string   `json:"group_name,omitempty"`
	RuleID          string   `json:"rule_id,omitempty"`
	RuleName        string   `json:"rule_name,omitempty"`
	RuleExpression  string   `json:"rule_expression,omitempty"`
	AffectedOptions []string `json:"affected_options,omitempty"`
	CurrentCount    int      `json:"current_count,omitempty"`
	RequiredMin     int      `json:"required_min,omitempty"`
	RequiredMax     int      `json:"required_max,omitempty"`
	Priority        int      `json:"priority,omitempty"`
}

// ResolutionSuggestion represents a suggested fix for violations
type ResolutionSuggestion struct {
	Type        SuggestionType         `json:"type"`
	Description string                 `json:"description"`
	Action      SuggestionAction       `json:"action"`
	OptionID    string                 `json:"option_id,omitempty"`
	GroupID     string                 `json:"group_id,omitempty"`
	Quantity    int                    `json:"quantity,omitempty"`
	Confidence  float64                `json:"confidence"`
	Priority    int                    `json:"priority"`
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

// ===================================================================
// PRICING DEFINITIONS
// ===================================================================

// PriceBreakdown represents detailed pricing information
type PriceBreakdown struct {
	BasePrice    float64                `json:"base_price"`
	OptionPrices []OptionPrice          `json:"option_prices"`
	Discounts    []DiscountApplication  `json:"discounts"`
	Taxes        []TaxApplication       `json:"taxes"`
	TotalPrice   float64                `json:"total_price"`
	Currency     string                 `json:"currency"`
	CalculatedAt time.Time              `json:"calculated_at"`
	ValidUntil   *time.Time             `json:"valid_until,omitempty"`
	TierInfo     *TierInfo              `json:"tier_info,omitempty"`
	CustomerInfo *CustomerPricingInfo   `json:"customer_info,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// OptionPrice represents pricing for individual options
type OptionPrice struct {
	OptionID   string  `json:"option_id"`
	BasePrice  float64 `json:"base_price"`
	Quantity   int     `json:"quantity"`
	TotalPrice float64 `json:"total_price"`
	Discounts  float64 `json:"discounts"`
	FinalPrice float64 `json:"final_price"`
}

// DiscountApplication represents applied discounts
type DiscountApplication struct {
	RuleID      string  `json:"rule_id"`
	Name        string  `json:"name"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Percentage  float64 `json:"percentage"`
	Description string  `json:"description"`
}

// TaxApplication represents applied taxes
type TaxApplication struct {
	TaxID       string  `json:"tax_id"`
	Name        string  `json:"name"`
	Rate        float64 `json:"rate"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

// TierInfo provides volume tier information
type TierInfo struct {
	TierID      string  `json:"tier_id"`
	TierName    string  `json:"tier_name"`
	MinQuantity int     `json:"min_quantity"`
	MaxQuantity int     `json:"max_quantity"`
	Discount    float64 `json:"discount"`
	NextTierID  string  `json:"next_tier_id,omitempty"`
	NextTierMin int     `json:"next_tier_min,omitempty"`
}

// CustomerPricingInfo provides customer-specific pricing context
type CustomerPricingInfo struct {
	CustomerID         string  `json:"customer_id"`
	Segment            string  `json:"segment"`
	SegmentBonus       float64 `json:"segment_bonus"`
	VolumeHistory      int     `json:"volume_history"`
	LoyaltyBonus       float64 `json:"loyalty_bonus"`
	SeasonalBonus      float64 `json:"seasonal_bonus"`
	TotalCustomerBonus float64 `json:"total_customer_bonus"`
}

// ===================================================================
// PERFORMANCE AND METRICS DEFINITIONS
// ===================================================================

// PerformanceMetrics tracks individual operation performance
type PerformanceMetrics struct {
	ValidationTime time.Duration `json:"validation_time"`
	SuggestionTime time.Duration `json:"suggestion_time"`
	TotalTime      time.Duration `json:"total_time"`
	CacheHit       bool          `json:"cache_hit"`
	RulesEvaluated int           `json:"rules_evaluated"`
	MTBDDNodes     int           `json:"mtbdd_nodes"`
	MemoryUsage    int64         `json:"memory_usage,omitempty"`
}

// PerformanceInfo provides detailed performance information
type PerformanceInfo struct {
	OperationType    string        `json:"operation_type"`
	StartTime        time.Time     `json:"start_time"`
	EndTime          time.Time     `json:"end_time"`
	Duration         time.Duration `json:"duration"`
	CacheUtilization float64       `json:"cache_utilization"`
	MTBDDOperations  int           `json:"mtbdd_operations"`
	DatabaseQueries  int           `json:"database_queries,omitempty"`
	MemoryPeak       int64         `json:"memory_peak,omitempty"`
}

// ===================================================================
// ENUMERATION TYPES
// ===================================================================

// ViolationType defines the type of constraint violation
type ViolationType string

const (
	ViolationMutualExclusion   ViolationType = "mutual_exclusion"
	ViolationMissingDependency ViolationType = "missing_dependency"
	ViolationGroupQuantity     ViolationType = "group_quantity"
	ViolationCustomRule        ViolationType = "custom_rule"
	ViolationPricingConflict   ViolationType = "pricing_conflict"
	ViolationBusinessLogic     ViolationType = "business_logic"
	ViolationSystemConstraint  ViolationType = "system_constraint"
)

// Severity defines the severity of a violation
type Severity string

const (
	SeverityError   Severity = "error"
	SeverityWarning Severity = "warning"
	SeverityInfo    Severity = "info"
)

// SuggestionType defines types of resolution suggestions
type SuggestionType string

const (
	SuggestionAddOption         SuggestionType = "add_option"
	SuggestionRemoveOption      SuggestionType = "remove_option"
	SuggestionChangeQuantity    SuggestionType = "change_quantity"
	SuggestionSelectAlternative SuggestionType = "select_alternative"
	SuggestionConfigureGroup    SuggestionType = "configure_group"
	SuggestionApplyDiscount     SuggestionType = "apply_discount"
	SuggestionCustomAction      SuggestionType = "custom_action"
)

// SuggestionAction defines specific actions for suggestions
type SuggestionAction string

const (
	ActionAdd       SuggestionAction = "add"
	ActionRemove    SuggestionAction = "remove"
	ActionIncrease  SuggestionAction = "increase"
	ActionDecrease  SuggestionAction = "decrease"
	ActionReplace   SuggestionAction = "replace"
	ActionConfigure SuggestionAction = "configure"
	ActionApply     SuggestionAction = "apply"
)

// RuleType defines types of business rules
type RuleType string

const (
	ExclusionRule     RuleType = "exclusion"
	RequirementRule   RuleType = "requirement"
	VisibilityRule    RuleType = "visibility"
	QuantityRule      RuleType = "quantity"
	ConditionalRule   RuleType = "conditional"
	ValidationRule    RuleType = "validation"
	BusinessLogicRule RuleType = "business_logic"
	CompatibilityRule RuleType = "compatibility"
	DependencyRule    RuleType = "dependency"
	PricingRule       RuleType = "pricing"
)

// PricingRuleType defines types of pricing rules
type PricingRuleType string

const (
	VolumeDiscountRule     PricingRuleType = "volume_discount"
	CustomerContextRule    PricingRuleType = "customer_context"
	BundlePricingRule      PricingRuleType = "bundle_pricing"
	ConditionalPricingRule PricingRuleType = "conditional_pricing"
	TierPricingRule        PricingRuleType = "tier_pricing"
	SeasonalPricingRule    PricingRuleType = "seasonal_pricing"
	PromotionalRule        PricingRuleType = "promotional"
)

// ===================================================================
// VALIDATION CONTEXT DEFINITIONS
// ===================================================================

// ValidationContext provides additional validation context
type ValidationContext struct {
	CustomerSegment string                 `json:"customer_segment,omitempty"`
	TotalQuantity   int                    `json:"total_quantity"`
	TotalValue      float64                `json:"total_value"`
	GroupCounts     map[string]int         `json:"group_counts"`
	OptionCounts    map[string]int         `json:"option_counts"`
	ActiveRules     []string               `json:"active_rules"`
	Environment     string                 `json:"environment,omitempty"`
	Timestamp       time.Time              `json:"timestamp"`
	Metadata        map[string]interface{} `json:"metadata"`
}

// ===================================================================
// UTILITY FUNCTIONS FOR MODELS
// ===================================================================

// NewConfiguration creates a new configuration with defaults
func NewConfiguration(modelID string) *Configuration {
	return &Configuration{
		ID:         generateConfigurationID(),
		ModelID:    modelID,
		Selections: make([]Selection, 0),
		IsValid:    false,
		Timestamp:  time.Now(),
		Metadata:   make(map[string]interface{}),
	}
}

// NewConfigurationContext creates a new configuration context
func NewConfigurationContext() *ConfigurationContext {
	return &ConfigurationContext{
		Environment: "production",
		Language:    "en",
		Currency:    "USD",
		Timestamp:   time.Now(),
		Metadata:    make(map[string]interface{}),
	}
}

// NewCustomer creates a new customer with defaults
func NewCustomer(id string) *Customer {
	return &Customer{
		ID:         id,
		Attributes: make(map[string]interface{}),
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}
}

// AddSelection adds or updates a selection in the configuration
func (c *Configuration) AddSelection(optionID string, quantity int) {
	// Check if selection already exists
	for i, sel := range c.Selections {
		if sel.OptionID == optionID {
			c.Selections[i].Quantity = quantity
			return
		}
	}

	// Add new selection
	c.Selections = append(c.Selections, Selection{
		OptionID: optionID,
		Quantity: quantity,
		Metadata: make(map[string]interface{}),
	})
}

// RemoveSelection removes a selection from the configuration
func (c *Configuration) RemoveSelection(optionID string) bool {
	for i, sel := range c.Selections {
		if sel.OptionID == optionID {
			c.Selections = append(c.Selections[:i], c.Selections[i+1:]...)
			return true
		}
	}
	return false
}

// GetSelection retrieves a selection by option ID
func (c *Configuration) GetSelection(optionID string) (*Selection, bool) {
	for i, sel := range c.Selections {
		if sel.OptionID == optionID {
			return &c.Selections[i], true
		}
	}
	return nil, false
}

// GetTotalQuantity calculates the total quantity across all selections
func (c *Configuration) GetTotalQuantity() int {
	total := 0
	for _, sel := range c.Selections {
		total += sel.Quantity
	}
	return total
}

// IsEmpty checks if the configuration has any selections
func (c *Configuration) IsEmpty() bool {
	return len(c.Selections) == 0
}

// Clone creates a deep copy of the configuration
func (c *Configuration) Clone() *Configuration {
	clone := &Configuration{
		ID:        generateConfigurationID(),
		ModelID:   c.ModelID,
		Name:      c.Name,
		IsValid:   c.IsValid,
		Timestamp: time.Now(),
		ExpiresAt: c.ExpiresAt,
		CreatedBy: c.CreatedBy,
	}

	// Copy selections
	clone.Selections = make([]Selection, len(c.Selections))
	copy(clone.Selections, c.Selections)

	// Copy context if it exists
	if c.Context != nil {
		clone.Context = &ConfigurationContext{
			Environment: c.Context.Environment,
			Channel:     c.Context.Channel,
			Language:    c.Context.Language,
			Currency:    c.Context.Currency,
			Region:      c.Context.Region,
			SessionID:   c.Context.SessionID,
			Timestamp:   time.Now(),
		}

		if c.Context.Customer != nil {
			clone.Context.Customer = &Customer{
				ID:        c.Context.Customer.ID,
				Name:      c.Context.Customer.Name,
				Email:     c.Context.Customer.Email,
				Company:   c.Context.Customer.Company,
				Segment:   c.Context.Customer.Segment,
				CreatedAt: c.Context.Customer.CreatedAt,
				UpdatedAt: time.Now(),
			}

			// Copy customer attributes
			if c.Context.Customer.Attributes != nil {
				clone.Context.Customer.Attributes = make(map[string]interface{})
				for k, v := range c.Context.Customer.Attributes {
					clone.Context.Customer.Attributes[k] = v
				}
			}
		}

		// Copy metadata
		if c.Context.Metadata != nil {
			clone.Context.Metadata = make(map[string]interface{})
			for k, v := range c.Context.Metadata {
				clone.Context.Metadata[k] = v
			}
		}
	}

	// Copy metadata
	if c.Metadata != nil {
		clone.Metadata = make(map[string]interface{})
		for k, v := range c.Metadata {
			clone.Metadata[k] = v
		}
	}

	return clone
}

// ===================================================================
// MODEL VALIDATION FUNCTIONS
// ===================================================================

// ValidateGroup validates a group definition
func (g *GroupDef) Validate() error {
	if g.ID == "" {
		return fmt.Errorf("group ID cannot be empty")
	}
	if g.Name == "" {
		return fmt.Errorf("group name cannot be empty")
	}
	if g.MinSelections < 0 {
		return fmt.Errorf("min selections cannot be negative")
	}
	if g.MaxSelections > 0 && g.MaxSelections < g.MinSelections {
		return fmt.Errorf("max selections cannot be less than min selections")
	}
	return nil
}

// ValidateOption validates an option definition
func (o *OptionDef) Validate() error {
	if o.ID == "" {
		return fmt.Errorf("option ID cannot be empty")
	}
	if o.Name == "" {
		return fmt.Errorf("option name cannot be empty")
	}
	if o.GroupID == "" {
		return fmt.Errorf("option must belong to a group")
	}
	if o.BasePrice < 0 {
		return fmt.Errorf("base price cannot be negative")
	}
	if o.MinQuantity < 0 {
		return fmt.Errorf("min quantity cannot be negative")
	}
	if o.MaxQuantity > 0 && o.MaxQuantity < o.MinQuantity {
		return fmt.Errorf("max quantity cannot be less than min quantity")
	}
	return nil
}

// ValidateRule validates a rule definition
func (r *RuleDef) Validate() error {
	if r.ID == "" {
		return fmt.Errorf("rule ID cannot be empty")
	}
	if r.Name == "" {
		return fmt.Errorf("rule name cannot be empty")
	}
	if r.Expression == "" {
		return fmt.Errorf("rule expression cannot be empty")
	}
	return nil
}

// ValidatePricingRule validates a pricing rule definition
func (pr *PricingRuleDef) Validate() error {
	if pr.ID == "" {
		return fmt.Errorf("pricing rule ID cannot be empty")
	}
	if pr.Name == "" {
		return fmt.Errorf("pricing rule name cannot be empty")
	}
	if pr.Expression == "" {
		return fmt.Errorf("pricing rule expression cannot be empty")
	}
	if pr.DiscountPct < 0 || pr.DiscountPct > 1 {
		return fmt.Errorf("discount percentage must be between 0 and 1")
	}
	return nil
}

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

// generateRuleID generates a unique rule ID
func generateRuleID() string {
	return fmt.Sprintf("rule_%d", time.Now().UnixNano())
}

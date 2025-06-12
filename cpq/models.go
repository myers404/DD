// Package cpq provides a simplified SMB-focused CPQ system
// Phase 1: Static constraints foundation
// Phase 2: Basic pricing calculator (separate from constraints)
package cpq

import (
	"fmt"
	"time"
)

// ===================================================================
// CORE MODEL DEFINITIONS - SMB FOCUSED
// ===================================================================

// Model represents a complete SMB CPQ configuration model
type Model struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Version     string      `json:"version"`
	Groups      []Group     `json:"groups"`
	Options     []Option    `json:"options"`
	Rules       []Rule      `json:"rules"`
	PriceRules  []PriceRule `json:"price_rules"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	IsActive    bool        `json:"is_active"`
}

// Group defines option groups with selection constraints
type Group struct {
	ID            string    `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Type          GroupType `json:"type"`
	MinSelections int       `json:"min_selections"`
	MaxSelections int       `json:"max_selections"`
	IsRequired    bool      `json:"is_required"`
	DisplayOrder  int       `json:"display_order"`
	OptionIDs     []string  `json:"option_ids"`
}

// Option defines configurable options within groups
type Option struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	GroupID      string  `json:"group_id"`
	BasePrice    float64 `json:"base_price"`
	IsDefault    bool    `json:"is_default"`
	IsActive     bool    `json:"is_active"`
	DisplayOrder int     `json:"display_order"`
	Price        float64 `json:"price"`
}

// Rule defines static boolean constraints (Phase 1)
type Rule struct {
	ID         string   `json:"id"`
	Name       string   `json:"name"`
	Type       RuleType `json:"type"`
	Expression string   `json:"expression"` // MTBDD expression string
	Message    string   `json:"message"`    // User-friendly error message
	IsActive   bool     `json:"is_active"`
	Priority   int      `json:"priority"`
}

// PriceRule defines static pricing calculations (Phase 2)
type PriceRule struct {
	ID         string        `json:"id"`
	Name       string        `json:"name"`
	Type       PriceRuleType `json:"type"`
	Expression string        `json:"expression"` // Arithmetic expression
	IsActive   bool          `json:"is_active"`
	Priority   int           `json:"priority"`
}

// ===================================================================
// OPERATIONAL TYPES
// ===================================================================

// Selection represents a user's option choice
type Selection struct {
	OptionID string `json:"option_id"`
	Quantity int    `json:"quantity"`
}

// Configuration represents a complete user configuration state
type Configuration struct {
	ID         string      `json:"id"`
	ModelID    string      `json:"model_id"`
	Selections []Selection `json:"selections"`
	IsValid    bool        `json:"is_valid"`
	TotalPrice float64     `json:"total_price"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}

// ValidationResult contains constraint validation outcome
type ValidationResult struct {
	IsValid      bool            `json:"is_valid"`
	Violations   []RuleViolation `json:"violations"`
	Suggestions  []string        `json:"suggestions"`
	ResponseTime time.Duration   `json:"response_time"`
}

// RuleViolation represents a constraint violation
type RuleViolation struct {
	RuleID          string   `json:"rule_id"`
	RuleName        string   `json:"rule_name"`
	Message         string   `json:"message"`
	AffectedOptions []string `json:"affected_options"`
}

// PriceBreakdown contains detailed pricing calculation
type PriceBreakdown struct {
	BasePrice       float64           `json:"base_price"`
	Adjustments     []PriceAdjustment `json:"adjustments"`
	TotalPrice      float64           `json:"total_price"`
	CalculationTime time.Duration     `json:"calculation_time"`
}

// PriceAdjustment represents a single pricing modification
type PriceAdjustment struct {
	RuleID      string  `json:"rule_id"`
	RuleName    string  `json:"rule_name"`
	Type        string  `json:"type"` // "discount", "surcharge", "tier"
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
}

// ===================================================================
// ENUMS
// ===================================================================

type GroupType string

const (
	SingleSelect GroupType = "single_select" // Choose exactly one
	MultiSelect  GroupType = "multi_select"  // Choose multiple
	Optional     GroupType = "optional"      // Choose zero or more
)

type RuleType string

const (
	RequiresRule    RuleType = "requires"         // A requires B
	ExcludesRule    RuleType = "excludes"         // A excludes B
	MutualExclusive RuleType = "mutual_exclusive" // Only one of A,B,C
	GroupLimit      RuleType = "group_limit"      // Group quantity limits
	PricingRule     RuleType = "pricing_rule"
	ValidationRule  RuleType = "validation_rule"
)

type PriceRuleType string

const (
	VolumeTierRule      PriceRuleType = "volume_tier"      // Quantity-based tiers
	FixedDiscountRule   PriceRuleType = "fixed_discount"   // Fixed amount off
	PercentDiscountRule PriceRuleType = "percent_discount" // Percentage off
	SurchargeRule       PriceRuleType = "surcharge"        // Additional cost
)

// ===================================================================
// HELPER METHODS
// ===================================================================

// NewModel creates a new CPQ model with defaults
func NewModel(id, name string) *Model {
	return &Model{
		ID:         id,
		Name:       name,
		Version:    "1.0.0",
		Groups:     make([]Group, 0),
		Options:    make([]Option, 0),
		Rules:      make([]Rule, 0),
		PriceRules: make([]PriceRule, 0),
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
		IsActive:   true,
	}
}

// AddGroup adds a group to the model
func (m *Model) AddGroup(group Group) *Model {
	m.Groups = append(m.Groups, group)
	m.UpdatedAt = time.Now()
	return m
}

// AddOption adds an option to the model
func (m *Model) AddOption(option Option) *Model {
	m.Options = append(m.Options, option)
	m.UpdatedAt = time.Now()
	return m
}

// AddRule adds a constraint rule to the model
func (m *Model) AddRule(rule Rule) *Model {
	m.Rules = append(m.Rules, rule)
	m.UpdatedAt = time.Now()
	return m
}

// AddPriceRule adds a pricing rule to the model
func (m *Model) AddPriceRule(rule PriceRule) *Model {
	m.PriceRules = append(m.PriceRules, rule)
	m.UpdatedAt = time.Now()
	return m
}

// GetOption finds an option by ID
func (m *Model) GetOption(optionID string) (*Option, error) {
	for i := range m.Options {
		if m.Options[i].ID == optionID {
			return &m.Options[i], nil
		}
	}
	return nil, fmt.Errorf("option %s not found", optionID)
}

// GetGroup finds a group by ID
func (m *Model) GetGroup(groupID string) (*Group, error) {
	for i := range m.Groups {
		if m.Groups[i].ID == groupID {
			return &m.Groups[i], nil
		}
	}
	return nil, fmt.Errorf("group %s not found", groupID)
}

// GetOptionsInGroup returns all options for a specific group
func (m *Model) GetOptionsInGroup(groupID string) []Option {
	var options []Option
	for _, option := range m.Options {
		if option.GroupID == groupID && option.IsActive {
			options = append(options, option)
		}
	}
	return options
}

// Validate performs basic model structure validation
func (m *Model) Validate() error {
	if m.ID == "" {
		return fmt.Errorf("model ID cannot be empty")
	}
	if m.Name == "" {
		return fmt.Errorf("model name cannot be empty")
	}

	// Validate all options reference valid groups
	for _, option := range m.Options {
		if _, err := m.GetGroup(option.GroupID); err != nil {
			return fmt.Errorf("option %s references invalid group %s", option.ID, option.GroupID)
		}
	}

	return nil
}

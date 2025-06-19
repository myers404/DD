// server/interfaces.go - Service interfaces for server package

package server

import (
	"DD/cpq"
	"DD/modelbuilder"
)

// RuleChange represents a change to a rule (temporary stub for interface compatibility)
type RuleChange struct {
	Type    string    `json:"type"`     // "add", "modify", "remove"
	OldRule *cpq.Rule `json:"old_rule"`
	NewRule *cpq.Rule `json:"new_rule"`
}

// CPQServiceInterface defines the contract that all CPQ services must implement
type CPQServiceInterface interface {
	// Model operations
	AddModel(model *cpq.Model, userID string) error
	GetModel(modelID string) (*cpq.Model, error)
	ListModels() ([]*cpq.Model, error)
	UpdateModel(modelID string, updates *cpq.Model) error
	DeleteModel(modelID string) error

	// Configuration operations
	CreateConfiguration(modelID string, userID *string) (*cpq.Configuration, error)
	UpdateConfiguration(modelID string, configID string, selections []cpq.Selection) (*cpq.ConfigurationUpdate, error)
	GetConfiguration(configID string, userID *string) (*cpq.Configuration, error)
	ValidateConfiguration(modelID string, configID string) (*cpq.ValidationResult, error)
	CalculatePricing(modelID string, selections []cpq.Selection) (*cpq.PricingResult, error)
	CalculatePrice(modelID string, configID string) (*cpq.PricingResult, error)
	GetConfigurator(modelID string) (*cpq.Configurator, error)

	// Model builder operations
	ValidateModel(modelID string) (*modelbuilder.ValidationReport, error)
	DetectConflicts(modelID string) ([]modelbuilder.RuleConflict, error)
	AnalyzeImpact(modelID string, ruleChanges []RuleChange) (*modelbuilder.ImpactAnalysis, error)
	OptimizePriorities(modelID string, priorities map[string]int) (*modelbuilder.PriorityAnalysis, error)
	ManagePriorities(modelID string) (*modelbuilder.PriorityAnalysis, error)
	
	// Group operations
	AddGroup(modelID string, group *cpq.Group) error
	UpdateGroup(modelID string, groupID string, group *cpq.Group) error
	DeleteGroup(modelID string, groupID string) error
	
	// Option operations
	AddOption(modelID string, option *cpq.Option) error
	UpdateOption(modelID string, optionID string, option *cpq.Option) error
	DeleteOption(modelID string, optionID string) error
	
	// Rule operations
	AddRule(modelID string, rule *cpq.Rule) error
	UpdateRule(modelID string, ruleID string, rule *cpq.Rule) error
	DeleteRule(modelID string, ruleID string) error

	// System operations
	GetStats() SystemStats
	HealthCheck() error
}
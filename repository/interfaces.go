// repository/interfaces.go
// Repository interfaces for data access abstraction

package repository

import (
	"DD/cpq"
	"time"
)

// ModelRepository defines the interface for model data access
type ModelRepository interface {
	// Basic CRUD operations
	GetModel(id string) (*cpq.Model, error)
	ListModels() ([]*cpq.Model, error)
	CreateModel(model *cpq.Model, userID string) error
	UpdateModel(id string, model *cpq.Model) error
	DeleteModel(id string) error
	
	// Component operations
	AddOption(modelID string, option *cpq.Option) error
	UpdateOption(modelID, optionID string, option *cpq.Option) error
	DeleteOption(modelID, optionID string) error
	
	AddGroup(modelID string, group *cpq.Group) error
	UpdateGroup(modelID, groupID string, group *cpq.Group) error
	DeleteGroup(modelID, groupID string) error
	
	AddRule(modelID string, rule *cpq.Rule) error
	UpdateRule(modelID, ruleID string, rule *cpq.Rule) error
	DeleteRule(modelID, ruleID string) error
	
	AddPricingRule(modelID string, rule *cpq.PriceRule) error
	UpdatePricingRule(modelID, ruleID string, rule *cpq.PriceRule) error
	DeletePricingRule(modelID, ruleID string) error
}

// ConfigurationRepository defines the interface for configuration data access
type ConfigurationRepository interface {
	// Basic CRUD operations
	CreateConfiguration(config *cpq.Configuration, userID *string) error
	GetConfiguration(id string, userID *string) (*cpq.Configuration, error)
	UpdateConfiguration(id string, config *cpq.Configuration) error
	DeleteConfiguration(id string, userID *string) error
	
	// User configurations
	ListUserConfigurations(userID string) ([]*cpq.Configuration, error)
	
	// Selection management
	AddSelection(configID, optionID string, quantity int) error
	RemoveSelection(configID, optionID string) error
	UpdateSelection(configID, optionID string, quantity int) error
	ClearSelections(configID string) error
	
	// Configuration operations
	SaveConfiguration(config *cpq.Configuration) error
	GetConfigurationWithDetails(id string) (*cpq.Configuration, error)
}

// UserRepository defines the interface for user data access
type UserRepository interface {
	GetUser(id string) (*User, error)
	GetUserByEmail(email string) (*User, error)
	CreateUser(user *User) error
	UpdateUser(id string, user *User) error
	DeleteUser(id string) error
	ListUsers() ([]*User, error)
}

// User represents a system user
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	Role         string    `json:"role"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
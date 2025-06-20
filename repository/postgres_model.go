// repository/postgres_model.go
// PostgreSQL implementation of ModelRepository

package repository

import (
	"DD/cpq"
	"DD/database"
	"fmt"
)

// PostgresModelRepository implements ModelRepository using PostgreSQL
type PostgresModelRepository struct {
	db *database.DB
}

// NewPostgresModelRepository creates a new PostgreSQL model repository
func NewPostgresModelRepository(db *database.DB) *PostgresModelRepository {
	return &PostgresModelRepository{db: db}
}

// GetModel retrieves a model by ID with all related data
func (r *PostgresModelRepository) GetModel(id string) (*cpq.Model, error) {
	return r.db.GetModel(id)
}

// ListModels returns all active models
func (r *PostgresModelRepository) ListModels() ([]*cpq.Model, error) {
	return r.db.ListModels()
}

// CreateModel creates a new model with all related data
func (r *PostgresModelRepository) CreateModel(model *cpq.Model, userID string) error {
	return r.db.CreateModel(model, userID)
}

// UpdateModel updates an existing model with all child entities
func (r *PostgresModelRepository) UpdateModel(id string, model *cpq.Model) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update model basic info
	_, err = tx.Exec(`
		UPDATE models 
		SET name = $2, description = $3, version = $4, updated_at = NOW()
		WHERE id = $1
	`, id, model.Name, model.Description, model.Version)
	if err != nil {
		return fmt.Errorf("failed to update model: %w", err)
	}

	// Delete existing groups, options, rules, and pricing rules
	// This is necessary to handle removals and ensure consistency
	_, err = tx.Exec(`DELETE FROM options WHERE model_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete existing options: %w", err)
	}

	_, err = tx.Exec(`DELETE FROM groups WHERE model_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete existing groups: %w", err)
	}

	_, err = tx.Exec(`DELETE FROM rules WHERE model_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete existing rules: %w", err)
	}

	_, err = tx.Exec(`DELETE FROM pricing_rules WHERE model_id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to delete existing pricing rules: %w", err)
	}

	// Insert groups
	for _, group := range model.Groups {
		_, err = tx.Exec(`
			INSERT INTO groups (id, model_id, name, description, type, is_required, min_selections, max_selections, display_order, default_option_id, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		`, group.ID, id, group.Name, group.Description, group.Type,
			group.IsRequired, group.MinSelections, nullableInt(group.MaxSelections), group.DisplayOrder, nullableString(group.DefaultOptionID), group.IsActive)
		if err != nil {
			return fmt.Errorf("failed to insert group %s: %w", group.ID, err)
		}
	}

	// Insert options
	for _, option := range model.Options {
		_, err = tx.Exec(`
			INSERT INTO options (id, model_id, group_id, name, description, base_price, sku, display_order, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, option.ID, id, option.GroupID, option.Name, option.Description,
			option.BasePrice, option.SKU, option.DisplayOrder, option.IsActive)
		if err != nil {
			return fmt.Errorf("failed to insert option %s: %w", option.ID, err)
		}
	}

	// Insert rules
	for _, rule := range model.Rules {
		_, err = tx.Exec(`
			INSERT INTO rules (id, model_id, name, description, type, expression, message, priority, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, rule.ID, id, rule.Name, rule.Description, rule.Type,
			rule.Expression, rule.Message, rule.Priority, rule.IsActive)
		if err != nil {
			return fmt.Errorf("failed to insert rule %s: %w", rule.ID, err)
		}
	}

	// Insert pricing rules
	for _, priceRule := range model.PriceRules {
		_, err = tx.Exec(`
			INSERT INTO pricing_rules (id, model_id, name, description, type, expression, discount_percent, priority, is_active)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		`, priceRule.ID, id, priceRule.Name, priceRule.Description, priceRule.Type,
			priceRule.Expression, priceRule.DiscountValue, priceRule.Priority, priceRule.IsActive)
		if err != nil {
			return fmt.Errorf("failed to insert pricing rule %s: %w", priceRule.ID, err)
		}
	}

	return tx.Commit()
}

// DeleteModel soft deletes a model
func (r *PostgresModelRepository) DeleteModel(id string) error {
	_, err := r.db.Exec(`
		UPDATE models SET is_active = false, updated_at = NOW() WHERE id = $1
	`, id)
	return err
}

// Option operations

// AddOption adds a new option to a model
func (r *PostgresModelRepository) AddOption(modelID string, option *cpq.Option) error {
	_, err := r.db.Exec(`
		INSERT INTO options (id, model_id, group_id, name, description, base_price, sku, display_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, option.ID, modelID, option.GroupID, option.Name, option.Description,
		option.BasePrice, option.SKU, option.DisplayOrder, option.IsActive)
	return err
}

// UpdateOption updates an existing option
func (r *PostgresModelRepository) UpdateOption(modelID, optionID string, option *cpq.Option) error {
	_, err := r.db.Exec(`
		UPDATE options 
		SET name = $3, description = $4, group_id = $5, base_price = $6, sku = $7, 
		    display_order = $8, is_active = $9, updated_at = NOW()
		WHERE id = $1 AND model_id = $2
	`, optionID, modelID, option.Name, option.Description, option.GroupID,
		option.BasePrice, option.SKU, option.DisplayOrder, option.IsActive)
	return err
}

// DeleteOption soft deletes an option
func (r *PostgresModelRepository) DeleteOption(modelID, optionID string) error {
	_, err := r.db.Exec(`
		UPDATE options SET is_active = false, updated_at = NOW() 
		WHERE id = $1 AND model_id = $2
	`, optionID, modelID)
	return err
}

// Group operations

// AddGroup adds a new group to a model
func (r *PostgresModelRepository) AddGroup(modelID string, group *cpq.Group) error {
	_, err := r.db.Exec(`
		INSERT INTO groups (id, model_id, name, description, type, is_required, min_selections, max_selections, display_order, default_option_id, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, group.ID, modelID, group.Name, group.Description, group.Type,
		group.IsRequired, group.MinSelections, nullableInt(group.MaxSelections), group.DisplayOrder, nullableString(group.DefaultOptionID), group.IsActive)
	return err
}

// UpdateGroup updates an existing group
func (r *PostgresModelRepository) UpdateGroup(modelID, groupID string, group *cpq.Group) error {
	_, err := r.db.Exec(`
		UPDATE groups 
		SET name = $3, description = $4, type = $5, is_required = $6, 
		    min_selections = $7, max_selections = $8, display_order = $9, default_option_id = $10, is_active = $11, updated_at = NOW()
		WHERE id = $1 AND model_id = $2
	`, groupID, modelID, group.Name, group.Description, group.Type,
		group.IsRequired, group.MinSelections, nullableInt(group.MaxSelections), group.DisplayOrder, nullableString(group.DefaultOptionID), group.IsActive)
	return err
}

// DeleteGroup soft deletes a group
func (r *PostgresModelRepository) DeleteGroup(modelID, groupID string) error {
	_, err := r.db.Exec(`
		UPDATE groups SET is_active = false, updated_at = NOW() 
		WHERE id = $1 AND model_id = $2
	`, groupID, modelID)
	return err
}

// Rule operations

// AddRule adds a new rule to a model
func (r *PostgresModelRepository) AddRule(modelID string, rule *cpq.Rule) error {
	_, err := r.db.Exec(`
		INSERT INTO rules (id, model_id, name, description, type, expression, message, priority, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, rule.ID, modelID, rule.Name, rule.Description, rule.Type,
		rule.Expression, rule.Message, rule.Priority, rule.IsActive)
	return err
}

// UpdateRule updates an existing rule
func (r *PostgresModelRepository) UpdateRule(modelID, ruleID string, rule *cpq.Rule) error {
	_, err := r.db.Exec(`
		UPDATE rules 
		SET name = $3, description = $4, type = $5, expression = $6, 
		    message = $7, priority = $8, is_active = $9, updated_at = NOW()
		WHERE id = $1 AND model_id = $2
	`, ruleID, modelID, rule.Name, rule.Description, rule.Type,
		rule.Expression, rule.Message, rule.Priority, rule.IsActive)
	return err
}

// DeleteRule soft deletes a rule
func (r *PostgresModelRepository) DeleteRule(modelID, ruleID string) error {
	_, err := r.db.Exec(`
		UPDATE rules SET is_active = false, updated_at = NOW() 
		WHERE id = $1 AND model_id = $2
	`, ruleID, modelID)
	return err
}

// Pricing rule operations

// AddPricingRule adds a new pricing rule to a model
func (r *PostgresModelRepository) AddPricingRule(modelID string, rule *cpq.PriceRule) error {
	_, err := r.db.Exec(`
		INSERT INTO pricing_rules (id, model_id, name, description, type, expression, discount_percent, priority)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, rule.ID, modelID, rule.Name, rule.Description, rule.Type,
		rule.Expression, rule.DiscountValue, rule.Priority)
	return err
}

// UpdatePricingRule updates an existing pricing rule
func (r *PostgresModelRepository) UpdatePricingRule(modelID, ruleID string, rule *cpq.PriceRule) error {
	_, err := r.db.Exec(`
		UPDATE pricing_rules 
		SET name = $3, description = $4, type = $5, expression = $6, 
		    discount_percent = $7, priority = $8, updated_at = NOW()
		WHERE id = $1 AND model_id = $2
	`, ruleID, modelID, rule.Name, rule.Description, rule.Type,
		rule.Expression, rule.DiscountValue, rule.Priority)
	return err
}

// DeletePricingRule soft deletes a pricing rule
func (r *PostgresModelRepository) DeletePricingRule(modelID, ruleID string) error {
	_, err := r.db.Exec(`
		UPDATE pricing_rules SET is_active = false, updated_at = NOW() 
		WHERE id = $1 AND model_id = $2
	`, ruleID, modelID)
	return err
}

// Helper functions
func nullableInt(i int) interface{} {
	if i == 0 {
		return nil
	}
	return i
}

func nullableString(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

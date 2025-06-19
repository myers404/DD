// database/database.go
// PostgreSQL database package for CPQ system

package database

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"DD/cpq"
	_ "github.com/lib/pq"
)

// DB wraps the sql.DB connection with CPQ-specific methods
type DB struct {
	*sql.DB
}

// Config holds database configuration
type Config struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// Connect creates a new database connection
func Connect(config Config) (*DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode)

	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Printf("✅ Connected to PostgreSQL database: %s", config.DBName)

	return &DB{sqlDB}, nil
}

// User represents a user in the system
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

// Model Operations

// GetModel retrieves a model by ID with all related data
func (db *DB) GetModel(modelID string) (*cpq.Model, error) {
	model := &cpq.Model{}

	// Get model basic info
	err := db.QueryRow(`
		SELECT id, name, description, version, is_active, created_at, updated_at
		FROM models WHERE id = $1 AND is_active = true
	`, modelID).Scan(
		&model.ID, &model.Name, &model.Description, &model.Version, &model.IsActive, &model.CreatedAt, &model.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("model not found: %s", modelID)
		}
		return nil, fmt.Errorf("failed to get model: %w", err)
	}

	// Get groups
	groups, err := db.getModelGroups(modelID)
	if err != nil {
		return nil, fmt.Errorf("failed to get model groups: %w", err)
	}
	model.Groups = groups

	// Get options
	options, err := db.getModelOptions(modelID)
	if err != nil {
		return nil, fmt.Errorf("failed to get model options: %w", err)
	}
	model.Options = options

	// Get rules
	rules, err := db.getModelRules(modelID)
	if err != nil {
		return nil, fmt.Errorf("failed to get model rules: %w", err)
	}
	model.Rules = rules

	// Get pricing rules
	pricingRules, err := db.getModelPricingRules(modelID)
	if err != nil {
		return nil, fmt.Errorf("failed to get model pricing rules: %w", err)
	}
	model.PriceRules = pricingRules

	return model, nil
}

// ListModels returns all active models
func (db *DB) ListModels() ([]*cpq.Model, error) {
	rows, err := db.Query(`
		SELECT id, name, description, version, is_active, created_at, updated_at
		FROM models WHERE is_active = true ORDER BY name
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to list models: %w", err)
	}
	defer rows.Close()

	var models []*cpq.Model
	for rows.Next() {
		model := &cpq.Model{}
		err := rows.Scan(
			&model.ID, &model.Name, &model.Description, &model.Version, &model.IsActive, &model.CreatedAt, &model.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan model: %w", err)
		}
		models = append(models, model)
	}

	return models, nil
}

// CreateModel creates a new model with all related data
func (db *DB) CreateModel(model *cpq.Model, userID string) error {
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Insert model
	_, err = tx.Exec(`
		INSERT INTO models (id, name, description, version, is_active, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, model.ID, model.Name, model.Description, model.Version, model.IsActive, userID)
	if err != nil {
		return fmt.Errorf("failed to insert model: %w", err)
	}

	// Insert groups
	for _, group := range model.Groups {
		err = db.insertGroup(tx, model.ID, group)
		if err != nil {
			return fmt.Errorf("failed to insert group %s: %w", group.ID, err)
		}
	}

	// Insert options
	for _, option := range model.Options {
		err = db.insertOption(tx, model.ID, option)
		if err != nil {
			return fmt.Errorf("failed to insert option %s: %w", option.ID, err)
		}
	}

	// Insert rules
	for _, rule := range model.Rules {
		err = db.insertRule(tx, model.ID, rule)
		if err != nil {
			return fmt.Errorf("failed to insert rule %s: %w", rule.ID, err)
		}
	}

	// Insert pricing rules
	for _, priceRule := range model.PriceRules {
		err = db.insertPricingRule(tx, model.ID, priceRule)
		if err != nil {
			return fmt.Errorf("failed to insert pricing rule %s: %w", priceRule.ID, err)
		}
	}

	return tx.Commit()
}

// Configuration Operations

// CreateConfiguration creates a new configuration
func (db *DB) CreateConfiguration(config *cpq.Configuration, userID *string) error {
	var uid interface{}
	if userID != nil {
		uid = *userID
	}

	// Let PostgreSQL generate the UUID
	var id string
	err := db.QueryRow(`
		INSERT INTO configurations (model_id, user_id, is_valid, total_price, status)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, config.ModelID, uid, config.IsValid, config.TotalPrice, "draft").Scan(&id)

	if err != nil {
		return fmt.Errorf("failed to create configuration: %w", err)
	}

	// Update the config with the generated ID
	config.ID = id

	return nil
}

// GetConfiguration retrieves a configuration with selections
func (db *DB) GetConfiguration(configID string, userID *string) (*cpq.Configuration, error) {
	config := &cpq.Configuration{}

	query := `
		SELECT id, model_id, is_valid, total_price, created_at, updated_at
		FROM configurations WHERE id = $1
	`
	args := []interface{}{configID}

	// Add user filter if provided
	if userID != nil {
		query += " AND (user_id = $2 OR user_id IS NULL)"
		args = append(args, *userID)
	}

	err := db.QueryRow(query, args...).Scan(
		&config.ID, &config.ModelID, &config.IsValid, &config.TotalPrice,
		&config.CreatedAt, &config.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("configuration not found: %s", configID)
		}
		return nil, fmt.Errorf("failed to get configuration: %w", err)
	}

	// Get selections
	selections, err := db.getConfigurationSelections(configID)
	if err != nil {
		return nil, fmt.Errorf("failed to get selections: %w", err)
	}
	config.Selections = selections

	return config, nil
}

// AddSelection adds a selection to a configuration
func (db *DB) AddSelection(configID, optionID string, quantity int) error {
	// Get option price
	var unitPrice float64
	err := db.QueryRow("SELECT base_price FROM options WHERE id = $1", optionID).Scan(&unitPrice)
	if err != nil {
		return fmt.Errorf("failed to get option price: %w", err)
	}

	totalPrice := unitPrice * float64(quantity)

	// Insert or update selection
	_, err = db.Exec(`
		INSERT INTO selections (configuration_id, option_id, quantity, unit_price, total_price)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (configuration_id, option_id)
		DO UPDATE SET quantity = $3, total_price = $5, updated_at = NOW()
	`, configID, optionID, quantity, unitPrice, totalPrice)

	if err != nil {
		return fmt.Errorf("failed to add selection: %w", err)
	}

	// Update configuration total price
	return db.updateConfigurationTotalPrice(configID)
}

// Helper methods

func (db *DB) getModelGroups(modelID string) ([]cpq.Group, error) {
	rows, err := db.Query(`
		SELECT id, name, description, type, min_selections, max_selections, display_order, is_active, is_required
		FROM groups WHERE model_id = $1 ORDER BY display_order
	`, modelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []cpq.Group
	for rows.Next() {
		group := cpq.Group{}
		var maxSelections sql.NullInt32
		err := rows.Scan(
			&group.ID, &group.Name, &group.Description, &group.Type,
			&group.MinSelections, &maxSelections, &group.DisplayOrder,
			&group.IsActive, &group.IsRequired,
		)
		if err != nil {
			return nil, err
		}
		if maxSelections.Valid {
			group.MaxSelections = int(maxSelections.Int32)
		}
		groups = append(groups, group)
	}

	return groups, nil
}

func (db *DB) getModelOptions(modelID string) ([]cpq.Option, error) {
	rows, err := db.Query(`
		SELECT id, group_id, name, description, base_price, sku, display_order, is_active
		FROM options WHERE model_id = $1 ORDER BY display_order
	`, modelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var options []cpq.Option
	for rows.Next() {
		option := cpq.Option{}
		var sku sql.NullString
		err := rows.Scan(
			&option.ID, &option.GroupID, &option.Name, &option.Description,
			&option.BasePrice, &sku, &option.DisplayOrder, &option.IsActive,
		)
		if err != nil {
			return nil, err
		}
		if sku.Valid {
			option.SKU = sku.String
		}
		options = append(options, option)
	}

	return options, nil
}

func (db *DB) getModelRules(modelID string) ([]cpq.Rule, error) {
	rows, err := db.Query(`
		SELECT id, name, description, type, expression, message, priority, is_active
		FROM rules WHERE model_id = $1 ORDER BY priority DESC
	`, modelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rules []cpq.Rule
	for rows.Next() {
		rule := cpq.Rule{}
		var description, message sql.NullString
		err := rows.Scan(
			&rule.ID, &rule.Name, &description, &rule.Type,
			&rule.Expression, &message, &rule.Priority, &rule.IsActive,
		)
		if err != nil {
			return nil, err
		}
		if description.Valid {
			rule.Description = description.String
		}
		if message.Valid {
			rule.Message = message.String
		}
		rules = append(rules, rule)
	}

	return rules, nil
}

func (db *DB) getModelPricingRules(modelID string) ([]cpq.PriceRule, error) {
	rows, err := db.Query(`
		SELECT id, name, description, type, expression, discount_percent, priority
		FROM pricing_rules WHERE model_id = $1 AND is_active = true ORDER BY priority DESC
	`, modelID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pricingRules []cpq.PriceRule
	for rows.Next() {
		rule := cpq.PriceRule{}
		var description sql.NullString
		var discountPercent sql.NullFloat64
		err := rows.Scan(
			&rule.ID, &rule.Name, &description, &rule.Type,
			&rule.Expression, &discountPercent, &rule.Priority,
		)
		if err != nil {
			return nil, err
		}
		rule.IsActive = true
		pricingRules = append(pricingRules, rule)
	}

	return pricingRules, nil
}

func (db *DB) getConfigurationSelections(configID string) ([]cpq.Selection, error) {
	rows, err := db.Query(`
		SELECT option_id, quantity FROM selections WHERE configuration_id = $1
	`, configID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var selections []cpq.Selection
	for rows.Next() {
		selection := cpq.Selection{}
		err := rows.Scan(&selection.OptionID, &selection.Quantity)
		if err != nil {
			return nil, err
		}
		selections = append(selections, selection)
	}

	return selections, nil
}

func (db *DB) updateConfigurationTotalPrice(configID string) error {
	_, err := db.Exec(`
		UPDATE configurations 
		SET total_price = (
			SELECT COALESCE(SUM(total_price), 0) 
			FROM selections 
			WHERE configuration_id = $1
		),
		updated_at = NOW()
		WHERE id = $1
	`, configID)
	return err
}

// Transaction helper methods
func (db *DB) insertGroup(tx *sql.Tx, modelID string, group cpq.Group) error {
	_, err := tx.Exec(`
		INSERT INTO groups (id, model_id, name, description, type, min_selections, max_selections, display_order, is_active, is_required)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`, group.ID, modelID, group.Name, group.Description, group.Type,
		group.MinSelections, nullableInt(group.MaxSelections), group.DisplayOrder, group.IsActive, group.IsRequired)
	return err
}

func (db *DB) insertOption(tx *sql.Tx, modelID string, option cpq.Option) error {
	_, err := tx.Exec(`
		INSERT INTO options (id, model_id, group_id, name, description, base_price, display_order, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, option.ID, modelID, option.GroupID, option.Name, option.Description,
		option.BasePrice, option.DisplayOrder, option.IsActive)
	return err
}

func (db *DB) insertRule(tx *sql.Tx, modelID string, rule cpq.Rule) error {
	_, err := tx.Exec(`
		INSERT INTO rules (id, model_id, name, type, expression, message, priority, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, rule.ID, modelID, rule.Name, rule.Type,
		rule.Expression, rule.Message, rule.Priority, rule.IsActive)
	return err
}

func (db *DB) insertPricingRule(tx *sql.Tx, modelID string, priceRule cpq.PriceRule) error {
	_, err := tx.Exec(`
		INSERT INTO pricing_rules (id, model_id, name, type, expression, discount_percent, priority, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, priceRule.ID, modelID, priceRule.Name, priceRule.Type,
		priceRule.Expression, priceRule.DiscountValue, priceRule.Priority, priceRule.IsActive)
	return err
}

// Utility functions
func nullableString(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func nullableInt(i int) interface{} {
	if i == 0 {
		return nil
	}
	return i
}

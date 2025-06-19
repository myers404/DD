// repository/postgres_config.go
// PostgreSQL implementation of ConfigurationRepository

package repository

import (
	"DD/cpq"
	"DD/database"
	"database/sql"
	"fmt"
)

// PostgresConfigRepository implements ConfigurationRepository using PostgreSQL
type PostgresConfigRepository struct {
	db *database.DB
}

// NewPostgresConfigRepository creates a new PostgreSQL configuration repository
func NewPostgresConfigRepository(db *database.DB) *PostgresConfigRepository {
	return &PostgresConfigRepository{db: db}
}

// CreateConfiguration creates a new configuration
func (r *PostgresConfigRepository) CreateConfiguration(config *cpq.Configuration, userID *string) error {
	return r.db.CreateConfiguration(config, userID)
}

// GetConfiguration retrieves a configuration with selections
func (r *PostgresConfigRepository) GetConfiguration(id string, userID *string) (*cpq.Configuration, error) {
	return r.db.GetConfiguration(id, userID)
}

// UpdateConfiguration updates configuration metadata
func (r *PostgresConfigRepository) UpdateConfiguration(id string, config *cpq.Configuration) error {
	_, err := r.db.Exec(`
		UPDATE configurations 
		SET name = $2, description = $3, is_valid = $4, total_price = $5, 
		    status = $6, updated_at = NOW()
		WHERE id = $1
	`, id, config.Name, config.Description, config.IsValid, config.TotalPrice, config.Status)
	return err
}

// DeleteConfiguration soft deletes a configuration
func (r *PostgresConfigRepository) DeleteConfiguration(id string, userID *string) error {
	query := `UPDATE configurations SET status = 'deleted', updated_at = NOW() WHERE id = $1`
	args := []interface{}{id}

	if userID != nil {
		query += " AND user_id = $2"
		args = append(args, *userID)
	}

	_, err := r.db.Exec(query, args...)
	return err
}

// ListUserConfigurations returns all configurations for a user
func (r *PostgresConfigRepository) ListUserConfigurations(userID string) ([]*cpq.Configuration, error) {
	rows, err := r.db.Query(`
		SELECT id, model_id, name, description, is_valid, total_price, status, created_at, updated_at
		FROM configurations 
		WHERE user_id = $1 AND status != 'deleted'
		ORDER BY updated_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []*cpq.Configuration
	for rows.Next() {
		config := &cpq.Configuration{}
		var name, description, status sql.NullString

		err := rows.Scan(
			&config.ID, &config.ModelID, &name, &description,
			&config.IsValid, &config.TotalPrice, &status,
			&config.CreatedAt, &config.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if name.Valid {
			config.Name = name.String
		}
		if description.Valid {
			config.Description = description.String
		}
		if status.Valid {
			config.Status = status.String
		}

		configs = append(configs, config)
	}

	return configs, nil
}

// AddSelection adds a selection to a configuration
func (r *PostgresConfigRepository) AddSelection(configID, optionID string, quantity int) error {
	return r.db.AddSelection(configID, optionID, quantity)
}

// RemoveSelection removes a selection from a configuration
func (r *PostgresConfigRepository) RemoveSelection(configID, optionID string) error {
	_, err := r.db.Exec(`
		DELETE FROM selections WHERE configuration_id = $1 AND option_id = $2
	`, configID, optionID)

	if err != nil {
		return err
	}

	// Update configuration total price
	return r.updateConfigurationTotalPrice(configID)
}

// UpdateSelection updates the quantity of a selection
func (r *PostgresConfigRepository) UpdateSelection(configID, optionID string, quantity int) error {
	if quantity <= 0 {
		return r.RemoveSelection(configID, optionID)
	}

	// Get option price
	var unitPrice float64
	err := r.db.QueryRow("SELECT base_price FROM options WHERE id = $1", optionID).Scan(&unitPrice)
	if err != nil {
		return fmt.Errorf("failed to get option price: %w", err)
	}

	totalPrice := unitPrice * float64(quantity)

	_, err = r.db.Exec(`
		UPDATE selections 
		SET quantity = $3, total_price = $4, updated_at = NOW()
		WHERE configuration_id = $1 AND option_id = $2
	`, configID, optionID, quantity, totalPrice)

	if err != nil {
		return err
	}

	// Update configuration total price
	return r.updateConfigurationTotalPrice(configID)
}

// ClearSelections removes all selections from a configuration
func (r *PostgresConfigRepository) ClearSelections(configID string) error {
	_, err := r.db.Exec(`
		DELETE FROM selections WHERE configuration_id = $1
	`, configID)

	if err != nil {
		return err
	}

	// Reset configuration total price
	_, err = r.db.Exec(`
		UPDATE configurations 
		SET total_price = 0, is_valid = false, updated_at = NOW()
		WHERE id = $1
	`, configID)

	return err
}

// SaveConfiguration saves a complete configuration with all selections
func (r *PostgresConfigRepository) SaveConfiguration(config *cpq.Configuration) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Update configuration
	_, err = tx.Exec(`
		UPDATE configurations 
		SET name = $2, description = $3, is_valid = $4, total_price = $5, 
		    status = $6, updated_at = NOW()
		WHERE id = $1
	`, config.ID, config.Name, config.Description, config.IsValid, config.TotalPrice, config.Status)
	if err != nil {
		return fmt.Errorf("failed to update configuration: %w", err)
	}

	// Clear existing selections
	_, err = tx.Exec(`DELETE FROM selections WHERE configuration_id = $1`, config.ID)
	if err != nil {
		return fmt.Errorf("failed to clear selections: %w", err)
	}

	// Insert new selections
	for _, selection := range config.Selections {
		// Get option price
		var unitPrice float64
		err = tx.QueryRow("SELECT base_price FROM options WHERE id = $1", selection.OptionID).Scan(&unitPrice)
		if err != nil {
			return fmt.Errorf("failed to get option price: %w", err)
		}

		totalPrice := unitPrice * float64(selection.Quantity)

		_, err = tx.Exec(`
			INSERT INTO selections (configuration_id, option_id, quantity, unit_price, total_price)
			VALUES ($1, $2, $3, $4, $5)
		`, config.ID, selection.OptionID, selection.Quantity, unitPrice, totalPrice)
		if err != nil {
			return fmt.Errorf("failed to insert selection: %w", err)
		}
	}

	return tx.Commit()
}

// GetConfigurationWithDetails gets a configuration with full option details
func (r *PostgresConfigRepository) GetConfigurationWithDetails(id string) (*cpq.Configuration, error) {
	config, err := r.db.GetConfiguration(id, nil)
	if err != nil {
		return nil, err
	}

	// Load option details for each selection
	for i, selection := range config.Selections {
		var option cpq.Option
		err := r.db.QueryRow(`
			SELECT id, name, description, base_price, sku, group_id
			FROM options WHERE id = $1
		`, selection.OptionID).Scan(
			&option.ID, &option.Name, &option.Description,
			&option.BasePrice, &option.SKU, &option.GroupID,
		)
		if err != nil {
			continue // Skip if option not found
		}

		// Add option details to selection (you might need to extend Selection struct)
		config.Selections[i].OptionID = option.ID
		// You could store option details in a map or extend the Selection struct
	}

	return config, nil
}

// Helper method
func (r *PostgresConfigRepository) updateConfigurationTotalPrice(configID string) error {
	_, err := r.db.Exec(`
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

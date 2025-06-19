package server

import (
	"DD/database"
	"github.com/jmoiron/sqlx"
)

// NewPostgresSessionStoreFromDB creates a session store from database.DB
func NewPostgresSessionStoreFromDB(db *database.DB) *PostgresSessionStore {
	// Get the underlying sql.DB
	sqlDB := db.DB
	
	// Wrap it with sqlx
	sqlxDB := sqlx.NewDb(sqlDB, "postgres")
	
	return NewPostgresSessionStore(sqlxDB)
}
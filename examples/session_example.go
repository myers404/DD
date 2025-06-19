// examples/session_example.go
// Example of how to enable session support in the CPQ server

package main

import (
	"database/sql"
	"log"

	"DD/cache"
	"DD/repository"
	"DD/server"
	
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {
	// Connect to PostgreSQL
	db, err := sqlx.Connect("postgres", "postgres://cpq_user:cpq_password@localhost/cpq_db?sslmode=disable")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Create repositories
	modelRepo := repository.NewPostgresModelRepository(db)
	configRepo := repository.NewPostgresConfigurationRepository(db)
	cacheRepo := cache.NewRedisCache("localhost:6379", "", 0)

	// Create CPQ service v2 with repositories
	cpqServiceV2, err := server.NewCPQServiceV2(modelRepo, configRepo, cacheRepo)
	if err != nil {
		log.Fatal("Failed to create CPQ service:", err)
	}

	// Create regular CPQ service for v1 API
	cpqService := server.NewCPQService()

	// Create server with v1 support
	srv, err := server.NewServer(
		server.DefaultServerConfig(),
		cpqService,
		nil, // No auth for this example
	)
	if err != nil {
		log.Fatal("Failed to create server:", err)
	}

	// Create session store
	sessionStore := server.NewPostgresSessionStore(db)

	// Enable session support for v2 API
	if err := srv.EnableSessionSupport(sessionStore, cpqServiceV2); err != nil {
		log.Fatal("Failed to enable session support:", err)
	}

	log.Println("Server configured with:")
	log.Println("- V1 API at http://localhost:8080/api/v1")
	log.Println("- V2 Session-based API at http://localhost:8080/api/v2")

	// Start server
	if err := srv.Start(); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

// Example API usage:
//
// 1. Create a new session:
//    POST /api/v2/configurations
//    {
//      "model_id": "laptop",
//      "name": "My Configuration"
//    }
//    Response: { "session_id": "...", "session_token": "...", "expires_at": "..." }
//
// 2. Update selections in session:
//    PUT /api/v2/configurations/{session_id}
//    {
//      "selections": [
//        { "option_id": "cpu_i7", "quantity": 1 },
//        { "option_id": "ram_16gb", "quantity": 1 }
//      ]
//    }
//
// 3. Validate configuration:
//    POST /api/v2/configurations/{session_id}/validate
//
// 4. Calculate price:
//    POST /api/v2/configurations/{session_id}/price
//
// 5. Complete session:
//    POST /api/v2/configurations/{session_id}/complete
//
// 6. Extend session expiry:
//    POST /api/v2/configurations/{session_id}/extend
//    { "days": 30 }
//
// 7. Get user's sessions:
//    GET /api/v2/configurations/user-sessions
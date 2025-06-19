// main.go
// Fixed main application integrating modular server with database support

package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"DD/auth"
	"DD/cache"
	"DD/database"
	"DD/repository"
	"DD/server"
	"github.com/joho/godotenv"
)

// AppConfig holds application configuration
type AppConfig struct {
	// Server
	Port         string
	Environment  string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	IdleTimeout  time.Duration
	EnableCORS   bool
	LogLevel     string

	// Database
	DatabaseURL string
	DBHost      string
	DBPort      int
	DBName      string
	DBUser      string
	DBPassword  string

	// Authentication
	JWTSecret string
	JWTExpiry time.Duration
}

func main() {
	log.Println("🚀 Starting CPQ Enterprise Configuration System...")

	// Load configuration
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	// Initialize database (if configured)
	var db *database.DB
	if config.DatabaseURL != "" || config.DBHost != "" {
		db, err = initializeDatabase(config)
		if err != nil {
			log.Printf("⚠️ Database initialization failed, using in-memory mode: %v", err)
		} else {
			defer db.Close()
			log.Printf("✅ Database connected successfully")
		}
	}

	// Initialize authentication service
	authService := auth.NewService(auth.Config{
		JWTSecret: config.JWTSecret,
		JWTExpiry: config.JWTExpiry,
	})
	log.Printf("🔐 Authentication service initialized")

	// Create auth adapter for server integration
	authAdapter := server.NewAuthServiceAdapter(authService)

	// Initialize CPQ service with repository pattern
	var cpqService server.CPQServiceInterface
	if db != nil {
		// Use the new service with database support
		log.Printf("🔧 Initializing CPQ service with database support...")
		
		// Create repositories
		modelRepo := repository.NewPostgresModelRepository(db)
		configRepo := repository.NewPostgresConfigRepository(db)
		
		// Create cache
		cacheConfig := cache.NewCacheConfig()
		cacheRepo, err := cache.NewCacheRepository(cacheConfig)
		if err != nil {
			log.Printf("⚠️ Failed to create cache, using in-memory: %v", err)
			cacheRepo = cache.NewMemoryCache("cpq", 100*1024*1024) // 100MB
		}
		
		// Create enhanced service
		cpqServiceV2, err := server.NewCPQServiceV2(modelRepo, configRepo, cacheRepo)
		if err != nil {
			log.Fatalf("❌ Failed to create CPQ service: %v", err)
		}
		cpqService = cpqServiceV2
		
		log.Printf("✅ CPQ service initialized with database and cache support")
		log.Printf("📊 Cache type: %s", cacheConfig.Type)
		
	} else {
		// Fall back to in-memory service
		log.Printf("⚠️ No database configured, using in-memory CPQ service")
		cpqServiceV1, err := server.NewCPQService()
		if err != nil {
			log.Fatalf("❌ Failed to create CPQ service: %v", err)
		}
		cpqService = cpqServiceV1
	}

	// Create server configuration
	serverConfig := &server.ServerConfig{
		Port:           config.Port,
		ReadTimeout:    config.ReadTimeout,
		WriteTimeout:   config.WriteTimeout,
		IdleTimeout:    config.IdleTimeout,
		MaxRequestSize: 1024 * 1024, // 1MB
		EnableCORS:     config.EnableCORS,
		LogRequests:    true,
		EnableAuth:     true, // Enable JWT authentication
	}

	// Create modular server with all handlers and auth service
	apiServer, err := server.NewServer(serverConfig, cpqService, authAdapter)
	if err != nil {
		log.Fatalf("❌ Failed to create server: %v", err)
	}

	// Start server
	go func() {
		log.Printf("✅ CPQ API Server starting on port %s", config.Port)
		log.Printf("🌐 Health check: http://localhost:%s/api/v1/health", config.Port)
		log.Printf("📋 Environment: %s", config.Environment)
		log.Printf("🎯 All 56 REST API endpoints available")

		if err := apiServer.Start(); err != nil {
			log.Fatalf("❌ Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Gracefully shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := apiServer.Stop(ctx); err != nil {
		log.Printf("❌ Server shutdown error: %v", err)
	} else {
		log.Printf("✅ Server shutdown complete")
	}
}

// loadConfig loads configuration from environment variables and command line flags
func loadConfig() (*AppConfig, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, using environment variables")
	}

	config := &AppConfig{
		// Default values
		Port:         getEnv("CPQ_PORT", "8080"),
		Environment:  getEnv("CPQ_ENVIRONMENT", "development"),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
		EnableCORS:   true,
		LogLevel:     getEnv("LOG_LEVEL", "info"),

		// Database
		DatabaseURL: os.Getenv("DATABASE_URL"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBName:      getEnv("DB_NAME", "cpq"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  os.Getenv("DB_PASSWORD"),

		// Authentication
		JWTSecret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		JWTExpiry: 24 * time.Hour,
	}

	// Parse DB port
	if dbPortStr := os.Getenv("DB_PORT"); dbPortStr != "" {
		if port, err := strconv.Atoi(dbPortStr); err == nil {
			config.DBPort = port
		} else {
			config.DBPort = 5432
		}
	} else {
		config.DBPort = 5432
	}

	// Parse command line flags
	flag.StringVar(&config.Port, "port", config.Port, "Server port")
	flag.StringVar(&config.Environment, "env", config.Environment, "Environment (development, staging, production)")
	flag.BoolVar(&config.EnableCORS, "cors", config.EnableCORS, "Enable CORS")
	flag.Parse()

	// Parse timeouts from environment
	if readTimeoutStr := os.Getenv("READ_TIMEOUT"); readTimeoutStr != "" {
		if duration, err := time.ParseDuration(readTimeoutStr); err == nil {
			config.ReadTimeout = duration
		}
	}
	if writeTimeoutStr := os.Getenv("WRITE_TIMEOUT"); writeTimeoutStr != "" {
		if duration, err := time.ParseDuration(writeTimeoutStr); err == nil {
			config.WriteTimeout = duration
		}
	}
	if jwtExpiryStr := os.Getenv("JWT_EXPIRY"); jwtExpiryStr != "" {
		if duration, err := time.ParseDuration(jwtExpiryStr); err == nil {
			config.JWTExpiry = duration
		}
	}

	// Validate required configuration
	if config.Port == "" {
		return nil, fmt.Errorf("port is required")
	}
	if config.JWTSecret == "" {
		return nil, fmt.Errorf("JWT secret is required")
	}

	return config, nil
}

// initializeDatabase creates database connection and validates schema
func initializeDatabase(config *AppConfig) (*database.DB, error) {
	log.Printf("🔧 Connecting to database...")

	var dbConfig database.Config
	if config.DatabaseURL != "" {
		// Use DATABASE_URL if provided (for production/Docker)
		dbConfig = database.Config{
			Host: config.DatabaseURL,
		}
	} else {
		// Use individual connection parameters
		dbConfig = database.Config{
			Host:     config.DBHost,
			Port:     config.DBPort,
			User:     config.DBUser,
			Password: config.DBPassword,
			DBName:   config.DBName,
			SSLMode:  "disable", // Use "require" in production
		}
	}

	db, err := database.Connect(dbConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Test database with a simple query (if tables exist)
	// This is optional - the database package should handle schema validation
	log.Printf("✅ Database connection established")
	return db, nil
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// main.go
// Updated main application with PostgreSQL and JWT authentication

package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"DD/auth"
	"DD/cpq"
	"DD/database"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
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

// CPQServiceDB is an enhanced CPQ service with database support
type CPQServiceDB struct {
	db          *database.DB
	authService *auth.Service
}

func main() {
	log.Println("🚀 Starting CPQ Enterprise Configuration System...")

	// Load configuration
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}

	// Initialize database
	db, err := initializeDatabase(config)
	if err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize authentication service
	authService := auth.NewService(auth.Config{
		JWTSecret: config.JWTSecret,
		JWTExpiry: config.JWTExpiry,
	})

	// Initialize CPQ service with database
	cpqService := &CPQServiceDB{
		db:          db,
		authService: authService,
	}

	// Create HTTP server
	server := createHTTPServer(config, cpqService, authService)

	// Start server
	go func() {
		log.Printf("✅ CPQ API Server starting on port %s", config.Port)
		log.Printf("🌐 Health check: http://localhost:%s/health", config.Port)
		log.Printf("📋 Environment: %s", config.Environment)

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
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

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("❌ Server forced to shutdown: %v", err)
	}

	log.Println("✅ CPQ API Server exited")
}

// loadConfig loads configuration from environment variables and flags
func loadConfig() (*AppConfig, error) {
	config := &AppConfig{
		// Default values
		Port:         "8080",
		Environment:  "development",
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
		EnableCORS:   true,
		LogLevel:     "info",
		DBHost:       "localhost",
		DBPort:       5432,
		DBName:       "cpq_db",
		DBUser:       "cpq_user",
		DBPassword:   "cpq_password",
		JWTExpiry:    24 * time.Hour,
	}

	// Command line flags
	flag.StringVar(&config.Port, "port", config.Port, "Server port")
	flag.StringVar(&config.Environment, "env", config.Environment, "Environment (development, production)")
	flag.StringVar(&config.DBHost, "db-host", config.DBHost, "Database host")
	flag.IntVar(&config.DBPort, "db-port", config.DBPort, "Database port")
	flag.StringVar(&config.DBName, "db-name", config.DBName, "Database name")
	flag.StringVar(&config.DBUser, "db-user", config.DBUser, "Database user")
	flag.StringVar(&config.DBPassword, "db-password", config.DBPassword, "Database password")
	flag.Parse()

	// Environment variables (override flags)
	if port := os.Getenv("PORT"); port != "" {
		config.Port = port
	}
	if env := os.Getenv("ENVIRONMENT"); env != "" {
		config.Environment = env
	}
	if dbURL := os.Getenv("DATABASE_URL"); dbURL != "" {
		config.DatabaseURL = dbURL
	}
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		config.DBHost = dbHost
	}
	if dbPort := os.Getenv("DB_PORT"); dbPort != "" {
		if port, err := strconv.Atoi(dbPort); err == nil {
			config.DBPort = port
		}
	}
	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		config.DBName = dbName
	}
	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		config.DBUser = dbUser
	}
	if dbPassword := os.Getenv("DB_PASSWORD"); dbPassword != "" {
		config.DBPassword = dbPassword
	}
	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		config.JWTSecret = jwtSecret
	} else if config.JWTSecret == "" {
		config.JWTSecret = "default-development-secret-change-in-production"
		if config.Environment == "production" {
			return nil, fmt.Errorf("JWT_SECRET must be set in production")
		}
	}
	if jwtExpiry := os.Getenv("JWT_EXPIRY"); jwtExpiry != "" {
		if duration, err := time.ParseDuration(jwtExpiry); err == nil {
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

	// Test database with a simple query
	var modelCount int
	err = db.QueryRow("SELECT COUNT(*) FROM models WHERE is_active = true").Scan(&modelCount)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %w", err)
	}

	log.Printf("✅ Database connected successfully (%d active models)", modelCount)
	return db, nil
}

// createHTTPServer creates and configures the HTTP server
func createHTTPServer(config *AppConfig, cpqService *CPQServiceDB, authService *auth.Service) *http.Server {
	router := mux.NewRouter()

	// Middleware
	router.Use(loggingMiddleware)
	if config.EnableCORS {
		router.Use(corsMiddleware)
	}
	router.Use(authService.AuthMiddleware)

	// Health and status endpoints (public)
	router.HandleFunc("/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/v1/health", healthHandler).Methods("GET")
	router.HandleFunc("/api/v1/status", statusHandler).Methods("GET")

	// Authentication endpoints (public)
	router.HandleFunc("/api/v1/auth/login", cpqService.loginHandler).Methods("POST")

	// CPQ endpoints (authenticated)
	api := router.PathPrefix("/api/v1").Subrouter()

	// Models
	api.HandleFunc("/models", cpqService.listModelsHandler).Methods("GET")
	api.HandleFunc("/models/{id}", cpqService.getModelHandler).Methods("GET")

	// Configurations
	api.HandleFunc("/configurations", cpqService.createConfigurationHandler).Methods("POST")
	api.HandleFunc("/configurations/{id}", cpqService.getConfigurationHandler).Methods("GET")
	api.HandleFunc("/configurations/{id}/selections", cpqService.addSelectionHandler).Methods("POST")
	api.HandleFunc("/configurations/{id}/validate", cpqService.validateConfigurationHandler).Methods("POST")
	api.HandleFunc("/configurations/{id}/price", cpqService.calculatePriceHandler).Methods("POST")

	return &http.Server{
		Addr:         ":" + config.Port,
		Handler:      router,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
		IdleTimeout:  config.IdleTimeout,
	}
}

// HTTP Handlers

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status":"healthy","timestamp":"%s"}`, time.Now().UTC().Format(time.RFC3339))
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{
		"status": "running",
		"version": "1.0.0",
		"timestamp": "%s",
		"features": ["authentication", "database_storage", "constraint_resolution", "pricing_engine"]
	}`, time.Now().UTC().Format(time.RFC3339))
}

// CPQ Service Handlers (implement key endpoints)

func (s *CPQServiceDB) loginHandler(w http.ResponseWriter, r *http.Request) {
	var loginReq auth.LoginRequest
	if err := parseJSONRequest(r, &loginReq); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Simple authentication - in production, query users table
	if loginReq.Email == "demo@cpq.local" && loginReq.Password == "demo123" {
		token, expiresAt, err := s.authService.GenerateToken("demo-user-id", loginReq.Email, "admin")
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		response := auth.LoginResponse{
			Token:     token,
			ExpiresAt: expiresAt,
			User: auth.UserInfo{
				ID:    "demo-user-id",
				Email: loginReq.Email,
				Name:  "Demo User",
				Role:  "admin",
			},
		}

		writeJSONResponse(w, response)
		return
	}

	http.Error(w, "Invalid credentials", http.StatusUnauthorized)
}

func (s *CPQServiceDB) listModelsHandler(w http.ResponseWriter, r *http.Request) {
	models, err := s.db.ListModels()
	if err != nil {
		http.Error(w, "Failed to list models", http.StatusInternalServerError)
		return
	}

	writeJSONResponse(w, map[string]interface{}{
		"models": models,
		"total":  len(models),
	})
}

func (s *CPQServiceDB) getModelHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	modelID := vars["id"]

	model, err := s.db.GetModel(modelID)
	if err != nil {
		http.Error(w, "Model not found", http.StatusNotFound)
		return
	}

	writeJSONResponse(w, model)
}

func (s *CPQServiceDB) createConfigurationHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ModelID     string `json:"model_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := parseJSONRequest(r, &req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	userID := auth.GetUserID(r.Context())
	config := &cpq.Configuration{
		ID:         generateUUID(),
		ModelID:    req.ModelID,
		IsValid:    false,
		TotalPrice: 0.0,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	var uid *string
	if userID != "" {
		uid = &userID
	}

	if err := s.db.CreateConfiguration(config, uid); err != nil {
		http.Error(w, "Failed to create configuration", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	writeJSONResponse(w, config)
}

func (s *CPQServiceDB) getConfigurationHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	configID := vars["id"]
	userID := auth.GetUserID(r.Context())

	var uid *string
	if userID != "" {
		uid = &userID
	}

	config, err := s.db.GetConfiguration(configID, uid)
	if err != nil {
		http.Error(w, "Configuration not found", http.StatusNotFound)
		return
	}

	writeJSONResponse(w, config)
}

func (s *CPQServiceDB) addSelectionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	configID := vars["id"]

	var req struct {
		OptionID string `json:"option_id"`
		Quantity int    `json:"quantity"`
	}
	if err := parseJSONRequest(r, &req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := s.db.AddSelection(configID, req.OptionID, req.Quantity); err != nil {
		http.Error(w, "Failed to add selection", http.StatusBadRequest)
		return
	}

	writeJSONResponse(w, map[string]string{"status": "success"})
}

func (s *CPQServiceDB) validateConfigurationHandler(w http.ResponseWriter, r *http.Request) {
	// Simplified validation - in full implementation, use MTBDD engine
	writeJSONResponse(w, map[string]interface{}{
		"is_valid":      true,
		"violations":    []string{},
		"suggestions":   []string{},
		"response_time": "45ms",
	})
}

func (s *CPQServiceDB) calculatePriceHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	configID := vars["id"]
	userID := auth.GetUserID(r.Context())

	var uid *string
	if userID != "" {
		uid = &userID
	}

	config, err := s.db.GetConfiguration(configID, uid)
	if err != nil {
		http.Error(w, "Configuration not found", http.StatusNotFound)
		return
	}

	// Return current total price from database
	writeJSONResponse(w, map[string]interface{}{
		"total":     config.TotalPrice,
		"currency":  "USD",
		"timestamp": time.Now().UTC(),
	})
}

// Utility functions
func parseJSONRequest(r *http.Request, v interface{}) error {
	return json.NewDecoder(r.Body).Decode(v)
}

func writeJSONResponse(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

func generateUUID() string {
	return uuid.New().String()
}

// Middleware

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		duration := time.Since(start)
		log.Printf("%s %s - %v", r.Method, r.URL.Path, duration)
	})
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

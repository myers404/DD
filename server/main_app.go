// main.go - Complete CPQ REST API Application Entry Point
// Production-ready HTTP server with full CPQ functionality

package server

import (
	"DD/cpq"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

// Application version and build information
const (
	AppName    = "CPQ REST API"
	AppVersion = "1.0.0"
	BuildDate  = "2025-06-11"
)

// Configuration loaded from environment variables and flags
type AppConfig struct {
	// Server configuration
	Port            string
	Host            string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	ShutdownTimeout time.Duration

	// API configuration
	MaxRequestSize int64
	EnableCORS     bool
	LogRequests    bool

	// CPQ configuration
	ModelsPath    string
	EnableMetrics bool
	EnableDebug   bool

	// Environment
	Environment string
	LogLevel    string
}

// DefaultAppConfig returns default application configuration
func DefaultAppConfig() *AppConfig {
	return &AppConfig{
		Port:            "8080",
		Host:            "0.0.0.0",
		ReadTimeout:     30 * time.Second,
		WriteTimeout:    30 * time.Second,
		IdleTimeout:     120 * time.Second,
		ShutdownTimeout: 30 * time.Second,
		MaxRequestSize:  1024 * 1024, // 1MB
		EnableCORS:      true,
		LogRequests:     true,
		ModelsPath:      "./models",
		EnableMetrics:   false,
		EnableDebug:     false,
		Environment:     "development",
		LogLevel:        "info",
	}
}

// LoadConfigFromEnv loads configuration from environment variables
func LoadConfigFromEnv() *AppConfig {
	config := DefaultAppConfig()

	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found, using environment variables and defaults")
	}

	// Server configuration
	if port := os.Getenv("CPQ_PORT"); port != "" {
		config.Port = port
	}
	if host := os.Getenv("CPQ_HOST"); host != "" {
		config.Host = host
	}
	if env := os.Getenv("CPQ_ENVIRONMENT"); env != "" {
		config.Environment = env
	}
	if logLevel := os.Getenv("CPQ_LOG_LEVEL"); logLevel != "" {
		config.LogLevel = logLevel
	}

	// Parse timeout durations
	if readTimeout := os.Getenv("CPQ_READ_TIMEOUT"); readTimeout != "" {
		if duration, err := time.ParseDuration(readTimeout); err == nil {
			config.ReadTimeout = duration
		}
	}
	if writeTimeout := os.Getenv("CPQ_WRITE_TIMEOUT"); writeTimeout != "" {
		if duration, err := time.ParseDuration(writeTimeout); err == nil {
			config.WriteTimeout = duration
		}
	}

	// API configuration
	if cors := os.Getenv("CPQ_ENABLE_CORS"); cors == "false" {
		config.EnableCORS = false
	}
	if logs := os.Getenv("CPQ_LOG_REQUESTS"); logs == "false" {
		config.LogRequests = false
	}
	if debug := os.Getenv("CPQ_DEBUG"); debug == "true" {
		config.EnableDebug = true
	}
	if metrics := os.Getenv("CPQ_METRICS"); metrics == "true" {
		config.EnableMetrics = true
	}

	// CPQ configuration
	if modelsPath := os.Getenv("CPQ_MODELS_PATH"); modelsPath != "" {
		config.ModelsPath = modelsPath
	}

	return config
}

// ParseCommandLineFlags parses command line arguments and overrides config
func ParseCommandLineFlags(config *AppConfig) {
	flag.StringVar(&config.Port, "port", config.Port, "Server port")
	flag.StringVar(&config.Host, "host", config.Host, "Server host")
	flag.StringVar(&config.Environment, "env", config.Environment, "Environment (development, staging, production)")
	flag.StringVar(&config.LogLevel, "log-level", config.LogLevel, "Log level (debug, info, warn, error)")
	flag.StringVar(&config.ModelsPath, "models-path", config.ModelsPath, "Path to CPQ models directory")
	flag.BoolVar(&config.EnableDebug, "debug", config.EnableDebug, "Enable debug mode")
	flag.BoolVar(&config.EnableMetrics, "metrics", config.EnableMetrics, "Enable metrics collection")
	flag.BoolVar(&config.EnableCORS, "cors", config.EnableCORS, "Enable CORS")
	flag.BoolVar(&config.LogRequests, "log-requests", config.LogRequests, "Log HTTP requests")

	var showVersion = flag.Bool("version", false, "Show version information")
	var showHelp = flag.Bool("help", false, "Show help information")

	flag.Parse()

	if *showVersion {
		printVersionInfo()
		os.Exit(0)
	}

	if *showHelp {
		printHelpInfo()
		os.Exit(0)
	}
}

// printVersionInfo prints application version information
func printVersionInfo() {
	fmt.Printf("%s v%s\n", AppName, AppVersion)
	fmt.Printf("Build Date: %s\n", BuildDate)
	fmt.Printf("Go Version: %s\n", "go1.21+")
}

// printHelpInfo prints application help information
func printHelpInfo() {
	printVersionInfo()
	fmt.Println()
	fmt.Println("CPQ REST API - Enterprise Configure-Price-Quote System")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Printf("  %s [options]\n", os.Args[0])
	fmt.Println()
	fmt.Println("Options:")
	flag.PrintDefaults()
	fmt.Println()
	fmt.Println("Environment Variables:")
	fmt.Println("  CPQ_PORT                Server port (default: 8080)")
	fmt.Println("  CPQ_HOST                Server host (default: 0.0.0.0)")
	fmt.Println("  CPQ_ENVIRONMENT         Environment: development, staging, production")
	fmt.Println("  CPQ_LOG_LEVEL           Log level: debug, info, warn, error")
	fmt.Println("  CPQ_READ_TIMEOUT        HTTP read timeout (e.g., 30s)")
	fmt.Println("  CPQ_WRITE_TIMEOUT       HTTP write timeout (e.g., 30s)")
	fmt.Println("  CPQ_ENABLE_CORS         Enable CORS (true/false)")
	fmt.Println("  CPQ_LOG_REQUESTS        Log HTTP requests (true/false)")
	fmt.Println("  CPQ_DEBUG               Enable debug mode (true/false)")
	fmt.Println("  CPQ_METRICS             Enable metrics (true/false)")
	fmt.Println("  CPQ_MODELS_PATH         Path to models directory")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Printf("  %s -port 9000 -env production\n", os.Args[0])
	fmt.Printf("  CPQ_PORT=9000 CPQ_ENVIRONMENT=production %s\n", os.Args[0])
	fmt.Println()
	fmt.Println("API Endpoints:")
	fmt.Println("  GET    /api/v1/health                    - Health check")
	fmt.Println("  GET    /api/v1/status                    - System status")
	fmt.Println("  GET    /api/v1/version                   - API version")
	fmt.Println("  GET    /api/v1/models                    - List models")
	fmt.Println("  POST   /api/v1/configurations            - Create configuration")
	fmt.Println("  POST   /api/v1/pricing/calculate         - Calculate pricing")
	fmt.Println("  POST   /api/v1/models/{id}/validate      - Validate model")
	fmt.Println("  GET    /api/v1/pricing/volume-tiers      - Get volume tiers")
	fmt.Println()
	fmt.Println("For complete API documentation, visit: http://localhost:8080/api/v1/health")
}

// setupLogging configures application logging
func setupLogging(config *AppConfig) {
	// Configure log format
	log.SetFlags(log.LstdFlags | log.Lshortfile)

	// Set log level based on configuration
	switch config.LogLevel {
	case "debug":
		if config.EnableDebug {
			log.SetOutput(os.Stdout)
		}
	case "info":
		log.SetOutput(os.Stdout)
	case "warn", "error":
		log.SetOutput(os.Stderr)
	default:
		log.SetOutput(os.Stdout)
	}

	// Log startup information
	log.Printf("🚀 Starting %s v%s", AppName, AppVersion)
	log.Printf("📋 Environment: %s", config.Environment)
	log.Printf("🔧 Log Level: %s", config.LogLevel)
	if config.EnableDebug {
		log.Printf("🐛 Debug mode enabled")
	}
	if config.EnableMetrics {
		log.Printf("📊 Metrics collection enabled")
	}
}

// initializeDirectories creates necessary directories
func initializeDirectories(config *AppConfig) error {
	// Create models directory if it doesn't exist
	if config.ModelsPath != "" {
		if err := os.MkdirAll(config.ModelsPath, 0755); err != nil {
			return fmt.Errorf("failed to create models directory: %w", err)
		}
		log.Printf("📁 Models directory: %s", config.ModelsPath)
	}

	// Create logs directory for production
	if config.Environment == "production" {
		logsDir := "./logs"
		if err := os.MkdirAll(logsDir, 0755); err != nil {
			log.Printf("Warning: Failed to create logs directory: %v", err)
		}
	}

	return nil
}

// createServerConfig converts app config to server config
func createServerConfig(appConfig *AppConfig) *ServerConfig {
	return &ServerConfig{
		Port:           appConfig.Port,
		ReadTimeout:    appConfig.ReadTimeout,
		WriteTimeout:   appConfig.WriteTimeout,
		IdleTimeout:    appConfig.IdleTimeout,
		MaxRequestSize: appConfig.MaxRequestSize,
		EnableCORS:     appConfig.EnableCORS,
		LogRequests:    appConfig.LogRequests,
	}
}

// initializeCPQService creates and configures the CPQ service
func initializeCPQService(config *AppConfig) (*CPQService, error) {
	log.Printf("🔧 Initializing CPQ service...")

	// Create CPQ service
	service, err := NewCPQService()
	if err != nil {
		return nil, fmt.Errorf("failed to create CPQ service: %w", err)
	}

	// Load additional models from directory if specified
	if config.ModelsPath != "" && config.ModelsPath != "./models" {
		if err := loadModelsFromDirectory(service, config.ModelsPath); err != nil {
			log.Printf("Warning: Failed to load models from %s: %v", config.ModelsPath, err)
		}
	}

	// Validate service health
	if err := service.HealthCheck(); err != nil {
		return nil, fmt.Errorf("CPQ service health check failed: %w", err)
	}

	models := service.ListModels()
	log.Printf("✅ CPQ service initialized with %d models", len(models))

	return service, nil
}

// loadModelsFromDirectory loads CPQ models from a directory
func loadModelsFromDirectory(service *CPQService, modelsPath string) error {
	// In a real implementation, this would scan the directory for model files
	// and load them into the service. For this demo, we'll just log the attempt.

	log.Printf("📂 Scanning models directory: %s", modelsPath)

	// Check if directory exists
	if _, err := os.Stat(modelsPath); os.IsNotExist(err) {
		return fmt.Errorf("models directory does not exist: %s", modelsPath)
	}

	// Walk directory for model files
	modelFiles := []string{}
	err := filepath.Walk(modelsPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Look for JSON or YAML model files
		if !info.IsDir() && (filepath.Ext(path) == ".json" || filepath.Ext(path) == ".yaml" || filepath.Ext(path) == ".yml") {
			modelFiles = append(modelFiles, path)
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("failed to scan models directory: %w", err)
	}

	log.Printf("📋 Found %d potential model files", len(modelFiles))

	// In production, you would parse and load each model file
	// For demo purposes, we'll just log the files found
	for _, file := range modelFiles {
		log.Printf("   - %s", filepath.Base(file))
	}

	return nil
}

// runServer starts and manages the HTTP server
func runServer(config *AppConfig, service *CPQService) error {
	// Create server
	serverConfig := createServerConfig(config)

	// Create server without auth service (server/main_app.go doesn't use authentication)
	server, err := NewServer(serverConfig, service, nil)
	if err != nil {
		return fmt.Errorf("failed to create server: %w", err)
	}

	// Start server
	log.Printf("🌐 Starting HTTP server on %s:%s", config.Host, config.Port)
	log.Printf("📖 API Documentation: http://%s:%s/api/v1/health", config.Host, config.Port)
	log.Printf("🔍 Health Check: http://%s:%s/api/v1/health", config.Host, config.Port)

	if err := server.Start(); err != nil {
		return fmt.Errorf("failed to start server: %w", err)
	}

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	select {
	case sig := <-quit:
		log.Printf("🛑 Received signal: %v", sig)
	}

	// Graceful shutdown
	log.Printf("🔄 Initiating graceful shutdown...")

	ctx, cancel := context.WithTimeout(context.Background(), config.ShutdownTimeout)
	defer cancel()

	if err := server.Stop(ctx); err != nil {
		return fmt.Errorf("server shutdown error: %w", err)
	}

	log.Printf("✅ Server shutdown complete")
	return nil
}

// printStartupBanner prints an attractive startup banner
func printStartupBanner(config *AppConfig) {
	fmt.Println()
	fmt.Println("┌─────────────────────────────────────────────────────────────┐")
	fmt.Printf("│                   %s v%s                     │\n", AppName, AppVersion)
	fmt.Println("├─────────────────────────────────────────────────────────────┤")
	fmt.Printf("│ Environment: %-10s │ Port: %-6s │ Debug: %-5t │\n",
		config.Environment, config.Port, config.EnableDebug)
	fmt.Printf("│ CORS: %-7t │ Logging: %-5t │ Metrics: %-5t │\n",
		config.EnableCORS, config.LogRequests, config.EnableMetrics)
	fmt.Println("├─────────────────────────────────────────────────────────────┤")
	fmt.Println("│                    🚀 Starting Server...                    │")
	fmt.Println("└─────────────────────────────────────────────────────────────┘")
	fmt.Println()
}

// printShutdownBanner prints a shutdown banner
func printShutdownBanner() {
	fmt.Println()
	fmt.Println("┌─────────────────────────────────────────────────────────────┐")
	fmt.Printf("│                   %s v%s                     │\n", AppName, AppVersion)
	fmt.Println("├─────────────────────────────────────────────────────────────┤")
	fmt.Println("│                  👋 Server Stopped                          │")
	fmt.Println("│              Thank you for using CPQ API!                  │")
	fmt.Println("└─────────────────────────────────────────────────────────────┘")
	fmt.Println()
}

// validateConfiguration validates the application configuration
func validateConfiguration(config *AppConfig) error {
	// Validate port
	if config.Port == "" {
		return fmt.Errorf("port cannot be empty")
	}

	// Validate environment
	validEnvs := map[string]bool{
		"development": true,
		"staging":     true,
		"production":  true,
		"test":        true,
	}

	if !validEnvs[config.Environment] {
		return fmt.Errorf("invalid environment: %s (must be one of: development, staging, production, test)", config.Environment)
	}

	// Validate timeouts
	if config.ReadTimeout <= 0 {
		return fmt.Errorf("read timeout must be positive")
	}

	if config.WriteTimeout <= 0 {
		return fmt.Errorf("write timeout must be positive")
	}

	// Production-specific validations
	if config.Environment == "production" {
		if config.EnableDebug {
			log.Printf("Warning: Debug mode enabled in production")
		}

		if config.LogLevel == "debug" {
			log.Printf("Warning: Debug log level in production may impact performance")
		}
	}

	return nil
}

// main is the application entry point
func main() {
	// Load configuration
	config := LoadConfigFromEnv()
	ParseCommandLineFlags(config)

	// Validate configuration
	if err := validateConfiguration(config); err != nil {
		log.Fatalf("❌ Configuration validation failed: %v", err)
	}

	// Setup logging
	setupLogging(config)

	// Print startup banner
	printStartupBanner(config)

	// Initialize directories
	if err := initializeDirectories(config); err != nil {
		log.Fatalf("❌ Failed to initialize directories: %v", err)
	}

	// Initialize CPQ service
	service, err := initializeCPQService(config)
	if err != nil {
		log.Fatalf("❌ Failed to initialize CPQ service: %v", err)
	}

	// Run server
	if err := runServer(config, service); err != nil {
		log.Fatalf("❌ Server error: %v", err)
	}

	// Print shutdown banner
	printShutdownBanner()
}

// Additional utility functions for development and testing

// CreateDevelopmentService creates a CPQ service with sample data for development
func CreateDevelopmentService() (*CPQService, error) {
	service, err := NewCPQService()
	if err != nil {
		return nil, err
	}

	// Add additional development models
	devModel := &cpq.Model{
		ID:          "development-laptop",
		Name:        "Development Laptop Model",
		Description: "Enhanced laptop model for development testing",
		Version:     "1.1.0",
		Options: []cpq.Option{
			{ID: "opt_cpu_dev", Name: "Development CPU", BasePrice: 400.0},
			{ID: "opt_ram_dev", Name: "Development RAM 32GB", BasePrice: 300.0},
			{ID: "opt_storage_dev", Name: "Development SSD 1TB", BasePrice: 250.0},
			{ID: "opt_graphics_dev", Name: "Development GPU", BasePrice: 600.0},
		},
		Groups: []cpq.Group{
			{
				ID:            "grp_dev_core",
				Name:          "Development Core",
				Type:          "multi-select",
				MinSelections: 2,
				MaxSelections: 4,
				OptionIDs:     []string{"opt_cpu_dev", "opt_ram_dev", "opt_storage_dev", "opt_graphics_dev"},
			},
		},
		Rules: []cpq.Rule{
			{
				ID:         "rule_dev_gpu",
				Name:       "Development GPU Rule",
				Type:       "requires",
				Expression: "opt_graphics_dev -> opt_cpu_dev",
				Priority:   100,
			},
		},
		PriceRules: []cpq.PriceRule{
			{
				ID:         "pricing_dev_bundle",
				Name:       "Development Bundle Discount",
				Type:       "bundle_discount",
				Expression: "opt_cpu_dev && opt_ram_dev && opt_storage_dev",
			},
		},
	}

	if err := service.AddModel(devModel); err != nil {
		return nil, fmt.Errorf("failed to add development model: %w", err)
	}

	return service, nil
}

// CreateTestService creates a minimal CPQ service for testing
func CreateTestService() (*CPQService, error) {
	service, err := NewCPQService()
	if err != nil {
		return nil, err
	}

	// Add minimal test model
	testModel := &cpq.Model{
		ID:          "test-model",
		Name:        "Test Model",
		Description: "Minimal model for testing",
		Version:     "0.1.0",
		Options: []cpq.Option{
			{ID: "opt_test_a", Name: "Test Option A", BasePrice: 100.0},
			{ID: "opt_test_b", Name: "Test Option B", BasePrice: 200.0},
		},
		Groups: []cpq.Group{
			{
				ID:        "grp_test",
				Name:      "Test Group",
				Type:      "single-select",
				OptionIDs: []string{"opt_test_a", "opt_test_b"},
			},
		},
		Rules: []cpq.Rule{
			{
				ID:         "rule_test",
				Name:       "Test Rule",
				Type:       "validation",
				Expression: "opt_test_a || opt_test_b",
				Priority:   100,
			},
		},
	}

	if err := service.AddModel(testModel); err != nil {
		return nil, fmt.Errorf("failed to add test model: %w", err)
	}

	return service, nil
}

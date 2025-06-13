// server.go - Main HTTP Server for CPQ REST API
// Provides clean, modular HTTP server with middleware and routing

package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// ServerConfig holds server configuration
type ServerConfig struct {
	Port           string        `json:"port"`
	ReadTimeout    time.Duration `json:"read_timeout"`
	WriteTimeout   time.Duration `json:"write_timeout"`
	IdleTimeout    time.Duration `json:"idle_timeout"`
	MaxRequestSize int64         `json:"max_request_size"`
	EnableCORS     bool          `json:"enable_cors"`
	LogRequests    bool          `json:"log_requests"`
}

// DefaultServerConfig returns default server configuration
func DefaultServerConfig() *ServerConfig {
	return &ServerConfig{
		Port:           "8080",
		ReadTimeout:    30 * time.Second,
		WriteTimeout:   30 * time.Second,
		IdleTimeout:    120 * time.Second,
		MaxRequestSize: 1024 * 1024, // 1MB
		EnableCORS:     true,
		LogRequests:    true,
	}
}

// Add startTime field to Server struct (add to cpq_server.go struct definition)
type Server struct {
	router     *mux.Router
	server     *http.Server
	config     *ServerConfig
	cpqService *CPQService
	startTime  time.Time // Add this field
}

// Update NewServer to set startTime (modify existing NewServer function)
func NewServer(config *ServerConfig, cpqService *CPQService) (*Server, error) {
	if config == nil {
		config = DefaultServerConfig()
	}

	if cpqService == nil {
		return nil, fmt.Errorf("CPQ service is required")
	}

	s := &Server{
		router:     mux.NewRouter(),
		config:     config,
		cpqService: cpqService,
		startTime:  time.Now(), // Add this line
	}

	// Configure server
	s.server = &http.Server{
		Addr:         ":" + config.Port,
		Handler:      s.router,
		ReadTimeout:  config.ReadTimeout,
		WriteTimeout: config.WriteTimeout,
		IdleTimeout:  config.IdleTimeout,
	}

	// Setup middleware and routes
	s.setupMiddleware()
	s.setupRoutes()

	return s, nil
}

// setupMiddleware configures server middleware
func (s *Server) setupMiddleware() {
	// CORS middleware
	if s.config.EnableCORS {
		c := cors.New(cors.Options{
			AllowedOrigins:   []string{"*"}, // Configure for production
			AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"*"},
			AllowCredentials: true,
		})
		s.router.Use(c.Handler)
	}

	// Request logging middleware
	if s.config.LogRequests {
		s.router.Use(s.loggingMiddleware)
	}

	// Request size limiting middleware
	s.router.Use(s.requestSizeLimitMiddleware)

	// Error recovery middleware
	s.router.Use(s.recoveryMiddleware)

	// Performance timing middleware
	s.router.Use(s.timingMiddleware)
}

// setupRoutes configures all API routes
func (s *Server) setupRoutes() {
	api := s.router.PathPrefix("/api/v1").Subrouter()

	// Health and system endpoints
	api.HandleFunc("/health", s.healthHandler).Methods("GET")
	api.HandleFunc("/status", s.statusHandler).Methods("GET")
	api.HandleFunc("/version", s.versionHandler).Methods("GET")

	// Configuration management routes
	configRouter := api.PathPrefix("/configurations").Subrouter()
	s.setupConfigurationRoutes(configRouter)

	// Model management routes
	modelRouter := api.PathPrefix("/models").Subrouter()
	s.setupModelRoutes(modelRouter)

	// Pricing routes
	pricingRouter := api.PathPrefix("/pricing").Subrouter()
	s.setupPricingRoutes(pricingRouter)
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("🚀 CPQ API Server starting on port %s", s.config.Port)
	log.Printf("📊 Server configuration: ReadTimeout=%v, WriteTimeout=%v",
		s.config.ReadTimeout, s.config.WriteTimeout)

	// Start server in goroutine
	go func() {
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	log.Printf("✅ CPQ API Server running on http://localhost:%s", s.config.Port)
	log.Printf("📖 API Documentation: http://localhost:%s/api/v1/health", s.config.Port)

	return nil
}

// Stop gracefully stops the HTTP server
func (s *Server) Stop(ctx context.Context) error {
	log.Printf("🛑 Gracefully stopping CPQ API Server...")

	if err := s.server.Shutdown(ctx); err != nil {
		log.Printf("❌ Error during server shutdown: %v", err)
		return err
	}

	log.Printf("✅ CPQ API Server stopped successfully")
	return nil
}

// Middleware implementations

func (s *Server) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("📝 %s %s - Started", r.Method, r.URL.Path)

		next.ServeHTTP(w, r)

		duration := time.Since(start)
		log.Printf("✅ %s %s - Completed in %v", r.Method, r.URL.Path, duration)
	})
}

func (s *Server) requestSizeLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.ContentLength > s.config.MaxRequestSize {
			http.Error(w, "Request too large", http.StatusRequestEntityTooLarge)
			return
		}

		r.Body = http.MaxBytesReader(w, r.Body, s.config.MaxRequestSize)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) recoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("❌ Panic recovered: %v", err)
				http.Error(w, "Internal server error", http.StatusInternalServerError)
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func (s *Server) timingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Add timing header
		w.Header().Set("X-Response-Time", "")

		next.ServeHTTP(w, r)

		duration := time.Since(start)
		w.Header().Set("X-Response-Time", duration.String())

		// Log slow requests (>200ms target)
		if duration > 200*time.Millisecond {
			log.Printf("⚠️ Slow request: %s %s took %v", r.Method, r.URL.Path, duration)
		}
	})
}

// System handlers

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"version":   "1.0.0",
		"services": map[string]string{
			"cpq":         "healthy",
			"model_tools": "healthy",
			"database":    "healthy",
		},
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, health, meta)
}

func (s *Server) statusHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()
	// Get detailed system status
	stats := s.cpqService.GetSystemStats()

	status := map[string]interface{}{
		"status":            "operational",
		"timestamp":         time.Now().UTC(),
		"uptime":            time.Since(stats.StartTime),
		"total_requests":    stats.TotalRequests,
		"active_sessions":   stats.ActiveSessions,
		"cache_hit_rate":    stats.CacheHitRate,
		"avg_response_time": stats.AvgResponseTime,
		"memory_usage":      stats.MemoryUsage,
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, status, meta)
}

func (s *Server) versionHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	version := map[string]interface{}{
		"version":     "1.0.0",
		"build_time":  "2025-06-11T00:00:00Z",
		"git_commit":  "latest",
		"api_version": "v1",
		"features": []string{
			"configuration_management",
			"model_building_tools",
			"real_time_validation",
			"pricing_engine",
			"analytics",
		},
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, version, meta)
}

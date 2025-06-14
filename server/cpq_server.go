// server/cpq_server.go - Enhanced HTTP Server with JWT Authentication
// Integrates with existing response helpers and maintains compatibility

package server

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// AuthService interface for JWT operations
type AuthService interface {
	GenerateToken(username string) (string, error)
	ValidateToken(token string) (*TokenClaims, error)
}

// TokenClaims represents JWT token claims
type TokenClaims struct {
	Username  string    `json:"username"`
	Role      string    `json:"role"` // Add role field
	IssuedAt  time.Time `json:"iat"`
	ExpiresAt time.Time `json:"exp"`
}

// ServerConfig holds server configuration
type ServerConfig struct {
	Port           string        `json:"port"`
	ReadTimeout    time.Duration `json:"read_timeout"`
	WriteTimeout   time.Duration `json:"write_timeout"`
	IdleTimeout    time.Duration `json:"idle_timeout"`
	MaxRequestSize int64         `json:"max_request_size"`
	EnableCORS     bool          `json:"enable_cors"`
	LogRequests    bool          `json:"log_requests"`
	EnableAuth     bool          `json:"enable_auth"`
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
		EnableAuth:     false,
	}
}

// Server represents the HTTP server
type Server struct {
	router      *mux.Router
	server      *http.Server
	config      *ServerConfig
	cpqService  *CPQService
	authService AuthService
	startTime   time.Time
}

// NewServer creates a new server instance with optional authentication
func NewServer(config *ServerConfig, cpqService *CPQService, authService AuthService) (*Server, error) {
	if config == nil {
		config = DefaultServerConfig()
	}

	if cpqService == nil {
		return nil, fmt.Errorf("CPQ service is required")
	}

	s := &Server{
		router:      mux.NewRouter(),
		config:      config,
		cpqService:  cpqService,
		authService: authService,
		startTime:   time.Now(),
	}

	// Configure HTTP server
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
			AllowedHeaders:   []string{"Content-Type", "Authorization", "X-Request-ID"},
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

	// Health and system endpoints (always public)
	api.HandleFunc("/health", s.healthHandler).Methods("GET", "OPTIONS")
	api.HandleFunc("/status", s.statusHandler).Methods("GET", "OPTIONS")
	api.HandleFunc("/version", s.versionHandler).Methods("GET", "OPTIONS")

	// Authentication endpoints (public)
	if s.authService != nil {
		s.setupAuthRoutes(api)
	}

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

// setupAuthRoutes configures authentication routes
func (s *Server) setupAuthRoutes(router *mux.Router) {
	// Login endpoint
	router.HandleFunc("/auth/login", s.handleLogin).Methods("POST", "OPTIONS")

	// Token validation endpoint
	router.HandleFunc("/auth/validate", s.handleValidateToken).Methods("POST", "OPTIONS")

	log.Printf("🔐 Authentication routes configured")
}

// Authentication Handlers

// handleLogin handles user login and token generation
func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	timer := StartTimer()

	var loginReq struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&loginReq); err != nil {
		WriteBadRequestResponse(w, "Invalid request body")
		return
	}

	// Validate required fields
	if loginReq.Username == "" || loginReq.Password == "" {
		WriteValidationErrorResponse(w, map[string]string{
			"username": "Username is required",
			"password": "Password is required",
		})
		return
	}

	// Demo authentication
	if s.authenticateUser(loginReq.Username, loginReq.Password) {
		token, err := s.authService.GenerateToken(loginReq.Username)
		if err != nil {
			WriteInternalErrorResponse(w, err)
			return
		}

		// Validate the token to get the role information
		claims, err := s.authService.ValidateToken(token)
		if err != nil {
			WriteInternalErrorResponse(w, err)
			return
		}

		response := map[string]interface{}{
			"success": true,
			"token":   token,
			"user": map[string]interface{}{
				"username": loginReq.Username,
				"role":     claims.Role,
			},
			"expires_at": time.Now().Add(24 * time.Hour).UTC(),
		}

		duration := timer()
		meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
		WriteSuccessResponse(w, response, meta)
	} else {
		WriteErrorResponse(w, "INVALID_CREDENTIALS", "Invalid username or password", "", http.StatusUnauthorized)
	}
}

// handleValidateToken validates a JWT token
func (s *Server) handleValidateToken(w http.ResponseWriter, r *http.Request) {
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	timer := StartTimer()

	var tokenReq struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&tokenReq); err != nil {
		// Try to get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenReq.Token = strings.TrimPrefix(authHeader, "Bearer ")
		} else {
			WriteBadRequestResponse(w, "Token required in request body or Authorization header")
			return
		}
	}

	claims, err := s.authService.ValidateToken(tokenReq.Token)
	if err != nil {
		WriteErrorResponse(w, "INVALID_TOKEN", "Token is invalid or expired", err.Error(), http.StatusUnauthorized)
		return
	}

	response := map[string]interface{}{
		"valid": true,
		"user": map[string]interface{}{
			"username":   claims.Username,
			"role":       claims.Role,
			"issued_at":  claims.IssuedAt,
			"expires_at": claims.ExpiresAt,
		},
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, response, meta)
}

// authenticateUser validates demo credentials
func (s *Server) authenticateUser(username, password string) bool {
	// Demo users - matches backend expectations
	demoUsers := map[string]string{
		"admin": "admin123",
		"user":  "user123",
		"demo":  "demo123",
		"test":  "test123",
	}

	return demoUsers[username] == password
}

// Start starts the HTTP server
func (s *Server) Start() error {
	log.Printf("🚀 CPQ API Server starting on port %s", s.config.Port)
	log.Printf("📊 Server configuration: ReadTimeout=%v, WriteTimeout=%v",
		s.config.ReadTimeout, s.config.WriteTimeout)

	if s.authService != nil {
		log.Printf("🔐 Authentication service available")
	} else {
		log.Printf("🔓 No authentication service - all routes are public")
	}

	// Start server in goroutine
	go func() {
		if err := s.server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	return nil
}

// Stop gracefully stops the HTTP server
func (s *Server) Stop(ctx context.Context) error {
	log.Printf("🛑 Stopping CPQ API Server...")

	if err := s.server.Shutdown(ctx); err != nil {
		return fmt.Errorf("server shutdown failed: %w", err)
	}

	uptime := time.Since(s.startTime)
	log.Printf("✅ Server stopped gracefully after running for %v", uptime)
	return nil
}

// Health and status handlers
func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	health := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"uptime":    time.Since(s.startTime).String(),
		"version":   "v1.0.0",
		"services": map[string]interface{}{
			"cpq":   "operational",
			"mtbdd": "operational",
		},
	}

	if s.authService != nil {
		health["services"].(map[string]interface{})["auth"] = "operational"
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, health, meta)
}

func (s *Server) statusHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	status := map[string]interface{}{
		"server": map[string]interface{}{
			"uptime": time.Since(s.startTime).String(),
			"port":   s.config.Port,
			"cors":   s.config.EnableCORS,
		},
		"cpq": map[string]interface{}{
			"models_loaded": len(s.cpqService.ListModels()),
			"status":        "operational",
		},
		"timestamp": time.Now().UTC(),
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, status, meta)
}

func (s *Server) versionHandler(w http.ResponseWriter, r *http.Request) {
	timer := StartTimer()

	version := map[string]interface{}{
		"version":     "v1.0.0",
		"build_date":  "2025-06-14",
		"commit":      "latest",
		"go_version":  "1.21+",
		"api_version": "v1",
	}

	duration := timer()
	meta := CreateMetadata(r.Header.Get("X-Request-ID"), duration)
	WriteSuccessResponse(w, version, meta)
}

// Middleware implementations

// loggingMiddleware logs HTTP requests
func (s *Server) loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response recorder to capture status code
		wrapped := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)
		log.Printf("📡 %s %s %d %v %s",
			r.Method,
			r.URL.Path,
			wrapped.statusCode,
			duration,
			r.Header.Get("X-Request-ID"),
		)
	})
}

// requestSizeLimitMiddleware limits request body size
func (s *Server) requestSizeLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, s.config.MaxRequestSize)
		next.ServeHTTP(w, r)
	})
}

// recoveryMiddleware recovers from panics
func (s *Server) recoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("❌ Panic recovered: %v", err)
				WriteErrorResponse(w, "INTERNAL_ERROR", "Internal server error", fmt.Sprintf("%v", err), http.StatusInternalServerError)
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// timingMiddleware adds response time headers
func (s *Server) timingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		duration := time.Since(start)
		w.Header().Set("X-Response-Time", duration.String())
	})
}

// responseRecorder captures response status code for logging
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rr *responseRecorder) WriteHeader(code int) {
	rr.statusCode = code
	rr.ResponseWriter.WriteHeader(code)
}

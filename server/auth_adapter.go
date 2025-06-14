// server/auth_adapter.go - Auth Service Adapter
// Bridges the DD/auth service with the server's AuthService interface

package server

import (
	"DD/auth"
	"context"
	"fmt"
	"net/http"
	"strings"
)

// AuthServiceAdapter adapts DD/auth.Service to server.AuthService interface
type AuthServiceAdapter struct {
	service *auth.Service
}

// NewAuthServiceAdapter creates a new auth service adapter
func NewAuthServiceAdapter(authService *auth.Service) *AuthServiceAdapter {
	return &AuthServiceAdapter{
		service: authService,
	}
}

// GenerateToken generates a JWT token for a username
func (a *AuthServiceAdapter) GenerateToken(username string) (string, error) {
	// Convert username to user info for the auth service
	// In production, you'd look up the user from a database
	userID := fmt.Sprintf("user_%s", username)
	email := fmt.Sprintf("%s@cpq.local", username)

	// Map roles for demo users
	role := getRoleForUser(username)

	token, _, err := a.service.GenerateToken(userID, email, role)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}

// ValidateToken validates a JWT token and returns claims
func (a *AuthServiceAdapter) ValidateToken(token string) (*TokenClaims, error) {
	claims, err := a.service.ValidateToken(token)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token: %w", err)
	}

	// Convert auth.Claims to server.TokenClaims
	return &TokenClaims{
		Username:  extractUsernameFromEmail(claims.Email),
		Role:      claims.Role, // Include role information
		IssuedAt:  claims.IssuedAt.Time,
		ExpiresAt: claims.ExpiresAt.Time,
	}, nil
}

// AuthMiddleware provides authentication middleware
func (a *AuthServiceAdapter) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip auth for OPTIONS requests
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			WriteErrorResponse(w, "MISSING_TOKEN", "Authorization header required", "", http.StatusUnauthorized)
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			WriteErrorResponse(w, "INVALID_AUTH_HEADER", "Authorization header must use Bearer token", "", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		claims, err := a.ValidateToken(token)
		if err != nil {
			WriteErrorResponse(w, "INVALID_TOKEN", "Token is invalid or expired", err.Error(), http.StatusUnauthorized)
			return
		}

		// Add user info to request context
		ctx := context.WithValue(r.Context(), "username", claims.Username)
		ctx = context.WithValue(ctx, "user_claims", claims)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper function to get role for demo users
func getRoleForUser(username string) string {
	// Demo user role mapping
	roleMap := map[string]string{
		"admin": "admin",
		"user":  "user",
		"demo":  "demo",
		"test":  "tester",
	}

	if role, exists := roleMap[username]; exists {
		return role
	}

	// Default role
	return "user"
}

// Helper function to extract username from email
func extractUsernameFromEmail(email string) string {
	// Extract username from email (e.g., "admin@cpq.local" -> "admin")
	if strings.Contains(email, "@") {
		return strings.Split(email, "@")[0]
	}
	return email
}

package transport

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"strings"
	"time"
)

type contextKey string

const (
	ContextKeyUserID    contextKey = "user_id"
	ContextKeyRequestID contextKey = "request_id"
)

// AuthMiddleware handles JWT authentication for protected routes.
type AuthMiddleware struct {
	validateToken func(token string) (string, error)
}

// NewAuthMiddleware creates a new auth middleware with token validation.
func NewAuthMiddleware(validateToken func(token string) (string, error)) *AuthMiddleware {
	return &AuthMiddleware{validateToken: validateToken}
}

// Authenticate wraps a handler with JWT authentication.
func (am *AuthMiddleware) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			writeError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			writeError(w, http.StatusUnauthorized, "invalid authorization format")
			return
		}

		userID, err := am.validateToken(parts[1])
		if err != nil {
			writeError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		ctx := context.WithValue(r.Context(), ContextKeyUserID, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// CORSMiddleware adds Cross-Origin Resource Sharing headers.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// RequestIDMiddleware generates and injects a unique request ID.
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			b := make([]byte, 8)
			_, _ = rand.Read(b)
			requestID = hex.EncodeToString(b)
		}

		w.Header().Set("X-Request-ID", requestID)
		ctx := context.WithValue(r.Context(), ContextKeyRequestID, requestID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequestLogger logs incoming requests with timing.
func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap ResponseWriter to capture status code
		ww := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(ww, r)

		duration := time.Since(start)
		requestID, _ := r.Context().Value(ContextKeyRequestID).(string)

		log.Printf("[HTTP] %s %s %d %s [%s]",
			r.Method, r.URL.Path, ww.statusCode, duration, requestID)
	})
}

// RecoveryMiddleware catches panics and returns a 500 error.
func RecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[HTTP] PANIC recovered: %v", err)
				writeError(w, http.StatusInternalServerError, "internal server error")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

// responseWriter wraps http.ResponseWriter to capture the status code.
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// GetUserIDFromContext extracts the authenticated user ID from the request context.
func GetUserIDFromContext(r *http.Request) string {
	userID, _ := r.Context().Value(ContextKeyUserID).(string)
	return userID
}

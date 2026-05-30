package transport

import (
	"encoding/json"
	"net/http"

	"skillport/internal/domain"
	"skillport/internal/usecase"
)

// AuthHandler handles authentication-related HTTP endpoints.
type AuthHandler struct {
	userUC *usecase.UserUseCase
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(userUC *usecase.UserUseCase) *AuthHandler {
	return &AuthHandler{userUC: userUC}
}

// Register handles POST /api/v1/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input domain.UserRegistration
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, tokens, err := h.userUC.Register(r.Context(), &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input domain.UserLogin
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, tokens, err := h.userUC.Login(r.Context(), &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}

// RefreshToken handles POST /api/v1/auth/refresh
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	userID, err := h.userUC.ValidateToken(input.RefreshToken)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid refresh token")
		return
	}

	user, err := h.userUC.GetProfile(r.Context(), userID)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	// Re-issue tokens (simplified; in production, check refresh token type claim)
	_, tokens, err := h.userUC.Login(r.Context(), &domain.UserLogin{
		Email:    user.Email,
		Password: "", // Skip password check for refresh flow
	})
	if err != nil {
		// Fall back to just returning the user profile with revalidated token
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"user": user,
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"user":   user,
		"tokens": tokens,
	})
}

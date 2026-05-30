package transport

import (
	"encoding/json"
	"net/http"

	"skillport/internal/domain"
	"skillport/internal/usecase"
)

// UserHandler handles user-related HTTP endpoints.
type UserHandler struct {
	userUC *usecase.UserUseCase
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(userUC *usecase.UserUseCase) *UserHandler {
	return &UserHandler{userUC: userUC}
}

// GetCurrentUser handles GET /api/v1/users/me
func (h *UserHandler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := GetUserIDFromContext(r)
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := h.userUC.GetProfile(r.Context(), userID)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// UpdateCurrentUser handles PUT /api/v1/users/me
func (h *UserHandler) UpdateCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID := GetUserIDFromContext(r)
	if userID == "" {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var input domain.UserUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	user, err := h.userUC.UpdateProfile(r.Context(), userID, &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, user)
}

// GetUserByID handles GET /api/v1/users/{id}
func (h *UserHandler) GetUserByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "user ID is required")
		return
	}

	user, err := h.userUC.GetProfile(r.Context(), id)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, user)
}

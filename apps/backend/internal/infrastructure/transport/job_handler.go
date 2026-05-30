package transport

import (
	"encoding/json"
	"errors"
	"net/http"

	"skillport/internal/domain"
	"skillport/internal/usecase"
)

// JobHandler handles job-related HTTP endpoints.
type JobHandler struct {
	jobUC *usecase.JobUseCase
}

// NewJobHandler creates a new JobHandler.
func NewJobHandler(jobUC *usecase.JobUseCase) *JobHandler {
	return &JobHandler{jobUC: jobUC}
}

// Create handles POST /api/v1/jobs
func (h *JobHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := GetUserIDFromContext(r)

	var input domain.JobCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	job, err := h.jobUC.Create(r.Context(), userID, &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, job)
}

// GetByID handles GET /api/v1/jobs/{id}
func (h *JobHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	job, err := h.jobUC.GetByID(r.Context(), id)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, job)
}

// Update handles PUT /api/v1/jobs/{id}
func (h *JobHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	userID := GetUserIDFromContext(r)

	var input domain.JobUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	job, err := h.jobUC.Update(r.Context(), id, userID, &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, job)
}

// Delete handles DELETE /api/v1/jobs/{id}
func (h *JobHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	userID := GetUserIDFromContext(r)

	if err := h.jobUC.Delete(r.Context(), id, userID); err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "job deleted"})
}

// List handles GET /api/v1/jobs
func (h *JobHandler) List(w http.ResponseWriter, r *http.Request) {
	filter := &domain.JobFilter{
		Profession: domain.ProfessionType(r.URL.Query().Get("profession")),
		Location:   r.URL.Query().Get("location"),
		Query:      r.URL.Query().Get("q"),
		Page:       parseIntParam(r, "page", 1),
		PageSize:   parseIntParam(r, "page_size", 20),
	}

	if skills := r.URL.Query().Get("skills"); skills != "" {
		filter.Skills = splitAndTrim(skills)
	}
	if remote := r.URL.Query().Get("remote"); remote == "true" {
		v := true
		filter.Remote = &v
	}

	jobs, total, err := h.jobUC.List(r.Context(), filter)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	totalPages := int(total) / filter.PageSize
	if int(total)%filter.PageSize > 0 {
		totalPages++
	}

	writeJSON(w, http.StatusOK, domain.SearchResult{
		Items:      jobs,
		Total:      total,
		Page:       filter.Page,
		PageSize:   filter.PageSize,
		TotalPages: totalPages,
	})
}

// --- Shared response helpers ---

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, domain.APIError{
		Code:    status,
		Message: message,
	})
}

func handleDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrNotFound):
		writeError(w, http.StatusNotFound, "resource not found")
	case errors.Is(err, domain.ErrDuplicate):
		writeError(w, http.StatusConflict, "resource already exists")
	case errors.Is(err, domain.ErrValidation):
		writeError(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, domain.ErrUnauthorized):
		writeError(w, http.StatusUnauthorized, "unauthorized")
	case errors.Is(err, domain.ErrForbidden):
		writeError(w, http.StatusForbidden, "forbidden")
	default:
		var validationErrs *domain.ValidationErrors
		if errors.As(err, &validationErrs) {
			writeJSON(w, http.StatusBadRequest, domain.APIError{
				Code:    http.StatusBadRequest,
				Message: "validation failed",
				Details: validationErrs.Errors,
			})
			return
		}
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
}

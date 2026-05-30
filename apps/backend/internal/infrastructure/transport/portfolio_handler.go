package transport

import (
	"encoding/json"
	"net/http"
	"strconv"

	"skillport/internal/domain"
	"skillport/internal/usecase"
)

// PortfolioHandler handles portfolio-related HTTP endpoints.
type PortfolioHandler struct {
	portfolioUC *usecase.PortfolioUseCase
}

// NewPortfolioHandler creates a new PortfolioHandler.
func NewPortfolioHandler(portfolioUC *usecase.PortfolioUseCase) *PortfolioHandler {
	return &PortfolioHandler{portfolioUC: portfolioUC}
}

// Create handles POST /api/v1/portfolios
func (h *PortfolioHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := GetUserIDFromContext(r)

	var input domain.PortfolioCreate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	portfolio, err := h.portfolioUC.Create(r.Context(), userID, &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusCreated, portfolio)
}

// GetByID handles GET /api/v1/portfolios/{id}
func (h *PortfolioHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		writeError(w, http.StatusBadRequest, "portfolio ID is required")
		return
	}

	portfolio, err := h.portfolioUC.GetByID(r.Context(), id)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	// Record view (non-blocking)
	viewerID := GetUserIDFromContext(r)
	go func() {
		_ = h.portfolioUC.RecordView(r.Context(), id, viewerID, "direct")
	}()

	writeJSON(w, http.StatusOK, portfolio)
}

// GetBySlug handles GET /api/v1/portfolios/slug/{slug}
func (h *PortfolioHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	if slug == "" {
		writeError(w, http.StatusBadRequest, "portfolio slug is required")
		return
	}

	portfolio, err := h.portfolioUC.GetBySlug(r.Context(), slug)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	viewerID := GetUserIDFromContext(r)
	go func() {
		_ = h.portfolioUC.RecordView(r.Context(), portfolio.ID, viewerID, "direct")
	}()

	writeJSON(w, http.StatusOK, portfolio)
}

// GetByUserID handles GET /api/v1/users/{id}/portfolios
func (h *PortfolioHandler) GetByUserID(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		writeError(w, http.StatusBadRequest, "user ID is required")
		return
	}

	portfolios, err := h.portfolioUC.GetByUserID(r.Context(), userID)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, portfolios)
}

// Update handles PUT /api/v1/portfolios/{id}
func (h *PortfolioHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	userID := GetUserIDFromContext(r)

	var input domain.PortfolioUpdate
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	portfolio, err := h.portfolioUC.Update(r.Context(), id, userID, &input)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, portfolio)
}

// Delete handles DELETE /api/v1/portfolios/{id}
func (h *PortfolioHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	userID := GetUserIDFromContext(r)

	if err := h.portfolioUC.Delete(r.Context(), id, userID); err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"message": "portfolio deleted"})
}

// List handles GET /api/v1/portfolios
func (h *PortfolioHandler) List(w http.ResponseWriter, r *http.Request) {
	filter := &domain.PortfolioFilter{
		Profession: domain.ProfessionType(r.URL.Query().Get("profession")),
		Query:      r.URL.Query().Get("q"),
		Page:       parseIntParam(r, "page", 1),
		PageSize:   parseIntParam(r, "page_size", 20),
	}

	if skills := r.URL.Query().Get("skills"); skills != "" {
		filter.Skills = splitAndTrim(skills)
	}
	if tags := r.URL.Query().Get("tags"); tags != "" {
		filter.Tags = splitAndTrim(tags)
	}

	portfolios, total, err := h.portfolioUC.List(r.Context(), filter)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	totalPages := int(total) / filter.PageSize
	if int(total)%filter.PageSize > 0 {
		totalPages++
	}

	writeJSON(w, http.StatusOK, domain.SearchResult{
		Items:      portfolios,
		Total:      total,
		Page:       filter.Page,
		PageSize:   filter.PageSize,
		TotalPages: totalPages,
	})
}

// parseIntParam parses an integer query parameter with a default.
func parseIntParam(r *http.Request, name string, defaultVal int) int {
	v := r.URL.Query().Get(name)
	if v == "" {
		return defaultVal
	}
	n, err := strconv.Atoi(v)
	if err != nil || n < 1 {
		return defaultVal
	}
	return n
}

// splitAndTrim splits a comma-separated string into trimmed values.
func splitAndTrim(s string) []string {
	parts := []string{}
	for _, p := range stringSplit(s, ",") {
		trimmed := stringTrim(p)
		if trimmed != "" {
			parts = append(parts, trimmed)
		}
	}
	return parts
}

func stringSplit(s, sep string) []string {
	result := []string{}
	for len(s) > 0 {
		i := indexOf(s, sep)
		if i == -1 {
			result = append(result, s)
			break
		}
		result = append(result, s[:i])
		s = s[i+len(sep):]
	}
	return result
}

func stringTrim(s string) string {
	start, end := 0, len(s)
	for start < end && s[start] == ' ' {
		start++
	}
	for end > start && s[end-1] == ' ' {
		end--
	}
	return s[start:end]
}

func indexOf(s, sub string) int {
	for i := 0; i <= len(s)-len(sub); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}

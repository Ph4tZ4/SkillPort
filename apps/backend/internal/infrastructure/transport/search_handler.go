package transport

import (
	"net/http"

	"skillport/internal/usecase"
)

// SearchHandler handles search and matching HTTP endpoints.
type SearchHandler struct {
	searchUC *usecase.SearchUseCase
	matchUC  *usecase.MatchUseCase
}

// NewSearchHandler creates a new SearchHandler.
func NewSearchHandler(searchUC *usecase.SearchUseCase, matchUC *usecase.MatchUseCase) *SearchHandler {
	return &SearchHandler{
		searchUC: searchUC,
		matchUC:  matchUC,
	}
}

// SearchPortfolios handles GET /api/v1/search/portfolios
func (h *SearchHandler) SearchPortfolios(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	page := parseIntParam(r, "page", 1)
	pageSize := parseIntParam(r, "page_size", 20)

	filters := make(map[string]interface{})
	if profession := r.URL.Query().Get("profession"); profession != "" {
		filters["profession"] = profession
	}
	if isPublic := r.URL.Query().Get("is_public"); isPublic != "" {
		filters["is_public"] = isPublic == "true"
	}

	result, err := h.searchUC.SearchPortfolios(r.Context(), query, filters, page, pageSize)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// SearchJobs handles GET /api/v1/search/jobs
func (h *SearchHandler) SearchJobs(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	page := parseIntParam(r, "page", 1)
	pageSize := parseIntParam(r, "page_size", 20)

	filters := make(map[string]interface{})
	if profession := r.URL.Query().Get("profession"); profession != "" {
		filters["profession"] = profession
	}
	if remote := r.URL.Query().Get("remote"); remote != "" {
		filters["remote"] = remote == "true"
	}

	result, err := h.searchUC.SearchJobs(r.Context(), query, filters, page, pageSize)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// MatchForJob handles GET /api/v1/match/job/{id}
func (h *SearchHandler) MatchForJob(w http.ResponseWriter, r *http.Request) {
	jobID := r.PathValue("id")
	if jobID == "" {
		writeError(w, http.StatusBadRequest, "job ID is required")
		return
	}

	topK := parseIntParam(r, "top_k", 10)

	matches, err := h.matchUC.FindMatchesForJob(r.Context(), jobID, topK)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"job_id":  jobID,
		"matches": matches,
		"count":   len(matches),
	})
}

// MatchForPortfolio handles GET /api/v1/match/portfolio/{id}
func (h *SearchHandler) MatchForPortfolio(w http.ResponseWriter, r *http.Request) {
	portfolioID := r.PathValue("id")
	if portfolioID == "" {
		writeError(w, http.StatusBadRequest, "portfolio ID is required")
		return
	}

	topK := parseIntParam(r, "top_k", 10)

	matches, err := h.matchUC.FindMatchesForPortfolio(r.Context(), portfolioID, topK)
	if err != nil {
		handleDomainError(w, err)
		return
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"portfolio_id": portfolioID,
		"matches":      matches,
		"count":        len(matches),
	})
}

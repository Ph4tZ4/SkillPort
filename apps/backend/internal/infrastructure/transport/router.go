package transport

import (
	"log"
	"net/http"

	"skillport/internal/usecase"
)

// Router sets up all HTTP routes and middleware.
type Router struct {
	mux            *http.ServeMux
	userUseCase    *usecase.UserUseCase
	portfolioUC    *usecase.PortfolioUseCase
	jobUC          *usecase.JobUseCase
	searchUC       *usecase.SearchUseCase
	matchUC        *usecase.MatchUseCase
	authMiddleware *AuthMiddleware
}

// NewRouter creates and configures the HTTP router.
func NewRouter(
	userUC *usecase.UserUseCase,
	portfolioUC *usecase.PortfolioUseCase,
	jobUC *usecase.JobUseCase,
	searchUC *usecase.SearchUseCase,
	matchUC *usecase.MatchUseCase,
	authMW *AuthMiddleware,
) *Router {
	r := &Router{
		mux:            http.NewServeMux(),
		userUseCase:    userUC,
		portfolioUC:    portfolioUC,
		jobUC:          jobUC,
		searchUC:       searchUC,
		matchUC:        matchUC,
		authMiddleware: authMW,
	}

	r.registerRoutes()
	return r
}

// registerRoutes sets up all API endpoints.
func (r *Router) registerRoutes() {
	// Health check
	r.mux.HandleFunc("GET /api/v1/health", r.healthCheck)

	// Auth routes (public)
	authHandler := NewAuthHandler(r.userUseCase)
	r.mux.HandleFunc("POST /api/v1/auth/register", authHandler.Register)
	r.mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	r.mux.HandleFunc("POST /api/v1/auth/refresh", authHandler.RefreshToken)

	// User routes
	userHandler := NewUserHandler(r.userUseCase)
	r.mux.HandleFunc("GET /api/v1/users/me", r.authMiddleware.Authenticate(userHandler.GetCurrentUser))
	r.mux.HandleFunc("PUT /api/v1/users/me", r.authMiddleware.Authenticate(userHandler.UpdateCurrentUser))
	r.mux.HandleFunc("GET /api/v1/users/{id}", userHandler.GetUserByID)

	// Portfolio routes
	portfolioHandler := NewPortfolioHandler(r.portfolioUC)
	r.mux.HandleFunc("POST /api/v1/portfolios", r.authMiddleware.Authenticate(portfolioHandler.Create))
	r.mux.HandleFunc("GET /api/v1/portfolios", portfolioHandler.List)
	r.mux.HandleFunc("GET /api/v1/portfolios/{id}", portfolioHandler.GetByID)
	r.mux.HandleFunc("GET /api/v1/portfolios/slug/{slug}", portfolioHandler.GetBySlug)
	r.mux.HandleFunc("PUT /api/v1/portfolios/{id}", r.authMiddleware.Authenticate(portfolioHandler.Update))
	r.mux.HandleFunc("DELETE /api/v1/portfolios/{id}", r.authMiddleware.Authenticate(portfolioHandler.Delete))
	r.mux.HandleFunc("GET /api/v1/users/{id}/portfolios", portfolioHandler.GetByUserID)

	// Job routes
	jobHandler := NewJobHandler(r.jobUC)
	r.mux.HandleFunc("POST /api/v1/jobs", r.authMiddleware.Authenticate(jobHandler.Create))
	r.mux.HandleFunc("GET /api/v1/jobs", jobHandler.List)
	r.mux.HandleFunc("GET /api/v1/jobs/{id}", jobHandler.GetByID)
	r.mux.HandleFunc("PUT /api/v1/jobs/{id}", r.authMiddleware.Authenticate(jobHandler.Update))
	r.mux.HandleFunc("DELETE /api/v1/jobs/{id}", r.authMiddleware.Authenticate(jobHandler.Delete))

	// Search routes
	searchHandler := NewSearchHandler(r.searchUC, r.matchUC)
	r.mux.HandleFunc("GET /api/v1/search/portfolios", searchHandler.SearchPortfolios)
	r.mux.HandleFunc("GET /api/v1/search/jobs", searchHandler.SearchJobs)
	r.mux.HandleFunc("GET /api/v1/match/job/{id}", searchHandler.MatchForJob)
	r.mux.HandleFunc("GET /api/v1/match/portfolio/{id}", searchHandler.MatchForPortfolio)
}

// Handler returns the full middleware chain wrapping the router.
func (r *Router) Handler() http.Handler {
	var handler http.Handler = r.mux

	// Apply middleware (outermost first)
	handler = RequestLogger(handler)
	handler = CORSMiddleware(handler)
	handler = RequestIDMiddleware(handler)
	handler = RecoveryMiddleware(handler)

	return handler
}

// healthCheck returns a simple health status.
func (r *Router) healthCheck(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok","service":"skillport-gateway"}`))
}

// StartServer starts the HTTP server.
func StartServer(addr string, handler http.Handler) error {
	log.Printf("[HTTP] Server starting on %s", addr)
	return http.ListenAndServe(addr, handler)
}

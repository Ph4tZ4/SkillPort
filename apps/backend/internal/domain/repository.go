package domain

import "context"

// UserRepository defines the contract for user persistence operations.
type UserRepository interface {
	// Create stores a new user. Returns ErrDuplicate if email already exists.
	Create(ctx context.Context, user *User) error

	// GetByID retrieves a user by their unique identifier.
	GetByID(ctx context.Context, id string) (*User, error)

	// GetByEmail retrieves a user by their email address.
	GetByEmail(ctx context.Context, email string) (*User, error)

	// Update modifies an existing user's fields.
	Update(ctx context.Context, id string, update *UserUpdate) (*User, error)

	// Delete removes a user by ID.
	Delete(ctx context.Context, id string) error
}

// PortfolioRepository defines the contract for portfolio persistence operations.
type PortfolioRepository interface {
	// Create stores a new portfolio.
	Create(ctx context.Context, portfolio *Portfolio) error

	// GetByID retrieves a portfolio by its unique identifier.
	GetByID(ctx context.Context, id string) (*Portfolio, error)

	// GetBySlug retrieves a portfolio by its URL slug.
	GetBySlug(ctx context.Context, slug string) (*Portfolio, error)

	// GetByUserID retrieves all portfolios belonging to a user.
	GetByUserID(ctx context.Context, userID string) ([]*Portfolio, error)

	// Update modifies an existing portfolio.
	Update(ctx context.Context, id string, update *PortfolioUpdate) (*Portfolio, error)

	// Delete removes a portfolio by ID.
	Delete(ctx context.Context, id string) error

	// List retrieves portfolios matching the given filter.
	List(ctx context.Context, filter *PortfolioFilter) ([]*Portfolio, int64, error)

	// IncrementViewCount atomically increments the view counter.
	IncrementViewCount(ctx context.Context, id string) error
}

// JobRepository defines the contract for job posting persistence operations.
type JobRepository interface {
	// Create stores a new job posting.
	Create(ctx context.Context, job *Job) error

	// GetByID retrieves a job by its unique identifier.
	GetByID(ctx context.Context, id string) (*Job, error)

	// Update modifies an existing job posting.
	Update(ctx context.Context, id string, update *JobUpdate) (*Job, error)

	// Delete removes a job posting by ID.
	Delete(ctx context.Context, id string) error

	// List retrieves jobs matching the given filter.
	List(ctx context.Context, filter *JobFilter) ([]*Job, int64, error)
}

// SearchRepository defines the contract for full-text search operations.
type SearchRepository interface {
	// IndexPortfolio adds or updates a portfolio in the search index.
	IndexPortfolio(ctx context.Context, portfolio *Portfolio) error

	// IndexJob adds or updates a job in the search index.
	IndexJob(ctx context.Context, job *Job) error

	// SearchPortfolios performs a full-text search across portfolios.
	SearchPortfolios(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) ([]*Portfolio, int64, error)

	// SearchJobs performs a full-text search across job postings.
	SearchJobs(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) ([]*Job, int64, error)

	// DeletePortfolio removes a portfolio from the search index.
	DeletePortfolio(ctx context.Context, id string) error

	// DeleteJob removes a job from the search index.
	DeleteJob(ctx context.Context, id string) error
}

// VectorRepository defines the contract for vector similarity search operations.
type VectorRepository interface {
	// UpsertPortfolioEmbedding stores or updates the embedding vector for a portfolio.
	UpsertPortfolioEmbedding(ctx context.Context, portfolioID string, embedding []float32) error

	// UpsertJobEmbedding stores or updates the embedding vector for a job.
	UpsertJobEmbedding(ctx context.Context, jobID string, embedding []float32) error

	// SearchSimilarPortfolios finds portfolios with similar embeddings.
	SearchSimilarPortfolios(ctx context.Context, embedding []float32, topK int) ([]VectorMatch, error)

	// SearchSimilarJobs finds jobs with similar embeddings.
	SearchSimilarJobs(ctx context.Context, embedding []float32, topK int) ([]VectorMatch, error)

	// DeletePortfolioEmbedding removes a portfolio embedding.
	DeletePortfolioEmbedding(ctx context.Context, portfolioID string) error

	// DeleteJobEmbedding removes a job embedding.
	DeleteJobEmbedding(ctx context.Context, jobID string) error
}

// VectorMatch represents a similarity search result from the vector database.
type VectorMatch struct {
	ID         string  `json:"id"`
	Score      float32 `json:"score"`      // Similarity score (higher is more similar)
	Distance   float32 `json:"distance"`   // Distance metric (lower is more similar)
}

// AnalyticsRepository defines the contract for analytics data operations.
type AnalyticsRepository interface {
	// RecordView records a portfolio view event for analytics.
	RecordView(ctx context.Context, event *ViewEvent) error

	// GetPortfolioStats retrieves aggregated statistics for a portfolio.
	GetPortfolioStats(ctx context.Context, portfolioID string) (*PortfolioStats, error)

	// GetUserStats retrieves aggregated statistics for a user.
	GetUserStats(ctx context.Context, userID string) (*UserStats, error)
}

// ViewEvent represents a portfolio view event for analytics.
type ViewEvent struct {
	PortfolioID string `json:"portfolio_id"`
	ViewerID    string `json:"viewer_id"` // empty string for anonymous views
	Source      string `json:"source"`    // direct, search, match
	Timestamp   int64  `json:"timestamp"`
}

// PortfolioStats holds aggregated analytics for a single portfolio.
type PortfolioStats struct {
	PortfolioID  string         `json:"portfolio_id"`
	TotalViews   int64          `json:"total_views"`
	UniqueViews  int64          `json:"unique_views"`
	ViewsByDay   map[string]int `json:"views_by_day"`
	TopSources   map[string]int `json:"top_sources"`
}

// UserStats holds aggregated analytics for a user across all portfolios.
type UserStats struct {
	UserID       string `json:"user_id"`
	TotalViews   int64  `json:"total_views"`
	TotalMatches int64  `json:"total_matches"`
	ProfileScore int    `json:"profile_score"` // Completeness score (0-100)
}

// CacheRepository defines the contract for caching operations.
type CacheRepository interface {
	// Set stores a value with an expiration time (seconds).
	Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error

	// Get retrieves a cached value. Returns ErrNotFound if not cached.
	Get(ctx context.Context, key string, dest interface{}) error

	// Delete removes a cached value.
	Delete(ctx context.Context, key string) error

	// Increment atomically increments a counter and returns the new value.
	Increment(ctx context.Context, key string, ttlSeconds int) (int64, error)
}

// EventPublisher defines the contract for publishing domain events.
type EventPublisher interface {
	// Publish sends a domain event to the event backbone.
	Publish(ctx context.Context, event *Event) error

	// Close gracefully shuts down the publisher.
	Close() error
}

// NotificationPublisher defines the contract for sending notification tasks.
type NotificationPublisher interface {
	// PublishNotification sends a notification task to the task queue.
	PublishNotification(ctx context.Context, notification *Notification) error

	// Close gracefully shuts down the publisher.
	Close() error
}

// Notification represents a notification task sent via the task queue.
type Notification struct {
	ID        string                 `json:"id"`
	UserID    string                 `json:"user_id"`
	Type      string                 `json:"type"` // match_found, profile_viewed, job_posted
	Title     string                 `json:"title"`
	Message   string                 `json:"message"`
	Data      map[string]interface{} `json:"data"`
	CreatedAt int64                  `json:"created_at"`
}

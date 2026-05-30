package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillport/internal/domain"
)

// PortfolioUseCase implements application-specific business rules for portfolios.
type PortfolioUseCase struct {
	portfolioRepo domain.PortfolioRepository
	cache         domain.CacheRepository
	publisher     domain.EventPublisher
	notifier      domain.NotificationPublisher
}

// NewPortfolioUseCase creates a new PortfolioUseCase with injected dependencies.
func NewPortfolioUseCase(
	portfolioRepo domain.PortfolioRepository,
	cache domain.CacheRepository,
	publisher domain.EventPublisher,
	notifier domain.NotificationPublisher,
) *PortfolioUseCase {
	return &PortfolioUseCase{
		portfolioRepo: portfolioRepo,
		cache:         cache,
		publisher:     publisher,
		notifier:      notifier,
	}
}

// Create stores a new portfolio and publishes a creation event.
func (uc *PortfolioUseCase) Create(ctx context.Context, userID string, input *domain.PortfolioCreate) (*domain.Portfolio, error) {
	if err := validatePortfolioCreate(input); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	portfolio := &domain.Portfolio{
		ID:         generateID(),
		UserID:     userID,
		Title:      strings.TrimSpace(input.Title),
		Slug:       generateSlug(input.Title),
		Profession: input.Profession,
		Summary:    strings.TrimSpace(input.Summary),
		Skills:     input.Skills,
		Sections:   input.Sections,
		Tags:       input.Tags,
		IsPublic:   input.IsPublic,
		ViewCount:  0,
		Metadata:   make(map[string]string),
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	if err := uc.portfolioRepo.Create(ctx, portfolio); err != nil {
		return nil, fmt.Errorf("creating portfolio: %w", err)
	}

	// Publish event to Kafka for OpenSearch + Milvus sync
	skillNames := extractSkillNames(portfolio.Skills)
	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventPortfolioCreated,
		Source:    "portfolio-service",
		Timestamp: now,
		Data: domain.PortfolioEventData{
			PortfolioID: portfolio.ID,
			UserID:      userID,
			Title:       portfolio.Title,
			Profession:  portfolio.Profession,
			Skills:      skillNames,
			Summary:     portfolio.Summary,
		},
	})

	return portfolio, nil
}

// GetByID retrieves a portfolio with caching.
func (uc *PortfolioUseCase) GetByID(ctx context.Context, id string) (*domain.Portfolio, error) {
	cacheKey := "portfolio:" + id
	var cached domain.Portfolio
	if err := uc.cache.Get(ctx, cacheKey, &cached); err == nil {
		return &cached, nil
	}

	portfolio, err := uc.portfolioRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("getting portfolio: %w", err)
	}

	_ = uc.cache.Set(ctx, cacheKey, portfolio, 300)
	return portfolio, nil
}

// GetBySlug retrieves a portfolio by its URL slug.
func (uc *PortfolioUseCase) GetBySlug(ctx context.Context, slug string) (*domain.Portfolio, error) {
	return uc.portfolioRepo.GetBySlug(ctx, slug)
}

// GetByUserID retrieves all portfolios for a user.
func (uc *PortfolioUseCase) GetByUserID(ctx context.Context, userID string) ([]*domain.Portfolio, error) {
	return uc.portfolioRepo.GetByUserID(ctx, userID)
}

// Update modifies a portfolio and publishes an update event.
func (uc *PortfolioUseCase) Update(ctx context.Context, portfolioID, userID string, input *domain.PortfolioUpdate) (*domain.Portfolio, error) {
	// Verify ownership
	existing, err := uc.portfolioRepo.GetByID(ctx, portfolioID)
	if err != nil {
		return nil, fmt.Errorf("getting portfolio for update: %w", err)
	}
	if existing.UserID != userID {
		return nil, domain.ErrForbidden
	}

	portfolio, err := uc.portfolioRepo.Update(ctx, portfolioID, input)
	if err != nil {
		return nil, fmt.Errorf("updating portfolio: %w", err)
	}

	// Invalidate cache
	_ = uc.cache.Delete(ctx, "portfolio:"+portfolioID)

	// Publish update event
	skillNames := extractSkillNames(portfolio.Skills)
	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventPortfolioUpdated,
		Source:    "portfolio-service",
		Timestamp: time.Now().UTC(),
		Data: domain.PortfolioEventData{
			PortfolioID: portfolio.ID,
			UserID:      userID,
			Title:       portfolio.Title,
			Profession:  portfolio.Profession,
			Skills:      skillNames,
			Summary:     portfolio.Summary,
		},
	})

	return portfolio, nil
}

// Delete removes a portfolio and publishes a deletion event.
func (uc *PortfolioUseCase) Delete(ctx context.Context, portfolioID, userID string) error {
	existing, err := uc.portfolioRepo.GetByID(ctx, portfolioID)
	if err != nil {
		return fmt.Errorf("getting portfolio for delete: %w", err)
	}
	if existing.UserID != userID {
		return domain.ErrForbidden
	}

	if err := uc.portfolioRepo.Delete(ctx, portfolioID); err != nil {
		return fmt.Errorf("deleting portfolio: %w", err)
	}

	_ = uc.cache.Delete(ctx, "portfolio:"+portfolioID)

	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventPortfolioDeleted,
		Source:    "portfolio-service",
		Timestamp: time.Now().UTC(),
		Data:      domain.PortfolioEventData{PortfolioID: portfolioID, UserID: userID},
	})

	return nil
}

// RecordView increments view count and publishes a view event.
func (uc *PortfolioUseCase) RecordView(ctx context.Context, portfolioID, viewerID, source string) error {
	if err := uc.portfolioRepo.IncrementViewCount(ctx, portfolioID); err != nil {
		return fmt.Errorf("incrementing view count: %w", err)
	}

	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventProfileViewed,
		Source:    "portfolio-service",
		Timestamp: time.Now().UTC(),
		Data: domain.ViewEventData{
			PortfolioID: portfolioID,
			ViewerID:    viewerID,
			Source:      source,
		},
	})

	return nil
}

// List retrieves portfolios matching the given filter.
func (uc *PortfolioUseCase) List(ctx context.Context, filter *domain.PortfolioFilter) ([]*domain.Portfolio, int64, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 || filter.PageSize > 50 {
		filter.PageSize = 20
	}
	return uc.portfolioRepo.List(ctx, filter)
}

// validatePortfolioCreate checks that portfolio creation input is valid.
func validatePortfolioCreate(input *domain.PortfolioCreate) error {
	var errs []domain.ValidationError

	if strings.TrimSpace(input.Title) == "" {
		errs = append(errs, domain.ValidationError{Field: "title", Message: "title is required"})
	}
	if input.Profession == "" {
		errs = append(errs, domain.ValidationError{Field: "profession", Message: "profession is required"})
	}

	if len(errs) > 0 {
		return &domain.ValidationErrors{Errors: errs}
	}
	return nil
}

// generateSlug creates a URL-friendly slug from a title.
func generateSlug(title string) string {
	slug := strings.ToLower(strings.TrimSpace(title))
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove non-alphanumeric characters (except hyphens)
	var cleaned []rune
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			cleaned = append(cleaned, r)
		}
	}
	slug = string(cleaned)
	// Append short ID for uniqueness
	slug = slug + "-" + generateID()[:8]
	return slug
}

// extractSkillNames returns skill names from a slice of Skills.
func extractSkillNames(skills []domain.Skill) []string {
	names := make([]string, 0, len(skills))
	for _, s := range skills {
		names = append(names, s.Name)
	}
	return names
}

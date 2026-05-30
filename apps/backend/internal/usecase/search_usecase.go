package usecase

import (
	"context"
	"fmt"

	"skillport/internal/domain"
)

// SearchUseCase orchestrates full-text search across portfolios and jobs via OpenSearch.
type SearchUseCase struct {
	searchRepo domain.SearchRepository
	cache      domain.CacheRepository
}

// NewSearchUseCase creates a new SearchUseCase with injected dependencies.
func NewSearchUseCase(
	searchRepo domain.SearchRepository,
	cache domain.CacheRepository,
) *SearchUseCase {
	return &SearchUseCase{
		searchRepo: searchRepo,
		cache:      cache,
	}
}

// SearchPortfolios performs full-text search across portfolios.
func (uc *SearchUseCase) SearchPortfolios(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) (*domain.SearchResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}

	portfolios, total, err := uc.searchRepo.SearchPortfolios(ctx, query, filters, page, pageSize)
	if err != nil {
		return nil, fmt.Errorf("searching portfolios: %w", err)
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &domain.SearchResult{
		Items:      portfolios,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// SearchJobs performs full-text search across job postings.
func (uc *SearchUseCase) SearchJobs(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) (*domain.SearchResult, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}

	jobs, total, err := uc.searchRepo.SearchJobs(ctx, query, filters, page, pageSize)
	if err != nil {
		return nil, fmt.Errorf("searching jobs: %w", err)
	}

	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &domain.SearchResult{
		Items:      jobs,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

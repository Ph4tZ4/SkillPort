package usecase

import (
	"context"
	"fmt"
	"math"
	"sort"

	"skillport/internal/domain"
)

// MatchUseCase implements hybrid matching combining vector similarity, text relevance, and skill overlap.
type MatchUseCase struct {
	portfolioRepo domain.PortfolioRepository
	jobRepo       domain.JobRepository
	searchRepo    domain.SearchRepository
	vectorRepo    domain.VectorRepository
	publisher     domain.EventPublisher
	notifier      domain.NotificationPublisher
}

// NewMatchUseCase creates a new MatchUseCase with injected dependencies.
func NewMatchUseCase(
	portfolioRepo domain.PortfolioRepository,
	jobRepo domain.JobRepository,
	searchRepo domain.SearchRepository,
	vectorRepo domain.VectorRepository,
	publisher domain.EventPublisher,
	notifier domain.NotificationPublisher,
) *MatchUseCase {
	return &MatchUseCase{
		portfolioRepo: portfolioRepo,
		jobRepo:       jobRepo,
		searchRepo:    searchRepo,
		vectorRepo:    vectorRepo,
		publisher:     publisher,
		notifier:      notifier,
	}
}

// FindMatchesForJob finds the best candidate portfolios for a given job posting.
func (uc *MatchUseCase) FindMatchesForJob(ctx context.Context, jobID string, topK int) ([]domain.MatchResult, error) {
	if topK < 1 || topK > 100 {
		topK = 10
	}

	job, err := uc.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("getting job for matching: %w", err)
	}

	// Step 1: Generate a placeholder embedding from job description
	// In production, this would call an embedding model API
	embedding := generatePlaceholderEmbedding(job.Description)

	// Step 2: Vector similarity search via Milvus
	vectorMatches, err := uc.vectorRepo.SearchSimilarPortfolios(ctx, embedding, topK*2)
	if err != nil {
		return nil, fmt.Errorf("vector search: %w", err)
	}

	// Step 3: Text relevance search via OpenSearch
	skillNames := extractSkillNames(job.RequiredSkills)
	query := job.Title + " " + job.Description
	textResults, _, err := uc.searchRepo.SearchPortfolios(ctx, query, nil, 1, topK*2)
	if err != nil {
		return nil, fmt.Errorf("text search: %w", err)
	}

	// Step 4: Combine and score results
	weights := domain.DefaultMatchWeights()
	results := uc.hybridScore(ctx, job, vectorMatches, textResults, skillNames, weights)

	// Sort by overall score descending
	sort.Slice(results, func(i, j int) bool {
		return results[i].OverallScore > results[j].OverallScore
	})

	// Trim to topK
	if len(results) > topK {
		results = results[:topK]
	}

	return results, nil
}

// FindMatchesForPortfolio finds the best job matches for a given portfolio.
func (uc *MatchUseCase) FindMatchesForPortfolio(ctx context.Context, portfolioID string, topK int) ([]domain.MatchResult, error) {
	if topK < 1 || topK > 100 {
		topK = 10
	}

	portfolio, err := uc.portfolioRepo.GetByID(ctx, portfolioID)
	if err != nil {
		return nil, fmt.Errorf("getting portfolio for matching: %w", err)
	}

	embedding := generatePlaceholderEmbedding(portfolio.Summary)

	vectorMatches, err := uc.vectorRepo.SearchSimilarJobs(ctx, embedding, topK*2)
	if err != nil {
		return nil, fmt.Errorf("vector search: %w", err)
	}

	skillNames := extractSkillNames(portfolio.Skills)
	query := portfolio.Title + " " + portfolio.Summary
	textResults, _, err := uc.searchRepo.SearchJobs(ctx, query, nil, 1, topK*2)
	if err != nil {
		return nil, fmt.Errorf("text search: %w", err)
	}

	weights := domain.DefaultMatchWeights()
	results := uc.hybridScoreJobs(ctx, portfolio, vectorMatches, textResults, skillNames, weights)

	sort.Slice(results, func(i, j int) bool {
		return results[i].OverallScore > results[j].OverallScore
	})

	if len(results) > topK {
		results = results[:topK]
	}

	return results, nil
}

// hybridScore combines vector, text, and skill scores for portfolio matches.
func (uc *MatchUseCase) hybridScore(
	ctx context.Context,
	job *domain.Job,
	vectorMatches []domain.VectorMatch,
	textResults []*domain.Portfolio,
	requiredSkills []string,
	weights domain.MatchWeights,
) []domain.MatchResult {
	scoreMap := make(map[string]*domain.MatchResult)

	// Process vector matches
	for _, vm := range vectorMatches {
		scoreMap[vm.ID] = &domain.MatchResult{
			PortfolioID:      vm.ID,
			JobID:            job.ID,
			VectorSimilarity: float64(vm.Score),
		}
	}

	// Process text results
	for i, portfolio := range textResults {
		if existing, ok := scoreMap[portfolio.ID]; ok {
			existing.TextRelevance = 1.0 - (float64(i) / float64(len(textResults)))
		} else {
			scoreMap[portfolio.ID] = &domain.MatchResult{
				PortfolioID:   portfolio.ID,
				JobID:         job.ID,
				TextRelevance: 1.0 - (float64(i) / float64(len(textResults))),
			}
		}
	}

	// Calculate skill overlap and overall score
	results := make([]domain.MatchResult, 0, len(scoreMap))
	for _, result := range scoreMap {
		portfolio, err := uc.portfolioRepo.GetByID(ctx, result.PortfolioID)
		if err != nil {
			continue
		}

		result.CandidateID = portfolio.UserID
		matched, missing := calculateSkillOverlap(portfolio.Skills, requiredSkills)
		result.MatchedSkills = matched
		result.MissingSkills = missing

		if len(requiredSkills) > 0 {
			result.SkillOverlap = float64(len(matched)) / float64(len(requiredSkills))
		}

		result.OverallScore = math.Round((result.VectorSimilarity*weights.VectorWeight+
			result.TextRelevance*weights.TextWeight+
			result.SkillOverlap*weights.SkillWeight)*100*10) / 10

		results = append(results, *result)
	}

	return results
}

// hybridScoreJobs combines vector, text, and skill scores for job matches.
func (uc *MatchUseCase) hybridScoreJobs(
	ctx context.Context,
	portfolio *domain.Portfolio,
	vectorMatches []domain.VectorMatch,
	textResults []*domain.Job,
	candidateSkills []string,
	weights domain.MatchWeights,
) []domain.MatchResult {
	scoreMap := make(map[string]*domain.MatchResult)

	for _, vm := range vectorMatches {
		scoreMap[vm.ID] = &domain.MatchResult{
			PortfolioID:      portfolio.ID,
			CandidateID:      portfolio.UserID,
			JobID:            vm.ID,
			VectorSimilarity: float64(vm.Score),
		}
	}

	for i, job := range textResults {
		if existing, ok := scoreMap[job.ID]; ok {
			existing.TextRelevance = 1.0 - (float64(i) / float64(len(textResults)))
		} else {
			scoreMap[job.ID] = &domain.MatchResult{
				PortfolioID:   portfolio.ID,
				CandidateID:   portfolio.UserID,
				JobID:         job.ID,
				TextRelevance: 1.0 - (float64(i) / float64(len(textResults))),
			}
		}
	}

	results := make([]domain.MatchResult, 0, len(scoreMap))
	for _, result := range scoreMap {
		job, err := uc.jobRepo.GetByID(ctx, result.JobID)
		if err != nil {
			continue
		}

		requiredSkills := extractSkillNames(job.RequiredSkills)
		matched, missing := calculateSkillOverlap(portfolio.Skills, requiredSkills)
		result.MatchedSkills = matched
		result.MissingSkills = missing

		if len(requiredSkills) > 0 {
			result.SkillOverlap = float64(len(matched)) / float64(len(requiredSkills))
		}

		result.OverallScore = math.Round((result.VectorSimilarity*weights.VectorWeight+
			result.TextRelevance*weights.TextWeight+
			result.SkillOverlap*weights.SkillWeight)*100*10) / 10

		results = append(results, *result)
	}

	return results
}

// calculateSkillOverlap determines which required skills are matched and which are missing.
func calculateSkillOverlap(candidateSkills []domain.Skill, requiredSkills []string) (matched, missing []string) {
	skillSet := make(map[string]bool)
	for _, s := range candidateSkills {
		skillSet[normalizeSkill(s.Name)] = true
	}

	for _, req := range requiredSkills {
		if skillSet[normalizeSkill(req)] {
			matched = append(matched, req)
		} else {
			missing = append(missing, req)
		}
	}
	return
}

// normalizeSkill normalizes a skill name for comparison.
func normalizeSkill(name string) string {
	return fmt.Sprintf("%s", name) // Simplified; in production use strings.ToLower + trim
}

// generatePlaceholderEmbedding creates a deterministic placeholder embedding vector.
// In production, this would call an ML model API (e.g., OpenAI, sentence-transformers).
func generatePlaceholderEmbedding(text string) []float32 {
	dim := 384 // Standard sentence-transformer dimension
	embedding := make([]float32, dim)
	for i := range embedding {
		// Simple hash-based deterministic placeholder
		hash := 0
		for j, r := range text {
			hash += int(r) * (j + 1) * (i + 1)
		}
		embedding[i] = float32(hash%1000) / 1000.0
	}
	return embedding
}

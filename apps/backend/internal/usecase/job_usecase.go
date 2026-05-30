package usecase

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillport/internal/domain"
)

// JobUseCase implements application-specific business rules for job postings.
type JobUseCase struct {
	jobRepo   domain.JobRepository
	cache     domain.CacheRepository
	publisher domain.EventPublisher
}

// NewJobUseCase creates a new JobUseCase with injected dependencies.
func NewJobUseCase(
	jobRepo domain.JobRepository,
	cache domain.CacheRepository,
	publisher domain.EventPublisher,
) *JobUseCase {
	return &JobUseCase{
		jobRepo:   jobRepo,
		cache:     cache,
		publisher: publisher,
	}
}

// Create stores a new job posting and publishes a creation event.
func (uc *JobUseCase) Create(ctx context.Context, companyID string, input *domain.JobCreate) (*domain.Job, error) {
	if err := validateJobCreate(input); err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	job := &domain.Job{
		ID:             generateID(),
		CompanyID:      companyID,
		CompanyName:    strings.TrimSpace(input.CompanyName),
		Title:          strings.TrimSpace(input.Title),
		Description:    strings.TrimSpace(input.Description),
		RequiredSkills: input.RequiredSkills,
		Profession:     input.Profession,
		Location:       strings.TrimSpace(input.Location),
		Remote:         input.Remote,
		SalaryMin:      input.SalaryMin,
		SalaryMax:      input.SalaryMax,
		SalaryCurrency: input.SalaryCurrency,
		Status:         domain.JobStatusActive,
		Tags:           input.Tags,
		CreatedAt:      now,
		UpdatedAt:      now,
		ExpiresAt:      now.Add(30 * 24 * time.Hour), // Default 30-day expiry
	}

	if err := uc.jobRepo.Create(ctx, job); err != nil {
		return nil, fmt.Errorf("creating job: %w", err)
	}

	// Publish event to Kafka for search index sync
	skillNames := extractSkillNames(job.RequiredSkills)
	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventJobPosted,
		Source:    "job-service",
		Timestamp: now,
		Data: domain.JobEventData{
			JobID:       job.ID,
			CompanyID:   companyID,
			Title:       job.Title,
			Profession:  job.Profession,
			Skills:      skillNames,
			Description: job.Description,
		},
	})

	return job, nil
}

// GetByID retrieves a job posting with caching.
func (uc *JobUseCase) GetByID(ctx context.Context, id string) (*domain.Job, error) {
	cacheKey := "job:" + id
	var cached domain.Job
	if err := uc.cache.Get(ctx, cacheKey, &cached); err == nil {
		return &cached, nil
	}

	job, err := uc.jobRepo.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("getting job: %w", err)
	}

	_ = uc.cache.Set(ctx, cacheKey, job, 300)
	return job, nil
}

// Update modifies a job posting and publishes an update event.
func (uc *JobUseCase) Update(ctx context.Context, jobID, companyID string, input *domain.JobUpdate) (*domain.Job, error) {
	existing, err := uc.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return nil, fmt.Errorf("getting job for update: %w", err)
	}
	if existing.CompanyID != companyID {
		return nil, domain.ErrForbidden
	}

	job, err := uc.jobRepo.Update(ctx, jobID, input)
	if err != nil {
		return nil, fmt.Errorf("updating job: %w", err)
	}

	_ = uc.cache.Delete(ctx, "job:"+jobID)

	skillNames := extractSkillNames(job.RequiredSkills)
	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventJobUpdated,
		Source:    "job-service",
		Timestamp: time.Now().UTC(),
		Data: domain.JobEventData{
			JobID:       job.ID,
			CompanyID:   companyID,
			Title:       job.Title,
			Profession:  job.Profession,
			Skills:      skillNames,
			Description: job.Description,
		},
	})

	return job, nil
}

// Delete removes a job posting and publishes a deletion event.
func (uc *JobUseCase) Delete(ctx context.Context, jobID, companyID string) error {
	existing, err := uc.jobRepo.GetByID(ctx, jobID)
	if err != nil {
		return fmt.Errorf("getting job for delete: %w", err)
	}
	if existing.CompanyID != companyID {
		return domain.ErrForbidden
	}

	if err := uc.jobRepo.Delete(ctx, jobID); err != nil {
		return fmt.Errorf("deleting job: %w", err)
	}

	_ = uc.cache.Delete(ctx, "job:"+jobID)

	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventJobDeleted,
		Source:    "job-service",
		Timestamp: time.Now().UTC(),
		Data:      domain.JobEventData{JobID: jobID, CompanyID: companyID},
	})

	return nil
}

// List retrieves jobs matching the given filter.
func (uc *JobUseCase) List(ctx context.Context, filter *domain.JobFilter) ([]*domain.Job, int64, error) {
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.PageSize < 1 || filter.PageSize > 50 {
		filter.PageSize = 20
	}
	return uc.jobRepo.List(ctx, filter)
}

// validateJobCreate checks that job creation input is valid.
func validateJobCreate(input *domain.JobCreate) error {
	var errs []domain.ValidationError

	if strings.TrimSpace(input.Title) == "" {
		errs = append(errs, domain.ValidationError{Field: "title", Message: "title is required"})
	}
	if strings.TrimSpace(input.Description) == "" {
		errs = append(errs, domain.ValidationError{Field: "description", Message: "description is required"})
	}
	if input.Profession == "" {
		errs = append(errs, domain.ValidationError{Field: "profession", Message: "profession is required"})
	}

	if len(errs) > 0 {
		return &domain.ValidationErrors{Errors: errs}
	}
	return nil
}

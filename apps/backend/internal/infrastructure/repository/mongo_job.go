package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"skillport/internal/domain"
)

// MongoJobRepository implements domain.JobRepository using MongoDB.
type MongoJobRepository struct {
	collection *mongo.Collection
}

type mongoJob struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`
	ExternalID     string             `bson:"external_id"`
	CompanyID      string             `bson:"company_id"`
	CompanyName    string             `bson:"company_name"`
	Title          string             `bson:"title"`
	Description    string             `bson:"description"`
	RequiredSkills []mongoSkill       `bson:"required_skills"`
	Profession     string             `bson:"profession"`
	Location       string             `bson:"location"`
	Remote         bool               `bson:"remote"`
	SalaryMin      int64              `bson:"salary_min"`
	SalaryMax      int64              `bson:"salary_max"`
	SalaryCurrency string             `bson:"salary_currency"`
	Status         string             `bson:"status"`
	Tags           []string           `bson:"tags"`
	CreatedAt      time.Time          `bson:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at"`
	ExpiresAt      time.Time          `bson:"expires_at"`
}

// NewMongoJobRepository creates a new MongoDB job repository with indexes.
func NewMongoJobRepository(db *mongo.Database) (*MongoJobRepository, error) {
	col := db.Collection("jobs")

	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "external_id", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "company_id", Value: 1}}},
		{Keys: bson.D{{Key: "profession", Value: 1}}},
		{Keys: bson.D{{Key: "status", Value: 1}}},
		{Keys: bson.D{{Key: "required_skills.name", Value: 1}}},
		{Keys: bson.D{{Key: "location", Value: 1}}},
	}

	_, err := col.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		return nil, fmt.Errorf("creating job indexes: %w", err)
	}

	return &MongoJobRepository{collection: col}, nil
}

// Create stores a new job posting.
func (r *MongoJobRepository) Create(ctx context.Context, job *domain.Job) error {
	doc := toMongoJob(job)
	_, err := r.collection.InsertOne(ctx, doc)
	if err != nil {
		return fmt.Errorf("inserting job: %w", err)
	}
	return nil
}

// GetByID retrieves a job by its external ID.
func (r *MongoJobRepository) GetByID(ctx context.Context, id string) (*domain.Job, error) {
	var doc mongoJob
	err := r.collection.FindOne(ctx, bson.M{"external_id": id}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("finding job by ID: %w", err)
	}
	return toDomainJob(&doc), nil
}

// Update modifies an existing job posting.
func (r *MongoJobRepository) Update(ctx context.Context, id string, update *domain.JobUpdate) (*domain.Job, error) {
	setFields := bson.M{"updated_at": time.Now().UTC()}

	if update.Title != nil {
		setFields["title"] = *update.Title
	}
	if update.Description != nil {
		setFields["description"] = *update.Description
	}
	if update.RequiredSkills != nil {
		skills := make([]mongoSkill, 0, len(*update.RequiredSkills))
		for _, s := range *update.RequiredSkills {
			skills = append(skills, mongoSkill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
		}
		setFields["required_skills"] = skills
	}
	if update.Location != nil {
		setFields["location"] = *update.Location
	}
	if update.Remote != nil {
		setFields["remote"] = *update.Remote
	}
	if update.SalaryMin != nil {
		setFields["salary_min"] = *update.SalaryMin
	}
	if update.SalaryMax != nil {
		setFields["salary_max"] = *update.SalaryMax
	}
	if update.Status != nil {
		setFields["status"] = string(*update.Status)
	}
	if update.Tags != nil {
		setFields["tags"] = *update.Tags
	}

	result := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"external_id": id},
		bson.M{"$set": setFields},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var doc mongoJob
	if err := result.Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("updating job: %w", err)
	}
	return toDomainJob(&doc), nil
}

// Delete removes a job posting.
func (r *MongoJobRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"external_id": id})
	if err != nil {
		return fmt.Errorf("deleting job: %w", err)
	}
	if result.DeletedCount == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// List retrieves jobs matching the given filter with pagination.
func (r *MongoJobRepository) List(ctx context.Context, filter *domain.JobFilter) ([]*domain.Job, int64, error) {
	query := bson.M{"status": string(domain.JobStatusActive)}

	if filter.CompanyID != "" {
		query["company_id"] = filter.CompanyID
		delete(query, "status")
	}
	if filter.Profession != "" {
		query["profession"] = string(filter.Profession)
	}
	if filter.Location != "" {
		query["location"] = bson.M{"$regex": filter.Location, "$options": "i"}
	}
	if filter.Remote != nil {
		query["remote"] = *filter.Remote
	}
	if len(filter.Skills) > 0 {
		query["required_skills.name"] = bson.M{"$in": filter.Skills}
	}
	if filter.Status != "" {
		query["status"] = string(filter.Status)
	}
	if filter.MinSalary > 0 {
		query["salary_max"] = bson.M{"$gte": filter.MinSalary}
	}
	if filter.MaxSalary > 0 {
		query["salary_min"] = bson.M{"$lte": filter.MaxSalary}
	}

	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, fmt.Errorf("counting jobs: %w", err)
	}

	skip := int64((filter.Page - 1) * filter.PageSize)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(filter.PageSize))

	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, fmt.Errorf("listing jobs: %w", err)
	}
	defer cursor.Close(ctx)

	var results []*domain.Job
	for cursor.Next(ctx) {
		var doc mongoJob
		if err := cursor.Decode(&doc); err != nil {
			return nil, 0, fmt.Errorf("decoding job: %w", err)
		}
		results = append(results, toDomainJob(&doc))
	}

	return results, total, nil
}

// --- Mapping helpers ---

func toMongoJob(j *domain.Job) *mongoJob {
	skills := make([]mongoSkill, 0, len(j.RequiredSkills))
	for _, s := range j.RequiredSkills {
		skills = append(skills, mongoSkill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
	}
	return &mongoJob{
		ExternalID:     j.ID,
		CompanyID:      j.CompanyID,
		CompanyName:    j.CompanyName,
		Title:          j.Title,
		Description:    j.Description,
		RequiredSkills: skills,
		Profession:     string(j.Profession),
		Location:       j.Location,
		Remote:         j.Remote,
		SalaryMin:      j.SalaryMin,
		SalaryMax:      j.SalaryMax,
		SalaryCurrency: j.SalaryCurrency,
		Status:         string(j.Status),
		Tags:           j.Tags,
		CreatedAt:      j.CreatedAt,
		UpdatedAt:      j.UpdatedAt,
		ExpiresAt:      j.ExpiresAt,
	}
}

func toDomainJob(doc *mongoJob) *domain.Job {
	skills := make([]domain.Skill, 0, len(doc.RequiredSkills))
	for _, s := range doc.RequiredSkills {
		skills = append(skills, domain.Skill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
	}
	return &domain.Job{
		ID:             doc.ExternalID,
		CompanyID:      doc.CompanyID,
		CompanyName:    doc.CompanyName,
		Title:          doc.Title,
		Description:    doc.Description,
		RequiredSkills: skills,
		Profession:     domain.ProfessionType(doc.Profession),
		Location:       doc.Location,
		Remote:         doc.Remote,
		SalaryMin:      doc.SalaryMin,
		SalaryMax:      doc.SalaryMax,
		SalaryCurrency: doc.SalaryCurrency,
		Status:         domain.JobStatus(doc.Status),
		Tags:           doc.Tags,
		CreatedAt:      doc.CreatedAt,
		UpdatedAt:      doc.UpdatedAt,
		ExpiresAt:      doc.ExpiresAt,
	}
}

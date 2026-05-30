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

// MongoPortfolioRepository implements domain.PortfolioRepository using MongoDB.
type MongoPortfolioRepository struct {
	collection *mongo.Collection
}

type mongoPortfolio struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	ExternalID string             `bson:"external_id"`
	UserID     string             `bson:"user_id"`
	Title      string             `bson:"title"`
	Slug       string             `bson:"slug"`
	Profession string             `bson:"profession"`
	Summary    string             `bson:"summary"`
	Skills     []mongoSkill       `bson:"skills"`
	Sections   []bson.M           `bson:"sections"` // Polymorphic sections stored as raw BSON
	Tags       []string           `bson:"tags"`
	IsPublic   bool               `bson:"is_public"`
	ViewCount  int64              `bson:"view_count"`
	Metadata   map[string]string  `bson:"metadata"`
	CreatedAt  time.Time          `bson:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at"`
}

type mongoSkill struct {
	Name            string `bson:"name"`
	Level           string `bson:"level"`
	Category        string `bson:"category"`
	YearsExperience int    `bson:"years_experience"`
}

// NewMongoPortfolioRepository creates a new MongoDB portfolio repository with indexes.
func NewMongoPortfolioRepository(db *mongo.Database) (*MongoPortfolioRepository, error) {
	col := db.Collection("portfolios")

	indexes := []mongo.IndexModel{
		{Keys: bson.D{{Key: "external_id", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "user_id", Value: 1}}},
		{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true)},
		{Keys: bson.D{{Key: "profession", Value: 1}}},
		{Keys: bson.D{{Key: "skills.name", Value: 1}}},
		{Keys: bson.D{{Key: "is_public", Value: 1}}},
		{Keys: bson.D{{Key: "tags", Value: 1}}},
	}

	_, err := col.Indexes().CreateMany(context.Background(), indexes)
	if err != nil {
		return nil, fmt.Errorf("creating portfolio indexes: %w", err)
	}

	return &MongoPortfolioRepository{collection: col}, nil
}

// Create stores a new portfolio in MongoDB.
func (r *MongoPortfolioRepository) Create(ctx context.Context, portfolio *domain.Portfolio) error {
	doc := toMongoPortfolio(portfolio)
	_, err := r.collection.InsertOne(ctx, doc)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return domain.ErrDuplicate
		}
		return fmt.Errorf("inserting portfolio: %w", err)
	}
	return nil
}

// GetByID retrieves a portfolio by its external ID.
func (r *MongoPortfolioRepository) GetByID(ctx context.Context, id string) (*domain.Portfolio, error) {
	var doc mongoPortfolio
	err := r.collection.FindOne(ctx, bson.M{"external_id": id}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("finding portfolio by ID: %w", err)
	}
	return toDomainPortfolio(&doc), nil
}

// GetBySlug retrieves a portfolio by its URL slug.
func (r *MongoPortfolioRepository) GetBySlug(ctx context.Context, slug string) (*domain.Portfolio, error) {
	var doc mongoPortfolio
	err := r.collection.FindOne(ctx, bson.M{"slug": slug}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("finding portfolio by slug: %w", err)
	}
	return toDomainPortfolio(&doc), nil
}

// GetByUserID retrieves all portfolios for a user.
func (r *MongoPortfolioRepository) GetByUserID(ctx context.Context, userID string) ([]*domain.Portfolio, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"user_id": userID}, options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}}))
	if err != nil {
		return nil, fmt.Errorf("finding portfolios by user: %w", err)
	}
	defer cursor.Close(ctx)

	var results []*domain.Portfolio
	for cursor.Next(ctx) {
		var doc mongoPortfolio
		if err := cursor.Decode(&doc); err != nil {
			return nil, fmt.Errorf("decoding portfolio: %w", err)
		}
		results = append(results, toDomainPortfolio(&doc))
	}
	return results, nil
}

// Update modifies an existing portfolio.
func (r *MongoPortfolioRepository) Update(ctx context.Context, id string, update *domain.PortfolioUpdate) (*domain.Portfolio, error) {
	setFields := bson.M{"updated_at": time.Now().UTC()}

	if update.Title != nil {
		setFields["title"] = *update.Title
	}
	if update.Summary != nil {
		setFields["summary"] = *update.Summary
	}
	if update.Skills != nil {
		skills := make([]mongoSkill, 0, len(*update.Skills))
		for _, s := range *update.Skills {
			skills = append(skills, mongoSkill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
		}
		setFields["skills"] = skills
	}
	if update.Sections != nil {
		setFields["sections"] = sectionsToRawBSON(*update.Sections)
	}
	if update.Tags != nil {
		setFields["tags"] = *update.Tags
	}
	if update.IsPublic != nil {
		setFields["is_public"] = *update.IsPublic
	}

	result := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"external_id": id},
		bson.M{"$set": setFields},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var doc mongoPortfolio
	if err := result.Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("updating portfolio: %w", err)
	}
	return toDomainPortfolio(&doc), nil
}

// Delete removes a portfolio by ID.
func (r *MongoPortfolioRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"external_id": id})
	if err != nil {
		return fmt.Errorf("deleting portfolio: %w", err)
	}
	if result.DeletedCount == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// List retrieves portfolios matching the given filter.
func (r *MongoPortfolioRepository) List(ctx context.Context, filter *domain.PortfolioFilter) ([]*domain.Portfolio, int64, error) {
	query := bson.M{"is_public": true}

	if filter.UserID != "" {
		query["user_id"] = filter.UserID
		delete(query, "is_public") // Show all for the owner
	}
	if filter.Profession != "" {
		query["profession"] = string(filter.Profession)
	}
	if len(filter.Skills) > 0 {
		query["skills.name"] = bson.M{"$in": filter.Skills}
	}
	if len(filter.Tags) > 0 {
		query["tags"] = bson.M{"$in": filter.Tags}
	}

	total, err := r.collection.CountDocuments(ctx, query)
	if err != nil {
		return nil, 0, fmt.Errorf("counting portfolios: %w", err)
	}

	skip := int64((filter.Page - 1) * filter.PageSize)
	opts := options.Find().
		SetSort(bson.D{{Key: "created_at", Value: -1}}).
		SetSkip(skip).
		SetLimit(int64(filter.PageSize))

	cursor, err := r.collection.Find(ctx, query, opts)
	if err != nil {
		return nil, 0, fmt.Errorf("listing portfolios: %w", err)
	}
	defer cursor.Close(ctx)

	var results []*domain.Portfolio
	for cursor.Next(ctx) {
		var doc mongoPortfolio
		if err := cursor.Decode(&doc); err != nil {
			return nil, 0, fmt.Errorf("decoding portfolio: %w", err)
		}
		results = append(results, toDomainPortfolio(&doc))
	}

	return results, total, nil
}

// IncrementViewCount atomically increments the view counter.
func (r *MongoPortfolioRepository) IncrementViewCount(ctx context.Context, id string) error {
	_, err := r.collection.UpdateOne(
		ctx,
		bson.M{"external_id": id},
		bson.M{"$inc": bson.M{"view_count": 1}},
	)
	if err != nil {
		return fmt.Errorf("incrementing view count: %w", err)
	}
	return nil
}

// --- Mapping helpers ---

func toMongoPortfolio(p *domain.Portfolio) *mongoPortfolio {
	skills := make([]mongoSkill, 0, len(p.Skills))
	for _, s := range p.Skills {
		skills = append(skills, mongoSkill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
	}

	return &mongoPortfolio{
		ExternalID: p.ID,
		UserID:     p.UserID,
		Title:      p.Title,
		Slug:       p.Slug,
		Profession: string(p.Profession),
		Summary:    p.Summary,
		Skills:     skills,
		Sections:   sectionsToRawBSON(p.Sections),
		Tags:       p.Tags,
		IsPublic:   p.IsPublic,
		ViewCount:  p.ViewCount,
		Metadata:   p.Metadata,
		CreatedAt:  p.CreatedAt,
		UpdatedAt:  p.UpdatedAt,
	}
}

func toDomainPortfolio(doc *mongoPortfolio) *domain.Portfolio {
	skills := make([]domain.Skill, 0, len(doc.Skills))
	for _, s := range doc.Skills {
		skills = append(skills, domain.Skill{Name: s.Name, Level: s.Level, Category: s.Category, YearsExperience: s.YearsExperience})
	}

	sections := make([]domain.Section, 0, len(doc.Sections))
	for _, raw := range doc.Sections {
		section := domain.Section{
			ID:          getStringField(raw, "id"),
			Type:        domain.SectionType(getStringField(raw, "type")),
			Title:       getStringField(raw, "title"),
			Description: getStringField(raw, "description"),
			OrderIndex:  getIntField(raw, "order_index"),
			Content:     raw["content"],
		}
		sections = append(sections, section)
	}

	return &domain.Portfolio{
		ID:         doc.ExternalID,
		UserID:     doc.UserID,
		Title:      doc.Title,
		Slug:       doc.Slug,
		Profession: domain.ProfessionType(doc.Profession),
		Summary:    doc.Summary,
		Skills:     skills,
		Sections:   sections,
		Tags:       doc.Tags,
		IsPublic:   doc.IsPublic,
		ViewCount:  doc.ViewCount,
		Metadata:   doc.Metadata,
		CreatedAt:  doc.CreatedAt,
		UpdatedAt:  doc.UpdatedAt,
	}
}

func sectionsToRawBSON(sections []domain.Section) []bson.M {
	result := make([]bson.M, 0, len(sections))
	for _, s := range sections {
		result = append(result, bson.M{
			"id":          s.ID,
			"type":        string(s.Type),
			"title":       s.Title,
			"description": s.Description,
			"order_index": s.OrderIndex,
			"content":     s.Content,
		})
	}
	return result
}

func getStringField(m bson.M, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func getIntField(m bson.M, key string) int {
	if v, ok := m[key]; ok {
		switch val := v.(type) {
		case int:
			return val
		case int32:
			return int(val)
		case int64:
			return int(val)
		}
	}
	return 0
}

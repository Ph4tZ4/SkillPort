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

// MongoUserRepository implements domain.UserRepository using MongoDB.
type MongoUserRepository struct {
	collection *mongo.Collection
}

// mongoUser is the MongoDB-specific representation of a User.
type mongoUser struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	ExternalID   string             `bson:"external_id"`
	Email        string             `bson:"email"`
	PasswordHash string             `bson:"password_hash"`
	FullName     string             `bson:"full_name"`
	Headline     string             `bson:"headline"`
	AvatarURL    string             `bson:"avatar_url"`
	Profession   string             `bson:"profession"`
	Location     string             `bson:"location"`
	Bio          string             `bson:"bio"`
	Links        []mongoLink        `bson:"links"`
	CreatedAt    time.Time          `bson:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at"`
}

type mongoLink struct {
	Label string `bson:"label"`
	URL   string `bson:"url"`
}

// NewMongoUserRepository creates a new MongoDB user repository and ensures indexes.
func NewMongoUserRepository(db *mongo.Database) (*MongoUserRepository, error) {
	col := db.Collection("users")

	// Create unique index on email
	_, err := col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys:    bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true),
	})
	if err != nil {
		return nil, fmt.Errorf("creating email index: %w", err)
	}

	// Create index on external_id
	_, err = col.Indexes().CreateOne(context.Background(), mongo.IndexModel{
		Keys: bson.D{{Key: "external_id", Value: 1}},
	})
	if err != nil {
		return nil, fmt.Errorf("creating external_id index: %w", err)
	}

	return &MongoUserRepository{collection: col}, nil
}

// Create stores a new user in MongoDB.
func (r *MongoUserRepository) Create(ctx context.Context, user *domain.User) error {
	doc := toMongoUser(user)
	_, err := r.collection.InsertOne(ctx, doc)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			return domain.ErrDuplicate
		}
		return fmt.Errorf("inserting user: %w", err)
	}
	return nil
}

// GetByID retrieves a user by their external ID.
func (r *MongoUserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	var doc mongoUser
	err := r.collection.FindOne(ctx, bson.M{"external_id": id}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("finding user by ID: %w", err)
	}
	return toDomainUser(&doc), nil
}

// GetByEmail retrieves a user by email address.
func (r *MongoUserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	var doc mongoUser
	err := r.collection.FindOne(ctx, bson.M{"email": email}).Decode(&doc)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("finding user by email: %w", err)
	}
	return toDomainUser(&doc), nil
}

// Update modifies an existing user's fields.
func (r *MongoUserRepository) Update(ctx context.Context, id string, update *domain.UserUpdate) (*domain.User, error) {
	setFields := bson.M{"updated_at": time.Now().UTC()}

	if update.FullName != nil {
		setFields["full_name"] = *update.FullName
	}
	if update.Headline != nil {
		setFields["headline"] = *update.Headline
	}
	if update.AvatarURL != nil {
		setFields["avatar_url"] = *update.AvatarURL
	}
	if update.Profession != nil {
		setFields["profession"] = *update.Profession
	}
	if update.Location != nil {
		setFields["location"] = *update.Location
	}
	if update.Bio != nil {
		setFields["bio"] = *update.Bio
	}
	if update.Links != nil {
		links := make([]mongoLink, 0, len(*update.Links))
		for _, l := range *update.Links {
			links = append(links, mongoLink{Label: l.Label, URL: l.URL})
		}
		setFields["links"] = links
	}

	result := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"external_id": id},
		bson.M{"$set": setFields},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	)

	var doc mongoUser
	if err := result.Decode(&doc); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, domain.ErrNotFound
		}
		return nil, fmt.Errorf("updating user: %w", err)
	}

	return toDomainUser(&doc), nil
}

// Delete removes a user by ID.
func (r *MongoUserRepository) Delete(ctx context.Context, id string) error {
	result, err := r.collection.DeleteOne(ctx, bson.M{"external_id": id})
	if err != nil {
		return fmt.Errorf("deleting user: %w", err)
	}
	if result.DeletedCount == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// --- Mapping helpers ---

func toMongoUser(u *domain.User) *mongoUser {
	links := make([]mongoLink, 0, len(u.Links))
	for _, l := range u.Links {
		links = append(links, mongoLink{Label: l.Label, URL: l.URL})
	}
	return &mongoUser{
		ExternalID:   u.ID,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		FullName:     u.FullName,
		Headline:     u.Headline,
		AvatarURL:    u.AvatarURL,
		Profession:   u.Profession,
		Location:     u.Location,
		Bio:          u.Bio,
		Links:        links,
		CreatedAt:    u.CreatedAt,
		UpdatedAt:    u.UpdatedAt,
	}
}

func toDomainUser(doc *mongoUser) *domain.User {
	links := make([]domain.Link, 0, len(doc.Links))
	for _, l := range doc.Links {
		links = append(links, domain.Link{Label: l.Label, URL: l.URL})
	}
	return &domain.User{
		ID:           doc.ExternalID,
		Email:        doc.Email,
		PasswordHash: doc.PasswordHash,
		FullName:     doc.FullName,
		Headline:     doc.Headline,
		AvatarURL:    doc.AvatarURL,
		Profession:   doc.Profession,
		Location:     doc.Location,
		Bio:          doc.Bio,
		Links:        links,
		CreatedAt:    doc.CreatedAt,
		UpdatedAt:    doc.UpdatedAt,
	}
}

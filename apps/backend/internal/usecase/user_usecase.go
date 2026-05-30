package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"

	"skillport/internal/domain"
)

// UserUseCase implements application-specific business rules for users.
type UserUseCase struct {
	userRepo   domain.UserRepository
	cache      domain.CacheRepository
	publisher  domain.EventPublisher
	jwtSecret  string
	jwtExpiry  time.Duration
}

// NewUserUseCase creates a new UserUseCase with injected dependencies.
func NewUserUseCase(
	userRepo domain.UserRepository,
	cache domain.CacheRepository,
	publisher domain.EventPublisher,
	jwtSecret string,
	jwtExpiryHours int,
) *UserUseCase {
	return &UserUseCase{
		userRepo:  userRepo,
		cache:     cache,
		publisher: publisher,
		jwtSecret: jwtSecret,
		jwtExpiry: time.Duration(jwtExpiryHours) * time.Hour,
	}
}

// Register creates a new user account with hashed password.
func (uc *UserUseCase) Register(ctx context.Context, reg *domain.UserRegistration) (*domain.User, *domain.AuthTokens, error) {
	// Validate input
	if err := validateRegistration(reg); err != nil {
		return nil, nil, err
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(reg.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, fmt.Errorf("hashing password: %w", err)
	}

	now := time.Now().UTC()
	user := &domain.User{
		ID:           generateID(),
		Email:        strings.ToLower(strings.TrimSpace(reg.Email)),
		PasswordHash: string(hash),
		FullName:     strings.TrimSpace(reg.FullName),
		Profession:   reg.Profession,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, nil, fmt.Errorf("creating user: %w", err)
	}

	// Generate tokens
	tokens, err := uc.generateTokens(user)
	if err != nil {
		return nil, nil, fmt.Errorf("generating tokens: %w", err)
	}

	// Publish registration event
	_ = uc.publisher.Publish(ctx, &domain.Event{
		ID:        generateID(),
		Type:      domain.EventUserRegistered,
		Source:    "user-service",
		Timestamp: now,
		Data:      map[string]string{"user_id": user.ID, "email": user.Email},
	})

	return user, tokens, nil
}

// Login authenticates a user and returns JWT tokens.
func (uc *UserUseCase) Login(ctx context.Context, login *domain.UserLogin) (*domain.User, *domain.AuthTokens, error) {
	if login.Email == "" || login.Password == "" {
		return nil, nil, domain.ErrValidation
	}

	user, err := uc.userRepo.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(login.Email)))
	if err != nil {
		return nil, nil, domain.ErrUnauthorized
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(login.Password)); err != nil {
		return nil, nil, domain.ErrUnauthorized
	}

	tokens, err := uc.generateTokens(user)
	if err != nil {
		return nil, nil, fmt.Errorf("generating tokens: %w", err)
	}

	return user, tokens, nil
}

// GetProfile retrieves a user by ID, with caching.
func (uc *UserUseCase) GetProfile(ctx context.Context, userID string) (*domain.User, error) {
	cacheKey := "user:" + userID
	var cached domain.User
	if err := uc.cache.Get(ctx, cacheKey, &cached); err == nil {
		return &cached, nil
	}

	user, err := uc.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("getting user profile: %w", err)
	}

	// Cache for 10 minutes
	_ = uc.cache.Set(ctx, cacheKey, user, 600)
	return user, nil
}

// UpdateProfile updates a user's profile fields.
func (uc *UserUseCase) UpdateProfile(ctx context.Context, userID string, update *domain.UserUpdate) (*domain.User, error) {
	user, err := uc.userRepo.Update(ctx, userID, update)
	if err != nil {
		return nil, fmt.Errorf("updating user profile: %w", err)
	}

	// Invalidate cache
	_ = uc.cache.Delete(ctx, "user:"+userID)

	return user, nil
}

// ValidateToken parses and validates a JWT token, returning the user ID.
func (uc *UserUseCase) ValidateToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(uc.jwtSecret), nil
	})
	if err != nil {
		return "", domain.ErrUnauthorized
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", domain.ErrUnauthorized
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", domain.ErrUnauthorized
	}

	return userID, nil
}

// generateTokens creates JWT access and refresh tokens.
func (uc *UserUseCase) generateTokens(user *domain.User) (*domain.AuthTokens, error) {
	expiresAt := time.Now().Add(uc.jwtExpiry)

	claims := jwt.MapClaims{
		"sub":   user.ID,
		"email": user.Email,
		"name":  user.FullName,
		"exp":   expiresAt.Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	accessToken, err := token.SignedString([]byte(uc.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("signing access token: %w", err)
	}

	// Refresh token with longer expiry
	refreshClaims := jwt.MapClaims{
		"sub":  user.ID,
		"type": "refresh",
		"exp":  time.Now().Add(uc.jwtExpiry * 7).Unix(),
		"iat":  time.Now().Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenStr, err := refreshToken.SignedString([]byte(uc.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("signing refresh token: %w", err)
	}

	return &domain.AuthTokens{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		ExpiresAt:    expiresAt.Unix(),
	}, nil
}

// validateRegistration checks that registration input is valid.
func validateRegistration(reg *domain.UserRegistration) error {
	var errs []domain.ValidationError

	if strings.TrimSpace(reg.Email) == "" {
		errs = append(errs, domain.ValidationError{Field: "email", Message: "email is required"})
	} else if !strings.Contains(reg.Email, "@") {
		errs = append(errs, domain.ValidationError{Field: "email", Message: "invalid email format"})
	}

	if len(reg.Password) < 8 {
		errs = append(errs, domain.ValidationError{Field: "password", Message: "password must be at least 8 characters"})
	}

	if strings.TrimSpace(reg.FullName) == "" {
		errs = append(errs, domain.ValidationError{Field: "full_name", Message: "full name is required"})
	}

	if len(errs) > 0 {
		return &domain.ValidationErrors{Errors: errs}
	}
	return nil
}

// generateID creates a cryptographically random hex ID.
func generateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

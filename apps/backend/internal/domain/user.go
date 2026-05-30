package domain

import "time"

// User represents a registered user in the SkillPort platform.
type User struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Headline     string    `json:"headline"`
	AvatarURL    string    `json:"avatar_url"`
	Profession   string    `json:"profession"`
	Location     string    `json:"location"`
	Bio          string    `json:"bio"`
	Links        []Link    `json:"links"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// Link represents an external link (e.g., GitHub, LinkedIn, website).
type Link struct {
	Label string `json:"label"`
	URL   string `json:"url"`
}

// UserRegistration holds the data required to register a new user.
type UserRegistration struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	FullName   string `json:"full_name"`
	Profession string `json:"profession"`
}

// UserLogin holds credentials for authentication.
type UserLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// UserUpdate holds the mutable fields for updating a user profile.
type UserUpdate struct {
	FullName   *string `json:"full_name,omitempty"`
	Headline   *string `json:"headline,omitempty"`
	AvatarURL  *string `json:"avatar_url,omitempty"`
	Profession *string `json:"profession,omitempty"`
	Location   *string `json:"location,omitempty"`
	Bio        *string `json:"bio,omitempty"`
	Links      *[]Link `json:"links,omitempty"`
}

// AuthTokens contains the JWT access and refresh tokens.
type AuthTokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresAt    int64  `json:"expires_at"`
}

package domain

import "time"

// Portfolio represents a user's dynamic, role-specific presentation.
type Portfolio struct {
	ID         string            `json:"id"`
	UserID     string            `json:"user_id"`
	Title      string            `json:"title"`
	Slug       string            `json:"slug"`
	Profession ProfessionType    `json:"profession"`
	Summary    string            `json:"summary"`
	Skills     []Skill           `json:"skills"`
	Sections   []Section         `json:"sections"`
	Tags       []string          `json:"tags"`
	IsPublic   bool              `json:"is_public"`
	ViewCount  int64             `json:"view_count"`
	Metadata   map[string]string `json:"metadata"`
	CreatedAt  time.Time         `json:"created_at"`
	UpdatedAt  time.Time         `json:"updated_at"`
}

// ProfessionType defines the supported profession categories.
type ProfessionType string

const (
	ProfessionTech          ProfessionType = "tech"
	ProfessionCreative      ProfessionType = "creative"
	ProfessionMarketing     ProfessionType = "marketing"
	ProfessionAdministrator ProfessionType = "administration"
	ProfessionMusic         ProfessionType = "music"
	ProfessionPhotography   ProfessionType = "photography"
	ProfessionDesign        ProfessionType = "design"
	ProfessionOther         ProfessionType = "other"
)

// Skill represents a tagged skill with proficiency metadata.
type Skill struct {
	Name             string `json:"name"`
	Level            string `json:"level"` // beginner, intermediate, advanced, expert
	Category         string `json:"category"`
	YearsExperience  int    `json:"years_experience"`
}

// Section represents a content block within a portfolio.
// The Type field determines how the frontend renders the section.
type Section struct {
	ID          string      `json:"id"`
	Type        SectionType `json:"type"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	OrderIndex  int         `json:"order_index"`
	Content     interface{} `json:"content"` // Polymorphic content based on Type
}

// SectionType defines the different kinds of portfolio sections.
type SectionType string

const (
	SectionCode    SectionType = "code"
	SectionMedia   SectionType = "media"
	SectionGallery SectionType = "gallery"
	SectionMetrics SectionType = "metrics"
	SectionText    SectionType = "text"
	SectionLink    SectionType = "link"
)

// CodeContent holds data for code/project showcase sections.
type CodeContent struct {
	Language    string `json:"language"`
	SourceCode  string `json:"source_code"`
	RepoURL     string `json:"repo_url"`
	DemoURL     string `json:"demo_url"`
	Description string `json:"description"`
}

// MediaContent holds data for video/audio player sections.
type MediaContent struct {
	MediaURL    string `json:"media_url"`
	MediaType   string `json:"media_type"` // video, audio
	ThumbnailURL string `json:"thumbnail_url"`
	Duration    string `json:"duration"`
}

// GalleryContent holds data for image gallery sections.
type GalleryContent struct {
	Images []GalleryImage `json:"images"`
}

// GalleryImage represents a single image in a gallery.
type GalleryImage struct {
	URL     string `json:"url"`
	Caption string `json:"caption"`
	AltText string `json:"alt_text"`
}

// MetricsContent holds data for business metrics display sections.
type MetricsContent struct {
	Metrics []Metric `json:"metrics"`
}

// Metric represents a single KPI or business metric.
type Metric struct {
	Label       string  `json:"label"`
	Value       float64 `json:"value"`
	Unit        string  `json:"unit"`
	Description string  `json:"description"`
	TrendUp     bool    `json:"trend_up"`
}

// TextContent holds data for rich text content sections.
type TextContent struct {
	Body   string `json:"body"`
	Format string `json:"format"` // markdown, html, plain
}

// LinkContent holds data for external link showcase sections.
type LinkContent struct {
	Links []ExternalLink `json:"links"`
}

// ExternalLink represents an external resource or project link.
type ExternalLink struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
}

// PortfolioCreate holds the data for creating a new portfolio.
type PortfolioCreate struct {
	Title      string         `json:"title"`
	Profession ProfessionType `json:"profession"`
	Summary    string         `json:"summary"`
	Skills     []Skill        `json:"skills"`
	Sections   []Section      `json:"sections"`
	Tags       []string       `json:"tags"`
	IsPublic   bool           `json:"is_public"`
}

// PortfolioUpdate holds the mutable fields for updating a portfolio.
type PortfolioUpdate struct {
	Title      *string         `json:"title,omitempty"`
	Summary    *string         `json:"summary,omitempty"`
	Skills     *[]Skill        `json:"skills,omitempty"`
	Sections   *[]Section      `json:"sections,omitempty"`
	Tags       *[]string       `json:"tags,omitempty"`
	IsPublic   *bool           `json:"is_public,omitempty"`
}

// PortfolioFilter contains search/filter parameters for listing portfolios.
type PortfolioFilter struct {
	UserID     string         `json:"user_id,omitempty"`
	Profession ProfessionType `json:"profession,omitempty"`
	Skills     []string       `json:"skills,omitempty"`
	Tags       []string       `json:"tags,omitempty"`
	Query      string         `json:"query,omitempty"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
}

package domain

import "time"

// Job represents a job posting on the platform.
type Job struct {
	ID             string    `json:"id"`
	CompanyID      string    `json:"company_id"`
	CompanyName    string    `json:"company_name"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	RequiredSkills []Skill   `json:"required_skills"`
	Profession     ProfessionType `json:"profession"`
	Location       string    `json:"location"`
	Remote         bool      `json:"remote"`
	SalaryMin      int64     `json:"salary_min"`
	SalaryMax      int64     `json:"salary_max"`
	SalaryCurrency string    `json:"salary_currency"`
	Status         JobStatus `json:"status"`
	Tags           []string  `json:"tags"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	ExpiresAt      time.Time `json:"expires_at"`
}

// JobStatus represents the lifecycle state of a job posting.
type JobStatus string

const (
	JobStatusDraft    JobStatus = "draft"
	JobStatusActive   JobStatus = "active"
	JobStatusPaused   JobStatus = "paused"
	JobStatusClosed   JobStatus = "closed"
	JobStatusExpired  JobStatus = "expired"
)

// JobCreate holds the data for creating a new job posting.
type JobCreate struct {
	CompanyName    string         `json:"company_name"`
	Title          string         `json:"title"`
	Description    string         `json:"description"`
	RequiredSkills []Skill        `json:"required_skills"`
	Profession     ProfessionType `json:"profession"`
	Location       string         `json:"location"`
	Remote         bool           `json:"remote"`
	SalaryMin      int64          `json:"salary_min"`
	SalaryMax      int64          `json:"salary_max"`
	SalaryCurrency string         `json:"salary_currency"`
	Tags           []string       `json:"tags"`
}

// JobUpdate holds the mutable fields for updating a job posting.
type JobUpdate struct {
	Title          *string         `json:"title,omitempty"`
	Description    *string         `json:"description,omitempty"`
	RequiredSkills *[]Skill        `json:"required_skills,omitempty"`
	Location       *string         `json:"location,omitempty"`
	Remote         *bool           `json:"remote,omitempty"`
	SalaryMin      *int64          `json:"salary_min,omitempty"`
	SalaryMax      *int64          `json:"salary_max,omitempty"`
	Status         *JobStatus      `json:"status,omitempty"`
	Tags           *[]string       `json:"tags,omitempty"`
}

// JobFilter contains search/filter parameters for listing jobs.
type JobFilter struct {
	CompanyID  string         `json:"company_id,omitempty"`
	Profession ProfessionType `json:"profession,omitempty"`
	Location   string         `json:"location,omitempty"`
	Remote     *bool          `json:"remote,omitempty"`
	Skills     []string       `json:"skills,omitempty"`
	Status     JobStatus      `json:"status,omitempty"`
	Query      string         `json:"query,omitempty"`
	MinSalary  int64          `json:"min_salary,omitempty"`
	MaxSalary  int64          `json:"max_salary,omitempty"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
}

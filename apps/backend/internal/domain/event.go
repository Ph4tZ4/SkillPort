package domain

import "time"

// EventType defines the type of domain event.
type EventType string

const (
	EventPortfolioCreated EventType = "portfolio.created"
	EventPortfolioUpdated EventType = "portfolio.updated"
	EventPortfolioDeleted EventType = "portfolio.deleted"
	EventJobPosted        EventType = "job.posted"
	EventJobUpdated       EventType = "job.updated"
	EventJobDeleted       EventType = "job.deleted"
	EventProfileViewed    EventType = "profile.viewed"
	EventMatchFound       EventType = "match.found"
	EventUserRegistered   EventType = "user.registered"
)

// Event represents a domain event published to the event backbone (Kafka).
type Event struct {
	ID        string      `json:"id"`
	Type      EventType   `json:"type"`
	Source    string      `json:"source"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// KafkaTopic maps event types to their Kafka topic names.
var KafkaTopic = map[EventType]string{
	EventPortfolioCreated: "skillport.portfolio.events",
	EventPortfolioUpdated: "skillport.portfolio.events",
	EventPortfolioDeleted: "skillport.portfolio.events",
	EventJobPosted:        "skillport.job.events",
	EventJobUpdated:       "skillport.job.events",
	EventJobDeleted:       "skillport.job.events",
	EventProfileViewed:    "skillport.analytics.events",
	EventMatchFound:       "skillport.match.events",
	EventUserRegistered:   "skillport.user.events",
}

// PortfolioEventData carries portfolio-specific data in events.
type PortfolioEventData struct {
	PortfolioID string         `json:"portfolio_id"`
	UserID      string         `json:"user_id"`
	Title       string         `json:"title"`
	Profession  ProfessionType `json:"profession"`
	Skills      []string       `json:"skills"`
	Summary     string         `json:"summary"`
}

// JobEventData carries job-specific data in events.
type JobEventData struct {
	JobID       string         `json:"job_id"`
	CompanyID   string         `json:"company_id"`
	Title       string         `json:"title"`
	Profession  ProfessionType `json:"profession"`
	Skills      []string       `json:"skills"`
	Description string         `json:"description"`
}

// ViewEventData carries portfolio view data in events.
type ViewEventData struct {
	PortfolioID string `json:"portfolio_id"`
	ViewerID    string `json:"viewer_id"`
	Source      string `json:"source"`
}

// MatchEventData carries match notification data in events.
type MatchEventData struct {
	CandidateID string  `json:"candidate_id"`
	JobID       string  `json:"job_id"`
	Score       float64 `json:"score"`
}

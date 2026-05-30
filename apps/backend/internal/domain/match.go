package domain

// MatchResult represents the outcome of matching a candidate portfolio against a job.
type MatchResult struct {
	CandidateID      string  `json:"candidate_id"`
	PortfolioID      string  `json:"portfolio_id"`
	JobID            string  `json:"job_id"`
	OverallScore     float64 `json:"overall_score"`     // Combined weighted score (0-100)
	VectorSimilarity float64 `json:"vector_similarity"` // Cosine similarity from Milvus (0-1)
	TextRelevance    float64 `json:"text_relevance"`    // OpenSearch relevance score
	SkillOverlap     float64 `json:"skill_overlap"`     // Percentage of required skills matched
	MatchedSkills    []string `json:"matched_skills"`
	MissingSkills    []string `json:"missing_skills"`
}

// MatchRequest contains the parameters for generating match results.
type MatchRequest struct {
	JobID      string   `json:"job_id,omitempty"`
	PortfolioID string  `json:"portfolio_id,omitempty"`
	Skills     []string `json:"skills,omitempty"`
	Query      string   `json:"query,omitempty"`
	TopK       int      `json:"top_k"` // Number of results to return
}

// MatchWeights defines the weighting factors for the hybrid scoring algorithm.
type MatchWeights struct {
	VectorWeight float64 `json:"vector_weight"` // Weight for semantic similarity
	TextWeight   float64 `json:"text_weight"`   // Weight for keyword relevance
	SkillWeight  float64 `json:"skill_weight"`  // Weight for skill overlap
}

// DefaultMatchWeights returns the standard weighting for match scoring.
func DefaultMatchWeights() MatchWeights {
	return MatchWeights{
		VectorWeight: 0.4,
		TextWeight:   0.3,
		SkillWeight:  0.3,
	}
}

// SearchResult wraps paginated search results.
type SearchResult struct {
	Items      interface{} `json:"items"`
	Total      int64       `json:"total"`
	Page       int         `json:"page"`
	PageSize   int         `json:"page_size"`
	TotalPages int         `json:"total_pages"`
}

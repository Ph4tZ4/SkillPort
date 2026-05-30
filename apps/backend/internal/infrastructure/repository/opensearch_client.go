package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"skillport/internal/domain"
)

// OpenSearchClient implements domain.SearchRepository using OpenSearch.
type OpenSearchClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewOpenSearchClient creates a new OpenSearch client.
func NewOpenSearchClient(host string, port int) *OpenSearchClient {
	return &OpenSearchClient{
		baseURL:    fmt.Sprintf("http://%s:%d", host, port),
		httpClient: &http.Client{},
	}
}

// InitIndexes creates the required OpenSearch indexes with mappings.
func (c *OpenSearchClient) InitIndexes(ctx context.Context) error {
	portfolioMapping := map[string]interface{}{
		"mappings": map[string]interface{}{
			"properties": map[string]interface{}{
				"portfolio_id": map[string]string{"type": "keyword"},
				"user_id":      map[string]string{"type": "keyword"},
				"title":        map[string]string{"type": "text", "analyzer": "standard"},
				"profession":   map[string]string{"type": "keyword"},
				"summary":      map[string]string{"type": "text", "analyzer": "standard"},
				"skills": map[string]interface{}{
					"type": "nested",
					"properties": map[string]interface{}{
						"name":     map[string]string{"type": "keyword"},
						"level":    map[string]string{"type": "keyword"},
						"category": map[string]string{"type": "keyword"},
					},
				},
				"tags":       map[string]string{"type": "keyword"},
				"is_public":  map[string]string{"type": "boolean"},
				"created_at": map[string]string{"type": "date"},
			},
		},
	}

	if err := c.createIndex(ctx, "portfolios", portfolioMapping); err != nil {
		return fmt.Errorf("creating portfolios index: %w", err)
	}

	jobMapping := map[string]interface{}{
		"mappings": map[string]interface{}{
			"properties": map[string]interface{}{
				"job_id":       map[string]string{"type": "keyword"},
				"company_id":   map[string]string{"type": "keyword"},
				"company_name": map[string]string{"type": "text", "analyzer": "standard"},
				"title":        map[string]string{"type": "text", "analyzer": "standard"},
				"description":  map[string]string{"type": "text", "analyzer": "standard"},
				"profession":   map[string]string{"type": "keyword"},
				"location":     map[string]string{"type": "text"},
				"remote":       map[string]string{"type": "boolean"},
				"salary_min":   map[string]string{"type": "long"},
				"salary_max":   map[string]string{"type": "long"},
				"status":       map[string]string{"type": "keyword"},
				"required_skills": map[string]interface{}{
					"type": "nested",
					"properties": map[string]interface{}{
						"name":     map[string]string{"type": "keyword"},
						"level":    map[string]string{"type": "keyword"},
						"category": map[string]string{"type": "keyword"},
					},
				},
				"tags":       map[string]string{"type": "keyword"},
				"created_at": map[string]string{"type": "date"},
			},
		},
	}

	if err := c.createIndex(ctx, "jobs", jobMapping); err != nil {
		return fmt.Errorf("creating jobs index: %w", err)
	}

	return nil
}

// IndexPortfolio adds or updates a portfolio in the search index.
func (c *OpenSearchClient) IndexPortfolio(ctx context.Context, portfolio *domain.Portfolio) error {
	doc := map[string]interface{}{
		"portfolio_id": portfolio.ID,
		"user_id":      portfolio.UserID,
		"title":        portfolio.Title,
		"profession":   string(portfolio.Profession),
		"summary":      portfolio.Summary,
		"skills":       portfolio.Skills,
		"tags":         portfolio.Tags,
		"is_public":    portfolio.IsPublic,
		"created_at":   portfolio.CreatedAt,
	}
	return c.indexDocument(ctx, "portfolios", portfolio.ID, doc)
}

// IndexJob adds or updates a job in the search index.
func (c *OpenSearchClient) IndexJob(ctx context.Context, job *domain.Job) error {
	doc := map[string]interface{}{
		"job_id":          job.ID,
		"company_id":      job.CompanyID,
		"company_name":    job.CompanyName,
		"title":           job.Title,
		"description":     job.Description,
		"profession":      string(job.Profession),
		"location":        job.Location,
		"remote":          job.Remote,
		"salary_min":      job.SalaryMin,
		"salary_max":      job.SalaryMax,
		"status":          string(job.Status),
		"required_skills": job.RequiredSkills,
		"tags":            job.Tags,
		"created_at":      job.CreatedAt,
	}
	return c.indexDocument(ctx, "jobs", job.ID, doc)
}

// SearchPortfolios performs full-text search across portfolios.
func (c *OpenSearchClient) SearchPortfolios(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) ([]*domain.Portfolio, int64, error) {
	searchQuery := c.buildSearchQuery(query, filters, page, pageSize)

	body, err := c.doSearch(ctx, "portfolios", searchQuery)
	if err != nil {
		return nil, 0, fmt.Errorf("searching portfolios: %w", err)
	}

	var result opensearchResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, 0, fmt.Errorf("parsing search response: %w", err)
	}

	portfolios := make([]*domain.Portfolio, 0, len(result.Hits.Hits))
	for _, hit := range result.Hits.Hits {
		p := &domain.Portfolio{
			ID:         getString(hit.Source, "portfolio_id"),
			UserID:     getString(hit.Source, "user_id"),
			Title:      getString(hit.Source, "title"),
			Profession: domain.ProfessionType(getString(hit.Source, "profession")),
			Summary:    getString(hit.Source, "summary"),
		}
		portfolios = append(portfolios, p)
	}

	return portfolios, result.Hits.Total.Value, nil
}

// SearchJobs performs full-text search across job postings.
func (c *OpenSearchClient) SearchJobs(ctx context.Context, query string, filters map[string]interface{}, page, pageSize int) ([]*domain.Job, int64, error) {
	searchQuery := c.buildSearchQuery(query, filters, page, pageSize)

	body, err := c.doSearch(ctx, "jobs", searchQuery)
	if err != nil {
		return nil, 0, fmt.Errorf("searching jobs: %w", err)
	}

	var result opensearchResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, 0, fmt.Errorf("parsing search response: %w", err)
	}

	jobs := make([]*domain.Job, 0, len(result.Hits.Hits))
	for _, hit := range result.Hits.Hits {
		j := &domain.Job{
			ID:          getString(hit.Source, "job_id"),
			CompanyID:   getString(hit.Source, "company_id"),
			CompanyName: getString(hit.Source, "company_name"),
			Title:       getString(hit.Source, "title"),
			Description: getString(hit.Source, "description"),
			Profession:  domain.ProfessionType(getString(hit.Source, "profession")),
			Location:    getString(hit.Source, "location"),
		}
		jobs = append(jobs, j)
	}

	return jobs, result.Hits.Total.Value, nil
}

// DeletePortfolio removes a portfolio from the search index.
func (c *OpenSearchClient) DeletePortfolio(ctx context.Context, id string) error {
	return c.deleteDocument(ctx, "portfolios", id)
}

// DeleteJob removes a job from the search index.
func (c *OpenSearchClient) DeleteJob(ctx context.Context, id string) error {
	return c.deleteDocument(ctx, "jobs", id)
}

// --- Internal helpers ---

type opensearchResponse struct {
	Hits struct {
		Total struct {
			Value int64 `json:"value"`
		} `json:"total"`
		Hits []struct {
			Source map[string]interface{} `json:"_source"`
		} `json:"hits"`
	} `json:"hits"`
}

func (c *OpenSearchClient) buildSearchQuery(query string, filters map[string]interface{}, page, pageSize int) map[string]interface{} {
	must := []map[string]interface{}{}

	if query != "" {
		must = append(must, map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  query,
				"fields": []string{"title^3", "summary^2", "description^2", "skills.name^2", "tags"},
				"type":   "best_fields",
			},
		})
	}

	for key, val := range filters {
		must = append(must, map[string]interface{}{
			"term": map[string]interface{}{key: val},
		})
	}

	if len(must) == 0 {
		must = append(must, map[string]interface{}{"match_all": map[string]interface{}{}})
	}

	return map[string]interface{}{
		"from": (page - 1) * pageSize,
		"size": pageSize,
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": must,
			},
		},
		"sort": []map[string]interface{}{
			{"_score": map[string]string{"order": "desc"}},
		},
	}
}

func (c *OpenSearchClient) createIndex(ctx context.Context, name string, mapping map[string]interface{}) error {
	body, _ := json.Marshal(mapping)
	req, err := http.NewRequestWithContext(ctx, "PUT", c.baseURL+"/"+name, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// 400 is okay if index already exists
	if resp.StatusCode != 200 && resp.StatusCode != 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("create index %s failed: %s", name, string(respBody))
	}
	return nil
}

func (c *OpenSearchClient) indexDocument(ctx context.Context, index, id string, doc map[string]interface{}) error {
	body, _ := json.Marshal(doc)
	url := fmt.Sprintf("%s/%s/_doc/%s", c.baseURL, index, id)
	req, err := http.NewRequestWithContext(ctx, "PUT", url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("index document failed: %s", string(respBody))
	}
	return nil
}

func (c *OpenSearchClient) doSearch(ctx context.Context, index string, query map[string]interface{}) ([]byte, error) {
	body, _ := json.Marshal(query)
	url := fmt.Sprintf("%s/%s/_search", c.baseURL, index)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

func (c *OpenSearchClient) deleteDocument(ctx context.Context, index, id string) error {
	url := fmt.Sprintf("%s/%s/_doc/%s", c.baseURL, index, id)
	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return err
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}


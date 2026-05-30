package messaging

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/segmentio/kafka-go"

	"skillport/internal/domain"
)

// KafkaConsumerGroup manages idempotent Kafka consumers for event-driven sync.
type KafkaConsumerGroup struct {
	brokers       []string
	searchRepo    domain.SearchRepository
	vectorRepo    domain.VectorRepository
	analyticsRepo domain.AnalyticsRepository
	processedIDs  sync.Map // Simple in-memory idempotency check
	cancel        context.CancelFunc
	wg            sync.WaitGroup
}

// NewKafkaConsumerGroup creates a new consumer group with all required dependencies.
func NewKafkaConsumerGroup(
	brokers []string,
	searchRepo domain.SearchRepository,
	vectorRepo domain.VectorRepository,
	analyticsRepo domain.AnalyticsRepository,
) *KafkaConsumerGroup {
	return &KafkaConsumerGroup{
		brokers:       brokers,
		searchRepo:    searchRepo,
		vectorRepo:    vectorRepo,
		analyticsRepo: analyticsRepo,
	}
}

// Start launches all Kafka consumers as background goroutines.
func (cg *KafkaConsumerGroup) Start(ctx context.Context) {
	ctx, cg.cancel = context.WithCancel(ctx)

	// Consumer: Portfolio events → OpenSearch + Milvus sync
	cg.wg.Add(1)
	go cg.consumePortfolioEvents(ctx)

	// Consumer: Job events → OpenSearch + Milvus sync
	cg.wg.Add(1)
	go cg.consumeJobEvents(ctx)

	// Consumer: Analytics events → ClickHouse batch insert
	cg.wg.Add(1)
	go cg.consumeAnalyticsEvents(ctx)

	log.Println("[Kafka] All consumers started")
}

// Stop gracefully shuts down all consumers.
func (cg *KafkaConsumerGroup) Stop() {
	if cg.cancel != nil {
		cg.cancel()
	}
	cg.wg.Wait()
	log.Println("[Kafka] All consumers stopped")
}

// consumePortfolioEvents processes portfolio creation/update/deletion events.
func (cg *KafkaConsumerGroup) consumePortfolioEvents(ctx context.Context) {
	defer cg.wg.Done()

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        cg.brokers,
		Topic:          "skillport.portfolio.events",
		GroupID:        "skillport-portfolio-sync",
		MinBytes:       1e3,  // 1KB
		MaxBytes:       10e6, // 10MB
		CommitInterval: time.Second,
		StartOffset:    kafka.FirstOffset,
	})
	defer reader.Close()

	log.Println("[Kafka] Portfolio events consumer started")

	for {
		msg, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return // Context cancelled, graceful shutdown
			}
			log.Printf("[Kafka] Error reading portfolio event: %v", err)
			continue
		}

		cg.processPortfolioEvent(ctx, msg)
	}
}

// consumeJobEvents processes job posting events.
func (cg *KafkaConsumerGroup) consumeJobEvents(ctx context.Context) {
	defer cg.wg.Done()

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        cg.brokers,
		Topic:          "skillport.job.events",
		GroupID:        "skillport-job-sync",
		MinBytes:       1e3,
		MaxBytes:       10e6,
		CommitInterval: time.Second,
		StartOffset:    kafka.FirstOffset,
	})
	defer reader.Close()

	log.Println("[Kafka] Job events consumer started")

	for {
		msg, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("[Kafka] Error reading job event: %v", err)
			continue
		}

		cg.processJobEvent(ctx, msg)
	}
}

// consumeAnalyticsEvents processes view events and batch-inserts into ClickHouse.
func (cg *KafkaConsumerGroup) consumeAnalyticsEvents(ctx context.Context) {
	defer cg.wg.Done()

	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        cg.brokers,
		Topic:          "skillport.analytics.events",
		GroupID:        "skillport-analytics",
		MinBytes:       1e3,
		MaxBytes:       10e6,
		CommitInterval: time.Second,
		StartOffset:    kafka.FirstOffset,
	})
	defer reader.Close()

	log.Println("[Kafka] Analytics events consumer started")

	for {
		msg, err := reader.ReadMessage(ctx)
		if err != nil {
			if ctx.Err() != nil {
				return
			}
			log.Printf("[Kafka] Error reading analytics event: %v", err)
			continue
		}

		cg.processAnalyticsEvent(ctx, msg)
	}
}

// processPortfolioEvent handles a single portfolio event (idempotent).
func (cg *KafkaConsumerGroup) processPortfolioEvent(ctx context.Context, msg kafka.Message) {
	// Idempotency check
	msgKey := string(msg.Key)
	if _, loaded := cg.processedIDs.LoadOrStore(msgKey, true); loaded {
		log.Printf("[Kafka] Skipping duplicate portfolio event: %s", msgKey)
		return
	}

	var event domain.Event
	if err := json.Unmarshal(msg.Value, &event); err != nil {
		log.Printf("[Kafka] Error unmarshaling portfolio event: %v", err)
		return
	}

	switch event.Type {
	case domain.EventPortfolioCreated, domain.EventPortfolioUpdated:
		dataBytes, _ := json.Marshal(event.Data)
		var data domain.PortfolioEventData
		if err := json.Unmarshal(dataBytes, &data); err != nil {
			log.Printf("[Kafka] Error parsing portfolio event data: %v", err)
			return
		}

		// Sync to OpenSearch
		portfolio := &domain.Portfolio{
			ID:         data.PortfolioID,
			UserID:     data.UserID,
			Title:      data.Title,
			Profession: data.Profession,
			Summary:    data.Summary,
			IsPublic:   true,
		}
		if err := cg.searchRepo.IndexPortfolio(ctx, portfolio); err != nil {
			log.Printf("[Kafka] Error indexing portfolio in OpenSearch: %v", err)
			cg.processedIDs.Delete(msgKey) // Allow retry
			return
		}

		// Sync embedding to Milvus
		embedding := generateEmbedding(data.Summary + " " + data.Title)
		if err := cg.vectorRepo.UpsertPortfolioEmbedding(ctx, data.PortfolioID, embedding); err != nil {
			log.Printf("[Kafka] Error upserting portfolio embedding in Milvus: %v", err)
		}

		log.Printf("[Kafka] Synced portfolio %s to OpenSearch + Milvus", data.PortfolioID)

	case domain.EventPortfolioDeleted:
		dataBytes, _ := json.Marshal(event.Data)
		var data domain.PortfolioEventData
		if err := json.Unmarshal(dataBytes, &data); err != nil {
			log.Printf("[Kafka] Error parsing portfolio delete event: %v", err)
			return
		}

		_ = cg.searchRepo.DeletePortfolio(ctx, data.PortfolioID)
		_ = cg.vectorRepo.DeletePortfolioEmbedding(ctx, data.PortfolioID)
		log.Printf("[Kafka] Deleted portfolio %s from OpenSearch + Milvus", data.PortfolioID)
	}
}

// processJobEvent handles a single job event (idempotent).
func (cg *KafkaConsumerGroup) processJobEvent(ctx context.Context, msg kafka.Message) {
	msgKey := string(msg.Key)
	if _, loaded := cg.processedIDs.LoadOrStore(msgKey, true); loaded {
		return
	}

	var event domain.Event
	if err := json.Unmarshal(msg.Value, &event); err != nil {
		log.Printf("[Kafka] Error unmarshaling job event: %v", err)
		return
	}

	switch event.Type {
	case domain.EventJobPosted, domain.EventJobUpdated:
		dataBytes, _ := json.Marshal(event.Data)
		var data domain.JobEventData
		if err := json.Unmarshal(dataBytes, &data); err != nil {
			log.Printf("[Kafka] Error parsing job event data: %v", err)
			return
		}

		job := &domain.Job{
			ID:          data.JobID,
			CompanyID:   data.CompanyID,
			Title:       data.Title,
			Profession:  data.Profession,
			Description: data.Description,
		}
		if err := cg.searchRepo.IndexJob(ctx, job); err != nil {
			log.Printf("[Kafka] Error indexing job in OpenSearch: %v", err)
			cg.processedIDs.Delete(msgKey)
			return
		}

		embedding := generateEmbedding(data.Description + " " + data.Title)
		if err := cg.vectorRepo.UpsertJobEmbedding(ctx, data.JobID, embedding); err != nil {
			log.Printf("[Kafka] Error upserting job embedding in Milvus: %v", err)
		}

		log.Printf("[Kafka] Synced job %s to OpenSearch + Milvus", data.JobID)

	case domain.EventJobDeleted:
		dataBytes, _ := json.Marshal(event.Data)
		var data domain.JobEventData
		if err := json.Unmarshal(dataBytes, &data); err != nil {
			return
		}
		_ = cg.searchRepo.DeleteJob(ctx, data.JobID)
		_ = cg.vectorRepo.DeleteJobEmbedding(ctx, data.JobID)
	}
}

// processAnalyticsEvent handles a view event and records it in ClickHouse.
func (cg *KafkaConsumerGroup) processAnalyticsEvent(ctx context.Context, msg kafka.Message) {
	msgKey := string(msg.Key)
	if _, loaded := cg.processedIDs.LoadOrStore(msgKey, true); loaded {
		return
	}

	var event domain.Event
	if err := json.Unmarshal(msg.Value, &event); err != nil {
		log.Printf("[Kafka] Error unmarshaling analytics event: %v", err)
		return
	}

	if event.Type == domain.EventProfileViewed {
		dataBytes, _ := json.Marshal(event.Data)
		var data domain.ViewEventData
		if err := json.Unmarshal(dataBytes, &data); err != nil {
			log.Printf("[Kafka] Error parsing view event data: %v", err)
			return
		}

		viewEvent := &domain.ViewEvent{
			PortfolioID: data.PortfolioID,
			ViewerID:    data.ViewerID,
			Source:      data.Source,
			Timestamp:   event.Timestamp.UnixMilli(),
		}

		if err := cg.analyticsRepo.RecordView(ctx, viewEvent); err != nil {
			log.Printf("[Kafka] Error recording view in ClickHouse: %v", err)
			cg.processedIDs.Delete(msgKey)
		}
	}
}

// generateEmbedding creates a placeholder embedding vector.
// In production, call an ML model API.
func generateEmbedding(text string) []float32 {
	dim := 384
	embedding := make([]float32, dim)
	for i := range embedding {
		hash := 0
		for j, r := range text {
			hash += int(r) * (j + 1) * (i + 1)
		}
		embedding[i] = float32(hash%1000) / 1000.0
	}
	return embedding
}


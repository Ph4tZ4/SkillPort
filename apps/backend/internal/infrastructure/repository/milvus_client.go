package repository

import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus-sdk-go/v2/client"
	"github.com/milvus-io/milvus-sdk-go/v2/entity"

	"skillport/internal/domain"
)

const (
	portfolioCollectionName = "portfolio_embeddings"
	jobCollectionName       = "job_embeddings"
	embeddingDim            = 384 // Standard sentence-transformer dimension
)

// MilvusClient implements domain.VectorRepository using Milvus.
type MilvusClient struct {
	client client.Client
}

// NewMilvusClient creates a new Milvus client and initializes collections.
func NewMilvusClient(ctx context.Context, host string, port int) (*MilvusClient, error) {
	addr := fmt.Sprintf("%s:%d", host, port)
	c, err := client.NewClient(ctx, client.Config{Address: addr})
	if err != nil {
		return nil, fmt.Errorf("connecting to Milvus at %s: %w", addr, err)
	}

	mc := &MilvusClient{client: c}
	if err := mc.initCollections(ctx); err != nil {
		return nil, fmt.Errorf("initializing Milvus collections: %w", err)
	}

	return mc, nil
}

// initCollections creates portfolio and job embedding collections if they don't exist.
func (mc *MilvusClient) initCollections(ctx context.Context) error {
	for _, colName := range []string{portfolioCollectionName, jobCollectionName} {
		exists, err := mc.client.HasCollection(ctx, colName)
		if err != nil {
			return fmt.Errorf("checking collection %s: %w", colName, err)
		}
		if exists {
			continue
		}

		schema := &entity.Schema{
			CollectionName: colName,
			Description:    fmt.Sprintf("SkillPort %s embeddings", colName),
			AutoID:         false,
			Fields: []*entity.Field{
				{
					Name:       "id",
					DataType:   entity.FieldTypeVarChar,
					PrimaryKey: true,
					TypeParams: map[string]string{"max_length": "64"},
				},
				{
					Name:     "embedding",
					DataType: entity.FieldTypeFloatVector,
					TypeParams: map[string]string{
						"dim": fmt.Sprintf("%d", embeddingDim),
					},
				},
			},
		}

		if err := mc.client.CreateCollection(ctx, schema, entity.DefaultShardNumber); err != nil {
			return fmt.Errorf("creating collection %s: %w", colName, err)
		}

		// Create IVF_FLAT index for ANN search
		idx, err := entity.NewIndexIvfFlat(entity.L2, 128)
		if err != nil {
			return fmt.Errorf("creating index for %s: %w", colName, err)
		}
		if err := mc.client.CreateIndex(ctx, colName, "embedding", idx, false); err != nil {
			return fmt.Errorf("creating index on %s: %w", colName, err)
		}

		// Load collection into memory
		if err := mc.client.LoadCollection(ctx, colName, false); err != nil {
			return fmt.Errorf("loading collection %s: %w", colName, err)
		}

		log.Printf("Milvus collection %s initialized", colName)
	}
	return nil
}

// UpsertPortfolioEmbedding stores or updates the embedding for a portfolio.
func (mc *MilvusClient) UpsertPortfolioEmbedding(ctx context.Context, portfolioID string, embedding []float32) error {
	return mc.upsertEmbedding(ctx, portfolioCollectionName, portfolioID, embedding)
}

// UpsertJobEmbedding stores or updates the embedding for a job.
func (mc *MilvusClient) UpsertJobEmbedding(ctx context.Context, jobID string, embedding []float32) error {
	return mc.upsertEmbedding(ctx, jobCollectionName, jobID, embedding)
}

// SearchSimilarPortfolios finds portfolios with similar embeddings.
func (mc *MilvusClient) SearchSimilarPortfolios(ctx context.Context, embedding []float32, topK int) ([]domain.VectorMatch, error) {
	return mc.searchSimilar(ctx, portfolioCollectionName, embedding, topK)
}

// SearchSimilarJobs finds jobs with similar embeddings.
func (mc *MilvusClient) SearchSimilarJobs(ctx context.Context, embedding []float32, topK int) ([]domain.VectorMatch, error) {
	return mc.searchSimilar(ctx, jobCollectionName, embedding, topK)
}

// DeletePortfolioEmbedding removes a portfolio embedding.
func (mc *MilvusClient) DeletePortfolioEmbedding(ctx context.Context, portfolioID string) error {
	return mc.deleteEmbedding(ctx, portfolioCollectionName, portfolioID)
}

// DeleteJobEmbedding removes a job embedding.
func (mc *MilvusClient) DeleteJobEmbedding(ctx context.Context, jobID string) error {
	return mc.deleteEmbedding(ctx, jobCollectionName, jobID)
}

// Close disconnects from Milvus.
func (mc *MilvusClient) Close() error {
	return mc.client.Close()
}

// --- Internal helpers ---

func (mc *MilvusClient) upsertEmbedding(ctx context.Context, collection, id string, embedding []float32) error {
	// Delete existing if present (upsert pattern)
	_ = mc.deleteEmbedding(ctx, collection, id)

	ids := []string{id}
	embeddings := [][]float32{embedding}

	idCol := entity.NewColumnVarChar("id", ids)
	embCol := entity.NewColumnFloatVector("embedding", embeddingDim, embeddings)

	_, err := mc.client.Insert(ctx, collection, "", idCol, embCol)
	if err != nil {
		return fmt.Errorf("inserting embedding into %s: %w", collection, err)
	}

	// Flush to make data searchable
	if err := mc.client.Flush(ctx, collection, false); err != nil {
		return fmt.Errorf("flushing %s: %w", collection, err)
	}

	return nil
}

func (mc *MilvusClient) searchSimilar(ctx context.Context, collection string, embedding []float32, topK int) ([]domain.VectorMatch, error) {
	vectors := []entity.Vector{entity.FloatVector(embedding)}

	sp, err := entity.NewIndexIvfFlatSearchParam(16)
	if err != nil {
		return nil, fmt.Errorf("creating search params: %w", err)
	}

	results, err := mc.client.Search(
		ctx,
		collection,
		nil,            // partitions
		"",             // expression
		[]string{"id"}, // output fields
		vectors,
		"embedding",
		entity.L2,
		topK,
		sp,
	)
	if err != nil {
		return nil, fmt.Errorf("searching %s: %w", collection, err)
	}

	var matches []domain.VectorMatch
	for _, result := range results {
		idCol, ok := result.Fields.GetColumn("id").(*entity.ColumnVarChar)
		if !ok {
			continue
		}

		for i := 0; i < result.ResultCount; i++ {
			id, _ := idCol.ValueByIdx(i)
			score := result.Scores[i]

			// Convert L2 distance to similarity score (0-1 range)
			similarity := 1.0 / (1.0 + score)

			matches = append(matches, domain.VectorMatch{
				ID:       id,
				Score:    float32(similarity),
				Distance: score,
			})
		}
	}

	return matches, nil
}

func (mc *MilvusClient) deleteEmbedding(ctx context.Context, collection, id string) error {
	expr := fmt.Sprintf(`id == "%s"`, id)
	if err := mc.client.Delete(ctx, collection, "", expr); err != nil {
		return fmt.Errorf("deleting from %s: %w", collection, err)
	}
	return nil
}

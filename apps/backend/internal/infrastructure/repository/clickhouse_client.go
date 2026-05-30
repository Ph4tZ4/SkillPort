package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"

	"skillport/internal/domain"
)

// ClickHouseClient implements domain.AnalyticsRepository using ClickHouse.
type ClickHouseClient struct {
	conn driver.Conn
}

// NewClickHouseClient creates a new ClickHouse client and initializes tables.
func NewClickHouseClient(ctx context.Context, host string, port int, database, user, password string) (*ClickHouseClient, error) {
	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{fmt.Sprintf("%s:%d", host, port)},
		Auth: clickhouse.Auth{
			Database: database,
			Username: user,
			Password: password,
		},
		Settings: clickhouse.Settings{
			"max_execution_time": 60,
		},
		DialTimeout:  30 * time.Second,
		MaxOpenConns: 10,
		MaxIdleConns: 5,
	})
	if err != nil {
		return nil, fmt.Errorf("connecting to ClickHouse: %w", err)
	}

	if err := conn.Ping(ctx); err != nil {
		return nil, fmt.Errorf("pinging ClickHouse: %w", err)
	}

	client := &ClickHouseClient{conn: conn}
	if err := client.initTables(ctx); err != nil {
		return nil, fmt.Errorf("initializing ClickHouse tables: %w", err)
	}

	return client, nil
}

// initTables creates the analytics tables if they don't exist.
func (c *ClickHouseClient) initTables(ctx context.Context) error {
	// Portfolio view events table
	err := c.conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS portfolio_views (
			portfolio_id String,
			viewer_id    String,
			source       String,
			timestamp    DateTime64(3),
			event_date   Date DEFAULT toDate(timestamp)
		) ENGINE = MergeTree()
		PARTITION BY toYYYYMM(event_date)
		ORDER BY (portfolio_id, timestamp)
	`)
	if err != nil {
		return fmt.Errorf("creating portfolio_views table: %w", err)
	}

	// Aggregated stats materialized view
	err = c.conn.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS portfolio_stats_daily (
			portfolio_id String,
			event_date   Date,
			total_views  UInt64,
			unique_views UInt64
		) ENGINE = SummingMergeTree()
		ORDER BY (portfolio_id, event_date)
	`)
	if err != nil {
		return fmt.Errorf("creating portfolio_stats_daily table: %w", err)
	}

	return nil
}

// RecordView records a portfolio view event.
// NOTE: In production, this should be called via Kafka batch consumer, not direct insert.
func (c *ClickHouseClient) RecordView(ctx context.Context, event *domain.ViewEvent) error {
	err := c.conn.Exec(ctx,
		"INSERT INTO portfolio_views (portfolio_id, viewer_id, source, timestamp) VALUES (?, ?, ?, ?)",
		event.PortfolioID,
		event.ViewerID,
		event.Source,
		time.Unix(0, event.Timestamp*int64(time.Millisecond)),
	)
	if err != nil {
		return fmt.Errorf("recording view event: %w", err)
	}
	return nil
}

// BatchRecordViews inserts multiple view events in a single batch.
func (c *ClickHouseClient) BatchRecordViews(ctx context.Context, events []*domain.ViewEvent) error {
	batch, err := c.conn.PrepareBatch(ctx, "INSERT INTO portfolio_views (portfolio_id, viewer_id, source, timestamp)")
	if err != nil {
		return fmt.Errorf("preparing batch: %w", err)
	}

	for _, event := range events {
		err := batch.Append(
			event.PortfolioID,
			event.ViewerID,
			event.Source,
			time.Unix(0, event.Timestamp*int64(time.Millisecond)),
		)
		if err != nil {
			return fmt.Errorf("appending to batch: %w", err)
		}
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("sending batch: %w", err)
	}
	return nil
}

// GetPortfolioStats retrieves aggregated statistics for a portfolio.
func (c *ClickHouseClient) GetPortfolioStats(ctx context.Context, portfolioID string) (*domain.PortfolioStats, error) {
	// Total and unique views
	var totalViews, uniqueViews uint64
	err := c.conn.QueryRow(ctx, `
		SELECT 
			count() as total_views,
			uniq(viewer_id) as unique_views
		FROM portfolio_views
		WHERE portfolio_id = ?
	`, portfolioID).Scan(&totalViews, &uniqueViews)
	if err != nil {
		return nil, fmt.Errorf("querying portfolio stats: %w", err)
	}

	// Views by day (last 30 days)
	viewsByDay := make(map[string]int)
	rows, err := c.conn.Query(ctx, `
		SELECT 
			toDate(timestamp) as day,
			count() as views
		FROM portfolio_views
		WHERE portfolio_id = ? AND timestamp >= now() - INTERVAL 30 DAY
		GROUP BY day
		ORDER BY day
	`, portfolioID)
	if err != nil {
		return nil, fmt.Errorf("querying views by day: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var day time.Time
		var views uint64
		if err := rows.Scan(&day, &views); err != nil {
			return nil, fmt.Errorf("scanning views by day: %w", err)
		}
		viewsByDay[day.Format("2006-01-02")] = int(views)
	}

	// Top sources
	topSources := make(map[string]int)
	sourceRows, err := c.conn.Query(ctx, `
		SELECT source, count() as cnt
		FROM portfolio_views
		WHERE portfolio_id = ?
		GROUP BY source
		ORDER BY cnt DESC
		LIMIT 5
	`, portfolioID)
	if err != nil {
		return nil, fmt.Errorf("querying top sources: %w", err)
	}
	defer sourceRows.Close()

	for sourceRows.Next() {
		var source string
		var cnt uint64
		if err := sourceRows.Scan(&source, &cnt); err != nil {
			return nil, fmt.Errorf("scanning top sources: %w", err)
		}
		topSources[source] = int(cnt)
	}

	return &domain.PortfolioStats{
		PortfolioID: portfolioID,
		TotalViews:  int64(totalViews),
		UniqueViews: int64(uniqueViews),
		ViewsByDay:  viewsByDay,
		TopSources:  topSources,
	}, nil
}

// GetUserStats retrieves aggregated statistics for a user.
func (c *ClickHouseClient) GetUserStats(ctx context.Context, userID string) (*domain.UserStats, error) {
	// This would join with a user-portfolio mapping; simplified for now
	return &domain.UserStats{
		UserID:       userID,
		TotalViews:   0,
		TotalMatches: 0,
		ProfileScore: 0,
	}, nil
}

// Close disconnects from ClickHouse.
func (c *ClickHouseClient) Close() error {
	return c.conn.Close()
}

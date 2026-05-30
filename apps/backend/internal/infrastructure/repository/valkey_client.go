package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"skillport/internal/domain"
)

// ValkeyClient implements domain.CacheRepository using Valkey (Redis-compatible).
type ValkeyClient struct {
	client *redis.Client
}

// NewValkeyClient creates a new Valkey client connection.
func NewValkeyClient(host string, port int) (*ValkeyClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%d", host, port),
		DB:           0,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     20,
		MinIdleConns: 5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("connecting to Valkey: %w", err)
	}

	return &ValkeyClient{client: client}, nil
}

// Set stores a value with an expiration time.
func (vc *ValkeyClient) Set(ctx context.Context, key string, value interface{}, ttlSeconds int) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("marshaling cache value: %w", err)
	}

	expiration := time.Duration(ttlSeconds) * time.Second
	if err := vc.client.Set(ctx, key, data, expiration).Err(); err != nil {
		return fmt.Errorf("setting cache key %s: %w", key, err)
	}
	return nil
}

// Get retrieves a cached value, deserializing into dest.
func (vc *ValkeyClient) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := vc.client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return domain.ErrNotFound
		}
		return fmt.Errorf("getting cache key %s: %w", key, err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("unmarshaling cache value: %w", err)
	}
	return nil
}

// Delete removes a cached value.
func (vc *ValkeyClient) Delete(ctx context.Context, key string) error {
	if err := vc.client.Del(ctx, key).Err(); err != nil {
		return fmt.Errorf("deleting cache key %s: %w", key, err)
	}
	return nil
}

// Increment atomically increments a counter and returns the new value.
func (vc *ValkeyClient) Increment(ctx context.Context, key string, ttlSeconds int) (int64, error) {
	pipe := vc.client.Pipeline()
	incr := pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, time.Duration(ttlSeconds)*time.Second)

	_, err := pipe.Exec(ctx)
	if err != nil {
		return 0, fmt.Errorf("incrementing cache key %s: %w", key, err)
	}

	return incr.Val(), nil
}

// SetSession stores a session with TTL (convenience wrapper for auth).
func (vc *ValkeyClient) SetSession(ctx context.Context, sessionID string, userID string, ttlSeconds int) error {
	return vc.Set(ctx, "session:"+sessionID, map[string]string{"user_id": userID}, ttlSeconds)
}

// GetSession retrieves a session user ID.
func (vc *ValkeyClient) GetSession(ctx context.Context, sessionID string) (string, error) {
	var data map[string]string
	if err := vc.Get(ctx, "session:"+sessionID, &data); err != nil {
		return "", err
	}
	return data["user_id"], nil
}

// CheckRateLimit checks if a key has exceeded the rate limit.
func (vc *ValkeyClient) CheckRateLimit(ctx context.Context, key string, maxRequests int, windowSeconds int) (bool, error) {
	count, err := vc.Increment(ctx, "ratelimit:"+key, windowSeconds)
	if err != nil {
		return false, err
	}
	return count > int64(maxRequests), nil
}

// Close disconnects from Valkey.
func (vc *ValkeyClient) Close() error {
	return vc.client.Close()
}

package config

import (
	"fmt"
	"os"
	"strconv"
)

// Config holds all application configuration, loaded from environment variables.
type Config struct {
	App        AppConfig
	MongoDB    MongoConfig
	ClickHouse ClickHouseConfig
	OpenSearch OpenSearchConfig
	Milvus     MilvusConfig
	Kafka      KafkaConfig
	RabbitMQ   RabbitMQConfig
	Valkey     ValkeyConfig
}

// AppConfig holds application-level settings.
type AppConfig struct {
	Env            string
	Host           string
	Port           int
	JWTSecret      string
	JWTExpiryHours int
}

// MongoConfig holds MongoDB connection settings.
type MongoConfig struct {
	User     string
	Password string
	Host     string
	Port     int
	Database string
}

// URI returns the MongoDB connection URI.
func (c MongoConfig) URI() string {
	return fmt.Sprintf("mongodb://%s:%s@%s:%d/?authSource=admin", c.User, c.Password, c.Host, c.Port)
}

// ClickHouseConfig holds ClickHouse connection settings.
type ClickHouseConfig struct {
	User     string
	Password string
	Host     string
	Port     int
	Database string
}

// OpenSearchConfig holds OpenSearch connection settings.
type OpenSearchConfig struct {
	Host string
	Port int
}

// MilvusConfig holds Milvus connection settings.
type MilvusConfig struct {
	Host string
	Port int
}

// KafkaConfig holds Kafka connection settings.
type KafkaConfig struct {
	Brokers []string
}

// RabbitMQConfig holds RabbitMQ connection settings.
type RabbitMQConfig struct {
	User     string
	Password string
	Host     string
	Port     int
}

// ValkeyConfig holds Valkey/Redis connection settings.
type ValkeyConfig struct {
	Host string
	Port int
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	return &Config{
		App: AppConfig{
			Env:            getEnv("APP_ENV", "development"),
			Host:           getEnv("APP_HOST", "0.0.0.0"),
			Port:           getEnvInt("APP_PORT", 8080),
			JWTSecret:      getEnv("JWT_SECRET", "dev-secret-change-in-production"),
			JWTExpiryHours: getEnvInt("JWT_EXPIRY_HOURS", 24),
		},
		MongoDB: MongoConfig{
			User:     getEnv("MONGO_USER", "skillport"),
			Password: getEnv("MONGO_PASSWORD", "skillport_secret"),
			Host:     getEnv("MONGO_HOST", "localhost"),
			Port:     getEnvInt("MONGO_PORT", 27018),
			Database: getEnv("MONGO_DATABASE", "skillport"),
		},
		ClickHouse: ClickHouseConfig{
			User:     getEnv("CLICKHOUSE_USER", "skillport"),
			Password: getEnv("CLICKHOUSE_PASSWORD", "skillport_secret"),
			Host:     getEnv("CLICKHOUSE_HOST", "localhost"),
			Port:     getEnvInt("CLICKHOUSE_PORT", 9000),
			Database: getEnv("CLICKHOUSE_DATABASE", "skillport_analytics"),
		},
		OpenSearch: OpenSearchConfig{
			Host: getEnv("OPENSEARCH_HOST", "localhost"),
			Port: getEnvInt("OPENSEARCH_PORT", 9200),
		},
		Milvus: MilvusConfig{
			Host: getEnv("MILVUS_HOST", "localhost"),
			Port: getEnvInt("MILVUS_PORT", 19530),
		},
		Kafka: KafkaConfig{
			Brokers: []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
		},
		RabbitMQ: RabbitMQConfig{
			User:     getEnv("RABBITMQ_USER", "skillport"),
			Password: getEnv("RABBITMQ_PASSWORD", "skillport_secret"),
			Host:     getEnv("RABBITMQ_HOST", "localhost"),
			Port:     getEnvInt("RABBITMQ_PORT", 5672),
		},
		Valkey: ValkeyConfig{
			Host: getEnv("VALKEY_HOST", "localhost"),
			Port: getEnvInt("VALKEY_PORT", 6379),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	v := os.Getenv(key)
	if v == "" {
		return defaultValue
	}
	n, err := strconv.Atoi(v)
	if err != nil {
		return defaultValue
	}
	return n
}

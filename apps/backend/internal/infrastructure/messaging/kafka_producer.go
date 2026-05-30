package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"

	"skillport/internal/domain"
)

// KafkaProducer implements domain.EventPublisher using Apache Kafka.
type KafkaProducer struct {
	writers map[string]*kafka.Writer
	brokers []string
}

// NewKafkaProducer creates a new Kafka producer with writers for each topic.
func NewKafkaProducer(brokers []string) *KafkaProducer {
	writers := make(map[string]*kafka.Writer)

	// Pre-create writers for known topics
	topics := []string{
		"skillport.portfolio.events",
		"skillport.job.events",
		"skillport.analytics.events",
		"skillport.match.events",
		"skillport.user.events",
	}

	for _, topic := range topics {
		writers[topic] = &kafka.Writer{
			Addr:         kafka.TCP(brokers...),
			Topic:        topic,
			Balancer:     &kafka.LeastBytes{},
			BatchTimeout: 10 * time.Millisecond,
			RequiredAcks: kafka.RequireOne,
			Async:        false,
		}
	}

	return &KafkaProducer{
		writers: writers,
		brokers: brokers,
	}
}

// Publish sends a domain event to the appropriate Kafka topic.
func (kp *KafkaProducer) Publish(ctx context.Context, event *domain.Event) error {
	topic, ok := domain.KafkaTopic[event.Type]
	if !ok {
		return fmt.Errorf("unknown event type: %s", event.Type)
	}

	writer, ok := kp.writers[topic]
	if !ok {
		return fmt.Errorf("no writer for topic: %s", topic)
	}

	value, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("marshaling event: %w", err)
	}

	msg := kafka.Message{
		Key:   []byte(event.ID),
		Value: value,
		Headers: []kafka.Header{
			{Key: "event_type", Value: []byte(string(event.Type))},
			{Key: "source", Value: []byte(event.Source)},
			{Key: "timestamp", Value: []byte(event.Timestamp.Format(time.RFC3339))},
		},
	}

	if err := writer.WriteMessages(ctx, msg); err != nil {
		return fmt.Errorf("publishing event to %s: %w", topic, err)
	}

	log.Printf("[Kafka] Published event %s to %s", event.Type, topic)
	return nil
}

// Close gracefully shuts down all Kafka writers.
func (kp *KafkaProducer) Close() error {
	var lastErr error
	for topic, writer := range kp.writers {
		if err := writer.Close(); err != nil {
			log.Printf("[Kafka] Error closing writer for %s: %v", topic, err)
			lastErr = err
		}
	}
	return lastErr
}

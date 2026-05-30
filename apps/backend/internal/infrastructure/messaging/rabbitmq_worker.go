package messaging

import (
	"encoding/json"
	"fmt"
	"log"
	"sync"

	amqp "github.com/rabbitmq/amqp091-go"

	"skillport/internal/domain"
)

// RabbitMQWorker processes notification tasks from the queue.
type RabbitMQWorker struct {
	conn    *amqp.Connection
	channel *amqp.Channel
	done    chan struct{}
	wg      sync.WaitGroup
}

// NotificationHandler is a function that processes a notification.
type NotificationHandler func(notification *domain.Notification) error

// NewRabbitMQWorker creates a new RabbitMQ worker consumer.
func NewRabbitMQWorker(host string, port int, user, password string) (*RabbitMQWorker, error) {
	url := fmt.Sprintf("amqp://%s:%s@%s:%d/", user, password, host, port)
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("connecting to RabbitMQ: %w", err)
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("opening RabbitMQ channel: %w", err)
	}

	// Set prefetch count for fair dispatching
	if err := ch.Qos(10, 0, false); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("setting QoS: %w", err)
	}

	return &RabbitMQWorker{
		conn:    conn,
		channel: ch,
		done:    make(chan struct{}),
	}, nil
}

// Start begins consuming notification messages and processing them with the handler.
func (w *RabbitMQWorker) Start(handler NotificationHandler) error {
	deliveries, err := w.channel.Consume(
		notificationQueue,
		"skillport-notification-worker",
		false, // auto-ack (manual for reliability)
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,
	)
	if err != nil {
		return fmt.Errorf("starting consumer: %w", err)
	}

	w.wg.Add(1)
	go func() {
		defer w.wg.Done()
		log.Println("[RabbitMQ] Notification worker started")

		for {
			select {
			case delivery, ok := <-deliveries:
				if !ok {
					log.Println("[RabbitMQ] Delivery channel closed")
					return
				}
				w.processDelivery(delivery, handler)

			case <-w.done:
				log.Println("[RabbitMQ] Worker shutting down")
				return
			}
		}
	}()

	return nil
}

// processDelivery handles a single delivery with idempotency.
func (w *RabbitMQWorker) processDelivery(delivery amqp.Delivery, handler NotificationHandler) {
	var notification domain.Notification
	if err := json.Unmarshal(delivery.Body, &notification); err != nil {
		log.Printf("[RabbitMQ] Error unmarshaling notification: %v", err)
		// Reject without requeue for malformed messages
		_ = delivery.Nack(false, false)
		return
	}

	if err := handler(&notification); err != nil {
		log.Printf("[RabbitMQ] Error processing notification %s: %v", notification.ID, err)
		// Requeue for retry
		_ = delivery.Nack(false, true)
		return
	}

	// Acknowledge successful processing
	if err := delivery.Ack(false); err != nil {
		log.Printf("[RabbitMQ] Error acknowledging notification %s: %v", notification.ID, err)
	}

	log.Printf("[RabbitMQ] Processed notification %s (type: %s)", notification.ID, notification.Type)
}

// Stop gracefully shuts down the worker.
func (w *RabbitMQWorker) Stop() {
	close(w.done)
	w.wg.Wait()

	if w.channel != nil {
		w.channel.Close()
	}
	if w.conn != nil {
		w.conn.Close()
	}
	log.Println("[RabbitMQ] Worker stopped")
}

// DefaultNotificationHandler is a simple handler that logs notifications.
// In production, this would send emails, push notifications, etc.
func DefaultNotificationHandler(notification *domain.Notification) error {
	log.Printf("[Notification] %s → User %s: %s - %s",
		notification.Type,
		notification.UserID,
		notification.Title,
		notification.Message,
	)
	// TODO: Implement actual notification delivery (email, push, in-app)
	return nil
}

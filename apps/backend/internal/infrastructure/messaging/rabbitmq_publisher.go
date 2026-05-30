package messaging

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"

	"skillport/internal/domain"
)

const (
	notificationExchange = "skillport.notifications"
	notificationQueue    = "skillport.notification.queue"
	notificationRouting  = "notification.send"
)

// RabbitMQPublisher implements domain.NotificationPublisher.
type RabbitMQPublisher struct {
	conn    *amqp.Connection
	channel *amqp.Channel
}

// NewRabbitMQPublisher creates a new RabbitMQ publisher and sets up the exchange/queue.
func NewRabbitMQPublisher(host string, port int, user, password string) (*RabbitMQPublisher, error) {
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

	// Declare exchange
	if err := ch.ExchangeDeclare(
		notificationExchange,
		"direct",
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,
	); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("declaring exchange: %w", err)
	}

	// Declare queue
	q, err := ch.QueueDeclare(
		notificationQueue,
		true,  // durable
		false, // auto-delete
		false, // exclusive
		false, // no-wait
		amqp.Table{
			"x-message-ttl": int32(86400000), // 24h TTL
		},
	)
	if err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("declaring queue: %w", err)
	}

	// Bind queue to exchange
	if err := ch.QueueBind(q.Name, notificationRouting, notificationExchange, false, nil); err != nil {
		ch.Close()
		conn.Close()
		return nil, fmt.Errorf("binding queue: %w", err)
	}

	log.Printf("[RabbitMQ] Publisher initialized (exchange: %s, queue: %s)", notificationExchange, notificationQueue)

	return &RabbitMQPublisher{conn: conn, channel: ch}, nil
}

// PublishNotification sends a notification task to the queue.
func (p *RabbitMQPublisher) PublishNotification(ctx context.Context, notification *domain.Notification) error {
	body, err := json.Marshal(notification)
	if err != nil {
		return fmt.Errorf("marshaling notification: %w", err)
	}

	err = p.channel.PublishWithContext(ctx,
		notificationExchange,
		notificationRouting,
		false, // mandatory
		false, // immediate
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			Timestamp:    time.Now(),
			MessageId:    notification.ID,
			Body:         body,
		},
	)
	if err != nil {
		return fmt.Errorf("publishing notification: %w", err)
	}

	log.Printf("[RabbitMQ] Published notification %s (type: %s, user: %s)", notification.ID, notification.Type, notification.UserID)
	return nil
}

// Close gracefully shuts down the publisher.
func (p *RabbitMQPublisher) Close() error {
	if p.channel != nil {
		p.channel.Close()
	}
	if p.conn != nil {
		p.conn.Close()
	}
	return nil
}

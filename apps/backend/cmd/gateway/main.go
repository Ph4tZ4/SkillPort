package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"skillport/internal/infrastructure/config"
	"skillport/internal/infrastructure/messaging"
	"skillport/internal/infrastructure/repository"
	"skillport/internal/infrastructure/transport"
	"skillport/internal/usecase"
)

func main() {
	log.Println("🚀 SkillPort API Gateway starting...")

	// Load configuration
	cfg := config.Load()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ─────────────────────────────────────────────
	// Initialize MongoDB
	// ─────────────────────────────────────────────
	log.Println("Connecting to MongoDB...")
	mongoClient, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoDB.URI()))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect(ctx)

	if err := mongoClient.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	log.Println("✅ MongoDB connected")

	mongoDB := mongoClient.Database(cfg.MongoDB.Database)

	// Initialize MongoDB repositories
	userRepo, err := repository.NewMongoUserRepository(mongoDB)
	if err != nil {
		log.Fatalf("Failed to initialize user repository: %v", err)
	}

	portfolioRepo, err := repository.NewMongoPortfolioRepository(mongoDB)
	if err != nil {
		log.Fatalf("Failed to initialize portfolio repository: %v", err)
	}

	jobRepo, err := repository.NewMongoJobRepository(mongoDB)
	if err != nil {
		log.Fatalf("Failed to initialize job repository: %v", err)
	}

	// ─────────────────────────────────────────────
	// Initialize Valkey (Cache)
	// ─────────────────────────────────────────────
	log.Println("Connecting to Valkey...")
	valkeyClient, err := repository.NewValkeyClient(cfg.Valkey.Host, cfg.Valkey.Port)
	if err != nil {
		log.Printf("⚠️  Valkey connection failed (cache disabled): %v", err)
		// Continue without cache — use a no-op implementation
	} else {
		log.Println("✅ Valkey connected")
		defer valkeyClient.Close()
	}

	// ─────────────────────────────────────────────
	// Initialize OpenSearch
	// ─────────────────────────────────────────────
	log.Println("Connecting to OpenSearch...")
	openSearchClient := repository.NewOpenSearchClient(cfg.OpenSearch.Host, cfg.OpenSearch.Port)
	if err := openSearchClient.InitIndexes(ctx); err != nil {
		log.Printf("⚠️  OpenSearch index init failed (search degraded): %v", err)
	} else {
		log.Println("✅ OpenSearch connected and indexes initialized")
	}

	// ─────────────────────────────────────────────
	// Initialize Milvus
	// ─────────────────────────────────────────────
	log.Println("Connecting to Milvus...")
	milvusClient, err := repository.NewMilvusClient(ctx, cfg.Milvus.Host, cfg.Milvus.Port)
	if err != nil {
		log.Printf("⚠️  Milvus connection failed (vector search disabled): %v", err)
	} else {
		log.Println("✅ Milvus connected and collections initialized")
		defer milvusClient.Close()
	}

	// ─────────────────────────────────────────────
	// Initialize ClickHouse
	// ─────────────────────────────────────────────
	log.Println("Connecting to ClickHouse...")
	clickhouseClient, err := repository.NewClickHouseClient(
		ctx, cfg.ClickHouse.Host, cfg.ClickHouse.Port,
		cfg.ClickHouse.Database, cfg.ClickHouse.User, cfg.ClickHouse.Password,
	)
	if err != nil {
		log.Printf("⚠️  ClickHouse connection failed (analytics disabled): %v", err)
	} else {
		log.Println("✅ ClickHouse connected and tables initialized")
		defer clickhouseClient.Close()
	}

	// ─────────────────────────────────────────────
	// Initialize Kafka Producer
	// ─────────────────────────────────────────────
	log.Println("Initializing Kafka producer...")
	kafkaProducer := messaging.NewKafkaProducer(cfg.Kafka.Brokers)
	defer kafkaProducer.Close()
	log.Println("✅ Kafka producer initialized")

	// ─────────────────────────────────────────────
	// Initialize RabbitMQ
	// ─────────────────────────────────────────────
	log.Println("Connecting to RabbitMQ...")
	rabbitPublisher, err := messaging.NewRabbitMQPublisher(
		cfg.RabbitMQ.Host, cfg.RabbitMQ.Port,
		cfg.RabbitMQ.User, cfg.RabbitMQ.Password,
	)
	if err != nil {
		log.Printf("⚠️  RabbitMQ connection failed (notifications disabled): %v", err)
	} else {
		log.Println("✅ RabbitMQ publisher connected")
		defer rabbitPublisher.Close()
	}

	// Start RabbitMQ worker
	rabbitWorker, err := messaging.NewRabbitMQWorker(
		cfg.RabbitMQ.Host, cfg.RabbitMQ.Port,
		cfg.RabbitMQ.User, cfg.RabbitMQ.Password,
	)
	if err != nil {
		log.Printf("⚠️  RabbitMQ worker init failed: %v", err)
	} else {
		if err := rabbitWorker.Start(messaging.DefaultNotificationHandler); err != nil {
			log.Printf("⚠️  RabbitMQ worker start failed: %v", err)
		} else {
			defer rabbitWorker.Stop()
		}
	}

	// ─────────────────────────────────────────────
	// Initialize Kafka Consumers
	// ─────────────────────────────────────────────
	log.Println("Starting Kafka consumers...")
	kafkaConsumers := messaging.NewKafkaConsumerGroup(
		cfg.Kafka.Brokers,
		openSearchClient,
		milvusClient,
		clickhouseClient,
	)
	kafkaConsumers.Start(ctx)
	defer kafkaConsumers.Stop()
	log.Println("✅ Kafka consumers started")

	// ─────────────────────────────────────────────
	// Wire Use Cases
	// ─────────────────────────────────────────────
	userUC := usecase.NewUserUseCase(
		userRepo, valkeyClient, kafkaProducer,
		cfg.App.JWTSecret, cfg.App.JWTExpiryHours,
	)

	portfolioUC := usecase.NewPortfolioUseCase(
		portfolioRepo, valkeyClient, kafkaProducer, rabbitPublisher,
	)

	jobUC := usecase.NewJobUseCase(
		jobRepo, valkeyClient, kafkaProducer,
	)

	searchUC := usecase.NewSearchUseCase(
		openSearchClient, valkeyClient,
	)

	matchUC := usecase.NewMatchUseCase(
		portfolioRepo, jobRepo,
		openSearchClient, milvusClient,
		kafkaProducer, rabbitPublisher,
	)

	// ─────────────────────────────────────────────
	// Setup HTTP Router
	// ─────────────────────────────────────────────
	authMW := transport.NewAuthMiddleware(userUC.ValidateToken)
	router := transport.NewRouter(userUC, portfolioUC, jobUC, searchUC, matchUC, authMW)

	// ─────────────────────────────────────────────
	// Start Server with Graceful Shutdown
	// ─────────────────────────────────────────────
	addr := fmt.Sprintf("%s:%d", cfg.App.Host, cfg.App.Port)

	go func() {
		if err := transport.StartServer(addr, router.Handler()); err != nil {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	log.Printf("🌐 SkillPort API Gateway running at http://%s", addr)
	log.Println("📡 API docs: http://" + addr + "/api/v1/health")

	// Wait for shutdown signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down gracefully...")
	cancel()

	// Give goroutines time to clean up
	time.Sleep(2 * time.Second)
	log.Println("👋 SkillPort API Gateway stopped")
}

AI Agent Configuration & Project Context (AGENTS.md)

1. Product Vision & Scope

• Project Name: SkillPort

• Vision: A highly scalable, Universal Skill & Portfolio Matching Platform designed for all professions (e.g., Tech, Creative, Marketing, Administration). It replaces traditional static resumes with dynamic, role-specific presentation cards (e.g., live demos/source code for developers, media players for musicians, image galleries for photographers, business metrics for marketers).

• Core Value: Uses advanced semantic vector matching and full-text search to seamlessly bridge the gap between multi-disciplinary talents and enterprise recruitment.

2. Finalized Tech Stack & Dependencies

AI Agents must strictly adhere to this technical stack. Do not introduce alternative libraries without explicit permission.

• Frontend Framework: React Native (Cross-Platform Monorepo targeting Mobile and Web)

• Frontend Tooling: Vite (Development Server & Web Bundling), Vitest (Component & Logic Testing)

• Frontend Styling: Tailwind CSS

• Backend Language: Golang (Go 1.22+)

• Primary Database (OLTP): MongoDB (For multi-profile polymorphic schemas, user metadata, and application state)

• Analytics Database (OLAP): ClickHouse (For high-throughput logging, portfolio view tracking, and user analytics)

• Search Engine: OpenSearch (For complex full-text filters, skill tokenization, and multi-field keyword queries)

• Vector Database: Milvus (For storing and executing similarity searches on candidate and job description embeddings)

• Event Streaming & Messaging: * Apache Kafka (High-throughput core event backbone: portfolio updates, analytics tracking)

	• RabbitMQ (Task queue management: notification delivery, low-latency background jobs)

• In-Memory Cache & Session: Valkey (Open-source key-value store for session caching and API throttling)

• Infrastructure & Orchestration: Kubernetes (K8s), Containerd, Rancher, Prometheus, Grafana

3. System Architecture & Data Flow

SkillPort utilizes an Event-Driven Architecture combined with Clean/Hexagonal Architecture on the backend.

[text]
[ Frontend: React Native (Web/Mobile) ]
               │ (HTTP / gRPC)
               ▼
   [ Backend API Gateway (Go) ]
               │
      (Publish Core Events)
               ▼
       [ Apache Kafka ] ──► [ ClickHouse (OLAP Analytics) ]
               │        ──► [ Milvus (Vector Search Synchronization) ]
               │        ──► [ OpenSearch (Full-Text Sync) ]
     (Background Tasks)
               ▼
        [ RabbitMQ ]    ──► [ Notification Service / Worker ]


Architectural Rules for AI:

1. Data Consistency: Writes must land in MongoDB first. An event must then be produced to Apache Kafka to asynchronously sync state down to OpenSearch and Milvus.

2. Idempotency: All event consumers (Kafka & RabbitMQ) MUST be fully idempotent. Processing the same message multiple times must not corrupt data states.

3. Analytics Ingestion: Do not write single-row inserts directly to ClickHouse. Stream events via Kafka and use batch ingestion or a Kafka-Engine table.

4. Monorepo Directory Structure

The repository is structured as a Monorepo to manage frontend variants and backend microservices efficiently.

[text]
.
├── apps/
│   ├── frontend/                 # React Native source code (Web & Mobile targets)
│   │   ├── src/
│   │   │   ├── components/       # Atomic/Re-usable UI components
│   │   │   ├── screens/          # Layout and view definitions
│   │   │   ├── store/            # Global state management (Zustand)
│   │   │   └── utils/
│   │   ├── vite.config.ts        # Web bundling configuration
│   │   └── package.json
│   │
│   └── backend/                  # Golang Microservices Architecture
│       ├── cmd/
│       │   └── gateway/main.go   # Main entrypoint for API Gateway
│       └── internal/
│           ├── domain/           # Pure enterprise business models & interfaces
│           ├── usecase/          # Application-specific business rules
│           └── infrastructure/   # Drivers, DB clients, repositories, and handlers
│               ├── repository/   # Mongo, ClickHouse, OpenSearch, Milvus drivers
│               ├── messaging/    # Kafka producers/consumers, RabbitMQ setup
│               └── transport/    # HTTP controllers or gRPC handlers
│
├── packages/                     # Shared configurations across packages
│   └── ts-config/
├── AGENTS.md                     # This instructions and context file
└── docker-compose.yml            # Local development environment infrastructure


5. Coding Conventions & Quality Standards

Golang Standards:

• Separation of Concerns: Keep domain free of external dependencies (no database driver tags, no framework models).

• Error Handling: Explicitly handle all errors (if err != nil). Wrap errors using fmt.Errorf("context: %w", err) to preserve stacks.

• Context Propagation: Every database, network, and broker interaction must receive and respect context.Context for timeout and cancellation signals.

• Concurrency: Prevent race conditions by isolating state or using synchronized channels; never mutate shared variables across goroutines without adequate locking mechanisms.

React Native & Frontend Standards:

• UI Components: Use functional components written in TypeScript. Use Tailwind CSS for rapid styling layouts.

• State Isolation: Maintain view-state local. Elevate complex global configurations strictly to Zustand stores.

• Performance: Memoize expensive calculations with useMemo and functions with useCallback when passing across re-rendered bounds.

6. Build, Run, and Test Instructions

Infrastructure Setup (Local Dev)

[bash]
# Spin up local development databases, caches, and brokers
docker-compose up -d


Backend Commands (Go)

[bash]
# Run the API Gateway locally
cd apps/backend && go run cmd/gateway/main.go

# Run all backend unit tests
go test ./... -v


Frontend Commands (React Native + Vite)

[bash]
# Start local development server for web
cd apps/frontend && npm run dev

# Execute component and utility testing
npm run test


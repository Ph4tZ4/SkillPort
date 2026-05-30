# SkillPort 🚀

A highly scalable, **Universal Skill & Portfolio Matching Platform** designed for professionals across all industries (Tech, Creative, Marketing, Administration, and more). SkillPort replaces traditional static resumes with dynamic, role-specific presentation cards and utilizes advanced AI semantic search to seamlessly bridge the gap between multi-disciplinary talents and enterprise recruitment.

---

## 🌟 Key Features

- **Dynamic Portfolios**: Role-specific presentations (e.g., live demos for developers, media players for musicians, image galleries for designers).
- **AI-Powered Matching**: Advanced semantic vector matching and full-text search to find the perfect candidate or job.
- **Cross-Platform**: Built as a React Native monorepo targeting both Web and Mobile platforms seamlessly.
- **Enterprise-Grade Architecture**: High-throughput Event-Driven Architecture paired with Golang microservices.
- **Real-Time Analytics**: High-performance tracking of portfolio views and user engagement.

---

## 🛠 Tech Stack

SkillPort leverages a modern, highly scalable stack optimized for performance and AI capabilities:

### Frontend
- **Framework**: React Native (targeting Web & Mobile)
- **Tooling**: Vite (Development & Bundling), Vitest (Testing)
- **Styling**: Tailwind CSS & Lucide Icons
- **State Management**: Zustand

### Backend
- **Language**: Golang (Go 1.22+)
- **Architecture**: Clean / Hexagonal Architecture + Event-Driven Microservices
- **Databases & Brokers**:
  - **MongoDB** (Primary OLTP): For polymorphic schemas and user metadata.
  - **ClickHouse** (OLAP): For high-throughput analytics and logging.
  - **Milvus** (Vector Database): For AI similarity searches and embeddings.
  - **OpenSearch** (Search Engine): For full-text filters and keyword queries.
  - **Apache Kafka**: High-throughput core event backbone (Event Sourcing).
  - **RabbitMQ**: Task queue management and background jobs.
  - **Valkey** (Redis Alternative): In-memory cache and session management.

---

## 📂 Repository Structure (Monorepo)

```text
.
├── apps/
│   ├── frontend/                 # React Native source code (Web & Mobile)
│   │   ├── src/
│   │   │   ├── components/       # Reusable UI components
│   │   │   ├── screens/          # Layouts and page views
│   │   │   ├── store/            # Global state management
│   │   │   └── utils/            # Helpers and API clients
│   │   └── vite.config.ts        
│   │
│   └── backend/                  # Golang Microservices
│       ├── cmd/
│       │   └── gateway/main.go   # API Gateway Entrypoint
│       └── internal/
│           ├── domain/           # Enterprise business models & interfaces
│           ├── usecase/          # Application business rules
│           └── infrastructure/   # Drivers, Repositories, Kafka/RabbitMQ messaging
│
├── packages/                     # Shared configurations
│   └── ts-config/
├── docker-compose.yml            # Local development infrastructure setup
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+)
- Go (1.22+)

### 1. Start the Infrastructure
Spin up all required databases, message brokers, and caches locally:
```bash
docker-compose up -d
```
> *Note: MongoDB is mapped to port `27018` locally to prevent conflicts. Use `mongodb://skillport:skillport_secret@localhost:27018/?authSource=admin` to connect via MongoDB Compass.*

### 2. Run the Backend (API Gateway)
```bash
cd apps/backend
go run cmd/gateway/main.go
```
*The backend API will be available at `http://localhost:8080`.*

### 3. Run the Frontend (Web)
In a new terminal window:
```bash
cd apps/frontend
npm install
npm run dev
```
*The web app will be available at `http://localhost:5173`.*

---

## 🧪 Testing

**Backend (Go):**
```bash
cd apps/backend
go test ./... -v
```

**Frontend (React/Vitest):**
```bash
cd apps/frontend
npm run test
```

---

## 🤝 Contribution Guidelines
When contributing to SkillPort, please adhere to the architectural guidelines outlined in the `AGENTS.md` file. Ensure that data consistency rules are followed (MongoDB -> Kafka -> Downstream Sync) and that UI components maintain the premium, professional design aesthetic.

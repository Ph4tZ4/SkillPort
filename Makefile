# ============================================================
# SkillPort — Makefile
# ============================================================

.PHONY: help infra-up infra-down infra-logs backend-run backend-test frontend-dev frontend-build frontend-test test-all clean

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Infrastructure ---
infra-up: ## Start all infrastructure services
	docker-compose up -d

infra-down: ## Stop all infrastructure services
	docker-compose down

infra-logs: ## Tail infrastructure logs
	docker-compose logs -f

infra-reset: ## Stop services and remove volumes (WARNING: deletes data)
	docker-compose down -v

# --- Backend ---
backend-run: ## Run the API Gateway locally
	cd apps/backend && go run cmd/gateway/main.go

backend-test: ## Run all backend unit tests
	cd apps/backend && go test ./... -v

backend-build: ## Build the backend binary
	cd apps/backend && go build -o bin/gateway cmd/gateway/main.go

backend-lint: ## Lint Go code
	cd apps/backend && go vet ./...

# --- Frontend ---
frontend-dev: ## Start frontend dev server
	cd apps/frontend && npm run dev

frontend-build: ## Build frontend for production
	cd apps/frontend && npm run build

frontend-test: ## Run frontend tests
	cd apps/frontend && npm run test

frontend-install: ## Install frontend dependencies
	cd apps/frontend && npm install

# --- All ---
test-all: backend-test frontend-test ## Run all tests

clean: ## Clean build artifacts
	rm -rf apps/backend/bin
	rm -rf apps/frontend/dist
	rm -rf apps/frontend/node_modules

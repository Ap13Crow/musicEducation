# ============================================================
# MusicEdu Platform — Makefile
# ============================================================

.DEFAULT_GOAL := help

# ── Docker Compose ───────────────────────────────────────────

.PHONY: up
up: ## Start the full stack
	docker compose up -d --build

.PHONY: down
down: ## Stop all services and remove containers
	docker compose down

.PHONY: down-v
down-v: ## Stop all services and remove containers + volumes
	docker compose down -v

.PHONY: logs
logs: ## Tail logs for all services (Ctrl-C to stop)
	docker compose logs -f

.PHONY: logs-api
logs-api: ## Tail API logs only
	docker compose logs -f api

.PHONY: logs-pretix
logs-pretix: ## Tail pretix logs only
	docker compose logs -f pretix

.PHONY: ps
ps: ## Show running services
	docker compose ps

# ── Database ─────────────────────────────────────────────────

.PHONY: migrate
migrate: ## Run Prisma migrations on the main database
	npm run db:migrate

.PHONY: seed
seed: ## Seed the database with sample data
	npm run db:seed 2>/dev/null || echo "No seed script configured yet"

.PHONY: studio
studio: ## Open Prisma Studio
	npm run db:studio

# ── Keycloak ─────────────────────────────────────────────────

.PHONY: realm-import
realm-import: ## Re-import the Keycloak realm (restarts Keycloak)
	docker compose restart keycloak

.PHONY: realm-export
realm-export: ## Export the current Keycloak realm config
	docker compose exec keycloak /opt/keycloak/bin/kc.sh export \
	  --dir /opt/keycloak/data/export --realm musicedu

# ── Development ──────────────────────────────────────────────

.PHONY: dev
dev: ## Start local dev servers (hot-reload, no Docker)
	npm run dev

.PHONY: build
build: ## Build all packages
	npm run build

.PHONY: lint
lint: ## Lint all packages
	npm run lint

.PHONY: test
test: ## Run all tests
	npm run test

.PHONY: install
install: ## Install all dependencies
	npm install

# ── Local DNS ────────────────────────────────────────────────

.PHONY: hosts
hosts: ## Print /etc/hosts entries needed for local development
	@echo ""
	@echo "Add these lines to /etc/hosts:"
	@echo ""
	@echo "127.0.0.1  app.musicedu.test"
	@echo "127.0.0.1  api.musicedu.test"
	@echo "127.0.0.1  auth.musicedu.test"
	@echo "127.0.0.1  learn.musicedu.test"
	@echo "127.0.0.1  booking.musicedu.test"
	@echo "127.0.0.1  tickets.musicedu.test"
	@echo ""

# ── Utilities ────────────────────────────────────────────────

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf apps/api/dist apps/web/.next node_modules/.cache .turbo

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

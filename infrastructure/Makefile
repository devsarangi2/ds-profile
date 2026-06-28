SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE_BASE := docker compose -f docker-compose.yml
COMPOSE_DEV  := $(COMPOSE_BASE) -f docker-compose.dev.yml
COMPOSE_PROD := $(COMPOSE_BASE) -f docker-compose.prod.yml

.PHONY: help dev prod stop logs status clean ps

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Infrastructure — Make targets"
	@echo "══════════════════════════════════════════════════"
	@echo ""
	@echo "  dev           Start all services in dev mode (hot reload)"
	@echo "  prod          Start all services in prod mode"
	@echo "  stop          Stop all services"
	@echo "  logs          Tail logs from all services"
	@echo "  status        Show container health / uptime"
	@echo "  ps            Show running containers"
	@echo "  clean         Stop + remove volumes (WARNING: data loss)"
	@echo ""
	@echo "Ports:"
	@echo "  Frontend:         http://localhost:13000 (prod) / http://localhost:15173 (dev)"
	@echo "  Backend API:      http://localhost:18000"
	@echo "  API Docs:         http://localhost:18000/docs"
	@echo "  PostgreSQL:       localhost:15432"
	@echo "  MinIO API:        http://localhost:19000"
	@echo "  MinIO Console:    http://localhost:19001"
	@echo "  Parser:           http://localhost:18001"
	@echo ""

# ─── Dev ──────────────────────────────────────────────────────────────────────

dev:
	$(COMPOSE_DEV) up --build -d

# ─── Prod ─────────────────────────────────────────────────────────────────────

prod:
	$(COMPOSE_PROD) up --build -d

# ─── Stop ─────────────────────────────────────────────────────────────────────

stop:
	-$(COMPOSE_DEV) down --remove-orphans 2>/dev/null || true
	-$(COMPOSE_BASE) down --remove-orphans 2>/dev/null || true

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs:
	$(COMPOSE_BASE) logs -f

# ─── Status ───────────────────────────────────────────────────────────────────

status:
	$(COMPOSE_BASE) ps

# ─── PS ───────────────────────────────────────────────────────────────────────

ps:
	@docker ps --filter "name=dsp-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ─── Clean ────────────────────────────────────────────────────────────────────

clean: stop
	$(COMPOSE_BASE) down -v --remove-orphans 2>/dev/null || true
	docker rmi dsp-api:latest dsp-api:dev dsp-frontend:latest dsp-frontend:dev 2>/dev/null || true

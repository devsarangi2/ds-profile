SHELL := /bin/bash
.DEFAULT_GOAL := help

# Port reference (project-specific, avoid collisions with other dsapps projects)
FRONTEND_PORT     := 13000
FRONTEND_DEV_PORT := 15173
BACKEND_PORT      := 18000
DB_PORT           := 15432
STORAGE_PORT      := 19000
STORAGE_CONSOLE   := 19001
PARSER_PORT       := 18001

COMPOSE_BASE := docker compose -f infrastructure/docker-compose.yml
COMPOSE_DEV  := $(COMPOSE_BASE) -f infrastructure/docker-compose.dev.yml
COMPOSE_PROD := $(COMPOSE_BASE) -f infrastructure/docker-compose.prod.yml

.PHONY: help install dev dev-local stop build clean clean-all test lint status logs \
        open open-api open-storage restart

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "ds-profile — Development Commands"
	@echo "══════════════════════════════════════════════════════════════"
	@echo ""
	@echo "Getting started:"
	@echo "  install       Install all dependencies (frontend + backend)"
	@echo "  dev           Start full stack in Docker (hot reload)"
	@echo "  dev-local     Start backend + frontend locally (no Docker)"
	@echo "  stop          Stop all Docker services"
	@echo ""
	@echo "Build & Test:"
	@echo "  build         Build production Docker images"
	@echo "  test          Run all tests (frontend + backend)"
	@echo "  lint          Run all linters"
	@echo ""
	@echo "Ops:"
	@echo "  status        Show service health"
	@echo "  logs          Tail all service logs"
	@echo "  restart       Stop + start dev services"
	@echo "  clean         Remove build artifacts"
	@echo "  clean-all     Remove everything including Docker volumes"
	@echo ""
	@echo "Open in browser:"
	@echo "  open          Open frontend (dev)  → http://localhost:$(FRONTEND_DEV_PORT)"
	@echo "  open-api      Open API docs        → http://localhost:$(BACKEND_PORT)/docs"
	@echo "  open-storage  Open MinIO console   → http://localhost:$(STORAGE_CONSOLE)"
	@echo ""
	@echo "Service Ports:"
	@echo "  Frontend (dev):     http://localhost:$(FRONTEND_DEV_PORT)"
	@echo "  Frontend (prod):    http://localhost:$(FRONTEND_PORT)"
	@echo "  Backend API:        http://localhost:$(BACKEND_PORT)"
	@echo "  API Docs:           http://localhost:$(BACKEND_PORT)/docs"
	@echo "  PostgreSQL:         localhost:$(DB_PORT)"
	@echo "  MinIO API:          http://localhost:$(STORAGE_PORT)"
	@echo "  MinIO Console:      http://localhost:$(STORAGE_CONSOLE)"
	@echo "  Parser:             http://localhost:$(PARSER_PORT)"
	@echo ""

# ─── Install ──────────────────────────────────────────────────────────────────

install:
	$(MAKE) -C frontend install
	$(MAKE) -C backend install

# ─── Dev (Docker) ─────────────────────────────────────────────────────────────

dev:
	$(COMPOSE_DEV) up --build -d
	@echo ""
	@echo "Services started:"
	@echo "  Frontend (dev):  http://localhost:$(FRONTEND_DEV_PORT)"
	@echo "  Backend API:     http://localhost:$(BACKEND_PORT)"
	@echo "  API Docs:        http://localhost:$(BACKEND_PORT)/docs"
	@echo ""
	@echo "Run 'make logs' to tail logs, 'make stop' to shut down."

# ─── Dev (Local — no Docker) ──────────────────────────────────────────────────

dev-local:
	@echo "Starting backend and frontend locally..."
	@$(MAKE) -C backend dev &
	@$(MAKE) -C frontend dev

# ─── Build ────────────────────────────────────────────────────────────────────

build:
	$(COMPOSE_PROD) build

# ─── Stop ─────────────────────────────────────────────────────────────────────

stop:
	$(MAKE) -C infrastructure stop

# ─── Restart ──────────────────────────────────────────────────────────────────

restart: stop dev

# ─── Test ─────────────────────────────────────────────────────────────────────

test:
	$(MAKE) -C backend test
	$(MAKE) -C frontend test

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint:
	$(MAKE) -C backend lint
	$(MAKE) -C frontend lint

# ─── Status ───────────────────────────────────────────────────────────────────

status:
	@./status.sh

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs:
	$(COMPOSE_DEV) logs -f

# ─── Open in Browser ──────────────────────────────────────────────────────────

open:
	@open http://localhost:$(FRONTEND_DEV_PORT) 2>/dev/null || \
	 xdg-open http://localhost:$(FRONTEND_DEV_PORT) 2>/dev/null || true

open-api:
	@open http://localhost:$(BACKEND_PORT)/docs 2>/dev/null || \
	 xdg-open http://localhost:$(BACKEND_PORT)/docs 2>/dev/null || true

open-storage:
	@open http://localhost:$(STORAGE_CONSOLE) 2>/dev/null || \
	 xdg-open http://localhost:$(STORAGE_CONSOLE) 2>/dev/null || true

# ─── Clean ────────────────────────────────────────────────────────────────────

clean:
	$(MAKE) -C frontend clean
	$(MAKE) -C backend clean

clean-all: stop
	$(MAKE) -C infrastructure clean
	$(MAKE) -C frontend clean
	$(MAKE) -C backend clean

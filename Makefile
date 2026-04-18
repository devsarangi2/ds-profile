# Makefile — ds-profile
# Personal portfolio static site (Astro + Tailwind → GitHub Pages)
#
# Ports:
#   Dev (local npm):       http://localhost:4321
#   Dev (Docker):          http://localhost:14321
#   Preview (Nginx/prod):  http://localhost:14322
SHELL := /bin/bash

IMAGE_NAME  := dsp-site
DEV_PORT    := 14321
PREVIEW_PORT := 14322

.PHONY: help install dev dev-docker preview stop build build-local \
        clean lint status logs open

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "ds-profile — Make targets"
	@echo "══════════════════════════════════════════════════"
	@echo ""
	@echo "Development:"
	@echo "  install       Install npm dependencies"
	@echo "  dev           Start Astro dev server locally (port 4321)"
	@echo "  dev-docker    Start Astro dev server in Docker (port $(DEV_PORT))"
	@echo "  open          Open dev server in browser"
	@echo ""
	@echo "Production preview:"
	@echo "  build         Build production Docker image (Nginx)"
	@echo "  build-local   Build static site locally (dist/)"
	@echo "  preview       Build + serve production bundle in Docker (port $(PREVIEW_PORT))"
	@echo "  stop          Stop all Docker containers + free ports"
	@echo ""
	@echo "Maintenance:"
	@echo "  lint          Run astro check (TypeScript + type validation)"
	@echo "  clean         Remove dist/, .astro/, node_modules"
	@echo "  status        Show container statuses"
	@echo "  logs          Tail Docker container logs"
	@echo ""

# ─── Install ──────────────────────────────────────────────────────────────────

install:
	npm install

# ─── Development ──────────────────────────────────────────────────────────────

dev: _free-dev-port
	npm run dev

dev-docker: stop
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build --watch

open:
	@open http://localhost:4321 2>/dev/null || xdg-open http://localhost:4321 2>/dev/null || true

# ─── Production Preview ───────────────────────────────────────────────────────

build:
	docker build -t $(IMAGE_NAME):latest .

build-local:
	npm run build

preview: stop build
	docker compose -f docker-compose.yml up -d
	@echo ""
	@echo "Preview running at http://localhost:$(PREVIEW_PORT)"
	@echo "Run 'make stop' to shut it down."

# ─── Stop / Port Management ───────────────────────────────────────────────────

stop: _free-preview-port _free-dev-docker-port
	-docker compose -f docker-compose.yml -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
	-docker compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true

_free-dev-port:
	@pid=$$(lsof -ti :4321 2>/dev/null); \
	if [ -n "$$pid" ]; then \
		echo "Killing process on port 4321 (pid $$pid)..."; \
		kill -9 $$pid 2>/dev/null || true; \
	fi

_free-dev-docker-port:
	@pid=$$(lsof -ti :$(DEV_PORT) 2>/dev/null); \
	if [ -n "$$pid" ]; then \
		echo "Killing process on port $(DEV_PORT) (pid $$pid)..."; \
		kill -9 $$pid 2>/dev/null || true; \
	fi

_free-preview-port:
	@pid=$$(lsof -ti :$(PREVIEW_PORT) 2>/dev/null); \
	if [ -n "$$pid" ]; then \
		echo "Killing process on port $(PREVIEW_PORT) (pid $$pid)..."; \
		kill -9 $$pid 2>/dev/null || true; \
	fi

# ─── Maintenance ──────────────────────────────────────────────────────────────

lint:
	npx astro check

clean: stop
	rm -rf dist/ .astro/ node_modules/
	docker rmi $(IMAGE_NAME):latest $(IMAGE_NAME):dev 2>/dev/null || true

status:
	@./status.sh

logs:
	-docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f 2>/dev/null || \
	 docker compose -f docker-compose.yml logs -f 2>/dev/null || true

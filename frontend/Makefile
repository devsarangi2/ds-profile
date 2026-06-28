SHELL := /bin/bash
.DEFAULT_GOAL := help

.PHONY: help install dev build test lint clean

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Frontend — Make targets"
	@echo "══════════════════════════════════════════════════"
	@echo ""
	@echo "  install       Install npm dependencies"
	@echo "  dev           Start Vite dev server (port 15173)"
	@echo "  build         Build production bundle"
	@echo "  test          Run Vitest"
	@echo "  lint          Run ESLint + TypeScript check"
	@echo "  clean         Remove dist/, node_modules/"
	@echo ""

# ─── Install ──────────────────────────────────────────────────────────────────

install:
	npm install

# ─── Dev ──────────────────────────────────────────────────────────────────────

dev: install
	npm run dev -- --host --port 15173

# ─── Build ────────────────────────────────────────────────────────────────────

build: install
	npm run build

# ─── Test ─────────────────────────────────────────────────────────────────────

test: install
	npm run test 2>/dev/null || npx vitest run

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: install
	npm run lint 2>/dev/null || npx eslint src/ && npx tsc --noEmit

# ─── Clean ────────────────────────────────────────────────────────────────────

clean:
	rm -rf dist/ node_modules/ .vite/

SHELL := /bin/bash
.DEFAULT_GOAL := help

VENV    := .venv
PYTHON  := $(VENV)/bin/python
PIP     := $(VENV)/bin/pip

.PHONY: help install dev test lint clean

# ─── Help ─────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "Backend — Make targets"
	@echo "══════════════════════════════════════════════════"
	@echo ""
	@echo "  install       Create venv + install dependencies"
	@echo "  dev           Start FastAPI dev server with hot reload (port 18000)"
	@echo "  test          Run pytest"
	@echo "  lint          Run ruff check + format check"
	@echo "  clean         Remove .venv and __pycache__"
	@echo ""

# ─── Install ──────────────────────────────────────────────────────────────────

install: $(VENV)/bin/activate
	$(PIP) install -r requirements.txt

$(VENV)/bin/activate:
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip

# ─── Dev ──────────────────────────────────────────────────────────────────────

dev: install
	$(VENV)/bin/uvicorn app.main:app --host 0.0.0.0 --port 18000 --reload

# ─── Test ─────────────────────────────────────────────────────────────────────

test: install
	$(VENV)/bin/pytest tests/ -v

# ─── Lint ─────────────────────────────────────────────────────────────────────

lint: install
	$(VENV)/bin/ruff check app/ tests/
	$(VENV)/bin/ruff format --check app/ tests/

# ─── Clean ────────────────────────────────────────────────────────────────────

clean:
	rm -rf $(VENV) __pycache__ app/__pycache__ .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

# ds-profile

A full-stack profile management app. Think LinkedIn profile but yours — private dashboard for managing employment history, projects, skills, and certifications, with AI-assisted editing and resume variant generation.

## Features

- **Private dashboard** — Inline-edit all profile fields (Notion-style)
- **Improve with AI** — One-click LLM rewriting for descriptions and impact statements
- **PDF Import** — Upload your CV, Unstructured.io parses it, LLM extracts data, diff view, merge
- **Resume Variants** — Paste a job description, AI tailors your master profile, stores only the deltas
- **Public profile** — Read-only profile at `/`

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui |
| Backend | FastAPI + SQLAlchemy 2.0 + Alembic + LiteLLM |
| Database | PostgreSQL 16 |
| Storage | MinIO (dev) / Supabase Storage (prod) |
| PDF Parsing | Unstructured.io self-hosted (dev) / Cloud (prod) |
| AI | LM Studio (default) / OpenRouter / Anthropic / Gemini |
| Testing | pytest + Playwright |

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env: set AUTH_DISABLED=true for local dev

# 2. Start infrastructure
docker compose up -d db storage

# 3. Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 4. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/dashboard`.

## Optional: PDF Parsing

```bash
docker compose up -d parser
```

## Running Tests

```bash
# Backend unit tests
cd backend && pytest tests/unit/ -v

# Frontend Playwright
cd frontend && npx playwright test
```

## AI Configuration

Visit `/dashboard/settings` to configure your AI provider:
- **LM Studio** (default, free, local GPU at `http://100.82.183.76:8080/v1`)
- **OpenRouter** — requires API key
- **Anthropic** — requires API key
- **Google Gemini** — requires API key

## Environment

See `.env.example` for all configuration options. Critical variables:

| Variable | Dev | Prod |
|---|---|---|
| `AUTH_DISABLED` | `true` | `false` |
| `DATABASE_URL` | postgres://localhost | Supabase connection string |
| `STORAGE_BACKEND` | `minio` | `supabase` |
| `UNSTRUCTURED_BACKEND` | `local` | `cloud` |

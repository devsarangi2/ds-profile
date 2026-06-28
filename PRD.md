# ds-profile — Product Requirements Document

## Objective
Replace the Astro static site with a full-stack, data-driven profile management app. LinkedIn profile but better — private dashboard to manage master records (employment, projects, skills, certifications) with AI-assisted editing, PDF import, and resume variant generation.

## Status: Implementation Complete (2026-06-27)

## Core Principles
- Single-user now, multi-user ready (user_id on every table)
- Master record + variants (variants store only deltas, render at read time)
- AI assists, human decides (every AI suggestion is a diff the user accepts/rejects)
- Zero prod cost (free tiers across all services)

## Architecture
Dual-mode app: public-facing Astro profile (static, deployed to GitHub Pages) replaced by a Vite+React SPA that serves both the public profile and a private dashboard. The dashboard is gated by auth (dev passthrough, Supabase JWT in prod). All data is served from a FastAPI backend with a PostgreSQL database.

## Tech Stack
- **Frontend**: Vite + React 18, TypeScript, TailwindCSS, TanStack Query, React Router v6, Axios
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2 async, Alembic migrations, Pydantic v2, LiteLLM
- **Database**: PostgreSQL 16 (local via Docker, Supabase in prod)
- **Storage**: MinIO (local via Docker, Supabase Storage in prod)
- **PDF Parsing**: Unstructured.io (self-hosted Docker in dev, Cloud API in prod)
- **AI**: LiteLLM router — LM Studio (local), OpenRouter, Anthropic, Gemini (via DB settings)
- **Auth**: Dev passthrough (AUTH_DISABLED=true), Supabase JWT (prod)
- **Infra**: Docker Compose for local, GitHub Actions for deploy

## Implemented Features

### Phase 1: Infrastructure
- ✓ Clean Astro, scaffold Vite+React frontend
- ✓ Docker Compose: postgres, minio, unstructured, api, frontend
- ✓ .env config with AUTH_DISABLED dev mode

### Phase 2: API (FastAPI)
- ✓ Profile CRUD
- ✓ Employment CRUD
- ✓ Projects CRUD (with freeform roles)
- ✓ Skills + Certifications CRUD
- ✓ File uploads (images 5 MB, PDFs 20 MB)
- ✓ LiteLLM AI service (settings read from DB, never cached)
- ✓ POST /ai/improve endpoint
- ✓ POST /imports/pdf (Unstructured parsing + LLM extraction)
- ✓ Variants CRUD + AI generation endpoint
- ✓ Settings API (provider, model, encrypted key)

### Phase 3: Frontend
- ✓ Public profile: cover/avatar hero, timeline, skills, certs
- ✓ Dashboard with collapsible sidebar
- ✓ Employment list + inline-edit detail
- ✓ Projects list + inline-edit detail (roles + tech stack)
- ✓ Skills manager (grouped by category)
- ✓ PDF import wizard (3-step: upload → parse → review)
- ✓ Resume variants (AI-assisted creation with diff view)
- ✓ Settings: provider selector, model picker, API key

## Security Posture

### Checks In Place
- **SQL Injection**: All queries via SQLAlchemy ORM (select/insert/update through model classes). No raw `text()` calls in application code — only in Alembic migrations for `server_default=now()` (safe, no user input).
- **File Upload Validation**: MIME type checked against allowlist (`image/jpeg`, `image/png`, `image/webp`, `image/gif` for images; `application/pdf` only for documents and imports). Size limits enforced (5 MB images, 20 MB PDFs).
- **Path Traversal**: MinIO storage keys are UUID-based (`uploads/<uuid4><ext>`). No user-supplied filename touches the filesystem. Filename sanitized in parser_service before being passed to Unstructured API.
- **CORS**: Only `http://localhost:5173` and `http://localhost:3000` allowed. No wildcard.
- **Auth Default Safe**: `auth_disabled` defaults to `False` in code — must be explicitly set `AUTH_DISABLED=true` in .env for dev. Prod deployments without the flag are safe.
- **API Key Not Exposed**: `GET /settings` returns `has_api_key: bool` only — the raw key is never returned. `SettingsResponse` schema has no `ai_api_key` field.
- **Sensitive Data in .gitignore**: `.env`, `.env.local`, `.env.*.local`, `.env.production` all excluded.

### Known Limitations (Document, Not Fixed in MVP)
- **API key plaintext in dev**: `ai_api_key_encrypted` column is stored as-is for MVP. Production must replace `_decrypt_key()` in `ai_service.py` with real Fernet encryption.
- **Prompt injection**: User-controlled text (resume content, job descriptions) is passed to the LLM. No sanitization guardrails. Acceptable for single-user local dev; add output validation for multi-user.
- **SSRF via MinIO endpoint**: `STORAGE_ENDPOINT` and `UNSTRUCTURED_BASE_URL` are set from env. An attacker who controls .env could redirect requests. Acceptable for single-user local setup; use fixed prod URLs in deployment config.
- **LM Studio URL user-controlled**: Users can set an arbitrary URL as the LM Studio base URL via the Settings page. Requests are made server-side. Low risk for single-user; add URL allowlisting for multi-user.
- **No rate limiting**: No rate limiting on AI or upload endpoints. Add in prod via API gateway or FastAPI middleware.
- **No prod auth**: Supabase JWT verification is stubbed with `501 Not Implemented`. Must be wired before prod deployment.
- **Merge-into-master from PDF import**: Stub (alert placeholder) — not implemented.

## Key Decisions
- **No Astro**: Replaced with Vite+React SPA for better full-stack control and shared component model.
- **Employment types**: full-time, part-time, contract, freelance, self-employed, open-source, personal (no "consulting" as a separate type).
- **Project roles**: Freeform strings, not an enum — allows arbitrary role descriptions.
- **Variants**: Delta overrides only; master record rendered at read time. Variants store `job_description_text` for reference.
- **Unstructured.io**: Self-hosted Docker in dev (`UNSTRUCTURED_BACKEND=local`), Cloud API in prod.
- **LM Studio default**: `qwen/qwen-3.5-9b` on RTX 2070 8 GB VRAM at `http://100.82.183.76:8080/v1` — overridable via Settings page.
- **Settings not cached**: AI provider/model/key always read from DB per request. Changing settings takes effect immediately.
- **`has_api_key` pattern**: GET /settings never returns the key value — only a boolean. Frontend uses this to show "Saved" indicator without exposing the secret.

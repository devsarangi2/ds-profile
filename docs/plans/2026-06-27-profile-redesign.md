# Profile Redesign — Design Document
**Date:** 2026-06-27
**Branch:** feature/profile-redesign

---

## Objective

Replace the Astro static site with a full-stack, data-driven profile management app. Think LinkedIn profile but better — a private dashboard to manage master records (employment, projects, skills, certifications) backed by Postgres, with AI-assisted description editing, PDF document import, and resume variant generation tailored to specific job descriptions.

---

## Core Principles

- **Single-user now, multi-user ready** — `user_id` on every table, auth optional in dev
- **Master record + variants** — one source of truth, variants store only deltas
- **AI assists, human decides** — every AI suggestion is a diff the user accepts or rejects
- **Zero prod cost** — free tiers across all services for personal use

---

## Architecture

### Dual Mode
- **Private dashboard** (`/dashboard/*`) — authenticated, full CRUD, inline editing, AI tools
- **Public profile** (`/`) — read-only, no auth required, rendered from master record

### System Diagram
```
Browser
  ├── Public Profile  →  FastAPI  →  Supabase Postgres
  └── Dashboard       →  FastAPI  →  Supabase Postgres
                              ├──  Supabase Storage (images, files)
                              ├──  Unstructured.io (PDF parsing)
                              └──  AI Provider (OpenRouter / Anthropic / Gemini / LM Studio)
```

---

## Tech Stack

| Layer | Dev | Prod |
|---|---|---|
| Frontend | Vite + React + Tailwind + shadcn/ui | Vercel (free) |
| Backend | FastAPI (Docker) | Fly.io / Railway (free) |
| PDF Parsing | Unstructured self-hosted (Docker) | Unstructured Cloud API (free tier) |
| Database | Docker Postgres | Supabase Postgres (free) |
| File Storage | MinIO (Docker) | Supabase Storage (free) |
| Auth | Disabled (dev) | Supabase Auth (prod) |
| AI default | OpenRouter — claude-sonnet-4-6 | OpenRouter / Anthropic / Gemini / LM Studio |

**Total prod cost: $0** on free tiers.

---

## Local Dev Stack (docker-compose)

```
services:
  frontend    — Vite dev server (port 5173)
  api         — FastAPI (port 8000)
  parser      — Unstructured self-hosted (port 8001)
  db          — Postgres 16 (port 5432)
  storage     — MinIO S3-compatible (port 9000)
```

Prod switches:
- `UNSTRUCTURED_BASE_URL=http://parser:8001` → `UNSTRUCTURED_API_KEY=...`
- `DATABASE_URL=postgresql://localhost/...` → Supabase connection string
- `STORAGE_ENDPOINT=http://minio:9000` → Supabase Storage S3 endpoint
- `AUTH_DISABLED=true` → `false` + Supabase JWT verification

---

## Data Model

### `profiles`
```sql
id, user_id, name, headline, summary, location,
avatar_url, cover_url, email, website, linkedin_url,
created_at, updated_at
```

### `employment`
```sql
id, user_id, profile_id,
company, company_logo_url,
job_title,              -- official title at org (e.g. "Principal Consultant")
employment_type,        -- full-time | part-time | contract | freelance | self-employed | open-source | personal
location, remote (bool),
start_date, end_date, current (bool),
description
```

### `projects`
```sql
id, employment_id, user_id,
name, description,
status,                 -- active | completed | archived
start_date, end_date,
location, remote (bool),
url, repo_url, impact,
tech_stack[]            -- text array
```

### `project_roles`
```sql
id, project_id,
name                    -- freeform (e.g. "Enterprise Architect", "Team Lead", "SME")
```

### `skills`
```sql
id, user_id, name, category
```

### `project_skills` (join)
```sql
project_id, skill_id
```

### `employment_skills` (join)
```sql
employment_id, skill_id
```

### `certifications`
```sql
id, user_id,
name, issuer, date, url, badge_url
```

### `variants`
```sql
id, user_id, profile_id,
name,                   -- e.g. "principal-consultant-accenture"
base (bool),            -- true = master variant
job_description_text,
target_company,
target_role,
created_at, updated_at
```

### `variant_overrides`
```sql
id, variant_id,
entity_type,            -- employment | project | summary
entity_id,              -- FK to original record
field,                  -- e.g. "description", "impact"
original_value,
overridden_value
```

### `media`
```sql
id, user_id, entity_type, entity_id,
file_url, file_type, label
```

### `settings`
```sql
id, user_id,
ai_provider,            -- openrouter | anthropic | gemini | lmstudio
ai_model,
ai_api_key              -- encrypted at rest in prod
```

---

## Hierarchy

```
Employment (job_title: "Principal Consultant" @ Accenture — full-time)
  └── Project A
        ├── Role: Solution Architect   (freeform)
        └── Role: Team Lead            (freeform)
  └── Project B
        └── Role: Enterprise Architect

Employment (type: personal)
  └── My SaaS App
        └── Role: Founder
```

---

## Pages

### Public (`/`)
| Route | Description |
|---|---|
| `/` | Full profile — cover, avatar, about, experience timeline, skills, certs |
| `/experience` | Detailed timeline of roles + projects |
| `/projects` | Project showcase grid |

### Dashboard (auth-gated in prod, open in dev)
| Route | Description |
|---|---|
| `/dashboard` | Overview stats + quick actions |
| `/dashboard/experience` | Employment list — add, edit, reorder |
| `/dashboard/experience/:id` | Single employment + projects list |
| `/dashboard/projects` | All projects across all employments |
| `/dashboard/projects/:id` | Project detail — edit, roles, skills |
| `/dashboard/skills` | Skills tag manager by category |
| `/dashboard/variants` | Resume variants list |
| `/dashboard/variants/:id` | Variant detail — diff view, override management |
| `/dashboard/import` | PDF upload + parse + merge flow |
| `/dashboard/settings` | AI provider selector, API keys, profile image/cover |

### Auth
| Route | Description |
|---|---|
| `/login` | Supabase magic link or email+password (prod only) |

---

## Key UI Patterns

### Inline Edit (Notion-style)
- Click any field to edit in place
- `Esc` to cancel, `Enter` / blur to save
- Autosave with debounce (500ms)

### "Improve with AI" Button
Appears on every description / impact / summary field:
```
[current text displayed]
                    [✨ Improve with AI]
                            ↓
    ┌──────────────────────────────────────────┐
    │ Original:                                │
    │  "Worked on cloud migration project"     │
    │                                          │
    │ Suggested:                               │
    │  "Led cloud migration of 12-service      │
    │   monolith to AWS EKS, reducing          │
    │   infra costs by 34%"                    │
    │                                          │
    │      [Accept]   [Try again]   [✕]        │
    └──────────────────────────────────────────┘
```

### PDF Import Flow
```
1. Upload PDF (drag & drop or file picker)
2. FastAPI sends to Unstructured → structured text chunks
3. LLM maps chunks to schema fields
4. Diff view: new/changed fields highlighted green
5. User accepts field by field or "Accept all"
6. Merged into master record
```

### Resume Variant Creation
```
1. "New Variant" → paste job description + company/role name
2. AI reads JD + master record
3. Suggests: projects to highlight, reworded descriptions
4. User accepts/rejects per suggestion (diff view)
5. Saved as named variant (e.g. "principal-consultant-accenture")
6. Variants are private — no public URL
```

Variants render master record merged with overrides at read time — master updates flow through automatically to all variants.

---

## AI Integration

### Provider Config (per user, stored in `settings`)
```
openrouter  → OPENROUTER_API_KEY  (default dev: claude-sonnet-4-6)
anthropic   → ANTHROPIC_API_KEY
gemini      → GEMINI_API_KEY
lmstudio    → LM_STUDIO_BASE_URL  (local, no key)
```

### Use Cases
| Feature | Prompt type |
|---|---|
| Improve description | Single field rewrite with context |
| PDF import parsing | Structured extraction into schema |
| Variant generation | Multi-field rewrite against JD |

---

## Image Storage

- Profile picture + cover photo uploaded via dashboard settings
- Dev: stored in MinIO (S3-compatible, `http://localhost:9000`)
- Prod: stored in Supabase Storage
- FastAPI handles upload, returns `file_url` stored in `profiles.avatar_url` / `profiles.cover_url`
- Same API endpoint, different storage backend via env config

---

## Auth Strategy

| Environment | Auth |
|---|---|
| Dev (Docker) | Disabled — `AUTH_DISABLED=true` bypasses all middleware |
| Prod | Supabase Auth — JWT verified on every FastAPI request |

Schema uses `user_id` on all tables from day one — adding multi-user later is additive only.

---

## Out of Scope (for now)
- Public shareable variant URLs
- PDF export / resume download
- Multi-user / SaaS mode
- Social features (endorsements, connections)
- Mobile app

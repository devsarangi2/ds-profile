# Project: ds-profile — Profile Management App

## Before Starting Any Session
- Run `/reload-plugins` to get all plugins loaded

## Code Quality
- Simple, readable naming throughout — no abbreviations, no clever tricks
- One function does one thing — keep functions small and focused
- Code must be traceable: acceptance/spec test → unit test → code
- Simplicity and predictability over cleverness — clean code is the goal

## Design (Frontend)
- Use `ui-ux-pro-max` skill as the **designer** to create consistent design system and components
- Use `frontend-design` skill as the **developer** to implement frontend code
- Responsive design on all pages (mobile-first)
- TDD — write tests before implementation
- Use Playwright MCP to test every single feature created
- Capture all design decisions in `DESIGN.md` at the project root

## Backend
- Use `pydantic-ai` plugin for all AI-related backend code
- Use `supabase-postgres-best-practices` skill to review ORM and query code
- Use **LiteLLM** for LLM routing — configurations pulled from the database at runtime
- Do NOT cache user AI settings — always read from DB

## Testing
- Write acceptance tests first, then implement
- Run acceptance tests using the Playwright MCP plugin
- On test failure or errors: log in `defects/` folder with date and description
- Use `ralph-loop` skill to debug and fix defects systematically

## Configuration
- Prod-compliant code throughout — the only difference between dev and prod is infrastructure feature flags in `.env`
- Always maintain `.env.example` with local/dev defaults
- All user settings and configurations live in the database — never hardcoded or in env files
- Feature flags for infrastructure (auth, storage backend, parser endpoint) in `.env`

## Security
- Apply security guidance plugin on all code before committing
- Never commit secrets, API keys, or credentials
- All keys stored encrypted in the database (prod) or `.env` (local dev only)
- Aikido scan post-implementation: CVE, dependency, and secret scans (ignore `.enc` files in local env)

## Post-Implementation
- Generate documentation using **Mintlify** docchain once all changes are complete
- Run **Aikido** SAST scan — focus on CVEs, dependency vulnerabilities, and what GitHub would flag
- Ignore `.enc` files in local environment scans

## Key Docs
- Design decisions: `DESIGN.md`
- Architecture & specs: `docs/plans/`
- Defect log: `defects/`
- Design doc: `docs/plans/2026-06-27-profile-redesign.md`

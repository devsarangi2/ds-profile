# Profile Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Astro static site with a full-stack profile management app — Vite + React SPA frontend, FastAPI backend, Postgres database — with AI-assisted editing, PDF import, and resume variant generation.

**Architecture:** Vite+React SPA talks to a FastAPI backend via REST. FastAPI owns all business logic, DB access (SQLAlchemy + Alembic), file storage (MinIO dev / Supabase Storage prod), PDF parsing (Unstructured), and LLM routing (LiteLLM). Auth is disabled in dev (`AUTH_DISABLED=true`), Supabase JWT in prod.

**Tech Stack:** React 18 + Vite + Tailwind + shadcn/ui · FastAPI + SQLAlchemy + Alembic + Pydantic · LiteLLM · Unstructured.io · Postgres 16 · MinIO · Docker Compose · Playwright (tests)

**Reference:** `docs/plans/2026-06-27-profile-redesign.md` for full data model and UX decisions.

---

## Phase 1 — Scaffold & Infrastructure

### Task 1: Clean existing Astro files

**Files:**
- Delete: `src/` (entire directory)
- Delete: `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`, `public/`, `dist/`, `.astro/`
- Keep: `Makefile`, `docker-compose.yml`, `docker-compose.dev.yml`, `Dockerfile`, `Dockerfile.dev`, `nginx.conf`, `CLAUDE.md`, `docs/`, `README.md`

**Step 1: Remove Astro source**
```bash
rm -rf src dist .astro public astro.config.mjs tailwind.config.mjs tsconfig.json .npmrc
```

**Step 2: Verify clean state**
```bash
ls -la
```
Expected: only `Makefile`, `docker-compose*.yml`, `Dockerfile*`, `nginx.conf`, `CLAUDE.md`, `docs/`, `README.md`, `package.json`, `package-lock.json`, `node_modules/`, `scripts/`

**Step 3: Remove node_modules and package files (Astro-specific)**
```bash
rm -rf node_modules package.json package-lock.json
```

**Step 4: Commit**
```bash
git add -A
git commit -m "chore: remove Astro scaffolding to start redesign"
```

---

### Task 2: Scaffold Vite + React frontend

**Files:**
- Create: `frontend/` (entire directory from scaffold)

**Step 1: Create Vite React TypeScript project**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install
```

**Step 2: Install UI dependencies**
```bash
cd frontend && npm install tailwindcss @tailwindcss/vite lucide-react clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install react-router-dom @tanstack/react-query axios
npm install -D @playwright/test @types/node
```

**Step 3: Install shadcn/ui CLI and init**
```bash
cd frontend && npx shadcn@latest init
```
Choose: TypeScript=yes, style=Default, base color=Slate, CSS variables=yes, tailwind config=yes, components dir=`src/components/ui`, utils=`src/lib/utils`, RSC=no, write config=yes.

**Step 4: Add core shadcn components**
```bash
cd frontend && npx shadcn@latest add button input label textarea card badge separator toast dialog dropdown-menu
```

**Step 5: Verify dev server starts**
```bash
cd frontend && npm run dev
```
Expected: `VITE ready at http://localhost:5173`

**Step 6: Commit**
```bash
git add frontend/
git commit -m "feat: scaffold Vite + React + Tailwind + shadcn/ui frontend"
```

---

### Task 3: Scaffold FastAPI backend

**Files:**
- Create: `backend/` (entire directory)

**Step 1: Create directory structure**
```bash
mkdir -p backend/{app/{api/v1/endpoints,core,db,models,schemas,services,utils},tests/{unit,integration,acceptance},alembic/versions}
touch backend/app/__init__.py
touch backend/app/api/__init__.py backend/app/api/v1/__init__.py backend/app/api/v1/endpoints/__init__.py
touch backend/app/core/__init__.py backend/app/db/__init__.py
touch backend/app/models/__init__.py backend/app/schemas/__init__.py
touch backend/app/services/__init__.py backend/app/utils/__init__.py
touch backend/tests/__init__.py backend/tests/unit/__init__.py
touch backend/tests/integration/__init__.py backend/tests/acceptance/__init__.py
```

**Step 2: Create `backend/requirements.txt`**
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.36
alembic==1.13.3
asyncpg==0.30.0
pydantic==2.9.0
pydantic-settings==2.5.0
python-multipart==0.0.12
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.2
litellm==1.50.0
unstructured-client==0.26.0
boto3==1.35.0
pytest==8.3.3
pytest-asyncio==0.24.0
pytest-httpx==0.32.0
```

**Step 3: Create `backend/app/core/config.py`**
```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    auth_disabled: bool = False
    storage_backend: str = "minio"          # minio | supabase
    storage_endpoint: str = "http://minio:9000"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_bucket: str = "profile-assets"
    unstructured_backend: str = "local"     # local | cloud
    unstructured_base_url: str = "http://parser:8001"
    unstructured_api_key: str = ""
    default_user_id: str = "dev-user"       # used when auth is disabled

settings = Settings()
```

**Step 4: Create `backend/app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router as api_router

app = FastAPI(title="ds-profile API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "ok"}
```

**Step 5: Create `backend/app/api/v1/__init__.py`**
```python
from fastapi import APIRouter
router = APIRouter()
```

**Step 6: Verify FastAPI starts**
```bash
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Expected: Uvicorn running on `http://127.0.0.1:8000`, `GET /health` returns `{"status":"ok"}`

**Step 7: Commit**
```bash
git add backend/
git commit -m "feat: scaffold FastAPI backend with config and CORS"
```

---

### Task 4: Set up Docker Compose

**Files:**
- Rewrite: `docker-compose.yml`
- Rewrite: `docker-compose.dev.yml`
- Rewrite: `Dockerfile` (nginx for frontend prod)
- Rewrite: `Dockerfile.dev` (frontend dev)
- Create: `backend/Dockerfile`
- Create: `backend/Dockerfile.dev`

**Step 1: Write `docker-compose.yml` (prod-like local)**
```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: dsprofile
      POSTGRES_USER: dsprofile
      POSTGRES_PASSWORD: dsprofile
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dsprofile"]
      interval: 5s
      timeout: 5s
      retries: 5

  storage:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

  parser:
    image: downloads.unstructured.io/unstructured-io/unstructured-api:latest
    ports:
      - "8001:8000"

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file: .env
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
      storage:
        condition: service_started
      parser:
        condition: service_started

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  pgdata:
  miniodata:
```

**Step 2: Write `docker-compose.dev.yml` (hot reload override)**
```yaml
version: "3.9"
services:
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    command: npm run dev -- --host
```

**Step 3: Write `backend/Dockerfile`**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Step 4: Write `backend/Dockerfile.dev`**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

**Step 5: Write `frontend/Dockerfile.dev`**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
```

**Step 6: Spin up dev stack**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up db storage parser -d
```
Expected: postgres, minio, and parser containers running

**Step 7: Commit**
```bash
git add docker-compose.yml docker-compose.dev.yml backend/Dockerfile backend/Dockerfile.dev frontend/Dockerfile.dev
git commit -m "feat: set up docker-compose dev stack (postgres, minio, unstructured, api, frontend)"
```

---

### Task 5: Environment config files

**Files:**
- Create: `.env.example`
- Create: `.env` (gitignored)
- Modify: `.gitignore`

**Step 1: Write `.env.example`**
```bash
# Infrastructure — these are the ONLY values that differ between dev and prod

# Database
DATABASE_URL=postgresql+asyncpg://dsprofile:dsprofile@localhost:5432/dsprofile

# Auth — set to false in prod with Supabase
AUTH_DISABLED=true
SUPABASE_JWT_SECRET=

# Storage backend: minio (dev) | supabase (prod)
STORAGE_BACKEND=minio
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_ACCESS_KEY=minioadmin
STORAGE_SECRET_KEY=minioadmin
STORAGE_BUCKET=profile-assets

# PDF Parser backend: local (dev) | cloud (prod)
UNSTRUCTURED_BACKEND=local
UNSTRUCTURED_BASE_URL=http://localhost:8001
UNSTRUCTURED_API_KEY=

# Dev user (used when AUTH_DISABLED=true)
DEFAULT_USER_ID=dev-user
```

**Step 2: Copy to `.env`**
```bash
cp .env.example .env
```

**Step 3: Add to `.gitignore`**
```
.env
*.enc
defects/*.log
```

**Step 4: Commit**
```bash
git add .env.example .gitignore
git commit -m "feat: add .env.example and gitignore rules"
```

---

### Task 6: Database schema with Alembic

**Files:**
- Create: `backend/app/db/base.py`
- Create: `backend/app/models/profile.py`
- Create: `backend/app/models/employment.py`
- Create: `backend/app/models/project.py`
- Create: `backend/app/models/skill.py`
- Create: `backend/app/models/certification.py`
- Create: `backend/app/models/variant.py`
- Create: `backend/app/models/media.py`
- Create: `backend/app/models/settings.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

**Step 1: Write `backend/app/db/base.py`**
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session
```

**Step 2: Write `backend/app/models/profile.py`**
```python
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import uuid

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    headline: Mapped[str | None] = mapped_column(String(500))
    summary: Mapped[str | None] = mapped_column(Text)
    location: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(1000))
    cover_url: Mapped[str | None] = mapped_column(String(1000))
    email: Mapped[str | None] = mapped_column(String(255))
    website: Mapped[str | None] = mapped_column(String(500))
    linkedin_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
```

**Step 3: Write `backend/app/models/employment.py`**
```python
from sqlalchemy import String, Text, Date, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid

EMPLOYMENT_TYPES = ("full-time", "part-time", "contract", "freelance", "self-employed", "open-source", "personal")

class Employment(Base):
    __tablename__ = "employment"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    profile_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id"), nullable=False)
    company: Mapped[str] = mapped_column(String(255), nullable=False)
    company_logo_url: Mapped[str | None] = mapped_column(String(1000))
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255))
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    start_date: Mapped[Date | None] = mapped_column(Date)
    end_date: Mapped[Date | None] = mapped_column(Date)
    current: Mapped[bool] = mapped_column(Boolean, default=False)
    description: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="employment", cascade="all, delete-orphan")
```

**Step 4: Write `backend/app/models/project.py`**
```python
from sqlalchemy import String, Text, Date, Boolean, DateTime, ForeignKey, ARRAY, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid

PROJECT_STATUSES = ("active", "completed", "archived")

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employment_id: Mapped[str] = mapped_column(String, ForeignKey("employment.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="completed")
    start_date: Mapped[Date | None] = mapped_column(Date)
    end_date: Mapped[Date | None] = mapped_column(Date)
    location: Mapped[str | None] = mapped_column(String(255))
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    url: Mapped[str | None] = mapped_column(String(1000))
    repo_url: Mapped[str | None] = mapped_column(String(1000))
    impact: Mapped[str | None] = mapped_column(Text)
    tech_stack: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    employment: Mapped["Employment"] = relationship("Employment", back_populates="projects")
    roles: Mapped[list["ProjectRole"]] = relationship("ProjectRole", back_populates="project", cascade="all, delete-orphan")

class ProjectRole(Base):
    __tablename__ = "project_roles"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String, ForeignKey("projects.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="roles")
```

**Step 5: Write `backend/app/models/skill.py`**
```python
from sqlalchemy import String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import uuid

project_skills = Table(
    "project_skills", Base.metadata,
    Column("project_id", String, ForeignKey("projects.id"), primary_key=True),
    Column("skill_id", String, ForeignKey("skills.id"), primary_key=True),
)

employment_skills = Table(
    "employment_skills", Base.metadata,
    Column("employment_id", String, ForeignKey("employment.id"), primary_key=True),
    Column("skill_id", String, ForeignKey("skills.id"), primary_key=True),
)

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(255))
```

**Step 6: Write `backend/app/models/certification.py`**
```python
from sqlalchemy import String, Date
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import uuid

class Certification(Base):
    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    issuer: Mapped[str | None] = mapped_column(String(255))
    date: Mapped[Date | None] = mapped_column(Date)
    url: Mapped[str | None] = mapped_column(String(1000))
    badge_url: Mapped[str | None] = mapped_column(String(1000))
```

**Step 7: Write `backend/app/models/variant.py`**
```python
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
import uuid

class Variant(Base):
    __tablename__ = "variants"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    profile_id: Mapped[str] = mapped_column(String, ForeignKey("profiles.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base: Mapped[bool] = mapped_column(Boolean, default=False)
    job_description_text: Mapped[str | None] = mapped_column(Text)
    target_company: Mapped[str | None] = mapped_column(String(255))
    target_role: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    overrides: Mapped[list["VariantOverride"]] = relationship("VariantOverride", back_populates="variant", cascade="all, delete-orphan")

class VariantOverride(Base):
    __tablename__ = "variant_overrides"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    variant_id: Mapped[str] = mapped_column(String, ForeignKey("variants.id"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String, nullable=False)
    field: Mapped[str] = mapped_column(String(100), nullable=False)
    original_value: Mapped[str | None] = mapped_column(Text)
    overridden_value: Mapped[str | None] = mapped_column(Text)

    variant: Mapped["Variant"] = relationship("Variant", back_populates="overrides")
```

**Step 8: Write `backend/app/models/settings.py`**
```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
import uuid

class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, nullable=False, unique=True, index=True)
    ai_provider: Mapped[str] = mapped_column(String(50), default="openrouter")
    ai_model: Mapped[str] = mapped_column(String(255), default="openrouter/anthropic/claude-sonnet-4-6")
    ai_api_key_encrypted: Mapped[str | None] = mapped_column(String(2000))
    lmstudio_base_url: Mapped[str | None] = mapped_column(String(500))
```

**Step 9: Create Alembic migration**
```bash
cd backend
alembic init alembic
```

Update `backend/alembic/env.py` to import all models and use async engine:
```python
from app.db.base import Base
from app.models import profile, employment, project, skill, certification, variant, settings, media
target_metadata = Base.metadata
```

Generate initial migration:
```bash
cd backend && alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```
Expected: all tables created in local Postgres.

**Step 10: Commit**
```bash
git add backend/app/models/ backend/app/db/ backend/alembic/ backend/alembic.ini
git commit -m "feat: add SQLAlchemy models and initial Alembic migration"
```

---

## Phase 2 — API Endpoints

### Task 7: Auth middleware (dev passthrough)

**Files:**
- Create: `backend/app/core/auth.py`

**Step 1: Write `backend/app/core/auth.py`**
```python
from fastapi import Depends, HTTPException, Header
from app.core.config import settings

async def get_current_user_id(authorization: str | None = Header(default=None)) -> str:
    if settings.auth_disabled:
        return settings.default_user_id
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = authorization.split(" ")[1]
    # Supabase JWT verification goes here in prod
    # For now: decode and return sub claim
    raise NotImplementedError("Prod auth not implemented yet")
```

**Step 2: Write test `backend/tests/unit/test_auth.py`**
```python
import pytest
from unittest.mock import patch
from app.core.auth import get_current_user_id

@pytest.mark.asyncio
async def test_returns_dev_user_when_auth_disabled():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = True
        mock_settings.default_user_id = "dev-user"
        user_id = await get_current_user_id(authorization=None)
    assert user_id == "dev-user"

@pytest.mark.asyncio
async def test_raises_401_when_auth_enabled_and_no_token():
    from fastapi import HTTPException
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = False
        with pytest.raises(HTTPException) as exc:
            await get_current_user_id(authorization=None)
    assert exc.value.status_code == 401
```

**Step 3: Run tests**
```bash
cd backend && pytest tests/unit/test_auth.py -v
```
Expected: 2 passed

**Step 4: Commit**
```bash
git add backend/app/core/auth.py backend/tests/unit/test_auth.py
git commit -m "feat: add auth middleware with dev passthrough"
```

---

### Task 8: Profile CRUD API

**Files:**
- Create: `backend/app/schemas/profile.py`
- Create: `backend/app/services/profile_service.py`
- Create: `backend/app/api/v1/endpoints/profiles.py`
- Create: `backend/tests/unit/test_profile_service.py`

**Step 1: Write `backend/app/schemas/profile.py`**
```python
from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ProfileCreate(BaseModel):
    name: str
    headline: str | None = None
    summary: str | None = None
    location: str | None = None
    email: str | None = None
    website: str | None = None
    linkedin_url: str | None = None

class ProfileUpdate(BaseModel):
    name: str | None = None
    headline: str | None = None
    summary: str | None = None
    location: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None
    email: str | None = None
    website: str | None = None
    linkedin_url: str | None = None

class ProfileResponse(ProfileCreate):
    id: str
    user_id: str
    avatar_url: str | None = None
    cover_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

**Step 2: Write `backend/app/services/profile_service.py`**
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate, ProfileUpdate

async def get_profile_by_user(db: AsyncSession, user_id: str) -> Profile | None:
    result = await db.execute(select(Profile).where(Profile.user_id == user_id))
    return result.scalar_one_or_none()

async def create_profile(db: AsyncSession, user_id: str, data: ProfileCreate) -> Profile:
    profile = Profile(user_id=user_id, **data.model_dump())
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return profile

async def update_profile(db: AsyncSession, profile: Profile, data: ProfileUpdate) -> Profile:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.commit()
    await db.refresh(profile)
    return profile
```

**Step 3: Write `backend/app/api/v1/endpoints/profiles.py`**
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services import profile_service

router = APIRouter(prefix="/profiles", tags=["profiles"])

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.get_profile_by_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.post("/me", response_model=ProfileResponse, status_code=201)
async def create_my_profile(
    data: ProfileCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await profile_service.create_profile(db, user_id, data)

@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.get_profile_by_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return await profile_service.update_profile(db, profile, data)
```

**Step 4: Register router in `backend/app/api/v1/__init__.py`**
```python
from fastapi import APIRouter
from app.api.v1.endpoints import profiles

router = APIRouter()
router.include_router(profiles.router)
```

**Step 5: Write unit tests `backend/tests/unit/test_profile_service.py`**
```python
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.profile_service import get_profile_by_user, create_profile
from app.schemas.profile import ProfileCreate

@pytest.mark.asyncio
async def test_get_profile_returns_none_when_not_found():
    db = AsyncMock()
    db.execute.return_value.scalar_one_or_none.return_value = None
    result = await get_profile_by_user(db, "user-1")
    assert result is None

@pytest.mark.asyncio
async def test_create_profile_sets_user_id():
    db = AsyncMock()
    data = ProfileCreate(name="Dev Sarangi")
    profile = await create_profile(db, "user-1", data)
    assert profile.user_id == "user-1"
    assert profile.name == "Dev Sarangi"
    db.add.assert_called_once()
    db.commit.assert_called_once()
```

**Step 6: Run tests**
```bash
cd backend && pytest tests/unit/test_profile_service.py -v
```
Expected: 2 passed

**Step 7: Commit**
```bash
git add backend/app/schemas/profile.py backend/app/services/profile_service.py backend/app/api/v1/endpoints/profiles.py backend/tests/unit/test_profile_service.py
git commit -m "feat: add profile CRUD API with unit tests"
```

---

### Task 9: Employment CRUD API

Follow identical pattern as Task 8.

**Files:**
- Create: `backend/app/schemas/employment.py`
- Create: `backend/app/services/employment_service.py`
- Create: `backend/app/api/v1/endpoints/employment.py`
- Create: `backend/tests/unit/test_employment_service.py`

**Step 1: Write `backend/app/schemas/employment.py`**
```python
from pydantic import BaseModel
from datetime import date, datetime
from typing import Literal

EmploymentType = Literal["full-time", "part-time", "contract", "freelance", "self-employed", "open-source", "personal"]

class EmploymentCreate(BaseModel):
    company: str
    job_title: str
    employment_type: EmploymentType
    location: str | None = None
    remote: bool = False
    start_date: date | None = None
    end_date: date | None = None
    current: bool = False
    description: str | None = None
    company_logo_url: str | None = None

class EmploymentUpdate(BaseModel):
    company: str | None = None
    job_title: str | None = None
    employment_type: EmploymentType | None = None
    location: str | None = None
    remote: bool | None = None
    start_date: date | None = None
    end_date: date | None = None
    current: bool | None = None
    description: str | None = None
    company_logo_url: str | None = None

class EmploymentResponse(EmploymentCreate):
    id: str
    user_id: str
    profile_id: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
```

**Step 2: Write service, endpoint, register router** — same pattern as Task 8.

**Step 3: Write unit tests** — test list, create, update, delete operations.

**Step 4: Run tests, commit.**

---

### Task 10: Projects CRUD API

Follow identical pattern. Includes `project_roles` nested CRUD (add/remove roles on a project).

**Files:**
- Create: `backend/app/schemas/project.py`
- Create: `backend/app/services/project_service.py`
- Create: `backend/app/api/v1/endpoints/projects.py`
- Create: `backend/tests/unit/test_project_service.py`

Key schema addition — `ProjectResponse` includes roles:
```python
class ProjectRoleResponse(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}

class ProjectResponse(ProjectCreate):
    id: str
    employment_id: str
    user_id: str
    roles: list[ProjectRoleResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
```

Endpoint for roles:
```
POST   /projects/{id}/roles        — add role
DELETE /projects/{id}/roles/{rid}  — remove role
```

---

### Task 11: Skills & Certifications CRUD API

Follow identical pattern for `skills` and `certifications`.

Add skill-to-project and skill-to-employment association endpoints:
```
POST   /projects/{id}/skills/{skill_id}    — associate
DELETE /projects/{id}/skills/{skill_id}    — remove
POST   /employment/{id}/skills/{skill_id}
DELETE /employment/{id}/skills/{skill_id}
```

---

### Task 12: File upload endpoint (images)

**Files:**
- Create: `backend/app/services/storage_service.py`
- Create: `backend/app/api/v1/endpoints/uploads.py`
- Create: `backend/tests/unit/test_storage_service.py`

**Step 1: Write `backend/app/services/storage_service.py`**
```python
import boto3
from botocore.client import Config
from app.core.config import settings
import uuid
import mimetypes

def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        config=Config(signature_version="s3v4"),
    )

async def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    ext = mimetypes.guess_extension(content_type) or ""
    key = f"uploads/{uuid.uuid4()}{ext}"
    client = get_s3_client()
    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"{settings.storage_endpoint}/{settings.storage_bucket}/{key}"
```

**Step 2: Write `backend/app/api/v1/endpoints/uploads.py`**
```python
from fastapi import APIRouter, UploadFile, File, Depends
from app.core.auth import get_current_user_id
from app.services.storage_service import upload_file

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, GIF allowed")
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    url = await upload_file(contents, file.filename or "upload", file.content_type)
    return {"url": url}
```

**Step 3: Write tests, run, commit.**

---

## Phase 3 — Frontend Foundation

### Task 13: Design system (run ui-ux-pro-max skill)

**Before writing any React:** invoke the `ui-ux-pro-max` skill to generate the design system.

**Step 1: Invoke skill**
```
Use ui-ux-pro-max skill with context:
- App: Profile management dashboard + public profile
- Style: LinkedIn-inspired, clean, professional, dark/light mode
- Components needed: nav, sidebar, profile card, timeline card,
  project card, inline-edit field, AI suggestion modal, diff view,
  tag chip, avatar/cover uploader, PDF upload dropzone
```

**Step 2: Save output to `DESIGN.md`** at project root with:
- Color tokens
- Typography scale
- Component inventory
- Dark/light mode strategy
- Spacing system

**Step 3: Apply design tokens to `frontend/src/index.css`**

**Step 4: Commit**
```bash
git add DESIGN.md frontend/src/index.css
git commit -m "feat: establish design system and tokens (DESIGN.md)"
```

---

### Task 14: Frontend routing and layout

**Files:**
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/layouts/DashboardLayout.tsx`
- Create: `frontend/src/layouts/PublicLayout.tsx`
- Create: `frontend/src/components/nav/Sidebar.tsx`
- Create: `frontend/src/components/nav/TopNav.tsx`
- Create: `frontend/src/lib/api.ts`

**Step 1: Write `frontend/src/lib/api.ts`** — Axios instance pointing to FastAPI
```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  headers: { 'Content-Type': 'application/json' },
})
```

**Step 2: Set up routes in `frontend/src/App.tsx`**
```typescript
Routes:
  /                         → PublicProfile
  /experience               → PublicExperience
  /projects                 → PublicProjects
  /dashboard                → DashboardHome (redirect to /dashboard/experience)
  /dashboard/experience     → ExperienceList
  /dashboard/experience/:id → ExperienceDetail
  /dashboard/projects       → ProjectsList
  /dashboard/projects/:id   → ProjectDetail
  /dashboard/skills         → SkillsManager
  /dashboard/variants       → VariantsList
  /dashboard/variants/:id   → VariantDetail
  /dashboard/import         → ImportFlow
  /dashboard/settings       → Settings
  /login                    → Login (prod only)
```

**Step 3: Write DashboardLayout** with collapsible left sidebar on desktop, bottom tab bar on mobile.

**Step 4: Write Playwright test `frontend/tests/navigation.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test('dashboard sidebar shows all nav items', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard')
  await expect(page.getByRole('link', { name: 'Experience' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Skills' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Variants' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Import' })).toBeVisible()
})

test('public profile loads at root', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

**Step 5: Run Playwright tests**
```bash
cd frontend && npx playwright test tests/navigation.spec.ts
```

**Step 6: Commit**
```bash
git add frontend/src/ frontend/tests/
git commit -m "feat: add routing, dashboard layout, and navigation Playwright tests"
```

---

## Phase 4 — Dashboard CRUD Pages

### Task 15: Public profile page

**Files:**
- Create: `frontend/src/pages/public/PublicProfile.tsx`
- Create: `frontend/src/pages/public/PublicExperience.tsx`
- Create: `frontend/src/pages/public/PublicProjects.tsx`
- Create: `frontend/src/hooks/useProfile.ts`
- Create: `frontend/tests/public-profile.spec.ts`

Sections rendered (single scroll page):
1. Cover photo + avatar + name/headline/location
2. About (summary)
3. Experience timeline (company → projects accordion)
4. Skills grouped by category
5. Certifications grid

Use React Query for data fetching. All data read-only.

Playwright acceptance test:
```typescript
test('public profile shows name and headline', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(page.locator('[data-testid="profile-name"]')).toBeVisible()
  await expect(page.locator('[data-testid="profile-headline"]')).toBeVisible()
})

test('experience timeline shows at least one employer', async ({ page }) => {
  await page.goto('http://localhost:5173/experience')
  await expect(page.locator('[data-testid="employment-card"]').first()).toBeVisible()
})
```

---

### Task 16: Inline edit component

**Files:**
- Create: `frontend/src/components/ui/InlineEdit.tsx`
- Create: `frontend/tests/inline-edit.spec.ts`

Behaviour:
- Displays text in read mode
- Click → switches to input/textarea
- `Esc` → cancel (restore original)
- Blur or `Enter` (single line) → save (calls `onSave` prop)
- 500ms debounce before API call
- Shows spinner while saving, error toast on failure

```typescript
interface InlineEditProps {
  value: string
  onSave: (newValue: string) => Promise<void>
  multiline?: boolean
  placeholder?: string
}
```

Playwright test:
```typescript
test('inline edit saves on blur', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard/experience')
  await page.locator('[data-testid="inline-edit-description"]').click()
  await page.keyboard.type(' updated')
  await page.locator('body').click()
  await expect(page.locator('[data-testid="save-indicator"]')).toBeVisible()
})
```

---

### Task 17: Employment list + detail pages

**Files:**
- Create: `frontend/src/pages/dashboard/ExperienceList.tsx`
- Create: `frontend/src/pages/dashboard/ExperienceDetail.tsx`
- Create: `frontend/src/hooks/useEmployment.ts`
- Create: `frontend/tests/experience.spec.ts`

Features:
- List: cards sorted by date desc, "Add Employment" button opens modal form
- Detail: inline edit all fields, project list with "Add Project" button
- Employment type shown as badge
- Date range shown as `MMM YYYY — Present` or `MMM YYYY — MMM YYYY`

Playwright acceptance tests:
```typescript
test('can add new employment', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard/experience')
  await page.getByRole('button', { name: 'Add Employment' }).click()
  await page.getByLabel('Company').fill('Accenture')
  await page.getByLabel('Title').fill('Principal Consultant')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('Accenture')).toBeVisible()
})

test('can edit employment description inline', async ({ page }) => {
  // navigate to detail, click description, edit, blur, verify saved
})
```

---

### Task 18: Project detail page

**Files:**
- Create: `frontend/src/pages/dashboard/ProjectDetail.tsx`
- Create: `frontend/src/hooks/useProject.ts`
- Create: `frontend/tests/project-detail.spec.ts`

Features:
- Inline edit all text fields
- Roles section: tag chips, "Add Role" input (freeform), click × to remove
- Tech stack: tag chips with add/remove
- Skills section: searchable dropdown from skills list
- Impact field: multiline inline edit with AI improve button

---

### Task 19: Skills manager page

**Files:**
- Create: `frontend/src/pages/dashboard/SkillsManager.tsx`
- Create: `frontend/tests/skills.spec.ts`

Features:
- Skills grouped by category
- Add skill inline
- Remove skill (× on chip)
- Rename category inline

---

## Phase 5 — AI Integration

### Task 20: LiteLLM service in FastAPI

**Files:**
- Create: `backend/app/services/ai_service.py`
- Create: `backend/app/services/settings_service.py`
- Create: `backend/tests/unit/test_ai_service.py`

**Step 1: Write `backend/app/services/settings_service.py`**
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.settings import UserSettings

async def get_user_settings(db: AsyncSession, user_id: str) -> UserSettings | None:
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
    return result.scalar_one_or_none()
```

**Step 2: Write `backend/app/services/ai_service.py`**
```python
import litellm
from app.models.settings import UserSettings

def build_litellm_kwargs(user_settings: UserSettings) -> dict:
    provider = user_settings.ai_provider
    model = user_settings.ai_model
    api_key = decrypt_key(user_settings.ai_api_key_encrypted) if user_settings.ai_api_key_encrypted else None

    kwargs = {"model": model}
    if provider == "lmstudio":
        kwargs["api_base"] = user_settings.lmstudio_base_url
        kwargs["api_key"] = "lm-studio"
    elif api_key:
        kwargs["api_key"] = api_key
    return kwargs

async def improve_text(original: str, context: str, user_settings: UserSettings) -> str:
    kwargs = build_litellm_kwargs(user_settings)
    response = await litellm.acompletion(
        messages=[
            {"role": "system", "content": "You improve professional profile descriptions. Be concise, specific, and impact-focused. Return only the improved text, nothing else."},
            {"role": "user", "content": f"Context: {context}\n\nImprove this text:\n{original}"},
        ],
        **kwargs,
    )
    return response.choices[0].message.content.strip()
```

Note: Settings are read from DB on every call — never cached.

**Step 3: Write unit tests**
```python
@pytest.mark.asyncio
async def test_build_litellm_kwargs_uses_model_from_settings():
    settings = UserSettings(ai_provider="openrouter", ai_model="openrouter/anthropic/claude-sonnet-4-6")
    kwargs = build_litellm_kwargs(settings)
    assert kwargs["model"] == "openrouter/anthropic/claude-sonnet-4-6"

@pytest.mark.asyncio
async def test_lmstudio_sets_api_base():
    settings = UserSettings(ai_provider="lmstudio", ai_model="local/model", lmstudio_base_url="http://localhost:1234")
    kwargs = build_litellm_kwargs(settings)
    assert kwargs["api_base"] == "http://localhost:1234"
```

**Step 4: Commit**
```bash
git commit -m "feat: add LiteLLM AI service with per-request settings from DB"
```

---

### Task 21: Improve-with-AI endpoint

**Files:**
- Create: `backend/app/api/v1/endpoints/ai.py`
- Create: `backend/tests/unit/test_ai_endpoint.py`

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.services import ai_service, settings_service

router = APIRouter(prefix="/ai", tags=["ai"])

class ImproveRequest(BaseModel):
    text: str
    context: str

class ImproveResponse(BaseModel):
    original: str
    suggestion: str

@router.post("/improve", response_model=ImproveResponse)
async def improve_text(
    body: ImproveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_settings = await settings_service.get_user_settings(db, user_id)
    if not user_settings:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="AI settings not configured")
    suggestion = await ai_service.improve_text(body.text, body.context, user_settings)
    return ImproveResponse(original=body.text, suggestion=suggestion)
```

---

### Task 22: Improve-with-AI UI component

**Files:**
- Create: `frontend/src/components/ai/ImproveButton.tsx`
- Create: `frontend/src/components/ai/ImproveSuggestionModal.tsx`
- Create: `frontend/tests/improve-ai.spec.ts`

The modal shows original vs suggestion side-by-side with Accept / Try Again / Dismiss buttons. "Try Again" fires another API call with same input.

Playwright test:
```typescript
test('improve with AI shows suggestion modal', async ({ page }) => {
  await page.goto('http://localhost:5173/dashboard/experience/some-id')
  await page.locator('[data-testid="improve-ai-btn"]').first().click()
  await expect(page.locator('[data-testid="ai-suggestion-modal"]')).toBeVisible()
  await expect(page.locator('[data-testid="original-text"]')).toBeVisible()
  await expect(page.locator('[data-testid="suggested-text"]')).toBeVisible()
})

test('accepting suggestion updates field', async ({ page }) => {
  // open modal, click Accept, verify field updated
})
```

---

### Task 23: PDF import flow

**Files:**
- Create: `backend/app/services/parser_service.py`
- Create: `backend/app/services/import_service.py`
- Create: `backend/app/api/v1/endpoints/imports.py`
- Create: `frontend/src/pages/dashboard/ImportFlow.tsx`
- Create: `frontend/tests/import-flow.spec.ts`

**Step 1: `backend/app/services/parser_service.py`**
```python
import httpx
from app.core.config import settings

async def parse_pdf(file_bytes: bytes, filename: str) -> list[dict]:
    if settings.unstructured_backend == "local":
        return await parse_via_local(file_bytes, filename)
    return await parse_via_cloud(file_bytes, filename)

async def parse_via_local(file_bytes: bytes, filename: str) -> list[dict]:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.unstructured_base_url}/general/v0/general",
            files={"files": (filename, file_bytes, "application/pdf")},
            timeout=60,
        )
        response.raise_for_status()
        return response.json()

async def parse_via_cloud(file_bytes: bytes, filename: str) -> list[dict]:
    from unstructured_client import UnstructuredClient
    from unstructured_client.models.shared import Files, PartitionParameters
    client = UnstructuredClient(api_key_auth=settings.unstructured_api_key)
    req = PartitionParameters(files=Files(content=file_bytes, file_name=filename))
    response = await client.general.partition_async(req)
    return response.elements
```

**Step 2: `backend/app/services/import_service.py`**
```python
async def extract_profile_fields(elements: list[dict], user_settings) -> dict:
    text = "\n".join(e.get("text", "") for e in elements if e.get("text"))
    prompt = f"""
Extract structured profile information from this resume text.
Return a JSON object with keys: name, headline, summary, employment (list), skills (list).
Each employment has: company, job_title, employment_type, start_date, end_date, description, projects (list).
Each project has: name, description, roles (list of strings), tech_stack (list of strings), impact.

Resume text:
{text}
"""
    import litellm, json
    from app.services.ai_service import build_litellm_kwargs
    kwargs = build_litellm_kwargs(user_settings)
    response = await litellm.acompletion(
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        **kwargs,
    )
    return json.loads(response.choices[0].message.content)
```

**Step 3: Import endpoint** — accepts PDF upload, returns parsed fields as JSON for frontend diff view.

**Step 4: Frontend ImportFlow** — 3-step wizard:
1. Drag & drop PDF upload
2. Diff view (parsed fields vs existing master record, green = new/changed)
3. Accept all / field-by-field acceptance → merge into master

---

## Phase 6 — Resume Variants

### Task 24: Variants API

**Files:**
- Create: `backend/app/schemas/variant.py`
- Create: `backend/app/services/variant_service.py`
- Create: `backend/app/api/v1/endpoints/variants.py`
- Create: `backend/tests/unit/test_variant_service.py`

Key service function:
```python
async def render_variant(db: AsyncSession, variant_id: str) -> dict:
    """Merge master record with variant overrides at read time."""
    variant = await get_variant(db, variant_id)
    master = await build_master_snapshot(db, variant.profile_id)
    for override in variant.overrides:
        apply_override(master, override)
    return master
```

---

### Task 25: Variant creation flow (AI-assisted)

**Files:**
- Create: `backend/app/api/v1/endpoints/variants.py` — `POST /variants/generate`
- Create: `frontend/src/pages/dashboard/VariantCreate.tsx`
- Create: `frontend/tests/variant-create.spec.ts`

API endpoint `POST /variants/generate`:
- Input: `{ job_description: string, target_company: string, target_role: string }`
- Reads master record + JD
- LLM suggests overrides for each employment/project description
- Returns list of suggestions: `[{ entity_type, entity_id, field, original, suggested }]`
- Frontend shows diff view; user accepts/rejects each
- `POST /variants` creates the variant with accepted overrides

---

### Task 26: Settings page (AI provider config)

**Files:**
- Create: `frontend/src/pages/dashboard/Settings.tsx`
- Create: `backend/app/api/v1/endpoints/settings.py`
- Create: `frontend/tests/settings.spec.ts`

Provider selector UI:
- Radio: OpenRouter / Anthropic / Gemini / LM Studio
- Model dropdown (populated based on provider)
- API key input (masked, show/hide toggle)
- LM Studio base URL field (only visible when LM Studio selected)
- Save button → `PATCH /settings`

Note: API key is encrypted before storing in DB. Never returned in GET response (only `has_key: bool`).

---

## Phase 7 — Testing, Security & Docs

### Task 27: Full Playwright acceptance test suite

**Files:**
- Create: `frontend/tests/acceptance/` — one spec per user journey

User journeys to test:
1. View public profile
2. Add employment + project
3. Edit description inline
4. Upload profile picture
5. Improve description with AI
6. Import PDF and review diff
7. Create resume variant from JD
8. Configure AI provider in settings

Run all:
```bash
cd frontend && npx playwright test tests/acceptance/ --reporter=html
```

---

### Task 28: Security review

**Before any PR or deploy:**

1. Run security-review skill on backend:
   - Check for SQL injection (using SQLAlchemy ORM — safe by default, verify raw queries)
   - Check file upload validation (type, size limits — done in Task 12)
   - Check API key storage (encrypted at rest — done in Task 26)
   - Check CORS config (only allow frontend origin)
   - Check `AUTH_DISABLED` cannot be set in prod accidentally

2. Verify `.env` is in `.gitignore`, no secrets in code.

3. Run Aikido scan (post-deploy):
```bash
# Install Aikido CLI
npm install -g @aikido-security/cli
# Scan
aikido-security scan --ignore-path ".enc" --only cve,secrets,dependencies
```

---

### Task 29: Mintlify documentation

Once all features complete:

1. Create `docs/mintlify/mint.json` config
2. Generate API docs from FastAPI OpenAPI schema:
```bash
cd backend && python -c "
import json
from app.main import app
print(json.dumps(app.openapi(), indent=2))
" > docs/mintlify/api-reference/openapi.json
```
3. Write user guides for: PDF import, variant creation, AI provider setup
4. `DESIGN.md` becomes the component reference page

---

### Task 30: Final commit and PR

**Step 1: Check all tests pass**
```bash
cd backend && pytest -v
cd frontend && npx playwright test
```

**Step 2: Commit CLAUDE.md, DESIGN.md, PRD.md**
```bash
# Create PRD.md at project root summarising what was built
git add -A
git commit -m "docs: finalize PRD, DESIGN.md, and post-implementation docs"
```

**Step 3: Open PR to main**
```bash
gh pr create --title "feat: profile redesign — full-stack React + FastAPI + Postgres" \
  --body "Replaces Astro static site with full-stack profile management app. See docs/plans/2026-06-27-profile-redesign.md for full design."
```

---

## Defect Logging

If any task produces a failing test or unexpected behaviour:
1. Log to `defects/YYYY-MM-DD-<short-description>.md` with: error message, steps to reproduce, suspected cause
2. Use `ralph-loop` skill to debug systematically
3. Fix, re-run tests, remove defect log or mark resolved

---

## Execution Order Summary

```
Phase 1 (Tasks 1-6):   Scaffold + Docker + DB schema
Phase 2 (Tasks 7-12):  FastAPI CRUD endpoints
Phase 3 (Tasks 13-14): Design system + routing
Phase 4 (Tasks 15-19): Dashboard CRUD pages
Phase 5 (Tasks 20-23): AI integration + PDF import
Phase 6 (Tasks 24-26): Variants + settings
Phase 7 (Tasks 27-30): Tests + security + docs
```

Each task ends with a commit. Never batch multiple tasks into one commit.

from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel

ProjectStatus = Literal["active", "completed", "archived"]


class ProjectRoleCreate(BaseModel):
    name: str


class ProjectRoleResponse(BaseModel):
    id: str
    name: str
    model_config = {"from_attributes": True}


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    status: ProjectStatus = "completed"
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = None
    remote: bool = False
    url: str | None = None
    repo_url: str | None = None
    impact: str | None = None
    tech_stack: list[str] = []


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: ProjectStatus | None = None
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = None
    remote: bool | None = None
    url: str | None = None
    repo_url: str | None = None
    impact: str | None = None
    tech_stack: list[str] | None = None


class ProjectResponse(BaseModel):
    id: str
    employment_id: str
    user_id: str
    name: str
    description: str | None = None
    status: str
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = None
    remote: bool
    url: str | None = None
    repo_url: str | None = None
    impact: str | None = None
    tech_stack: list[str] = []
    roles: list[ProjectRoleResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

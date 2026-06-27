from datetime import date, datetime
from typing import Literal
from pydantic import BaseModel

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


class EmploymentResponse(BaseModel):
    id: str
    user_id: str
    profile_id: str
    company: str
    job_title: str
    employment_type: str
    location: str | None = None
    remote: bool
    start_date: date | None = None
    end_date: date | None = None
    current: bool
    description: str | None = None
    company_logo_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

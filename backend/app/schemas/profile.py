from datetime import datetime
from pydantic import BaseModel


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


class ProfileResponse(BaseModel):
    id: str
    user_id: str
    name: str
    headline: str | None = None
    summary: str | None = None
    location: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None
    email: str | None = None
    website: str | None = None
    linkedin_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

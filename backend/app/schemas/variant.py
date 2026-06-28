from pydantic import BaseModel
from datetime import datetime


class VariantOverrideResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    field: str
    original_value: str | None
    overridden_value: str | None
    model_config = {"from_attributes": True}


class VariantCreate(BaseModel):
    name: str
    profile_id: str
    job_description_text: str | None = None
    target_company: str | None = None
    target_role: str | None = None


class VariantResponse(BaseModel):
    id: str
    user_id: str
    profile_id: str
    name: str
    base: bool
    job_description_text: str | None
    target_company: str | None
    target_role: str | None
    override_count: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class VariantDetailResponse(VariantResponse):
    overrides: list[VariantOverrideResponse] = []


class GenerateVariantRequest(BaseModel):
    job_description: str
    target_company: str
    target_role: str
    profile_id: str


class OverrideSuggestion(BaseModel):
    entity_type: str
    entity_id: str
    field: str
    original: str
    suggested: str


class GenerateVariantResponse(BaseModel):
    suggestions: list[OverrideSuggestion]


class OverrideCreate(BaseModel):
    entity_type: str
    entity_id: str
    field: str
    original_value: str | None = None
    overridden_value: str

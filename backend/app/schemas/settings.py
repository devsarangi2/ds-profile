from pydantic import BaseModel


class SettingsResponse(BaseModel):
    id: str
    user_id: str
    ai_provider: str
    ai_model: str
    has_api_key: bool
    lmstudio_base_url: str | None = None
    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    ai_provider: str | None = None
    ai_model: str | None = None
    ai_api_key: str | None = None      # raw key — service encrypts before storing
    lmstudio_base_url: str | None = None

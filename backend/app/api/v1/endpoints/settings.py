from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.settings import SettingsResponse, SettingsUpdate
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    s = await settings_service.get_or_create_settings(db, user_id)
    return SettingsResponse(
        id=s.id,
        user_id=s.user_id,
        ai_provider=s.ai_provider,
        ai_model=s.ai_model,
        has_api_key=bool(s.ai_api_key_encrypted),
        lmstudio_base_url=s.lmstudio_base_url,
    )


@router.patch("", response_model=SettingsResponse)
async def update_settings(
    data: SettingsUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    update_data: dict = {}
    if data.ai_provider is not None:
        update_data["ai_provider"] = data.ai_provider
    if data.ai_model is not None:
        update_data["ai_model"] = data.ai_model
    if data.ai_api_key is not None:
        # Store as-is for MVP (plaintext) — encrypt in prod
        update_data["ai_api_key_encrypted"] = data.ai_api_key
    if data.lmstudio_base_url is not None:
        update_data["lmstudio_base_url"] = data.lmstudio_base_url

    s = await settings_service.update_settings(db, user_id, update_data)
    return SettingsResponse(
        id=s.id,
        user_id=s.user_id,
        ai_provider=s.ai_provider,
        ai_model=s.ai_model,
        has_api_key=bool(s.ai_api_key_encrypted),
        lmstudio_base_url=s.lmstudio_base_url,
    )

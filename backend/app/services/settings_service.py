from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.settings import UserSettings


async def get_user_settings(db: AsyncSession, user_id: str) -> UserSettings | None:
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
    return result.scalar_one_or_none()


async def get_or_create_settings(db: AsyncSession, user_id: str) -> UserSettings:
    settings = await get_user_settings(db, user_id)
    if settings:
        return settings
    settings = UserSettings(
        user_id=user_id,
        ai_provider="lmstudio",
        ai_model="local/model",
        lmstudio_base_url="http://100.82.183.76:8080/v1",
    )
    db.add(settings)
    await db.commit()
    await db.refresh(settings)
    return settings


async def update_settings(db: AsyncSession, user_id: str, data: dict) -> UserSettings:
    settings = await get_or_create_settings(db, user_id)
    for field, value in data.items():
        if value is not None:
            setattr(settings, field, value)
    await db.commit()
    await db.refresh(settings)
    return settings

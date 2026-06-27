from fastapi import Header, HTTPException
from app.core.config import settings


async def get_current_user_id(authorization: str | None = Header(default=None)) -> str:
    if settings.auth_disabled:
        return settings.default_user_id
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid auth token")
    # Prod: Supabase JWT verification added here
    raise HTTPException(status_code=501, detail="Prod auth not yet implemented")

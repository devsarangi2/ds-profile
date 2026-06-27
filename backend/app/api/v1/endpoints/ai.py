from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.services import ai_service, settings_service

router = APIRouter(prefix="/ai", tags=["ai"])


class ImproveRequest(BaseModel):
    text: str
    context: str = ""


class ImproveResponse(BaseModel):
    original: str
    suggestion: str


@router.post("/improve", response_model=ImproveResponse)
async def improve_text(
    body: ImproveRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_settings = await settings_service.get_or_create_settings(db, user_id)
    try:
        suggestion = await ai_service.improve_text(body.text, body.context, user_settings)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI provider error: {str(exc)}")
    return ImproveResponse(original=body.text, suggestion=suggestion)

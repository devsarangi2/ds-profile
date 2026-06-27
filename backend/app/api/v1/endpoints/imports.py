from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.services import parser_service, import_service, settings_service

router = APIRouter(prefix="/imports", tags=["imports"])

MAX_PDF_SIZE = 20 * 1024 * 1024  # 20MB


class ImportResult(BaseModel):
    raw_elements: int
    extracted: dict


@router.post("/pdf", response_model=ImportResult)
async def import_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    contents = await file.read()
    if len(contents) > MAX_PDF_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")

    try:
        elements = await parser_service.parse_pdf(contents, file.filename or "resume.pdf")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"PDF parser error: {str(exc)}")

    user_settings = await settings_service.get_or_create_settings(db, user_id)

    try:
        extracted = await import_service.extract_from_elements(elements, user_settings)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI extraction error: {str(exc)}")

    return ImportResult(raw_elements=len(elements), extracted=extracted)

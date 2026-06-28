from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from app.core.auth import get_current_user_id
from app.services.storage_service import upload_file

router = APIRouter(prefix="/uploads", tags=["uploads"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_DOC_TYPES = {"application/pdf"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024   # 5 MB
MAX_DOC_BYTES = 20 * 1024 * 1024    # 20 MB


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Accepted: {', '.join(ALLOWED_IMAGE_TYPES)}")
    contents = await file.read()
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 5 MB)")
    url = await upload_file(contents, file.filename or "upload", file.content_type)
    return {"url": url}


@router.post("/document")
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_DOC_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF documents are accepted")
    contents = await file.read()
    if len(contents) > MAX_DOC_BYTES:
        raise HTTPException(status_code=400, detail="Document too large (max 20 MB)")
    url = await upload_file(contents, file.filename or "document.pdf", file.content_type)
    return {"url": url}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.certification import CertificationCreate, CertificationUpdate, CertificationResponse
from app.services import certification_service

router = APIRouter(prefix="/certifications", tags=["certifications"])


@router.get("", response_model=list[CertificationResponse])
async def list_certifications(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await certification_service.list_certifications(db, user_id)


@router.post("", response_model=CertificationResponse, status_code=201)
async def create_certification(
    data: CertificationCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await certification_service.create_certification(db, user_id, data)


@router.patch("/{cert_id}", response_model=CertificationResponse)
async def update_certification(
    cert_id: str,
    data: CertificationUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    cert = await certification_service.get_certification(db, cert_id, user_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    return await certification_service.update_certification(db, cert, data)


@router.delete("/{cert_id}", status_code=204)
async def delete_certification(
    cert_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    cert = await certification_service.get_certification(db, cert_id, user_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    await certification_service.delete_certification(db, cert)

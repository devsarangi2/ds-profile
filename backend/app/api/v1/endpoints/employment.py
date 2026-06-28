from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.employment import EmploymentCreate, EmploymentUpdate, EmploymentResponse
from app.services import employment_service, profile_service

router = APIRouter(prefix="/employment", tags=["employment"])


@router.get("", response_model=list[EmploymentResponse])
async def list_my_employment(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await employment_service.list_employment(db, user_id)


@router.get("/{employment_id}", response_model=EmploymentResponse)
async def get_employment(
    employment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    emp = await employment_service.get_employment(db, employment_id, user_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employment not found")
    return emp


@router.post("", response_model=EmploymentResponse, status_code=201)
async def create_employment(
    data: EmploymentCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.get_profile_by_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found — create profile first")
    return await employment_service.create_employment(db, user_id, profile.id, data)


@router.patch("/{employment_id}", response_model=EmploymentResponse)
async def update_employment(
    employment_id: str,
    data: EmploymentUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    emp = await employment_service.get_employment(db, employment_id, user_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employment not found")
    return await employment_service.update_employment(db, emp, data)


@router.delete("/{employment_id}", status_code=204)
async def delete_employment(
    employment_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    emp = await employment_service.get_employment(db, employment_id, user_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employment not found")
    await employment_service.delete_employment(db, emp)

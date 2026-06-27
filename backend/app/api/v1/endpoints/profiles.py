from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.services import profile_service

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.get_profile_by_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/me", response_model=ProfileResponse, status_code=201)
async def create_my_profile(
    data: ProfileCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    existing = await profile_service.get_profile_by_user(db, user_id)
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists")
    return await profile_service.create_profile(db, user_id, data)


@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    data: ProfileUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    profile = await profile_service.get_profile_by_user(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return await profile_service.update_profile(db, profile, data)

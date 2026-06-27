from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.schemas.variant import (
    VariantCreate, VariantResponse, VariantDetailResponse,
    GenerateVariantRequest, GenerateVariantResponse
)
from app.services import variant_service, settings_service

router = APIRouter(prefix="/variants", tags=["variants"])


@router.get("", response_model=list[VariantResponse])
async def list_variants(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    variants = await variant_service.list_variants(db, user_id)
    return [
        VariantResponse(
            id=v.id,
            user_id=v.user_id,
            profile_id=v.profile_id,
            name=v.name,
            base=v.base,
            job_description_text=v.job_description_text,
            target_company=v.target_company,
            target_role=v.target_role,
            override_count=getattr(v, 'override_count', 0),
            created_at=v.created_at,
            updated_at=v.updated_at,
        )
        for v in variants
    ]


@router.post("", response_model=VariantResponse, status_code=201)
async def create_variant(
    data: VariantCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    v = await variant_service.create_variant(db, user_id, data)
    return VariantResponse(
        id=v.id,
        user_id=v.user_id,
        profile_id=v.profile_id,
        name=v.name,
        base=v.base,
        job_description_text=v.job_description_text,
        target_company=v.target_company,
        target_role=v.target_role,
        override_count=0,
        created_at=v.created_at,
        updated_at=v.updated_at,
    )


@router.post("/generate", response_model=GenerateVariantResponse)
async def generate_variant(
    body: GenerateVariantRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    user_settings = await settings_service.get_or_create_settings(db, user_id)
    try:
        suggestions = await variant_service.generate_variant_suggestions(
            db=db,
            profile_id=body.profile_id,
            user_id=user_id,
            job_description=body.job_description,
            target_company=body.target_company,
            target_role=body.target_role,
            user_settings=user_settings,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI generation error: {str(exc)}")
    return GenerateVariantResponse(suggestions=suggestions)


@router.get("/{variant_id}", response_model=VariantDetailResponse)
async def get_variant(
    variant_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    v = await variant_service.get_variant(db, variant_id, user_id)
    if not v:
        raise HTTPException(status_code=404, detail="Variant not found")
    return VariantDetailResponse(
        id=v.id,
        user_id=v.user_id,
        profile_id=v.profile_id,
        name=v.name,
        base=v.base,
        job_description_text=v.job_description_text,
        target_company=v.target_company,
        target_role=v.target_role,
        override_count=len(v.overrides),
        created_at=v.created_at,
        updated_at=v.updated_at,
        overrides=v.overrides,
    )


@router.delete("/{variant_id}", status_code=204)
async def delete_variant(
    variant_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    deleted = await variant_service.delete_variant(db, variant_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Variant not found")

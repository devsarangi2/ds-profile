from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.auth import get_current_user_id
from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from app.services import skill_service, project_service, employment_service

skills_router = APIRouter(prefix="/skills", tags=["skills"])
project_skills_router = APIRouter(prefix="/projects", tags=["skills"])
employment_skills_router = APIRouter(prefix="/employment", tags=["skills"])


@skills_router.get("", response_model=list[SkillResponse])
async def list_skills(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await skill_service.list_skills(db, user_id)


@skills_router.post("", response_model=SkillResponse, status_code=201)
async def create_skill(
    data: SkillCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    return await skill_service.create_skill(db, user_id, data)


@skills_router.patch("/{skill_id}", response_model=SkillResponse)
async def update_skill(
    skill_id: str,
    data: SkillUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Skill).where(Skill.id == skill_id, Skill.user_id == user_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return await skill_service.update_skill(db, skill, data)


@skills_router.delete("/{skill_id}", status_code=204)
async def delete_skill(
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Skill).where(Skill.id == skill_id, Skill.user_id == user_id))
    skill = result.scalar_one_or_none()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    await skill_service.delete_skill(db, skill)


@project_skills_router.post("/{project_id}/skills/{skill_id}", status_code=204)
async def associate_skill_with_project(
    project_id: str,
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await skill_service.associate_with_project(db, project_id, skill_id)


@project_skills_router.delete("/{project_id}/skills/{skill_id}", status_code=204)
async def remove_skill_from_project(
    project_id: str,
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    project = await project_service.get_project(db, project_id, user_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await skill_service.remove_from_project(db, project_id, skill_id)


@employment_skills_router.post("/{employment_id}/skills/{skill_id}", status_code=204)
async def associate_skill_with_employment(
    employment_id: str,
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    employment = await employment_service.get_employment(db, employment_id, user_id)
    if not employment:
        raise HTTPException(status_code=404, detail="Employment not found")
    await skill_service.associate_with_employment(db, employment_id, skill_id)


@employment_skills_router.delete("/{employment_id}/skills/{skill_id}", status_code=204)
async def remove_skill_from_employment(
    employment_id: str,
    skill_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    employment = await employment_service.get_employment(db, employment_id, user_id)
    if not employment:
        raise HTTPException(status_code=404, detail="Employment not found")
    await skill_service.remove_from_employment(db, employment_id, skill_id)

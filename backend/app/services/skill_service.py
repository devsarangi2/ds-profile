from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete as sql_delete
from app.models.skill import Skill, project_skills, employment_skills
from app.schemas.skill import SkillCreate, SkillUpdate


async def list_skills(db: AsyncSession, user_id: str) -> list[Skill]:
    result = await db.execute(select(Skill).where(Skill.user_id == user_id))
    return list(result.scalars().all())


async def create_skill(db: AsyncSession, user_id: str, data: SkillCreate) -> Skill:
    skill = Skill(user_id=user_id, **data.model_dump())
    db.add(skill)
    await db.commit()
    await db.refresh(skill)
    return skill


async def update_skill(db: AsyncSession, skill: Skill, data: SkillUpdate) -> Skill:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(skill, field, value)
    await db.commit()
    await db.refresh(skill)
    return skill


async def delete_skill(db: AsyncSession, skill: Skill) -> None:
    await db.delete(skill)
    await db.commit()


async def associate_with_project(db: AsyncSession, project_id: str, skill_id: str) -> None:
    await db.execute(insert(project_skills).values(project_id=project_id, skill_id=skill_id).on_conflict_do_nothing())
    await db.commit()


async def remove_from_project(db: AsyncSession, project_id: str, skill_id: str) -> None:
    await db.execute(
        sql_delete(project_skills).where(
            project_skills.c.project_id == project_id,
            project_skills.c.skill_id == skill_id,
        )
    )
    await db.commit()


async def associate_with_employment(db: AsyncSession, employment_id: str, skill_id: str) -> None:
    await db.execute(insert(employment_skills).values(employment_id=employment_id, skill_id=skill_id).on_conflict_do_nothing())
    await db.commit()


async def remove_from_employment(db: AsyncSession, employment_id: str, skill_id: str) -> None:
    await db.execute(
        sql_delete(employment_skills).where(
            employment_skills.c.employment_id == employment_id,
            employment_skills.c.skill_id == skill_id,
        )
    )
    await db.commit()

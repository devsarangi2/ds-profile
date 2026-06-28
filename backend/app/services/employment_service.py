from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.employment import Employment
from app.schemas.employment import EmploymentCreate, EmploymentUpdate


async def list_employment(db: AsyncSession, user_id: str) -> list[Employment]:
    result = await db.execute(
        select(Employment).where(Employment.user_id == user_id).order_by(Employment.start_date.desc().nullslast())
    )
    return list(result.scalars().all())


async def get_employment(db: AsyncSession, employment_id: str, user_id: str) -> Employment | None:
    result = await db.execute(
        select(Employment).where(Employment.id == employment_id, Employment.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_employment(db: AsyncSession, user_id: str, profile_id: str, data: EmploymentCreate) -> Employment:
    employment = Employment(user_id=user_id, profile_id=profile_id, **data.model_dump())
    db.add(employment)
    await db.commit()
    await db.refresh(employment)
    return employment


async def update_employment(db: AsyncSession, employment: Employment, data: EmploymentUpdate) -> Employment:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(employment, field, value)
    await db.commit()
    await db.refresh(employment)
    return employment


async def delete_employment(db: AsyncSession, employment: Employment) -> None:
    await db.delete(employment)
    await db.commit()

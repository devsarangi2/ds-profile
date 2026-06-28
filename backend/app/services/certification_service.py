from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.certification import Certification
from app.schemas.certification import CertificationCreate, CertificationUpdate


async def list_certifications(db: AsyncSession, user_id: str) -> list[Certification]:
    result = await db.execute(select(Certification).where(Certification.user_id == user_id))
    return list(result.scalars().all())


async def get_certification(db: AsyncSession, cert_id: str, user_id: str) -> Certification | None:
    result = await db.execute(
        select(Certification).where(Certification.id == cert_id, Certification.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def create_certification(db: AsyncSession, user_id: str, data: CertificationCreate) -> Certification:
    cert = Certification(user_id=user_id, **data.model_dump())
    db.add(cert)
    await db.commit()
    await db.refresh(cert)
    return cert


async def update_certification(db: AsyncSession, cert: Certification, data: CertificationUpdate) -> Certification:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cert, field, value)
    await db.commit()
    await db.refresh(cert)
    return cert


async def delete_certification(db: AsyncSession, cert: Certification) -> None:
    await db.delete(cert)
    await db.commit()

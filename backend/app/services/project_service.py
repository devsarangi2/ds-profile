from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.project import Project, ProjectRole
from app.schemas.project import ProjectCreate, ProjectUpdate


async def list_projects(db: AsyncSession, user_id: str, employment_id: str | None = None) -> list[Project]:
    query = select(Project).where(Project.user_id == user_id).options(selectinload(Project.roles))
    if employment_id:
        query = query.where(Project.employment_id == employment_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: str, user_id: str) -> Project | None:
    result = await db.execute(
        select(Project)
        .where(Project.id == project_id, Project.user_id == user_id)
        .options(selectinload(Project.roles))
    )
    return result.scalar_one_or_none()


async def create_project(db: AsyncSession, user_id: str, employment_id: str, data: ProjectCreate) -> Project:
    project = Project(user_id=user_id, employment_id=employment_id, **data.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


async def update_project(db: AsyncSession, project: Project, data: ProjectUpdate) -> Project:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project: Project) -> None:
    await db.delete(project)
    await db.commit()


async def add_role(db: AsyncSession, project_id: str, user_id: str, name: str) -> ProjectRole:
    role = ProjectRole(project_id=project_id, name=name)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role


async def remove_role(db: AsyncSession, role_id: str, project_id: str, user_id: str) -> bool:
    result = await db.execute(
        select(ProjectRole).where(ProjectRole.id == role_id, ProjectRole.project_id == project_id)
    )
    role = result.scalar_one_or_none()
    if not role:
        return False
    await db.delete(role)
    await db.commit()
    return True

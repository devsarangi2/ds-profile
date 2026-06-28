import uuid
from sqlalchemy import String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


project_skills = Table(
    "project_skills",
    Base.metadata,
    Column("project_id", String(36), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)

employment_skills = Table(
    "employment_skills",
    Base.metadata,
    Column("employment_id", String(36), ForeignKey("employment.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", String(36), ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
)


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(255))

import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, Date, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    employment_id: Mapped[str] = mapped_column(String(36), ForeignKey("employment.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="completed")
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    location: Mapped[str | None] = mapped_column(String(255))
    remote: Mapped[bool] = mapped_column(Boolean, default=False)
    url: Mapped[str | None] = mapped_column(String(1000))
    repo_url: Mapped[str | None] = mapped_column(String(1000))
    impact: Mapped[str | None] = mapped_column(Text)
    tech_stack: Mapped[list[str]] = mapped_column(ARRAY(String), default=list, nullable=False, server_default="{}")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    employment: Mapped["Employment"] = relationship("Employment", back_populates="projects")
    roles: Mapped[list["ProjectRole"]] = relationship("ProjectRole", back_populates="project", cascade="all, delete-orphan")


class ProjectRole(Base):
    __tablename__ = "project_roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    project: Mapped["Project"] = relationship("Project", back_populates="roles")

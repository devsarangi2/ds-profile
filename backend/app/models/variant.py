import uuid
from datetime import datetime
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class Variant(Base):
    __tablename__ = "variants"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base: Mapped[bool] = mapped_column(Boolean, default=False)
    job_description_text: Mapped[str | None] = mapped_column(Text)
    target_company: Mapped[str | None] = mapped_column(String(255))
    target_role: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    overrides: Mapped[list["VariantOverride"]] = relationship("VariantOverride", back_populates="variant", cascade="all, delete-orphan")


class VariantOverride(Base):
    __tablename__ = "variant_overrides"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    variant_id: Mapped[str] = mapped_column(String(36), ForeignKey("variants.id", ondelete="CASCADE"), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    field: Mapped[str] = mapped_column(String(100), nullable=False)
    original_value: Mapped[str | None] = mapped_column(Text)
    overridden_value: Mapped[str | None] = mapped_column(Text)

    variant: Mapped["Variant"] = relationship("Variant", back_populates="overrides")

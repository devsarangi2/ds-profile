import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, unique=True, index=True)
    ai_provider: Mapped[str] = mapped_column(String(50), default="openrouter")
    ai_model: Mapped[str] = mapped_column(String(255), default="openrouter/anthropic/claude-sonnet-4-6")
    ai_api_key_encrypted: Mapped[str | None] = mapped_column(String(2000))
    lmstudio_base_url: Mapped[str | None] = mapped_column(String(500))

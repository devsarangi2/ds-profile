from datetime import date as DateType
from pydantic import BaseModel


class CertificationCreate(BaseModel):
    name: str
    issuer: str | None = None
    date: DateType | None = None
    url: str | None = None
    badge_url: str | None = None


class CertificationUpdate(BaseModel):
    name: str | None = None
    issuer: str | None = None
    date: DateType | None = None
    url: str | None = None
    badge_url: str | None = None


class CertificationResponse(BaseModel):
    id: str
    user_id: str
    name: str
    issuer: str | None = None
    date: DateType | None = None
    url: str | None = None
    badge_url: str | None = None

    model_config = {"from_attributes": True}

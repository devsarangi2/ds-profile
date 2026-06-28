from pydantic import BaseModel


class SkillCreate(BaseModel):
    name: str
    category: str | None = None


class SkillUpdate(BaseModel):
    name: str | None = None
    category: str | None = None


class SkillResponse(BaseModel):
    id: str
    user_id: str
    name: str
    category: str | None = None

    model_config = {"from_attributes": True}

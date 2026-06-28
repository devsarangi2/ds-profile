import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.schemas.skill import SkillCreate, SkillUpdate


@pytest.mark.asyncio
async def test_list_skills_returns_empty_list():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result
    from app.services.skill_service import list_skills
    result = await list_skills(db, "user-1")
    assert result == []


@pytest.mark.asyncio
async def test_create_skill_sets_user_id():
    db = AsyncMock()
    data = SkillCreate(name="Python", category="Backend")
    from app.services.skill_service import create_skill
    skill = await create_skill(db, "user-1", data)
    assert skill.user_id == "user-1"
    assert skill.name == "Python"
    db.add.assert_called_once()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_skill_only_sets_provided_fields():
    db = AsyncMock()
    mock_skill = MagicMock()
    data = SkillUpdate(category="Frontend")
    from app.services.skill_service import update_skill
    await update_skill(db, mock_skill, data)
    assert mock_skill.category == "Frontend"
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_skill_calls_db_delete():
    db = AsyncMock()
    mock_skill = MagicMock()
    from app.services.skill_service import delete_skill
    await delete_skill(db, mock_skill)
    db.delete.assert_called_once_with(mock_skill)
    db.commit.assert_called_once()

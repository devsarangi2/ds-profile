import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.profile_service import get_profile_by_user, create_profile, update_profile
from app.schemas.profile import ProfileCreate, ProfileUpdate


@pytest.mark.asyncio
async def test_get_profile_returns_none_when_not_found():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    db.execute.return_value = mock_result
    result = await get_profile_by_user(db, "user-1")
    assert result is None


@pytest.mark.asyncio
async def test_get_profile_returns_profile_when_found():
    db = AsyncMock()
    mock_profile = MagicMock()
    mock_profile.user_id = "user-1"
    mock_profile.name = "Dev"
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = mock_profile
    db.execute.return_value = mock_result
    result = await get_profile_by_user(db, "user-1")
    assert result.name == "Dev"


@pytest.mark.asyncio
async def test_create_profile_sets_user_id_and_commits():
    db = AsyncMock()
    data = ProfileCreate(name="Dev Sarangi", email="dev@example.com")
    profile = await create_profile(db, "user-1", data)
    assert profile.user_id == "user-1"
    assert profile.name == "Dev Sarangi"
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_profile_only_sets_provided_fields():
    db = AsyncMock()
    mock_profile = MagicMock()
    mock_profile.name = "Old Name"
    data = ProfileUpdate(headline="New Headline")
    await update_profile(db, mock_profile, data)
    assert mock_profile.headline == "New Headline"
    db.commit.assert_called_once()

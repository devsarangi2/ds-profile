import pytest
from unittest.mock import patch
from fastapi import HTTPException
from app.core.auth import get_current_user_id


@pytest.mark.asyncio
async def test_returns_dev_user_when_auth_disabled():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = True
        mock_settings.default_user_id = "dev-user"
        user_id = await get_current_user_id(authorization=None)
    assert user_id == "dev-user"


@pytest.mark.asyncio
async def test_returns_dev_user_ignores_token_when_disabled():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = True
        mock_settings.default_user_id = "dev-user"
        user_id = await get_current_user_id(authorization="Bearer some-token")
    assert user_id == "dev-user"


@pytest.mark.asyncio
async def test_raises_401_when_auth_enabled_and_no_token():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = False
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_id(authorization=None)
    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_raises_401_when_auth_enabled_and_bad_format():
    with patch("app.core.auth.settings") as mock_settings:
        mock_settings.auth_disabled = False
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user_id(authorization="Basic abc123")
    assert exc_info.value.status_code == 401

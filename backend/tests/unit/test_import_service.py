import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.models.settings import UserSettings


def make_settings():
    s = MagicMock(spec=UserSettings)
    s.ai_provider = "lmstudio"
    s.ai_model = "local/model"
    s.ai_api_key_encrypted = None
    s.lmstudio_base_url = "http://100.82.183.76:8080/v1"
    return s


@pytest.mark.asyncio
async def test_extract_returns_empty_for_no_text():
    from app.services.import_service import extract_from_elements
    result = await extract_from_elements([], make_settings())
    assert result == {}


@pytest.mark.asyncio
async def test_extract_calls_litellm():
    from app.services.import_service import extract_from_elements
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content='{"name": "Dev Sarangi"}'))]

    with patch("app.services.import_service.litellm.acompletion", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = mock_response
        result = await extract_from_elements(
            [{"text": "Dev Sarangi\nSoftware Engineer"}],
            make_settings(),
        )
    assert result.get("name") == "Dev Sarangi"

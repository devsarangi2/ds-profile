import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.models.settings import UserSettings


def make_settings(provider="lmstudio"):
    s = MagicMock(spec=UserSettings)
    s.ai_provider = provider
    s.ai_model = "local/model"
    s.ai_api_key_encrypted = None
    s.lmstudio_base_url = "http://100.82.183.76:8080/v1"
    return s


@pytest.mark.asyncio
async def test_improve_text_calls_litellm():
    mock_settings = make_settings()
    with patch("app.services.ai_service.litellm.acompletion", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value.choices = [MagicMock(message=MagicMock(content="Improved text"))]
        from app.services.ai_service import improve_text
        result = await improve_text("original", "context", mock_settings)
    assert result == "Improved text"
    mock_llm.assert_called_once()


@pytest.mark.asyncio
async def test_improve_text_passes_lmstudio_kwargs():
    mock_settings = make_settings("lmstudio")
    with patch("app.services.ai_service.litellm.acompletion", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value.choices = [MagicMock(message=MagicMock(content="Better"))]
        from app.services.ai_service import improve_text
        await improve_text("text", "ctx", mock_settings)
    call_kwargs = mock_llm.call_args.kwargs
    assert call_kwargs.get("api_base") == "http://100.82.183.76:8080/v1"
    assert call_kwargs.get("api_key") == "lm-studio"

import pytest
from unittest.mock import MagicMock
from app.services.ai_service import build_litellm_kwargs
from app.models.settings import UserSettings


def make_settings(**kwargs) -> UserSettings:
    defaults = {
        "id": "test-id",
        "user_id": "test-user",
        "ai_provider": "lmstudio",
        "ai_model": "local/model",
        "ai_api_key_encrypted": None,
        "lmstudio_base_url": "http://100.82.183.76:8080/v1",
    }
    defaults.update(kwargs)
    s = MagicMock(spec=UserSettings)
    for k, v in defaults.items():
        setattr(s, k, v)
    return s


def test_lmstudio_sets_api_base():
    s = make_settings(ai_provider="lmstudio", lmstudio_base_url="http://100.82.183.76:8080/v1")
    kwargs = build_litellm_kwargs(s)
    assert kwargs["api_base"] == "http://100.82.183.76:8080/v1"
    assert kwargs["api_key"] == "lm-studio"


def test_lmstudio_uses_default_url_when_none():
    s = make_settings(ai_provider="lmstudio", lmstudio_base_url=None)
    kwargs = build_litellm_kwargs(s)
    assert kwargs["api_base"] == "http://100.82.183.76:8080/v1"


def test_openrouter_includes_model():
    s = make_settings(
        ai_provider="openrouter",
        ai_model="openrouter/anthropic/claude-sonnet-4-6",
        ai_api_key_encrypted="sk-test",
        lmstudio_base_url=None,
    )
    kwargs = build_litellm_kwargs(s)
    assert kwargs["model"] == "openrouter/anthropic/claude-sonnet-4-6"
    assert kwargs.get("api_key") == "sk-test"


def test_no_api_key_when_none():
    s = make_settings(ai_provider="openrouter", ai_api_key_encrypted=None, lmstudio_base_url=None)
    kwargs = build_litellm_kwargs(s)
    assert "api_key" not in kwargs

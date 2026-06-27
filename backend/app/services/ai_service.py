import litellm
from app.models.settings import UserSettings


def _decrypt_key(encrypted: str) -> str:
    # Simple XOR placeholder — replace with real encryption in prod
    # For MVP dev, keys are stored plaintext (encrypted col used as-is)
    return encrypted


def build_litellm_kwargs(user_settings: UserSettings) -> dict:
    provider = user_settings.ai_provider
    model = user_settings.ai_model

    kwargs: dict = {"model": model}

    if provider == "lmstudio":
        base_url = user_settings.lmstudio_base_url or "http://100.82.183.76:8080/v1"
        kwargs["api_base"] = base_url
        kwargs["api_key"] = "lm-studio"
    else:
        if user_settings.ai_api_key_encrypted:
            kwargs["api_key"] = _decrypt_key(user_settings.ai_api_key_encrypted)

    return kwargs


async def improve_text(original: str, context: str, user_settings: UserSettings) -> str:
    kwargs = build_litellm_kwargs(user_settings)
    response = await litellm.acompletion(
        messages=[
            {
                "role": "system",
                "content": (
                    "You improve professional profile descriptions. "
                    "Be concise, specific, and impact-focused. "
                    "Return only the improved text, no preamble or explanation."
                ),
            },
            {
                "role": "user",
                "content": f"Context: {context}\n\nImprove this text:\n{original}",
            },
        ],
        **kwargs,
    )
    return response.choices[0].message.content.strip()

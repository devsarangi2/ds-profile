import json
import litellm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.variant import Variant, VariantOverride
from app.models.employment import Employment
from app.models.project import Project
from app.models.profile import Profile
from app.schemas.variant import VariantCreate, OverrideSuggestion
from app.models.settings import UserSettings
from app.services.ai_service import build_litellm_kwargs


async def list_variants(db: AsyncSession, user_id: str) -> list[Variant]:
    result = await db.execute(
        select(Variant)
        .where(Variant.user_id == user_id)
        .options(selectinload(Variant.overrides))
        .order_by(Variant.created_at.desc())
    )
    variants = list(result.scalars().all())
    for v in variants:
        v.override_count = len(v.overrides)
    return variants


async def get_variant(db: AsyncSession, variant_id: str, user_id: str) -> Variant | None:
    result = await db.execute(
        select(Variant)
        .where(Variant.id == variant_id, Variant.user_id == user_id)
        .options(selectinload(Variant.overrides))
    )
    v = result.scalar_one_or_none()
    if v:
        v.override_count = len(v.overrides)
    return v


async def create_variant(db: AsyncSession, user_id: str, data: VariantCreate) -> Variant:
    variant = Variant(
        user_id=user_id,
        profile_id=data.profile_id,
        name=data.name,
        base=False,
        job_description_text=data.job_description_text,
        target_company=data.target_company,
        target_role=data.target_role,
    )
    db.add(variant)
    await db.commit()
    await db.refresh(variant)
    variant.override_count = 0
    return variant


async def add_override(
    db: AsyncSession,
    variant_id: str,
    entity_type: str,
    entity_id: str,
    field: str,
    original_value: str | None,
    overridden_value: str,
) -> VariantOverride:
    override = VariantOverride(
        variant_id=variant_id,
        entity_type=entity_type,
        entity_id=entity_id,
        field=field,
        original_value=original_value,
        overridden_value=overridden_value,
    )
    db.add(override)
    await db.commit()
    await db.refresh(override)
    return override


async def delete_variant(db: AsyncSession, variant_id: str, user_id: str) -> bool:
    variant = await get_variant(db, variant_id, user_id)
    if not variant:
        return False
    await db.delete(variant)
    await db.commit()
    return True


GENERATE_PROMPT = """You are a professional resume tailoring assistant.

Given a job description and the candidate's employment history, suggest improvements to specific description fields to better match the JD.

Return a JSON array of suggestions:
[
  {{
    "entity_type": "employment" or "project",
    "entity_id": "the UUID of the record",
    "field": "description" or "impact",
    "original": "the original text",
    "suggested": "the improved text tailored to the JD"
  }}
]

Tailor language to highlight skills and experiences most relevant to the job.
Be specific and quantify where possible.
Return ONLY the JSON array, no preamble.

Job Description:
{jd}

Target Role: {role} at {company}

Employment History:
{history}
"""


async def generate_variant_suggestions(
    db: AsyncSession,
    profile_id: str,
    user_id: str,
    job_description: str,
    target_company: str,
    target_role: str,
    user_settings: UserSettings,
) -> list[OverrideSuggestion]:
    # Load employment + projects
    emp_result = await db.execute(
        select(Employment)
        .where(Employment.user_id == user_id, Employment.profile_id == profile_id)
        .options(selectinload(Employment.projects))
    )
    employments = list(emp_result.scalars().all())

    history_parts = []
    for emp in employments:
        history_parts.append(
            f"Employment [{emp.id}]: {emp.job_title} at {emp.company}\n"
            f"Description: {emp.description or 'None'}"
        )
        for proj in emp.projects:
            history_parts.append(
                f"  Project [{proj.id}]: {proj.name}\n"
                f"  Description: {proj.description or 'None'}\n"
                f"  Impact: {proj.impact or 'None'}"
            )

    if not history_parts:
        return []

    kwargs = build_litellm_kwargs(user_settings)
    response = await litellm.acompletion(
        messages=[
            {
                "role": "user",
                "content": GENERATE_PROMPT.format(
                    jd=job_description[:4000],
                    role=target_role,
                    company=target_company,
                    history="\n\n".join(history_parts)[:6000],
                ),
            }
        ],
        response_format={"type": "json_object"},
        **kwargs,
    )
    raw = response.choices[0].message.content.strip()
    try:
        data = json.loads(raw)
        # Handle both array and {"suggestions": [...]}
        if isinstance(data, list):
            items = data
        else:
            items = data.get("suggestions", data.get("data", []))
        return [OverrideSuggestion(**item) for item in items]
    except Exception:
        return []

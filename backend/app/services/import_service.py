import json
import litellm
from app.models.settings import UserSettings
from app.services.ai_service import build_litellm_kwargs


EXTRACTION_PROMPT = """You are a resume parser. Extract structured profile information from the resume text below.

Return a JSON object with this exact structure:
{{
  "name": "string or null",
  "headline": "string or null",
  "summary": "string or null",
  "location": "string or null",
  "email": "string or null",
  "website": "string or null",
  "employment": [
    {{
      "company": "string",
      "job_title": "string",
      "employment_type": "full-time|part-time|contract|freelance|self-employed|open-source|personal",
      "location": "string or null",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null",
      "current": true/false,
      "description": "string or null",
      "projects": [
        {{
          "name": "string",
          "description": "string or null",
          "roles": ["list of freeform role strings"],
          "tech_stack": ["list of technologies"],
          "impact": "string or null"
        }}
      ]
    }}
  ],
  "skills": [
    {{"name": "string", "category": "string or null"}}
  ]
}}

Return ONLY valid JSON, no explanation.

Resume text:
{text}
"""


async def extract_from_elements(elements: list[dict], user_settings: UserSettings) -> dict:
    text_parts = [e.get("text", "") for e in elements if e.get("text", "").strip()]
    full_text = "\n".join(text_parts)
    if not full_text.strip():
        return {}

    kwargs = build_litellm_kwargs(user_settings)
    response = await litellm.acompletion(
        messages=[
            {"role": "user", "content": EXTRACTION_PROMPT.format(text=full_text[:8000])},
        ],
        response_format={"type": "json_object"},
        **kwargs,
    )
    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        import re
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            return json.loads(match.group())
        return {}

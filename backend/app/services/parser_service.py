import httpx
from app.core.config import settings


async def parse_pdf(file_bytes: bytes, filename: str) -> list[dict]:
    if settings.unstructured_backend == "local":
        return await _parse_via_local(file_bytes, filename)
    return await _parse_via_cloud(file_bytes, filename)


async def _parse_via_local(file_bytes: bytes, filename: str) -> list[dict]:
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.unstructured_base_url}/general/v0/general",
            files={"files": (filename, file_bytes, "application/pdf")},
        )
        response.raise_for_status()
        return response.json()


async def _parse_via_cloud(file_bytes: bytes, filename: str) -> list[dict]:
    try:
        from unstructured_client import UnstructuredClient
        from unstructured_client.models.shared import Files, PartitionParameters

        client = UnstructuredClient(api_key_auth=settings.unstructured_api_key)
        req = PartitionParameters(
            files=Files(content=file_bytes, file_name=filename),
            strategy="hi_res",
        )
        response = await client.general.partition_async(req)
        return [{"type": e.type, "text": e.text} for e in response.elements]
    except ImportError:
        raise RuntimeError("unstructured-client package not installed")

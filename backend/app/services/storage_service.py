import uuid
import mimetypes
import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from app.core.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.storage_endpoint,
        aws_access_key_id=settings.storage_access_key,
        aws_secret_access_key=settings.storage_secret_key,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def ensure_bucket_exists(client) -> None:
    try:
        client.head_bucket(Bucket=settings.storage_bucket)
    except ClientError:
        client.create_bucket(Bucket=settings.storage_bucket)


async def upload_file(file_bytes: bytes, filename: str, content_type: str) -> str:
    ext = mimetypes.guess_extension(content_type) or ""
    key = f"uploads/{uuid.uuid4()}{ext}"
    client = get_s3_client()
    ensure_bucket_exists(client)
    client.put_object(
        Bucket=settings.storage_bucket,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"{settings.storage_endpoint}/{settings.storage_bucket}/{key}"

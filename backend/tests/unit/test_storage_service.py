import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from app.services.storage_service import upload_file


@pytest.mark.asyncio
async def test_upload_file_returns_url():
    mock_client = MagicMock()
    mock_client.head_bucket.return_value = {}
    with patch("app.services.storage_service.get_s3_client", return_value=mock_client), \
         patch("app.services.storage_service.settings") as mock_settings:
        mock_settings.storage_endpoint = "http://localhost:9000"
        mock_settings.storage_bucket = "test-bucket"
        url = await upload_file(b"fake-image", "test.jpg", "image/jpeg")
    assert url.startswith("http://localhost:9000/test-bucket/uploads/")
    mock_client.put_object.assert_called_once()


@pytest.mark.asyncio
async def test_upload_file_creates_bucket_when_missing():
    from botocore.exceptions import ClientError
    mock_client = MagicMock()
    mock_client.head_bucket.side_effect = ClientError({"Error": {"Code": "404"}}, "HeadBucket")
    with patch("app.services.storage_service.get_s3_client", return_value=mock_client), \
         patch("app.services.storage_service.settings") as mock_settings:
        mock_settings.storage_endpoint = "http://localhost:9000"
        mock_settings.storage_bucket = "test-bucket"
        await upload_file(b"data", "file.pdf", "application/pdf")
    mock_client.create_bucket.assert_called_once_with(Bucket="test-bucket")


@pytest.mark.asyncio
async def test_upload_file_uses_uuid_key():
    mock_client = MagicMock()
    mock_client.head_bucket.return_value = {}
    with patch("app.services.storage_service.get_s3_client", return_value=mock_client), \
         patch("app.services.storage_service.settings") as mock_settings:
        mock_settings.storage_endpoint = "http://localhost:9000"
        mock_settings.storage_bucket = "bucket"
        url = await upload_file(b"data", "photo.png", "image/png")
    key_used = mock_client.put_object.call_args.kwargs["Key"]
    assert key_used.startswith("uploads/")
    assert len(key_used) > len("uploads/")

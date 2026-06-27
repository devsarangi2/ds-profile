import pytest
from unittest.mock import AsyncMock, MagicMock
from app.schemas.certification import CertificationCreate, CertificationUpdate


@pytest.mark.asyncio
async def test_list_certifications_returns_empty_list():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result
    from app.services.certification_service import list_certifications
    result = await list_certifications(db, "user-1")
    assert result == []


@pytest.mark.asyncio
async def test_create_certification_sets_user_id():
    db = AsyncMock()
    data = CertificationCreate(name="AWS Solutions Architect", issuer="Amazon")
    from app.services.certification_service import create_certification
    cert = await create_certification(db, "user-1", data)
    assert cert.user_id == "user-1"
    assert cert.name == "AWS Solutions Architect"
    db.add.assert_called_once()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_update_certification_only_sets_provided_fields():
    db = AsyncMock()
    mock_cert = MagicMock()
    data = CertificationUpdate(issuer="New Issuer")
    from app.services.certification_service import update_certification
    await update_certification(db, mock_cert, data)
    assert mock_cert.issuer == "New Issuer"
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_certification_calls_db_delete():
    db = AsyncMock()
    mock_cert = MagicMock()
    from app.services.certification_service import delete_certification
    await delete_certification(db, mock_cert)
    db.delete.assert_called_once_with(mock_cert)
    db.commit.assert_called_once()

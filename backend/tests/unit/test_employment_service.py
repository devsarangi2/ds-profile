import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.employment_service import list_employment, create_employment, update_employment, delete_employment
from app.schemas.employment import EmploymentCreate, EmploymentUpdate


@pytest.mark.asyncio
async def test_list_employment_returns_empty_list():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result
    result = await list_employment(db, "user-1")
    assert result == []


@pytest.mark.asyncio
async def test_create_employment_sets_user_id_and_profile_id():
    db = AsyncMock()
    data = EmploymentCreate(company="Acme", job_title="Engineer", employment_type="full-time")
    emp = await create_employment(db, "user-1", "profile-1", data)
    assert emp.user_id == "user-1"
    assert emp.profile_id == "profile-1"
    assert emp.company == "Acme"
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_employment_only_sets_provided_fields():
    db = AsyncMock()
    mock_emp = MagicMock()
    data = EmploymentUpdate(job_title="Senior Engineer")
    await update_employment(db, mock_emp, data)
    assert mock_emp.job_title == "Senior Engineer"
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_employment_calls_db_delete():
    db = AsyncMock()
    mock_emp = MagicMock()
    await delete_employment(db, mock_emp)
    db.delete.assert_called_once_with(mock_emp)
    db.commit.assert_called_once()

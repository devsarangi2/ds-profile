import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.project_service import list_projects, create_project, update_project, delete_project, add_role, remove_role
from app.schemas.project import ProjectCreate, ProjectUpdate


@pytest.mark.asyncio
async def test_list_projects_returns_empty_list():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []
    db.execute.return_value = mock_result
    result = await list_projects(db, "user-1")
    assert result == []


@pytest.mark.asyncio
async def test_create_project_sets_user_id_and_employment_id():
    db = AsyncMock()
    data = ProjectCreate(name="My Project")
    project = await create_project(db, "user-1", "emp-1", data)
    assert project.user_id == "user-1"
    assert project.employment_id == "emp-1"
    assert project.name == "My Project"
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


@pytest.mark.asyncio
async def test_update_project_only_sets_provided_fields():
    db = AsyncMock()
    mock_project = MagicMock()
    data = ProjectUpdate(description="New desc")
    await update_project(db, mock_project, data)
    assert mock_project.description == "New desc"
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_project_calls_db_delete():
    db = AsyncMock()
    mock_project = MagicMock()
    await delete_project(db, mock_project)
    db.delete.assert_called_once_with(mock_project)
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_add_role_commits_and_returns_role():
    db = AsyncMock()
    role = await add_role(db, "proj-1", "user-1", "Developer")
    assert role.project_id == "proj-1"
    assert role.name == "Developer"
    db.add.assert_called_once()
    db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_remove_role_returns_false_when_not_found():
    db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    db.execute.return_value = mock_result
    result = await remove_role(db, "role-1", "proj-1", "user-1")
    assert result is False

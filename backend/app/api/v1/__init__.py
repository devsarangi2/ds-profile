from fastapi import APIRouter
from app.api.v1.endpoints import profiles, employment, projects

router = APIRouter()
router.include_router(profiles.router)
router.include_router(employment.router)
router.include_router(projects.router)

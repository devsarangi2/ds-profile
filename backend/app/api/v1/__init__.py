from fastapi import APIRouter
from app.api.v1.endpoints import profiles, employment, projects, certifications
from app.api.v1.endpoints.skills import skills_router, project_skills_router, employment_skills_router

router = APIRouter()
router.include_router(profiles.router)
router.include_router(employment.router)
router.include_router(projects.router)
router.include_router(skills_router)
router.include_router(project_skills_router)
router.include_router(employment_skills_router)
router.include_router(certifications.router)

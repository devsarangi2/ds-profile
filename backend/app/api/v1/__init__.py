from fastapi import APIRouter
from app.api.v1.endpoints import profiles

router = APIRouter()
router.include_router(profiles.router)

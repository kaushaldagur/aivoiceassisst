from fastapi import APIRouter
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/integrations")
async def integration_status(verify: bool = False) -> dict:
    return {"gemini": await gemini_service.connection_status(verify=verify)}

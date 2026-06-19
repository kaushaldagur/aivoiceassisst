from fastapi import APIRouter

from app.models.settings import GeminiKeyRequest, UserSettings
from app.services.storage_service import storage_service
from app.services.gemini_service import gemini_service
from app.core.constants import BASE_DIR
from dotenv import set_key

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("")
async def get_settings() -> dict:
    return {"settings": storage_service.get_settings(), "storage": storage_service.storage_usage()}


@router.put("")
async def update_settings(settings: UserSettings) -> dict:
    return {"settings": storage_service.save_settings(settings), "storage": storage_service.storage_usage()}


@router.post("/reset")
async def reset_application() -> dict:
    storage_service.reset()
    return {"message": "Application data was reset.", "settings": storage_service.get_settings()}


@router.post("/gemini")
async def save_gemini_key(request: GeminiKeyRequest) -> dict:
    status = await gemini_service.validate_key(request.apiKey)
    env_path = BASE_DIR / ".env"
    set_key(str(env_path), "GEMINI_API_KEY", request.apiKey.strip())
    return {"message": "Gemini connected successfully.", "gemini": status}

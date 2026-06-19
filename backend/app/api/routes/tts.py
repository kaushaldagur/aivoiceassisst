from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.models.tts import TtsRequest
from app.services.text_to_speech_service import tts_service

router = APIRouter(prefix="/tts", tags=["tts"])


@router.post("/synthesize")
async def synthesize(request: TtsRequest) -> dict:
    audio_url = await tts_service.synthesize(request.text, request.language, request.speed, request.volume)
    return {"audioUrl": audio_url}


@router.get("/audio/{file_name}")
async def get_audio(file_name: str):
    return FileResponse(tts_service.audio_path(file_name), media_type="audio/mpeg")

from fastapi import APIRouter, File, UploadFile

from app.services.speech_to_text_service import speech_to_text_service

router = APIRouter(prefix="/speech", tags=["speech"])


@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> dict:
    return await speech_to_text_service.transcribe(file)

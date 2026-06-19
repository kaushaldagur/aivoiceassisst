from pathlib import Path
from uuid import uuid4

import edge_tts

from app.core.constants import AUDIO_DIR, SUPPORTED_LANGUAGES
from app.core.errors import AppError


class TextToSpeechService:
    async def synthesize(self, text: str, language: str, speed: float = 1.0, volume: float = 1.0) -> str:
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        voice = SUPPORTED_LANGUAGES.get(language, SUPPORTED_LANGUAGES["English"])["voice"]
        file_name = f"{uuid4()}.mp3"
        output_path = AUDIO_DIR / file_name
        rate = int((speed - 1.0) * 100)
        volume_delta = int((volume - 1.0) * 100)
        try:
            communicate = edge_tts.Communicate(
                text=text,
                voice=voice,
                rate=f"{rate:+d}%",
                volume=f"{volume_delta:+d}%",
            )
            await communicate.save(str(output_path))
        except Exception as exc:
            raise AppError(f"Text-to-speech failed: {exc}") from exc
        return f"/api/tts/audio/{file_name}"

    def audio_path(self, file_name: str) -> Path:
        path = AUDIO_DIR / file_name
        if not path.exists():
            raise AppError("Audio file was not found.")
        return path


tts_service = TextToSpeechService()

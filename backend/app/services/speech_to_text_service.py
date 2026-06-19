import tempfile
from pathlib import Path

from fastapi import UploadFile

from app.core.errors import AppError


class SpeechToTextService:
    def __init__(self) -> None:
        self._whisper_model = None

    def _load_whisper(self):
        if self._whisper_model is None:
            from faster_whisper import WhisperModel

            self._whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
        return self._whisper_model

    async def transcribe(self, file: UploadFile) -> dict:
        suffix = Path(file.filename or "audio.webm").suffix or ".webm"
        data = await file.read()
        if not data:
            raise AppError("No audio was received.")
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            temp.write(data)
            temp_path = temp.name
        try:
            return self._transcribe_with_whisper(temp_path)
        except Exception:
            try:
                return self._transcribe_with_speech_recognition(temp_path)
            except Exception as exc:
                raise AppError("Speech recognition failed. Please try again or use typed input.") from exc
        finally:
            Path(temp_path).unlink(missing_ok=True)

    def _transcribe_with_whisper(self, path: str) -> dict:
        model = self._load_whisper()
        segments, _ = model.transcribe(path, vad_filter=True)
        text = " ".join(segment.text.strip() for segment in segments).strip()
        if not text:
            raise AppError("No speech was detected.")
        return {"text": text, "engine": "faster-whisper"}

    def _transcribe_with_speech_recognition(self, path: str) -> dict:
        import speech_recognition as sr

        recognizer = sr.Recognizer()
        with sr.AudioFile(path) as source:
            audio = recognizer.record(source)
        text = recognizer.recognize_google(audio)
        return {"text": text, "engine": "speech-recognition"}


speech_to_text_service = SpeechToTextService()

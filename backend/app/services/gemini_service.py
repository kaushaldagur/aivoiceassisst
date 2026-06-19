import json
import re

from google import genai
from google.genai import types
from google.genai.errors import ClientError

from app.core.config import get_settings
from app.core.errors import AppError

FALLBACK_MODELS = (
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
)


class GeminiService:
    def __init__(self) -> None:
        self._api_key_override: str | None = None
        self._client: genai.Client | None = None
        self._active_model: str | None = None

    def _api_key(self) -> str:
        value = self._api_key_override or get_settings().gemini_api_key
        placeholders = {"", "your_gemini_api_key_here", "your_api_key"}
        if value.strip().lower() in placeholders:
            raise AppError("Gemini is not connected. Add a free Gemini API key in Settings.")
        return value.strip()

    def _get_client(self) -> genai.Client:
        if self._client is None:
            self._client = genai.Client(api_key=self._api_key())
        return self._client

    @property
    def model_name(self) -> str:
        return self._active_model or get_settings().gemini_model

    def _model_candidates(self) -> list[str]:
        primary = get_settings().gemini_model.strip()
        candidates = [primary]
        for model in FALLBACK_MODELS:
            if model not in candidates:
                candidates.append(model)
        return candidates

    def _friendly_error(self, exc: Exception) -> str:
        message = str(exc)
        if isinstance(exc, ClientError):
            message = str(exc)
        if "API_KEY_INVALID" in message or "API key not valid" in message:
            return "The Gemini API key is invalid. Create a free key in Google AI Studio and update it in Settings."
        if "429" in message or "RESOURCE_EXHAUSTED" in message:
            retry_match = re.search(r"retry in ([0-9.]+)s", message, flags=re.I)
            if retry_match:
                seconds = max(1, int(float(retry_match.group(1))))
                return f"Gemini free-tier limit reached for this model. Try again in about {seconds} seconds or add another API key in Settings."
            return "Gemini free-tier limit reached for today. Wait a few minutes, switch models in Settings, or use another free API key."
        if "404" in message or "NOT_FOUND" in message:
            return "The configured Gemini model is unavailable. Update GEMINI_MODEL in backend/.env."
        return message or "Gemini request failed. Please try again."

    def _is_quota_error(self, exc: Exception) -> bool:
        message = str(exc)
        return "429" in message or "RESOURCE_EXHAUSTED" in message

    def _is_model_missing(self, exc: Exception) -> bool:
        message = str(exc)
        return "404" in message or "NOT_FOUND" in message

    async def _generate_with_fallback(
        self,
        prompt: str,
        *,
        temperature: float,
        max_output_tokens: int,
        response_mime_type: str | None = None,
    ) -> tuple[str, str]:
        last_error: Exception | None = None
        config_kwargs: dict = {
            "temperature": temperature,
            "max_output_tokens": max_output_tokens,
        }
        if response_mime_type:
            config_kwargs["response_mime_type"] = response_mime_type

        for model in self._model_candidates():
            try:
                response = await self._get_client().aio.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(**config_kwargs),
                )
                text = getattr(response, "text", "") or ""
                if not text.strip():
                    raise AppError("Gemini returned an empty response.")
                self._active_model = model
                return text.strip(), model
            except AppError:
                raise
            except Exception as exc:
                last_error = exc
                if self._is_quota_error(exc) or self._is_model_missing(exc):
                    continue
                raise AppError(self._friendly_error(exc)) from exc

        if last_error is not None:
            raise AppError(self._friendly_error(last_error)) from last_error
        raise AppError("Gemini request failed. Please try again.")

    async def generate(self, prompt: str) -> str:
        try:
            text, _ = await self._generate_with_fallback(
                prompt,
                temperature=0.45,
                max_output_tokens=2048,
            )
            return text
        except AppError:
            raise
        except Exception as exc:
            raise AppError(self._friendly_error(exc)) from exc

    async def generate_json(self, prompt: str) -> dict:
        try:
            text, _ = await self._generate_with_fallback(
                prompt,
                temperature=0.2,
                max_output_tokens=2048,
                response_mime_type="application/json",
            )
        except AppError:
            raise
        except Exception as exc:
            raise AppError(self._friendly_error(exc)) from exc
        match = re.search(r"\{.*\}", text, flags=re.S)
        if not match:
            raise AppError("Gemini did not return valid JSON.")
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError as exc:
            raise AppError("Gemini returned malformed JSON.") from exc

    async def validate_key(self, api_key: str) -> dict:
        cleaned = api_key.strip()
        try:
            client = genai.Client(api_key=cleaned)
            models = await client.aio.models.list()
            found = False
            async for model in models:
                if model.name and "gemini" in model.name.lower():
                    found = True
                    break
            if not found:
                raise AppError("This Gemini API key could not access any Gemini models.")
        except AppError:
            raise
        except Exception as exc:
            if "API_KEY_INVALID" in str(exc) or "API key not valid" in str(exc):
                raise AppError("This Gemini API key is invalid. Check the key from Google AI Studio.") from exc
            raise AppError("This Gemini API key could not be validated. Check the key and free-tier access.") from exc

        self._api_key_override = cleaned
        self._client = client
        self._active_model = None
        return {"connected": True, "model": get_settings().gemini_model}

    async def connection_status(self, verify: bool = False) -> dict:
        try:
            self._api_key()
        except AppError:
            return {"configured": False, "connected": False, "model": get_settings().gemini_model}

        if not verify:
            return {
                "configured": True,
                "connected": None,
                "model": self.model_name,
            }

        try:
            client = self._get_client()
            models = await client.aio.models.list()
            async for _ in models:
                break
            return {
                "configured": True,
                "connected": True,
                "model": self.model_name,
            }
        except Exception as exc:
            return {
                "configured": True,
                "connected": False,
                "model": get_settings().gemini_model,
                "message": self._friendly_error(exc),
            }


gemini_service = GeminiService()

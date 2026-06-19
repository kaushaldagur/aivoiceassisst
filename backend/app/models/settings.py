from pydantic import BaseModel, Field


class UserSettings(BaseModel):
    theme: str = "dark"
    language: str = "English"
    voiceSpeed: float = Field(default=1.0, ge=0.5, le=2.0)
    voiceVolume: float = Field(default=1.0, ge=0.0, le=1.0)
    wakeWordEnabled: bool = False
    currentMode: str = "general"


class GeminiKeyRequest(BaseModel):
    apiKey: str = Field(min_length=20)

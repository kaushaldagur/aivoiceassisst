from pydantic import BaseModel, Field


class TtsRequest(BaseModel):
    text: str = Field(min_length=1)
    language: str = "English"
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    volume: float = Field(default=1.0, ge=0.0, le=1.0)


class TtsResponse(BaseModel):
    audioUrl: str

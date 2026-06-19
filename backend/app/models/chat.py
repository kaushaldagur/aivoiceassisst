from datetime import datetime
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    mode: str = "general"
    language: str = "English"


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    role: Literal["user", "assistant"]
    content: str
    mode: str = "general"
    language: str = "English"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    audioPath: str | None = None


class ChatResponse(BaseModel):
    userMessage: ChatMessage
    assistantMessage: ChatMessage
    audioUrl: str | None = None
    status: str = "completed"

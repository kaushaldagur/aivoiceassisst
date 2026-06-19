from pydantic import BaseModel


class TranscriptionResponse(BaseModel):
    text: str
    engine: str

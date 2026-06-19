from pydantic import BaseModel, Field


class PdfInfo(BaseModel):
    fileName: str | None = None
    characterCount: int = 0
    hasPdf: bool = False


class PdfQuestionRequest(BaseModel):
    question: str = Field(min_length=1)
    language: str = "English"


class PdfQuestionResponse(BaseModel):
    answer: str
    sourceReference: str = "Current uploaded PDF"

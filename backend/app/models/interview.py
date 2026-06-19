from datetime import datetime
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    topic: str
    difficulty: str
    language: str = "English"


class InterviewAnswerRequest(BaseModel):
    sessionId: str
    answer: str = Field(min_length=1)


class InterviewEndRequest(BaseModel):
    sessionId: str


class InterviewQuestionResponse(BaseModel):
    sessionId: str
    question: str
    questionNumber: int
    totalQuestions: int = 5


class InterviewEvaluation(BaseModel):
    strengths: list[str]
    weaknesses: list[str]
    correctExplanation: str
    improvedAnswer: str
    score: int = Field(ge=0, le=10)


class InterviewAnswerResponse(BaseModel):
    evaluation: InterviewEvaluation
    nextQuestion: str | None = None
    questionNumber: int
    isComplete: bool = False


class InterviewReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    topic: str
    difficulty: str
    overallScore: int
    topicWiseScore: dict[str, int]
    strengths: list[str]
    weakAreas: list[str]
    recommendations: list[str]
    turns: list[dict[str, Any]]
    createdAt: datetime = Field(default_factory=datetime.utcnow)

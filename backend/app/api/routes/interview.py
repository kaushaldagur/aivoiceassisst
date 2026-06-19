from fastapi import APIRouter

from app.models.interview import InterviewAnswerRequest, InterviewEndRequest, InterviewStartRequest
from app.services.interview_service import interview_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/interview", tags=["interview"])


@router.post("/start")
async def start_interview(request: InterviewStartRequest) -> dict:
    return await interview_service.start(request.topic, request.difficulty, request.language)


@router.post("/answer")
async def answer_question(request: InterviewAnswerRequest) -> dict:
    return await interview_service.answer(request.sessionId, request.answer)


@router.post("/end")
async def end_interview(request: InterviewEndRequest):
    return {"report": interview_service.end(request.sessionId)}


@router.get("/reports")
async def reports() -> dict:
    return {"reports": storage_service.get_reports()}


@router.delete("/reports")
async def clear_reports() -> dict:
    storage_service.clear_reports()
    return {"message": "Interview reports deleted."}

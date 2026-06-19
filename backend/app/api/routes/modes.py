from fastapi import APIRouter

from app.core.constants import AI_MODES, INTERVIEW_DIFFICULTIES, INTERVIEW_TOPICS, SUPPORTED_LANGUAGES

router = APIRouter(prefix="/modes", tags=["modes"])


@router.get("")
async def get_modes() -> dict:
    return {
        "modes": list(AI_MODES.values()),
        "languages": list(SUPPORTED_LANGUAGES.keys()),
        "interviewTopics": INTERVIEW_TOPICS,
        "interviewDifficulties": INTERVIEW_DIFFICULTIES,
    }

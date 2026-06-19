from fastapi import APIRouter, Response

from app.models.chat import ChatRequest
from app.services.chat_service import chat_service
from app.services.storage_service import storage_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message")
async def send_message(request: ChatRequest):
    return await chat_service.send_message(request.message, request.mode, request.language)


@router.get("/history")
async def get_history() -> dict:
    return {"messages": storage_service.get_messages()}


@router.delete("/history")
async def clear_history() -> dict:
    storage_service.clear_messages()
    return {"message": "Chat history cleared."}


@router.delete("/history/{message_id}")
async def delete_message(message_id: str) -> dict:
    storage_service.delete_message(message_id)
    return {"message": "Message deleted."}


@router.get("/history/export")
async def export_history() -> Response:
    text = storage_service.export_messages_txt()
    return Response(
        content=text,
        media_type="text/plain",
        headers={"Content-Disposition": 'attachment; filename="nova-chat-history.txt"'},
    )

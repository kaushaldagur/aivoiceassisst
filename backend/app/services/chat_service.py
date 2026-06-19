from app.models.chat import ChatMessage, ChatResponse
from app.services.gemini_service import gemini_service
from app.services.prompt_service import chat_prompt
from app.services.storage_service import storage_service
from app.services.text_to_speech_service import tts_service
from app.core.errors import AppError


class ChatService:
    async def send_message(self, message: str, mode: str, language: str) -> ChatResponse:
        user_message = ChatMessage(role="user", content=message, mode=mode, language=language)
        history = storage_service.get_messages()
        response_text = await gemini_service.generate(chat_prompt(message, mode, language, history))
        settings = storage_service.get_settings()
        audio_url = None
        try:
            audio_url = await tts_service.synthesize(response_text, language, settings.voiceSpeed, settings.voiceVolume)
        except AppError:
            # Text chat remains usable when the external speech service is unavailable.
            audio_url = None
        assistant_message = ChatMessage(
            role="assistant",
            content=response_text,
            mode=mode,
            language=language,
            audioPath=audio_url,
        )
        storage_service.add_messages([user_message, assistant_message])
        return ChatResponse(userMessage=user_message, assistantMessage=assistant_message, audioUrl=audio_url)


chat_service = ChatService()

from pathlib import Path
from typing import Any

from app.core.constants import (
    AUDIO_DIR,
    CHAT_HISTORY_LIMIT,
    DEFAULT_SETTINGS,
    INTERVIEW_REPORT_LIMIT,
    STORAGE_DIR,
)
from app.models.chat import ChatMessage
from app.models.interview import InterviewReport
from app.models.settings import UserSettings
from app.utils.file_utils import ensure_text_file, storage_size_bytes
from app.utils.json_utils import read_json, write_json


class StorageService:
    def __init__(self) -> None:
        self.settings_path = STORAGE_DIR / "settings.json"
        self.chat_history_path = STORAGE_DIR / "chat_history.json"
        self.interview_history_path = STORAGE_DIR / "interview_history.json"
        self.current_pdf_path = STORAGE_DIR / "current_pdf.txt"
        self.current_pdf_meta_path = STORAGE_DIR / "current_pdf_meta.json"
        self.ensure_storage()

    def ensure_storage(self) -> None:
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        read_json(self.settings_path, DEFAULT_SETTINGS)
        read_json(self.chat_history_path, {"messages": []})
        read_json(self.interview_history_path, {"reports": []})
        read_json(self.current_pdf_meta_path, {"fileName": None, "characterCount": 0, "hasPdf": False})
        ensure_text_file(self.current_pdf_path)

    def get_settings(self) -> UserSettings:
        data = read_json(self.settings_path, DEFAULT_SETTINGS)
        return UserSettings(**{**DEFAULT_SETTINGS, **data})

    def save_settings(self, settings: UserSettings) -> UserSettings:
        write_json(self.settings_path, settings.model_dump())
        return settings

    def reset(self) -> None:
        write_json(self.settings_path, DEFAULT_SETTINGS)
        write_json(self.chat_history_path, {"messages": []})
        write_json(self.interview_history_path, {"reports": []})
        write_json(self.current_pdf_meta_path, {"fileName": None, "characterCount": 0, "hasPdf": False})
        self.current_pdf_path.write_text("", encoding="utf-8")
        for audio_file in AUDIO_DIR.glob("*.mp3"):
            audio_file.unlink(missing_ok=True)

    def get_messages(self) -> list[dict[str, Any]]:
        data = read_json(self.chat_history_path, {"messages": []})
        return data.get("messages", [])[-CHAT_HISTORY_LIMIT:]

    def add_messages(self, messages: list[ChatMessage]) -> None:
        existing = self.get_messages()
        existing.extend(message.model_dump(mode="json") for message in messages)
        write_json(self.chat_history_path, {"messages": existing[-CHAT_HISTORY_LIMIT:]})

    def delete_message(self, message_id: str) -> None:
        messages = [message for message in self.get_messages() if message.get("id") != message_id]
        write_json(self.chat_history_path, {"messages": messages})

    def clear_messages(self) -> None:
        write_json(self.chat_history_path, {"messages": []})

    def export_messages_txt(self) -> str:
        lines = []
        for message in self.get_messages():
            timestamp = message.get("timestamp", "")
            role = message.get("role", "message").title()
            lines.append(f"[{timestamp}] {role}: {message.get('content', '')}")
        return "\n\n".join(lines)

    def save_pdf_text(self, file_name: str, text: str) -> None:
        self.current_pdf_path.write_text(text, encoding="utf-8")
        write_json(
            self.current_pdf_meta_path,
            {"fileName": file_name, "characterCount": len(text), "hasPdf": bool(text.strip())},
        )

    def get_pdf_text(self) -> str:
        ensure_text_file(self.current_pdf_path)
        return self.current_pdf_path.read_text(encoding="utf-8")

    def get_pdf_info(self) -> dict[str, Any]:
        return read_json(self.current_pdf_meta_path, {"fileName": None, "characterCount": 0, "hasPdf": False})

    def clear_pdf(self) -> None:
        self.current_pdf_path.write_text("", encoding="utf-8")
        write_json(self.current_pdf_meta_path, {"fileName": None, "characterCount": 0, "hasPdf": False})

    def get_reports(self) -> list[dict[str, Any]]:
        data = read_json(self.interview_history_path, {"reports": []})
        return data.get("reports", [])[-INTERVIEW_REPORT_LIMIT:]

    def add_report(self, report: InterviewReport) -> None:
        reports = self.get_reports()
        reports.append(report.model_dump(mode="json"))
        write_json(self.interview_history_path, {"reports": reports[-INTERVIEW_REPORT_LIMIT:]})

    def clear_reports(self) -> None:
        write_json(self.interview_history_path, {"reports": []})

    def storage_usage(self) -> dict[str, int]:
        return {
            "totalBytes": storage_size_bytes(STORAGE_DIR),
            "audioBytes": storage_size_bytes(AUDIO_DIR),
            "chatBytes": self.chat_history_path.stat().st_size if self.chat_history_path.exists() else 0,
            "interviewBytes": self.interview_history_path.stat().st_size if self.interview_history_path.exists() else 0,
            "pdfBytes": self.current_pdf_path.stat().st_size if self.current_pdf_path.exists() else 0,
        }


storage_service = StorageService()

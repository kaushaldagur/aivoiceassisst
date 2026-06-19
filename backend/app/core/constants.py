from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
APP_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = APP_DIR / "storage"
AUDIO_DIR = STORAGE_DIR / "audio"

CHAT_HISTORY_LIMIT = 50
INTERVIEW_REPORT_LIMIT = 10

SUPPORTED_LANGUAGES = {
    "English": {"code": "en", "voice": "en-US-AriaNeural"},
    "Hindi": {"code": "hi", "voice": "hi-IN-SwaraNeural"},
    "Spanish": {"code": "es", "voice": "es-ES-ElviraNeural"},
    "French": {"code": "fr", "voice": "fr-FR-DeniseNeural"},
}

DEFAULT_SETTINGS = {
    "theme": "dark",
    "language": "English",
    "voiceSpeed": 1.0,
    "voiceVolume": 1.0,
    "wakeWordEnabled": False,
    "currentMode": "general",
}

AI_MODES = {
    "general": {
        "id": "general",
        "name": "General Assistant",
        "icon": "sparkles",
        "accent": "cyan",
        "description": "Helpful, concise, and adaptable for everyday tasks.",
        "greeting": "How can I help today?",
        "systemPrompt": "You are Nova, a polished general AI voice assistant. Be helpful, clear, warm, and concise.",
    },
    "teacher": {
        "id": "teacher",
        "name": "Teacher",
        "icon": "graduation-cap",
        "accent": "blue",
        "description": "Explains concepts clearly and step-by-step.",
        "greeting": "I'll explain concepts clearly and step-by-step.",
        "systemPrompt": "You are Nova in Teacher mode. Explain ideas step-by-step with simple examples and check for understanding.",
    },
    "programmer": {
        "id": "programmer",
        "name": "Programmer",
        "icon": "code",
        "accent": "purple",
        "description": "Helps with coding, debugging, and software engineering.",
        "greeting": "I'll help with coding, debugging and software engineering.",
        "systemPrompt": "You are Nova in Programmer mode. Give practical engineering help, code when useful, and explain tradeoffs.",
    },
    "travel": {
        "id": "travel",
        "name": "Travel Guide",
        "icon": "map",
        "accent": "cyan",
        "description": "Plans trips, itineraries, and travel-friendly suggestions.",
        "greeting": "I'll help plan smooth and memorable travel.",
        "systemPrompt": "You are Nova in Travel Guide mode. Give practical travel advice, itineraries, local context, and safety-aware suggestions.",
    },
    "interviewer": {
        "id": "interviewer",
        "name": "Mock Interviewer",
        "icon": "briefcase",
        "accent": "slate",
        "description": "Conducts interviews and evaluates answers.",
        "greeting": "I'll conduct technical interviews and evaluate your answers.",
        "systemPrompt": "You are Nova in Mock Interviewer mode. Ask one interview question at a time and evaluate answers constructively.",
    },
}

INTERVIEW_TOPICS = ["Python", "Java", "JavaScript", "DBMS", "Operating Systems", "Computer Networks", "OOP", "HR Interview"]
INTERVIEW_DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"]

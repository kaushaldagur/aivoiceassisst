from app.core.constants import AI_MODES, SUPPORTED_LANGUAGES


def mode_prompt(mode: str) -> str:
    selected = AI_MODES.get(mode, AI_MODES["general"])
    return selected["systemPrompt"]


def language_instruction(language: str) -> str:
    selected = language if language in SUPPORTED_LANGUAGES else "English"
    return f"Respond in {selected}. Keep the wording natural for spoken conversation."


def chat_prompt(message: str, mode: str, language: str, history: list[dict]) -> str:
    compact_history = history[-10:]
    history_text = "\n".join(f"{item.get('role')}: {item.get('content')}" for item in compact_history)
    return (
        f"{mode_prompt(mode)}\n"
        f"{language_instruction(language)}\n"
        "Use the conversation context when relevant.\n\n"
        f"Recent conversation:\n{history_text or 'No previous conversation.'}\n\n"
        f"User: {message}\nAssistant:"
    )


def pdf_prompt(question: str, language: str, document_text: str) -> str:
    return (
        "You are Nova in PDF Chat mode. Answer only from the provided PDF text. "
        "If the answer is not present, say that the document does not contain that information.\n"
        f"{language_instruction(language)}\n\n"
        f"PDF TEXT:\n{document_text[:120000]}\n\n"
        f"Question: {question}\nAnswer:"
    )


def interview_question_prompt(topic: str, difficulty: str, language: str, asked_questions: list[str]) -> str:
    asked = "\n".join(f"- {question}" for question in asked_questions) or "None"
    return (
        "You are Nova in Mock Interviewer mode. Ask exactly one interview question. "
        "Do not include evaluation or explanation.\n"
        f"{language_instruction(language)}\n"
        f"Topic: {topic}\nDifficulty: {difficulty}\nPreviously asked:\n{asked}\n"
        "Next question:"
    )


def interview_evaluation_prompt(topic: str, difficulty: str, question: str, answer: str) -> str:
    return (
        "Evaluate this interview answer. Return strict JSON with keys: strengths, weaknesses, "
        "correctExplanation, improvedAnswer, score. strengths and weaknesses are arrays of strings. "
        "score is an integer from 0 to 10.\n"
        f"Topic: {topic}\nDifficulty: {difficulty}\nQuestion: {question}\nAnswer: {answer}"
    )

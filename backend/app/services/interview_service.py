from statistics import mean
from uuid import uuid4

from app.core.constants import INTERVIEW_DIFFICULTIES, INTERVIEW_TOPICS
from app.core.errors import AppError
from app.models.interview import InterviewEvaluation, InterviewReport
from app.services.gemini_service import gemini_service
from app.services.prompt_service import interview_evaluation_prompt, interview_question_prompt
from app.services.storage_service import storage_service


class InterviewService:
    def __init__(self) -> None:
        self.sessions: dict[str, dict] = {}
        self.total_questions = 5

    async def start(self, topic: str, difficulty: str, language: str) -> dict:
        if topic not in INTERVIEW_TOPICS:
            raise AppError("Choose a valid interview topic.")
        if difficulty not in INTERVIEW_DIFFICULTIES:
            raise AppError("Choose a valid interview difficulty.")
        session_id = str(uuid4())
        question = await self._next_question(topic, difficulty, language, [])
        self.sessions[session_id] = {
            "topic": topic,
            "difficulty": difficulty,
            "language": language,
            "turns": [{"question": question}],
        }
        return {
            "sessionId": session_id,
            "question": question,
            "questionNumber": 1,
            "totalQuestions": self.total_questions,
        }

    async def answer(self, session_id: str, answer: str) -> dict:
        session = self._session(session_id)
        current_turn = session["turns"][-1]
        current_turn["answer"] = answer
        evaluation = await self._evaluate(session["topic"], session["difficulty"], current_turn["question"], answer)
        current_turn["evaluation"] = evaluation.model_dump()

        is_complete = len(session["turns"]) >= self.total_questions
        next_question = None
        if not is_complete:
            asked = [turn["question"] for turn in session["turns"]]
            next_question = await self._next_question(session["topic"], session["difficulty"], session["language"], asked)
            session["turns"].append({"question": next_question})

        return {
            "evaluation": evaluation,
            "nextQuestion": next_question,
            "questionNumber": len(session["turns"]),
            "isComplete": is_complete,
        }

    def end(self, session_id: str) -> InterviewReport:
        session = self._session(session_id)
        completed_turns = [turn for turn in session["turns"] if turn.get("evaluation")]
        if not completed_turns:
            raise AppError("Answer at least one interview question before ending.")
        scores = [turn["evaluation"]["score"] for turn in completed_turns]
        strengths = self._unique_items(completed_turns, "strengths")
        weaknesses = self._unique_items(completed_turns, "weaknesses")
        report = InterviewReport(
            topic=session["topic"],
            difficulty=session["difficulty"],
            overallScore=round(mean(scores) * 10),
            topicWiseScore={session["topic"]: round(mean(scores) * 10)},
            strengths=strengths[:6],
            weakAreas=weaknesses[:6],
            recommendations=[
                "Review the correct explanations for low-scoring answers.",
                "Practice concise answers using a clear problem, approach, result structure.",
                "Repeat this topic at a higher difficulty once your score is consistently above 80.",
            ],
            turns=completed_turns,
        )
        storage_service.add_report(report)
        self.sessions.pop(session_id, None)
        return report

    def _session(self, session_id: str) -> dict:
        if session_id not in self.sessions:
            raise AppError("Interview session was not found or has ended.")
        return self.sessions[session_id]

    async def _next_question(self, topic: str, difficulty: str, language: str, asked: list[str]) -> str:
        question = await gemini_service.generate(interview_question_prompt(topic, difficulty, language, asked))
        return question.strip().strip('"')

    async def _evaluate(self, topic: str, difficulty: str, question: str, answer: str) -> InterviewEvaluation:
        try:
            data = await gemini_service.generate_json(interview_evaluation_prompt(topic, difficulty, question, answer))
            return InterviewEvaluation(
                strengths=list(data.get("strengths", []))[:4] or ["You attempted the question clearly."],
                weaknesses=list(data.get("weaknesses", []))[:4] or ["Add more precise technical details."],
                correctExplanation=str(data.get("correctExplanation", "")),
                improvedAnswer=str(data.get("improvedAnswer", "")),
                score=max(0, min(10, int(data.get("score", 0)))),
            )
        except Exception:
            return InterviewEvaluation(
                strengths=["You gave a relevant answer."],
                weaknesses=["The answer needs more specificity and structure."],
                correctExplanation="A complete answer should define the concept, explain why it matters, and include a concrete example.",
                improvedAnswer=f"A stronger answer would directly address: {question}",
                score=5,
            )

    def _unique_items(self, turns: list[dict], key: str) -> list[str]:
        seen: list[str] = []
        for turn in turns:
            for item in turn["evaluation"].get(key, []):
                if item not in seen:
                    seen.append(item)
        return seen


interview_service = InterviewService()

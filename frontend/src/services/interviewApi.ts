import { apiRequest } from "./apiClient";
import type { InterviewEvaluation, InterviewReport } from "../types/interview";

export function startInterview(topic: string, difficulty: string, language: string) {
  return apiRequest<{ sessionId: string; question: string; questionNumber: number; totalQuestions: number }>("/interview/start", {
    method: "POST",
    body: JSON.stringify({ topic, difficulty, language })
  });
}

export function answerInterview(sessionId: string, answer: string) {
  return apiRequest<{
    evaluation: InterviewEvaluation;
    nextQuestion: string | null;
    questionNumber: number;
    isComplete: boolean;
  }>("/interview/answer", {
    method: "POST",
    body: JSON.stringify({ sessionId, answer })
  });
}

export function endInterview(sessionId: string) {
  return apiRequest<{ report: InterviewReport }>("/interview/end", {
    method: "POST",
    body: JSON.stringify({ sessionId })
  });
}

export function getInterviewReports() {
  return apiRequest<{ reports: InterviewReport[] }>("/interview/reports");
}

export function clearInterviewReports() {
  return apiRequest<{ message: string }>("/interview/reports", { method: "DELETE" });
}

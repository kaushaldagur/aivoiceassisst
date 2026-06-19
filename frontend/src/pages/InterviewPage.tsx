import { useState } from "react";

import { MicrophoneButton } from "../components/assistant/MicrophoneButton";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Textarea } from "../components/ui/Input";
import { useSettings } from "../contexts/SettingsContext";
import { useSpeechRecorder } from "../hooks/useSpeechRecorder";
import { answerInterview, endInterview, startInterview } from "../services/interviewApi";
import type { InterviewEvaluation, InterviewReport } from "../types/interview";

export function InterviewPage() {
  const { settings, interviewTopics, interviewDifficulties } = useSettings();
  const [topic, setTopic] = useState("Python");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorder = useSpeechRecorder((text) => setAnswer(text), undefined, settings.language);

  async function begin() {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const response = await startInterview(topic, difficulty, settings.language);
      setSessionId(response.sessionId);
      setQuestion(response.question);
      setQuestionNumber(response.questionNumber);
      setEvaluation(null);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start interview.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!sessionId || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await answerInterview(sessionId, answer);
      setEvaluation(response.evaluation);
      if (response.nextQuestion) {
        setQuestion(response.nextQuestion);
        setQuestionNumber(response.questionNumber);
      }
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not evaluate answer.");
    } finally {
      setLoading(false);
    }
  }

  async function finish() {
    if (!sessionId) return;
    setLoading(true);
    try {
      const response = await endInterview(sessionId);
      setReport(response.report);
      setSessionId(null);
      setQuestion("");
      setEvaluation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not end interview.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[360px_1fr]">
      <Card>
        <h2 className="text-2xl font-semibold">Mock Interview</h2>
        <p className="mt-2 text-sm text-slate-400">Choose a topic and difficulty. Nova asks one question at a time.</p>
        <label className="mt-6 block text-sm text-slate-300">Topic</label>
        <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 p-3" value={topic} onChange={(event) => setTopic(event.target.value)}>
          {(interviewTopics.length ? interviewTopics : ["Python"]).map((item) => <option key={item}>{item}</option>)}
        </select>
        <label className="mt-4 block text-sm text-slate-300">Difficulty</label>
        <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 p-3" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          {(interviewDifficulties.length ? interviewDifficulties : ["Beginner"]).map((item) => <option key={item}>{item}</option>)}
        </select>
        <Button className="mt-6 w-full bg-cyan-400/20 text-cyan-100" disabled={loading} onClick={() => void begin()}>
          {sessionId ? "Restart Interview" : "Start Interview"}
        </Button>
        {sessionId && <Button className="mt-3 w-full" disabled={loading} onClick={() => void finish()}>End Interview</Button>}
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
      </Card>

      <div className="space-y-6">
        {question && (
          <Card>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-cyan-300" style={{ width: `${Math.min(questionNumber * 20, 100)}%` }} />
            </div>
            <p className="mt-4 text-sm text-slate-400">Question {questionNumber} of 5</p>
            <h3 className="mt-2 text-2xl font-semibold">{question}</h3>
            <div className="mt-5">
              <Textarea rows={5} value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Answer by voice or type here..." />
              {recorder.error && <p className="mt-2 text-sm text-red-300">{recorder.error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <MicrophoneButton recording={recorder.recording} onClick={recorder.toggle} />
                <Button disabled={loading || !answer.trim()} onClick={() => void submitAnswer()}>Submit Answer</Button>
              </div>
            </div>
          </Card>
        )}

        {evaluation && (
          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Evaluation</h3>
              <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-cyan-100">{evaluation.score}/10</span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-cyan-100">Strengths</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{evaluation.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
              <div>
                <h4 className="font-medium text-amber-100">Weaknesses</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{evaluation.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
            <h4 className="mt-5 font-medium">Correct explanation</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{evaluation.correctExplanation}</p>
            <h4 className="mt-5 font-medium">Improved answer</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{evaluation.improvedAnswer}</p>
          </Card>
        )}

        {report && (
          <Card>
            <h3 className="text-xl font-semibold">Final Report</h3>
            <p className="mt-3 text-4xl font-semibold text-cyan-100">{report.overallScore}%</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div><h4 className="font-medium">Strengths</h4><p className="mt-2 text-sm text-slate-400">{report.strengths.join(", ")}</p></div>
              <div><h4 className="font-medium">Weak Areas</h4><p className="mt-2 text-sm text-slate-400">{report.weakAreas.join(", ")}</p></div>
              <div><h4 className="font-medium">Recommendations</h4><p className="mt-2 text-sm text-slate-400">{report.recommendations.join(" ")}</p></div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

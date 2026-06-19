import { Download, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { clearChatHistory, deleteChatMessage, exportChatHistory, getChatHistory } from "../services/chatApi";
import { clearInterviewReports, getInterviewReports } from "../services/interviewApi";
import type { ChatMessage } from "../types/chat";
import type { InterviewReport } from "../types/interview";

export function HistoryPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [query, setQuery] = useState("");

  async function refresh() {
    const [chat, interview] = await Promise.all([getChatHistory(), getInterviewReports()]);
    setMessages(chat.messages);
    setReports(interview.reports);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  const filtered = useMemo(() => messages.filter((message) => message.content.toLowerCase().includes(query.toLowerCase())), [messages, query]);

  async function download() {
    const text = await exportChatHistory();
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "nova-chat-history.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">History</h2>
            <p className="text-sm text-slate-400">Only the latest 50 messages are retained.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void download()}><Download size={16} /> Export TXT</Button>
            <Button onClick={() => clearChatHistory().then(refresh)}><Trash2 size={16} /> Clear All</Button>
          </div>
        </div>
        <Input className="mt-5" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations..." />
        <div className="mt-5 space-y-3">
          {filtered.map((message) => (
            <div key={message.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{message.role}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-300">{message.content}</p>
                </div>
                <Button className="px-2" aria-label="Delete message" title="Delete message" onClick={() => deleteChatMessage(message.id).then(refresh)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="rounded-lg border border-white/10 p-6 text-center text-slate-400">No messages found.</p>}
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Interview Reports</h3>
          <Button className="px-2" aria-label="Delete interview reports" title="Delete interview reports" onClick={() => clearInterviewReports().then(refresh)}><Trash2 size={14} /></Button>
        </div>
        <p className="mt-1 text-sm text-slate-400">Latest 10 reports are stored.</p>
        <div className="mt-5 space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
              <p className="font-medium">{report.topic} · {report.difficulty}</p>
              <p className="mt-1 text-2xl text-cyan-100">{report.overallScore}%</p>
            </div>
          ))}
          {reports.length === 0 && <p className="text-sm text-slate-400">No reports yet.</p>}
        </div>
      </Card>
    </div>
  );
}

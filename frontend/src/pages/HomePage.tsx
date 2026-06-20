import { Link, useNavigate } from "react-router-dom";
import { FileText, History, MessageSquare, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { VoiceOrb } from "../components/assistant/VoiceOrb";
import { ModeCard } from "../components/modes/ModeCard";
import { Card } from "../components/ui/Card";
import { ConnectionBanner } from "../components/assistant/ConnectionBanner";
import { MicrophoneButton } from "../components/assistant/MicrophoneButton";
import { useAssistant } from "../contexts/AssistantContext";
import { useSettings } from "../contexts/SettingsContext";
import { getChatHistory } from "../services/chatApi";
import { getIntegrationStatus, type GeminiStatus } from "../services/healthApi";

export function HomePage() {
  const navigate = useNavigate();
  const { status, messages, setMessages } = useAssistant();
  const { settings, modes, update, error: backendError } = useSettings();
  const [gemini, setGemini] = useState<GeminiStatus | null>(null);

  const currentMode = useMemo(() => modes.find((mode) => mode.id === settings.currentMode), [modes, settings.currentMode]);
  const recentMessages = useMemo(() => messages.slice(-2).reverse(), [messages]);

  useEffect(() => {
    getIntegrationStatus().then((response) => setGemini(response.gemini)).catch(() => undefined);
    getChatHistory()
      .then((response) => setMessages(response.messages))
      .catch(() => undefined);
  }, [setMessages]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ConnectionBanner backendError={backendError} gemini={gemini} />

      <section>
        <Card className="hero-card overflow-hidden p-0">
          <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-8">
            <div>
              <p className="text-sm font-medium text-cyan-300">{currentMode?.name ?? "General Assistant"}</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">What can I help with?</h2>
              <p className="muted mt-3 max-w-xl text-base leading-7">
                Tap the microphone to talk, or open Chat to type. Nova responds in {settings.language}.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <MicrophoneButton
                  large
                  recording={false}
                  onClick={() => navigate("/chat", { state: { startListening: true } })}
                />
                <Link
                  to="/chat"
                  className="inline-flex min-h-14 items-center rounded-full border border-white/10 px-5 text-sm font-medium transition hover:bg-white/5"
                >
                  Open Chat
                </Link>
              </div>
            </div>
            <div className="grid place-items-center py-4">
              <VoiceOrb status={status} />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Primary actions">
        <Link to="/chat" className="action-card">
          <MessageSquare className="text-cyan-200" />
          <h3 className="mt-4 font-semibold">Continue Chat</h3>
          <p className="mt-1 text-sm text-slate-400">Voice or text conversation.</p>
        </Link>
        <Link to="/interview" className="action-card">
          <UserRoundCheck className="text-cyan-200" />
          <h3 className="mt-4 font-semibold">Interview Mode</h3>
          <p className="mt-1 text-sm text-slate-400">Practice technical interviews.</p>
        </Link>
        <Link to="/pdf" className="action-card">
          <FileText className="text-cyan-200" />
          <h3 className="mt-4 font-semibold">PDF Chat</h3>
          <p className="mt-1 text-sm text-slate-400">Ask questions from one document.</p>
        </Link>
        <Link to="/history" className="action-card">
          <History className="text-cyan-200" />
          <h3 className="mt-4 font-semibold">History</h3>
          <p className="mt-1 text-sm text-slate-400">Search, export, or clear chats.</p>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">AI Modes</h2>
          <p className="text-sm text-slate-400">{settings.language}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              active={settings.currentMode === mode.id}
              onSelect={() => void update({ currentMode: mode.id }).then(() => navigate("/chat"))}
            />
          ))}
        </div>
      </section>

      {recentMessages.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent</h2>
            <Link to="/chat" className="text-sm text-cyan-300">
              View all
            </Link>
          </div>
          <div className="grid gap-3">
            {recentMessages.map((message) => (
              <Card key={message.id} className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">{message.role}</p>
                <p className="mt-2 line-clamp-2 text-sm text-slate-300">{message.content}</p>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

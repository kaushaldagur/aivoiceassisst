import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { ChatComposer } from "../components/assistant/ChatComposer";
import { MessageBubble } from "../components/assistant/MessageBubble";
import { StatusIndicator } from "../components/assistant/StatusIndicator";
import { VoiceOrb } from "../components/assistant/VoiceOrb";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAssistant } from "../contexts/AssistantContext";
import { useSettings } from "../contexts/SettingsContext";
import { getChatHistory } from "../services/chatApi";

export function ChatPage() {
  const location = useLocation();
  const greetedRef = useRef(false);
  const { status, messages, setMessages, error, playAudio, stopAudio, setStatus } = useAssistant();
  const { modes, settings } = useSettings();
  const currentMode = modes.find((mode) => mode.id === settings.currentMode);
  const startListening = Boolean((location.state as { startListening?: boolean } | null)?.startListening);
  const wakeGreeting = Boolean((location.state as { wakeGreeting?: boolean } | null)?.wakeGreeting);

  useEffect(() => {
    getChatHistory().then((response) => setMessages(response.messages)).catch(() => undefined);
  }, [setMessages]);

  useEffect(() => {
    if (!wakeGreeting || greetedRef.current) return;
    greetedRef.current = true;
    setStatus("Listening");
  }, [setStatus, wakeGreeting]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_300px]">
      <Card className="flex min-h-[calc(100vh-5rem)] flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-cyan-300">{currentMode?.name ?? "Chat"}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Conversation</h2>
            <p className="muted mt-1 text-sm">Voice and text use the same AI pipeline.</p>
          </div>
          <StatusIndicator status={status} />
        </div>

        {wakeGreeting && status === "Listening" && (
          <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            I&apos;m listening… ask your question.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        )}

        <div className="mt-5 flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <div>
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="muted mt-2 text-sm">Tap Speak or type a message below.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} onReplay={playAudio} />)
          )}
        </div>

        <div className="mt-5">
          <ChatComposer autoStart={startListening} />
        </div>
      </Card>

      <aside className="hidden space-y-4 lg:block">
        <Card className="grid place-items-center py-8">
          <VoiceOrb status={status} />
          <p className="muted mt-4 text-center text-sm">{currentMode?.description}</p>
        </Card>
        {status === "Speaking" && (
          <Button onClick={stopAudio} className="w-full border-red-400/30 bg-red-500/10 text-red-100">
            Stop Speaking
          </Button>
        )}
      </aside>
    </div>
  );
}

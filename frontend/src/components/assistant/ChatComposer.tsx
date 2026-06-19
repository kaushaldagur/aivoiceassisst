import { Send, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAssistant } from "../../contexts/AssistantContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSpeechRecorder } from "../../hooks/useSpeechRecorder";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Input";
import { MicrophoneButton } from "./MicrophoneButton";

interface ChatComposerProps {
  autoStart?: boolean;
  className?: string;
}

export function ChatComposer({ autoStart = false, className }: ChatComposerProps) {
  const [text, setText] = useState("");
  const autoStartedRef = useRef(false);
  const { sendMessage, setStatus, status, stopAudio } = useAssistant();
  const { settings } = useSettings();
  const busy = status === "Processing" || status === "Generating Response" || status === "Speaking";

  const recorder = useSpeechRecorder(
    (transcript) => {
      setText(transcript);
      void sendMessage(transcript);
    },
    (state) => setStatus(state === "start" ? "Listening" : state === "processing" ? "Processing" : "Idle"),
    settings.language,
    {
      onInterim: (value) => {
        if (value) setText(value);
      }
    }
  );
  const startListeningRef = useRef(recorder.start);
  startListeningRef.current = recorder.start;

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || busy) return;
    autoStartedRef.current = true;
    void startListeningRef.current();
  }, [autoStart, busy]);

  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    await sendMessage(value);
  }

  return (
    <div className={cn("composer rounded-2xl border border-white/10 bg-slate-950/50 p-4 backdrop-blur-xl", className)}>
      {recorder.recording && (
        <div className="mb-3 flex items-center gap-2 text-sm text-cyan-200">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          Listening… speak naturally, then tap Stop when finished.
        </div>
      )}
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={recorder.recording ? "Listening…" : "Ask Nova anything…"}
        rows={recorder.recording ? 3 : 2}
        disabled={busy && !recorder.recording}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void submit();
          }
        }}
      />
      {recorder.error && <p className="mt-2 text-sm text-red-300">{recorder.error}</p>}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <MicrophoneButton recording={recorder.recording} disabled={busy && !recorder.recording} onClick={recorder.toggle} />
          {status === "Speaking" && (
            <Button onClick={stopAudio} className="border-red-400/30 bg-red-500/10 text-red-100">
              <Square size={16} />
              Stop
            </Button>
          )}
        </div>
        <Button disabled={busy || !text.trim()} onClick={() => void submit()} className="bg-cyan-500/20 text-cyan-50 hover:bg-cyan-500/30">
          <Send size={18} />
          Send
        </Button>
      </div>
      {status === "Speaking" && (
        <p className="muted mt-3 flex items-center gap-2 text-xs">
          <Volume2 size={14} />
          Nova is speaking…
        </p>
      )}
    </div>
  );
}

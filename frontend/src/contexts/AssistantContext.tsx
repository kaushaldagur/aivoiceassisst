import { createContext, useContext, useMemo, useRef, useState } from "react";

import { apiUrl } from "../services/apiClient";
import { sendChatMessage } from "../services/chatApi";
import type { AssistantStatus } from "../types/assistant";
import type { ChatMessage } from "../types/chat";
import { useSettings } from "./SettingsContext";

interface AssistantContextValue {
  status: AssistantStatus;
  messages: ChatMessage[];
  error: string | null;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setStatus: React.Dispatch<React.SetStateAction<AssistantStatus>>;
  sendMessage: (message: string) => Promise<void>;
  playAudio: (url?: string | null) => void;
  stopAudio: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);

function optimisticMessage(role: "user" | "assistant", content: string, mode: string, language: string): ChatMessage {
  return {
    id: `temp-${role}-${Date.now()}`,
    role,
    content,
    timestamp: new Date().toISOString(),
    mode,
    language
  };
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [status, setStatus] = useState<AssistantStatus>("Idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sendInFlightRef = useRef(false);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setStatus("Completed");
  }

  function playAudio(url?: string | null) {
    if (!url) {
      setStatus("Completed");
      return;
    }
    stopAudio();
    const audio = new Audio(apiUrl(url));
    audio.volume = settings.voiceVolume;
    audio.playbackRate = settings.voiceSpeed;
    audioRef.current = audio;
    setStatus("Speaking");
    audio.onended = () => {
      audioRef.current = null;
      setStatus("Completed");
    };
    audio.onerror = () => {
      audioRef.current = null;
      setStatus("Completed");
    };
    void audio.play().catch(() => {
      audioRef.current = null;
      setStatus("Completed");
    });
  }

  async function sendMessage(message: string) {
    const clean = message.trim();
    if (!clean || sendInFlightRef.current) return;
    sendInFlightRef.current = true;
    setError(null);
    setStatus("Processing");

    const pendingUser = optimisticMessage("user", clean, settings.currentMode, settings.language);
    setMessages((current) => [...current, pendingUser].slice(-50));

    try {
      setStatus("Generating Response");
      const response = await sendChatMessage(clean, settings.currentMode, settings.language);
      setMessages((current) => {
        const withoutPending = current.filter((item) => item.id !== pendingUser.id);
        return [...withoutPending, response.userMessage, response.assistantMessage].slice(-50);
      });
      playAudio(response.audioUrl);
    } catch (err) {
      setMessages((current) => current.filter((item) => item.id !== pendingUser.id));
      setError(err instanceof Error ? err.message : "Could not send message.");
      setStatus("Idle");
    } finally {
      sendInFlightRef.current = false;
    }
  }

  const value = useMemo(
    () => ({ status, messages, error, setMessages, setStatus, sendMessage, playAudio, stopAudio }),
    [status, messages, error, settings.currentMode, settings.language, settings.voiceSpeed, settings.voiceVolume]
  );

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) throw new Error("useAssistant must be used inside AssistantProvider");
  return context;
}

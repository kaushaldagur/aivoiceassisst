import { useEffect, useRef, useState } from "react";

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
}

export function useWakeWord(enabled: boolean, language: string, onWake: () => void) {
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!enabled) {
      recognitionRef.current?.stop();
      return;
    }
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }
    const recognition: SpeechRecognitionLike = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language === "Hindi" ? "hi-IN" : language === "Spanish" ? "es-ES" : language === "French" ? "fr-FR" : "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .toLowerCase();
      if (transcript.includes("hey nova")) onWake();
    };
    recognition.onerror = () => setSupported(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setSupported(false);
    }
    return () => recognition.stop();
  }, [enabled, language, onWake]);

  return { supported };
}

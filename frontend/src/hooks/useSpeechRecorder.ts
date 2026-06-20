import { useRef, useState } from "react";

import { transcribeAudio } from "../services/speechApi";
import type { SpeechRecognitionLike } from "./useWakeWord";

interface SpeechRecorderOptions {
  onInterim?: (text: string) => void;
}

export function useSpeechRecorder(
  onText: (text: string) => void,
  onStatus?: (status: "start" | "processing" | "idle") => void,
  language = "English",
  options: SpeechRecorderOptions = {}
) {
  const [recording, setRecording] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const permissionRequestRef = useRef(0);
  const finalTextRef = useRef("");
  const interimTextRef = useRef("");
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);

  function languageCode() {
    return language === "Hindi" ? "hi-IN" : language === "Spanish" ? "es-ES" : language === "French" ? "fr-FR" : "en-US";
  }

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function resetTranscript() {
    finalTextRef.current = "";
    interimTextRef.current = "";
    setInterimText("");
    options.onInterim?.("");
  }

  function updateInterim(text: string) {
    interimTextRef.current = text;
    setInterimText(text);
    options.onInterim?.(text);
  }

  function speechRecognitionCtor() {
    return window.SpeechRecognition ?? window.webkitSpeechRecognition;
  }

  function recorderOptions() {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
    const mimeType = candidates.find((item) => MediaRecorder.isTypeSupported?.(item));
    return mimeType ? { mimeType } : undefined;
  }

  function finishWithText(text: string) {
    const clean = text.trim();
    if (!clean) {
      setError("No speech was detected.");
      onStatus?.("idle");
      return;
    }
    updateInterim(clean);
    isRecordingRef.current = false;
    setRecording(false);
    onText(clean);
  }

  async function startBrowserRecognition() {
    const SpeechRecognitionCtor = speechRecognitionCtor();
    if (!SpeechRecognitionCtor) return false;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageCode();
    recognition.onresult = (event) => {
      let interim = "";
      let finalChunk = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalChunk += transcript;
        else interim += transcript;
      }
      if (finalChunk) finalTextRef.current = `${finalTextRef.current} ${finalChunk}`.trim();
      updateInterim(`${finalTextRef.current} ${interim}`.trim());
    };
    recognition.onerror = (event) => {
      if (!isRecordingRef.current) return;
      const reason =
        event.error === "not-allowed"
          ? "Microphone access is blocked for this site."
          : event.error === "no-speech"
            ? "No speech was detected."
            : "Speech recognition failed. Please try again.";
      setError(reason);
      isRecordingRef.current = false;
      recognitionRef.current = null;
      setRecording(false);
      onStatus?.("idle");
    };
    recognition.onend = () => {
      if (!isRecordingRef.current || !recognitionRef.current) return;
      try {
        recognition.start();
      } catch {
        isRecordingRef.current = false;
        recognitionRef.current = null;
        setRecording(false);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      return true;
    } catch {
      recognitionRef.current = null;
      return false;
    }
  }

  async function startMediaRecorder() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone access is not available in this browser.");
      isRecordingRef.current = false;
      setRecording(false);
      onStatus?.("idle");
      return;
    }

    const requestId = ++permissionRequestRef.current;
    let stream: MediaStream;
    try {
      stream = await Promise.race([
        navigator.mediaDevices.getUserMedia({ audio: true }),
        new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Microphone permission timed out.")), 12000))
      ]);
      if (requestId !== permissionRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
    } catch {
      setError("Microphone access is blocked for this site or no microphone was found.");
      isRecordingRef.current = false;
      setRecording(false);
      onStatus?.("idle");
      return;
    }

    try {
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream, recorderOptions());
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopStream();
        isRecordingRef.current = false;
        setRecording(false);
        onStatus?.("processing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!blob.size) {
          setError("No speech was recorded. Please try again.");
          onStatus?.("idle");
          return;
        }
        try {
          const result = await transcribeAudio(blob);
          finishWithText(result.text);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Speech recognition failed.");
          onStatus?.("idle");
        }
      };
      recorderRef.current = recorder;
      recorder.start();
    } catch {
      stopStream();
      setError("Could not start microphone recording. Please try again.");
      isRecordingRef.current = false;
      setRecording(false);
      onStatus?.("idle");
    }
  }

  async function start() {
    setError(null);
    resetTranscript();
    isRecordingRef.current = true;
    setRecording(true);
    onStatus?.("start");

    const browserStarted = await startBrowserRecognition();
    if (browserStarted) return;
    await startMediaRecorder();
  }

  function stop() {
    permissionRequestRef.current += 1;
    isRecordingRef.current = false;
    const browserText = (finalTextRef.current || interimTextRef.current).trim();

    if (recognitionRef.current) {
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      recognition.onend = null;
      recognition.stop();
      setRecording(false);
      onStatus?.("processing");
      if (browserText) finishWithText(browserText);
      else {
        setError("No speech was detected.");
        onStatus?.("idle");
      }
      return;
    }

    recorderRef.current?.stop();
    stopStream();
    setRecording(false);
    onStatus?.("idle");
  }

  function toggle() {
    if (recording) stop();
    else void start();
  }

  return { recording, interimText, error, start, stop, toggle };
}

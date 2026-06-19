interface Window {
  SpeechRecognition?: new () => import("../hooks/useWakeWord").SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => import("../hooks/useWakeWord").SpeechRecognitionLike;
}

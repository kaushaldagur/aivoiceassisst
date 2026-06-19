import { apiRequest } from "./apiClient";

export function synthesizeSpeech(text: string, language: string, speed: number, volume: number) {
  return apiRequest<{ audioUrl: string }>("/tts/synthesize", {
    method: "POST",
    body: JSON.stringify({ text, language, speed, volume })
  });
}

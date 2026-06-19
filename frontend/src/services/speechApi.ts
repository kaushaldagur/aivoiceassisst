import { apiRequest } from "./apiClient";

export function transcribeAudio(blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  return apiRequest<{ text: string; engine: string }>("/speech/transcribe", {
    method: "POST",
    body: formData
  });
}

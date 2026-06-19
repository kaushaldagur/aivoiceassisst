import { apiRequest } from "./apiClient";
import type { ChatMessage, ChatResponse } from "../types/chat";

export function sendChatMessage(message: string, mode: string, language: string) {
  return apiRequest<ChatResponse>("/chat/message", {
    method: "POST",
    body: JSON.stringify({ message, mode, language })
  });
}

export function getChatHistory() {
  return apiRequest<{ messages: ChatMessage[] }>("/chat/history");
}

export function clearChatHistory() {
  return apiRequest<{ message: string }>("/chat/history", { method: "DELETE" });
}

export function deleteChatMessage(id: string) {
  return apiRequest<{ message: string }>(`/chat/history/${id}`, { method: "DELETE" });
}

export function exportChatHistory() {
  return apiRequest<string>("/chat/history/export");
}

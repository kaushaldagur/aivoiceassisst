export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  mode: string;
  language: string;
  timestamp: string;
  audioPath?: string | null;
}

export interface ChatResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  audioUrl?: string | null;
  status: string;
}

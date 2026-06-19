import { apiRequest } from "./apiClient";
import type { AiMode } from "../types/modes";

export function getModes() {
  return apiRequest<{
    modes: AiMode[];
    languages: string[];
    interviewTopics: string[];
    interviewDifficulties: string[];
  }>("/modes");
}

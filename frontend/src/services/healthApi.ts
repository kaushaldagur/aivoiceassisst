import { apiRequest } from "./apiClient";

export interface GeminiStatus {
  configured: boolean;
  connected: boolean | null;
  model: string;
  message?: string;
}

export function getIntegrationStatus(verify = false) {
  return apiRequest<{ gemini: GeminiStatus }>(`/health/integrations?verify=${verify}`);
}

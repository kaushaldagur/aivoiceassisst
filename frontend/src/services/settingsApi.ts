import { apiRequest } from "./apiClient";
import type { StorageUsage, UserSettings } from "../types/settings";

export function getSettings() {
  return apiRequest<{ settings: UserSettings; storage: StorageUsage }>("/settings");
}

export function updateSettings(settings: UserSettings) {
  return apiRequest<{ settings: UserSettings; storage: StorageUsage }>("/settings", {
    method: "PUT",
    body: JSON.stringify(settings)
  });
}

export function resetApplication() {
  return apiRequest<{ message: string; settings: UserSettings }>("/settings/reset", { method: "POST" });
}

export function saveGeminiKey(apiKey: string) {
  return apiRequest<{ message: string; gemini: { connected: boolean; model: string } }>("/settings/gemini", {
    method: "POST",
    body: JSON.stringify({ apiKey })
  });
}

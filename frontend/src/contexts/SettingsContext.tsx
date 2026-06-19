import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getModes } from "../services/modesApi";
import { getSettings, updateSettings } from "../services/settingsApi";
import type { AiMode } from "../types/modes";
import type { StorageUsage, UserSettings } from "../types/settings";

interface SettingsContextValue {
  settings: UserSettings;
  storage: StorageUsage | null;
  modes: AiMode[];
  languages: string[];
  interviewTopics: string[];
  interviewDifficulties: string[];
  loading: boolean;
  error: string | null;
  update: (patch: Partial<UserSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: "dark",
  language: "English",
  voiceSpeed: 1,
  voiceVolume: 1,
  wakeWordEnabled: false,
  currentMode: "general"
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [modes, setModes] = useState<AiMode[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English", "Hindi", "Spanish", "French"]);
  const [interviewTopics, setInterviewTopics] = useState<string[]>([]);
  const [interviewDifficulties, setInterviewDifficulties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [settingsResponse, modesResponse] = await Promise.all([getSettings(), getModes()]);
      setSettings(settingsResponse.settings);
      setStorage(settingsResponse.storage);
      setModes(modesResponse.modes);
      setLanguages(modesResponse.languages);
      setInterviewTopics(modesResponse.interviewTopics);
      setInterviewDifficulties(modesResponse.interviewDifficulties);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backend unavailable.");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function update(patch: Partial<UserSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    const response = await updateSettings(next);
    setSettings(response.settings);
    setStorage(response.storage);
  }

  useEffect(() => {
    refresh().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.classList.toggle("light", settings.theme === "light");
  }, [settings.theme]);

  const value = useMemo(
    () => ({
      settings,
      storage,
      modes,
      languages,
      interviewTopics,
      interviewDifficulties,
      loading,
      error,
      update,
      refresh
    }),
    [settings, storage, modes, languages, interviewTopics, interviewDifficulties, loading, error]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}

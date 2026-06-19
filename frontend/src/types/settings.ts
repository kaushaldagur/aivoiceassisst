export type Theme = "dark" | "light";

export interface UserSettings {
  theme: Theme;
  language: string;
  voiceSpeed: number;
  voiceVolume: number;
  wakeWordEnabled: boolean;
  currentMode: string;
}

export interface StorageUsage {
  totalBytes: number;
  audioBytes: number;
  chatBytes: number;
  interviewBytes: number;
  pdfBytes: number;
}

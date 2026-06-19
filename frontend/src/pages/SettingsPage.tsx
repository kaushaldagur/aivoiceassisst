import { CheckCircle2, KeyRound, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { clearChatHistory } from "../services/chatApi";
import { clearInterviewReports } from "../services/interviewApi";
import { getIntegrationStatus, type GeminiStatus } from "../services/healthApi";
import { resetApplication, saveGeminiKey } from "../services/settingsApi";
import { useSettings } from "../contexts/SettingsContext";

export function SettingsPage() {
  const { settings, languages, storage, update, refresh } = useSettings();
  const [message, setMessage] = useState<string | null>(null);
  const [gemini, setGemini] = useState<GeminiStatus | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);

  useEffect(() => {
    getIntegrationStatus(true)
      .then((response) => setGemini(response.gemini))
      .catch(() => undefined);
  }, []);

  async function connectGemini() {
    if (!apiKey.trim()) {
      setKeyError("Paste a Gemini API key from Google AI Studio.");
      return;
    }
    setSavingKey(true);
    setKeyError(null);
    try {
      const response = await saveGeminiKey(apiKey.trim());
      setMessage(response.message);
      setApiKey("");
      const status = await getIntegrationStatus(true);
      setGemini(status.gemini);
    } catch (err) {
      setKeyError(err instanceof Error ? err.message : "Could not save API key.");
    } finally {
      setSavingKey(false);
    }
  }

  async function reset() {
    if (!window.confirm("Reset all Nova settings, chats, reports, PDF data, and generated audio?")) return;
    const response = await resetApplication();
    await refresh();
    setMessage(response.message);
  }

  async function clearChats() {
    if (!window.confirm("Clear all chat history?")) return;
    await clearChatHistory();
    setMessage("Chat history cleared.");
  }

  async function clearReports() {
    if (!window.confirm("Delete all interview reports?")) return;
    await clearInterviewReports();
    setMessage("Interview reports deleted.");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="muted mt-1 text-sm">Personalize Nova and manage local data.</p>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">{message}</div>
      )}

      <Card className="surface overflow-hidden p-0">
        <section className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">AI service</h3>
              <p className="muted mt-1 text-sm">Gemini free tier · {gemini?.model ?? "gemini-2.5-flash-lite"}</p>
            </div>
            {gemini?.configured && gemini.connected !== false ? (
              <span className="flex items-center gap-2 text-sm text-emerald-400">
                <CheckCircle2 size={17} /> Connected
              </span>
            ) : (
              <span className="text-sm text-amber-400">Needs API key</span>
            )}
          </div>
          <label className="muted mt-5 block text-sm" htmlFor="gemini-key">
            Gemini API key
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id="gemini-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Paste key from aistudio.google.com/apikey"
            />
            <Button disabled={savingKey} onClick={() => void connectGemini()} className="shrink-0 bg-cyan-500/20 text-cyan-50">
              <KeyRound size={16} />
              {savingKey ? "Saving…" : "Save key"}
            </Button>
          </div>
          {keyError && <p className="mt-2 text-sm text-red-300">{keyError}</p>}
          {gemini?.connected === false && gemini.message && (
            <p className="mt-2 text-sm text-amber-200">{gemini.message}</p>
          )}
        </section>

        <section className="border-t border-slate-800 p-5">
          <h3 className="font-semibold">Appearance</h3>
          <div className="mt-3 grid grid-cols-2 rounded-xl border border-slate-700 p-1">
            <button
              className={`rounded-lg px-3 py-2 text-sm ${settings.theme === "dark" ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}
              onClick={() => void update({ theme: "dark" })}
            >
              Dark
            </button>
            <button
              className={`rounded-lg px-3 py-2 text-sm ${settings.theme === "light" ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}
              onClick={() => void update({ theme: "light" })}
            >
              Light
            </button>
          </div>
        </section>

        <section className="border-t border-slate-800 p-5">
          <h3 className="font-semibold">Language and voice</h3>
          <label className="muted mt-4 block text-sm" htmlFor="language">
            Conversation language
          </label>
          <select
            id="language"
            className="ui-input mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3"
            value={settings.language}
            onChange={(event) => void update({ language: event.target.value })}
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
          <label className="muted mt-5 flex justify-between text-sm">
            <span>Voice speed</span>
            <span>{settings.voiceSpeed.toFixed(1)}x</span>
          </label>
          <input
            aria-label="Voice speed"
            className="mt-2 w-full accent-cyan-400"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={settings.voiceSpeed}
            onChange={(event) => void update({ voiceSpeed: Number(event.target.value) })}
          />
          <label className="muted mt-5 flex justify-between text-sm">
            <span>Voice volume</span>
            <span>{Math.round(settings.voiceVolume * 100)}%</span>
          </label>
          <input
            aria-label="Voice volume"
            className="mt-2 w-full accent-cyan-400"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.voiceVolume}
            onChange={(event) => void update({ voiceVolume: Number(event.target.value) })}
          />
        </section>

        <section className="flex items-center justify-between gap-4 border-t border-slate-800 p-5">
          <div>
            <h3 className="font-semibold">Wake word</h3>
            <p className="muted mt-1 text-sm">Listen for “Hey Nova” on the Home screen.</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.wakeWordEnabled}
            aria-label="Wake word"
            onClick={() => void update({ wakeWordEnabled: !settings.wakeWordEnabled })}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings.wakeWordEnabled ? "bg-cyan-500" : "bg-slate-700"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings.wakeWordEnabled ? "left-6" : "left-1"}`}
            />
          </button>
        </section>

        <section className="border-t border-slate-800 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h3 className="font-semibold">Local storage</h3>
              <p className="muted mt-1 text-sm">Chats, reports, PDF text, and generated audio.</p>
            </div>
            <span className="text-sm text-slate-400">{storage ? `${(storage.totalBytes / 1024).toFixed(1)} KB` : "..."}</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button onClick={() => void clearChats()}>
              <Trash2 size={16} /> Clear chats
            </Button>
            <Button onClick={() => void clearReports()}>
              <Trash2 size={16} /> Delete reports
            </Button>
          </div>
        </section>
      </Card>

      <div className="mt-5 rounded-2xl border border-red-500/20 p-4">
        <h3 className="font-semibold text-red-300">Reset Nova</h3>
        <p className="muted mt-1 text-sm">Deletes all local app data and restores default settings.</p>
        <Button className="mt-3 border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20" onClick={() => void reset()}>
          <RotateCcw size={16} /> Reset application
        </Button>
      </div>
    </div>
  );
}

import { AlertTriangle, CheckCircle2, ServerCrash } from "lucide-react";
import { Link } from "react-router-dom";

import type { GeminiStatus } from "../../services/healthApi";

export function ConnectionBanner({ backendError, gemini }: { backendError?: string | null; gemini?: GeminiStatus | null }) {
  if (backendError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        <ServerCrash size={18} className="shrink-0" />
        <span>Backend unavailable. Check VITE_API_URL and the backend /api/health endpoint.</span>
      </div>
    );
  }

  if (!gemini) return null;

  if (!gemini.configured) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <span className="flex items-center gap-2">
          <AlertTriangle size={18} />
          Add your free Gemini API key to start chatting.
        </span>
        <Link className="font-medium underline underline-offset-4" to="/settings">
          Open Settings
        </Link>
      </div>
    );
  }

  if (gemini.connected) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
        <CheckCircle2 size={17} />
        Gemini ready · {gemini.model}
      </div>
    );
  }

  return null;
}

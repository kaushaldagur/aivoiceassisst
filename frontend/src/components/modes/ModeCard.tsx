import { Briefcase, Code, GraduationCap, Map, Sparkles } from "lucide-react";

import type { AiMode } from "../../types/modes";
import { cn } from "../../lib/utils";

const icons = { sparkles: Sparkles, "graduation-cap": GraduationCap, code: Code, map: Map, briefcase: Briefcase };

export function ModeCard({ mode, active, onSelect }: { mode: AiMode; active: boolean; onSelect: () => void }) {
  const Icon = icons[mode.icon as keyof typeof icons] ?? Sparkles;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "surface rounded-lg border p-4 text-left transition hover:border-slate-600",
        active ? "border-cyan-500 bg-cyan-500/10" : "border-slate-800 bg-slate-900"
      )}
    >
      <Icon className="text-cyan-200" size={24} />
      <h3 className="mt-3 font-semibold">{mode.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{mode.description}</p>
    </button>
  );
}

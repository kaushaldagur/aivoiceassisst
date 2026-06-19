import { Brain, CheckCircle2, Loader2, Mic, Radio, Volume2 } from "lucide-react";

import type { AssistantStatus } from "../../types/assistant";

const config: Record<AssistantStatus, { icon: typeof Mic; text: string }> = {
  Idle: { icon: Radio, text: "Idle" },
  Listening: { icon: Mic, text: "Listening..." },
  Processing: { icon: Brain, text: "Thinking..." },
  "Generating Response": { icon: Loader2, text: "Generating Response..." },
  Speaking: { icon: Volume2, text: "Speaking..." },
  Completed: { icon: CheckCircle2, text: "Completed" }
};

export function StatusIndicator({ status }: { status: AssistantStatus }) {
  const item = config[status];
  return (
    <div className="ui-status inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200">
      <item.icon className={status === "Generating Response" ? "animate-spin" : ""} size={18} />
      {item.text}
    </div>
  );
}

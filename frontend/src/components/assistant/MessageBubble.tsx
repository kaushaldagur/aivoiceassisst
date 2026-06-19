import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";

import { formatTime, cn } from "../../lib/utils";
import type { ChatMessage } from "../../types/chat";
import { Button } from "../ui/Button";

export function MessageBubble({ message, onReplay }: { message: ChatMessage; onReplay?: (url?: string | null) => void }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <article className={cn("max-w-[82%] rounded-lg border p-4", isUser ? "border-cyan-300/20 bg-cyan-400/12" : "border-white/10 bg-white/[0.07]")}>
        <div className="prose prose-invert max-w-none prose-pre:bg-slate-950/80 prose-code:text-cyan-200">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
          <span>{formatTime(message.timestamp)}</span>
          {!isUser && (
            <div className="flex gap-2">
              <Button className="px-2 py-1 text-xs" onClick={() => navigator.clipboard.writeText(message.content)} title="Copy response">
                <Copy size={14} />
              </Button>
              {message.audioPath && (
                <Button className="px-2 py-1 text-xs" onClick={() => onReplay?.(message.audioPath)}>
                  Replay
                </Button>
              )}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

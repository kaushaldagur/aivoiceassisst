import { Mic, Square } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";

interface MicrophoneButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  recording: boolean;
  large?: boolean;
}

export function MicrophoneButton({ recording, large = false, className, disabled, ...props }: MicrophoneButtonProps) {
  return (
    <Button
      aria-pressed={recording}
      disabled={disabled}
      className={cn(
        recording
          ? "border-red-400/30 bg-red-500/15 text-red-100"
          : "border-cyan-300/20 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25",
        large && "h-16 min-w-16 rounded-full px-0 shadow-lg shadow-cyan-500/10",
        className
      )}
      title={recording ? "Stop listening" : "Start voice input"}
      {...props}
    >
      {large ? (
        <span className="relative flex h-16 w-16 items-center justify-center">
          {recording && <span className="absolute inset-2 rounded-full animate-ping bg-red-400/20" />}
          {recording ? <Square size={22} fill="currentColor" /> : <Mic size={26} />}
        </span>
      ) : (
        <>
          {recording ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
          {recording ? "Stop" : "Speak"}
        </>
      )}
    </Button>
  );
}

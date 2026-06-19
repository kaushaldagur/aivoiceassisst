import { motion } from "framer-motion";
import { Mic2 } from "lucide-react";

import type { AssistantStatus } from "../../types/assistant";

export function VoiceOrb({ status }: { status: AssistantStatus }) {
  const active = status === "Listening" || status === "Speaking" || status === "Generating Response";
  return (
    <div className="relative grid h-48 w-48 place-items-center">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute inset-0 rounded-full border border-cyan-300/20"
          animate={active ? { scale: [1, 1.18, 1], opacity: [0.45, 0.1, 0.45] } : { scale: 1, opacity: 0.25 }}
          transition={{ duration: 2 + index * 0.35, repeat: Infinity, delay: index * 0.18 }}
        />
      ))}
      <motion.div
        className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-500/30 to-purple-500/30 shadow-glow"
        animate={active ? { y: [0, -6, 0] } : { y: 0 }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <Mic2 className="text-cyan-100" size={42} />
      </motion.div>
    </div>
  );
}

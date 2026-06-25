"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { DebateMessage } from "@/lib/types";
import { DebateMessageCard } from "./DebateMessageCard";

const PHASE_HEADER: Record<DebateMessage["phase"], string> = {
  opening: "Opening Assessments",
  challenge: "Challenges Exchanged",
  defense: "Defense & Revision",
  closing: "Final Stances",
};

export function DebateTimeline({ messages }: { messages: DebateMessage[] }) {
  return (
    <div className="flex flex-col">
      <AnimatePresence initial={false}>
        {messages.map((m, i) => {
          const showHeader = i === 0 || messages[i - 1].phase !== m.phase;
          return (
            <div key={m.id}>
              {showHeader && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 mt-1 flex items-center gap-3 first:mt-0"
                >
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {PHASE_HEADER[m.phase]}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                </motion.div>
              )}
              <DebateMessageCard message={m} />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

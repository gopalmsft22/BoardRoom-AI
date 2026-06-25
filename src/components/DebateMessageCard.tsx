"use client";

import { motion } from "framer-motion";
import type { DebateMessage } from "@/lib/types";
import { AGENTS_BY_ID } from "@/lib/agents";
import { ACCENTS } from "@/lib/client/theme";
import { cn } from "@/lib/cn";
import { StanceBadge } from "./StanceBadge";

const PHASE_LABEL: Record<DebateMessage["phase"], string> = {
  opening: "Opening",
  challenge: "Challenge",
  defense: "Response",
  closing: "Final stance",
};

export function DebateMessageCard({ message }: { message: DebateMessage }) {
  const agent = AGENTS_BY_ID[message.agentId];
  const a = ACCENTS[agent.accent];
  const target = message.challengeTo ? AGENTS_BY_ID[message.challengeTo] : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -14, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3"
    >
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br text-lg",
            a.border,
            a.gradFrom,
            a.gradTo,
          )}
          style={{ boxShadow: `0 0 18px -8px ${a.glow}` }}
        >
          <span aria-hidden>{agent.avatar}</span>
        </div>
        <div className="mt-1 w-px flex-1 bg-white/8" />
      </div>

      <div className={cn("glass mb-3 flex-1 rounded-2xl rounded-tl-sm p-4")}>
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-white">{agent.name}</span>
          <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold", a.bgSoft, a.text)}>
            {agent.role}
          </span>
          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/45">
            {PHASE_LABEL[message.phase]}
          </span>
          {target && (
            <span className="inline-flex items-center gap-1 rounded border border-rose-400/25 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-300">
              ⚔ challenges {target.name}
            </span>
          )}
          <span className="ml-auto">
            <StanceBadge stance={message.stance} />
          </span>
        </div>

        <p className="text-sm leading-relaxed text-white/80">{message.message}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">Key concern:</span>
            <span className={a.text}>{message.keyConcern}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">Confidence</span>
            <span className="font-medium text-white/70">{message.confidence}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">Severity</span>
            <SeverityDots value={message.severity} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SeverityDots({ value }: { value: number }) {
  const filled = Math.round((value / 100) * 5);
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i < filled ? (value >= 70 ? "bg-rose-400" : value >= 45 ? "bg-amber-400" : "bg-cyan-400") : "bg-white/15",
          )}
        />
      ))}
    </span>
  );
}

"use client";

import { motion } from "framer-motion";
import type { Agent, Stance } from "@/lib/types";
import { ACCENTS } from "@/lib/client/theme";
import { cn } from "@/lib/cn";
import { StanceBadge } from "./StanceBadge";

export function AgentCard({
  agent,
  index = 0,
  stance,
  confidence,
  active = false,
  thinking = false,
  compact = false,
}: {
  agent: Agent;
  index?: number;
  stance?: Stance;
  confidence?: number;
  active?: boolean;
  thinking?: boolean;
  compact?: boolean;
}) {
  const a = ACCENTS[agent.accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass relative overflow-hidden rounded-2xl p-4 transition-shadow",
        active && "ring-1",
        active && a.ring,
      )}
      style={active ? { boxShadow: `0 0 34px -10px ${a.glow}` } : undefined}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl",
          a.gradFrom,
          a.gradTo,
        )}
      />
      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br text-2xl",
            a.border,
            a.gradFrom,
            a.gradTo,
          )}
          style={{ boxShadow: `0 0 22px -8px ${a.glow}` }}
        >
          <span aria-hidden>{agent.avatar}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">{agent.name}</h3>
            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", a.bgSoft, a.text)}>
              {agent.role}
            </span>
          </div>
          <p className={cn("truncate text-xs", a.text)}>{agent.title}</p>
        </div>
      </div>

      {!compact && (
        <p className="relative mt-3 text-xs leading-relaxed text-white/55">{agent.lens}</p>
      )}

      {(stance || thinking) && (
        <div className="relative mt-3 border-t border-white/8 pt-3">
          {thinking ? (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white/60" />
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white/60 [animation-delay:200ms]" />
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-white/60 [animation-delay:400ms]" />
              </span>
              Deliberating…
            </div>
          ) : (
            stance && (
              <div className="flex items-center justify-between gap-2">
                <StanceBadge stance={stance} />
                {typeof confidence === "number" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-white/40">conf</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: a.hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span className="w-7 text-right text-[11px] font-medium text-white/70">{confidence}</span>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </motion.div>
  );
}

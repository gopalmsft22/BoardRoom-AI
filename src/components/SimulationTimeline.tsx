"use client";

import { motion } from "framer-motion";
import type { FutureScenario, ScenarioType } from "@/lib/types";
import { cn } from "@/lib/cn";

const STYLE: Record<ScenarioType, { text: string; border: string; bg: string; dot: string; hex: string; icon: string }> = {
  Optimistic: { text: "text-emerald-300", border: "border-emerald-400/30", bg: "bg-emerald-500/8", dot: "bg-emerald-400", hex: "#34d399", icon: "🚀" },
  Realistic: { text: "text-amber-300", border: "border-amber-400/30", bg: "bg-amber-500/8", dot: "bg-amber-400", hex: "#fbbf24", icon: "🧭" },
  Pessimistic: { text: "text-rose-300", border: "border-rose-400/30", bg: "bg-rose-500/8", dot: "bg-rose-400", hex: "#fb7185", icon: "⚠️" },
};

export function SimulationTimeline({ scenarios }: { scenarios: FutureScenario[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {scenarios.map((s, i) => (
        <ScenarioCard key={s.type} scenario={s} index={i} />
      ))}
    </div>
  );
}

function ScenarioCard({ scenario: s, index }: { scenario: FutureScenario; index: number }) {
  const st = STYLE[s.type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn("glass print-block flex flex-col rounded-2xl border p-5", st.border)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>{st.icon}</span>
          <h4 className={cn("text-sm font-semibold uppercase tracking-wide", st.text)}>{s.type}</h4>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{s.probability}%</div>
          <div className="text-[10px] uppercase tracking-wide text-white/40">likelihood</div>
        </div>
      </div>

      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: st.hex }}
          initial={{ width: 0 }}
          animate={{ width: `${s.probability}%` }}
          transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
        />
      </div>

      <p className={cn("mt-3 text-sm font-medium", st.text)}>{s.headline}</p>

      <div className="mt-4 space-y-3">
        <TimelineNode dot={st.dot} label="6 months" text={s.sixMonths} />
        <TimelineNode dot={st.dot} label="12 months" text={s.twelveMonths} last />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 text-xs">
        <DriverList title="Success drivers" items={s.successDrivers} tone="text-emerald-300/90" />
        <DriverList title="Failure drivers" items={s.failureDrivers} tone="text-rose-300/90" />
      </div>

      <div className="mt-auto pt-4">
        <p className="rounded-xl border border-white/8 bg-white/5 p-3 text-xs leading-relaxed text-white/70">
          <span className="font-semibold text-white/80">Strategic advice — </span>
          {s.strategicAdvice}
        </p>
      </div>
    </motion.div>
  );
}

function TimelineNode({ dot, label, text, last }: { dot: string; label: string; text: string; last?: boolean }) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", dot)} />
        {!last && <span className="mt-1 w-px flex-1 bg-white/12" />}
      </div>
      <div className="pb-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{label}</div>
        <p className="mt-0.5 text-xs leading-relaxed text-white/70">{text}</p>
      </div>
    </div>
  );
}

function DriverList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">{title}</div>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className={cn("flex gap-1.5", tone)}>
            <span className="text-white/30">·</span>
            <span className="leading-snug">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

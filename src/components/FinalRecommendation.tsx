"use client";

import { motion } from "framer-motion";
import type { FinalRecommendation as Rec } from "@/lib/types";
import { VERDICT_STYLES } from "@/lib/client/theme";
import { cn } from "@/lib/cn";

export function FinalRecommendation({ rec }: { rec: Rec }) {
  const v = VERDICT_STYLES[rec.verdict];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn("glass relative overflow-hidden rounded-3xl border p-6 sm:p-8", v.border)}
        style={{ boxShadow: `0 0 60px -22px ${v.glow}` }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: v.glow }}
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Boardroom Verdict
            </div>
            <div className={cn("mt-1 text-4xl font-bold tracking-tight sm:text-5xl", v.text)}>
              {rec.verdict}
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/55">{v.blurb}</p>
          </div>
          <div
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border text-4xl",
              v.bg,
              v.border,
            )}
          >
            {rec.verdict === "Build" ? "🏗️" : rec.verdict === "Pivot" ? "🔄" : rec.verdict === "Drop" ? "🛑" : "🔬"}
          </div>
        </div>

        <p className="relative mt-5 border-t border-white/8 pt-5 text-lg font-medium leading-relaxed text-white">
          {rec.executiveSummary}
        </p>
        <p className="relative mt-3 text-sm leading-relaxed text-white/65">{rec.reasoning}</p>

        <div className="relative mt-5 rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300/80">
            How the board got here
          </div>
          <p className="mt-1 text-sm leading-relaxed text-white/70">{rec.consensusExplanation}</p>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PlanCard title="Action Items" icon="✅" items={rec.actionItems} numbered />
        <PlanCard title="Experiments to Validate" icon="🔬" items={rec.experiments} numbered />
        <PlanCard title="Suggested MVP Features" icon="🧱" items={rec.mvpFeatures} />
        <div className="space-y-5">
          <div className="glass print-block rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden>🧭</span> What to do next
            </div>
            <p className="text-sm leading-relaxed text-white/70">{rec.whatToDoNext}</p>
          </div>
          <div className="glass print-block rounded-2xl border border-violet-400/20 p-5">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden>🎤</span> Pitch positioning
            </div>
            <p className="text-sm italic leading-relaxed text-violet-100/80">
              &ldquo;{rec.pitchPositioning}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  icon,
  items,
  numbered,
}: {
  title: string;
  icon: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <div className="glass print-block rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span aria-hidden>{icon}</span> {title}
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-white/70">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                numbered ? "bg-cyan-400/15 text-cyan-200" : "bg-white/8 text-white/50",
              )}
            >
              {numbered ? i + 1 : "•"}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

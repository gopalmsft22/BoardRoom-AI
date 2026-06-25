"use client";

import { motion } from "framer-motion";
import type { ConsensusScore, ScoreDetail } from "@/lib/types";
import { scoreHex } from "@/lib/client/theme";
import { RadarChart, type RadarAxis } from "./RadarChart";

export function ScoreDashboard({ consensus }: { consensus: ConsensusScore }) {
  const c = consensus;
  const overall = c.overallConfidence.value;

  const axes: RadarAxis[] = [
    { label: "Market", value: c.marketPotential.value },
    { label: "Feasibility", value: c.technicalFeasibility.value },
    { label: "Viability", value: c.businessViability.value },
    { label: "Innovation", value: c.innovation.value },
    { label: "Low Risk", value: 100 - c.riskLevel.value },
    { label: "Easy Exec", value: 100 - c.executionDifficulty.value },
  ];

  const bars: { label: string; d: ScoreDetail; invert?: boolean; hint?: string }[] = [
    { label: "Market Potential", d: c.marketPotential },
    { label: "Technical Feasibility", d: c.technicalFeasibility },
    { label: "Business Viability", d: c.businessViability },
    { label: "Risk Level", d: c.riskLevel, invert: true, hint: "higher = riskier" },
    { label: "Innovation", d: c.innovation },
    { label: "Execution Difficulty", d: c.executionDifficulty, invert: true, hint: "higher = harder" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <div className="flex flex-col items-center gap-5">
          <OverallGauge value={overall} justification={c.overallConfidence.justification} />
          <div className="w-full max-w-[300px]">
            <RadarChart axes={axes} color={scoreHex(overall)} />
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {bars.map((b, i) => (
          <ScoreBar key={b.label} {...b} index={i} />
        ))}
      </div>
    </div>
  );
}

function OverallGauge({ value, justification }: { value: number; justification: string }) {
  const size = 168;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = scoreHex(value);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (value / 100) * c }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {value}
          </motion.span>
          <span className="text-[10px] uppercase tracking-[0.16em] text-white/45">/ 100</span>
        </div>
      </div>
      <h4 className="mt-3 text-sm font-semibold text-white">Overall Confidence</h4>
      <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-white/50">{justification}</p>
    </div>
  );
}

function ScoreBar({
  label,
  d,
  invert,
  hint,
  index,
}: {
  label: string;
  d: ScoreDetail;
  invert?: boolean;
  hint?: string;
  index: number;
}) {
  const color = scoreHex(d.value, invert);
  return (
    <div className="print-block">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-white/85">
          {label}
          {hint && <span className="ml-2 text-[10px] uppercase tracking-wide text-white/35">{hint}</span>}
        </span>
        <span className="text-sm font-semibold" style={{ color }}>
          {d.value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 12px -2px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${d.value}%` }}
          transition={{ duration: 0.9, delay: index * 0.06, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-white/50">{d.justification}</p>
    </div>
  );
}

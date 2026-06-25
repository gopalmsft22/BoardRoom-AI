import type { AgentAccent, Stance, Verdict } from "../types";

// ============================================================================
// Visual theme tokens. All Tailwind class names are written as full literal
// strings so the Tailwind v4 scanner picks them up (dynamic interpolation
// would be purged).
// ============================================================================

export interface AccentStyle {
  text: string;
  border: string;
  ring: string;
  dot: string;
  bgSoft: string;
  gradFrom: string;
  gradTo: string;
  /** rgba string for inline box-shadow glows. */
  glow: string;
  hex: string;
}

export const ACCENTS: Record<AgentAccent, AccentStyle> = {
  cyan: {
    text: "text-cyan-300",
    border: "border-cyan-400/40",
    ring: "ring-cyan-400/40",
    dot: "bg-cyan-400",
    bgSoft: "bg-cyan-500/10",
    gradFrom: "from-cyan-400/30",
    gradTo: "to-cyan-500/5",
    glow: "rgba(34,211,238,0.55)",
    hex: "#22d3ee",
  },
  violet: {
    text: "text-violet-300",
    border: "border-violet-400/40",
    ring: "ring-violet-400/40",
    dot: "bg-violet-400",
    bgSoft: "bg-violet-500/10",
    gradFrom: "from-violet-400/30",
    gradTo: "to-violet-500/5",
    glow: "rgba(168,85,247,0.55)",
    hex: "#a855f7",
  },
  emerald: {
    text: "text-emerald-300",
    border: "border-emerald-400/40",
    ring: "ring-emerald-400/40",
    dot: "bg-emerald-400",
    bgSoft: "bg-emerald-500/10",
    gradFrom: "from-emerald-400/30",
    gradTo: "to-emerald-500/5",
    glow: "rgba(16,185,129,0.5)",
    hex: "#10b981",
  },
  amber: {
    text: "text-amber-300",
    border: "border-amber-400/40",
    ring: "ring-amber-400/40",
    dot: "bg-amber-400",
    bgSoft: "bg-amber-500/10",
    gradFrom: "from-amber-400/30",
    gradTo: "to-amber-500/5",
    glow: "rgba(245,158,11,0.5)",
    hex: "#f59e0b",
  },
  rose: {
    text: "text-rose-300",
    border: "border-rose-400/40",
    ring: "ring-rose-400/40",
    dot: "bg-rose-400",
    bgSoft: "bg-rose-500/10",
    gradFrom: "from-rose-400/30",
    gradTo: "to-rose-500/5",
    glow: "rgba(244,63,94,0.5)",
    hex: "#fb7185",
  },
  sky: {
    text: "text-sky-300",
    border: "border-sky-400/40",
    ring: "ring-sky-400/40",
    dot: "bg-sky-400",
    bgSoft: "bg-sky-500/10",
    gradFrom: "from-sky-400/30",
    gradTo: "to-sky-500/5",
    glow: "rgba(56,189,248,0.5)",
    hex: "#38bdf8",
  },
};

export interface StanceStyle {
  text: string;
  bg: string;
  border: string;
  dot: string;
  hex: string;
}

export const STANCE_STYLES: Record<Stance, StanceStyle> = {
  Supportive: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/12",
    border: "border-emerald-400/30",
    dot: "bg-emerald-400",
    hex: "#34d399",
  },
  Neutral: {
    text: "text-slate-300",
    bg: "bg-slate-400/10",
    border: "border-slate-300/20",
    dot: "bg-slate-300",
    hex: "#cbd5e1",
  },
  Concerned: {
    text: "text-amber-300",
    bg: "bg-amber-500/12",
    border: "border-amber-400/30",
    dot: "bg-amber-400",
    hex: "#fbbf24",
  },
  "Strongly Opposed": {
    text: "text-rose-300",
    bg: "bg-rose-500/12",
    border: "border-rose-400/30",
    dot: "bg-rose-400",
    hex: "#fb7185",
  },
};

export interface VerdictStyle {
  text: string;
  bg: string;
  border: string;
  glow: string;
  hex: string;
  blurb: string;
}

export const VERDICT_STYLES: Record<Verdict, VerdictStyle> = {
  Build: {
    text: "text-emerald-300",
    bg: "bg-emerald-500/12",
    border: "border-emerald-400/40",
    glow: "rgba(16,185,129,0.45)",
    hex: "#34d399",
    blurb: "Strong enough to build — with focus.",
  },
  "Validate First": {
    text: "text-cyan-300",
    bg: "bg-cyan-500/12",
    border: "border-cyan-400/40",
    glow: "rgba(34,211,238,0.45)",
    hex: "#22d3ee",
    blurb: "Promising — earn the build through validation.",
  },
  Pivot: {
    text: "text-amber-300",
    bg: "bg-amber-500/12",
    border: "border-amber-400/40",
    glow: "rgba(245,158,11,0.45)",
    hex: "#fbbf24",
    blurb: "Real market, wrong mechanism — pivot.",
  },
  Drop: {
    text: "text-rose-300",
    bg: "bg-rose-500/12",
    border: "border-rose-400/40",
    glow: "rgba(244,63,94,0.45)",
    hex: "#fb7185",
    blurb: "Doesn't clear the bar as framed.",
  },
};

/** A hex colour for a 0–100 score. `invert` for risk/difficulty (higher = worse). */
export function scoreHex(value: number, invert = false): string {
  const v = invert ? 100 - value : value;
  if (v >= 64) return "#34d399";
  if (v >= 44) return "#fbbf24";
  return "#fb7185";
}

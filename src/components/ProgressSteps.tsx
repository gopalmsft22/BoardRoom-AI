"use client";

import { cn } from "@/lib/cn";

export function ProgressSteps({
  steps,
  current,
}: {
  steps: readonly string[];
  current: number;
}) {
  return (
    <ol className="relative">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="relative flex gap-3 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute left-[13px] top-7 h-[calc(100%-12px)] w-px",
                  done ? "bg-cyan-400/40" : "bg-white/10",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-[27px] w-[27px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                done && "border-cyan-400/50 bg-cyan-400/15 text-cyan-200",
                active && "border-cyan-300/70 bg-cyan-400/20 text-white",
                !done && !active && "border-white/12 bg-white/5 text-white/40",
              )}
            >
              {active && (
                <span className="absolute inset-0 animate-pulse-glow rounded-full ring-2 ring-cyan-300/50" />
              )}
              {done ? "✓" : i + 1}
            </span>
            <span
              className={cn(
                "pt-1 text-sm transition-colors",
                done && "text-white/70",
                active && "font-medium text-white",
                !done && !active && "text-white/40",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

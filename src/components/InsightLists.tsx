import type { ConsensusScore } from "@/lib/types";
import { cn } from "@/lib/cn";

interface ListSpec {
  title: string;
  icon: string;
  items: string[];
  accent: string;
  marker: string;
}

export function InsightLists({ consensus }: { consensus: ConsensusScore }) {
  const top: ListSpec[] = [
    { title: "Top Strengths", icon: "✅", items: consensus.strengths, accent: "border-emerald-400/20", marker: "text-emerald-300" },
    { title: "Top Weaknesses", icon: "⚠️", items: consensus.weaknesses, accent: "border-amber-400/20", marker: "text-amber-300" },
    { title: "Main Risks", icon: "🚨", items: consensus.risks, accent: "border-rose-400/20", marker: "text-rose-300" },
  ];
  const bottom: ListSpec[] = [
    { title: "Assumptions to Validate", icon: "🔬", items: consensus.assumptionsToValidate, accent: "border-cyan-400/20", marker: "text-cyan-300" },
    { title: "Recommended Next Steps", icon: "🧭", items: consensus.recommendedNextSteps, accent: "border-violet-400/20", marker: "text-violet-300" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-3">
        {top.map((l) => (
          <ListCard key={l.title} spec={l} />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {bottom.map((l) => (
          <ListCard key={l.title} spec={l} />
        ))}
      </div>
    </div>
  );
}

function ListCard({ spec }: { spec: ListSpec }) {
  return (
    <div className={cn("glass print-block rounded-2xl border p-5", spec.accent)}>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <span aria-hidden>{spec.icon}</span> {spec.title}
      </div>
      <ul className="space-y-2">
        {spec.items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-white/70">
            <span className={cn("mt-1 shrink-0", spec.marker)}>▸</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import type { BoardroomReport } from "@/lib/types";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { FinalRecommendation } from "./FinalRecommendation";
import { ScoreDashboard } from "./ScoreDashboard";
import { InsightLists } from "./InsightLists";
import { SimulationTimeline } from "./SimulationTimeline";
import { DebateTimeline } from "./DebateTimeline";
import { AgentCard } from "./AgentCard";
import { ReportToolbar } from "./ReportToolbar";

export function ReportView({ report }: { report: BoardroomReport }) {
  const { idea } = report;
  const date = new Date(report.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-12">
      {/* Idea header + toolbar */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[11px] text-white/60">
                {idea.stage}
              </span>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
                {report.mode === "llm" ? "LLM engine" : "Demo engine"}
              </span>
              <span className="text-[11px] text-white/35">Generated {date}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {idea.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60">{idea.problem}</p>
          </div>
          <ReportToolbar report={report} />
        </div>

        <div className="mt-6 grid gap-4 border-t border-white/8 pt-6 sm:grid-cols-3">
          <Field label="Target users" value={idea.targetUsers} />
          <Field label="Proposed solution" value={idea.solution} />
          <Field label="Business model" value={idea.businessModel} />
        </div>
      </div>

      {/* Verdict */}
      <section>
        <Reveal>
          <SectionHeading
            eyebrow="The Decision"
            title="Final Boardroom Recommendation"
            subtitle="A single verdict, backed by the debate and the numbers."
          />
        </Reveal>
        <FinalRecommendation rec={report.recommendation} />
      </section>

      {/* Scores */}
      <section>
        <Reveal>
          <SectionHeading
            eyebrow="Explainable Consensus"
            title="Consensus Scorecard"
            subtitle="Every score carries a one-line justification — no naked numbers."
          />
        </Reveal>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <ScoreDashboard consensus={report.consensus} />
        </div>
      </section>

      {/* Insights */}
      <section>
        <Reveal>
          <SectionHeading eyebrow="Signal Extraction" title="Strengths, Risks & What to Test" />
        </Reveal>
        <InsightLists consensus={report.consensus} />
      </section>

      {/* Simulations */}
      <section>
        <Reveal>
          <SectionHeading
            eyebrow="Future Simulation"
            title="Three Possible Futures"
            subtitle="Optimistic, realistic and pessimistic trajectories over the next 12 months."
          />
        </Reveal>
        <SimulationTimeline scenarios={report.scenarios} />
      </section>

      {/* Council + debate */}
      <section>
        <Reveal>
          <SectionHeading
            eyebrow="The Council"
            title="Six Executives, One Debate"
            subtitle="Final stances and the full transcript of the boardroom debate."
          />
        </Reveal>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.agents.map((agent, i) => {
            const a = report.assessments.find((x) => x.agentId === agent.id);
            return (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={i}
                stance={a?.stance}
                confidence={a?.confidence}
                active
              />
            );
          })}
        </div>
        <div className="glass rounded-3xl p-5 sm:p-6">
          <DebateTimeline messages={report.debate} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/40">{label}</div>
      <p className="mt-1 text-sm leading-relaxed text-white/75">{value}</p>
    </div>
  );
}

"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AgentRole, BoardroomReport, DebateMessage, Stance } from "@/lib/types";
import { PROGRESS_STEPS } from "@/lib/types";
import { getAgents } from "@/lib/agents";
import { runDebate, streamUrl } from "@/lib/client/api";
import { VERDICT_STYLES } from "@/lib/client/theme";
import { cn } from "@/lib/cn";
import { ProgressSteps } from "@/components/ProgressSteps";
import { AgentCard } from "@/components/AgentCard";
import { DebateTimeline } from "@/components/DebateTimeline";

type LiveState = Partial<Record<AgentRole, { stance: Stance; confidence: number }>>;
type Status = "connecting" | "streaming" | "done" | "error";

export default function BoardroomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const agents = getAgents();

  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [live, setLive] = useState<LiveState>({});
  const [activeAgent, setActiveAgent] = useState<AgentRole | null>(null);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>("connecting");
  const [report, setReport] = useState<BoardroomReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doneRef = useRef(false);
  const stepRef = useRef(1);

  function bumpStep(to: number) {
    if (to > stepRef.current) {
      stepRef.current = to;
      setStep(to);
    }
  }

  function ingest(msg: DebateMessage) {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    setLive((prev) => ({ ...prev, [msg.role]: { stance: msg.stance, confidence: msg.confidence } }));
    setActiveAgent(msg.role);
    if (msg.phase === "opening") bumpStep(2);
    if (msg.phase === "challenge") bumpStep(3);
    if (msg.phase === "closing") bumpStep(4);
  }

  function finish(finalReport: BoardroomReport) {
    doneRef.current = true;
    setReport(finalReport);
    setActiveAgent(null);
    setStatus("done");
    bumpStep(4);
    setTimeout(() => bumpStep(5), 500);
    setTimeout(() => bumpStep(6), 1000);
    setTimeout(() => bumpStep(7), 1500);
  }

  useEffect(() => {
    let cancelled = false;
    let es: EventSource | null = null;
    let fellBack = false;

    // ---- Fallback: fetch the full report, then reveal messages on a timer ----
    async function fallback() {
      if (fellBack || doneRef.current) return;
      fellBack = true;
      try {
        setStatus("streaming");
        bumpStep(2);
        const { report: rep } = await runDebate(id);
        if (cancelled) return;
        for (let i = 0; i < rep.debate.length; i++) {
          if (cancelled) return;
          ingest(rep.debate[i]);
          await new Promise((r) => setTimeout(r, 650));
        }
        if (!cancelled) finish(rep);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to run the debate.");
          setStatus("error");
        }
      }
    }

    // ---- Primary: Server-Sent Events live stream ----
    try {
      es = new EventSource(streamUrl(id, 750));
      es.addEventListener("open", () => !cancelled && setStatus("streaming"));
      es.addEventListener("agents", () => bumpStep(2));
      es.addEventListener("message", (e) => {
        if (cancelled) return;
        try {
          ingest(JSON.parse((e as MessageEvent).data) as DebateMessage);
        } catch {
          /* ignore malformed frame */
        }
      });
      es.addEventListener("report", (e) => {
        if (cancelled) return;
        try {
          finish(JSON.parse((e as MessageEvent).data) as BoardroomReport);
        } catch {
          /* ignore */
        }
      });
      es.addEventListener("done", () => {
        es?.close();
      });
      es.addEventListener("error", () => {
        es?.close();
        if (!doneRef.current && !cancelled) fallback();
      });
    } catch {
      fallback();
    }

    return () => {
      cancelled = true;
      es?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const verdict = report?.recommendation.verdict;
  const phaseLabel =
    status === "done"
      ? "Consensus reached"
      : messages.length === 0
        ? "Initializing council…"
        : PROGRESS_STEPS[Math.min(step, PROGRESS_STEPS.length - 1)];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                  status === "done"
                    ? "bg-emerald-500/12 text-emerald-300"
                    : status === "error"
                      ? "bg-rose-500/12 text-rose-300"
                      : "bg-cyan-500/12 text-cyan-300",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    status === "done" ? "bg-emerald-400" : status === "error" ? "bg-rose-400" : "animate-pulse-glow bg-cyan-400",
                  )}
                />
                {status === "done" ? "Complete" : status === "error" ? "Error" : "Live"}
              </span>
              <span className="text-xs text-white/50">{phaseLabel}</span>
            </div>

            <div className="mt-5">
              <ProgressSteps steps={PROGRESS_STEPS} current={step} />
            </div>
          </div>

          {status === "done" && report && verdict && (
            <Link
              href={`/report/${id}`}
              className={cn(
                "glass mt-4 block rounded-2xl border p-5 transition hover:scale-[1.01]",
                VERDICT_STYLES[verdict].border,
              )}
              style={{ boxShadow: `0 0 40px -16px ${VERDICT_STYLES[verdict].glow}` }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/45">
                Verdict
              </div>
              <div className={cn("mt-1 text-2xl font-bold", VERDICT_STYLES[verdict].text)}>
                {verdict}
              </div>
              <div className="btn btn-primary mt-3 w-full text-sm">View full report →</div>
            </Link>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
              <button onClick={() => location.reload()} className="btn btn-ghost mt-3 w-full text-xs">
                Retry
              </button>
            </div>
          )}
        </aside>

        {/* Main: roster + debate */}
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Live Boardroom Debate
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Six AI executives are debating your idea in real time.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {agents.map((agent, i) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                index={i}
                compact
                stance={live[agent.id]?.stance}
                confidence={live[agent.id]?.confidence}
                active={activeAgent === agent.id}
                thinking={status !== "done" && !live[agent.id]}
              />
            ))}
          </div>

          {messages.length === 0 && status !== "error" ? (
            <DebateSkeleton />
          ) : (
            <DebateTimeline messages={messages} />
          )}

          {status === "done" && report && (
            <div className="mt-4 flex justify-center">
              <Link href={`/report/${id}`} className="btn btn-primary">
                View the full decision report →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DebateSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5" />
          <div className="glass flex-1 rounded-2xl p-4">
            <div className="shimmer h-3 w-40 rounded" />
            <div className="shimmer mt-3 h-3 w-full rounded" />
            <div className="shimmer mt-2 h-3 w-4/5 rounded" />
          </div>
        </div>
      ))}
      <p className="pt-2 text-center text-sm text-white/40">The council is taking their seats…</p>
    </div>
  );
}

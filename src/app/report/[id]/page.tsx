"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { BoardroomReport } from "@/lib/types";
import { fetchSession, runDebate, ApiError } from "@/lib/client/api";
import { ReportView } from "@/components/ReportView";

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [report, setReport] = useState<BoardroomReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { session } = await fetchSession(id);
        if (cancelled) return;
        if (session.report) {
          setReport(session.report);
          return;
        }
        const { report: rep } = await runDebate(id);
        if (!cancelled) setReport(rep);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError && e.status === 404
              ? "We couldn't find that boardroom session. It may have expired."
              : e instanceof Error
                ? e.message
                : "Something went wrong building the report.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
        <div className="text-5xl">🗂️</div>
        <h1 className="mt-4 text-xl font-semibold text-white">Report unavailable</h1>
        <p className="mt-2 text-sm text-white/55">{error}</p>
        <Link href="/idea" className="btn btn-primary mt-6">
          Start a new session
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
        <span className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-cyan-300" />
        <h1 className="mt-5 text-lg font-semibold text-white">Compiling the decision report…</h1>
        <p className="mt-2 text-sm text-white/50">
          Aggregating the debate, scoring the consensus, and simulating futures.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <ReportView report={report} />
    </div>
  );
}

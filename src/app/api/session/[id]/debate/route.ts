import { NextResponse } from "next/server";
import { getSession, setReport, updateSession } from "@/lib/services/sessionStore";
import { generateReport } from "@/lib/services/reportService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/session/[id]/debate  — run the full boardroom pipeline.
// Returns the cached report if it already exists (idempotent re-clicks).
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get("force") === "1";
  if (session.report && !force) {
    return NextResponse.json({ report: session.report, cached: true });
  }

  try {
    updateSession(id, { status: "debating" });
    const report = await generateReport(id, session.idea);
    setReport(id, report);
    return NextResponse.json({ report });
  } catch (err) {
    updateSession(id, { status: "error", error: String(err) });
    return NextResponse.json(
      { error: "Failed to run the boardroom session." },
      { status: 500 },
    );
  }
}

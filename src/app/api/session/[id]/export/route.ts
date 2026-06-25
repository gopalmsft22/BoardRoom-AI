import { NextResponse } from "next/server";
import { getSession, setReport } from "@/lib/services/sessionStore";
import { generateReport } from "@/lib/services/reportService";
import { reportFilename, reportToMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// POST /api/session/[id]/export  — export the report as Markdown.
// Returns JSON { filename, markdown } by default, or a file download with ?download=1.
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  let report = session.report;
  if (!report) {
    report = await generateReport(id, session.idea);
    setReport(id, report);
  }

  const markdown = reportToMarkdown(report);
  const filename = reportFilename(report);

  const url = new URL(req.url);
  if (url.searchParams.get("download") === "1") {
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json({ filename, markdown });
}

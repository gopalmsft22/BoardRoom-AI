import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/sessionStore";
import { reportToMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

// GET /api/session/[id]/report  — full report JSON, or ?format=markdown.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session?.report) {
    return NextResponse.json(
      { error: "Report not ready. Run the debate first." },
      { status: 404 },
    );
  }

  const url = new URL(req.url);
  if (url.searchParams.get("format") === "markdown") {
    return new Response(reportToMarkdown(session.report), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
  }

  return NextResponse.json({ report: session.report });
}

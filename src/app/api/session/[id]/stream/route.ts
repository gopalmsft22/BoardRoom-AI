import { getSession, setReport, updateSession } from "@/lib/services/sessionStore";
import { generateReport } from "@/lib/services/reportService";
import type { DebateMessage } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// GET /api/session/[id]/stream  — Server-Sent Events live debate.
// Streams: status -> agents -> message (xN, paced) -> report -> done.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const url = new URL(req.url);
  const pace = Math.max(0, Math.min(2000, Number(url.searchParams.get("pace") ?? 700)));

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        send("status", { step: "Agents initialized" });

        let report = session.report;
        if (!report) {
          updateSession(id, { status: "debating" });
          report = await generateReport(id, session.idea);
          setReport(id, report);
        }

        send("agents", { agents: report.agents, mode: report.mode });
        await sleep(pace);
        send("status", { step: "Debate started" });

        let lastPhase = "";
        for (const msg of report.debate as DebateMessage[]) {
          if (msg.phase !== lastPhase) {
            lastPhase = msg.phase;
            if (msg.phase === "challenge") send("status", { step: "Challenges exchanged" });
          }
          send("message", msg);
          await sleep(pace);
        }

        send("status", { step: "Consensus calculated" });
        send("report", report);
        send("done", { ok: true });
      } catch (err) {
        send("error", { error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextResponse } from "next/server";
import { createSession, listSessions } from "@/lib/services/sessionStore";
import { normalizeIdea, validateIdea } from "@/lib/validation";
import { isLLMConfigured } from "@/lib/services/llmProvider";

export const dynamic = "force-dynamic";

// POST /api/session  — create a new boardroom session from a startup idea.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const raw = (body as { idea?: unknown })?.idea ?? body ?? {};
  const idea = normalizeIdea(raw as Record<string, string>);
  const { valid, errors } = validateIdea(idea);
  if (!valid) {
    return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
  }

  const session = createSession(idea);
  return NextResponse.json(
    { sessionId: session.id, session, mode: session.mode },
    { status: 201 },
  );
}

// GET /api/session  — list sessions (handy for debugging / demos).
export async function GET() {
  return NextResponse.json({
    mode: isLLMConfigured() ? "llm" : "mock",
    sessions: listSessions().map((s) => ({
      id: s.id,
      title: s.idea.title,
      status: s.status,
      createdAt: s.createdAt,
    })),
  });
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/services/sessionStore";

export const dynamic = "force-dynamic";

// GET /api/session/[id]  — fetch a session (includes the report once ready).
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const session = getSession(id);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json({ session });
}

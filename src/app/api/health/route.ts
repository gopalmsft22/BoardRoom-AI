import { NextResponse } from "next/server";
import { isLLMConfigured } from "@/lib/services/llmProvider";

export const dynamic = "force-dynamic";

// GET /api/health — quick liveness + mode probe.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "boardroom-ai",
    mode: isLLMConfigured() ? "llm" : "mock",
    time: new Date().toISOString(),
  });
}

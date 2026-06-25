import type { BoardroomReport, Session, StartupIdea } from "../types";

// ============================================================================
// Typed client-side API helpers with friendly error handling.
// ============================================================================

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;
  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? `Request failed (${res.status})`,
      res.status,
      (data as { errors?: Record<string, string> }).errors,
    );
  }
  return data as T;
}

export async function createSession(
  idea: StartupIdea,
): Promise<{ sessionId: string; mode: "mock" | "llm"; session: Session }> {
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  return parse(res);
}

export async function fetchSession(id: string): Promise<{ session: Session }> {
  const res = await fetch(`/api/session/${id}`, { cache: "no-store" });
  return parse(res);
}

export async function runDebate(
  id: string,
): Promise<{ report: BoardroomReport; cached?: boolean }> {
  const res = await fetch(`/api/session/${id}/debate`, { method: "POST" });
  return parse(res);
}

export async function exportMarkdown(
  id: string,
): Promise<{ filename: string; markdown: string }> {
  const res = await fetch(`/api/session/${id}/export`, { method: "POST" });
  return parse(res);
}

export function streamUrl(id: string, pace = 700): string {
  return `/api/session/${id}/stream?pace=${pace}`;
}

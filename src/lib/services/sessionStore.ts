import type { BoardroomReport, Session, StartupIdea } from "../types";
import { getProvider } from "./llmProvider";

// ============================================================================
// In-memory session store.
//
// Attached to globalThis so it survives Next.js dev hot-reloads. This is
// perfect for a hackathon / single-instance demo. For multi-instance
// production you'd swap this for Redis or a database (see README).
// ============================================================================

interface BoardroomStore {
  sessions: Map<string, Session>;
}

const globalForStore = globalThis as unknown as {
  __boardroomStore?: BoardroomStore;
};

const store: BoardroomStore =
  globalForStore.__boardroomStore ?? { sessions: new Map<string, Session>() };

if (!globalForStore.__boardroomStore) {
  globalForStore.__boardroomStore = store;
}

function genId(): string {
  const raw =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `bra_${raw.replace(/-/g, "").slice(0, 12)}`;
}

export function createSession(idea: StartupIdea): Session {
  const now = Date.now();
  const session: Session = {
    id: genId(),
    idea,
    status: "created",
    createdAt: now,
    updatedAt: now,
    mode: getProvider().mode,
  };
  store.sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return store.sessions.get(id);
}

export function updateSession(
  id: string,
  patch: Partial<Omit<Session, "id">>,
): Session | undefined {
  const existing = store.sessions.get(id);
  if (!existing) return undefined;
  const updated: Session = { ...existing, ...patch, id, updatedAt: Date.now() };
  store.sessions.set(id, updated);
  return updated;
}

export function setReport(id: string, report: BoardroomReport): Session | undefined {
  return updateSession(id, { status: "complete", report });
}

export function listSessions(): Session[] {
  return Array.from(store.sessions.values()).sort((a, b) => b.createdAt - a.createdAt);
}

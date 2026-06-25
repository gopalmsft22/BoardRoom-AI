# Boardroom AI — Backend API

The backend is implemented as **Next.js Route Handlers** under `src/app/api/**`, backed by framework-agnostic service modules in `src/lib/**`. There is no separate server to run — it ships inside the same Next.js app.

> **State:** sessions are held in an in-memory store (`src/lib/services/sessionStore.ts`) attached to `globalThis` so they survive dev hot-reloads. Perfect for a single-instance demo. For production, swap the store for Redis/Postgres (the interface is tiny).

## Service modules

| Module | Responsibility |
| --- | --- |
| `lib/services/llmProvider.ts` | Provider abstraction. `getProvider()` returns an OpenAI-compatible client when `OPENAI_API_KEY` is set, else the mock. |
| `lib/services/mockProvider.ts` | Deterministic, idea-aware content generator (demo mode brain). |
| `lib/services/reportService.ts` | Orchestrates the full pipeline → `BoardroomReport`; re-exports the Markdown serializer. |
| `lib/services/sessionStore.ts` | Create / get / update sessions. |
| `lib/engines/debateEngine.ts` | Four-phase debate orchestration + optional LLM prose enrichment. |
| `lib/engines/consensusEngine.ts` | Seven explainable scores + insight lists. |
| `lib/engines/futureSimulationEngine.ts` | Three probability-weighted scenarios. |
| `lib/engines/recommendationEngine.ts` | Final verdict + action plan. |

## Endpoints

### `POST /api/session`
Create a session from a startup idea.

```jsonc
// Request body
{ "idea": { "title": "...", "problem": "...", "targetUsers": "...",
            "solution": "...", "businessModel": "...", "stage": "..." } }
// 201 Response
{ "sessionId": "bra_xx…", "mode": "mock", "session": { … } }
// 400 Response (validation)
{ "error": "Validation failed", "errors": { "problem": "…" } }
```

### `GET /api/session/[id]`
Fetch a session. Includes `report` once the debate has run. `404` if unknown.

### `POST /api/session/[id]/debate`
Run the full pipeline and return `{ report }`. **Idempotent** — returns the cached report on repeat calls (`{ report, cached: true }`). Pass `?force=1` to regenerate.

### `GET /api/session/[id]/stream`  _(Server-Sent Events)_
Streams the live debate. Query: `?pace=<ms>` (0–2000, default 700).

```
event: status    data: { "step": "Agents initialized" }
event: agents    data: { "agents": [ …six agents… ], "mode": "mock" }
event: status    data: { "step": "Debate started" }
event: message   data: { …DebateMessage… }          # one per debate turn, paced
event: status    data: { "step": "Consensus calculated" }
event: report    data: { …full BoardroomReport… }
event: done      data: { "ok": true }
```

### `GET /api/session/[id]/report`
Returns `{ report }`, or raw Markdown with `?format=markdown`. `404` if not generated yet.

### `POST /api/session/[id]/export`
Returns `{ filename, markdown }`. With `?download=1`, returns a `text/markdown` file download. Generates the report first if needed.

### `GET /api/health`
`{ status: "ok", mode: "mock" | "llm", time }`.

## Data models

All response shapes are defined in [`src/lib/types.ts`](../../lib/types.ts): `StartupIdea`, `Agent`, `DebateMessage`, `AgentAssessment`, `ConsensusScore`, `FutureScenario`, `FinalRecommendation`, `BoardroomReport`, `Session`.

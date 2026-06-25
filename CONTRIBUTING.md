# Contributing to Boardroom AI

Thanks for your interest in improving Boardroom AI! This guide will get you productive fast.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000 (demo mode, no API key)
```

- **Node.js 20.9+** is required (developed on 24).
- The app runs entirely in **demo mode** by default — no secrets needed.

## Project layout

| Path | What lives here |
| --- | --- |
| `src/app/` | App Router pages + API route handlers (`api/**`) |
| `src/components/` | UI components (client + presentational) |
| `src/lib/agents/` | The six agent personas |
| `src/lib/engines/` | `debateEngine`, `consensusEngine`, `futureSimulationEngine`, `recommendationEngine` |
| `src/lib/services/` | `llmProvider`, `mockProvider`, `reportService`, `sessionStore` |
| `src/lib/analysis.ts` | Deterministic idea → signals + seeded RNG |
| `src/lib/types.ts` | All shared data models |

## Conventions

- **TypeScript everywhere**, `strict` mode on. Keep `npx tsc --noEmit` clean.
- **Determinism:** scoring and signal logic must stay pure and deterministic. Use the seeded RNG in `analysis.ts` (`makeRng`) only for choosing phrasing — never for scores.
- **Server vs client:** keep server-only code (engines, services, `sessionStore`) out of client components. Pure helpers (`markdown.ts`, `types.ts`, `client/theme.ts`) are safe on both sides.
- **Styling:** Tailwind CSS v4. Use the accent tokens in `src/lib/client/theme.ts` (full literal class strings — never interpolate Tailwind classes, or the scanner will purge them).
- **No naked numbers:** any new score must ship with a justification.

## Quality checks before a PR

```bash
npx tsc --noEmit   # type-check
npm run lint       # eslint
npm run build      # production build must pass
```

Please also manually verify the end-to-end flow (idea → debate → report → export) in demo mode.

## Adding a new agent

1. Add the persona to `src/lib/agents/index.ts` (name, role, lens, avatar, accent).
2. Add a voice + disposition formula + score impact in `src/lib/services/mockProvider.ts`.
3. Wire the agent into the `CHALLENGE_RING` so it both challenges and is challenged.
4. Add an accent entry in `src/lib/client/theme.ts` if you use a new colour.

## Commit style

Small, focused commits with clear messages. Reference the area touched, e.g.
`engines: tune risk weighting for regulated domains`.

## Code of conduct

Be kind, be constructive. We're here to build something great together.

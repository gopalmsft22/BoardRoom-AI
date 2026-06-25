import type {
  Agent,
  AgentAssessment,
  AgentRole,
  DebateMessage,
  DebatePhase,
  StartupIdea,
} from "../types";
import { type IdeaSignals, makeRng } from "../analysis";
import { AGENTS_BY_ID } from "../agents";
import {
  CHALLENGED_BY,
  challengeTurn,
  closingTurn,
  defenseTurn,
  disposition,
  openingTurn,
  stanceFromDisposition,
  type TurnContent,
} from "../services/mockProvider";
import type { Provider } from "../services/llmProvider";

// ============================================================================
// Debate engine — orchestrates the four-phase boardroom debate.
//
// Phases:
//   1. opening    — every agent gives an opening assessment.
//   2. challenge  — every agent challenges exactly one other agent (a ring).
//   3. defense    — every challenged agent defends or revises.
//   4. closing    — every agent gives a final stance.
//
// Structure (stance, scores, who-challenges-who) is fully deterministic. When a
// real LLM is configured, message *prose* is enriched in parallel, with a safe
// fallback to the deterministic text if any call fails.
// ============================================================================

const PHASE_GAP_MS = 1100;

function buildMessage(
  agent: Agent,
  phase: DebatePhase,
  round: number,
  content: TurnContent,
  index: number,
  startTs: number,
): DebateMessage {
  return {
    id: `${phase}-${agent.id}-${round}`,
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    phase,
    round,
    stance: content.stance,
    message: content.message,
    keyConcern: content.keyConcern,
    confidence: content.confidence,
    challengeTo: content.challengeTo,
    challengeText: content.challengeText,
    scoreImpact: content.scoreImpact,
    severity: content.severity,
    timestamp: startTs + index * PHASE_GAP_MS,
  };
}

export async function runDebate(
  idea: StartupIdea,
  signals: IdeaSignals,
  agents: Agent[],
  provider: Provider,
): Promise<DebateMessage[]> {
  const rng = makeRng(`${idea.title}::${idea.problem}`);
  const startTs = Date.now();
  const messages: DebateMessage[] = [];
  let i = 0;

  // Phase 1 — opening
  for (const agent of agents) {
    messages.push(
      buildMessage(agent, "opening", 1, openingTurn(agent.role, idea, signals, rng), i++, startTs),
    );
  }
  // Phase 2 — challenges
  for (const agent of agents) {
    messages.push(
      buildMessage(agent, "challenge", 2, challengeTurn(agent.role, idea, signals), i++, startTs),
    );
  }
  // Phase 3 — defense / revision
  for (const agent of agents) {
    messages.push(
      buildMessage(agent, "defense", 3, defenseTurn(agent.role, idea, signals), i++, startTs),
    );
  }
  // Phase 4 — closing
  for (const agent of agents) {
    messages.push(
      buildMessage(agent, "closing", 4, closingTurn(agent.role, idea, signals, rng), i++, startTs),
    );
  }

  if (provider.mode === "llm") {
    await enrichWithLLM(messages, idea, provider);
  }

  return messages;
}

// ----------------------------------------------------------------------------
// Optional LLM enrichment: rewrite each message in the agent's voice while
// keeping the deterministic stance/scores. Runs in parallel; never throws.
// ----------------------------------------------------------------------------

async function enrichWithLLM(
  messages: DebateMessage[],
  idea: StartupIdea,
  provider: Provider,
): Promise<void> {
  const ideaBlock = [
    `Title: ${idea.title}`,
    `Problem: ${idea.problem}`,
    `Target users: ${idea.targetUsers}`,
    `Solution: ${idea.solution}`,
    `Business model: ${idea.businessModel}`,
    `Stage: ${idea.stage}`,
  ].join("\n");

  await Promise.allSettled(
    messages.map(async (m) => {
      const agent = AGENTS_BY_ID[m.agentId];
      const target = m.challengeTo ? AGENTS_BY_ID[m.challengeTo] : undefined;
      const phaseHint =
        m.phase === "challenge" && target
          ? `You are directly challenging ${target.name} (${target.title}). Be pointed but professional.`
          : m.phase === "defense" && target
            ? `You are responding to a challenge from ${target.name}. Defend or revise your view honestly.`
            : m.phase === "closing"
              ? "Give your final stance in 1–2 crisp sentences."
              : "Give your opening assessment in 2–3 crisp sentences.";

      const system = `You are ${agent.name}, ${agent.title} on an AI executive board. Personality: ${agent.persona} Lens: ${agent.lens}. Speak in first person, executive, concise. No markdown, no preamble.`;
      const user = `Startup under review:\n${ideaBlock}\n\nYour current stance is "${m.stance}". ${phaseHint}\nExpress this point: ${m.message}`;

      try {
        const text = await provider.chat(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          { temperature: 0.75, maxTokens: 220 },
        );
        const clean = text.trim();
        if (clean.length > 0) {
          m.message = clean;
          if (m.phase === "challenge") m.challengeText = clean;
        }
      } catch {
        // keep deterministic text
      }
    }),
  );
}

// ----------------------------------------------------------------------------
// Assessments — each agent's consolidated final position.
// ----------------------------------------------------------------------------

const STRENGTH_BY_ROLE: Record<AgentRole, (s: IdeaSignals) => string> = {
  CEO: (s) =>
    s.marketReach > 0.5 ? "Large, clearly addressable market" : "A focused, ownable beachhead",
  CFO: (s) =>
    s.monetizationClarity > 0.5 ? "A legible, recurring revenue model" : "Low fixed cost to test demand",
  CTO: (s) =>
    s.techComplexity > 0.55 ? "Defensible technical depth" : "Fast, low-risk path to a working build",
  CMO: (s) => (s.novelty > 0.5 ? "A genuinely tellable differentiation story" : "A clear, relatable value promise"),
  Risk: (s) => (s.specificity > 0.5 ? "A well-articulated problem worth solving" : "Manageable downside at this stage"),
  Product: (s) => (s.specificity > 0.5 ? "A sharply defined user problem" : "Room to shape an opinionated v1"),
};

const RISK_BY_ROLE: Record<AgentRole, (s: IdeaSignals) => string> = {
  CEO: (s) => (s.competition > 0.55 ? "Crowded positioning" : "Strategic wedge still unproven"),
  CFO: (s) => (s.monetizationClarity > 0.5 ? "Margin durability under scale" : "Unproven unit economics"),
  CTO: (s) => (s.techComplexity > 0.55 ? "Build complexity vs. runway" : "Scope creep beyond the MVP"),
  CMO: (s) => (s.competition > 0.55 ? "Expensive customer acquisition" : "No proven acquisition channel yet"),
  Risk: (s) => (s.regulatoryRisk > 0.45 ? "Compliance and trust exposure" : "Behavior-change and execution risk"),
  Product: () => "Product-market fit before scaling",
};

export function deriveAssessments(
  idea: StartupIdea,
  signals: IdeaSignals,
  debate: DebateMessage[],
  agents: Agent[],
): AgentAssessment[] {
  return agents.map((agent) => {
    const closing = [...debate].reverse().find((m) => m.agentId === agent.id && m.phase === "closing");
    const opening = debate.find((m) => m.agentId === agent.id && m.phase === "opening");
    const d = disposition(agent.role, signals);
    return {
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      stance: stanceFromDisposition(d),
      confidence: closing?.confidence ?? opening?.confidence ?? 50,
      summary: closing?.message ?? opening?.message ?? "",
      keyConcern: opening?.keyConcern ?? "",
      topStrength: STRENGTH_BY_ROLE[agent.role](signals),
      topRisk: RISK_BY_ROLE[agent.role](signals),
    };
  });
}

/** Helper used by the consensus engine: who challenged whom. */
export { CHALLENGED_BY };

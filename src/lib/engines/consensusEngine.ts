import type {
  ConsensusScore,
  DebateMessage,
  ScoreDetail,
  ScoreImpact,
  StartupIdea,
} from "../types";
import { clamp100, type IdeaSignals } from "../analysis";
import { disposition } from "../services/mockProvider";
import type { AgentRole } from "../types";

// ============================================================================
// Consensus engine — turns the debate into seven explainable scores plus the
// strengths / weaknesses / risks / assumptions / next-steps lists.
//
// Each score = a signal-derived baseline + the aggregated, damped impact of the
// debate, clamped to 0–100. Every score ships with a one-line justification so
// the number is never naked.
// ============================================================================

const DAMP = 0.4;
const DIMENSIONS: (keyof ScoreImpact)[] = [
  "market",
  "technical",
  "business",
  "risk",
  "innovation",
  "execution",
];

function aggregateImpact(debate: DebateMessage[]): Record<keyof ScoreImpact, number> {
  const sum: Record<keyof ScoreImpact, number> = {
    market: 0,
    technical: 0,
    business: 0,
    risk: 0,
    innovation: 0,
    execution: 0,
  };
  for (const m of debate) {
    for (const dim of DIMENSIONS) {
      sum[dim] += m.scoreImpact[dim] ?? 0;
    }
  }
  return sum;
}

type Tier = "high" | "mid" | "low";
const tier = (v: number): Tier => (v >= 64 ? "high" : v >= 44 ? "mid" : "low");

const trimmed = (s: string, n = 70) => {
  const t = s.trim();
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

// ----------------------------------------------------------------------------
// Justification writers — value-tier + driving-signal aware.
// ----------------------------------------------------------------------------

function marketJustification(v: number, idea: StartupIdea, s: IdeaSignals): string {
  if (tier(v) === "high")
    return `Strong demand signal: a broad, addressable base in "${trimmed(idea.targetUsers)}"${s.competition > 0.55 ? ", though the category is competitive" : ""}.`;
  if (tier(v) === "mid")
    return `Real but unproven opportunity — "${trimmed(idea.targetUsers)}" exists, yet reach and pull need validation.`;
  return `Limited upside as framed: ${s.marketReach < 0.4 ? "the initial market is narrow" : "demand intensity is unclear"}.`;
}

function feasibilityJustification(v: number, s: IdeaSignals): string {
  if (tier(v) === "high")
    return `Buildable with proven components; the hard part is reliability and polish, not invention.`;
  if (tier(v) === "mid")
    return `Achievable but non-trivial — ${s.techComplexity > 0.55 ? "real engineering" : "scope discipline"} will drive the timeline.`;
  return `Technically heavy: ${s.regulatoryRisk > 0.45 ? "compliance and data handling add weight" : "the build is ambitious relative to the pitch"}.`;
}

function viabilityJustification(v: number, idea: StartupIdea, s: IdeaSignals): string {
  if (tier(v) === "high")
    return `Legible economics via "${trimmed(idea.businessModel)}"${s.stageScore > 0.6 ? " with early traction" : ""}.`;
  if (tier(v) === "mid")
    return `Plausible model in "${trimmed(idea.businessModel)}", but take rate, CAC and payback are unproven.`;
  return `Monetization is the soft spot — willingness to pay and margins are not yet evidenced.`;
}

function riskJustification(v: number, s: IdeaSignals): string {
  // higher = more risk
  if (tier(v) === "high")
    return `Elevated exposure: ${s.regulatoryRisk > 0.45 ? "operates in a regulated, high-trust space" : "execution and adoption risk dominate"}.`;
  if (tier(v) === "mid")
    return `Moderate, manageable risk with the right guardrails and validation gates.`;
  return `Contained downside at this stage; few existential blockers identified.`;
}

function innovationJustification(v: number, s: IdeaSignals): string {
  if (tier(v) === "high")
    return `Genuinely differentiated${s.techComplexity > 0.5 ? " with technical depth" : ""}; a tellable "why now".`;
  if (tier(v) === "mid")
    return `Some differentiation, but the wedge needs sharpening to stand out.`;
  return `Largely a known pattern — novelty will have to come from execution.`;
}

function executionJustification(v: number, s: IdeaSignals): string {
  // higher = harder
  if (tier(v) === "high")
    return `Hard to execute: ${s.techComplexity > 0.55 ? "heavy build" : "early stage"}${s.regulatoryRisk > 0.45 ? " plus compliance overhead" : ""}.`;
  if (tier(v) === "mid")
    return `Moderate lift — feasible for a focused team with a ruthless MVP scope.`;
  return `Relatively low execution lift; the core loop can ship quickly.`;
}

function overallJustification(v: number): string {
  if (tier(v) === "high") return `The board leans positive — the upside outweighs the open questions.`;
  if (tier(v) === "mid") return `A split board: promising, but contingent on validating the riskiest assumptions.`;
  return `The board is unconvinced as framed; significant rework or evidence is needed.`;
}

// ----------------------------------------------------------------------------
// List writers.
// ----------------------------------------------------------------------------

function buildStrengths(idea: StartupIdea, s: IdeaSignals): string[] {
  const out: string[] = [];
  if (s.marketReach > 0.5) out.push(`Broad addressable market across ${trimmed(idea.targetUsers, 60)}.`);
  if (s.monetizationClarity > 0.5) out.push(`Clear monetization path via ${trimmed(idea.businessModel, 60)}.`);
  if (s.novelty > 0.5) out.push(`Differentiated, tellable positioning that aids organic growth.`);
  if (s.defensibility > 0.55) out.push(`Defensibility through network effects, community, or proprietary data.`);
  if (s.techComplexity < 0.45) out.push(`Technically achievable with proven, off-the-shelf components.`);
  if (s.specificity > 0.55) out.push(`Well-articulated problem and a concrete proposed solution.`);
  return padTo(out, STRENGTH_FALLBACKS, 3).slice(0, 4);
}

const STRENGTH_FALLBACKS = [
  `A real, relatable problem worth solving.`,
  `A concrete first user to design the experience around.`,
  `Room for a focused, opinionated v1 to win early fans.`,
];

function buildWeaknesses(idea: StartupIdea, s: IdeaSignals): string[] {
  const out: string[] = [];
  if (s.monetizationClarity < 0.42) out.push(`Monetization is underspecified — the revenue mechanics need detail.`);
  if (s.competition > 0.6) out.push(`Crowded competitive landscape with well-funded incumbents.`);
  if (s.specificity < 0.45) out.push(`Problem and target user need sharper, narrower definition.`);
  if (s.marketReach < 0.42) out.push(`Initial market is narrow, capping early growth velocity.`);
  if (s.defensibility < 0.4) out.push(`Thin defensibility — the core could be copied quickly.`);
  if (s.techComplexity > 0.6) out.push(`Heavy build increases time-to-market and burn.`);
  return padTo(out, WEAKNESS_FALLBACKS, 3).slice(0, 4);
}

const WEAKNESS_FALLBACKS = [
  `Demand is still mostly intuition — limited hard proof yet.`,
  `Success hinges on disciplined focus and flawless execution.`,
  `The repeatable go-to-market motion is not yet defined.`,
];

function buildRisks(idea: StartupIdea, s: IdeaSignals): string[] {
  const out: string[] = [];
  if (s.regulatoryRisk > 0.45) out.push(`Regulatory, ethical, and trust exposure in ${s.domain}.`);
  if (s.techComplexity > 0.55) out.push(`Execution risk from technical complexity and scaling.`);
  if (s.competition > 0.6) out.push(`Incumbent-response risk if the wedge proves valuable.`);
  if (s.monetizationClarity < 0.42) out.push(`Revenue risk — willingness to pay is unproven.`);
  out.push(`Adoption risk — target users may not change established behavior.`);
  return padTo(out, RISK_FALLBACKS, 3).slice(0, 4);
}

const RISK_FALLBACKS = [
  `Concentration risk if the first acquisition channel underperforms.`,
  `Key-person and hiring risk for specialized roles.`,
  `Timing risk if the market or platform landscape shifts.`,
];

/** Ensure a list has at least `min` items by appending unused fallbacks. */
function padTo(list: string[], pool: string[], min: number): string[] {
  const out = [...list];
  for (const item of pool) {
    if (out.length >= min) break;
    if (!out.includes(item)) out.push(item);
  }
  return out;
}

function buildAssumptions(idea: StartupIdea, s: IdeaSignals): string[] {
  const out: string[] = [
    `That ${trimmed(idea.targetUsers, 50)} feel this pain acutely and actively seek a fix.`,
    `That users will pay through ${trimmed(idea.businessModel, 55)}.`,
    `That the solution is a meaningful, defensible improvement over the status quo.`,
  ];
  if (s.regulatoryRisk > 0.45) out.push(`That compliance and data-handling requirements can be met affordably.`);
  if (s.competition > 0.6) out.push(`That a wedge exists that incumbents cannot quickly close.`);
  return out.slice(0, 4);
}

function buildNextSteps(idea: StartupIdea, s: IdeaSignals): string[] {
  const out: string[] = [
    `Run 15–20 problem interviews with ${trimmed(idea.targetUsers, 45)} to confirm intensity.`,
    `Ship a thin prototype of the core loop and watch real behavior.`,
    `Test pricing to validate willingness to pay before scaling.`,
    `Pick one beachhead segment and one acquisition channel; ignore the rest.`,
  ];
  if (s.regulatoryRisk > 0.45) out[3] = `Map the regulatory requirements early and design compliance into v1.`;
  return out.slice(0, 4);
}

// ----------------------------------------------------------------------------
// Main entry point.
// ----------------------------------------------------------------------------

const ROLES: AgentRole[] = ["CEO", "CFO", "CTO", "CMO", "Risk", "Product"];

export function computeConsensus(
  idea: StartupIdea,
  signals: IdeaSignals,
  debate: DebateMessage[],
): ConsensusScore {
  const s = signals;
  const agg = aggregateImpact(debate);

  const marketBase = 34 + 46 * s.marketReach + 14 * s.novelty + 8 * s.defensibility - 12 * s.competition;
  const feasibilityBase = 86 - 48 * s.techComplexity + 10 * s.specificity - 10 * s.regulatoryRisk;
  const viabilityBase = 26 + 44 * s.monetizationClarity + 14 * s.stageScore + 10 * s.marketReach - 8 * s.competition;
  const riskBase = 24 + 44 * s.regulatoryRisk + 14 * s.competition + 14 * s.techComplexity + 10 * (1 - s.specificity);
  const innovationBase = 30 + 44 * s.novelty + 14 * s.techComplexity + 10 * s.defensibility;
  const executionBase = 28 + 36 * s.techComplexity + 20 * s.regulatoryRisk + 14 * (1 - s.stageScore) + 10 * (1 - s.specificity);

  const market = clamp100(marketBase + agg.market * DAMP);
  const feasibility = clamp100(feasibilityBase + agg.technical * DAMP);
  const viability = clamp100(viabilityBase + agg.business * DAMP);
  const risk = clamp100(riskBase + agg.risk * DAMP);
  const innovation = clamp100(innovationBase + agg.innovation * DAMP);
  const execution = clamp100(executionBase + agg.execution * DAMP);

  // Overall confidence: weighted blend of the dimensions (risk/execution inverted),
  // nudged by the board's mean disposition.
  const meanDisposition =
    ROLES.reduce((acc, r) => acc + disposition(r, s), 0) / ROLES.length;
  const blended =
    0.26 * market +
    0.22 * viability +
    0.16 * feasibility +
    0.12 * innovation +
    0.12 * (100 - risk) +
    0.12 * (100 - execution);
  const overall = clamp100(blended * 0.85 + meanDisposition * 100 * 0.15);

  const detail = (value: number, justification: string): ScoreDetail => ({ value, justification });

  return {
    marketPotential: detail(market, marketJustification(market, idea, s)),
    technicalFeasibility: detail(feasibility, feasibilityJustification(feasibility, s)),
    businessViability: detail(viability, viabilityJustification(viability, idea, s)),
    riskLevel: detail(risk, riskJustification(risk, s)),
    innovation: detail(innovation, innovationJustification(innovation, s)),
    executionDifficulty: detail(execution, executionJustification(execution, s)),
    overallConfidence: detail(overall, overallJustification(overall)),
    strengths: buildStrengths(idea, s),
    weaknesses: buildWeaknesses(idea, s),
    risks: buildRisks(idea, s),
    assumptionsToValidate: buildAssumptions(idea, s),
    recommendedNextSteps: buildNextSteps(idea, s),
  };
}

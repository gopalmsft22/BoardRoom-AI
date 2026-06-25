import type { ConsensusScore, FutureScenario, StartupIdea } from "../types";
import { clamp100, type IdeaSignals } from "../analysis";

// ============================================================================
// Future simulation engine — projects three 6/12-month scenarios with
// probabilities that flex with the consensus (confidence vs. risk).
// ============================================================================

const trimmed = (s: string, n = 55) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

function probabilities(consensus: ConsensusScore): {
  optimistic: number;
  realistic: number;
  pessimistic: number;
} {
  const overall = consensus.overallConfidence.value;
  const risk = consensus.riskLevel.value;

  let opt = clamp100(20 + (overall - 50) * 0.6 - (risk - 50) * 0.2);
  let pess = clamp100(26 - (overall - 50) * 0.5 + (risk - 50) * 0.32);
  // Keep each scenario plausible.
  opt = Math.max(8, Math.min(60, opt));
  pess = Math.max(8, Math.min(62, pess));
  let real = 100 - opt - pess;
  if (real < 18) {
    const deficit = 18 - real;
    // Trim the larger of opt/pess to make room for a realistic middle.
    if (opt >= pess) opt -= deficit;
    else pess -= deficit;
    real = 18;
  }
  // Final rounding that still sums to 100.
  const o = Math.round(opt);
  const p = Math.round(pess);
  return { optimistic: o, pessimistic: p, realistic: 100 - o - p };
}

export function simulateFutures(
  idea: StartupIdea,
  signals: IdeaSignals,
  consensus: ConsensusScore,
): FutureScenario[] {
  const s = signals;
  const p = probabilities(consensus);
  const title = idea.title.trim() || "the venture";
  const users = trimmed(idea.targetUsers, 48);
  const model = trimmed(idea.businessModel, 48);

  const frictionSource = s.regulatoryRisk > 0.45
    ? "compliance and trust hurdles"
    : s.competition > 0.55
      ? "a well-funded incumbent"
      : "slow behavior change";

  const optimistic: FutureScenario = {
    type: "Optimistic",
    headline: "Category breakout",
    sixMonths: `${title} nails its beachhead. ${users} adopt the core loop, early retention is strong, and word-of-mouth quietly lowers acquisition cost.`,
    twelveMonths: `A defensible wedge emerges with a repeatable channel and the first cohort proving ${model}. The team raises on momentum, not on a deck.`,
    successDrivers: [
      "Sharp focus on a single beachhead before expanding",
      s.defensibility > 0.5 ? "Compounding network/data advantages" : "A loved core loop driving organic referrals",
      "Disciplined spend behind one proven channel",
    ],
    failureDrivers: [
      "Premature diversification diluting focus",
      "Scaling spend before retention is real",
    ],
    probability: p.optimistic,
    strategicAdvice: "Resource the winning motion aggressively and resist the urge to broaden the roadmap.",
  };

  const realistic: FutureScenario = {
    type: "Realistic",
    headline: "Grind to fit",
    sixMonths: `Mixed early signal: a subset of ${users} genuinely love it, retention is lumpy, and the team iterates hard on positioning and onboarding.`,
    twelveMonths: `${title} finds narrow but real product-market fit in one segment, with modest revenue and a clearer read on unit economics. Growth is deliberate, not explosive.`,
    successDrivers: [
      "Tight feedback loops with the first 100 users",
      "Ruthless MVP scope that ships and learns fast",
      s.monetizationClarity > 0.5 ? "Early pricing validation" : "Finding the segment that will pay",
    ],
    failureDrivers: [
      "Runway burned chasing the wrong segment",
      "Iterating on features instead of the core value",
    ],
    probability: p.realistic,
    strategicAdvice: "Protect runway, instrument everything, and double down only once the core loop demonstrably retains.",
  };

  const pessimistic: FutureScenario = {
    type: "Pessimistic",
    headline: s.regulatoryRisk > 0.45 ? "Blocked by friction" : "Stalled adoption",
    sixMonths: `Traction is slow — ${users} don't change behavior fast enough, and ${frictionSource} stalls momentum.`,
    twelveMonths: `Without a pivot, ${title} struggles to show retention or willingness to pay; runway tightens and morale follows.`,
    successDrivers: [
      "Early kill-criteria that force an honest pivot",
      "Preserved capital to fund a second attempt",
    ],
    failureDrivers: [
      s.monetizationClarity < 0.45 ? "No proven willingness to pay" : "Acquisition cost exceeding lifetime value",
      s.competition > 0.55 ? "Incumbents copying the wedge" : "Weak retention masking as a growth problem",
      frictionSource.charAt(0).toUpperCase() + frictionSource.slice(1),
    ],
    probability: p.pessimistic,
    strategicAdvice: "Define kill criteria now and be ready to pivot the wedge or the monetization before the runway forces your hand.",
  };

  return [optimistic, realistic, pessimistic];
}

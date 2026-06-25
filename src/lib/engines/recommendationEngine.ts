import type {
  ConsensusScore,
  FinalRecommendation,
  FutureScenario,
  StartupIdea,
  Verdict,
} from "../types";
import type { IdeaSignals } from "../analysis";

// ============================================================================
// Recommendation engine — converts the consensus + simulations into a single
// boardroom verdict and an actionable plan.
// ============================================================================

const trimmed = (s: string, n = 60) => {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
};

function decideVerdict(c: ConsensusScore): Verdict {
  const overall = c.overallConfidence.value;
  const risk = c.riskLevel.value;
  const market = c.marketPotential.value;
  const viability = c.businessViability.value;
  const feasibility = c.technicalFeasibility.value;

  if (overall >= 66 && risk <= 62 && feasibility >= 45) return "Build";
  if (overall <= 34 || (market < 40 && viability < 40)) return "Drop";
  if (market >= 58 && viability < 48) return "Pivot";
  return "Validate First";
}

const VERDICT_SUMMARY: Record<Verdict, (idea: StartupIdea) => string> = {
  Build: (i) => `Greenlight ${i.title.trim()} — the thesis is strong enough to build, with disciplined focus.`,
  "Validate First": (i) => `Promising, but ${i.title.trim()} must earn the build through fast, cheap validation.`,
  Pivot: (i) => `The market is real but the current model isn't — pivot ${i.title.trim()} before committing.`,
  Drop: (i) => `As framed, ${i.title.trim()} doesn't clear the bar; redirect the energy or reframe the problem.`,
};

const VERDICT_NEXT: Record<Verdict, string> = {
  Build:
    "Commit to a single beachhead, ship the core loop in weeks, and instrument retention from day one. Raise on evidence, not narrative.",
  "Validate First":
    "Run the cheapest experiments that could kill the idea. Only graduate to a real build once the riskiest assumptions survive contact with users.",
  Pivot:
    "Keep the audience and the problem; change the mechanism or the monetization. Re-test the new wedge with the same users.",
  Drop:
    "Salvage the learnings, keep the user relationships, and reframe around a sharper, more painful problem before investing further.",
};

function reasoning(idea: StartupIdea, c: ConsensusScore, verdict: Verdict): string {
  return `Market potential reads ${c.marketPotential.value}/100 and business viability ${c.businessViability.value}/100, against a risk level of ${c.riskLevel.value}/100 and execution difficulty of ${c.executionDifficulty.value}/100. Overall board confidence is ${c.overallConfidence.value}/100. ${
    verdict === "Build"
      ? "The upside and feasibility outweigh the open risks, so the right move is to build — fast and focused."
      : verdict === "Validate First"
        ? "The opportunity is credible but several load-bearing assumptions are still untested, so cheap validation must precede commitment."
        : verdict === "Pivot"
          ? "Demand exists, but the way the idea captures value is the weak link, so the mechanism should change before more is spent."
          : "Too many of the fundamentals are unproven or stacked against the idea for the board to back it as framed."
  }`;
}

function consensusExplanation(c: ConsensusScore, scenarios: FutureScenario[]): string {
  const opt = scenarios.find((s) => s.type === "Optimistic")?.probability ?? 0;
  const pess = scenarios.find((s) => s.type === "Pessimistic")?.probability ?? 0;
  const lead = c.overallConfidence.value >= 55 ? "leaned constructive" : "was openly divided";
  return `The board ${lead}: strengths around ${c.strengths[0]?.toLowerCase() ?? "the core idea"} were weighed against ${c.risks[0]?.toLowerCase() ?? "execution risk"}. Forward simulation puts the optimistic path at ${opt}% and the pessimistic path at ${pess}%, which is why the verdict emphasizes ${c.overallConfidence.value >= 55 ? "focused execution" : "evidence before investment"}.`;
}

function actionItems(idea: StartupIdea, c: ConsensusScore): string[] {
  return [
    ...c.recommendedNextSteps.slice(0, 3),
    `Write a one-page strategy memo naming the single beachhead and the one metric that proves traction.`,
    `Set explicit kill criteria and a 90-day review checkpoint for ${idea.title.trim()}.`,
  ].slice(0, 5);
}

function experiments(idea: StartupIdea, signals: IdeaSignals): string[] {
  const users = trimmed(idea.targetUsers, 40);
  return [
    `Smoke test: a landing page + waitlist targeting ${users}; measure sign-up conversion against a clear benchmark.`,
    signals.monetizationClarity > 0.45
      ? `Pricing test: offer pre-sales or paid pilots to prove willingness to pay before building more.`
      : `Concierge MVP: deliver the outcome manually for 5–10 users to prove the value before automating.`,
    `Retention probe: run the core loop with a small cohort for 2–4 weeks and track whether they come back unprompted.`,
  ];
}

function mvpFeatures(idea: StartupIdea, signals: IdeaSignals): string[] {
  const out: string[] = [`Frictionless onboarding that reaches the first value moment in under two minutes.`];
  out.push(`A focused core loop delivering the promise in "${trimmed(idea.solution, 70)}".`);
  if (/marketplace|connect|match|two-sided|mentor|platform/i.test(idea.solution + idea.businessModel)) {
    out.push(`Verified profiles, reviews, and trust signals for both sides of the marketplace.`);
  }
  if (signals.monetizationClarity > 0.4 || /commission|subscription|fee|payment|premium/i.test(idea.businessModel)) {
    out.push(`Built-in payments and a single clear monetization surface.`);
  }
  if (signals.regulatoryRisk > 0.45) {
    out.push(`Privacy, consent, and audit logging designed in from day one.`);
  }
  out.push(`A lightweight analytics view so the team can see activation and retention.`);
  out.push(`A fast feedback channel to capture what users love and where they drop off.`);
  return out.slice(0, 6);
}

function pitchPositioning(idea: StartupIdea, signals: IdeaSignals): string {
  const users = trimmed(idea.targetUsers, 40);
  const benefit = trimmed(idea.solution, 70);
  const diff = signals.novelty > 0.5
    ? "a verified, outcome-focused experience"
    : "speed, focus, and a genuinely better core loop";
  return `For ${users} frustrated by the status quo, ${idea.title.trim()} is the ${signals.domain.toLowerCase()} product that delivers ${benefit} Unlike generic alternatives, it wins on ${diff}.`;
}

export function buildRecommendation(
  idea: StartupIdea,
  signals: IdeaSignals,
  consensus: ConsensusScore,
  scenarios: FutureScenario[],
): FinalRecommendation {
  const verdict = decideVerdict(consensus);
  return {
    verdict,
    executiveSummary: VERDICT_SUMMARY[verdict](idea),
    reasoning: reasoning(idea, consensus, verdict),
    consensusExplanation: consensusExplanation(consensus, scenarios),
    whatToDoNext: VERDICT_NEXT[verdict],
    actionItems: actionItems(idea, consensus),
    experiments: experiments(idea, signals),
    mvpFeatures: mvpFeatures(idea, signals),
    pitchPositioning: pitchPositioning(idea, signals),
  };
}

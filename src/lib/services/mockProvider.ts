import type { AgentRole, ScoreImpact, Stance } from "../types";
import type { StartupIdea } from "../types";
import { type IdeaSignals, pick } from "../analysis";

// ============================================================================
// Mock provider — the deterministic "brain" behind demo mode.
//
// Given a startup idea and its signals, it produces structured, idea-aware
// contributions for each agent and debate phase. No API key required. The
// output is deterministic per idea (reproducible demos) but reads like a real
// executive debate.
// ============================================================================

export interface TurnContent {
  stance: Stance;
  message: string;
  keyConcern: string;
  confidence: number;
  scoreImpact: ScoreImpact;
  severity: number;
  challengeTo?: AgentRole;
  challengeText?: string;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const r2 = (n: number) => Math.round(n * 100) / 100;

// ----------------------------------------------------------------------------
// Disposition — how favorable each agent is, derived from idea signals.
// ----------------------------------------------------------------------------

export function disposition(role: AgentRole, s: IdeaSignals): number {
  switch (role) {
    case "CEO":
      return clamp01(
        0.18 + 0.5 * s.marketReach + 0.25 * s.novelty + 0.22 * s.defensibility - 0.2 * s.competition,
      );
    case "CFO":
      return clamp01(
        0.1 + 0.55 * s.monetizationClarity + 0.2 * s.stageScore + 0.15 * s.marketReach -
          0.25 * s.techComplexity - 0.15 * s.regulatoryRisk,
      );
    case "CTO":
      return clamp01(
        0.78 - 0.5 * s.techComplexity + 0.2 * s.specificity - 0.15 * s.regulatoryRisk + 0.08 * s.novelty,
      );
    case "CMO":
      return clamp01(
        0.16 + 0.45 * s.marketReach + 0.3 * s.novelty + 0.15 * s.monetizationClarity - 0.2 * s.competition,
      );
    case "Risk":
      return clamp01(
        0.7 - 0.45 * s.regulatoryRisk - 0.2 * s.competition - 0.15 * s.techComplexity -
          0.12 * (1 - s.specificity),
      );
    case "Product":
      return clamp01(
        0.14 + 0.4 * s.specificity + 0.25 * s.novelty + 0.2 * s.defensibility + 0.12 * s.marketReach -
          0.15 * s.competition,
      );
  }
}

export function stanceFromDisposition(d: number): Stance {
  if (d >= 0.66) return "Supportive";
  if (d >= 0.48) return "Neutral";
  if (d >= 0.33) return "Concerned";
  return "Strongly Opposed";
}

function confidenceFrom(d: number, s: IdeaSignals): number {
  return Math.round(Math.max(38, Math.min(95, 44 + d * 42 + s.specificity * 12)));
}

/** Per-role contribution to the six raw scoring dimensions. */
function impactFor(role: AgentRole, d: number): ScoreImpact {
  const k = (d - 0.5) * 26; // signed strength of feeling
  switch (role) {
    case "CEO":
      return { market: k * 1.1, innovation: k * 0.7, business: k * 0.4 };
    case "CFO":
      return { business: k * 1.2, risk: -k * 0.5, market: k * 0.3 };
    case "CTO":
      return { technical: k * 1.2, execution: -k * 0.9 };
    case "CMO":
      return { market: k * 1.0, business: k * 0.5, innovation: k * 0.3 };
    case "Risk":
      return { risk: -k * 1.3, execution: -k * 0.6 };
    case "Product":
      return { market: k * 0.5, innovation: k * 0.6, execution: -k * 0.5 };
  }
}

function severityFor(role: AgentRole, d: number, s: IdeaSignals): number {
  let base = 42 + Math.abs(d - 0.5) * 80;
  if (role === "Risk") base += s.regulatoryRisk * 25;
  if (role === "CFO") base += (1 - s.monetizationClarity) * 18;
  if (role === "CTO") base += s.techComplexity * 18;
  return Math.round(Math.max(30, Math.min(98, base)));
}

// ----------------------------------------------------------------------------
// Voice — idea-aware phrase banks per role.
// ----------------------------------------------------------------------------

const title = (i: StartupIdea) => i.title.trim() || "this venture";

type Tmpl = (i: StartupIdea, s: IdeaSignals, d: number) => string;

interface Voice {
  opening: Tmpl[];
  concern: Tmpl[];
  closingPositive: Tmpl[];
  closingNegative: Tmpl[];
}

const VOICES: Record<AgentRole, Voice> = {
  CEO: {
    opening: [
      (i, s) =>
        `Strategically, ${title(i)} is playing in ${s.domain.toLowerCase()}. The question I care about is whether "${i.targetUsers.trim()}" is a wedge into something much larger, or a feature in someone else's roadmap.`,
      (i, s) =>
        `I like the ambition. If the timing is right, ${title(i)} could own a real position in ${s.domain.toLowerCase()}. But vision without a defensible moat is just a press release — show me why we win and keep winning.`,
      (i) =>
        `Founders win by being non-consensus and right. ${title(i)} is interesting, but I need to see why the market tips toward us specifically, not just that the problem is real.`,
    ],
    concern: [
      (i, s) =>
        s.competition > 0.55
          ? `My worry is positioning. This space is crowded — what is the one sentence that makes ${title(i)} the obvious choice?`
          : `My worry is focus. A broad target like "${i.targetUsers.trim()}" can mean we serve no one extraordinarily well at the start.`,
    ],
    closingPositive: [
      (i) => `Net: I'd back ${title(i)} if the team commits to one beachhead and dominates it before expanding. Vision is there.`,
    ],
    closingNegative: [
      (i) => `Net: the upside is real but the wedge isn't sharp yet. I'd want a tighter strategic story before ${title(i)} gets serious capital.`,
    ],
  },
  CFO: {
    opening: [
      (i) =>
        `Let's talk money. The model is "${i.businessModel.trim()}". I need to know the take rate, the cost to deliver each unit, and how many sessions or seats it takes before this is cash-flow positive.`,
      (i, s) =>
        s.monetizationClarity > 0.5
          ? `Monetization is at least legible here, which I appreciate. My job is to pressure-test whether the margins survive contact with reality.`
          : `Monetization is the soft spot. "${i.businessModel.trim()}" is a sentence, not a model — I can't see gross margin or payback yet.`,
    ],
    concern: [
      (i, s) =>
        s.techComplexity > 0.55
          ? `This looks capital-intensive to build. Burn before revenue is exactly how good ideas die — I want the cheapest possible path to a paying customer.`
          : `Show me CAC versus lifetime value. If we pay more to acquire a user than they ever return, growth just accelerates the losses.`,
    ],
    closingPositive: [
      (i) => `Net: the economics can work for ${title(i)} if take rate and retention hold. I'd fund a lean validation budget — not a blank check.`,
    ],
    closingNegative: [
      (i) => `Net: I'm not convinced the unit economics close. Before any raise, ${title(i)} needs one cohort that proves people pay and stay.`,
    ],
  },
  CTO: {
    opening: [
      (i, s) =>
        s.techComplexity > 0.55
          ? `From a build standpoint, ${title(i)} is non-trivial — there's real engineering here. Feasible, but the architecture and data strategy will make or break the timeline.`
          : `Good news on feasibility: the core of ${title(i)} can be shipped with proven, off-the-shelf components. The hard part is reliability and polish, not invention.`,
      (i) =>
        `I'd scope ${title(i)} down to the thinnest slice that delivers the promise in "${i.solution.trim().slice(0, 90)}…". Everything else is v2.`,
    ],
    concern: [
      (i, s) =>
        s.regulatoryRisk > 0.45
          ? `My concern is data and compliance. Handling sensitive data means security and auditability are day-one requirements, not afterthoughts.`
          : `My concern is scope creep. The roadmap implied here is large; without ruthless prioritization the MVP slips by quarters.`,
    ],
    closingPositive: [
      (i) => `Net: technically buildable. I'd green-light a 6–8 week prototype of ${title(i)}'s core loop to de-risk the architecture.`,
    ],
    closingNegative: [
      (i) => `Net: feasible but heavier than the pitch suggests. ${title(i)} needs a much narrower v1 or the build cost will outrun the runway.`,
    ],
  },
  CMO: {
    opening: [
      (i) =>
        `Distribution is everything. Who is the first user of ${title(i)}, where do we find them cheaply, and what's the hook? "${i.targetUsers.trim()}" is a market, but channels are what matter.`,
      (i, s) =>
        s.novelty > 0.5
          ? `There's a genuinely tellable story here — differentiation gives us a wedge for organic growth and PR.`
          : `The story needs sharpening. Without a crisp "why now / why this", ${title(i)} blends into the feed.`,
    ],
    concern: [
      (i, s) =>
        s.competition > 0.55
          ? `In a crowded category, paid acquisition gets expensive fast. We need an owned channel or community, or CAC will eat the margins.`
          : `Cold start is the risk. A great product nobody hears about is a hobby — we need a repeatable acquisition motion before we scale spend.`,
    ],
    closingPositive: [
      (i) => `Net: ${title(i)} is marketable. With a focused beachhead and a community-led motion, the growth story is credible.`,
    ],
    closingNegative: [
      (i) => `Net: I can't yet see a cheap, repeatable channel for ${title(i)}. Without one, growth will be rented, not owned.`,
    ],
  },
  Risk: {
    opening: [
      (i, s) =>
        s.regulatoryRisk > 0.45
          ? `I'm paid to be the skeptic. ${title(i)} touches a regulated, high-trust area — liability, compliance and ethics aren't edge cases here, they're the terrain.`
          : `Someone has to map the downside. ${title(i)} looks reasonable, but I want to surface the execution and trust risks before we fall in love with the upside.`,
      (i) =>
        `My lens is "what kills this?" For ${title(i)} I see execution risk, dependency risk, and the quiet risk that users simply don't change their behavior.`,
    ],
    concern: [
      (i, s) =>
        s.competition > 0.55
          ? `A well-funded incumbent can copy a thin feature overnight. Defensibility — not the demo — is what keeps ${title(i)} alive.`
          : `Trust and safety scale slower than growth. One bad actor or data incident can undo a year of brand-building.`,
    ],
    closingPositive: [
      (i) => `Net: the risks on ${title(i)} are real but manageable with guardrails. I'd proceed cautiously, with validation gates.`,
    ],
    closingNegative: [
      (i) => `Net: too many unmitigated risks for ${title(i)} as framed. I'd validate the riskiest assumptions before committing real resources.`,
    ],
  },
  Product: {
    opening: [
      (i) =>
        `I start with the user. The problem — "${i.problem.trim().slice(0, 100)}…" — is the thing to fall in love with. Does ${title(i)} make that pain dramatically smaller, today?`,
      (i, s) =>
        s.specificity > 0.5
          ? `The problem is well-articulated, which is half the battle. Now it's about the first magical moment — the fastest path to a user saying "where was this?"`
          : `The problem statement is still fuzzy. Before features, ${title(i)} needs a razor-sharp definition of the one user and the one job to be done.`,
    ],
    concern: [
      () =>
        `My concern is product-market fit before scale. Chasing acquisition before the core loop is loved just fills a leaky bucket.`,
    ],
    closingPositive: [
      (i) => `Net: there's a real product here. I'd ship a tiny, opinionated v1 of ${title(i)} to 50 users and let their behavior lead the roadmap.`,
    ],
    closingNegative: [
      (i) => `Net: I'm not yet convinced of fit. ${title(i)} should earn the right to scale by nailing one delightful loop first.`,
    ],
  },
};

const KEY_CONCERNS: Record<AgentRole, (s: IdeaSignals) => string> = {
  CEO: (s) => (s.competition > 0.55 ? "Defensible market positioning" : "Sharpness of the strategic wedge"),
  CFO: (s) => (s.monetizationClarity > 0.5 ? "Durability of unit economics" : "Unproven path to profitability"),
  CTO: (s) => (s.techComplexity > 0.55 ? "Build complexity and timeline" : "Scope discipline for the MVP"),
  CMO: (s) => (s.competition > 0.55 ? "Cost of customer acquisition" : "Repeatable acquisition channel"),
  Risk: (s) => (s.regulatoryRisk > 0.45 ? "Compliance and trust exposure" : "Execution and behavior-change risk"),
  Product: (s) => (s.specificity > 0.5 ? "Time-to-first-value" : "Clarity of product-market fit"),
};

// ----------------------------------------------------------------------------
// Challenge ring — each agent challenges exactly one other, meaningfully.
// CEO -> Risk -> CTO -> Product -> CMO -> CFO -> CEO
// ----------------------------------------------------------------------------

export const CHALLENGE_RING: Record<AgentRole, AgentRole> = {
  CEO: "Risk",
  Risk: "CTO",
  CTO: "Product",
  Product: "CMO",
  CMO: "CFO",
  CFO: "CEO",
};

/** Who challenges a given agent (inverse of the ring). */
export const CHALLENGED_BY: Record<AgentRole, AgentRole> = Object.fromEntries(
  (Object.entries(CHALLENGE_RING) as [AgentRole, AgentRole][]).map(([from, to]) => [to, from]),
) as Record<AgentRole, AgentRole>;

const CHALLENGE_TEXT: Record<AgentRole, (i: StartupIdea, s: IdeaSignals) => string> = {
  CEO: (i) =>
    `Viktor, you're mapping every landmine — but we don't win by avoiding risk, we win by taking the right one. Which single risk on ${title(i)} actually matters, and which are you over-weighting?`,
  Risk: () =>
    `Dr. Park, "buildable" and "shippable safely at scale" are different claims. What's your honest failure mode if usage 10x's — and who is accountable when it breaks?`,
  CTO: (i) =>
    `Maya, the product vision is lovely, but every feature is engineering time. If I can only build one slice of ${title(i)} this quarter, which one earns its keep?`,
  Product: () =>
    `Nadia, pouring spend into acquisition before the core loop is loved just scales churn. How do we know users will stay, not just click?`,
  CMO: (i) =>
    `Marcus, your caution will strangle ${title(i)} in the crib. If we never spend to learn, we never find the channel. What's the smallest budget that buys real signal?`,
  CFO: (i) =>
    `Ava, vision doesn't pay salaries. Strategy is great, but where exactly does the money come from on ${title(i)}, and when?`,
};

const DEFENSE_TEXT: Record<AgentRole, (i: StartupIdea, s: IdeaSignals, swayed: boolean) => string> = {
  CEO: (i, _s, swayed) =>
    swayed
      ? `Fair hit, Marcus. I'll concede the monetization needs to be concrete — but the strategic wedge is what makes those dollars defensible. I'll tighten both.`
      : `Marcus, the money follows the position. Nail the wedge and pricing power follows — but point taken, I'll put a number on it.`,
  CFO: (i, _s, swayed) =>
    swayed
      ? `Nadia, you're right that zero spend means zero learning. I'll approve a disciplined test budget — but it comes with a kill criterion.`
      : `Nadia, I'm not anti-growth, I'm anti-waste. Give me a payback window under reason and I'll fund the experiment.`,
  CTO: (_i, _s, swayed) =>
    swayed
      ? `Viktor, agreed — I'll treat scale and safety as v1 constraints, not v2 nice-to-haves. The architecture can absorb that if we decide now.`
      : `Viktor, I've scoped for the failure modes. The thin v1 is deliberately boring precisely so it doesn't break under load.`,
  CMO: (_i, _s, swayed) =>
    swayed
      ? `Maya, fair — I'll hold paid spend until the core loop retains. Community first, paid second.`
      : `Maya, retention and acquisition aren't sequential, they're a loop. I'll instrument both from day one.`,
  Risk: (i, _s, swayed) =>
    swayed
      ? `Ava, you're right that I can over-index on caution. I'll rank the risks and only block on the ones that are existential, not merely uncomfortable.`
      : `Ava, taking the right risk requires naming the wrong ones first. I'm not blocking ${title(i)} — I'm pricing it.`,
  Product: (_i, _s, swayed) =>
    swayed
      ? `Dr. Park, agreed — I'll cut the roadmap to a single delightful loop and let usage justify the rest.`
      : `Dr. Park, the one slice that earns its keep is the magic moment. Build that; everything else waits for evidence.`,
};

// ----------------------------------------------------------------------------
// Turn builders.
// ----------------------------------------------------------------------------

function baseTurn(role: AgentRole, s: IdeaSignals): {
  d: number;
  stance: Stance;
  confidence: number;
  scoreImpact: ScoreImpact;
  severity: number;
  keyConcern: string;
} {
  const d = disposition(role, s);
  return {
    d,
    stance: stanceFromDisposition(d),
    confidence: confidenceFrom(d, s),
    scoreImpact: impactFor(role, d),
    severity: severityFor(role, d, s),
    keyConcern: KEY_CONCERNS[role](s),
  };
}

export function openingTurn(
  role: AgentRole,
  idea: StartupIdea,
  s: IdeaSignals,
  rng: () => number,
): TurnContent {
  const b = baseTurn(role, s);
  const opener = pick(rng, VOICES[role].opening)(idea, s, b.d);
  const concern = pick(rng, VOICES[role].concern)(idea, s, b.d);
  return {
    stance: b.stance,
    message: `${opener} ${concern}`,
    keyConcern: b.keyConcern,
    confidence: b.confidence,
    scoreImpact: b.scoreImpact,
    severity: b.severity,
  };
}

export function challengeTurn(
  role: AgentRole,
  idea: StartupIdea,
  s: IdeaSignals,
): TurnContent {
  const b = baseTurn(role, s);
  const target = CHALLENGE_RING[role];
  const challengeText = CHALLENGE_TEXT[role](idea, s);
  return {
    stance: b.stance,
    message: challengeText,
    keyConcern: b.keyConcern,
    confidence: Math.max(40, b.confidence - 4),
    // A challenge sharpens scrutiny: dampen the challenged dimension slightly.
    scoreImpact: { risk: role === "Risk" ? -3 : 0, execution: role === "CTO" ? -2 : 0 },
    severity: Math.min(98, b.severity + 8),
    challengeTo: target,
    challengeText,
  };
}

export function defenseTurn(
  role: AgentRole,
  idea: StartupIdea,
  s: IdeaSignals,
): TurnContent {
  const b = baseTurn(role, s);
  // An agent is "swayed" if the idea is genuinely weak on their axis.
  const swayed = b.d < 0.5;
  const text = DEFENSE_TEXT[role](idea, s, swayed);
  const conf = swayed ? Math.max(40, b.confidence - 6) : Math.min(95, b.confidence + 3);
  return {
    stance: b.stance,
    message: text,
    keyConcern: b.keyConcern,
    confidence: conf,
    scoreImpact: {},
    severity: Math.max(35, b.severity - 6),
    challengeTo: CHALLENGED_BY[role],
  };
}

export function closingTurn(
  role: AgentRole,
  idea: StartupIdea,
  s: IdeaSignals,
  rng: () => number,
): TurnContent {
  const b = baseTurn(role, s);
  const positive = b.d >= 0.5;
  const bank = positive ? VOICES[role].closingPositive : VOICES[role].closingNegative;
  return {
    stance: b.stance,
    message: pick(rng, bank)(idea, s, b.d),
    keyConcern: b.keyConcern,
    confidence: b.confidence,
    // Closing reinforces the agent's position at half weight.
    scoreImpact: scaleImpact(b.scoreImpact, 0.5),
    severity: b.severity,
  };
}

function scaleImpact(im: ScoreImpact, f: number): ScoreImpact {
  const out: ScoreImpact = {};
  for (const [k, v] of Object.entries(im)) {
    out[k as keyof ScoreImpact] = r2((v ?? 0) * f);
  }
  return out;
}

export { clamp01 as _clamp01 };

// ============================================================================
// Idea analysis — turns free-text startup ideas into deterministic signals.
//
// Everything here is pure and deterministic: the same idea always produces the
// same signals (and therefore the same debate + scores). This is what makes the
// demo reproducible and the consensus "explainable" rather than random.
// ============================================================================

import type { StartupIdea } from "./types";

export interface IdeaSignals {
  /** Combined, lower-cased idea text used for keyword matching. */
  text: string;
  wordCount: number;
  /** 0–1: how detailed and concrete the submission is. */
  specificity: number;
  /** 0–1: breadth of the addressable market. */
  marketReach: number;
  /** 0–1: how clearly the idea makes money. */
  monetizationClarity: number;
  /** 0–1: technical difficulty implied by the solution. */
  techComplexity: number;
  /** 0–1: legal / ethical / compliance exposure. */
  regulatoryRisk: number;
  /** 0–1: how crowded the competitive space is. */
  competition: number;
  /** 0–1: differentiation / novelty. */
  novelty: number;
  /** 0–1: defensibility / moat. */
  defensibility: number;
  /** 0–1: maturity implied by the declared stage. */
  stageScore: number;
  /** Inferred domain label, e.g. "AI / Deep Tech". */
  domain: string;
  /** Human-readable signal tags used for explainability. */
  tags: string[];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Count how many distinct keywords from `list` appear in `text`. */
function countMatches(text: string, list: string[]): number {
  let n = 0;
  for (const kw of list) {
    if (text.includes(kw)) n++;
  }
  return n;
}

const KW = {
  marketReach: [
    "students",
    "professionals",
    "consumers",
    "everyone",
    "global",
    "worldwide",
    "businesses",
    "smb",
    "enterprise",
    "developers",
    "gamers",
    "parents",
    "patients",
    "retail",
    "teams",
    "creators",
    "millions",
    "mainstream",
  ],
  monetization: [
    "subscription",
    "saas",
    "commission",
    "fee",
    "marketplace",
    "ads",
    "advertising",
    "freemium",
    "premium",
    "license",
    "transaction",
    "per session",
    "b2b",
    "sponsorship",
    "affiliate",
    "revenue",
    "pricing",
    "monetize",
  ],
  tech: [
    "ai",
    "ml",
    "machine learning",
    "model",
    "algorithm",
    "blockchain",
    "crypto",
    "web3",
    "hardware",
    "iot",
    "robot",
    " ar ",
    " vr ",
    "computer vision",
    "nlp",
    "llm",
    "real-time",
    "real time",
    "infrastructure",
    "pipeline",
    "recommendation",
    "matching",
    "automation",
  ],
  regulatory: [
    "health",
    "medical",
    "patient",
    "clinical",
    "finance",
    "fintech",
    "banking",
    "payment",
    "insurance",
    "legal",
    "compliance",
    "privacy",
    "gdpr",
    "children",
    "kids",
    "minors",
    "lending",
    "pharma",
    "hipaa",
    "biometric",
    "surveillance",
    "data protection",
  ],
  competition: [
    "marketplace",
    "social",
    "delivery",
    "ride",
    "food",
    "ecommerce",
    "e-commerce",
    "dating",
    "fitness",
    "streaming",
    "productivity",
    "chat",
    "notes",
    "todo",
    "booking",
    "tutoring",
  ],
  novelty: [
    "verified",
    "outcome-based",
    "ai-powered",
    "novel",
    "first",
    "unique",
    "proprietary",
    "patent",
    "breakthrough",
    "personalized",
    "hyper-local",
    "hyperlocal",
    "on-demand",
    "gamified",
    "trusted",
  ],
  defensibility: [
    "network effect",
    "marketplace",
    "community",
    "proprietary",
    "brand",
    "ecosystem",
    "two-sided",
    "verified",
    "exclusive",
    "integration",
    "switching cost",
    "data moat",
    "data advantage",
  ],
};

const DOMAINS: { label: string; keywords: string[] }[] = [
  { label: "AI / Deep Tech", keywords: ["ai", "ml", "machine learning", "llm", "model", "algorithm", "computer vision", "nlp"] },
  { label: "Fintech", keywords: ["finance", "fintech", "banking", "payment", "lending", "wallet", "invest"] },
  { label: "Health & Wellness", keywords: ["health", "medical", "patient", "clinical", "wellness", "mental", "fitness"] },
  { label: "Education", keywords: ["student", "learn", "mentor", "course", "tutor", "skill", "education", "edtech"] },
  { label: "Marketplace / Platform", keywords: ["marketplace", "platform", "two-sided", "connects", "matching", "gig"] },
  { label: "Climate & Sustainability", keywords: ["climate", "carbon", "energy", "sustainab", "green", "recycl", "emission"] },
  { label: "Consumer / Social", keywords: ["social", "community", "creator", "content", "video", "consumer"] },
  { label: "SaaS / Productivity", keywords: ["saas", "workflow", "productivity", "team", "dashboard", "automation"] },
];

const STAGE_MAP: { keys: string[]; value: number }[] = [
  { keys: ["growth", "scaling", "scale", "series"], value: 0.9 },
  { keys: ["revenue", "launched", "live", "paying"], value: 0.75 },
  { keys: ["beta"], value: 0.62 },
  { keys: ["mvp"], value: 0.55 },
  { keys: ["prototype", "pilot"], value: 0.42 },
  { keys: ["concept", "validation", "pre-seed"], value: 0.25 },
  { keys: ["idea"], value: 0.15 },
];

function stageScore(stage: string): number {
  const s = stage.toLowerCase();
  for (const { keys, value } of STAGE_MAP) {
    if (keys.some((k) => s.includes(k))) return value;
  }
  return 0.3;
}

function inferDomain(text: string): string {
  let best = "General Consumer";
  let bestHits = 0;
  for (const d of DOMAINS) {
    const hits = countMatches(text, d.keywords);
    if (hits > bestHits) {
      bestHits = hits;
      best = d.label;
    }
  }
  return best;
}

/** Analyse a startup idea into deterministic, explainable signals. */
export function analyzeIdea(idea: StartupIdea): IdeaSignals {
  const text = [
    idea.title,
    idea.problem,
    idea.targetUsers,
    idea.solution,
    idea.businessModel,
    idea.stage,
    idea.notes ?? "",
  ]
    .join(" \n ")
    .toLowerCase();

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Specificity: rewards substantive submissions and concrete numbers, but
  // saturates so a wall of text doesn't dominate.
  const hasNumbers = /\d/.test(text) ? 0.12 : 0;
  const specificity = clamp01(0.15 + Math.min(wordCount / 120, 1) * 0.7 + hasNumbers);

  const marketReach = clamp01(0.25 + countMatches(text, KW.marketReach) * 0.13);
  const monetizationClarity = clamp01(0.18 + countMatches(text, KW.monetization) * 0.16);
  const techComplexity = clamp01(0.2 + countMatches(text, KW.tech) * 0.13);
  const regulatoryRisk = clamp01(0.12 + countMatches(text, KW.regulatory) * 0.18);
  const competition = clamp01(0.3 + countMatches(text, KW.competition) * 0.14);
  const novelty = clamp01(0.3 + countMatches(text, KW.novelty) * 0.14);
  const defensibility = clamp01(0.22 + countMatches(text, KW.defensibility) * 0.15);

  const tags: string[] = [];
  if (techComplexity > 0.55) tags.push("tech-heavy");
  if (regulatoryRisk > 0.4) tags.push("regulated-space");
  if (competition > 0.6) tags.push("crowded-market");
  if (novelty > 0.55) tags.push("differentiated");
  if (defensibility > 0.55) tags.push("defensible");
  if (monetizationClarity > 0.55) tags.push("clear-monetization");
  if (monetizationClarity < 0.35) tags.push("unclear-monetization");
  if (marketReach > 0.6) tags.push("broad-market");
  if (specificity < 0.4) tags.push("thin-detail");

  return {
    text,
    wordCount,
    specificity,
    marketReach,
    monetizationClarity,
    techComplexity,
    regulatoryRisk,
    competition,
    novelty,
    defensibility,
    stageScore: stageScore(idea.stage),
    domain: inferDomain(text),
    tags,
  };
}

// ----------------------------------------------------------------------------
// Deterministic randomness — used only to vary template phrasing per idea,
// never to compute scores. Same idea => same wording.
// ----------------------------------------------------------------------------

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: string): () => number {
  return mulberry32(hashString(seed));
}

export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

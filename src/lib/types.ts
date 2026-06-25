// ============================================================================
// Boardroom AI — Core Data Models
// Shared between the backend (API routes + engines) and the frontend.
// ============================================================================

/** The six executive roles that sit on the AI board. */
export type AgentRole = "CEO" | "CFO" | "CTO" | "CMO" | "Risk" | "Product";

/** How an agent feels about the idea at a given moment. */
export type Stance = "Supportive" | "Concerned" | "Neutral" | "Strongly Opposed";

/** The stage of the debate a message belongs to. */
export type DebatePhase = "opening" | "challenge" | "defense" | "closing";

/** Final boardroom verdict. */
export type Verdict = "Build" | "Pivot" | "Validate First" | "Drop";

/** Which future is being simulated. */
export type ScenarioType = "Optimistic" | "Realistic" | "Pessimistic";

/** Whether the report was produced by the mock engine or a real LLM. */
export type ProviderMode = "mock" | "llm";

/** Lifecycle of a boardroom session. */
export type SessionStatus = "created" | "debating" | "complete" | "error";

// ----------------------------------------------------------------------------
// Input
// ----------------------------------------------------------------------------

/** The startup idea a founder submits for evaluation. */
export interface StartupIdea {
  title: string;
  problem: string;
  targetUsers: string;
  solution: string;
  businessModel: string;
  stage: string;
  /** Optional free-form context (e.g. an uploaded text/markdown brief). */
  notes?: string;
}

// ----------------------------------------------------------------------------
// Agents
// ----------------------------------------------------------------------------

export type AgentAccent =
  | "cyan"
  | "violet"
  | "emerald"
  | "amber"
  | "rose"
  | "sky";

/** A board member with a distinct decision lens and personality. */
export interface Agent {
  id: AgentRole;
  name: string;
  role: AgentRole;
  title: string;
  /** One-line personality descriptor. */
  persona: string;
  /** The lens through which this agent evaluates everything. */
  lens: string;
  /** Emoji used as a lightweight avatar. */
  avatar: string;
  /** Two-letter monogram fallback. */
  monogram: string;
  /** Theme accent key used by the UI (cyan, violet, etc.). */
  accent: AgentAccent;
}

// ----------------------------------------------------------------------------
// Debate
// ----------------------------------------------------------------------------

/**
 * How a single contribution nudges the six raw scoring dimensions.
 * Positive `risk`/`execution` make the idea riskier / harder.
 */
export interface ScoreImpact {
  market?: number;
  technical?: number;
  business?: number;
  risk?: number;
  innovation?: number;
  execution?: number;
}

/** A single message in the live boardroom debate. */
export interface DebateMessage {
  id: string;
  agentId: AgentRole;
  agentName: string;
  role: AgentRole;
  phase: DebatePhase;
  round: number;
  stance: Stance;
  message: string;
  keyConcern: string;
  /** 0–100 self-reported confidence in the position. */
  confidence: number;
  /** Which other agent (if any) this message challenges. */
  challengeTo?: AgentRole;
  challengeText?: string;
  /** How this contribution shifts the raw scores. */
  scoreImpact: ScoreImpact;
  /** 0–100 importance/severity of the point being raised. */
  severity: number;
  timestamp: number;
}

/** An agent's consolidated final position after the debate. */
export interface AgentAssessment {
  agentId: AgentRole;
  agentName: string;
  role: AgentRole;
  stance: Stance;
  confidence: number;
  summary: string;
  keyConcern: string;
  topStrength: string;
  topRisk: string;
}

// ----------------------------------------------------------------------------
// Consensus
// ----------------------------------------------------------------------------

/** A single 0–100 score together with its one-line justification. */
export interface ScoreDetail {
  value: number;
  justification: string;
}

/** The explainable consensus produced after the debate. */
export interface ConsensusScore {
  marketPotential: ScoreDetail;
  technicalFeasibility: ScoreDetail;
  businessViability: ScoreDetail;
  /** Higher means MORE risk. */
  riskLevel: ScoreDetail;
  innovation: ScoreDetail;
  /** Higher means HARDER to execute. */
  executionDifficulty: ScoreDetail;
  overallConfidence: ScoreDetail;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  assumptionsToValidate: string[];
  recommendedNextSteps: string[];
}

// ----------------------------------------------------------------------------
// Future simulation
// ----------------------------------------------------------------------------

export interface FutureScenario {
  type: ScenarioType;
  headline: string;
  sixMonths: string;
  twelveMonths: string;
  successDrivers: string[];
  failureDrivers: string[];
  /** 0–100 estimated probability of this scenario. */
  probability: number;
  strategicAdvice: string;
}

// ----------------------------------------------------------------------------
// Final recommendation
// ----------------------------------------------------------------------------

export interface FinalRecommendation {
  verdict: Verdict;
  executiveSummary: string;
  reasoning: string;
  consensusExplanation: string;
  whatToDoNext: string;
  actionItems: string[];
  experiments: string[];
  mvpFeatures: string[];
  pitchPositioning: string;
}

// ----------------------------------------------------------------------------
// Report + session
// ----------------------------------------------------------------------------

/** The complete output of a boardroom session. */
export interface BoardroomReport {
  sessionId: string;
  idea: StartupIdea;
  agents: Agent[];
  debate: DebateMessage[];
  assessments: AgentAssessment[];
  consensus: ConsensusScore;
  scenarios: FutureScenario[];
  recommendation: FinalRecommendation;
  createdAt: number;
  mode: ProviderMode;
}

export interface Session {
  id: string;
  idea: StartupIdea;
  status: SessionStatus;
  report?: BoardroomReport;
  createdAt: number;
  updatedAt: number;
  mode: ProviderMode;
  error?: string;
}

// ----------------------------------------------------------------------------
// UI helpers
// ----------------------------------------------------------------------------

/** The seven steps shown in the boardroom progress tracker. */
export const PROGRESS_STEPS = [
  "Idea submitted",
  "Agents initialized",
  "Debate started",
  "Challenges exchanged",
  "Consensus calculated",
  "Future simulated",
  "Recommendation generated",
] as const;

export type ProgressStep = (typeof PROGRESS_STEPS)[number];

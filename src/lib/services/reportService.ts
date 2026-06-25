import type { BoardroomReport, StartupIdea } from "../types";
import { analyzeIdea } from "../analysis";
import { getAgents } from "../agents";
import { getProvider } from "./llmProvider";
import { deriveAssessments, runDebate } from "../engines/debateEngine";
import { computeConsensus } from "../engines/consensusEngine";
import { simulateFutures } from "../engines/futureSimulationEngine";
import { buildRecommendation } from "../engines/recommendationEngine";

// ============================================================================
// Report service — the top-level orchestrator that runs the full boardroom
// pipeline: analyse -> debate -> consensus -> simulate -> recommend.
//
// Markdown serialization lives in `lib/markdown.ts` (a pure module that is also
// safe to import on the client).
// ============================================================================

export async function generateReport(
  sessionId: string,
  idea: StartupIdea,
): Promise<BoardroomReport> {
  const provider = getProvider();
  const signals = analyzeIdea(idea);
  const agents = getAgents();

  const debate = await runDebate(idea, signals, agents, provider);
  const assessments = deriveAssessments(idea, signals, debate, agents);
  const consensus = computeConsensus(idea, signals, debate);
  const scenarios = simulateFutures(idea, signals, consensus);
  const recommendation = buildRecommendation(idea, signals, consensus, scenarios);

  return {
    sessionId,
    idea,
    agents,
    debate,
    assessments,
    consensus,
    scenarios,
    recommendation,
    createdAt: Date.now(),
    mode: provider.mode,
  };
}

export { reportToMarkdown, reportFilename } from "../markdown";

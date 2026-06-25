import type { StartupIdea } from "./types";

// ============================================================================
// Sample startup ideas — used for one-click demos on the idea input page.
// Deliberately diverse so the consensus engine produces visibly different
// verdicts (a clean marketplace, a regulated AI play, a climate platform, a
// crowded SaaS tool).
// ============================================================================

export interface SampleIdea extends StartupIdea {
  id: string;
  tagline: string;
}

export const SAMPLE_IDEAS: SampleIdea[] = [
  {
    id: "localskill",
    title: "LocalSkill",
    tagline: "Trusted local mentors, on demand",
    problem:
      "Students and early professionals struggle to find trusted local mentors for practical skills like public speaking, design, coding, and interview preparation. Online courses feel impersonal and existing tutoring is expensive and academic.",
    targetUsers: "College students and early-career professionals in tier-1 and tier-2 cities.",
    solution:
      "A marketplace that connects learners with verified local mentors for short, affordable, outcome-based sessions, with reviews, skill badges, and session guarantees.",
    businessModel: "Commission per session plus premium mentor discovery and featured placement.",
    stage: "Idea stage",
  },
  {
    id: "mediguide",
    title: "MediGuide AI",
    tagline: "An AI triage co-pilot for clinics",
    problem:
      "Small clinics are overwhelmed by patient intake and basic triage, leading to long waits, burned-out staff, and inconsistent care for non-urgent cases.",
    targetUsers: "Independent clinics and small healthcare practices.",
    solution:
      "An AI assistant that conducts structured symptom intake, flags urgent cases, and drafts visit summaries for clinician review using a medically-tuned language model.",
    businessModel: "Per-seat SaaS subscription for clinics plus per-visit usage fees.",
    stage: "Prototype",
  },
  {
    id: "greenloop",
    title: "GreenLoop",
    tagline: "A reverse-logistics marketplace for reuse",
    problem:
      "Businesses throw away reusable packaging and materials because reverse logistics is fragmented, manual, and expensive, creating waste and missed savings.",
    targetUsers: "Mid-sized retailers, warehouses, and sustainability teams.",
    solution:
      "A two-sided marketplace and routing platform that matches surplus reusable materials with buyers and coordinates verified pickup, cleaning, and redistribution.",
    businessModel: "Transaction commission plus a SaaS dashboard for sustainability reporting.",
    stage: "MVP",
  },
  {
    id: "flowstate",
    title: "FlowState",
    tagline: "Focus analytics for remote teams",
    problem:
      "Remote teams drown in meetings and notifications and have no objective view of when deep work actually happens, so productivity quietly erodes.",
    targetUsers: "Remote-first software and design teams of 10–200 people.",
    solution:
      "A productivity tool that analyzes calendar and tool activity to surface focus time, meeting load, and burnout risk, with automated 'focus block' scheduling.",
    businessModel: "Per-seat SaaS subscription with a free individual tier.",
    stage: "Early revenue",
  },
];

export function getSampleById(id: string): SampleIdea | undefined {
  return SAMPLE_IDEAS.find((s) => s.id === id);
}

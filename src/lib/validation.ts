import type { StartupIdea } from "./types";

// ============================================================================
// Shared input validation for startup ideas (used by the API and the form).
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof StartupIdea, string>>;
}

const REQUIRED: { key: keyof StartupIdea; label: string; min: number }[] = [
  { key: "title", label: "Idea title", min: 2 },
  { key: "problem", label: "Problem statement", min: 12 },
  { key: "targetUsers", label: "Target users", min: 4 },
  { key: "solution", label: "Proposed solution", min: 12 },
  { key: "businessModel", label: "Business model", min: 4 },
  { key: "stage", label: "Current stage", min: 2 },
];

export function validateIdea(input: Partial<StartupIdea> | undefined): ValidationResult {
  const errors: Partial<Record<keyof StartupIdea, string>> = {};
  if (!input || typeof input !== "object") {
    return { valid: false, errors: { title: "No idea provided." } };
  }
  for (const { key, label, min } of REQUIRED) {
    const value = (input[key] ?? "").toString().trim();
    if (value.length === 0) {
      errors[key] = `${label} is required.`;
    } else if (value.length < min) {
      errors[key] = `${label} looks too short — add a little more detail.`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

/** Coerce arbitrary input into a clean StartupIdea (trimmed strings). */
export function normalizeIdea(input: Partial<StartupIdea>): StartupIdea {
  return {
    title: (input.title ?? "").toString().trim(),
    problem: (input.problem ?? "").toString().trim(),
    targetUsers: (input.targetUsers ?? "").toString().trim(),
    solution: (input.solution ?? "").toString().trim(),
    businessModel: (input.businessModel ?? "").toString().trim(),
    stage: (input.stage ?? "").toString().trim(),
    notes: input.notes ? input.notes.toString().trim() : undefined,
  };
}

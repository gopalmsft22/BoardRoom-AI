"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StartupIdea } from "@/lib/types";
import { SAMPLE_IDEAS } from "@/lib/samples";
import { normalizeIdea, validateIdea } from "@/lib/validation";
import { createSession, ApiError } from "@/lib/client/api";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

const EMPTY: StartupIdea = {
  title: "",
  problem: "",
  targetUsers: "",
  solution: "",
  businessModel: "",
  stage: "Idea stage",
  notes: "",
};

const STAGES = ["Idea stage", "Concept", "Prototype", "MVP", "Beta", "Early revenue", "Growth"];

const inputBase =
  "w-full rounded-xl border bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:ring-2 focus:ring-cyan-400/20";

export default function IdeaPage() {
  const router = useRouter();
  const [idea, setIdea] = useState<StartupIdea>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof StartupIdea, string>>>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function set<K extends keyof StartupIdea>(key: K, value: StartupIdea[K]) {
    setIdea((prev) => {
      const next = { ...prev, [key]: value };
      if (showErrors) setErrors(validateIdea(next).errors);
      return next;
    });
  }

  function loadSample(id: string) {
    const s = SAMPLE_IDEAS.find((x) => x.id === id);
    if (!s) return;
    const { id: _id, tagline: _t, ...rest } = s;
    void _id;
    void _t;
    setIdea({ ...EMPTY, ...rest });
    setErrors({});
    setShowErrors(false);
    setApiError(null);
    setFileName(null);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "").slice(0, 5000);
      set("notes", (idea.notes ? idea.notes + "\n\n" : "") + text);
    };
    reader.readAsText(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = normalizeIdea(idea);
    const result = validateIdea(clean);
    setErrors(result.errors);
    setShowErrors(true);
    if (!result.valid) {
      document.getElementById("idea-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const { sessionId } = await createSession(clean);
      router.push(`/boardroom/${sessionId}`);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : "Could not start the session. Please try again.");
      setLoading(false);
    }
  }

  const err = (k: keyof StartupIdea) => (showErrors ? errors[k] : undefined);
  const borderFor = (k: keyof StartupIdea) =>
    err(k) ? "border-rose-400/60 focus:border-rose-400" : "border-white/10 focus:border-cyan-400/50";

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <Reveal>
        <SectionHeading
          eyebrow="Step 1 · Idea Intake"
          title="Submit your startup idea"
          subtitle="Give the board something to debate. The more specific you are, the sharper the verdict."
        />
      </Reveal>

      {/* Samples */}
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-white/45">Try a sample:</span>
          {SAMPLE_IDEAS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadSample(s.id)}
              className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-xs text-white/75 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              {s.title} <span className="text-white/35">· {s.tagline}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <form id="idea-form" onSubmit={submit} className="glass space-y-5 rounded-3xl p-6 sm:p-8" noValidate>
          <Field label="Idea title" required error={err("title")}>
            <input
              className={cn(inputBase, borderFor("title"))}
              placeholder="e.g. LocalSkill"
              value={idea.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={80}
            />
          </Field>

          <Field label="Problem statement" required error={err("problem")}>
            <textarea
              className={cn(inputBase, "min-h-[88px] resize-y", borderFor("problem"))}
              placeholder="What painful, real problem are you solving — and for whom?"
              value={idea.problem}
              onChange={(e) => set("problem", e.target.value)}
              maxLength={600}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Target users" required error={err("targetUsers")}>
              <input
                className={cn(inputBase, borderFor("targetUsers"))}
                placeholder="Who exactly is this for?"
                value={idea.targetUsers}
                onChange={(e) => set("targetUsers", e.target.value)}
                maxLength={160}
              />
            </Field>
            <Field label="Current stage" required error={err("stage")}>
              <select
                className={cn(inputBase, borderFor("stage"), "appearance-none")}
                value={idea.stage}
                onChange={(e) => set("stage", e.target.value)}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s} className="bg-[#0a0f24]">
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Proposed solution" required error={err("solution")}>
            <textarea
              className={cn(inputBase, "min-h-[88px] resize-y", borderFor("solution"))}
              placeholder="How does your product solve it? What's the core loop?"
              value={idea.solution}
              onChange={(e) => set("solution", e.target.value)}
              maxLength={600}
            />
          </Field>

          <Field label="Business model" required error={err("businessModel")}>
            <input
              className={cn(inputBase, borderFor("businessModel"))}
              placeholder="e.g. Commission per session + premium discovery"
              value={idea.businessModel}
              onChange={(e) => set("businessModel", e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field label="Extra context (optional)" hint="Paste notes or upload a .txt / .md brief">
            <textarea
              className={cn(inputBase, "min-h-[64px] resize-y border-white/10 focus:border-cyan-400/50")}
              placeholder="Anything else the board should know — traction, competitors, constraints…"
              value={idea.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={5000}
            />
            <div className="mt-2 flex items-center gap-3">
              <label className="btn btn-ghost cursor-pointer text-xs">
                📎 Upload file
                <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" onChange={onFile} />
              </label>
              {fileName && <span className="text-xs text-white/45">Loaded: {fileName}</span>}
            </div>
          </Field>

          {apiError && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {apiError}
            </div>
          )}
          {showErrors && Object.keys(errors).length > 0 && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Please complete the highlighted fields before convening the board.
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-5">
            <p className="text-xs text-white/40">
              Six AI executives are standing by. This runs in demo mode — no API key required.
            </p>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <Spinner /> Convening the board…
                </>
              ) : (
                <>⚖️ Convene the Boardroom</>
              )}
            </button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-medium text-white/85">
          {label}
          {required && <span className="ml-1 text-rose-400/80">*</span>}
        </span>
        {hint && <span className="text-[11px] text-white/35">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </label>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black/80" />
  );
}

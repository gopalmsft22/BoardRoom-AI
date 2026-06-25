import Link from "next/link";
import { getAgents } from "@/lib/agents";
import { HeroBoard } from "@/components/HeroBoard";
import { AgentCard } from "@/components/AgentCard";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

const PIPELINE: { step: string; desc: string }[] = [
  { step: "Idea submitted", desc: "Type or paste your startup idea, or load a sample." },
  { step: "Agents initialized", desc: "Six AI executives spin up with distinct lenses." },
  { step: "Debate started", desc: "Each agent gives an opening assessment." },
  { step: "Challenges exchanged", desc: "Agents attack each other's weakest assumptions." },
  { step: "Consensus calculated", desc: "Seven explainable scores, each justified." },
  { step: "Future simulated", desc: "Optimistic, realistic and pessimistic 12-month paths." },
  { step: "Recommendation generated", desc: "A single verdict and an action plan." },
];

const DIFFERENTIATORS = [
  {
    icon: "⚔️",
    title: "Structured disagreement",
    body: "Most AI tools give one confident answer. Boardroom AI forces your idea to survive a real debate before it earns a recommendation.",
  },
  {
    icon: "📊",
    title: "Explainable consensus",
    body: "Seven scores — market, feasibility, viability, risk, innovation, difficulty and confidence — each shipped with a one-line justification.",
  },
  {
    icon: "🔮",
    title: "Future simulation",
    body: "See how the idea plays out in three futures, with probabilities and the drivers that decide which one you get.",
  },
];

export default function LandingPage() {
  const agents = getAgents();

  return (
    <div className="mx-auto max-w-7xl px-5">
      {/* Hero */}
      <section className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
        <Reveal>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/65">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-cyan-400" />
              Multi-agent decision intelligence
            </span>
            <h1 className="mt-5 text-5xl font-bold tracking-tight text-white sm:text-6xl">
              Boardroom<span className="text-gradient"> AI</span>
            </h1>
            <p className="mt-4 text-xl font-medium text-white/80">
              Where AI leaders debate, challenge, and decide.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/55">
              Upload your startup idea and let six AI executives debate it, challenge
              assumptions, simulate future outcomes, and deliver a consensus-backed
              recommendation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/idea" className="btn btn-primary text-base">
                🚀 Start Boardroom Session
              </Link>
              <Link href="#how" className="btn btn-ghost text-base">
                See how it works
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/40">
              <span>✓ No API key needed</span>
              <span>✓ Runs locally</span>
              <span>✓ Downloadable report</span>
            </div>
          </div>
        </Reveal>

        <div className="relative">
          <HeroBoard />
        </div>
      </section>

      {/* Pitch quote */}
      <Reveal>
        <div className="glass rounded-3xl p-7 text-center sm:p-10">
          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-white/85 sm:text-2xl">
            &ldquo;Most AI tools give one answer. Boardroom AI creates{" "}
            <span className="text-gradient">structured disagreement</span> — it forces
            ideas to survive debate before giving a recommendation.&rdquo;
          </p>
        </div>
      </Reveal>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 py-16">
        <Reveal>
          <SectionHeading
            eyebrow="The Pipeline"
            title="From raw idea to boardroom verdict"
            subtitle="Seven stages, fully visualized, in under a minute."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PIPELINE.map((p, i) => (
            <Reveal key={p.step} delay={i * 0.05}>
              <div className="glass h-full rounded-2xl p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15 text-sm font-bold text-cyan-200">
                  {i + 1}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{p.step}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Council */}
      <section className="py-16">
        <Reveal>
          <SectionHeading
            eyebrow="The Council"
            title="Meet your six AI executives"
            subtitle="Each agent reasons through a distinct decision lens — and isn't afraid to disagree."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-16">
        <Reveal>
          <SectionHeading eyebrow="Why it's different" title="Not a chatbot. A decision engine." />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {DIFFERENTIATORS.map((d, i) => (
            <Reveal key={d.title} delay={i * 0.08}>
              <div className="glass h-full rounded-2xl p-6">
                <div className="text-3xl">{d.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-white">{d.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{d.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="py-16">
        <Reveal>
          <div
            className="glass relative overflow-hidden rounded-3xl p-8 text-center sm:p-12"
            style={{ boxShadow: "0 0 80px -30px rgba(168,85,247,0.6)" }}
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(168,85,247,0.4)" }}
            />
            <h2 className="relative text-3xl font-bold text-white sm:text-4xl">
              Put your idea in front of the board.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/60">
              It takes under a minute, runs entirely in demo mode, and ends with a
              downloadable decision report.
            </p>
            <div className="relative mt-7">
              <Link href="/idea" className="btn btn-primary text-base">
                🚀 Start Boardroom Session
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

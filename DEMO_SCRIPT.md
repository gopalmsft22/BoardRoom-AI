# 🎤 Boardroom AI — Demo Script

A tight, judge-ready script for presenting Boardroom AI. Total runtime: **~2.5 minutes**.

> Before you start: run `npm run dev`, open `http://localhost:3000`, and have the **idea page** ready in a second tab. Everything runs in demo mode — no API key, no network risk.

---

## ⚡ 30-second pitch (the hook)

> "Every AI tool today gives you **one confident answer**. But the most important decisions don't come from agreement — they come from **debate**.
>
> **Boardroom AI** is an AI executive council. You hand it a startup idea, and six specialized AI leaders — a CEO, CFO, CTO, CMO, a Risk Analyst, and a Head of Product — **debate it live, challenge each other, and disagree**. Then they score it, simulate its future, and deliver a single boardroom verdict you can act on.
>
> It's not a chatbot. It's a **decision engine** that makes your idea survive a debate before it earns a recommendation."

---

## 🎬 2-minute live demo flow

**1. Landing (10s)** — _Open `http://localhost:3000`._
- "Six AI executives, one central idea." Point at the holographic board orbiting the idea node.
- Read the tagline: _"Where AI leaders debate, challenge, and decide."_
- Click **Start Boardroom Session**.

**2. Idea intake (15s)** — _On the idea page._
- "I'll use a real example." Click the **LocalSkill** sample chip — the whole form fills instantly.
- "Notice it validates input, supports file upload, and has one-click samples." Click **Convene the Boardroom**.

**3. The live debate (45s)** — _The boardroom page._ **← the wow moment**
- "Watch this." The six agents light up and start **deliberating**.
- Opening assessments stream in one by one. "The CFO is already skeptical about unit economics; the CTO wants to cut scope."
- Scroll as the **Challenges Exchanged** phase appears: "Here's the key — they **attack each other**. The CFO challenges the CEO's vision: _'vision doesn't pay salaries.'_ The Risk Analyst goes after the CTO's feasibility claims."
- Point at the **live progress tracker** on the left ticking through the seven stages, and the **stance + confidence bars** updating per agent.

**4. The verdict (15s)** — _When the debate completes._
- A verdict card slides in: **"Build."** Click **View the full decision report**.

**5. The report (35s)** — _The report page._
- "Every score is **explainable** — look, each one has a justification. No naked numbers." Point at the radar chart and the seven score bars.
- Scroll to **Future Simulations**: "Three futures — optimistic, realistic, pessimistic — with probabilities."
- Scroll to the **action plan**: "Five action items, three validation experiments, an MVP feature list, and pitch positioning."
- Click **Download .md** (or **Print / PDF**). "And it's a shareable report in one click."

---

## 🧑‍⚖️ Judge-facing technical architecture (45s)

> "Under the hood, it's a single **Next.js 16 / React 19 / TypeScript** app — one command to run, which keeps the demo bulletproof.
>
> - The **backend** lives in Next.js Route Handlers backed by clean service modules: a `debateEngine`, `consensusEngine`, `futureSimulationEngine`, and `recommendationEngine`.
> - There's an **LLM provider abstraction** that talks to any OpenAI-compatible API — but it falls back to a **deterministic mock engine**, so it works with zero keys and zero cost.
> - The debate is genuinely **structured**: each agent has a disposition computed from idea signals, a stance, a confidence, and a **score impact**. A fixed challenge ring guarantees real cross-examination.
> - The live debate streams over **Server-Sent Events**, with a client-side reveal fallback so it can never hang on stage.
> - The consensus is **deterministic and explainable** — same idea, same scores, every time. Perfect for scrutiny."

---

## 🆚 Why this is different from a normal chatbot

| A normal chatbot | Boardroom AI |
| --- | --- |
| One voice, one answer | **Six specialists who disagree** |
| Agreeable, sycophantic | **Adversarial by design** (challenge ring) |
| Opaque vibes | **Seven explainable scores** with justifications |
| No foresight | **Three simulated futures** with probabilities |
| Ends in a paragraph | Ends in a **verdict + action plan + report** |

---

## 💥 Key wow moments (lean into these)

1. **The holographic board** on the landing page — six glowing executives orbiting the idea.
2. **Agents challenging each other** by name — _"vision doesn't pay salaries."_
3. The **live progress tracker** + per-agent confidence bars updating in real time.
4. The **animated radar + gauge** on the scorecard, every score justified.
5. One-click **downloadable report**.

---

## 🎯 Closing line

> "Boardroom AI doesn't just answer your question — it **convenes a board, forces a debate, and makes a decision**. Because great ideas shouldn't survive because no one challenged them. They should survive **because they were challenged — and won.**"

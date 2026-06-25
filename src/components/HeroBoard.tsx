"use client";

import { motion } from "framer-motion";
import { getAgents } from "@/lib/agents";
import { ACCENTS } from "@/lib/client/theme";
import { BrandMark } from "./BrandMark";

// The signature visual: a central idea node orbited by six AI executives,
// connected by animated "data" links.
export function HeroBoard() {
  const agents = getAgents();
  const R = 40; // orbit radius in %

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      {/* connecting links */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        {agents.map((agent, i) => {
          const ang = (-90 + i * 60) * (Math.PI / 180);
          const x = 50 + R * Math.cos(ang);
          const y = 50 + R * Math.sin(ang);
          return (
            <motion.line
              key={agent.id}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke={ACCENTS[agent.accent].hex}
              strokeWidth="0.4"
              strokeOpacity="0.4"
              strokeDasharray="2 2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* rotating accent ring */}
      <div className="absolute inset-[12%] animate-ring-spin rounded-full border border-dashed border-white/10" />
      <div className="absolute inset-[2%] rounded-full border border-white/5" />

      {/* center idea node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass absolute left-1/2 top-1/2 flex h-[27%] w-[27%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl"
        style={{ boxShadow: "0 0 50px -12px rgba(34,211,238,0.5)" }}
      >
        <BrandMark size={30} />
        <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/70">
          Your Idea
        </span>
      </motion.div>

      {/* agent orbs */}
      {agents.map((agent, i) => {
        const ang = (-90 + i * 60) * (Math.PI / 180);
        const x = 50 + R * Math.cos(ang);
        const y = 50 + R * Math.sin(ang);
        const a = ACCENTS[agent.accent];
        return (
          <motion.div
            key={agent.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.4 + i * 0.1 }}
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
              className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br text-xl ${a.border} ${a.gradFrom} ${a.gradTo}`}
              style={{ boxShadow: `0 0 24px -8px ${a.glow}` }}
            >
              <span aria-hidden>{agent.avatar}</span>
            </motion.div>
            <span className={`mt-1 text-[10px] font-semibold ${a.text}`}>{agent.role}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

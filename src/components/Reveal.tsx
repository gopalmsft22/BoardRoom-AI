"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Animate in on mount (not on scroll). This keeps content reliably visible for
// print-to-PDF, static captures, and reduced-motion, while still feeling alive.
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

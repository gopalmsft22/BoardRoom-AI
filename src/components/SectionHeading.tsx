import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  right?: ReactNode;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-[28px]">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-white/55">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

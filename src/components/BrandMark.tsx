import { cn } from "@/lib/cn";

export function BrandMark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <span className={cn("inline-flex", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" aria-hidden>
        <defs>
          <linearGradient id="bm-grad" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f0abfc" />
          </linearGradient>
        </defs>
        <path
          d="M24 3 41.5 13v22L24 45 6.5 35V13z"
          stroke="url(#bm-grad)"
          strokeWidth="2"
          fill="rgba(34,211,238,0.06)"
        />
        <circle cx="24" cy="24" r="4.5" fill="url(#bm-grad)" />
        <g stroke="url(#bm-grad)" strokeWidth="1.6" opacity="0.9">
          <circle cx="24" cy="11" r="2.4" fill="#05060f" />
          <circle cx="35" cy="30.5" r="2.4" fill="#05060f" />
          <circle cx="13" cy="30.5" r="2.4" fill="#05060f" />
          <line x1="24" y1="13.4" x2="24" y2="19.5" />
          <line x1="33" y1="29.2" x2="27.8" y2="26" />
          <line x1="15" y1="29.2" x2="20.2" y2="26" />
        </g>
      </svg>
    </span>
  );
}

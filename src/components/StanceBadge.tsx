import { STANCE_STYLES } from "@/lib/client/theme";
import type { Stance } from "@/lib/types";
import { cn } from "@/lib/cn";

export function StanceBadge({ stance, className }: { stance: Stance; className?: string }) {
  const s = STANCE_STYLES[stance];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        s.bg,
        s.border,
        s.text,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {stance}
    </span>
  );
}

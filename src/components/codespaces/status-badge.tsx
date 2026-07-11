import { cn } from "@/lib/utils";
import type { Codespace } from "@/lib/github";

type StatusTone = "live" | "pending" | "idle" | "error";

const TONE_BY_STATE: Record<Codespace["state"], StatusTone> = {
  Available: "live",
  Created: "pending",
  Queued: "pending",
  Provisioning: "pending",
  Awaiting: "pending",
  Starting: "pending",
  ShuttingDown: "pending",
  Updating: "pending",
  Rebuilding: "pending",
  Exporting: "pending",
  Moved: "pending",
  Shutdown: "idle",
  Archived: "idle",
  Deleted: "idle",
  Unavailable: "error",
  Failed: "error",
  Unknown: "error",
};

const DOT_CLASS: Record<StatusTone, string> = {
  live: "bg-emerald-500",
  pending: "bg-amber-500 animate-pulse",
  idle: "bg-muted-foreground/40",
  error: "bg-destructive",
};

const TEXT_CLASS: Record<StatusTone, string> = {
  live: "text-emerald-700 dark:text-emerald-400",
  pending: "text-amber-700 dark:text-amber-400",
  idle: "text-muted-foreground",
  error: "text-destructive",
};

export function StatusBadge({ state }: { state: Codespace["state"] }) {
  const tone = TONE_BY_STATE[state] ?? "error";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 font-mono text-xs",
        TEXT_CLASS[tone]
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])} />
      {state}
    </span>
  );
}

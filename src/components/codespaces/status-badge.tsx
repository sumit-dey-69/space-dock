import { Badge } from "@/components/ui/badge";
import type { Codespace } from "@/lib/github";

const VARIANT_BY_STATE: Record<
  Codespace["state"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  Available: "default",
  Shutdown: "secondary",
  Archived: "secondary",
  Deleted: "secondary",
  Created: "outline",
  Queued: "outline",
  Provisioning: "outline",
  Awaiting: "outline",
  Starting: "outline",
  ShuttingDown: "outline",
  Updating: "outline",
  Rebuilding: "outline",
  Exporting: "outline",
  Moved: "outline",
  Unavailable: "destructive",
  Failed: "destructive",
  Unknown: "destructive",
};

export function StatusBadge({ state }: { state: Codespace["state"] }) {
  return <Badge variant={VARIANT_BY_STATE[state] ?? "outline"}>{state}</Badge>;
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal, Play, Square, Trash2, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/codespaces/status-badge";
import type { Codespace } from "@/lib/github";

async function fetchCodespaces(): Promise<Codespace[]> {
  const res = await fetch("/api/codespaces");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.codespaces;
}

async function postAction(name: string, action: "start" | "stop"): Promise<void> {
  const res = await fetch(`/api/codespaces/${name}/${action}`, { method: "POST" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
}

async function deleteCodespaceRequest(name: string): Promise<void> {
  const res = await fetch(`/api/codespaces/${name}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function CodespaceTable() {
  const queryClient = useQueryClient();

  const {
    data: codespaces,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["codespaces"],
    queryFn: fetchCodespaces,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["codespaces"] });

  const actionMutation = useMutation({
    mutationFn: ({ name, action }: { name: string; action: "start" | "stop" }) =>
      postAction(name, action),
    onSuccess: (_data, { name, action }) => {
      toast.success(`${action === "start" ? "Starting" : "Stopping"} ${name}`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteCodespaceRequest(name),
    onSuccess: (_data, name) => {
      toast.success(`Deleted ${name}`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load Codespaces: {(error as Error).message}
      </p>
    );
  }

  if (!codespaces || codespaces.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No Codespaces found. Create one from a repository on GitHub to see it here.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Repository</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Machine</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last used</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {codespaces.map((cs) => {
          const isBusy =
            (actionMutation.isPending &&
              actionMutation.variables?.name === cs.name) ||
            (deleteMutation.isPending && deleteMutation.variables === cs.name);
          const canStart = cs.state === "Shutdown";
          const canStop = cs.state === "Available";

          return (
            <TableRow key={cs.id}>
              <TableCell className="font-medium">
                {cs.display_name ?? cs.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {cs.repository.full_name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {cs.git_status.ref}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {cs.machine?.display_name ?? "—"}
              </TableCell>
              <TableCell>
                <StatusBadge state={cs.state} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(cs.last_used_at)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon" disabled={isBusy} />}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      disabled={!canStart}
                      onClick={() =>
                        actionMutation.mutate({ name: cs.name, action: "start" })
                      }
                    >
                      <Play className="size-4" /> Start
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!canStop}
                      onClick={() =>
                        actionMutation.mutate({ name: cs.name, action: "stop" })
                      }
                    >
                      <Square className="size-4" /> Stop
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      render={<a href={cs.web_url} target="_blank" rel="noopener noreferrer" />}
                    >
                      <ExternalLink className="size-4" /> Open in browser
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete Codespace "${cs.name}"? This can't be undone.`)) {
                          deleteMutation.mutate(cs.name);
                        }
                      }}
                    >
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

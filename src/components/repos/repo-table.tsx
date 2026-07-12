"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  GitFork,
  Star,
  Trash2,
  ExternalLink,
  Pin,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteRepoDialog } from "@/components/repos/delete-repo-dialog";
import { CreateRepoDialog } from "@/components/repos/create-repo-dialog";
import { ManageRepoDialog } from "@/components/repos/manage-repo-dialog";
import { usePinnedRepos } from "@/hooks/use-pinned-repos";
import { cn } from "@/lib/utils";
import type { Repo } from "@/lib/github";

async function fetchRepos(): Promise<Repo[]> {
  const res = await fetch("/api/repos");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.repos;
}

async function createRepoRequest(input: {
  name: string;
  description: string;
  private: boolean;
  autoInit: boolean;
}): Promise<Repo> {
  const res = await fetch("/api/repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.repo;
}

async function updateRepoRequest(
  fullName: string,
  input: { name?: string; description?: string; private?: boolean }
): Promise<Repo> {
  const [owner, repo] = fullName.split("/");
  const res = await fetch(`/api/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.repo;
}

async function deleteRepoRequest(fullName: string): Promise<void> {
  const [owner, repo] = fullName.split("/");
  const res = await fetch(`/api/repos/${owner}/${repo}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDay = Math.round(diffMs / 86_400_000);
  if (diffDay < 1) return "today";
  if (diffDay === 1) return "yesterday";
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.round(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.round(diffMonth / 12)}y ago`;
}

type VisibilityFilter = "all" | "public" | "private";

export function RepoList() {
  const queryClient = useQueryClient();
  const { pinned, toggle: togglePin } = usePinnedRepos();
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<Repo | null>(null);
  const [pendingManage, setPendingManage] = useState<Repo | null>(null);

  const {
    data: repos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["repos"] });

  const createMutation = useMutation({
    mutationFn: createRepoRequest,
    onSuccess: (repo) => {
      toast.success(`Created ${repo.full_name}`);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      fullName,
      input,
    }: {
      fullName: string;
      input: { name?: string; description?: string; private?: boolean };
    }) => updateRepoRequest(fullName, input),
    onSuccess: (repo) => {
      toast.success(`Saved ${repo.full_name}`);
      setPendingManage(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRepoRequest,
    onSuccess: (_data, fullName) => {
      toast.success(`Deleted ${fullName}`);
      setPendingDelete(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const visibleRepos = useMemo(() => {
    if (!repos) return [];
    const filtered = repos.filter((repo) => {
      if (filter === "public") return !repo.private;
      if (filter === "private") return repo.private;
      return true;
    });
    // Pinned repos first, preserving the API's own ordering (updated desc)
    // within each group.
    return [...filtered].sort((a, b) => {
      const aPinned = pinned.has(a.full_name) ? 1 : 0;
      const bPinned = pinned.has(b.full_name) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [repos, filter, pinned]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Failed to load repositories: {(error as Error).message}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as VisibilityFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
        </Tabs>

        <CreateRepoDialog
          onCreate={(input) => createMutation.mutate(input)}
          isCreating={createMutation.isPending}
        />
      </div>

      {visibleRepos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {repos?.length === 0
            ? "No repositories found."
            : "No repositories match this filter."}
        </p>
      ) : (
        <ul className="divide-y">
          {visibleRepos.map((repo) => {
            // GitHub only includes `permissions` for repos the token holder
            // has explicit access levels on; be conservative and only allow
            // manage/delete when we know for sure the user is an admin.
            const canManage = repo.permissions?.admin === true;
            const isPinned = pinned.has(repo.full_name);

            return (
              <li key={repo.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium hover:underline"
                    >
                      {repo.full_name}
                    </a>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 font-mono text-xs",
                        repo.private
                          ? "text-muted-foreground"
                          : "text-emerald-700 dark:text-emerald-400"
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          repo.private ? "bg-muted-foreground/40" : "bg-emerald-500"
                        )}
                      />
                      {repo.private ? "Private" : "Public"}
                    </span>
                    {repo.fork && (
                      <Badge variant="outline" className="font-mono">
                        Fork
                      </Badge>
                    )}
                  </div>

                  {repo.description && (
                    <p className="truncate text-sm text-muted-foreground">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {repo.language && (
                      <span className="font-mono">{repo.language}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Star className="size-3" /> {repo.stargazers_count}
                    </span>
                    {repo.fork && (
                      <span className="flex items-center gap-1">
                        <GitFork className="size-3" />
                      </span>
                    )}
                    <span>Updated {formatRelativeTime(repo.updated_at)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={isPinned ? "Unpin repository" : "Pin repository"}
                    onClick={() => togglePin(repo.full_name)}
                  >
                    <Pin
                      className={cn(
                        "size-4",
                        isPinned && "fill-current text-primary"
                      )}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={<a href={repo.html_url} target="_blank" rel="noopener noreferrer" />}
                  >
                    <ExternalLink className="size-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={!canManage}
                        onClick={() => setPendingManage(repo)}
                      >
                        <Settings className="size-4" /> Manage repository
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={!canManage}
                        onClick={() => setPendingDelete(repo)}
                      >
                        <Trash2 className="size-4" /> Delete repository
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pendingDelete && (
        <DeleteRepoDialog
          open={!!pendingDelete}
          onOpenChange={(open) => !open && setPendingDelete(null)}
          fullName={pendingDelete.full_name}
          isDeleting={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(pendingDelete.full_name)}
        />
      )}

      {pendingManage && (
        <ManageRepoDialog
          repo={pendingManage}
          open={!!pendingManage}
          onOpenChange={(open) => !open && setPendingManage(null)}
          isSaving={updateMutation.isPending}
          onSave={(input) =>
            updateMutation.mutate({ fullName: pendingManage.full_name, input })
          }
        />
      )}
    </div>
  );
}

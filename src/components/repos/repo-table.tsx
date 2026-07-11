"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GitFork, Star, Trash2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteRepoDialog } from "@/components/repos/delete-repo-dialog";
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

export function RepoList() {
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<Repo | null>(null);

  const {
    data: repos,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRepoRequest,
    onSuccess: (_data, fullName) => {
      toast.success(`Deleted ${fullName}`);
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

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

  if (!repos || repos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No repositories found.</p>
    );
  }

  return (
    <>
      <ul className="divide-y">
        {repos.map((repo) => {
          // GitHub only includes `permissions` for repos the token holder
          // has explicit access levels on; be conservative and only allow
          // the delete action when we know for sure the user is an admin.
          const canDelete = repo.permissions?.admin === true;

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
                  nativeButton={false}
                  render={<a href={repo.html_url} target="_blank" rel="noopener noreferrer" />}
                >
                  <ExternalLink className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!canDelete}
                  title={
                    canDelete
                      ? "Delete repository"
                      : "You need admin rights on this repository to delete it"
                  }
                  onClick={() => setPendingDelete(repo)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {pendingDelete && (
        <DeleteRepoDialog
          open={!!pendingDelete}
          onOpenChange={(open) => !open && setPendingDelete(null)}
          fullName={pendingDelete.full_name}
          isDeleting={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(pendingDelete.full_name)}
        />
      )}
    </>
  );
}

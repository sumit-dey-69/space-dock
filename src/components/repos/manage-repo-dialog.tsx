"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Repo } from "@/lib/github";

const VALID_NAME = /^[A-Za-z0-9._-]+$/;

export function ManageRepoDialog({
  repo,
  open,
  onOpenChange,
  isSaving,
  onSave,
}: {
  repo: Repo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving: boolean;
  onSave: (input: { name?: string; description?: string; private?: boolean }) => void;
}) {
  const [name, setName] = useState(repo.name);
  const [description, setDescription] = useState(repo.description ?? "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    repo.private ? "private" : "public"
  );

  const nameError =
    name.length > 0 && !VALID_NAME.test(name)
      ? "Only letters, numbers, periods, hyphens, and underscores are allowed."
      : null;
  const canSubmit = name.length > 0 && !nameError && !isSaving;

  const hasChanges =
    name !== repo.name ||
    description !== (repo.description ?? "") ||
    (visibility === "private") !== repo.private;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          // Reset to the repo's current values next time it opens.
          setName(repo.name);
          setDescription(repo.description ?? "");
          setVisibility(repo.private ? "private" : "public");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage repository</DialogTitle>
          <DialogDescription>{repo.owner.login}/{repo.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="manage-repo-name" className="text-sm font-medium">
              Repository name
            </label>
            <Input
              id="manage-repo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
            {name !== repo.name && !nameError && (
              <p className="text-xs text-muted-foreground">
                Renaming updates the repository&apos;s URL. Links to the old
                name will redirect, but existing clones will need their
                remote URL updated.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="manage-repo-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="manage-repo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium">Visibility</span>
            <Tabs
              value={visibility}
              onValueChange={(v) => setVisibility(v as "public" | "private")}
            >
              <TabsList>
                <TabsTrigger value="public">Public</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
              </TabsList>
            </Tabs>
            {(visibility === "private") !== repo.private && (
              <p className="text-xs text-muted-foreground">
                {visibility === "private"
                  ? "Making this repository private restricts who can see it."
                  : "Making this repository public means anyone can see it."}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || !hasChanges}
            onClick={() =>
              onSave({
                name: name !== repo.name ? name : undefined,
                description:
                  description !== (repo.description ?? "") ? description : undefined,
                private:
                  (visibility === "private") !== repo.private
                    ? visibility === "private"
                    : undefined,
              })
            }
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

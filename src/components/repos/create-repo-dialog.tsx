"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

// GitHub repo names: letters, digits, `.`, `-`, `_` only.
const VALID_NAME = /^[A-Za-z0-9._-]+$/;

export function CreateRepoDialog({
  onCreate,
  isCreating,
}: {
  onCreate: (input: {
    name: string;
    description: string;
    private: boolean;
    autoInit: boolean;
  }) => void;
  isCreating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [autoInit, setAutoInit] = useState(true);

  const nameError =
    name.length > 0 && !VALID_NAME.test(name)
      ? "Only letters, numbers, periods, hyphens, and underscores are allowed."
      : null;
  const canSubmit = name.length > 0 && !nameError && !isCreating;

  function reset() {
    setName("");
    setDescription("");
    setVisibility("public");
    setAutoInit(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="size-4" />
        New repository
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new repository</DialogTitle>
          <DialogDescription>
            A repository contains all of your project&apos;s files and their
            revision history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="new-repo-name" className="text-sm font-medium">
              Repository name
            </label>
            <Input
              id="new-repo-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-new-project"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={!!nameError}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="new-repo-description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="new-repo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of your project"
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
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoInit}
              onChange={(e) => setAutoInit(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Initialize this repository with a README
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                name,
                description,
                private: visibility === "private",
                autoInit,
              })
            }
          >
            {isCreating ? "Creating..." : "Create repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

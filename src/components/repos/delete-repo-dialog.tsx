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

export function DeleteRepoDialog({
  open,
  onOpenChange,
  fullName,
  isDeleting,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  isDeleting: boolean;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canConfirm = confirmText === fullName;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete repository</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{fullName}</strong>,
            including all commits, issues, pull requests, and wiki pages.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="confirm-repo-name" className="text-sm font-medium">
            Type <span className="font-mono">{fullName}</span> to confirm.
          </label>
          <Input
            id="confirm-repo-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={fullName}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canConfirm || isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? "Deleting..." : "Delete this repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import * as React from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof Panel>) {
  return (
    <Panel
      data-slot="resizable-panel"
      className={cn("min-w-0", className)}
      {...props}
    />
  );
}

function ResizableHandle({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="resizable-handle"
      className={cn(
        "group relative mx-1 w-1.5 shrink-0 rounded-full bg-transparent outline-none transition-colors after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-border data-[panel-group-orientation=vertical]:after:inset-x-0 data-[panel-group-orientation=vertical]:after:inset-y-auto data-[panel-group-orientation=vertical]:after:h-px data-[panel-group-orientation=vertical]:after:w-full hover:bg-muted data-focused:bg-muted",
        className
      )}
      {...props}
    >
      <div className="absolute top-1/2 left-1/2 z-10 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border bg-border opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical className="size-2.5 text-muted-foreground" />
      </div>
    </Separator>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

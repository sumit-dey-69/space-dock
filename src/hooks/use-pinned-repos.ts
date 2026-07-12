"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "spacedock:pinned-repos";

function readStored(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

function writeStored(next: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  } catch {
    // Storage can throw (private browsing, quota) — pin just won't
    // survive a reload in that case, not worth surfacing an error for.
  }
}

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function notify() {
  for (const listener of listeners) listener();
}

function getSnapshot(): Set<string> {
  return readStored();
}

function getServerSnapshot(): Set<string> {
  return new Set();
}

/** Pins live only in this browser's localStorage for now — there's no
 * per-user backend store wired up yet (Prisma is scaffolded but unused).
 * Good enough for "pin things I care about on this machine"; wouldn't
 * survive across devices or browsers. Upgrade path: a `pins` Prisma model
 * keyed by GitHub user id, once that's worth the migration.
 *
 * Uses useSyncExternalStore (the React-recommended way to read mutable
 * state that lives outside React) rather than an effect + setState, so
 * it stays correct across concurrent rendering and updates instantly if
 * another tab changes the pins too. */
export function usePinnedRepos() {
  const pinned = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((fullName: string) => {
    const current = readStored();
    const next = new Set(current);
    if (next.has(fullName)) {
      next.delete(fullName);
    } else {
      next.add(fullName);
    }
    writeStored(next);
    notify();
  }, []);

  return { pinned, toggle };
}

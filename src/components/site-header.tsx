"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <span className="text-lg font-semibold tracking-tight">SpaceDock</span>

      {status === "loading" ? null : session ? (
        <div className="flex items-center gap-3">
          {session.user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={session.user.image}
              alt={session.user.name ?? "avatar"}
              className="size-7 rounded-full"
            />
          )}
          <span className="text-sm text-muted-foreground">
            {session.user?.name}
          </span>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      ) : (
        <Button size="sm" onClick={() => signIn("github")}>
          Sign in with GitHub
        </Button>
      )}
    </header>
  );
}

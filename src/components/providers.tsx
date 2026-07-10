"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Created once per browser session, not on every render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Codespace status is worth refetching fairly often since it
            // changes state on its own (starting -> available, etc.), but
            // we don't want to hammer the GitHub API either.
            staleTime: 10_000,
            refetchInterval: 15_000,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}

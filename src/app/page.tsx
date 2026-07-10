import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { CodespaceTable } from "@/components/codespaces/codespace-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {!session ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-24 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to SpaceDock
            </h1>
            <p className="max-w-md text-muted-foreground">
              Sign in with GitHub to view and manage your Codespaces from one
              dashboard.
            </p>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Codespaces</CardTitle>
            </CardHeader>
            <CardContent>
              <CodespaceTable />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

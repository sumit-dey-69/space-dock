import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { CodespaceTable } from "@/components/codespaces/codespace-table";
import { RepoList } from "@/components/repos/repo-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      <main className="mx-auto w-full max-w-7xl px-6 py-8">
        {!session ? (
          <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to SpaceDock
            </h1>
            <p className="max-w-md text-muted-foreground">
              Sign in with GitHub to view and manage your repositories and
              Codespaces from one dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* max-h caps each panel relative to the viewport (header
                height + this page's own padding) so it never forces the
                whole page to scroll — a panel shrinks to fit short content,
                and only scrolls internally once it hits that cap. */}
            <Card className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-col">
              <CardHeader className="shrink-0">
                <CardTitle>Your Repositories</CardTitle>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <RepoList />
              </CardContent>
            </Card>

            <Card className="flex max-h-[calc(100dvh-8rem)] min-h-0 flex-col">
              <CardHeader className="shrink-0">
                <CardTitle>Your Codespaces</CardTitle>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto">
                <CodespaceTable />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

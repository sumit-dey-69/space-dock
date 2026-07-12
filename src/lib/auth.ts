import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

/**
 * NextAuth v4 config.
 *
 * We use the JWT session strategy (no database adapter) because the only
 * thing we need to persist per-session is the GitHub access token, which
 * lives fine inside the encrypted JWT cookie. If we later add favorites /
 * tags / operation history (Prisma-backed), we can layer those on without
 * touching auth — they'd just be keyed by the GitHub user id from the token.
 */
export const authOptions: NextAuthOptions = {
  // In environments where the app is accessed through a proxy with a
  // dynamic hostname (GitHub Codespaces forwarded ports, Vercel preview
  // deployments, etc.), NextAuth needs to trust the incoming
  // `x-forwarded-host` / `x-forwarded-proto` headers to compute the correct
  // callback origin instead of relying on a hardcoded NEXTAUTH_URL.
  // Enabled by setting AUTH_TRUST_HOST=true in the environment — see
  // node_modules/next-auth/src/utils/detect-origin.ts for the underlying
  // logic this activates.
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          // codespace: create/manage Codespaces
          // repo: required because Codespaces are created against a repo,
          //   and to list private repos
          // delete_repo: required to delete a repository from the
          //   dashboard — a deliberately separate, higher-privilege scope
          //   GitHub requires beyond plain `repo` write access
          // read:user: basic profile info
          scope: "read:user codespace repo delete_repo",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // `account` and `profile` are only present on initial sign-in, not
      // on every request.
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (profile && "id" in profile) {
        // GitHub's numeric user id — stable even if the user renames
        // their account, unlike `login`. Used to key our own
        // per-user data (pinned repos) in the database.
        token.githubId = String((profile as { id: number }).id);
      }
      return token;
    },
    async session({ session, token }) {
      // Expose the GitHub access token to server-side code via the session,
      // so API routes can call the GitHub REST API on the user's behalf.
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.githubId;
      }
      return session;
    },
  },
  pages: {
    // Using the default NextAuth sign-in page for now. Revisit once we
    // build a branded SpaceDock sign-in screen.
  },
};

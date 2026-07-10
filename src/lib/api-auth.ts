import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GitHubApiError } from "@/lib/github";

/** Resolves the current session's GitHub access token, or returns a 401
 * Response ready to hand straight back to the caller. */
export async function requireAccessToken(): Promise<
  { accessToken: string } | { error: Response }
> {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return {
      error: Response.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  return { accessToken: session.accessToken };
}

/** Converts a GitHubApiError (or anything else) into a Response, preserving
 * the upstream status code where we have one. */
export function toErrorResponse(err: unknown): Response {
  if (err instanceof GitHubApiError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  return Response.json({ error: "Unexpected server error" }, { status: 500 });
}

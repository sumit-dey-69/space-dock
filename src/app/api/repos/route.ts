import { listRepos } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  try {
    const repos = await listRepos(auth.accessToken);
    return Response.json({ repos });
  } catch (err) {
    return toErrorResponse(err);
  }
}

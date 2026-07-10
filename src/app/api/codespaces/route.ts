import { listCodespaces } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  try {
    const codespaces = await listCodespaces(auth.accessToken);
    return Response.json({ codespaces });
  } catch (err) {
    return toErrorResponse(err);
  }
}

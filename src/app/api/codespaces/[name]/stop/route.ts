import { stopCodespace } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const { name } = await params;

  try {
    const codespace = await stopCodespace(auth.accessToken, name);
    return Response.json({ codespace });
  } catch (err) {
    return toErrorResponse(err);
  }
}

import { deleteRepo } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const { owner, repo } = await params;

  try {
    await deleteRepo(auth.accessToken, owner, repo);
    return new Response(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

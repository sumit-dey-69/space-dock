import { deleteRepo, updateRepo } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const { owner, repo } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const updated = await updateRepo(auth.accessToken, owner, repo, {
      name: typeof body.name === "string" ? body.name : undefined,
      description:
        typeof body.description === "string" ? body.description : undefined,
      private: typeof body.private === "boolean" ? body.private : undefined,
    });
    return Response.json({ repo: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

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

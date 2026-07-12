import { listRepos, createRepo } from "@/lib/github";
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

export async function POST(request: Request) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  if (!body?.name || typeof body.name !== "string") {
    return Response.json(
      { error: "A repository name is required" },
      { status: 400 }
    );
  }

  try {
    const repo = await createRepo(auth.accessToken, {
      name: body.name,
      description: typeof body.description === "string" ? body.description : undefined,
      private: Boolean(body.private),
      autoInit: Boolean(body.autoInit),
    });
    return Response.json({ repo }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

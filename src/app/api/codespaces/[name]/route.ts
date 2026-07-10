import { deleteCodespace, getCodespace } from "@/lib/github";
import { requireAccessToken, toErrorResponse } from "@/lib/api-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const { name } = await params;

  try {
    const codespace = await getCodespace(auth.accessToken, name);
    return Response.json({ codespace });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const auth = await requireAccessToken();
  if ("error" in auth) return auth.error;

  const { name } = await params;

  try {
    await deleteCodespace(auth.accessToken, name);
    return new Response(null, { status: 204 });
  } catch (err) {
    return toErrorResponse(err);
  }
}

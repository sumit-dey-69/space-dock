const GITHUB_API = "https://api.github.com";

export class GitHubApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

/** Shape of a single Codespace as returned by the GitHub REST API. Trimmed
 * to the fields SpaceDock actually uses — the real payload has more. */
export interface Codespace {
  id: number;
  name: string;
  display_name: string | null;
  state:
    | "Unknown"
    | "Created"
    | "Queued"
    | "Provisioning"
    | "Available"
    | "Awaiting"
    | "Unavailable"
    | "Deleted"
    | "Moved"
    | "Shutdown"
    | "Archived"
    | "Starting"
    | "ShuttingDown"
    | "Failed"
    | "Exporting"
    | "Updating"
    | "Rebuilding";
  repository: {
    id: number;
    full_name: string;
  };
  machine: {
    name: string;
    display_name: string;
  } | null;
  git_status: {
    ref: string;
    ahead: number;
    behind: number;
    has_unpushed_changes: boolean;
    has_uncommitted_changes: boolean;
  };
  location: string;
  idle_timeout_minutes: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  web_url: string;
}

interface ListCodespacesResponse {
  total_count: number;
  codespaces: Codespace[];
}

async function githubFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    // Codespace actions (start/stop/delete) are inherently request-time —
    // never let Next.js cache these.
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GitHubApiError(
      `GitHub API ${init?.method ?? "GET"} ${path} failed: ${res.status} ${body}`,
      res.status
    );
  }

  // 202/204 responses (accepted / no content) have no JSON body.
  if (res.status === 202 || res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function listCodespaces(accessToken: string): Promise<Codespace[]> {
  const data = await githubFetch<ListCodespacesResponse>(
    accessToken,
    "/user/codespaces?per_page=100"
  );
  return data.codespaces;
}

export async function getCodespace(
  accessToken: string,
  name: string
): Promise<Codespace> {
  return githubFetch<Codespace>(accessToken, `/user/codespaces/${name}`);
}

/** Starting a Codespace returns 200 with the Codespace body when it starts
 * synchronously, but the API treats it as a state transition — callers
 * should poll `getCodespace` afterward to see it move to `Available`. */
export async function startCodespace(
  accessToken: string,
  name: string
): Promise<Codespace> {
  return githubFetch<Codespace>(accessToken, `/user/codespaces/${name}/start`, {
    method: "POST",
  });
}

export async function stopCodespace(
  accessToken: string,
  name: string
): Promise<Codespace> {
  return githubFetch<Codespace>(accessToken, `/user/codespaces/${name}/stop`, {
    method: "POST",
  });
}

/** Delete returns 202 Accepted with an empty body. */
export async function deleteCodespace(
  accessToken: string,
  name: string
): Promise<void> {
  return githubFetch<void>(accessToken, `/user/codespaces/${name}`, {
    method: "DELETE",
  });
}

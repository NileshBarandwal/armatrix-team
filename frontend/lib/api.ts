const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  photo_url?: string;
  linkedin_url?: string;
  github_url?: string;
  order?: number;
}

export type TeamMemberInput = Omit<TeamMember, "id">;

// Railway free tier cold-starts in 15–30s. Retry up to 3 times with 30s timeout each.
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeoutMs = 30_000,
): Promise<Response> {
  let lastError: Error = new Error("Request failed");

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < retries - 1) {
        // 2s then 4s between retries
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export async function getTeam(): Promise<TeamMember[]> {
  const res = await fetchWithRetry(`${API_BASE}/team`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch team");
  return res.json();
}

export async function createMember(data: TeamMemberInput): Promise<TeamMember> {
  const res = await fetchWithRetry(`${API_BASE}/team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create member");
  return res.json();
}

export async function updateMember(
  id: string,
  data: Partial<TeamMemberInput>
): Promise<TeamMember> {
  const res = await fetchWithRetry(`${API_BASE}/team/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return res.json();
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetchWithRetry(`${API_BASE}/team/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete member");
}

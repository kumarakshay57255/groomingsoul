import { api, API_BASE_URL } from "./api";

export type TeamCategory = "leadership" | "clinical" | "associate";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  category: TeamCategory;
  bio: string | null;
  photoPath: string | null;
  isFounder: boolean;
  position: number;
};

export type AdminTeamMember = TeamMember & {
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FoundationContent = {
  founderMessage: string;
  founderQuote: string | null;
  vision: string;
  mission: string;
};

/** Resolve a photoPath to a full URL. Falls back to /team/founder.jpeg for
 *  the founder when no upload exists. */
export function teamPhotoUrl(
  m: Pick<TeamMember, "photoPath" | "isFounder">
): string | null {
  if (m.photoPath) {
    return m.photoPath.startsWith("http")
      ? m.photoPath
      : `${API_BASE_URL}${m.photoPath}`;
  }
  return m.isFounder ? "/team/founder.jpeg" : null;
}

/* ---------------- Public ---------------- */

export async function fetchTeam(): Promise<TeamMember[]> {
  const d = await api<{ ok: true; team: TeamMember[] }>("/api/team", {
    cache: "no-store",
  });
  return d.team;
}

export async function fetchFoundationContent(): Promise<FoundationContent> {
  const d = await api<{ ok: true; content: FoundationContent }>(
    "/api/foundation-content",
    { cache: "no-store" }
  );
  return d.content;
}

/* ---------------- Admin ---------------- */

export async function fetchAdminTeam(
  includeArchived = true
): Promise<AdminTeamMember[]> {
  const qs = includeArchived ? "?archived=1" : "";
  const d = await api<{ ok: true; team: AdminTeamMember[] }>(
    `/api/admin/team${qs}`,
    { cache: "no-store" }
  );
  return d.team;
}

export async function createTeamMember(form: FormData): Promise<AdminTeamMember> {
  const d = await api<{ ok: true; member: AdminTeamMember }>(
    "/api/admin/team",
    { method: "POST", body: form }
  );
  return d.member;
}

export async function updateTeamMember(
  id: string,
  form: FormData
): Promise<AdminTeamMember> {
  const d = await api<{ ok: true; member: AdminTeamMember }>(
    `/api/admin/team/${encodeURIComponent(id)}`,
    { method: "PATCH", body: form }
  );
  return d.member;
}

export async function archiveTeamMember(
  id: string,
  archived: boolean
): Promise<AdminTeamMember> {
  const d = await api<{ ok: true; member: AdminTeamMember }>(
    `/api/admin/team/${encodeURIComponent(id)}/archive`,
    { method: "POST", body: { archived } }
  );
  return d.member;
}

export async function deleteTeamMember(id: string): Promise<void> {
  await api(`/api/admin/team/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function updateFoundationContent(
  patch: Partial<FoundationContent>
): Promise<FoundationContent> {
  const d = await api<{ ok: true; content: FoundationContent }>(
    "/api/admin/foundation-content",
    { method: "PATCH", body: patch as Record<string, unknown> }
  );
  return d.content;
}

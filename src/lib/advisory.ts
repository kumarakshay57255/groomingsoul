import { api, API_BASE_URL } from "./api";

export type AdvisoryMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photoPath: string | null;
  position: number;
};

export type AdminAdvisoryMember = AdvisoryMember & {
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export function advisoryPhotoUrl(
  m: Pick<AdvisoryMember, "photoPath">
): string | null {
  if (!m.photoPath) return null;
  return m.photoPath.startsWith("http")
    ? m.photoPath
    : `${API_BASE_URL}${m.photoPath}`;
}

/* ---------------- Public ---------------- */

export async function fetchAdvisory(): Promise<AdvisoryMember[]> {
  const d = await api<{ ok: true; advisory: AdvisoryMember[] }>(
    "/api/advisory",
    { cache: "no-store" }
  );
  return d.advisory;
}

/* ---------------- Admin ---------------- */

export async function fetchAdminAdvisory(
  includeArchived = true
): Promise<AdminAdvisoryMember[]> {
  const qs = includeArchived ? "?archived=1" : "";
  const d = await api<{ ok: true; advisory: AdminAdvisoryMember[] }>(
    `/api/admin/advisory${qs}`,
    { cache: "no-store" }
  );
  return d.advisory;
}

export async function createAdvisoryMember(
  form: FormData
): Promise<AdminAdvisoryMember> {
  const d = await api<{ ok: true; member: AdminAdvisoryMember }>(
    "/api/admin/advisory",
    { method: "POST", body: form }
  );
  return d.member;
}

export async function updateAdvisoryMember(
  id: string,
  form: FormData
): Promise<AdminAdvisoryMember> {
  const d = await api<{ ok: true; member: AdminAdvisoryMember }>(
    `/api/admin/advisory/${encodeURIComponent(id)}`,
    { method: "PATCH", body: form }
  );
  return d.member;
}

export async function archiveAdvisoryMember(
  id: string,
  archived: boolean
): Promise<AdminAdvisoryMember> {
  const d = await api<{ ok: true; member: AdminAdvisoryMember }>(
    `/api/admin/advisory/${encodeURIComponent(id)}/archive`,
    { method: "POST", body: { archived } }
  );
  return d.member;
}

export async function deleteAdvisoryMember(id: string): Promise<void> {
  await api(`/api/admin/advisory/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

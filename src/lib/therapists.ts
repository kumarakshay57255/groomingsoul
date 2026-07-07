import { api, API_BASE_URL } from "./api";

export type Therapist = {
  id: string;
  name: string;
  designation: string;
  yearsExperience: number;
  languages: string[];
  specializations: string[];
  bio: string | null;
  photoPath: string | null;
  acceptingNew: boolean;
  position: number;
};

export type AdminTherapist = Therapist & {
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Standard specialisation chips used by filters + the admin form. */
export const therapistSpecializations = [
  "Anxiety",
  "Depression",
  "Relationships",
  "Trauma",
  "Stress & Burnout",
  "Adolescents",
  "Career & Work",
  "Family",
  "Grief",
  "Self-esteem",
];

/** Absolute URL for a server-relative photo path (e.g. /uploads/...). */
export function therapistPhotoUrl(t: Pick<Therapist, "photoPath">): string | null {
  if (!t.photoPath) return null;
  if (t.photoPath.startsWith("http")) return t.photoPath;
  return `${API_BASE_URL}${t.photoPath}`;
}

/** Public — used by /therapy */
export async function fetchTherapists(): Promise<Therapist[]> {
  const d = await api<{ ok: true; therapists: Therapist[] }>(
    "/api/therapists",
    { cache: "no-store" }
  );
  return d.therapists;
}

/** Admin — list with archived included when ?archived=1 */
export async function fetchAdminTherapists(
  includeArchived = true
): Promise<AdminTherapist[]> {
  const qs = includeArchived ? "?archived=1" : "";
  const d = await api<{ ok: true; therapists: AdminTherapist[] }>(
    `/api/admin/therapists${qs}`,
    { cache: "no-store" }
  );
  return d.therapists;
}

export async function createTherapist(form: FormData): Promise<AdminTherapist> {
  const d = await api<{ ok: true; therapist: AdminTherapist }>(
    "/api/admin/therapists",
    { method: "POST", body: form }
  );
  return d.therapist;
}

export async function updateTherapist(
  id: string,
  form: FormData
): Promise<AdminTherapist> {
  const d = await api<{ ok: true; therapist: AdminTherapist }>(
    `/api/admin/therapists/${encodeURIComponent(id)}`,
    { method: "PATCH", body: form }
  );
  return d.therapist;
}

export async function archiveTherapist(
  id: string,
  archived: boolean
): Promise<AdminTherapist> {
  const d = await api<{ ok: true; therapist: AdminTherapist }>(
    `/api/admin/therapists/${encodeURIComponent(id)}/archive`,
    { method: "POST", body: { archived } }
  );
  return d.therapist;
}

import { api, API_BASE_URL } from "./api";

export type Achievement = {
  id: string;
  title: string;
  year: string | null;
  tag: string | null;
  description: string | null;
  imagePath: string | null;
  position: number;
};

export type AdminAchievement = Achievement & {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export function achievementImageUrl(
  a: Pick<Achievement, "imagePath">
): string | null {
  if (!a.imagePath) return null;
  return a.imagePath.startsWith("http")
    ? a.imagePath
    : `${API_BASE_URL}${a.imagePath}`;
}

/* ---------------- Public ---------------- */

export async function fetchAchievements(): Promise<Achievement[]> {
  const d = await api<{ ok: true; achievements: Achievement[] }>(
    "/api/achievements",
    { cache: "no-store" }
  );
  return d.achievements;
}

/* ---------------- Admin ---------------- */

export async function fetchAdminAchievements(): Promise<AdminAchievement[]> {
  const d = await api<{ ok: true; achievements: AdminAchievement[] }>(
    "/api/admin/achievements",
    { cache: "no-store" }
  );
  return d.achievements;
}

export async function createAchievement(
  form: FormData
): Promise<AdminAchievement> {
  const d = await api<{ ok: true; achievement: AdminAchievement }>(
    "/api/admin/achievements",
    { method: "POST", body: form }
  );
  return d.achievement;
}

export async function updateAchievement(
  id: string,
  form: FormData
): Promise<AdminAchievement> {
  const d = await api<{ ok: true; achievement: AdminAchievement }>(
    `/api/admin/achievements/${encodeURIComponent(id)}`,
    { method: "PATCH", body: form }
  );
  return d.achievement;
}

export async function deleteAchievement(id: string): Promise<void> {
  await api(`/api/admin/achievements/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

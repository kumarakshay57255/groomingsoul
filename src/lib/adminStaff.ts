import { api } from "./api";

export type StaffRole = "admin" | "intern";

export const STAFF_ROLES: StaffRole[] = ["admin", "intern"];

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  intern: "Intern",
};

export type AdminStaffMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAdminStaff(opts: {
  role?: StaffRole;
  q?: string;
} = {}): Promise<AdminStaffMember[]> {
  const qs = new URLSearchParams();
  if (opts.role) qs.set("role", opts.role);
  if (opts.q) qs.set("q", opts.q);
  const url = `/api/admin/staff${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; staff: AdminStaffMember[] }>(url, {
    cache: "no-store",
  });
  return d.staff;
}

export async function inviteStaff(input: {
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  password?: string;
}): Promise<{ staff: AdminStaffMember; devTempPassword?: string }> {
  const d = await api<{
    ok: true;
    staff: AdminStaffMember;
    devTempPassword?: string;
  }>("/api/admin/staff", { method: "POST", body: input });
  return { staff: d.staff, devTempPassword: d.devTempPassword };
}

export async function updateStaff(
  id: string,
  patch: { role?: StaffRole; isActive?: boolean; name?: string; phone?: string }
): Promise<AdminStaffMember> {
  const d = await api<{ ok: true; staff: AdminStaffMember }>(
    `/api/admin/staff/${encodeURIComponent(id)}`,
    { method: "PATCH", body: patch as Record<string, unknown> }
  );
  return d.staff;
}

export async function deleteStaff(id: string): Promise<void> {
  await api(`/api/admin/staff/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

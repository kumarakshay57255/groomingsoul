import { api } from "./api";

export type LeadStatus = "new" | "contacted" | "scheduled" | "closed";

export type AdminLead = {
  id: string;
  therapistId: string | null;
  therapistName: string | null;
  name: string;
  age: number;
  phone: string;
  email: string;
  slot: string;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "scheduled",
  "closed",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  closed: "Closed",
};

export async function fetchAdminLeads(opts: {
  status?: LeadStatus;
  q?: string;
} = {}): Promise<AdminLead[]> {
  const qs = new URLSearchParams();
  if (opts.status) qs.set("status", opts.status);
  if (opts.q) qs.set("q", opts.q);
  const url = `/api/admin/leads${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; leads: AdminLead[] }>(url, {
    cache: "no-store",
  });
  return d.leads;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; notes?: string | null }
): Promise<AdminLead> {
  const d = await api<{ ok: true; lead: AdminLead }>(
    `/api/admin/leads/${encodeURIComponent(id)}`,
    { method: "PATCH", body: patch as Record<string, unknown> }
  );
  return d.lead;
}

export async function deleteLead(id: string): Promise<void> {
  await api(`/api/admin/leads/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

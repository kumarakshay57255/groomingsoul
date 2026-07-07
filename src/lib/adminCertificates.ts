import { api } from "./api";

export type CertStatus = "queued" | "printed" | "dispatched" | "delivered";

export const CERT_STATUSES: CertStatus[] = [
  "queued",
  "printed",
  "dispatched",
  "delivered",
];

export const CERT_STATUS_LABELS: Record<CertStatus, string> = {
  queued: "Queued",
  printed: "Printed",
  dispatched: "Dispatched",
  delivered: "Delivered",
};

export type AdminCertificate = {
  id: string;
  status: CertStatus;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingAddress: string | null;
  courierTracking: string | null;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  course: {
    id: string;
    slug: string;
    title: string;
    type: "academy" | "diploma";
  } | null;
};

export async function fetchAdminCertificates(
  status?: CertStatus
): Promise<AdminCertificate[]> {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  const url = `/api/admin/certificates${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; certificates: AdminCertificate[] }>(url, {
    cache: "no-store",
  });
  return d.certificates;
}

export async function markCertificate(
  id: string,
  patch: {
    status: CertStatus;
    shippingAddress?: string;
    courierTracking?: string;
  }
): Promise<AdminCertificate> {
  const d = await api<{ ok: true; certificate: AdminCertificate }>(
    `/api/admin/certificates/${encodeURIComponent(id)}/mark`,
    { method: "POST", body: patch as Record<string, unknown> }
  );
  return d.certificate;
}

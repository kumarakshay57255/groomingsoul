import { api, API_BASE_URL } from "./api";
import type { CourseCategory, CourseType } from "./courses";

export type PurchaseAdminStatus =
  | "pending_verification"
  | "active"
  | "expired"
  | "rejected";

export const PURCHASE_STATUSES: PurchaseAdminStatus[] = [
  "pending_verification",
  "active",
  "expired",
  "rejected",
];

export const PURCHASE_STATUS_LABELS: Record<PurchaseAdminStatus, string> = {
  pending_verification: "Pending",
  active: "Active",
  expired: "Expired",
  rejected: "Rejected",
};

export type AdminPurchase = {
  id: string;
  status: PurchaseAdminStatus;
  pricePaidInr: number | null;
  receiptImagePath: string | null;
  payerName: string | null;
  payerPhone: string | null;
  payerEmail: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  adminNote: string | null;
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
    type: CourseType;
    category?: CourseCategory;
    validityDays: number;
    priceInr: number;
  } | null;
};

export function receiptUrl(p: Pick<AdminPurchase, "receiptImagePath">): string | null {
  if (!p.receiptImagePath) return null;
  if (p.receiptImagePath.startsWith("http")) return p.receiptImagePath;
  return `${API_BASE_URL}${p.receiptImagePath}`;
}

export async function fetchAdminPurchases(
  status?: PurchaseAdminStatus
): Promise<AdminPurchase[]> {
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  const url = `/api/admin/purchases${qs.toString() ? `?${qs}` : ""}`;
  const d = await api<{ ok: true; purchases: AdminPurchase[] }>(url, {
    cache: "no-store",
  });
  return d.purchases;
}

export async function approvePurchase(
  id: string,
  note?: string
): Promise<AdminPurchase> {
  const d = await api<{ ok: true; purchase: AdminPurchase }>(
    `/api/admin/purchases/${encodeURIComponent(id)}/approve`,
    { method: "POST", body: note ? { note } : {} }
  );
  return d.purchase;
}

export async function rejectPurchase(
  id: string,
  note?: string
): Promise<AdminPurchase> {
  const d = await api<{ ok: true; purchase: AdminPurchase }>(
    `/api/admin/purchases/${encodeURIComponent(id)}/reject`,
    { method: "POST", body: note ? { note } : {} }
  );
  return d.purchase;
}

export function formatInr(rupees: number | null | undefined): string {
  if (rupees == null) return "—";
  return `₹${rupees.toLocaleString("en-IN")}`;
}

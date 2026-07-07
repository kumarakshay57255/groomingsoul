import { api } from "./api";

export type AdminStats = {
  pendingPurchases: number;
  activePurchases: number;
  expiringSoon: number;
  leads7d: number;
  leadsToday: number;
  testSubs7d: number;
  testSubsPendingReview: number;
  certificateQueueOpen: number;
  totalStudents: number;
  activeCourses: number;
  diplomaCourses: number;
  revenue30d: number;
};

export type AdminRecent = {
  leads: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: "new" | "contacted" | "scheduled" | "closed";
    createdAt: string;
  }[];
  purchases: {
    id: string;
    status: string;
    pricePaidInr: number | null;
    payerName: string | null;
    createdAt: string;
    courseTitle: string | null;
  }[];
};

export async function fetchAdminStats(): Promise<{
  stats: AdminStats;
  recent: AdminRecent;
}> {
  const d = await api<{ ok: true; stats: AdminStats; recent: AdminRecent }>(
    "/api/admin/stats",
    { cache: "no-store" }
  );
  return { stats: d.stats, recent: d.recent };
}

export function formatInr(rupees: number | null | undefined): string {
  if (rupees == null) return "—";
  return `₹${rupees.toLocaleString("en-IN")}`;
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

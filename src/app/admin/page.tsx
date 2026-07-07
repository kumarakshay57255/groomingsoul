"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock4,
  Loader2,
  RefreshCw,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  TimerReset,
  TrendingUp,
  Truck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import {
  fetchAdminStats,
  formatInr,
  relativeTime,
  type AdminStats,
  type AdminRecent,
} from "@/lib/adminApi";

export default function AdminHome() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AdminRecent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setRefreshing(true);
    setError(null);
    try {
      const { stats, recent } = await fetchAdminStats();
      setStats(stats);
      setRecent(recent);
    } catch {
      setError("Couldn't load dashboard stats.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Realtime snapshot of operations — pending receipts, leads, certificates, and live courses."
        actions={
          <button
            type="button"
            onClick={load}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown disabled:opacity-60"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {loading && (
        <div className="mt-8 inline-flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 size={14} className="animate-spin" /> Loading stats…
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-coral/40 bg-coral-soft/40 p-4 text-sm text-brand-brown">
          {error}
        </div>
      )}

      {stats && (
        <>
          {/* ---- Action queue (urgent) ---- */}
          <section className="mt-8">
            <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Action queue
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                href="/admin/purchases?status=pending_verification"
                label="Receipts to verify"
                value={stats.pendingPurchases}
                icon={Wallet}
                tone="warn"
                hint="Approve or reject pending QR-payment receipts."
              />
              <Kpi
                href="/admin/leads?status=new"
                label="New therapy leads"
                value={stats.leadsToday}
                icon={ClipboardList}
                tone="accent"
                hint={`${stats.leads7d} in the last 7 days.`}
              />
              <Kpi
                href="/admin/tests?status=pending"
                label="Tests pending review"
                value={stats.testSubsPendingReview}
                icon={Stethoscope}
                tone="accent"
                hint={`${stats.testSubs7d} new in the last 7 days.`}
              />
              <Kpi
                href="/admin/certificates?status=queued"
                label="Certificates to dispatch"
                value={stats.certificateQueueOpen}
                icon={Truck}
                tone="warn"
                hint="Queued + printed, awaiting courier."
              />
            </div>
          </section>

          {/* ---- Health metrics ---- */}
          <section className="mt-8">
            <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Foundation health
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                label="Active enrolments"
                value={stats.activePurchases}
                icon={ShieldCheck}
                tone="success"
              />
              <Kpi
                label="Expiring in ≤ 7 days"
                value={stats.expiringSoon}
                icon={TimerReset}
                tone={stats.expiringSoon > 0 ? "warn" : "muted"}
              />
              <Kpi
                label="Total students"
                value={stats.totalStudents}
                icon={Users}
                tone="muted"
              />
              <Kpi
                label="Revenue · last 30 days"
                value={formatInr(stats.revenue30d)}
                icon={TrendingUp}
                tone="success"
              />
            </div>
          </section>

          {/* ---- Catalogue snapshot ---- */}
          <section className="mt-8">
            <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Catalogue
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi
                href="/admin/courses"
                label="Published courses"
                value={stats.activeCourses}
                icon={ScrollText}
                tone="muted"
              />
              <Kpi
                href="/admin/courses?type=diploma"
                label="Diplomas (printed certs)"
                value={stats.diplomaCourses}
                icon={Truck}
                tone="muted"
              />
              <Kpi
                href="/admin/staff"
                label="Invite staff"
                value="→"
                icon={UserPlus}
                tone="muted"
                hint="Add admin / intern / dispatch users."
              />
              <Kpi
                href="/admin/courses?new=1"
                label="New course"
                value="→"
                icon={ShieldAlert}
                tone="muted"
                hint="Add a new course with modules & lessons."
              />
            </div>
          </section>

          {/* ---- Recent activity ---- */}
          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <ActivityList
              title="Recent leads"
              empty="No leads yet."
              href="/admin/leads"
              rows={
                recent?.leads.map((l) => ({
                  id: l.id,
                  primary: l.name,
                  secondary: l.email,
                  meta: l.status,
                  time: l.createdAt,
                })) ?? []
              }
            />
            <ActivityList
              title="Recent purchases"
              empty="No purchases yet."
              href="/admin/purchases"
              rows={
                recent?.purchases.map((p) => ({
                  id: p.id,
                  primary: p.payerName ?? "—",
                  secondary: p.courseTitle ?? "—",
                  meta: p.status,
                  time: p.createdAt,
                  trailing: formatInr(p.pricePaidInr),
                })) ?? []
              }
            />
          </section>
        </>
      )}
    </>
  );
}

type Tone = "warn" | "success" | "accent" | "muted";
const toneClasses: Record<
  Tone,
  { tile: string; icon: string; value: string }
> = {
  warn: {
    tile: "border-coral/30 bg-coral-soft/40 hover:border-coral/60",
    icon: "text-coral",
    value: "text-brand-brown",
  },
  success: {
    tile: "border-sage/40 bg-sage-soft/30 hover:border-sage/60",
    icon: "text-sage-deep",
    value: "text-brand-brown",
  },
  accent: {
    tile: "border-clinical/30 bg-clinical-soft/40 hover:border-clinical/60",
    icon: "text-clinical-deep",
    value: "text-brand-brown",
  },
  muted: {
    tile: "border-line bg-cream hover:border-brand-brown/30",
    icon: "text-brand-brown/60",
    value: "text-brand-brown",
  },
};

function Kpi({
  label,
  value,
  icon: Icon,
  tone = "muted",
  hint,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone?: Tone;
  hint?: string;
  href?: string;
}) {
  const styles = toneClasses[tone];
  const body = (
    <div
      className={`relative h-full rounded-2xl border p-4 transition-colors ${styles.tile}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-soft">
          {label}
        </span>
        <Icon size={16} className={styles.icon} />
      </div>
      <div className={`mt-3 font-display text-3xl ${styles.value}`}>{value}</div>
      {hint && (
        <p className="mt-1 text-[0.72rem] leading-snug text-ink-soft">{hint}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function ActivityList({
  title,
  rows,
  empty,
  href,
}: {
  title: string;
  rows: {
    id: string;
    primary: string;
    secondary: string;
    meta: string;
    time: string;
    trailing?: string;
  }[];
  empty: string;
  href: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-cream">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-medium text-brand-brown">{title}</h3>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[0.72rem] uppercase tracking-[0.14em] text-ink-soft hover:text-brand-brown"
        >
          View all <ArrowRight size={11} />
        </Link>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-ink-soft">
          {empty}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-brand-brown">
                  {r.primary}
                </div>
                <div className="truncate text-[0.78rem] text-ink-soft">
                  {r.secondary}
                </div>
              </div>
              <div className="text-right text-[0.72rem] tabular-nums">
                {r.trailing && (
                  <div className="font-medium text-brand-brown">{r.trailing}</div>
                )}
                <div className="text-ink-soft">
                  <Clock4 size={9} className="inline opacity-60" />{" "}
                  {relativeTime(r.time)}
                </div>
                <div className="mt-0.5 inline-block rounded-full bg-cream-deep px-2 py-0.5 text-[0.62rem] uppercase tracking-wider text-brand-brown">
                  {r.meta}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

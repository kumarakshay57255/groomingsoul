"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Library,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PurchaseCard } from "@/components/PurchaseCard";
import { useAuth } from "@/lib/auth";
import {
  fetchMyPurchases,
  type PurchaseStatus,
  type PurchaseSummary,
} from "@/lib/dashboard";

const STATUS_ORDER: PurchaseStatus[] = [
  "active",
  "pending_verification",
  "expired",
  "rejected",
];

const STATUS_HEADINGS: Record<PurchaseStatus, string> = {
  active: "Active courses",
  pending_verification: "Awaiting verification",
  expired: "Expired",
  rejected: "Rejected receipts",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [purchases, setPurchases] = useState<PurchaseSummary[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Auth gate */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, user, router]);

  async function load() {
    setRefreshing(true);
    setError(null);
    try {
      const list = await fetchMyPurchases();
      setPurchases(list);
    } catch {
      setError("Couldn't load your purchases — please refresh.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (authLoading || !user) {
    return (
      <>
        <Nav />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex items-center gap-2 text-ink-soft">
            <Loader2 size={16} className="animate-spin" />
            Loading…
          </div>
        </main>
      </>
    );
  }

  const grouped: Record<PurchaseStatus, PurchaseSummary[]> = {
    active: [],
    pending_verification: [],
    expired: [],
    rejected: [],
  };
  (purchases ?? []).forEach((p) => grouped[p.status].push(p));

  const totalActive = grouped.active.length;
  const totalPending = grouped.pending_verification.length;
  const totalAll = purchases?.length ?? 0;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-32 left-1/3 h-[24rem] w-[24rem] rounded-full bg-coral-soft/45 blur-3xl animate-breathe" />
            <div className="absolute inset-0 bg-grain opacity-40" />
          </div>

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
                  Welcome back
                </p>
                <h1 className="mt-2 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
                  Hi, <span className="italic">{user.name}</span>.
                </h1>
                <p className="mt-3 max-w-xl text-pretty text-ink-soft">
                  Pick up where you left off, finish a course to unlock your
                  hardcopy certificate, or explore something new.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={load}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown disabled:opacity-60"
                >
                  <RefreshCw
                    size={12}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-4 py-2 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
              <StatCell
                label="Active courses"
                value={totalActive}
                icon={<ShieldCheck size={16} className="text-sage-deep" />}
              />
              <StatCell
                label="Awaiting verification"
                value={totalPending}
                icon={<Sparkles size={16} className="text-sun" />}
              />
              <StatCell
                label="Total purchases"
                value={totalAll}
                icon={<Library size={16} className="text-brand-brown/60" />}
              />
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-coral/40 bg-coral-soft/40 p-4 text-sm text-brand-brown">
                {error}
              </div>
            )}

            {purchases === null ? (
              <div className="flex items-center gap-2 text-ink-soft">
                <Loader2 size={16} className="animate-spin" /> Loading your
                purchases…
              </div>
            ) : purchases.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-12">
                {STATUS_ORDER.map((status) => {
                  const items = grouped[status];
                  if (items.length === 0) return null;
                  return (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h2 className="font-display text-2xl text-brand-brown">
                        {STATUS_HEADINGS[status]}{" "}
                        <span className="text-base text-ink-soft">
                          ({items.length})
                        </span>
                      </h2>
                      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((p) => (
                          <PurchaseCard key={p.id} purchase={p} />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

function StatCell({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-cream px-6 py-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-sage-deep">
          {label}
        </span>
        {icon}
      </div>
      <div className="mt-2 font-display text-3xl text-brand-brown sm:text-4xl">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-line bg-cream-deep/40 px-8 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cream text-brand-brown">
        <GraduationCap size={24} strokeWidth={1.6} />
      </div>
      <h2 className="mt-5 font-display text-3xl text-brand-brown">
        No purchases yet.
      </h2>
      <p className="mt-3 text-pretty text-ink-soft">
        Once you buy a course and our team verifies your payment, it&apos;ll
        appear here — with a countdown to expiry and your progress.
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link
          href="/academy"
          className="inline-flex items-center justify-center rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
        >
          Browse the Academy
        </Link>
        <Link
          href="/diploma"
          className="inline-flex items-center justify-center rounded-full border border-brand-brown/25 bg-cream px-6 py-3 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
        >
          See Diplomas
        </Link>
      </div>
    </div>
  );
}

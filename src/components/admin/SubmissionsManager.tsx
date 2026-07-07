"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  AdminSubmissionSummary,
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
  fetchAdminSubmissions,
} from "@/lib/adminTests";
import { tests } from "@/lib/tests";
import { relativeTime } from "@/lib/adminApi";

const STATUS_TONE: Record<ReviewStatus, string> = {
  pending: "bg-sun/30 text-brand-brown",
  in_review: "bg-clinical-soft/55 text-clinical-deep",
  completed: "bg-sage-soft/55 text-sage-deep",
};

export function SubmissionsManager({
  initialStatus,
}: {
  initialStatus?: ReviewStatus;
}) {
  const [items, setItems] = useState<AdminSubmissionSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>(
    initialStatus ?? "all"
  );
  const [testFilter, setTestFilter] = useState<string>("all");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const opts: { status?: ReviewStatus; testSlug?: string } = {};
      if (statusFilter !== "all") opts.status = statusFilter;
      if (testFilter !== "all") opts.testSlug = testFilter;
      setItems(await fetchAdminSubmissions(opts));
    } catch {
      setError("Couldn't load submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, testFilter]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((s) =>
      `${s.identity.name} ${s.identity.email} ${s.identity.phone} ${s.testName}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const totals = useMemo(() => {
    const t = { pending: 0, in_review: 0, completed: 0 } as Record<
      ReviewStatus,
      number
    >;
    (items ?? []).forEach((s) => {
      t[s.reviewStatus] += 1;
    });
    return t;
  }, [items]);

  return (
    <>
      {error && (
        <div className="mt-4 rounded-2xl border border-coral/40 bg-coral-soft/40 p-3 text-sm text-brand-brown">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, test…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={testFilter}
            onChange={(e) => setTestFilter(e.target.value)}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm outline-none focus:border-clinical"
          >
            <option value="all">All tests</option>
            {tests.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.shortName}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Status pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill
          label="All"
          count={items?.length ?? 0}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {REVIEW_STATUSES.map((s) => (
          <StatusPill
            key={s}
            label={REVIEW_STATUS_LABELS[s]}
            count={totals[s] ?? 0}
            active={statusFilter === s}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No submissions match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-3 py-3">Test</th>
                <th className="px-3 py-3">Items</th>
                <th className="px-3 py-3">Review</th>
                <th className="px-3 py-3">Received</th>
                <th className="px-3 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="align-middle hover:bg-cream-deep/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-brown">
                      {s.identity.name}
                    </div>
                    <div className="text-[0.7rem] text-ink-soft">
                      {s.identity.email}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{s.testName}</td>
                  <td className="px-3 py-3 tabular-nums text-ink-soft">
                    {s.answerCount}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.7rem] ${STATUS_TONE[s.reviewStatus]}`}
                    >
                      {REVIEW_STATUS_LABELS[s.reviewStatus]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[0.78rem] text-ink-soft">
                    {relativeTime(s.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <Link
                      href={`/admin/tests/${s.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-line bg-cream px-2.5 py-1 text-[0.72rem] text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
                    >
                      Open <ArrowUpRight size={11} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function StatusPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.78rem] transition-colors ${
        active
          ? "border-brand-brown bg-brand-brown text-cream"
          : "border-line bg-cream text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.62rem] ${
          active ? "bg-cream/15 text-cream/85" : "bg-cream-deep text-brand-brown/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

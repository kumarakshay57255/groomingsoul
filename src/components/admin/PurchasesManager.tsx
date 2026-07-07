"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCopy,
  Eye,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminPurchase,
  PURCHASE_STATUSES,
  PURCHASE_STATUS_LABELS,
  type PurchaseAdminStatus,
  approvePurchase,
  fetchAdminPurchases,
  formatInr,
  receiptUrl,
  rejectPurchase,
} from "@/lib/adminPurchases";
import { relativeTime } from "@/lib/adminApi";

const STATUS_TONE: Record<PurchaseAdminStatus, string> = {
  pending_verification: "bg-sun/35 text-brand-brown",
  active: "bg-sage-soft/55 text-sage-deep",
  expired: "bg-brand-brown/15 text-brand-brown",
  rejected: "bg-coral-soft/55 text-coral",
};

export function PurchasesManager({
  initialStatus,
}: {
  initialStatus?: PurchaseAdminStatus;
}) {
  const [items, setItems] = useState<AdminPurchase[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | PurchaseAdminStatus
  >(initialStatus ?? "all");
  const [openPurchase, setOpenPurchase] = useState<AdminPurchase | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(
        await fetchAdminPurchases(
          statusFilter === "all" ? undefined : statusFilter
        )
      );
    } catch {
      setError("Couldn't load purchases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter((p) =>
      `${p.payerName ?? ""} ${p.payerEmail ?? ""} ${p.payerPhone ?? ""} ${p.course?.title ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const totals = useMemo(() => {
    const t = {
      pending_verification: 0,
      active: 0,
      expired: 0,
      rejected: 0,
    } as Record<PurchaseAdminStatus, number>;
    (items ?? []).forEach((p) => {
      t[p.status] += 1;
    });
    return t;
  }, [items]);

  function patchItem(updated: AdminPurchase) {
    setItems((arr) =>
      arr?.map((x) => (x.id === updated.id ? updated : x)) ?? null
    );
    setOpenPurchase(updated);
  }

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
            placeholder="Search payer, email, phone, course…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill
          label="All"
          count={items?.length ?? 0}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {PURCHASE_STATUSES.map((s) => (
          <StatusPill
            key={s}
            label={PURCHASE_STATUS_LABELS[s]}
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
            No purchases match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-3 py-3">Payer</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Received</th>
                <th className="px-3 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((p) => {
                const ru = receiptUrl(p);
                return (
                  <tr
                    key={p.id}
                    onClick={() => setOpenPurchase(p)}
                    className="cursor-pointer align-middle hover:bg-cream-deep/30"
                  >
                    <td className="px-4 py-3">
                      {ru ? (
                        <div className="relative h-12 w-12 overflow-hidden rounded-md border border-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ru}
                            alt="Receipt thumb"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-md border border-dashed border-line text-[0.65rem] text-ink-soft">
                          none
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-brand-brown">
                        {p.payerName ?? "—"}
                      </div>
                      <div className="text-[0.7rem] text-ink-soft">
                        {p.payerEmail ?? p.user?.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">
                      {p.course?.title ?? "(deleted course)"}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-ink">
                      {formatInr(p.pricePaidInr)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.7rem] ${STATUS_TONE[p.status]}`}
                      >
                        {PURCHASE_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[0.78rem] text-ink-soft">
                      {relativeTime(p.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <span className="inline-flex items-center gap-1 rounded-md border border-line bg-cream px-2 py-1 text-[0.7rem] text-brand-brown">
                        <Eye size={11} /> Open
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {openPurchase && (
        <PurchaseDrawer
          purchase={openPurchase}
          onClose={() => setOpenPurchase(null)}
          onUpdated={patchItem}
        />
      )}
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

/* ---------------- Drawer ---------------- */

function PurchaseDrawer({
  purchase,
  onClose,
  onUpdated,
}: {
  purchase: AdminPurchase;
  onClose: () => void;
  onUpdated: (p: AdminPurchase) => void;
}) {
  const [note, setNote] = useState(purchase.adminNote ?? "");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setNote(purchase.adminNote ?? "");
    setError(null);
  }, [purchase.id, purchase.adminNote]);

  const ru = receiptUrl(purchase);

  async function approve() {
    setBusy("approve");
    setError(null);
    try {
      const updated = await approvePurchase(purchase.id, note || undefined);
      onUpdated(updated);
      setToast("Approved — course unlocked");
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Approve failed");
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (!note.trim()) {
      if (
        !confirm(
          "Reject this purchase without a note? The student won't know why it was rejected."
        )
      )
        return;
    }
    setBusy("reject");
    setError(null);
    try {
      const updated = await rejectPurchase(purchase.id, note || undefined);
      onUpdated(updated);
      setToast("Rejected");
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reject failed");
    } finally {
      setBusy(null);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setToast("Copied");
      setTimeout(() => setToast(null), 1200);
    });
  }

  const formatDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "—";

  const canAct = purchase.status === "pending_verification";

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col bg-cream shadow-[-30px_0_60px_-30px_rgba(92,58,46,0.4)]">
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Receipt verification
            </p>
            <h2 className="mt-1 truncate font-display text-2xl text-brand-brown">
              {purchase.payerName ?? "—"}
            </h2>
            <p className="text-[0.78rem] text-ink-soft">
              {purchase.course?.title ?? "(deleted course)"} ·{" "}
              {formatInr(purchase.pricePaidInr)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft hover:bg-cream-deep"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Receipt preview */}
          <div className="rounded-2xl border border-line bg-cream-deep/40 p-3">
            <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Uploaded receipt
            </div>
            {ru ? (
              <a
                href={ru}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block overflow-hidden rounded-xl border border-line bg-cream"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ru}
                  alt="Receipt"
                  className="block h-auto w-full object-contain"
                />
              </a>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">No receipt uploaded.</p>
            )}
            {ru && (
              <p className="mt-2 break-all font-mono text-[0.7rem] text-ink-soft">
                {purchase.receiptImagePath}
              </p>
            )}
          </div>

          {/* Payer details */}
          <div className="space-y-3">
            <h3 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Payer details
            </h3>
            {purchase.payerEmail && (
              <ContactRow
                href={`mailto:${purchase.payerEmail}`}
                icon={<Mail size={12} className="text-clinical" />}
                value={purchase.payerEmail}
                onCopy={() => copy(purchase.payerEmail!)}
              />
            )}
            {purchase.payerPhone && (
              <ContactRow
                href={`tel:${purchase.payerPhone}`}
                icon={<Phone size={12} className="text-clinical" />}
                value={purchase.payerPhone}
                onCopy={() => copy(purchase.payerPhone!)}
              />
            )}
            {purchase.user && (
              <p className="text-[0.78rem] text-ink-soft">
                Account holder:{" "}
                <span className="text-ink">{purchase.user.name}</span> ·{" "}
                {purchase.user.email}
              </p>
            )}
          </div>

          {/* Status + dates */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-cream p-4 text-sm">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Status
              </div>
              <div className="mt-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.78rem] ${STATUS_TONE[purchase.status]}`}
                >
                  {PURCHASE_STATUS_LABELS[purchase.status]}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Validity
              </div>
              <div className="mt-1 text-ink">
                {purchase.course?.validityDays ?? "—"} days
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Activated
              </div>
              <div className="mt-1 text-ink-soft">
                {formatDate(purchase.activatedAt)}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Expires
              </div>
              <div className="mt-1 text-ink-soft">
                {formatDate(purchase.expiresAt)}
              </div>
            </div>
          </div>

          {/* Admin note */}
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Admin note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="UPI reference, why rejected, etc."
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
            {!canAct && purchase.adminNote && (
              <p className="mt-2 text-[0.78rem] text-ink-soft">
                Saved note:&nbsp;
                <span className="text-ink">{purchase.adminNote}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </p>
          )}
          {toast && (
            <p className="rounded-xl border border-sage/40 bg-sage-soft/40 px-3 py-2 text-sm text-sage-deep">
              {toast}
            </p>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-3 border-t border-line bg-cream-deep/30 px-6 py-4">
          {canAct ? (
            <>
              <button
                type="button"
                onClick={reject}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-coral/50 bg-cream px-4 py-2 text-sm font-medium text-coral hover:bg-coral hover:text-cream disabled:opacity-60"
              >
                {busy === "reject" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <XCircle size={13} />
                )}
                Reject
              </button>
              <button
                type="button"
                onClick={approve}
                disabled={!!busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-5 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
              >
                {busy === "approve" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={13} />
                )}
                Approve &amp; unlock
              </button>
            </>
          ) : (
            <div className="flex w-full items-center justify-end gap-2 text-[0.78rem] text-ink-soft">
              <ShieldCheck size={13} />
              This purchase has already been{" "}
              <strong>{PURCHASE_STATUS_LABELS[purchase.status]}</strong>.
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ContactRow({
  href,
  icon,
  value,
  onCopy,
}: {
  href: string;
  icon: React.ReactNode;
  value: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-brand-brown hover:underline"
      >
        {icon} {value}
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy"
        title="Copy"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
      >
        <ClipboardCopy size={11} />
      </button>
    </div>
  );
}

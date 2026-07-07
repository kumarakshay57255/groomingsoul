"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCopy,
  Loader2,
  Mail,
  PackageCheck,
  Phone,
  Printer,
  RefreshCw,
  Search,
  Truck,
  X,
} from "lucide-react";
// (Truck reused for Dispatched action below.)
import { ApiError } from "@/lib/api";
import {
  AdminCertificate,
  CERT_STATUSES,
  CERT_STATUS_LABELS,
  type CertStatus,
  fetchAdminCertificates,
  markCertificate,
} from "@/lib/adminCertificates";
import { relativeTime } from "@/lib/adminApi";

const STATUS_TONE: Record<CertStatus, string> = {
  queued: "bg-sun/35 text-brand-brown",
  printed: "bg-clinical-soft/55 text-clinical-deep",
  dispatched: "bg-sage-soft/55 text-sage-deep",
  delivered: "bg-brand-brown/15 text-brand-brown",
};

export function CertificatesManager({
  initialStatus,
}: {
  initialStatus?: CertStatus;
}) {
  const [items, setItems] = useState<AdminCertificate[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | CertStatus>(
    initialStatus ?? "all"
  );
  const [openCert, setOpenCert] = useState<AdminCertificate | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(
        await fetchAdminCertificates(
          statusFilter === "all" ? undefined : statusFilter
        )
      );
    } catch {
      setError("Couldn't load the dispatch queue.");
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
    return items.filter((c) =>
      `${c.user?.name ?? ""} ${c.user?.email ?? ""} ${c.user?.phone ?? ""} ${c.course?.title ?? ""} ${c.courierTracking ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const totals = useMemo(() => {
    const t = {
      queued: 0,
      printed: 0,
      dispatched: 0,
      delivered: 0,
    } as Record<CertStatus, number>;
    (items ?? []).forEach((c) => {
      t[c.status] += 1;
    });
    return t;
  }, [items]);

  function patch(updated: AdminCertificate) {
    setItems((arr) =>
      arr?.map((x) => (x.id === updated.id ? updated : x)) ?? null
    );
    setOpenCert(updated);
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
            placeholder="Search student, course, tracking ID…"
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
        {CERT_STATUSES.map((s) => (
          <StatusPill
            key={s}
            label={CERT_STATUS_LABELS[s]}
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
            No certificates match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-3 py-3">Course</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Tracking</th>
                <th className="px-3 py-3">Queued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setOpenCert(c)}
                  className="cursor-pointer align-middle hover:bg-cream-deep/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-brown">
                      {c.user?.name ?? c.shippingName ?? "—"}
                    </div>
                    <div className="text-[0.7rem] text-ink-soft">
                      {c.user?.email ?? "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {c.course?.title ?? "(deleted course)"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.7rem] ${STATUS_TONE[c.status]}`}
                    >
                      {CERT_STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[0.78rem] text-ink-soft">
                    {c.courierTracking ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[0.78rem] text-ink-soft">
                    {relativeTime(c.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openCert && (
        <CertDrawer
          cert={openCert}
          onClose={() => setOpenCert(null)}
          onUpdated={patch}
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

function CertDrawer({
  cert,
  onClose,
  onUpdated,
}: {
  cert: AdminCertificate;
  onClose: () => void;
  onUpdated: (c: AdminCertificate) => void;
}) {
  const [address, setAddress] = useState(cert.shippingAddress ?? "");
  const [tracking, setTracking] = useState(cert.courierTracking ?? "");
  const [busy, setBusy] = useState<CertStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setAddress(cert.shippingAddress ?? "");
    setTracking(cert.courierTracking ?? "");
    setError(null);
  }, [cert.id, cert.shippingAddress, cert.courierTracking]);

  async function setStatus(next: CertStatus) {
    setBusy(next);
    setError(null);
    try {
      const updated = await markCertificate(cert.id, {
        status: next,
        shippingAddress: address || undefined,
        courierTracking: tracking || undefined,
      });
      onUpdated(updated);
      setToast(`Marked ${CERT_STATUS_LABELS[next]}`);
      setTimeout(() => setToast(null), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
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

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-cream shadow-[-30px_0_60px_-30px_rgba(92,58,46,0.4)]">
        <div className="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Certificate dispatch
            </p>
            <h2 className="mt-1 truncate font-display text-2xl text-brand-brown">
              {cert.user?.name ?? cert.shippingName ?? "—"}
            </h2>
            <p className="truncate text-[0.78rem] text-ink-soft">
              {cert.course?.title ?? "(deleted course)"}
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
          <section className="rounded-2xl border border-line bg-cream p-4">
            <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Recipient
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {cert.user?.email && (
                <ContactRow
                  href={`mailto:${cert.user.email}`}
                  icon={<Mail size={12} className="text-clinical" />}
                  value={cert.user.email}
                  onCopy={() => copy(cert.user!.email)}
                />
              )}
              {(cert.shippingPhone ?? cert.user?.phone) && (
                <ContactRow
                  href={`tel:${cert.shippingPhone ?? cert.user?.phone}`}
                  icon={<Phone size={12} className="text-clinical" />}
                  value={cert.shippingPhone ?? cert.user!.phone}
                  onCopy={() =>
                    copy((cert.shippingPhone ?? cert.user!.phone) as string)
                  }
                />
              )}
            </div>
          </section>

          <section>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Shipping address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Full postal address including PIN code."
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
          </section>

          <section>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Courier tracking ID
            </label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. BD-XYZ-1234567"
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 font-mono text-sm outline-none focus:border-clinical"
            />
          </section>

          <section className="grid grid-cols-2 gap-3 rounded-2xl border border-line bg-cream-deep/40 p-4 text-sm">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Queued
              </div>
              <div className="mt-1 text-ink-soft">
                {formatDate(cert.createdAt)}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Dispatched
              </div>
              <div className="mt-1 text-ink-soft">
                {formatDate(cert.dispatchedAt)}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Delivered
              </div>
              <div className="mt-1 text-ink-soft">
                {formatDate(cert.deliveredAt)}
              </div>
            </div>
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Current status
              </div>
              <div className="mt-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.78rem] ${STATUS_TONE[cert.status]}`}
                >
                  {CERT_STATUS_LABELS[cert.status]}
                </span>
              </div>
            </div>
          </section>

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

        {/* Workflow buttons — each step is reachable from any state */}
        <div className="grid grid-cols-3 gap-2 border-t border-line bg-cream-deep/30 px-6 py-4">
          <ActionBtn
            label="Printed"
            icon={<Printer size={13} />}
            tone={cert.status === "printed" ? "primary" : "neutral"}
            disabled={!!busy}
            loading={busy === "printed"}
            onClick={() => setStatus("printed")}
          />
          <ActionBtn
            label="Dispatched"
            icon={<Truck size={13} />}
            tone={cert.status === "dispatched" ? "primary" : "neutral"}
            disabled={!!busy}
            loading={busy === "dispatched"}
            onClick={() => setStatus("dispatched")}
          />
          <ActionBtn
            label="Delivered"
            icon={<PackageCheck size={13} />}
            tone={cert.status === "delivered" ? "primary" : "neutral"}
            disabled={!!busy}
            loading={busy === "delivered"}
            onClick={() => setStatus("delivered")}
          />
        </div>
      </aside>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  tone,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  tone: "primary" | "neutral";
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const cls =
    tone === "primary"
      ? "bg-clinical text-cream hover:bg-clinical-deep"
      : "border border-line bg-cream text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors disabled:opacity-60 ${cls}`}
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {label}
    </button>
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

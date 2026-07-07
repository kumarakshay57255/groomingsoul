"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardCopy,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminLead,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  type LeadStatus,
  deleteLead,
  fetchAdminLeads,
  updateLead,
} from "@/lib/adminLeads";
import { relativeTime } from "@/lib/adminApi";

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "bg-clinical-soft/55 text-clinical-deep",
  contacted: "bg-sun/30 text-brand-brown",
  scheduled: "bg-sage-soft/55 text-sage-deep",
  closed: "bg-brand-brown/15 text-brand-brown",
};

export function LeadsManager({ initialStatus }: { initialStatus?: LeadStatus }) {
  const [items, setItems] = useState<AdminLead[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LeadStatus>(
    initialStatus ?? "all"
  );
  const [openLead, setOpenLead] = useState<AdminLead | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const opts: { status?: LeadStatus } = {};
      if (statusFilter !== "all") opts.status = statusFilter;
      setItems(await fetchAdminLeads(opts));
    } catch {
      setError("Couldn't load leads.");
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
    return items.filter((l) =>
      `${l.name} ${l.email} ${l.phone} ${l.therapistName ?? ""} ${l.notes ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  async function handleDelete(l: AdminLead) {
    if (!confirm(`Delete the lead from ${l.name}? This cannot be undone.`)) return;
    try {
      await deleteLead(l.id);
      setItems((arr) => arr?.filter((x) => x.id !== l.id) ?? null);
      if (openLead?.id === l.id) setOpenLead(null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  const totalsByStatus = useMemo(() => {
    const t = { new: 0, contacted: 0, scheduled: 0, closed: 0 } as Record<
      LeadStatus,
      number
    >;
    (items ?? []).forEach((l) => {
      t[l.status] += 1;
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
            placeholder="Search name, email, phone, therapist…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill
          label="All"
          count={items?.length ?? 0}
          active={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        {LEAD_STATUSES.map((s) => (
          <StatusPill
            key={s}
            label={LEAD_STATUS_LABELS[s]}
            count={totalsByStatus[s] ?? 0}
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
            No leads match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-3 py-3">Contact</th>
                <th className="px-3 py-3">Therapist</th>
                <th className="px-3 py-3">Preferred slot</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => setOpenLead(l)}
                  className="cursor-pointer align-middle hover:bg-cream-deep/30"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-brown">{l.name}</div>
                    <div className="text-[0.7rem] text-ink-soft">
                      Age {l.age}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
                      <Mail size={11} /> {l.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
                      <Phone size={11} /> {l.phone}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    {l.therapistName ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{l.slot}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[0.7rem] ${STATUS_TONE[l.status]}`}
                    >
                      {LEAD_STATUS_LABELS[l.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-[0.78rem] text-ink-soft">
                    {relativeTime(l.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {openLead && (
        <LeadDrawer
          lead={openLead}
          onClose={() => setOpenLead(null)}
          onSaved={(saved) => {
            setItems((arr) =>
              arr?.map((x) => (x.id === saved.id ? saved : x)) ?? null
            );
            setOpenLead(saved);
          }}
          onDelete={() => handleDelete(openLead)}
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

/* ---------------- Detail drawer ---------------- */

function LeadDrawer({
  lead,
  onClose,
  onSaved,
  onDelete,
}: {
  lead: AdminLead;
  onClose: () => void;
  onSaved: (lead: AdminLead) => void;
  onDelete: () => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setStatus(lead.status);
    setNotes(lead.notes ?? "");
  }, [lead.id, lead.status, lead.notes]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateLead(lead.id, {
        status,
        notes: notes.trim() || null,
      });
      onSaved(saved);
      setToast("Saved");
      setTimeout(() => setToast(null), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setToast("Copied");
      setTimeout(() => setToast(null), 1200);
    });
  }

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
              Therapy lead
            </p>
            <h2 className="mt-1 truncate font-display text-2xl text-brand-brown">
              {lead.name}
            </h2>
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
          <Info label="Age" value={String(lead.age)} />
          <InfoRow
            label="Phone"
            value={lead.phone}
            href={`tel:${lead.phone}`}
            onCopy={() => copy(lead.phone)}
            icon={<Phone size={12} className="text-clinical" />}
          />
          <InfoRow
            label="Email"
            value={lead.email}
            href={`mailto:${lead.email}`}
            onCopy={() => copy(lead.email)}
            icon={<Mail size={12} className="text-clinical" />}
          />
          <Info label="Preferred slot" value={lead.slot} />
          <Info
            label="Therapist requested"
            value={lead.therapistName ?? "Any available"}
          />
          <Info label="Received" value={relativeTime(lead.createdAt)} />

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Internal notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="What did the client say on call? Next steps?"
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
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

        <div className="flex items-center justify-between gap-3 border-t border-line bg-cream-deep/30 px-6 py-4">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-full border border-coral/50 bg-cream px-3.5 py-1.5 text-xs font-medium text-coral hover:bg-coral hover:text-cream"
          >
            <Trash2 size={11} /> Delete lead
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            Save
          </button>
        </div>
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  onCopy,
  icon,
}: {
  label: string;
  value: string;
  href: string;
  onCopy: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-2">
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
    </div>
  );
}

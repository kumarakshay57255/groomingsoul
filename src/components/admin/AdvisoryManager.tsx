"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  type AdminAdvisoryMember,
  advisoryPhotoUrl,
  archiveAdvisoryMember,
  createAdvisoryMember,
  deleteAdvisoryMember,
  fetchAdminAdvisory,
  updateAdvisoryMember,
} from "@/lib/advisory";

type FormState = {
  name: string;
  role: string;
  bio: string;
  position: number;
  isArchived: boolean;
};

const EMPTY: FormState = {
  name: "",
  role: "",
  bio: "",
  position: 0,
  isArchived: false,
};

function IconButton({
  label,
  onClick,
  disabled,
  tone = "neutral",
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "neutral" | "primary" | "danger";
  children: React.ReactNode;
}) {
  const styles =
    tone === "danger"
      ? "border-coral/50 text-coral hover:bg-coral hover:text-cream"
      : tone === "primary"
        ? "border-line text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
        : "border-line text-ink hover:border-brand-brown/50 hover:text-brand-brown";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border bg-cream transition-colors ${styles} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function AdvisoryManager() {
  const [items, setItems] = useState<AdminAdvisoryMember[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<AdminAdvisoryMember | "new" | null>(
    null
  );
  const [viewing, setViewing] = useState<AdminAdvisoryMember | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminAdvisory(true));
    } catch {
      setError("Couldn't load advisory members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((m) => {
      if (!showArchived && m.isArchived) return false;
      if (!search.trim()) return true;
      return `${m.name} ${m.role} ${m.bio ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
    });
  }, [items, search, showArchived]);

  async function handleDelete(m: AdminAdvisoryMember) {
    if (!confirm(`Permanently delete ${m.name}? This cannot be undone.`)) return;
    try {
      await deleteAdvisoryMember(m.id);
      setItems((arr) => arr?.filter((x) => x.id !== m.id) ?? null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    }
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
            placeholder="Search name, qualification…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Show archived
          </label>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            <Plus size={14} /> New member
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No advisory members match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-3 py-3">Qualification</th>
                <th className="px-3 py-3">Position</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((m) => {
                const photo = advisoryPhotoUrl(m);
                return (
                  <tr
                    key={m.id}
                    className={`align-middle ${m.isArchived ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-cream-deep">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={m.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[0.65rem] uppercase tracking-wider text-brand-brown/40">
                              {m.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="truncate font-medium text-brand-brown">
                          {m.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{m.role}</td>
                    <td className="px-3 py-3 tabular-nums text-ink-soft">
                      {m.position}
                    </td>
                    <td className="px-3 py-3">
                      {m.isArchived ? (
                        <span className="rounded-full bg-brand-brown/15 px-2 py-0.5 text-[0.7rem] text-brand-brown">
                          Archived
                        </span>
                      ) : (
                        <span className="rounded-full bg-sage-soft/55 px-2 py-0.5 text-[0.7rem] text-sage-deep">
                          Live
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <IconButton label="View" onClick={() => setViewing(m)}>
                          <Eye size={14} />
                        </IconButton>
                        <IconButton
                          label="Edit"
                          tone="primary"
                          onClick={() => setEditing(m)}
                        >
                          <Pencil size={14} />
                        </IconButton>
                        <IconButton
                          label="Delete permanently"
                          tone="danger"
                          onClick={() => handleDelete(m)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <AdvisoryEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((arr) => {
              if (!arr) return [saved];
              const idx = arr.findIndex((x) => x.id === saved.id);
              if (idx >= 0) {
                const copy = arr.slice();
                copy[idx] = saved;
                return copy;
              }
              return [saved, ...arr];
            });
            setEditing(null);
          }}
        />
      )}

      {viewing && (
        <AdvisoryViewer
          member={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
        />
      )}
    </>
  );
}

/* ---------------- Editor modal ---------------- */

function AdvisoryEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminAdvisoryMember | null;
  onClose: () => void;
  onSaved: (m: AdminAdvisoryMember) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          role: initial.role,
          bio: initial.bio ?? "",
          position: initial.position,
          isArchived: initial.isArchived,
        }
      : EMPTY
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial ? advisoryPhotoUrl(initial) : null
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    setRemovePhoto(false);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("name", form.name.trim());
    fd.set("role", form.role.trim());
    fd.set("bio", form.bio.trim());
    fd.set("position", String(form.position));
    if (photoFile) fd.set("photo", photoFile);
    if (removePhoto) fd.set("removePhoto", "1");

    try {
      let saved = initial
        ? await updateAdvisoryMember(initial.id, fd)
        : await createAdvisoryMember(fd);
      if (saved.isArchived !== form.isArchived) {
        saved = await archiveAdvisoryMember(saved.id, form.isArchived);
      }
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-line px-7 py-5">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              {initial ? "Edit advisory member" : "New advisory member"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              {initial ? initial.name : "Add to the advisory panel"}
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

        <div className="grid max-h-[70vh] gap-5 overflow-y-auto px-7 py-6 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Photo
            </label>
            <label
              htmlFor="adv-photo"
              className="mt-1.5 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-brand-brown/30 bg-cream-deep/40 transition-colors hover:border-clinical"
            >
              {previewUrl && !removePhoto ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-xs text-ink-soft">
                  <Camera size={20} className="mx-auto text-brand-brown" />
                  <div className="mt-2">Click to upload</div>
                  <div className="text-[0.65rem] opacity-75">JPG/PNG/WebP</div>
                </div>
              )}
              <input
                id="adv-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            {initial?.photoPath && (
              <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={removePhoto}
                  onChange={(e) => {
                    setRemovePhoto(e.target.checked);
                    if (e.target.checked) {
                      setPhotoFile(null);
                      setPreviewUrl(null);
                    } else if (initial.photoPath) {
                      setPreviewUrl(advisoryPhotoUrl(initial));
                    }
                  }}
                  className="h-3.5 w-3.5"
                />
                Remove current photo
              </label>
            )}
          </div>

          <div className="space-y-4 sm:col-span-8">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
              placeholder="e.g. Dr Anjali Verma"
            />
            <Field
              label="Qualification / role"
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              required
              placeholder="e.g. Clinical Psychologist · PhD"
            />
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Bio (optional)
              </label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                rows={3}
                placeholder="Short paragraph for internal reference."
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
            </div>
            <Field
              label="Display position"
              type="number"
              min={0}
              value={String(form.position)}
              onChange={(v) =>
                setForm((f) => ({ ...f, position: parseInt(v) || 0 }))
              }
              hint="Lower numbers appear first in the advisory grid."
            />
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={form.isArchived}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isArchived: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <span>
                <strong>Archived</strong> — hide from the public site
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="mx-7 mb-2 rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:border-brand-brown/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-clinical px-5 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : initial ? (
              "Save changes"
            ) : (
              "Create member"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- View modal ---------------- */

function AdvisoryViewer({
  member,
  onClose,
  onEdit,
}: {
  member: AdminAdvisoryMember;
  onClose: () => void;
  onEdit: () => void;
}) {
  const photo = advisoryPhotoUrl(member);
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-cream/85 text-ink-soft hover:bg-cream-deep"
        >
          <X size={16} />
        </button>
        <div className="relative aspect-[16/9] overflow-hidden bg-cream-deep">
          {photo ? (
            <Image
              src={photo}
              alt={member.name}
              fill
              sizes="(min-width: 640px) 32rem, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-brand-brown/30">
              <span className="font-display text-5xl">
                {member.name.charAt(0)}
              </span>
            </div>
          )}
          {member.isArchived && (
            <span className="absolute right-4 bottom-4 rounded-full bg-brand-brown/85 px-2.5 py-1 text-[0.7rem] uppercase tracking-wider text-cream">
              Archived
            </span>
          )}
        </div>

        <div className="px-7 py-6">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
            {member.role}
          </p>
          <h2 className="mt-1 font-display text-2xl text-brand-brown">
            {member.name}
          </h2>

          {member.bio && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {member.bio}
            </p>
          )}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Position
            </dt>
            <dd className="text-ink">{member.position}</dd>
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Created
            </dt>
            <dd className="text-ink-soft">
              {new Date(member.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </dd>
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Updated
            </dt>
            <dd className="text-ink-soft">
              {new Date(member.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </dd>
          </dl>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-7 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-4 py-1.5 text-sm text-ink hover:border-brand-brown/40"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-1.5 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            <Pencil size={13} /> Edit member
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
        {...rest}
      />
      {hint && <p className="mt-1 text-[0.7rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

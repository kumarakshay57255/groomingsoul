"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Camera,
  Crown,
  Eye,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  type AdminTeamMember,
  type FoundationContent,
  type TeamCategory,
  archiveTeamMember,
  createTeamMember,
  deleteTeamMember,
  fetchAdminTeam,
  fetchFoundationContent,
  teamPhotoUrl,
  updateFoundationContent,
  updateTeamMember,
} from "@/lib/team";

type FormState = {
  name: string;
  role: string;
  category: TeamCategory;
  bio: string;
  isFounder: boolean;
  position: number;
  isArchived: boolean;
};

const CATEGORY_OPTIONS: { value: TeamCategory; label: string }[] = [
  { value: "leadership", label: "Leadership" },
  { value: "clinical", label: "Clinical Team" },
  { value: "associate", label: "Mental Health Associate" },
];

const EMPTY_FORM: FormState = {
  name: "",
  role: "",
  category: "associate",
  bio: "",
  isFounder: false,
  position: 0,
  isArchived: false,
};

/* Pill icon button used in row actions. */
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
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md border bg-cream transition-colors ${styles} disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-cream disabled:hover:text-ink`}
    >
      {children}
    </button>
  );
}

export function TeamManager() {
  const [items, setItems] = useState<AdminTeamMember[] | null>(null);
  const [content, setContent] = useState<FoundationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<AdminTeamMember | "new" | null>(null);
  const [viewing, setViewing] = useState<AdminTeamMember | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, c] = await Promise.all([
        fetchAdminTeam(true),
        fetchFoundationContent(),
      ]);
      setItems(t);
      setContent(c);
    } catch {
      setError("Couldn't load team data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((t) => {
      if (!showArchived && t.isArchived) return false;
      if (!search.trim()) return true;
      const hay = `${t.name} ${t.role} ${t.bio ?? ""}`.toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
  }, [items, search, showArchived]);

  async function handleArchive(m: AdminTeamMember) {
    const verb = m.isArchived ? "restore" : "archive";
    if (!confirm(`Are you sure you want to ${verb} ${m.name}?`)) return;
    try {
      const updated = await archiveTeamMember(m.id, !m.isArchived);
      setItems((arr) =>
        arr?.map((x) => (x.id === m.id ? updated : x)) ?? null
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed");
    }
  }

  async function handleDelete(m: AdminTeamMember) {
    const msg = m.isFounder
      ? `Permanently delete ${m.name}? They're currently marked as Founder — the Founder's Corner block will fall back to a placeholder until you mark another row as Founder.`
      : `Permanently delete ${m.name}? This cannot be undone.`;
    if (!confirm(msg)) return;
    try {
      await deleteTeamMember(m.id);
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

      {/* ----------- Foundation content editor ----------- */}
      <FoundationEditor
        loading={loading}
        content={content}
        onSaved={(c) => setContent(c)}
      />

      {/* ----------- Team list ----------- */}
      <div className="mt-10 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
            Team members
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            One row can be marked as Founder — that profile drives the Founder&apos;s
            Corner block on the homepage. Everyone else fills the Core Team grid.
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          Show archived
        </label>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No team members match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Position</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((m) => {
                const photo = teamPhotoUrl(m);
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
                        <div className="flex min-w-0 items-center gap-1.5 truncate font-medium text-brand-brown">
                          {m.name}
                          {m.isFounder && (
                            <Crown
                              size={12}
                              className="text-sun"
                              aria-label="Founder"
                            />
                          )}
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
                        <IconButton
                          label="View"
                          onClick={() => setViewing(m)}
                        >
                          <Eye size={14} />
                        </IconButton>
                        <IconButton
                          label="Edit"
                          onClick={() => setEditing(m)}
                          tone="primary"
                        >
                          <Pencil size={14} />
                        </IconButton>
                        {m.isFounder ? (
                          <IconButton
                            label="Founder is protected — uncheck Founder in Edit to delete"
                            disabled
                          >
                            <Lock size={14} />
                          </IconButton>
                        ) : (
                          <IconButton
                            label="Delete permanently"
                            onClick={() => handleDelete(m)}
                            tone="danger"
                          >
                            <Trash2 size={14} />
                          </IconButton>
                        )}
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
        <TeamEditor
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((arr) => {
              if (!arr) return [saved];
              /* Founder uniqueness: if this row became the founder, demote others
                 locally to match what the server did. */
              let copy = arr.map((x) =>
                saved.isFounder && x.id !== saved.id && x.isFounder
                  ? { ...x, isFounder: false }
                  : x
              );
              const idx = copy.findIndex((x) => x.id === saved.id);
              if (idx >= 0) copy[idx] = saved;
              else copy = [saved, ...copy];
              return copy;
            });
            setEditing(null);
          }}
        />
      )}

      {viewing && (
        <TeamViewer
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

/* ---------------- View modal ---------------- */

function TeamViewer({
  member,
  onClose,
  onEdit,
}: {
  member: AdminTeamMember;
  onClose: () => void;
  onEdit: () => void;
}) {
  const photo = teamPhotoUrl(member);
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
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-cream-deep"
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
          {member.isFounder && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-2.5 py-1 text-[0.7rem] uppercase tracking-wider text-brand-brown">
              <Crown size={12} className="text-sun" /> Founder
            </span>
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
            <dt className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Photo
            </dt>
            <dd className="break-all text-[0.78rem] text-ink-soft">
              {member.photoPath ?? (member.isFounder ? "default placeholder" : "—")}
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

/* ---------------- Foundation content editor ---------------- */

function FoundationEditor({
  loading,
  content,
  onSaved,
}: {
  loading: boolean;
  content: FoundationContent | null;
  onSaved: (c: FoundationContent) => void;
}) {
  const [form, setForm] = useState<FoundationContent | null>(content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    setForm(content);
  }, [content]);

  if (loading || !form) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-cream p-6 text-sm text-ink-soft">
        <Loader2 size={14} className="mr-2 inline animate-spin" />
        Loading foundation content…
      </div>
    );
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateFoundationContent(form);
      onSaved(saved);
      setSavedAt(new Date());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-cream p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
            Foundation editorial
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            These strings power the Founder&apos;s Corner + Vision + Mission
            tiles on the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Save size={13} />
          )}
          Save content
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            Founder&apos;s message
          </label>
          <textarea
            value={form.founderMessage}
            onChange={(e) =>
              setForm({ ...form, founderMessage: e.target.value })
            }
            rows={6}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm leading-relaxed outline-none focus:border-clinical"
          />
          <p className="mt-1 text-[0.7rem] text-ink-soft">
            Use blank lines to separate paragraphs.
          </p>
        </div>
        <div>
          <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            Founder signature line
          </label>
          <input
            value={form.founderQuote ?? ""}
            onChange={(e) =>
              setForm({ ...form, founderQuote: e.target.value })
            }
            placeholder="e.g. — Arhama Malik"
            className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div />
        <div>
          <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            The Vision
          </label>
          <textarea
            value={form.vision}
            onChange={(e) => setForm({ ...form, vision: e.target.value })}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div>
          <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            The Mission
          </label>
          <textarea
            value={form.mission}
            onChange={(e) => setForm({ ...form, mission: e.target.value })}
            rows={4}
            className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="mt-3 text-xs text-sage-deep">
          Saved · {savedAt.toLocaleTimeString()}
        </p>
      )}
    </section>
  );
}

/* ---------------- Team-member editor modal ---------------- */

function TeamEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminTeamMember | null;
  onClose: () => void;
  onSaved: (m: AdminTeamMember) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          role: initial.role,
          category: initial.category ?? "associate",
          bio: initial.bio ?? "",
          isFounder: initial.isFounder,
          position: initial.position,
          isArchived: initial.isArchived,
        }
      : EMPTY_FORM
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial ? teamPhotoUrl(initial) : null
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
    fd.set("category", form.category);
    fd.set("bio", form.bio.trim());
    fd.set("isFounder", String(form.isFounder));
    fd.set("position", String(form.position));
    if (photoFile) fd.set("photo", photoFile);
    if (removePhoto) fd.set("removePhoto", "1");

    try {
      let saved = initial
        ? await updateTeamMember(initial.id, fd)
        : await createTeamMember(fd);
      /* Sync archive state if the toggle changed */
      if (saved.isArchived !== form.isArchived) {
        saved = await archiveTeamMember(saved.id, form.isArchived);
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
              {initial ? "Edit member" : "New member"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              {initial ? initial.name : "Add to the team"}
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
              htmlFor="team-photo"
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
                id="team-photo"
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
                      setPreviewUrl(teamPhotoUrl(initial));
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
              placeholder="e.g. Arhama Malik"
            />
            <Field
              label="Role / designation"
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v }))}
              required
              placeholder="e.g. Founder & Director"
            />
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Team category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as TeamCategory,
                  }))
                }
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[0.7rem] text-ink-soft/70">
                Controls which filter tab this member appears under on the
                homepage.
              </p>
            </div>
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
                rows={3}
                placeholder="Short paragraph shown on the homepage."
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Display position"
                type="number"
                min={0}
                value={String(form.position)}
                onChange={(v) =>
                  setForm((f) => ({ ...f, position: parseInt(v) || 0 }))
                }
                hint="Lower numbers appear first in the team grid."
              />
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                  Founder
                </span>
                <label className="mt-1.5 inline-flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border border-line bg-cream px-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFounder}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isFounder: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  Mark as Founder
                </label>
                <p className="text-[0.7rem] text-ink-soft">
                  Only one row can hold this — others are demoted automatically.
                </p>
              </label>
            </div>

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
                <strong>Archived</strong> — hide from the public site (keeps the
                row + photo for later restore)
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

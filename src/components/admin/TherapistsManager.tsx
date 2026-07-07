"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Camera,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminTherapist,
  archiveTherapist,
  createTherapist,
  fetchAdminTherapists,
  therapistPhotoUrl,
  therapistSpecializations,
  updateTherapist,
} from "@/lib/therapists";

type FormState = {
  name: string;
  designation: string;
  yearsExperience: number;
  languages: string;
  specializations: string[];
  bio: string;
  acceptingNew: boolean;
  position: number;
};

const EMPTY: FormState = {
  name: "",
  designation: "",
  yearsExperience: 0,
  languages: "English",
  specializations: [],
  bio: "",
  acceptingNew: true,
  position: 0,
};

export function TherapistsManager() {
  const [items, setItems] = useState<AdminTherapist[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState<AdminTherapist | "new" | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminTherapists(true));
    } catch {
      setError("Couldn't load therapists.");
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
      const hay = (
        t.name +
        " " +
        t.designation +
        " " +
        (t.specializations ?? []).join(" ")
      ).toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
  }, [items, showArchived, search]);

  async function handleArchive(t: AdminTherapist) {
    const next = !t.isArchived;
    const verb = next ? "archive" : "restore";
    if (!confirm(`Are you sure you want to ${verb} ${t.name}?`)) return;
    try {
      const updated = await archiveTherapist(t.id, next);
      setItems((arr) => arr?.map((x) => (x.id === t.id ? updated : x)) ?? null);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed");
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, designation, specialisation…"
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
            title="Refresh"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            <Plus size={14} /> New therapist
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-coral/40 bg-coral-soft/40 p-3 text-sm text-brand-brown">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No therapists match these filters.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Therapist</th>
                <th className="px-3 py-3">Experience</th>
                <th className="px-3 py-3">Specialisations</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((t) => {
                const photo = therapistPhotoUrl(t);
                return (
                  <tr
                    key={t.id}
                    className={`align-middle ${t.isArchived ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-cream-deep">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={t.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-[0.65rem] uppercase tracking-wider text-brand-brown/40">
                              {t.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-brand-brown">
                            {t.name}
                          </div>
                          <div className="truncate text-[0.78rem] text-ink-soft">
                            {t.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-soft">
                      {t.yearsExperience} yrs · {t.languages?.join(", ") || "—"}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(t.specializations ?? []).slice(0, 4).map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-sage-soft/45 px-2 py-0.5 text-[0.7rem] text-sage-deep"
                          >
                            {s}
                          </span>
                        ))}
                        {(t.specializations ?? []).length > 4 && (
                          <span className="text-[0.7rem] text-ink-soft">
                            +{(t.specializations ?? []).length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {t.isArchived ? (
                        <span className="rounded-full bg-brand-brown/15 px-2 py-0.5 text-[0.7rem] text-brand-brown">
                          Archived
                        </span>
                      ) : t.acceptingNew ? (
                        <span className="rounded-full bg-sage-soft/55 px-2 py-0.5 text-[0.7rem] text-sage-deep">
                          Accepting
                        </span>
                      ) : (
                        <span className="rounded-full bg-sun/30 px-2 py-0.5 text-[0.7rem] text-brand-brown">
                          Waitlist
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditing(t)}
                          className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 text-[0.7rem] text-ink hover:border-brand-brown/40 hover:text-brand-brown"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchive(t)}
                          className="inline-flex items-center gap-1 rounded-full border border-line bg-cream px-2.5 py-1 text-[0.7rem] text-ink hover:border-brand-brown/40 hover:text-brand-brown"
                        >
                          {t.isArchived ? (
                            <>
                              <ArchiveRestore size={11} /> Restore
                            </>
                          ) : (
                            <>
                              <Archive size={11} /> Archive
                            </>
                          )}
                        </button>
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
        <TherapistEditor
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
    </>
  );
}

/* --------------------------- Editor modal ---------------------------- */

function TherapistEditor({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminTherapist | null;
  onClose: () => void;
  onSaved: (t: AdminTherapist) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          designation: initial.designation,
          yearsExperience: initial.yearsExperience,
          languages: (initial.languages ?? []).join(", "),
          specializations: initial.specializations ?? [],
          bio: initial.bio ?? "",
          acceptingNew: initial.acceptingNew,
          position: initial.position,
        }
      : EMPTY
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initial ? therapistPhotoUrl(initial) : null
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

  function toggleSpec(s: string) {
    setForm((f) =>
      f.specializations.includes(s)
        ? { ...f, specializations: f.specializations.filter((x) => x !== s) }
        : { ...f, specializations: [...f.specializations, s] }
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("name", form.name.trim());
    fd.set("designation", form.designation.trim());
    fd.set("yearsExperience", String(form.yearsExperience));
    fd.set("languages", form.languages);
    fd.set("specializations", form.specializations.join(","));
    fd.set("bio", form.bio.trim());
    fd.set("acceptingNew", String(form.acceptingNew));
    fd.set("position", String(form.position));
    if (photoFile) fd.set("photo", photoFile);
    if (removePhoto) fd.set("removePhoto", "1");

    try {
      const saved = initial
        ? await updateTherapist(initial.id, fd)
        : await createTherapist(fd);
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
              {initial ? "Edit therapist" : "New therapist"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              {initial ? initial.name : "Add to the directory"}
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
          {/* Photo */}
          <div className="sm:col-span-4">
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Photo
            </label>
            <label
              htmlFor="photo"
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
                id="photo"
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
                      setPreviewUrl(therapistPhotoUrl(initial));
                    }
                  }}
                  className="h-3.5 w-3.5"
                />
                Remove current photo
              </label>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4 sm:col-span-8">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              required
              placeholder="e.g. Dr Anjali Verma"
            />
            <Field
              label="Designation"
              value={form.designation}
              onChange={(v) => setForm((f) => ({ ...f, designation: v }))}
              required
              placeholder="e.g. Clinical Psychologist · M.Phil"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Years of experience"
                type="number"
                min={0}
                max={70}
                value={String(form.yearsExperience)}
                onChange={(v) =>
                  setForm((f) => ({ ...f, yearsExperience: parseInt(v) || 0 }))
                }
              />
              <Field
                label="Display position"
                type="number"
                min={0}
                value={String(form.position)}
                onChange={(v) =>
                  setForm((f) => ({ ...f, position: parseInt(v) || 0 }))
                }
                hint="Lower numbers appear first"
              />
            </div>
            <Field
              label="Languages"
              value={form.languages}
              onChange={(v) => setForm((f) => ({ ...f, languages: v }))}
              hint="Comma-separated. e.g. English, Hindi, Urdu"
            />
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Specialisations
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {therapistSpecializations.map((s) => {
                  const on = form.specializations.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSpec(s)}
                      className={`rounded-full border px-2.5 py-1 text-[0.78rem] transition-colors ${
                        on
                          ? "border-clinical bg-clinical text-cream"
                          : "border-line bg-cream text-ink-soft hover:border-clinical/40 hover:text-brand-brown"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Bio
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="Short profile shown on /therapy card."
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.acceptingNew}
                onChange={(e) =>
                  setForm((f) => ({ ...f, acceptingNew: e.target.checked }))
                }
                className="h-4 w-4"
              />
              Currently accepting new clients
              <span className="text-[0.7rem] text-ink-soft">
                (uncheck = Waitlist)
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
              "Create therapist"
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
      {hint && (
        <p className="mt-1 text-[0.7rem] text-ink-soft">{hint}</p>
      )}
    </div>
  );
}

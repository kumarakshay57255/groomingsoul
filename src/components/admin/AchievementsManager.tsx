"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  type AdminAchievement,
  achievementImageUrl,
  createAchievement,
  deleteAchievement,
  fetchAdminAchievements,
  updateAchievement,
} from "@/lib/achievements";

type FormState = {
  title: string;
  year: string;
  tag: string;
  description: string;
  position: number;
  isPublished: boolean;
};

const EMPTY: FormState = {
  title: "",
  year: "",
  tag: "",
  description: "",
  position: 0,
  isPublished: true,
};

export function AchievementsManager() {
  const [items, setItems] = useState<AdminAchievement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminAchievement | "new" | null>(null);

  async function load() {
    setError(null);
    try {
      setItems(await fetchAdminAchievements());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load achievements.");
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(a: AdminAchievement) {
    if (!confirm(`Delete “${a.title}”? This can’t be undone.`)) return;
    try {
      await deleteAchievement(a.id);
      setItems((prev) => prev?.filter((x) => x.id !== a.id) ?? null);
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Delete failed.");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-cream px-3.5 py-2 text-xs font-medium text-ink-soft hover:border-brand-brown/40"
        >
          <RefreshCw size={13} /> Refresh
        </button>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-2 rounded-full bg-clinical px-5 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep"
        >
          <Plus size={15} /> Add achievement
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-3 text-sm text-brand-brown">
          {error}
        </div>
      )}

      {items === null ? (
        <div className="flex items-center gap-2 py-10 text-sm text-ink-soft">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-cream px-6 py-12 text-center">
          <Award size={30} className="mx-auto text-sage-deep/50" />
          <p className="mt-3 text-sm text-ink-soft">
            No achievements yet. Add the founder&apos;s first milestone.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-cream">
          {items.map((a, i) => {
            const img = achievementImageUrl(a);
            return (
              <div
                key={a.id}
                className={`flex items-center gap-4 px-4 py-3.5 sm:px-5 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                  {img ? (
                    <Image src={img} alt={a.title} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-sage-deep/50">
                      <Award size={18} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg text-brand-brown">
                    {a.title}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {[a.year, a.tag].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] ${
                    a.isPublished
                      ? "bg-sage-soft/70 text-sage-deep"
                      : "bg-cream-deep text-ink-soft/70"
                  }`}
                >
                  {a.isPublished ? "Live" : "Draft"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={() => setEditing(a)}
                    className="rounded-lg p-2 text-ink-soft hover:bg-cream-deep hover:text-brand-brown"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => handleDelete(a)}
                    className="rounded-lg p-2 text-ink-soft hover:bg-coral hover:text-cream"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <AchievementModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((prev) => {
              if (!prev) return [saved];
              const idx = prev.findIndex((x) => x.id === saved.id);
              if (idx === -1) return [...prev, saved];
              const next = [...prev];
              next[idx] = saved;
              return next;
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function AchievementModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminAchievement | null;
  onClose: () => void;
  onSaved: (a: AdminAchievement) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          year: initial.year ?? "",
          tag: initial.tag ?? "",
          description: initial.description ?? "",
          position: initial.position,
          isPublished: initial.isPublished,
        }
      : EMPTY
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial ? achievementImageUrl(initial) : null
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setRemoveImage(false);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const fd = new FormData();
    fd.set("title", form.title.trim());
    fd.set("year", form.year.trim());
    fd.set("tag", form.tag.trim());
    fd.set("description", form.description.trim());
    fd.set("position", String(form.position));
    fd.set("isPublished", String(form.isPublished));
    if (file) fd.set("image", file);
    if (removeImage) fd.set("removeImage", "1");
    try {
      const saved = initial
        ? await updateAchievement(initial.id, fd)
        : await createAchievement(fd);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
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
        onSubmit={submit}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-cream shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <div className="text-[0.62rem] uppercase tracking-[0.18em] text-sage-deep">
              Founder achievement
            </div>
            <h3 className="font-display text-xl text-brand-brown">
              {initial ? "Edit achievement" : "Add achievement"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line p-2 text-ink-soft hover:text-brand-brown"
          >
            <X size={15} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </div>
          )}

          <Label>Title</Label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Founded Grooming Souls"
            className="input"
            autoFocus
          />

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <Label>Year</Label>
              <input
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2023"
                className="input"
              />
            </div>
            <div className="flex-[1.4]">
              <Label>Type / tag</Label>
              <input
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                placeholder="Milestone · Award · Publication"
                className="input"
              />
            </div>
          </div>

          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={3}
            placeholder="Short line shown on the website card."
            className="input resize-y"
          />

          <Label>Achievement image</Label>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="preview" className="h-40 w-full object-cover" />
              <div className="absolute right-2 top-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-brand-brown"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setRemoveImage(true);
                  }}
                  className="rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-coral"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-gold/50 bg-cream px-4 py-6 text-sm text-ink-soft hover:border-gold"
            >
              <ImagePlus size={24} className="text-gold" />
              Click to upload — JPG, PNG or WebP (max 5 MB)
            </button>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isPublished}
              onClick={() =>
                setForm((f) => ({ ...f, isPublished: !f.isPublished }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.isPublished ? "bg-sage-deep" : "bg-line"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition-all ${
                  form.isPublished ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-ink-soft">
              Published — visible on the website
            </span>
          </div>

          <div className="mt-3">
            <Label>Display position</Label>
            <input
              type="number"
              min={0}
              value={form.position === 0 ? "" : form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: parseInt(e.target.value) || 0 }))
              }
              placeholder="0"
              className="input w-32"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-brand-brown hover:border-brand-brown/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-clinical px-6 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {initial ? "Save changes" : "Save achievement"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-line);
          background: var(--color-cream);
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.9rem;
          color: var(--color-ink);
          outline: none;
        }
        .input:focus {
          border-color: var(--color-clinical);
        }
      `}</style>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mt-4 mb-1.5 block text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep first:mt-0">
      {children}
    </label>
  );
}

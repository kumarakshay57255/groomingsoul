"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
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
  type AdminBook,
  bookCoverUrl,
  createBook,
  deleteBook,
  fetchAdminBooks,
  updateBook,
} from "@/lib/books";

type FormState = {
  title: string;
  subtitle: string;
  author: string;
  amazonUrl: string;
  format: string;
  description: string;
  position: number;
  isPublished: boolean;
};

const EMPTY: FormState = {
  title: "",
  subtitle: "",
  author: "",
  amazonUrl: "",
  format: "",
  description: "",
  position: 0,
  isPublished: true,
};

export function BooksManager() {
  const [items, setItems] = useState<AdminBook[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminBook | "new" | null>(null);

  async function load() {
    setError(null);
    try {
      setItems(await fetchAdminBooks());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load books.");
      setItems([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(b: AdminBook) {
    if (!confirm(`Delete “${b.title}”? This can’t be undone.`)) return;
    try {
      await deleteBook(b.id);
      setItems((prev) => prev?.filter((x) => x.id !== b.id) ?? null);
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
          <Plus size={15} /> Add book
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
          <BookOpen size={30} className="mx-auto text-sage-deep/50" />
          <p className="mt-3 text-sm text-ink-soft">
            No books yet. Add the founder&apos;s first book.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-cream">
          {items.map((b, i) => {
            const cover = bookCoverUrl(b);
            return (
              <div
                key={b.id}
                className={`flex items-center gap-4 px-4 py-3.5 sm:px-5 ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-navy">
                  {cover ? (
                    <Image src={cover} alt={b.title} fill sizes="40px" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-cream/60">
                      <BookOpen size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-lg text-brand-brown">
                    {b.title}
                  </div>
                  <div className="truncate text-xs text-ink-soft">
                    {[b.author, b.format].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] ${
                    b.isPublished
                      ? "bg-sage-soft/70 text-sage-deep"
                      : "bg-cream-deep text-ink-soft/70"
                  }`}
                >
                  {b.isPublished ? "Live" : "Draft"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={() => setEditing(b)}
                    className="rounded-lg p-2 text-ink-soft hover:bg-cream-deep hover:text-brand-brown"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={() => handleDelete(b)}
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
        <BookModal
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

function BookModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: AdminBook | null;
  onClose: () => void;
  onSaved: (b: AdminBook) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          title: initial.title,
          subtitle: initial.subtitle ?? "",
          author: initial.author ?? "",
          amazonUrl: initial.amazonUrl ?? "",
          format: initial.format ?? "",
          description: initial.description ?? "",
          position: initial.position,
          isPublished: initial.isPublished,
        }
      : EMPTY
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initial ? bookCoverUrl(initial) : null
  );
  const [removeCover, setRemoveCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setRemoveCover(false);
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
    fd.set("subtitle", form.subtitle.trim());
    fd.set("author", form.author.trim());
    fd.set("amazonUrl", form.amazonUrl.trim());
    fd.set("format", form.format.trim());
    fd.set("description", form.description.trim());
    fd.set("position", String(form.position));
    fd.set("isPublished", String(form.isPublished));
    if (file) fd.set("cover", file);
    if (removeCover) fd.set("removeCover", "1");
    try {
      const saved = initial
        ? await updateBook(initial.id, fd)
        : await createBook(fd);
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
              Founder book
            </div>
            <h3 className="font-display text-xl text-brand-brown">
              {initial ? "Edit book" : "Add book"}
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
            placeholder="e.g. Unseen Minds and Hidden Souls"
            className="inp"
            autoFocus
          />

          <Label>Subtitle</Label>
          <input
            value={form.subtitle}
            onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
            placeholder="Optional subtitle"
            className="inp"
          />

          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <Label>Author</Label>
              <input
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="Arhama Malik"
                className="inp"
              />
            </div>
            <div className="flex-1">
              <Label>Format</Label>
              <input
                value={form.format}
                onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
                placeholder="Paperback & Kindle"
                className="inp"
              />
            </div>
          </div>

          <Label>Amazon link</Label>
          <input
            value={form.amazonUrl}
            onChange={(e) => setForm((f) => ({ ...f, amazonUrl: e.target.value }))}
            placeholder="https://amzn.in/…"
            className="inp"
          />

          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={4}
            placeholder="Short description shown on the site."
            className="inp resize-y"
          />

          <Label>Cover image</Label>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="cover" className="h-28 w-auto rounded-md border border-line" />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-full border border-line bg-cream px-4 py-1.5 text-xs font-medium text-brand-brown"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setRemoveCover(true);
                  }}
                  className="rounded-full border border-line bg-cream px-4 py-1.5 text-xs font-medium text-coral"
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
              Click to upload the cover — JPG, PNG or WebP (max 5 MB, 2:3)
            </button>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isPublished}
              onClick={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}
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
            {initial ? "Save changes" : "Save book"}
          </button>
        </div>
      </form>

      <style jsx>{`
        .inp {
          width: 100%;
          border: 1px solid var(--color-line);
          background: var(--color-cream);
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 0.9rem;
          color: var(--color-ink);
          outline: none;
        }
        .inp:focus {
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

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Eye,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  ADMIN_CATEGORIES,
  AdminCourseSummary,
  deleteCourse,
  fetchAdminCourses,
  formatInr,
} from "@/lib/adminCourses";
import type { CourseCategory, CourseType } from "@/lib/courses";

function IconButton({
  label,
  onClick,
  tone = "neutral",
  children,
  asLink,
  href,
}: {
  label: string;
  onClick?: () => void;
  tone?: "neutral" | "primary" | "danger";
  children: React.ReactNode;
  asLink?: boolean;
  href?: string;
}) {
  const styles =
    tone === "danger"
      ? "border-coral/50 text-coral hover:bg-coral hover:text-cream"
      : tone === "primary"
        ? "border-line text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
        : "border-line text-ink hover:border-brand-brown/50 hover:text-brand-brown";
  const cls = `inline-flex h-8 w-8 items-center justify-center rounded-md border bg-cream transition-colors ${styles}`;
  if (asLink && href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cls}
    >
      {children}
    </button>
  );
}

export function CoursesManager() {
  const [items, setItems] = useState<AdminCourseSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | CourseType>("all");
  const [catFilter, setCatFilter] = useState<"all" | CourseCategory>("all");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminCourses());
    } catch {
      setError("Couldn't load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (catFilter !== "all" && c.category !== catFilter) return false;
      if (!search.trim()) return true;
      const hay = `${c.title} ${c.slug} ${c.instructor ?? ""} ${
        c.description ?? ""
      }`.toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
  }, [items, search, typeFilter, catFilter]);

  async function handleDelete(c: AdminCourseSummary) {
    if (!confirm(`Permanently delete "${c.title}"? This removes all modules, lessons, and uploaded videos. Existing purchases will block this — use the admin DB if you really need to force.`)) return;
    try {
      await deleteCourse(c.id);
      setItems((arr) => arr?.filter((x) => x.id !== c.id) ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        if (
          confirm(
            "This course has pending or active purchases. Force-delete anyway? Students will lose access immediately."
          )
        ) {
          try {
            await deleteCourse(c.id, true);
            setItems((arr) => arr?.filter((x) => x.id !== c.id) ?? null);
            return;
          } catch (err2) {
            alert(err2 instanceof ApiError ? err2.message : "Delete failed");
            return;
          }
        }
        return;
      }
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
            placeholder="Search title, slug…"
            className="w-full rounded-full border border-line bg-cream py-2 pl-9 pr-4 text-sm outline-none focus:border-clinical"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as never)}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm outline-none focus:border-clinical"
          >
            <option value="all">All types</option>
            <option value="academy">Academy</option>
            <option value="diploma">Diploma</option>
          </select>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as never)}
            className="rounded-full border border-line bg-cream px-3 py-1.5 text-sm outline-none focus:border-clinical"
          >
            <option value="all">All categories</option>
            {ADMIN_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
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
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            <Plus size={14} /> New course
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-cream">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-ink-soft">
            <Loader2 size={14} className="animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-soft">
            No courses match these filters.
          </div>
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-cream-deep/40 text-left text-[0.7rem] uppercase tracking-[0.14em] text-ink-soft">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Validity</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`align-middle ${!c.isPublished ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 shrink-0 rounded-md"
                        style={{ backgroundColor: c.coverColor }}
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-brand-brown">
                          {c.title}
                        </div>
                        <div className="truncate font-mono text-[0.7rem] text-ink-soft">
                          {c.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-soft">
                    <div className="inline-flex flex-col gap-1">
                      <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[0.7rem] text-brand-brown">
                        {ADMIN_CATEGORIES.find((x) => x.value === c.category)?.label ??
                          c.category}
                      </span>
                      {c.type === "diploma" && (
                        <span className="inline-flex items-center gap-1 text-[0.7rem] text-coral">
                          <GraduationCap size={11} /> Diploma
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-ink">
                    {formatInr(c.priceInr)}
                  </td>
                  <td className="px-3 py-3 text-ink-soft">{c.validityDays}d</td>
                  <td className="px-3 py-3">
                    {c.isPublished ? (
                      <span className="rounded-full bg-sage-soft/55 px-2 py-0.5 text-[0.7rem] text-sage-deep">
                        Published
                      </span>
                    ) : (
                      <span className="rounded-full bg-brand-brown/15 px-2 py-0.5 text-[0.7rem] text-brand-brown">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <IconButton
                        label="View on site"
                        asLink
                        href={`/${c.type === "diploma" ? "diploma" : "academy"}/courses/${c.slug}`}
                      >
                        <Eye size={14} />
                      </IconButton>
                      <IconButton
                        label="Edit course + lessons"
                        tone="primary"
                        asLink
                        href={`/admin/courses/${c.id}`}
                      >
                        <Pencil size={14} />
                      </IconButton>
                      <IconButton
                        label="Delete"
                        tone="danger"
                        onClick={() => handleDelete(c)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
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

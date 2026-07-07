"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  FileVideo,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  ADMIN_CATEGORIES,
  AdminCourseDetail,
  AdminCourseSummary,
  AdminLesson,
  AdminModule,
  createCourse,
  createModule,
  deleteLesson as deleteLessonApi,
  deleteModule,
  fetchAdminCourse,
  formatDuration,
  formatInr,
  updateCourse,
  updateModule,
} from "@/lib/adminCourses";
import type { CourseCategory, CourseType } from "@/lib/courses";
import { LessonEditor } from "./LessonEditor";

type FormState = {
  slug: string;
  title: string;
  instructor: string;
  description: string;
  coverColor: string;
  category: CourseCategory;
  type: CourseType;
  priceInr: number;
  validityDays: number;
  estimatedHours: number;
  isPublished: boolean;
};

/**
 * Translate raw API / Postgres errors into something a non-technical admin can act on.
 */
function friendlyError(err: unknown): string {
  if (!(err instanceof ApiError)) return "Save failed.";
  const fieldMsgs = err.fields;
  if (fieldMsgs.length > 0) {
    return fieldMsgs
      .map((f) => `${f.path ? f.path + ": " : ""}${f.message}`)
      .join(" · ");
  }
  const m = err.message.toLowerCase();
  if (m.includes('invalid input syntax for type integer')) {
    return "One of the numeric fields (price, validity, hours) is empty or invalid.";
  }
  if (m.includes('slug')) {
    return "That URL slug is already in use — pick a different one.";
  }
  if (m.includes('unique')) {
    return "Another row already uses one of these values.";
  }
  return err.message;
}

function blank(): FormState {
  return {
    slug: "",
    title: "",
    instructor: "",
    description: "",
    coverColor: "#3F5F8A",
    category: "11-12",
    type: "academy",
    priceInr: 0,
    validityDays: 30,
    estimatedHours: 0,
    isPublished: true,
  };
}

function fromCourse(c: AdminCourseSummary): FormState {
  return {
    slug: c.slug,
    title: c.title,
    instructor: c.instructor ?? "",
    description: c.description ?? "",
    coverColor: c.coverColor,
    category: c.category,
    type: c.type,
    priceInr: c.priceInr,
    validityDays: c.validityDays,
    estimatedHours: c.estimatedHours ?? 0,
    isPublished: c.isPublished,
  };
}

export function CourseEditor({ courseId }: { courseId: string | "new" }) {
  const router = useRouter();
  const [course, setCourse] = useState<AdminCourseDetail | null>(null);
  const [form, setForm] = useState<FormState>(blank());
  const [loading, setLoading] = useState(courseId !== "new");
  const [savingCourse, setSavingCourse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [lessonModal, setLessonModal] = useState<
    | { moduleId: string; lesson: AdminLesson | null }
    | null
  >(null);
  /* Drives the branded module-title modal (replaces native prompt()) */
  const [moduleModal, setModuleModal] = useState<
    | { mode: "create" }
    | { mode: "rename"; module: AdminModule }
    | null
  >(null);

  useEffect(() => {
    if (courseId === "new") return;
    let live = true;
    (async () => {
      try {
        const c = await fetchAdminCourse(courseId);
        if (!live) return;
        setCourse(c);
        setForm(fromCourse(c));
      } catch {
        if (live) setError("Couldn't load this course.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [courseId]);

  async function saveCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingCourse(true);
    setError(null);
    try {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        instructor: form.instructor.trim() || null,
        description: form.description.trim() || null,
        coverColor: form.coverColor,
        category: form.category,
        type: form.type,
        priceInr: Math.max(0, form.priceInr),
        validityDays: Math.max(1, form.validityDays),
        estimatedHours: form.estimatedHours > 0 ? form.estimatedHours : null,
        isPublished: form.isPublished,
      };
      if (courseId === "new") {
        const created = await createCourse(payload);
        setToast("Course created.");
        router.replace(`/admin/courses/${created.id}`);
      } else {
        const updated = await updateCourse(courseId, payload);
        setCourse((prev) => (prev ? { ...prev, ...updated } : prev));
        setToast("Course saved.");
        setTimeout(() => setToast(null), 1800);
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSavingCourse(false);
    }
  }

  function addModule() {
    if (!course) return;
    setModuleModal({ mode: "create" });
  }

  function renameModule(m: AdminModule) {
    setModuleModal({ mode: "rename", module: m });
  }

  async function handleModuleModalSave(title: string) {
    if (!moduleModal || !course) return;
    const t = title.trim();
    if (!t) return;
    if (moduleModal.mode === "create") {
      try {
        const m = await createModule(course.id, t, course.modules.length);
        setCourse({ ...course, modules: [...course.modules, m] });
        setModuleModal(null);
      } catch (err) {
        throw err instanceof ApiError
          ? err
          : new Error("Could not add module.");
      }
    } else {
      try {
        const updated = await updateModule(moduleModal.module.id, { title: t });
        setCourse((c) =>
          c
            ? {
                ...c,
                modules: c.modules.map((x) =>
                  x.id === moduleModal.module.id ? { ...x, ...updated } : x
                ),
              }
            : c
        );
        setModuleModal(null);
      } catch (err) {
        throw err instanceof ApiError
          ? err
          : new Error("Could not rename module.");
      }
    }
  }

  async function removeModule(m: AdminModule) {
    const lessonCount = m.lessons.length;
    if (
      !confirm(
        `Delete module "${m.title}"? ${lessonCount} lesson${
          lessonCount === 1 ? "" : "s"
        } and their videos will be removed.`
      )
    )
      return;
    try {
      await deleteModule(m.id);
      setCourse((c) =>
        c ? { ...c, modules: c.modules.filter((x) => x.id !== m.id) } : c
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed");
    }
  }

  async function removeLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson? Its video file will be removed too.")) return;
    try {
      await deleteLessonApi(lessonId);
      setCourse((c) =>
        c
          ? {
              ...c,
              modules: c.modules.map((m) =>
                m.id === moduleId
                  ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
                  : m
              ),
            }
          : c
      );
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Failed");
    }
  }

  function onLessonSaved(moduleId: string, lesson: AdminLesson) {
    setCourse((c) => {
      if (!c) return c;
      return {
        ...c,
        modules: c.modules.map((m) => {
          if (m.id !== moduleId) return m;
          const idx = m.lessons.findIndex((l) => l.id === lesson.id);
          const lessons =
            idx >= 0
              ? m.lessons.map((l) => (l.id === lesson.id ? lesson : l))
              : [...m.lessons, lesson];
          return {
            ...m,
            lessons: lessons.sort((a, b) => a.position - b.position),
          };
        }),
      };
    });
    setLessonModal(null);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 pt-6 text-sm text-ink-soft">
        <Loader2 size={14} className="animate-spin" /> Loading course…
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/courses"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
      >
        <ArrowLeft size={14} /> All courses
      </Link>

      {/* Course metadata form */}
      <form
        onSubmit={saveCourse}
        className="mt-6 rounded-2xl border border-line bg-cream p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-display text-2xl text-brand-brown">
            {courseId === "new" ? "New course" : course?.title}
          </h2>
          <button
            type="submit"
            disabled={savingCourse}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {savingCourse ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {courseId === "new" ? "Create course" : "Save changes"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
            {error}
          </div>
        )}
        {toast && (
          <div className="mt-4 rounded-xl border border-sage/40 bg-sage-soft/40 px-3 py-2 text-sm text-sage-deep">
            {toast}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField
            label="Title"
            value={form.title}
            onChange={(v) => setForm({ ...form, title: v })}
            required
          />
          <TextField
            label="Slug (URL handle)"
            value={form.slug}
            onChange={(v) =>
              setForm({
                ...form,
                slug: v
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""),
              })
            }
            required
            hint="Lowercase, dashes only — used in the public URL."
          />
          <TextField
            label="Instructor"
            value={form.instructor}
            onChange={(v) => setForm({ ...form, instructor: v })}
          />
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as CourseCategory,
                  type: e.target.value === "diploma" ? "diploma" : "academy",
                })
              }
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            >
              {ADMIN_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <NumberField
            label="Price (INR)"
            value={form.priceInr}
            onChange={(v) => setForm({ ...form, priceInr: v })}
            min={0}
            hint={`Displays as ${formatInr(form.priceInr)}`}
          />
          <NumberField
            label="Validity (days)"
            value={form.validityDays}
            onChange={(v) => setForm({ ...form, validityDays: v })}
            min={1}
          />
          <NumberField
            label="Estimated hours"
            value={form.estimatedHours}
            onChange={(v) => setForm({ ...form, estimatedHours: v })}
            min={0}
          />
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Cover colour
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="color"
                value={form.coverColor}
                onChange={(e) =>
                  setForm({ ...form, coverColor: e.target.value })
                }
                className="h-10 w-10 cursor-pointer rounded-md border border-line"
              />
              <input
                value={form.coverColor}
                onChange={(e) =>
                  setForm({ ...form, coverColor: e.target.value })
                }
                className="flex-1 rounded-xl border border-line bg-cream px-3 py-2 font-mono text-sm outline-none focus:border-clinical"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
          </div>
          <label className="sm:col-span-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-cream px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="h-4 w-4"
            />
            <span>
              <strong>Published</strong> — visible on /academy or /diploma.
              Uncheck to keep as a draft.
            </span>
          </label>
        </div>

        {/* Bottom-of-form submit so the user never has to scroll back up. */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
          {courseId === "new" && (
            <p className="text-[0.78rem] text-ink-soft">
              Click <strong>Create course</strong> to unlock the curriculum section below.
            </p>
          )}
          <button
            type="submit"
            disabled={savingCourse}
            className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-5 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {savingCourse ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {courseId === "new" ? "Create course" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Modules + lessons — always visible, but inert in "new" mode until the
          course is saved (modules need a course id to attach to). */}
      {courseId === "new" && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
                Curriculum
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Organise your course into modules and lessons after creating it.
              </p>
            </div>
            <button
              type="button"
              disabled
              title="Save the course first to start adding modules."
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-full bg-clinical/40 px-4 py-2 text-sm font-medium text-cream"
            >
              <Plus size={14} /> New module
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream-deep/40 p-8 text-sm text-ink-soft">
            <div className="flex items-start gap-3">
              <Save size={16} className="mt-0.5 shrink-0 text-clinical" />
              <div>
                <div className="font-medium text-brand-brown">
                  Step 1 — fill the form above and click <strong>Create course</strong>.
                </div>
                <p className="mt-1">
                  Once the course exists, this section unlocks. You&apos;ll be able to:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Add <strong>modules</strong> (e.g. &quot;Foundations&quot;, &quot;Mock series&quot;)</li>
                  <li>
                    Add <strong>lessons</strong> inside each module — title, duration,
                    description
                  </li>
                  <li>
                    <strong>Drag-and-drop the lesson video</strong> (MP4 / WebM / MOV up
                    to 1 GB) directly onto the lesson card
                  </li>
                  <li>
                    Lessons can be saved <em>without</em> a video — upload the file
                    later when you have it
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {courseId !== "new" && course && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
                Curriculum
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Organise your course into modules. Each module contains
                lessons; lessons can be uploaded later if you don&apos;t have
                the video yet.
              </p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
            >
              <Plus size={14} /> New module
            </button>
          </div>

          <ol className="mt-6 space-y-3">
            {course.modules.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-line bg-cream-deep/40 p-10 text-center text-sm text-ink-soft">
                No modules yet — start by adding one.
              </li>
            ) : (
              course.modules.map((m, idx) => (
                <li
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-line bg-cream"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-cream-deep text-[0.78rem] font-medium text-brand-brown">
                        {idx + 1}
                      </span>
                      <div className="font-display text-lg text-brand-brown">
                        {m.title}
                      </div>
                      <span className="text-[0.7rem] text-ink-soft">
                        {m.lessons.length} lesson
                        {m.lessons.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setLessonModal({ moduleId: m.id, lesson: null })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-cream px-2.5 py-1 text-[0.72rem] text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
                      >
                        <Plus size={11} /> Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => renameModule(m)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink hover:border-brand-brown/40 hover:text-brand-brown"
                        title="Rename"
                        aria-label="Rename"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeModule(m)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-coral/50 text-coral hover:bg-coral hover:text-cream"
                        title="Delete module"
                        aria-label="Delete module"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {m.lessons.length === 0 ? (
                    <div className="px-5 py-4 text-sm text-ink-soft">
                      No lessons yet — click <strong>Lesson</strong> above to add
                      one.
                    </div>
                  ) : (
                    <ul className="divide-y divide-line">
                      {m.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            {l.hasVideo ? (
                              <CheckCircle2
                                size={15}
                                className="text-sage-deep"
                              />
                            ) : (
                              <FileVideo
                                size={15}
                                className="text-brand-brown/40"
                              />
                            )}
                            <span className="truncate text-ink">{l.title}</span>
                            <span className="text-[0.7rem] text-ink-soft">
                              {formatDuration(l.durationSec)}
                            </span>
                            {!l.hasVideo && (
                              <span className="rounded-full bg-sun/30 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-brand-brown">
                                No video
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setLessonModal({ moduleId: m.id, lesson: l })
                              }
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-brand-brown hover:border-clinical hover:bg-clinical hover:text-cream"
                              title="Edit"
                              aria-label="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeLesson(m.id, l.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-coral/50 text-coral hover:bg-coral hover:text-cream"
                              title="Delete lesson"
                              aria-label="Delete lesson"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
            )}
          </ol>
        </section>
      )}

      {lessonModal && (
        <LessonEditor
          moduleId={lessonModal.moduleId}
          initial={lessonModal.lesson}
          onClose={() => setLessonModal(null)}
          onSaved={(lesson) => onLessonSaved(lessonModal.moduleId, lesson)}
        />
      )}

      {moduleModal && (
        <ModuleTitleModal
          mode={moduleModal.mode}
          initial={
            moduleModal.mode === "rename" ? moduleModal.module.title : ""
          }
          onClose={() => setModuleModal(null)}
          onSave={handleModuleModalSave}
        />
      )}
    </>
  );
}

/* ---------------- Module title modal (branded replacement for prompt()) ---- */

function ModuleTitleModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "create" | "rename";
  initial: string;
  onClose: () => void;
  onSave: (title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSave(title.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
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
        onSubmit={submit}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              {mode === "create" ? "New module" : "Rename module"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              {mode === "create"
                ? "Add a module to this course"
                : `Rename “${initial}”`}
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

        <div className="px-6 py-5">
          <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
            Module title
          </label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              mode === "create" ? 'e.g. "Foundations of Psychology"' : ""
            }
            className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
          />
          <p className="mt-1.5 text-[0.7rem] text-ink-soft">
            A module is a chapter that holds one or more lessons. You can rename it later.
          </p>

          {error && (
            <p className="mt-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-6 py-4">
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
              <Loader2 size={13} className="animate-spin" />
            ) : mode === "create" ? (
              <Plus size={13} />
            ) : (
              <Save size={13} />
            )}
            {mode === "create" ? "Create module" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  required,
  ...rest
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
        {...rest}
      />
      {hint && <p className="mt-1 text-[0.7rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
        {label}
      </label>
      <input
        type="number"
        /* Render blank when 0 so the user doesn't type onto a leading "0".
           Typing in a blank field starts fresh from the first digit. */
        value={value === 0 ? "" : value}
        min={min}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(0);
          /* Strip any accidental leading zeros (e.g. "0900" → 900). */
          const stripped = raw.replace(/^0+(?=\d)/, "");
          const n = parseInt(stripped, 10);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        placeholder={min != null ? String(min) : "0"}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
      />
      {hint && <p className="mt-1 text-[0.7rem] text-ink-soft">{hint}</p>}
    </div>
  );
}

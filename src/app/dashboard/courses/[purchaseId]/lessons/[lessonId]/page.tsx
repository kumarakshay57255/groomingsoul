"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useAuth } from "@/lib/auth";
import { API_BASE_URL, ApiError } from "@/lib/api";
import {
  fetchLesson,
  markLessonComplete,
  type LessonView,
} from "@/lib/dashboard";

type Params = { purchaseId: string; lessonId: string };

export default function LessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { purchaseId, lessonId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [view, setView] = useState<LessonView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completionToast, setCompletionToast] = useState<string | null>(null);

  /* Auth gate */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(
        `/login?next=/dashboard/courses/${purchaseId}/lessons/${lessonId}`
      );
    }
  }, [authLoading, user, purchaseId, lessonId, router]);

  /* Load lesson */
  useEffect(() => {
    if (!user) return;
    let live = true;
    setLoading(true);
    setError(null);
    fetchLesson(lessonId)
      .then((v) => {
        if (live) setView(v);
      })
      .catch((err) => {
        if (!live) return;
        if (err instanceof ApiError) setError(err.message);
        else setError("Couldn't load this lesson.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [user, lessonId]);

  const streamFullUrl = useMemo(() => {
    if (!view) return "";
    return view.lesson.streamUrl.startsWith("http")
      ? view.lesson.streamUrl
      : `${API_BASE_URL}${view.lesson.streamUrl}`;
  }, [view]);

  const watermark = useMemo(() => {
    if (!user) return "Grooming Souls";
    return `${user.phone}  ·  ${user.email}`;
  }, [user]);

  const handleComplete = useCallback(async () => {
    if (!view || view.lesson.completedAt) return;
    setCompleting(true);
    try {
      const result = await markLessonComplete(view.lesson.id);
      setView({
        ...view,
        lesson: { ...view.lesson, completedAt: new Date().toISOString() },
      });
      if (result.certificateQueued) {
        setCompletionToast(
          "Final lesson done — your hardcopy certificate is queued for dispatch."
        );
      } else if (result.progress.percent === 100) {
        setCompletionToast("Course complete — 100%.");
      } else {
        setCompletionToast(
          `Lesson marked complete · ${result.progress.percent}% done.`
        );
      }
    } catch (err) {
      setCompletionToast(
        err instanceof ApiError
          ? err.message
          : "Could not save completion — please try again."
      );
    } finally {
      setCompleting(false);
    }
  }, [view]);

  if (authLoading || !user || loading) {
    return (
      <>
        <Nav />
        <main className="flex flex-1 items-center justify-center pt-28">
          <div className="flex items-center gap-2 text-ink-soft">
            <Loader2 size={16} className="animate-spin" />
            Loading lesson…
          </div>
        </main>
      </>
    );
  }

  if (error || !view) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-2xl px-5 pt-32 pb-24 text-center sm:px-8">
          <h1 className="font-display text-3xl text-brand-brown">
            Lesson unavailable.
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-soft">
            {error ??
              "We couldn't load this lesson. Your access may have expired or the link is invalid."}
          </p>
          <Link
            href={`/dashboard/courses/${purchaseId}`}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-clinical px-5 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            Back to curriculum
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const { lesson, course, navigation } = view;
  const done = !!lesson.completedAt;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
            style={{
              background: `linear-gradient(180deg, ${course.coverColor}1a 0%, transparent 70%)`,
            }}
          />
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <Link
                href={`/dashboard/courses/${purchaseId}`}
                className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
              >
                <ArrowLeft size={14} /> Curriculum
              </Link>
              <div className="text-[0.78rem] text-ink-soft">
                Lesson {navigation.lessonIndex} of {navigation.lessonTotal}
              </div>
            </div>

            <p className="mt-6 text-xs uppercase tracking-[0.22em] text-sage-deep">
              {course.title}
            </p>
            <h1 className="mt-2 font-display text-balance text-3xl text-brand-brown sm:text-4xl md:text-5xl">
              {lesson.title}
            </h1>

            <div className="mt-7">
              <VideoPlayer
                src={streamFullUrl}
                posterColor={course.coverColor}
                watermark={watermark}
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-[0.7rem] text-ink-soft">
              <ShieldCheck size={12} className="text-sage-deep" />
              Stream URL rotates every 10 minutes · downloads are blocked ·
              your phone &amp; email overlay every video to deter recording.
            </div>

            {completionToast && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl border border-sage/40 bg-sage-soft/40 px-4 py-3 text-sm text-sage-deep">
                {completionToast.includes("dispatch") ? (
                  <GraduationCap size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {completionToast}
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-between gap-3 sm:flex-row">
              {/* Prev */}
              {navigation.prevLessonId ? (
                <Link
                  href={`/dashboard/courses/${purchaseId}/lessons/${navigation.prevLessonId}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-cream px-5 py-2.5 text-sm font-medium text-brand-brown hover:border-brand-brown/40"
                >
                  <ArrowLeft size={14} /> Previous lesson
                </Link>
              ) : (
                <span className="text-[0.78rem] text-ink-soft">
                  You&apos;re on the first lesson.
                </span>
              )}

              <button
                type="button"
                onClick={handleComplete}
                disabled={done || completing}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all ${
                  done
                    ? "border border-sage bg-sage-soft text-sage-deep"
                    : "bg-clinical text-cream hover:bg-clinical-deep"
                } disabled:opacity-80`}
              >
                {completing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Saving…
                  </>
                ) : done ? (
                  <>
                    <CheckCircle2 size={15} /> Completed
                  </>
                ) : (
                  "Mark as complete"
                )}
              </button>

              {/* Next */}
              {navigation.nextLessonId ? (
                <Link
                  href={`/dashboard/courses/${purchaseId}/lessons/${navigation.nextLessonId}`}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-brown px-5 py-2.5 text-sm font-medium text-cream hover:bg-brand-brown/85"
                >
                  Next lesson <ArrowRight size={14} />
                </Link>
              ) : (
                <span className="text-[0.78rem] text-ink-soft">
                  Last lesson — well done.
                </span>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

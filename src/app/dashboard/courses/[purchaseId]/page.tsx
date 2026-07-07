"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock4,
  Lock,
  PlayCircle,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { useAuth } from "@/lib/auth";
import {
  fetchPurchaseCurriculum,
  type DashboardPurchase,
} from "@/lib/dashboard";
import { categoryLabel, formatDuration } from "@/lib/courses";
import { describeExpiry } from "@/lib/relativeExpiry";

type Params = { purchaseId: string };

export default function CurriculumPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { purchaseId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<DashboardPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=/dashboard/courses/${purchaseId}`);
    }
  }, [authLoading, user, router, purchaseId]);

  useEffect(() => {
    if (!user) return;
    let live = true;
    setLoading(true);
    fetchPurchaseCurriculum(purchaseId)
      .then((d) => {
        if (live) setData(d);
      })
      .catch(() => {
        if (live) setError("Couldn't load this course.");
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [user, purchaseId]);

  if (authLoading || !user || loading) {
    return (
      <>
        <Nav />
        <main className="flex flex-1 items-center justify-center pt-28">
          <span className="text-sm text-ink-soft">Loading curriculum…</span>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Nav />
        <main className="flex flex-1 flex-col items-center justify-center pt-28 text-center">
          <h1 className="font-display text-3xl text-brand-brown">
            We couldn&apos;t find this course in your library.
          </h1>
          <p className="mt-3 max-w-md text-sm text-ink-soft">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-clinical px-5 py-2.5 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            Back to dashboard
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const expiresHuman = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const locked = !data.isUnlocked;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem]"
            style={{
              background: `linear-gradient(180deg, ${data.course.coverColor}22 0%, transparent 70%)`,
            }}
          />
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
            >
              <ArrowLeft size={14} /> Back to dashboard
            </Link>

            <div className="mt-6 grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-cream"
                  style={{ backgroundColor: data.course.coverColor }}
                >
                  {categoryLabel[data.course.category]}
                </span>
                <h1 className="mt-5 font-display text-balance text-4xl text-brand-brown sm:text-5xl">
                  {data.course.title}
                </h1>
                {data.course.instructor && (
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-sage-deep">
                    {data.course.instructor}
                  </p>
                )}
                {data.course.description && (
                  <p className="mt-5 max-w-2xl text-pretty text-ink-soft">
                    {data.course.description}
                  </p>
                )}
              </div>

              <aside className="lg:col-span-4">
                <div className="rounded-3xl border border-line bg-cream p-6">
                  {data.status === "active" &&
                    (() => {
                      const e = describeExpiry(data.expiresAt);
                      return (
                        <>
                          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-sage-deep">
                            <ShieldCheck size={13} /> Active access
                          </div>
                          <div className="mt-2 font-display text-3xl text-brand-brown">
                            {e.label}
                          </div>
                          <p className="mt-1 text-xs text-ink-soft">
                            Expires on {expiresHuman}
                          </p>
                          {e.warn && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-coral/40 bg-coral-soft/55 px-3 py-1 text-[0.7rem] text-brand-brown">
                              ⚠ Access ends soon — consider renewing.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  {data.status === "expired" && (
                    <>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-brand-brown">
                        <TimerReset size={13} /> Access expired
                      </div>
                      <p className="mt-3 text-sm text-ink-soft">
                        Your access ended on {expiresHuman}. Renew this course
                        to continue from where you left off.
                      </p>
                      <Link
                        href={`/${data.course.type === "diploma" ? "diploma" : "academy"}/courses/${data.course.slug}`}
                        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-clinical px-5 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
                      >
                        Renew access
                      </Link>
                    </>
                  )}
                  {data.status === "pending_verification" && (
                    <p className="text-sm text-ink-soft">
                      Your receipt is under review. You&apos;ll see lessons
                      unlock within 12 hours.
                    </p>
                  )}

                  <div className="mt-5 border-t border-line pt-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-sage-deep">
                      Your progress
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-deep">
                        <div
                          className="h-full bg-sage"
                          style={{ width: `${data.progress.percent}%` }}
                        />
                      </div>
                      <span className="text-sm tabular-nums text-ink">
                        {data.progress.percent}%
                      </span>
                    </div>
                    <p className="mt-2 text-[0.78rem] text-ink-soft">
                      {data.progress.completedLessons} of{" "}
                      {data.progress.totalLessons} lessons completed
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="font-display text-3xl text-brand-brown">
              Curriculum
            </h2>

            <ol className="mt-6 space-y-3">
              {data.modules.map((m, i) => (
                <li
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-line bg-cream"
                >
                  <div className="flex items-center gap-3 border-b border-line px-5 py-4">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-cream-deep text-[0.78rem] font-medium text-brand-brown">
                      {i + 1}
                    </span>
                    <div>
                      <div className="font-display text-lg text-brand-brown">
                        {m.title}
                      </div>
                      <div className="text-[0.78rem] text-ink-soft">
                        {m.lessons.length} lesson
                        {m.lessons.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>

                  <ul className="divide-y divide-line">
                    {m.lessons.map((l) => {
                      const done = !!l.completedAt;
                      const enabled = !locked;
                      const inner = (
                        <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                          <div className="flex items-center gap-3 text-sm">
                            {done ? (
                              <CheckCircle2
                                size={18}
                                strokeWidth={1.7}
                                className="text-sage-deep"
                              />
                            ) : enabled ? (
                              <PlayCircle
                                size={18}
                                strokeWidth={1.7}
                                className="text-clinical"
                              />
                            ) : (
                              <Lock size={16} className="text-brand-brown/40" />
                            )}
                            <span
                              className={`text-pretty ${
                                enabled ? "text-ink" : "text-ink-soft"
                              }`}
                            >
                              {l.title}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink-soft">
                            <Clock4 size={12} />
                            {l.durationSec
                              ? formatDuration(l.durationSec)
                              : "—"}
                          </span>
                        </div>
                      );
                      return enabled ? (
                        <li key={l.id} className="hover:bg-cream-deep/40">
                          <Link
                            href={`/dashboard/courses/${data.id}/lessons/${l.id}`}
                          >
                            {inner}
                          </Link>
                        </li>
                      ) : (
                        <li key={l.id} aria-disabled="true">
                          {inner}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock4,
  GraduationCap,
  Lock,
  PlayCircle,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import {
  type CourseDetail,
  categoryLabel,
  formatDuration,
  formatInr,
} from "@/lib/courses";
import { CheckoutModal } from "./CheckoutModal";
import { useAuth } from "@/lib/auth";

type Props = {
  course: CourseDetail;
  /** When true, mark the certificate-by-courier highlight strongly. */
  showCertificateNotice?: boolean;
};

export function CourseDetailView({ course, showCertificateNotice }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(course.modules.map((m) => m.id)) // expand all by default
  );
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  /**
   * Auto-open the checkout modal when the user lands here with ?buy=1 after
   * completing the sign-in / sign-up flow that was triggered by Buy Now.
   * We wait for auth to resolve so the modal isn't shown briefly to anon users.
   */
  useEffect(() => {
    if (authLoading) return;
    if (searchParams.get("buy") === "1" && user) {
      setCheckoutOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("buy");
      window.history.replaceState({}, "", url.toString());
    }
  }, [authLoading, user, searchParams]);

  function handleBuyNow() {
    if (authLoading) return;
    if (!user) {
      const here = window.location.pathname;
      const nextUrl = `${here}?buy=1`;
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }
    setCheckoutOpen(true);
  }

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const backHref = course.type === "diploma" ? "/diploma" : "/academy";
  const validityLabel =
    course.validityDays >= 180
      ? "6 months"
      : course.validityDays >= 90
        ? "3 months"
        : course.validityDays >= 30
          ? "1 month"
          : `${course.validityDays} days`;

  const totalLessons = course.modules.reduce(
    (n, m) => n + m.lessons.length,
    0
  );
  const totalSec = course.modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0),
    0
  );

  return (
    <section className="relative isolate overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28">
      {/* Hero band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]"
        style={{
          background: `linear-gradient(180deg, ${course.coverColor}22 0%, transparent 70%)`,
        }}
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
        >
          <ArrowLeft size={14} /> Back to{" "}
          {course.type === "diploma" ? "Diplomas" : "Academy"}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {/* Left — copy */}
          <div className="lg:col-span-7">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-cream"
              style={{ backgroundColor: course.coverColor }}
            >
              {categoryLabel[course.category]}
            </span>
            <h1 className="mt-5 font-display text-balance text-4xl text-brand-brown sm:text-5xl md:text-6xl">
              {course.title}
            </h1>
            <p className="mt-2 text-sm uppercase tracking-[0.18em] text-sage-deep">
              {course.instructor ?? "Grooming Souls"}
            </p>
            <p className="mt-6 max-w-2xl text-pretty text-ink-soft sm:text-lg">
              {course.description}
            </p>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-ink-soft">
              <li className="inline-flex items-center gap-2">
                <PlayCircle size={15} className="text-clinical" />
                {totalLessons} lessons · {course.modules.length} modules
              </li>
              {totalSec > 0 && (
                <li className="inline-flex items-center gap-2">
                  <Clock4 size={15} className="text-clinical" />
                  {formatDuration(totalSec)} of content
                </li>
              )}
              <li className="inline-flex items-center gap-2">
                <Lock size={15} className="text-clinical" />
                {validityLabel} access window
              </li>
              <li className="inline-flex items-center gap-2">
                <ShieldCheck size={15} className="text-clinical" />
                IP-protected streaming
              </li>
            </ul>

            {showCertificateNotice && (
              <div className="mt-7 flex gap-3 rounded-2xl border border-coral/30 bg-coral-soft/40 p-5">
                <GraduationCap
                  size={22}
                  strokeWidth={1.7}
                  className="mt-0.5 shrink-0 text-coral"
                />
                <div>
                  <p className="font-display text-lg text-brand-brown">
                    A premium hardcopy certificate, couriered to your door.
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Once you complete 100% of this diploma, our team manually
                    verifies, prints, and ships your physical certificate. No
                    auto-generated PDFs — every certificate is reviewed.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right — purchase card */}
          <aside className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-line bg-cream p-7 shadow-[0_18px_40px_-30px_rgba(92,58,46,0.45)]">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-sage-deep">
                    One-time fee
                  </div>
                  <div className="mt-1 font-display text-4xl text-brand-brown sm:text-5xl">
                    {formatInr(course.priceInr)}
                  </div>
                </div>
                <span className="rounded-full bg-cream-deep px-3 py-1 text-[0.7rem] uppercase tracking-wider text-brand-brown">
                  {validityLabel}
                </span>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm text-ink-soft">
                <Bullet>Verified by our Advisory Panel</Bullet>
                <Bullet>Manual QR-based checkout — no payment gateway</Bullet>
                <Bullet>Strict time-bound access from purchase date</Bullet>
                <Bullet>Speed control 0.5×–2× &amp; quality 240p–1080p</Bullet>
                <Bullet>Floating user watermark on every video</Bullet>
                {course.type === "diploma" && (
                  <Bullet>Hardcopy certificate couriered on completion</Bullet>
                )}
              </ul>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={authLoading}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-6 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep disabled:opacity-60"
              >
                <ShoppingBag size={15} /> Buy now · {formatInr(course.priceInr)}
              </button>
              <p className="mt-3 text-center text-[0.7rem] text-ink-soft">
                You&apos;ll be asked to upload a payment receipt — our team
                verifies it within 12 hours.
              </p>
            </div>
          </aside>
        </div>

        {/* Curriculum */}
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
                Curriculum
              </p>
              <h2 className="mt-2 font-display text-3xl text-brand-brown sm:text-4xl">
                Every module &amp; lesson in this course.
              </h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setOpen(
                  open.size === course.modules.length
                    ? new Set()
                    : new Set(course.modules.map((m) => m.id))
                )
              }
              className="text-xs uppercase tracking-[0.14em] text-brand-brown/80 hover:text-brand-brown"
            >
              {open.size === course.modules.length ? "Collapse all" : "Expand all"}
            </button>
          </div>

          <ol className="mt-8 space-y-3">
            {course.modules.map((m, i) => {
              const expanded = open.has(m.id);
              return (
                <li
                  key={m.id}
                  className="overflow-hidden rounded-2xl border border-line bg-cream"
                >
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-cream-deep/40"
                  >
                    <div className="flex items-center gap-3">
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
                    <span className="text-xs text-brand-brown/60">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>

                  {expanded && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="divide-y divide-line border-t border-line"
                    >
                      {m.lessons.map((l) => (
                        <li
                          key={l.id}
                          className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                        >
                          <div className="flex items-center gap-2.5 text-ink">
                            <PlayCircle
                              size={15}
                              className="text-brand-brown/40"
                            />
                            <span className="text-pretty">{l.title}</span>
                          </div>
                          <span className="text-[0.78rem] text-ink-soft">
                            {l.durationSec
                              ? formatDuration(l.durationSec)
                              : "—"}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        course={course}
      />
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
      <span>{children}</span>
    </li>
  );
}

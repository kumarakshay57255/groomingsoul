"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Clock4,
  Lock,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  TimerReset,
} from "lucide-react";
import {
  type PurchaseSummary,
  purchaseStatusLabel,
} from "@/lib/dashboard";
import { categoryLabel, formatInr } from "@/lib/courses";
import { describeExpiry } from "@/lib/relativeExpiry";

const STATUS_STYLES = {
  active: {
    badge: "bg-sage text-cream",
    chip: "border-sage/30 bg-sage-soft/40 text-sage-deep",
    icon: ShieldCheck,
  },
  pending_verification: {
    badge: "bg-sun/85 text-brand-brown",
    chip: "border-sun/40 bg-sun/20 text-brand-brown",
    icon: Clock4,
  },
  expired: {
    badge: "bg-brand-brown-light text-cream",
    chip: "border-brand-brown/20 bg-cream-deep text-brand-brown",
    icon: TimerReset,
  },
  rejected: {
    badge: "bg-coral text-cream",
    chip: "border-coral/40 bg-coral-soft/40 text-brand-brown",
    icon: ShieldAlert,
  },
} as const;

export function PurchaseCard({ purchase }: { purchase: PurchaseSummary }) {
  const styles = STATUS_STYLES[purchase.status];
  const StatusIcon = styles.icon;
  const course = purchase.course;
  if (!course) return null;

  const courseHref =
    course.type === "diploma"
      ? `/diploma/courses/${course.slug}`
      : `/academy/courses/${course.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-25px_rgba(92,58,46,0.35)]">
      <div
        aria-hidden
        className="relative h-28 overflow-hidden"
        style={{ backgroundColor: course.coverColor }}
      >
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-wider ${styles.badge}`}
        >
          <StatusIcon size={11} strokeWidth={2} />
          {purchaseStatusLabel(purchase.status)}
        </span>
        <span className="absolute bottom-3 left-4 rounded-full bg-cream/95 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-brand-brown">
          {categoryLabel[course.category]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl text-brand-brown sm:text-2xl">
          {course.title}
        </h3>

        {purchase.status === "active" &&
          (() => {
            const e = describeExpiry(purchase.expiresAt);
            return (
              <div className="mt-3 flex flex-wrap gap-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.75rem] ${styles.chip}`}
                >
                  <Clock4 size={12} />
                  {e.label}
                </div>
                {e.warn && !e.expired && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-coral/40 bg-coral-soft/55 px-3 py-1 text-[0.75rem] text-brand-brown">
                    <ShieldAlert size={12} />
                    Renew soon
                  </div>
                )}
              </div>
            );
          })()}

        {purchase.status === "pending_verification" && (
          <p className="mt-3 text-sm text-ink-soft">
            Our team typically verifies receipts within{" "}
            <strong>12 hours</strong>. You&apos;ll receive an email + see this
            unlock once it&apos;s approved.
          </p>
        )}

        {purchase.status === "expired" && (
          <p className="mt-3 text-sm text-ink-soft">
            Your <strong>{course.validityDays}-day</strong> access window has
            ended. Renew to continue from where you left off.
          </p>
        )}

        {purchase.status === "rejected" && (
          <div className="mt-3 rounded-xl border border-coral/30 bg-coral-soft/40 px-3 py-2 text-xs text-brand-brown">
            <div className="font-semibold uppercase tracking-wider">Reason</div>
            <div className="mt-1">
              {purchase.adminNote ?? "Receipt could not be verified."}
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          {purchase.status === "active" && (
            <Link
              href={`/dashboard/courses/${purchase.id}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-5 py-3 text-sm font-medium text-cream transition-all hover:bg-clinical-deep"
            >
              Enter course
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          )}

          {purchase.status === "pending_verification" && (
            <div className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-cream-deep px-5 py-3 text-sm font-medium text-brand-brown/70">
              <Lock size={14} /> Locked while we verify
            </div>
          )}

          {(purchase.status === "expired" || purchase.status === "rejected") && (
            <Link
              href={courseHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-5 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
            >
              <ShoppingBag size={14} />
              {purchase.status === "expired" ? "Renew access" : "Try again"}
              <span className="text-[0.78rem] opacity-80">
                · {formatInr(course.priceInr)}
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock4, GraduationCap, Lock } from "lucide-react";
import {
  formatInr,
  categoryLabel,
  courseCoverUrl,
  type CourseSummary,
} from "@/lib/courses";

export function CourseCard({ course }: { course: CourseSummary }) {
  const base =
    course.type === "diploma" ? "/diploma/courses" : "/academy/courses";
  const coverImage = courseCoverUrl(course);
  const validityLabel =
    course.validityDays >= 180
      ? "6 months access"
      : course.validityDays >= 90
        ? "3 months access"
        : course.validityDays >= 30
          ? "1 month access"
          : `${course.validityDays} days access`;

  return (
    <Link
      href={`${base}/${course.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(92,58,46,0.35)]"
    >
      <div
        className="relative h-32 overflow-hidden"
        style={{ backgroundColor: course.coverColor }}
      >
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={course.title}
              fill
              sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            {/* scrim so the category chip + arrow stay legible on any photo */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brand-brown/55 to-transparent" />
          </>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "14px 14px",
            }}
          />
        )}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <span className="rounded-full bg-cream/95 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-brand-brown">
            {categoryLabel[course.category]}
          </span>
          <ArrowUpRight
            size={18}
            className="text-cream/85 transition-transform group-hover:rotate-12"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl text-brand-brown sm:text-2xl">
          {course.title}
        </h3>
        <p className="mt-1 text-[0.75rem] uppercase tracking-[0.14em] text-sage-deep">
          {course.instructor ?? "Grooming Souls"}
        </p>

        <p className="mt-4 flex-1 text-pretty text-sm text-ink-soft line-clamp-3">
          {course.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.78rem] text-ink-soft">
          {course.estimatedHours ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock4 size={13} /> {course.estimatedHours}h content
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Lock size={13} /> {validityLabel}
          </span>
          {course.type === "diploma" && (
            <span className="inline-flex items-center gap-1.5 text-brand-brown">
              <GraduationCap size={13} /> Hardcopy cert
            </span>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="font-display text-2xl text-brand-brown">
            {formatInr(course.priceInr)}
          </span>
          <span className="rounded-full border border-brand-brown/20 px-3 py-1 text-[0.7rem] uppercase tracking-wider text-brand-brown transition-colors group-hover:bg-brand-brown group-hover:text-cream">
            View course
          </span>
        </div>
      </div>
    </Link>
  );
}

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CourseCard } from "./CourseCard";
import {
  academyCategories,
  type CourseSummary,
  type CourseCategory,
} from "@/lib/courses";

type Filter = "All" | Exclude<CourseCategory, "diploma">;

export function AcademyExplorer({ courses }: { courses: CourseSummary[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return courses;
    return courses.filter((c) => c.category === filter);
  }, [filter, courses]);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
              Academy Catalogue
            </p>
            <h2 className="mt-2 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
              Four academic segments. One disciplined approach.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            Choose the segment you&apos;re preparing for. Every course ships
            with strict time-bound access, secure streaming, and progress
            tracking.
          </p>
        </div>

        {/* Category tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          <TabChip
            label="All courses"
            count={courses.length}
            active={filter === "All"}
            onClick={() => setFilter("All")}
          />
          {academyCategories.map((cat) => {
            const count = courses.filter((c) => c.category === cat.value).length;
            return (
              <TabChip
                key={cat.value}
                label={cat.label}
                count={count}
                active={filter === cat.value}
                onClick={() => setFilter(cat.value)}
              />
            );
          })}
        </div>

        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-line bg-cream-deep/40 p-12 text-center text-ink-soft">
            No courses published in this category yet. Check back soon.
          </div>
        )}
      </div>
    </section>
  );
}

function TabChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
        active
          ? "border-brand-brown bg-brand-brown text-cream"
          : "border-line bg-cream text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[0.65rem] ${
          active
            ? "bg-cream/20 text-cream"
            : "bg-cream-deep text-brand-brown/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

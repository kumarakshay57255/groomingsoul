"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList } from "lucide-react";
import { tests } from "@/lib/tests";

export function TestsTeaser() {
  return (
    <section
      id="tests"
      className="relative overflow-hidden bg-cream-deep/55 py-24 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 right-0 h-[26rem] w-[26rem] rounded-full bg-sun/20 blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage-deep">
              <ClipboardList size={13} /> Free Psychometric Tests
            </p>
            <h2 className="mt-3 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
              Five clinical screenings.{" "}
              <span className="italic">Zero cost.</span>
            </h2>
            <p className="mt-5 max-w-md text-pretty text-ink-soft">
              Personality, cognition, stress, emotional intelligence, and
              open-ended self-reflection — analysed by our internal team and
              shared with you confidentially.
            </p>
            <Link
              href="/therapy/tests"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep"
            >
              Open the testing zone
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-3">
              {tests.map((t, i) => (
                <motion.li
                  key={t.slug}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                >
                  <Link
                    href={`/therapy/tests/${t.slug}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-cream p-5 transition-all hover:border-brand-brown/40 hover:bg-cream"
                  >
                    <div>
                      <div className="font-display text-lg text-brand-brown">
                        {t.name}
                      </div>
                      <div className="mt-0.5 text-[0.78rem] text-ink-soft">
                        {t.questions.length} items · ~{t.estMinutes} min
                      </div>
                    </div>
                    <span className="rounded-full border border-brand-brown/20 px-3 py-1 text-[0.7rem] uppercase tracking-wider text-brand-brown transition-colors group-hover:bg-brand-brown group-hover:text-cream">
                      Begin
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

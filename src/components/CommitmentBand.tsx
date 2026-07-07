"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Users, Stethoscope, Landmark } from "lucide-react";

const STATS = [
  { icon: Users, value: "15K+", label: "Lives Impacted", sub: "Through therapy, support and empowerment." },
  { icon: Stethoscope, value: "40+", label: "Expert Professionals", sub: "Psychologists, counselors and wellness experts." },
  { icon: Landmark, value: "12+", label: "Programs & Initiatives", sub: "Designed for healing, growth and transformation." },
];

export function CommitmentBand() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Green foliage accent — top right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf-green.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-10 hidden h-72 w-auto rotate-[125deg] opacity-30 lg:block"
      />
      {/* Gold leaf sprig — bottom left, near the button */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-4 bottom-0 hidden h-56 w-auto rotate-[200deg] opacity-45 lg:block"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        {/* Left — copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
              About Grooming Souls
            </span>
            <span className="h-px w-16 bg-gold/60" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-balance text-ink sm:text-5xl"
          >
            More Than Care.
            <br />
            <span className="italic text-sage-deep">A Commitment for Life.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-lg text-pretty leading-relaxed text-ink-soft"
          >
            Grooming Souls is a Section 8 Mental Health NGO committed to
            psychological well-being, mental welfare, and academic excellence.
            We believe every mind deserves understanding, every emotion
            deserves support, and every individual deserves a chance to thrive.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8"
          >
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full border border-sage-deep/50 bg-cream px-6 py-3 text-sm font-medium text-sage-deep transition-all hover:border-sage-deep hover:bg-sage-soft/30"
            >
              Learn more about us
              <span className="grid h-6 w-6 place-items-center rounded-full border border-sage-deep/40 transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={13} />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Right — stat panel (light green, divided columns) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[1.75rem] bg-[#f0f2e8] p-6 shadow-[0_24px_60px_-32px_rgba(90,106,63,0.45)] sm:p-8"
        >
          <div className="grid grid-cols-1 divide-y divide-sage/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {STATS.map(({ icon: Icon, value, label, sub }) => (
              <div
                key={label}
                className="flex flex-col px-2 py-5 first:pt-0 last:pb-0 sm:px-5 sm:py-0"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage-soft/60 text-sage-deep">
                  <Icon size={26} strokeWidth={1.5} />
                </span>
                <div className="mt-4 font-display text-4xl tracking-tight text-ink">
                  {value}
                </div>
                <div className="mt-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-sage-deep">
                  {label}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

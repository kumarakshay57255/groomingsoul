"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="px-5 pb-24 sm:px-8 sm:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-line bg-cream-deep px-7 py-16 text-center sm:px-12 sm:py-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 left-1/3 h-80 w-80 rounded-full bg-coral-soft/70 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-sage-soft/70 blur-3xl"
        />

        <p className="relative text-xs uppercase tracking-[0.22em] text-sage-deep">
          Begin your journey
        </p>
        <h2 className="relative mt-3 font-display text-4xl text-balance text-brand-brown sm:text-5xl md:text-6xl">
          Your mind deserves a{" "}
          <span className="italic">soft place to land.</span>
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-pretty text-ink-soft">
          Reach out for a confidential first conversation, or explore a free
          psychometric test — no payment, no pressure.
        </p>

        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/therapy"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-navy-deep hover:shadow-lg sm:text-base"
          >
            Book a free session
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          <Link
            href="/academy"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-brown/25 bg-cream px-7 py-3.5 text-sm font-medium text-brand-brown transition-all hover:border-brand-brown/60 sm:text-base"
          >
            Explore the Academy
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

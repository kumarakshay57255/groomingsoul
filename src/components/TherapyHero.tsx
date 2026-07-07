"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";

export function TherapyHero() {
  return (
    <section className="relative overflow-hidden bg-cream pt-24 sm:pt-28">
      {/* Full-bleed room photo — right half (desktop) */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
        <Image
          src="/therapy-room-crop.png"
          alt="A calm, softly lit therapy room with a chair, plant and a framed quote reading 'Your mental health matters. You matter.'"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>

      {/* Faint gold botanical, far left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf-green.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-8 top-1/4 hidden h-72 w-auto opacity-[0.14] lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-28">
        {/* Left — copy */}
        <div className="lg:pr-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-sage-deep">
              Therapy &amp; Mental Health Sessions
            </span>
            <span className="h-px w-12 bg-gold/60" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-5xl leading-[1.02] tracking-tight text-balance text-ink sm:text-6xl lg:text-7xl"
          >
            Therapy that meets you{" "}
            <span className="italic text-sage-deep">where you are.</span>
          </motion.h1>

          {/* gold flourish */}
          <div className="mt-6 flex items-center gap-2 text-gold/70">
            <span className="h-px w-24 bg-gold/50" />
            <Leaf size={14} />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-md text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
          >
            Confidential 1-on-1 sessions with verified psychologists, and free
            clinical-grade psychometric tests. No payment gateway — only a
            conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="#therapists"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-navy-deep hover:shadow-lg sm:text-base"
            >
              Browse therapists
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#tests"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-sage-deep/50 bg-cream px-7 py-3.5 text-sm font-medium text-sage-deep transition-all hover:border-sage-deep hover:bg-sage-soft/25 sm:text-base"
            >
              Take a free test
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </motion.div>
        </div>

        {/* Right — spacer on desktop (image is absolute); inline image on mobile */}
        <div className="lg:hidden">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/therapy-room-crop.png"
              alt="A calm, softly lit therapy room"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Lock, UserRound, HandHeart } from "lucide-react";

const HERO_STATS = [
  { icon: Lock, label: "100% Confidential" },
  { icon: UserRound, label: "No judgement" },
  { icon: HandHeart, label: "Only support" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-28 sm:pb-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-20 h-[30rem] w-[30rem] rounded-full bg-terracotta-soft/60 blur-3xl animate-breathe" />
        <div
          className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-sage-soft/60 blur-3xl animate-breathe"
          style={{ animationDelay: "2.5s" }}
        />
        <div className="absolute inset-0 bg-grain opacity-50" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        {/* Left — copy */}
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-terracotta/30 bg-terracotta-soft/40 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.22em] text-terracotta"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            A Section 8 Mental Health NGO
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-balance text-navy sm:text-6xl lg:text-[4.5rem]"
          >
            Transforming Minds,
            <br />
            <span className="italic">Nurturing</span>{" "}
            <span className="relative inline-block italic">
              <span className="relative z-10">Souls.</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-2 rounded-full bg-gold/70"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-pretty text-base text-ink-soft sm:text-[1.05rem]"
          >
            Dedicated psychological care, mental wellness, and academic
            excellence under one safe roof. A space to heal, grow and thrive
            — together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/therapy"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-navy-deep hover:shadow-lg sm:text-[0.95rem]"
            >
              Book a Session
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/therapy/tests"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-navy/25 bg-cream/70 px-7 py-3.5 text-sm font-medium text-navy backdrop-blur transition-all hover:border-navy/60 hover:bg-cream sm:text-[0.95rem]"
            >
              Take a free psychology test
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line/60 pt-6"
          >
            {HERO_STATS.map(({ icon: Icon, label }, i) => (
              <li key={label} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    aria-hidden
                    className="hidden h-1 w-1 rounded-full bg-ink-soft/30 sm:inline-block"
                  />
                )}
                <span className="flex items-center gap-2 text-sage-deep">
                  <Icon size={16} strokeWidth={1.8} />
                  <span className="text-sm font-medium text-ink">{label}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right — new hero art (no frame, blends into cream bg) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[460px]"
        >
          <Image
            src="/hero-transforming-clean.png"
            alt="A silhouette of a woman filled with forest imagery — trees, birds, and light"
            width={522}
            height={522}
            priority
            sizes="(min-width: 1024px) 40vw, 80vw"
            className="h-auto w-full"
          />
        </motion.div>
      </div>
    </section>
  );
}

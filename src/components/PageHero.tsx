"use client";

import { motion } from "framer-motion";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-24 left-1/3 h-[28rem] w-[28rem] rounded-full bg-coral-soft/55 blur-3xl animate-breathe" />
        <div
          className="absolute -bottom-24 right-1/4 h-[26rem] w-[26rem] rounded-full bg-sage-soft/55 blur-3xl animate-breathe"
          style={{ animationDelay: "3s" }}
        />
        <div className="absolute inset-0 bg-grain opacity-50" />
      </div>

      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.22em] text-sage-deep"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 font-display text-balance text-5xl text-brand-brown sm:text-6xl md:text-7xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-5 max-w-2xl text-pretty text-base text-ink-soft sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-9"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeartHandshake, Users, BookOpen, Globe, ArrowRight } from "lucide-react";

const STATS = [
  { icon: HeartHandshake, value: "15K+", label: "Lives Impacted" },
  { icon: Users, value: "40+", label: "Expert Professionals" },
  { icon: BookOpen, value: "12+", label: "Programs & Initiatives" },
  { icon: Globe, value: "8+", label: "Cities Reached" },
];

export function RealPeople() {
  return (
    <section className="px-5 py-10 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-navy px-6 py-9 text-cream sm:px-12 sm:py-10"
      >
        {/* Gold leaf branches — top-left & bottom-right corners */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/botanicals/corner-leaf.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-4 -top-6 hidden h-40 w-auto opacity-50 lg:block"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/botanicals/corner-leaf.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-6 -right-4 hidden h-40 w-auto rotate-180 opacity-50 lg:block"
        />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-6">
          {/* Heading */}
          <div className="lg:w-[19rem] lg:shrink-0">
            <div className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gold">
              Our Impact
            </div>
            <h2 className="mt-2 font-display text-[1.7rem] text-cream lg:whitespace-nowrap">
              Real People.{" "}
              <span className="italic text-gold">Real Change.</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cream/70">
              Every number represents a life touched, a mind supported, a
              future transformed.
            </p>
          </div>

          <span className="hidden h-24 w-px bg-gold/25 lg:block" />

          {/* Stats */}
          <div className="flex flex-1 items-center justify-between gap-2 sm:gap-4">
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <div key={label} className="flex items-center gap-2 sm:gap-4">
                {i > 0 && (
                  <span className="hidden h-20 w-px bg-gold/20 sm:block" />
                )}
                <div className="flex flex-col items-center px-1 text-center">
                  <Icon size={26} strokeWidth={1.5} className="text-gold" />
                  <div className="mt-2 font-display text-3xl tracking-tight text-cream sm:text-4xl">
                    {value}
                  </div>
                  <div className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-gold sm:text-[0.68rem]">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <span className="hidden h-24 w-px bg-gold/25 lg:block" />

          {/* CTA */}
          <div className="lg:w-52 lg:shrink-0">
            <div className="font-display text-xl leading-snug text-cream">
              Ready to take the first step?
            </div>
            <p className="mt-1 text-sm text-cream/70">
              We&apos;re here to listen and help.
            </p>
            <Link
              href="/therapy"
              className="group mt-4 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-navy transition-all hover:bg-gold-soft"
            >
              Book a session
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

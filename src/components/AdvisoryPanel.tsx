"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ClipboardList,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Leaf,
  Network,
  Sprout,
  Stethoscope,
  Users,
} from "lucide-react";
import { type AdvisoryMember } from "@/lib/advisory";

/** Rotating gold-outline icons for the advisory cards (matches the design). */
const ICONS = [
  Brain,
  Stethoscope,
  HeartPulse,
  Users,
  Sprout,
  Network,
  GraduationCap,
  ClipboardList,
  HandHeart,
];

export function AdvisoryPanel({ members }: { members: AdvisoryMember[] }) {
  if (members.length === 0) return null;

  return (
    <section
      id="advisory"
      className="relative scroll-mt-24 overflow-hidden bg-navy py-24 text-cream sm:py-32"
    >
      {/* Detailed gold botanical branches — corners */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-6 hidden h-80 w-auto opacity-40 lg:block"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-0 hidden h-80 w-auto rotate-180 opacity-40 lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Eyebrow: line — icon — ADVISORY PANEL — line */}
          <div className="flex items-center justify-center gap-3 text-gold">
            <span className="h-px w-10 bg-gold/50" />
            <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50">
              <Users size={16} strokeWidth={1.6} />
            </span>
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em]">
              Advisory Panel
            </span>
            <span className="h-px w-10 bg-gold/50" />
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-4xl leading-[1.08] text-balance text-cream sm:text-5xl"
          >
            A wall of trust,
            <br />
            <span className="italic text-sage">
              built by India&apos;s leading minds.
            </span>
          </motion.h2>

          {/* small gold flourish */}
          <div className="mt-4 flex items-center justify-center gap-2 text-gold/70">
            <span className="h-px w-8 bg-gold/50" />
            <Leaf size={13} />
            <span className="h-px w-8 bg-gold/50" />
          </div>

          <p className="mt-4 text-pretty text-cream/70">
            Onboarded senior psychologists and doctors who supervise our
            clinical standards, intern training, and academic curriculum.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((a, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                className="flex items-center gap-4 rounded-xl border border-gold/20 bg-cream/[0.03] p-4 transition-colors hover:border-gold/45 hover:bg-cream/[0.06]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <span className="h-10 w-px shrink-0 bg-gold/25" />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate font-display text-lg text-cream">
                    {a.name}
                  </div>
                  <div className="mt-0.5 truncate text-[0.68rem] uppercase tracking-[0.14em] text-gold/80">
                    {a.role}
                  </div>
                </div>
                <ArrowRight size={16} className="shrink-0 text-gold/70" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

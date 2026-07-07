"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, Brain, GraduationCap, ScrollText } from "lucide-react";
import { offers } from "@/lib/site";

const icons = [Heart, Brain, GraduationCap, ScrollText];

const toneStyles: Record<
  "clinical" | "sage" | "coral" | "sun",
  { ring: string; chip: string; iconBg: string; iconColor: string }
> = {
  clinical: {
    ring: "hover:border-clinical/50",
    chip: "bg-clinical-soft text-clinical-deep",
    iconBg: "bg-clinical-soft",
    iconColor: "text-clinical-deep",
  },
  sage: {
    ring: "hover:border-sage/60",
    chip: "bg-sage-soft text-sage-deep",
    iconBg: "bg-sage-soft",
    iconColor: "text-sage-deep",
  },
  coral: {
    ring: "hover:border-coral/60",
    chip: "bg-coral-soft text-brand-brown",
    iconBg: "bg-coral-soft",
    iconColor: "text-coral",
  },
  sun: {
    ring: "hover:border-sun/70",
    chip: "bg-sun/30 text-brand-brown",
    iconBg: "bg-sun/30",
    iconColor: "text-brand-brown",
  },
};

export function Offers() {
  return (
    <section className="relative py-24 sm:py-32" id="offers">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
            What we offer
          </p>
          <h2 className="mt-3 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
            One safe roof, four dedicated journeys.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-soft">
            From confidential therapy to elite exam prep — every part of the
            platform is built around clinical care and academic depth.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {offers.map((o, i) => {
            const Icon = icons[i];
            const tone = toneStyles[o.tone];
            return (
              <motion.div
                key={o.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
              >
                <Link
                  href={o.href}
                  className={`group relative flex h-full flex-col rounded-3xl border border-line bg-cream p-7 transition-all duration-300 ${tone.ring} hover:-translate-y-1 hover:shadow-[0_18px_40px_-22px_rgba(92,58,46,0.35)]`}
                >
                  <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${tone.iconBg} ${tone.iconColor}`}
                  >
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <h3 className="mt-6 font-display text-2xl text-brand-brown">
                    {o.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm text-ink-soft">{o.blurb}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4">
                    <span className={`rounded-full px-2.5 py-1 text-[0.7rem] uppercase tracking-wider ${tone.chip}`}>
                      {o.cta}
                    </span>
                    <ArrowUpRight
                      size={18}
                      className="text-brand-brown/40 transition-all group-hover:rotate-12 group-hover:text-brand-brown"
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

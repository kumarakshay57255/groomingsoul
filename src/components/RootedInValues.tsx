"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Heart, HandHeart, ShieldCheck, Sprout, Users } from "lucide-react";

const VALUES = [
  { icon: HandHeart, title: "Compassion", body: "We listen with empathy and respond with care." },
  { icon: ShieldCheck, title: "Integrity", body: "We protect trust and uphold the highest ethical standards." },
  { icon: Sprout, title: "Growth", body: "We empower individuals to heal, learn and become their best." },
  { icon: Users, title: "Inclusivity", body: "We embrace every individual with respect, dignity and open hearts." },
];

export function RootedInValues() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-cream sm:py-32">
      {/* Detailed gold botanical branches (vector, razor-sharp) — corners.
          Light-golden + fully contained within the band. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/2 hidden max-h-full w-auto -translate-y-1/2 object-contain opacity-55 sm:block"
        style={{ height: "min(78%, 26rem)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/2 hidden max-h-full w-auto -translate-y-1/2 -scale-x-100 object-contain opacity-55 sm:block"
        style={{ height: "min(78%, 26rem)" }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* Heart + arrow flourish */}
        <div className="flex items-center justify-center gap-3 text-gold">
          <span className="h-px w-16 bg-gold/50 sm:w-24" />
          <Heart size={20} strokeWidth={1.6} />
          <span className="flex items-center">
            <span className="h-px w-16 bg-gold/50 sm:w-24" />
            <ArrowLeft size={14} className="-ml-1" />
          </span>
        </div>

        <div className="mx-auto mt-4 max-w-2xl text-center">
          <div className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gold">
            Our Approach
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-3 font-display text-4xl text-balance text-cream sm:text-5xl"
          >
            Rooted in Values,{" "}
            <span className="italic text-gold">Driven by Purpose.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-3 text-pretty text-cream/70"
          >
            Everything we do is guided by principles that put people first.
          </motion.p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`flex flex-col items-center px-4 text-center ${
                i > 0 ? "lg:border-l lg:border-cream/12" : ""
              }`}
            >
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-dotted border-gold/55 text-gold">
                <Icon size={30} strokeWidth={1.5} />
              </span>
              <h3 className="mt-5 font-display text-xl text-cream">{title}</h3>
              <span className="mt-2 block h-0.5 w-8 rounded-full bg-gold/70" />
              <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-cream/65">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

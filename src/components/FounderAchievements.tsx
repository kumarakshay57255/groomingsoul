"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { achievementImageUrl, type Achievement } from "@/lib/achievements";

export function FounderAchievements({
  achievements,
}: {
  achievements: Achievement[];
}) {
  if (!achievements || achievements.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* faint gold botanical */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-6 top-10 hidden h-56 w-auto rotate-[8deg] opacity-25 lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
            Achievements &amp; Recognition
          </p>
          <span className="h-px w-12 bg-gold/60" />
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-balance text-ink sm:text-5xl">
          Milestones that shaped{" "}
          <span className="italic text-sage-deep">the mission.</span>
        </h2>
        <p className="mt-4 max-w-md text-pretty leading-relaxed text-ink-soft">
          A growing record of the founder&apos;s work — the moments, honours and
          research behind Grooming Souls.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => {
            const img = achievementImageUrl(a);
            return (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream transition-all hover:-translate-y-1 hover:shadow-[0_22px_44px_-28px_rgba(90,106,63,0.5)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={a.title}
                      fill
                      sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center bg-gradient-to-br from-sage-soft/60 to-cream-deep text-sage-deep">
                      <Award size={34} strokeWidth={1.4} />
                    </div>
                  )}
                  {a.year && (
                    <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-navy">
                      {a.year}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl text-ink">{a.title}</h3>
                  <span className="mt-2 block h-0.5 w-7 rounded-full bg-gold" />
                  {a.description && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                      {a.description}
                    </p>
                  )}
                  {a.tag && (
                    <span className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sage-deep">
                      {a.tag}
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

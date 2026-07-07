"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Target, User } from "lucide-react";
import {
  type FoundationContent,
  type TeamMember,
  teamPhotoUrl,
} from "@/lib/team";
import { LeafBranch } from "./Botanical";

type Props = {
  founder: TeamMember | null;
  content: FoundationContent;
};

export function FoundersCorner({ founder, content }: Props) {
  const photoUrl = founder ? teamPhotoUrl(founder) : null;
  const name = founder?.name ?? "Founder";
  const role = founder?.role ?? "Founder & Director";

  return (
    <section id="founder" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
        {/* ---- Left: photo card with navy name band ---- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5"
        >
          <div className="mx-auto max-w-md overflow-hidden rounded-[1.8rem] border border-line shadow-[0_30px_60px_-30px_rgba(1,32,87,0.4)]">
            <div className="relative aspect-[4/4.6]">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={`${name}, ${role}`}
                  fill
                  sizes="(min-width: 1024px) 38vw, 90vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-cream-deep">
                  <User size={64} className="text-brand-brown/30" strokeWidth={1} />
                </div>
              )}
            </div>
            <div className="relative overflow-hidden bg-navy px-6 py-5 text-cream">
              <div className="font-display text-2xl">{name}</div>
              <div className="mt-0.5 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-gold">
                {role}
              </div>
              <LeafBranch
                variant="line"
                className="pointer-events-none absolute -right-2 bottom-0 h-20 w-24 rotate-[65deg] text-gold/45"
              />
            </div>
          </div>
        </motion.div>

        {/* ---- Right: message ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div className="flex items-center gap-3">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
              From the Founder&apos;s Desk
            </p>
            <span className="h-px flex-1 max-w-[7rem] bg-gold/50" />
          </div>

          <h2 className="mt-4 font-display text-4xl leading-[1.06] text-balance text-ink sm:text-5xl">
            Built on <span className="italic text-sage-deep">empathy.</span>
            <br />
            Grown through grit.
          </h2>

          {/* Quote block */}
          <div className="mt-7">
            <div className="flex items-center gap-3">
              <span className="font-display text-5xl leading-none text-gold">
                &ldquo;
              </span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="mt-4">
              {content.founderMessage.split(/\n{2,}/).map((paragraph, i) => (
                <p
                  key={i}
                  className={`max-w-2xl text-pretty leading-relaxed text-ink-soft ${
                    i > 0 ? "mt-4" : ""
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-2 flex justify-end">
              <span className="font-display text-5xl leading-none text-gold">
                &rdquo;
              </span>
            </div>

            <p className="mt-1 font-script text-2xl text-brand-brown">
              &mdash; {name}
            </p>
          </div>

          {/* Vision / Mission cards */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <VMTile
              eyebrow="The Vision"
              body={content.vision}
              tone="sage"
            />
            <VMTile
              eyebrow="The Mission"
              body={content.mission}
              tone="navy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function VMTile({
  eyebrow,
  body,
  tone,
}: {
  eyebrow: string;
  body: string;
  tone: "sage" | "navy";
}) {
  const isSage = tone === "sage";
  const Icon = isSage ? Eye : Target;
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-line p-6 ${
        isSage ? "bg-sage-soft/40" : "bg-cream"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${
            isSage ? "bg-sage-deep text-cream" : "bg-navy text-cream"
          }`}
        >
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <div>
          <div
            className={`text-[0.72rem] font-semibold uppercase tracking-[0.16em] ${
              isSage ? "text-sage-deep" : "text-navy"
            }`}
          >
            {eyebrow}
          </div>
          <span className="mt-1 block h-0.5 w-6 rounded-full bg-gold" />
        </div>
      </div>
      <p className="relative z-10 mt-4 text-pretty text-sm leading-relaxed text-ink-soft">
        {body}
      </p>
      <LeafBranch
        variant="line"
        className={`pointer-events-none absolute -right-3 -bottom-2 h-24 w-20 rotate-[25deg] ${
          isSage ? "text-sage-deep/15" : "text-navy/12"
        }`}
      />
    </div>
  );
}

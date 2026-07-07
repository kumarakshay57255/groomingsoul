"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Brain,
  GraduationCap,
  FileSearch,
  Users,
  Sprout,
  HandHeart,
  ArrowRight,
} from "lucide-react";

const OFFERINGS = [
  {
    icon: Brain,
    title: "Therapy & Counseling",
    body: "One-on-one sessions with experienced psychologists to help you heal and thrive.",
    href: "/therapy",
  },
  {
    icon: GraduationCap,
    title: "Academy Programs",
    body: "Courses and workshops to build emotional intelligence and life skills.",
    href: "/academy",
  },
  {
    icon: FileSearch,
    title: "Diploma Courses",
    body: "Professional certification programs for aspiring mental health professionals.",
    href: "/diploma",
  },
  {
    icon: Users,
    title: "Corporate & Schools",
    body: "Wellness programs and training for organizations and educational institutions.",
    href: "/contact",
  },
  {
    icon: Sprout,
    title: "Wellness Resources",
    body: "Curated resources, tools and self-help materials for everyday well-being.",
    href: "/therapy/tests",
  },
  {
    icon: HandHeart,
    title: "Community Support",
    body: "Support groups and community initiatives for connection, care and compassion.",
    href: "/about",
  },
];

export function EveryMind() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Arched room image, anchored to the left edge (desktop) */}
      <div className="absolute left-0 top-1/2 hidden w-[260px] -translate-y-1/2 xl:w-[290px] lg:block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-br-[2.5rem]">
          <Image
            src="/therapy-room-crop.png"
            alt="A calm, softly lit therapy room"
            fill
            sizes="290px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Faint gold botanical behind the copy */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[34%] bottom-10 hidden h-52 w-auto rotate-[200deg] opacity-30 lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:pl-[330px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.55fr] lg:gap-12">
          {/* Header */}
          <div className="lg:flex lg:flex-col lg:justify-center">
            {/* Mobile-only arched image */}
            <div className="relative mx-auto mb-8 w-44 lg:hidden">
              <div className="relative aspect-[3/5] overflow-hidden rounded-t-[999px] rounded-b-[1.5rem]">
                <Image
                  src="/therapy-room-crop.png"
                  alt="A calm, softly lit therapy room"
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <span className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-sage-deep">
                What We Offer
              </span>
              <span className="h-px w-12 bg-gold/60" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-4 font-display text-4xl leading-[1.05] tracking-tight text-balance text-ink sm:text-[2.6rem]"
            >
              Support for Every Mind.
              <br />
              Care for <span className="italic text-sage-deep">Every Stage.</span>
            </motion.h2>

            <span className="mt-4 block h-1 w-10 rounded-full bg-gold" />

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-5 max-w-sm text-pretty leading-relaxed text-ink-soft"
            >
              We provide a wide range of services designed to support mental
              well-being, personal growth, and academic excellence. Whether
              you&apos;re seeking help, learning, or leading — we&apos;re here
              for you.
            </motion.p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERINGS.map(({ icon: Icon, title, body, href }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
              >
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center rounded-2xl border border-gold/25 bg-cream px-5 py-7 text-center transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_18px_40px_-24px_rgba(90,106,63,0.4)]"
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sage-soft/50 text-sage-deep transition-colors group-hover:bg-sage-soft">
                    <Icon size={28} strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 font-display text-xl text-ink">{title}</h3>
                  <span className="mt-2 block h-0.5 w-7 rounded-full bg-gold" />
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-sage-deep">
                    Learn more
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

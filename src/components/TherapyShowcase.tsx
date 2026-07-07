"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function TherapyShowcase() {
  return (
    <section className="relative overflow-hidden bg-cream-deep/30">
      <div className="grid grid-cols-1 items-center lg:grid-cols-2">
        {/* Left — copy */}
        <div className="px-6 py-16 text-left sm:px-8 sm:py-20 lg:py-24 lg:pl-[max(2rem,calc((100vw-1200px)/2))] lg:pr-14">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-terracotta"
          >
            Therapy & Mental Health Sessions
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 font-display text-4xl leading-[1.05] tracking-tight text-balance text-navy sm:text-5xl lg:text-[3.4rem]"
          >
            Therapy that meets
            <br />
            you{" "}
            <span className="relative inline-block italic">
              <span className="relative z-10">where you are.</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 -z-0 h-2 rounded-full bg-gold/70"
              />
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 max-w-md text-pretty text-[0.98rem] leading-relaxed text-ink-soft"
          >
            Confidential 1-on-1 sessions with verified psychologists, and free
            clinical-grade psychometric tests. No payment gateway — only a
            conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:gap-4"
          >
            <Link
              href="/therapy"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-medium text-cream shadow-sm transition-all hover:bg-navy-deep hover:shadow-lg"
            >
              Browse therapists
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/therapy/tests"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-navy/25 bg-cream px-6 py-3 text-sm font-medium text-navy transition-all hover:border-navy/60"
            >
              Take a free test
            </Link>
          </motion.div>
        </div>

        {/* Right — interior photo, full-bleed to the viewport's right edge */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative min-h-[340px] w-full self-stretch sm:min-h-[440px] lg:min-h-[560px]"
        >
          <Image
            src="/therapy-room-crop.png"
            key="therapy-room-recropped"
            alt="A softly lit therapy room with a comfortable chair, a green plant, and a framed quote reading 'Your mental health matters. You matter.'"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/site";

export function Stats() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-4">
          {stats.map((s, i) => (
            <StatCell
              key={s.label}
              value={s.value}
              label={s.label}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatCell({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay }}
      className="bg-cream px-6 py-10 text-center"
    >
      <div className="font-display text-5xl text-brand-brown sm:text-6xl">
        <CountUp value={value} />
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-sage-deep">
        {label}
      </div>
    </motion.div>
  );
}

/**
 * Parses a stat string like "10k+", "500+", "28" and animates the numeric
 * portion from 0 up to the target when the element scrolls into view.
 * Format preserved exactly (prefix, suffix, k-shorthand).
 */
function CountUp({
  value,
  duration = 1600,
}: {
  value: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const parsed = parseStat(value);
    if (parsed.target === null) {
      setDisplay(value);
      return;
    }

    const { prefix, suffix, target, isThousand, decimals } = parsed;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;

      let num: string;
      if (isThousand) {
        num =
          t >= 1
            ? target.toFixed(decimals)
            : current.toFixed(decimals > 0 ? decimals : 1);
      } else {
        num = Math.round(current).toLocaleString();
      }

      setDisplay(`${prefix}${num}${suffix}`);

      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  return (
    <span ref={ref} aria-label={value}>
      {display}
    </span>
  );
}

type ParsedStat = {
  prefix: string;
  suffix: string;
  target: number | null;
  isThousand: boolean;
  decimals: number;
};

function parseStat(raw: string): ParsedStat {
  // Match: optional prefix → number (with optional decimal) → optional k/m → optional suffix
  const match = raw.match(/^([^\d.]*)(\d+(?:\.\d+)?)([kKmM]?)(.*)$/);
  if (!match) {
    return {
      prefix: "",
      suffix: "",
      target: null,
      isThousand: false,
      decimals: 0,
    };
  }
  const [, prefix, numStr, scale, suffix] = match;
  const baseNum = parseFloat(numStr);
  const decimals = (numStr.split(".")[1] ?? "").length;
  const isThousand = scale.toLowerCase() === "k" || scale.toLowerCase() === "m";

  return {
    prefix,
    suffix: scale + suffix,
    target: baseNum,
    isThousand,
    decimals,
  };
}

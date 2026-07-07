"use client";

import { motion } from "framer-motion";
import { GraduationCap, PackageCheck, Printer, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: GraduationCap,
    title: "Complete 100%",
    body: "Finish every lesson in your diploma at your own pace, within your validity window.",
  },
  {
    icon: ShieldCheck,
    title: "Manual review",
    body: "Our team verifies your completion record and identity. No auto-generated PDFs.",
  },
  {
    icon: Printer,
    title: "Premium print",
    body: "We hand-finish each certificate on archival, embossed hardcopy stationery.",
  },
  {
    icon: PackageCheck,
    title: "Couriered to you",
    body: "Tracked dispatch directly to your registered shipping address — anywhere in India.",
  },
];

export function CertificateWorkflow() {
  return (
    <section className="relative overflow-hidden bg-cream-deep/55 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/4 h-[24rem] w-[24rem] rounded-full bg-coral-soft/45 blur-3xl"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
            Manual Certificate Workflow
          </p>
          <h2 className="mt-3 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
            A real, printed certificate.{" "}
            <span className="italic">Not a download.</span>
          </h2>
          <p className="mt-4 text-pretty text-ink-soft">
            Every Grooming Souls diploma is finished by a real human. We
            verify, print, and courier a premium hardcopy directly to you — no
            auto-PDFs, no shortcuts.
          </p>
        </div>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="relative rounded-3xl border border-line bg-cream p-6"
              >
                <span className="absolute right-5 top-5 text-[0.65rem] uppercase tracking-[0.18em] text-brand-brown/35">
                  Step {i + 1}
                </span>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-coral-soft text-coral">
                  <Icon size={22} strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 font-display text-xl text-brand-brown">
                  {s.title}
                </h3>
                <p className="mt-2 text-pretty text-sm text-ink-soft">
                  {s.body}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

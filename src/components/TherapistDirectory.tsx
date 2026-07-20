"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { User, Globe2, Clock4, ShieldCheck } from "lucide-react";
import {
  therapistSpecializations,
  therapistPhotoUrl,
  type Therapist,
} from "@/lib/therapists";
import { BookingModal } from "./BookingModal";

export function TherapistDirectory({
  therapists,
}: {
  therapists: Therapist[];
}) {
  const [active, setActive] = useState<string>("All");
  const [selected, setSelected] = useState<Therapist | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (active === "All") return therapists;
    return therapists.filter((t) => t.specializations.includes(active));
  }, [active, therapists]);

  function book(t: Therapist) {
    setSelected(t);
    setOpen(true);
  }

  function bookFree() {
    setSelected(null);
    setOpen(true);
  }

  return (
    <section id="therapists" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
              Verified Therapists
            </p>
            <h2 className="mt-2 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
              Find someone you feel safe with.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            Every therapist on our panel has been credential-verified and works
            under our Advisory Panel&apos;s clinical standards.
          </p>
        </div>

        {/* Free session — no doctor selection needed */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-3xl border border-sage/30 bg-sage-soft/40 p-6 sm:flex-row sm:items-center sm:p-7">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-sage-deep">
              Not sure who to choose?
            </p>
            <h3 className="mt-1 font-display text-2xl text-brand-brown">
              Book a free session — no doctor profile needed.
            </h3>
            <p className="mt-1 text-sm text-ink-soft">
              Tell us a little about yourself and our team will match you and reach
              out within 24 hours. Completely free.
            </p>
          </div>
          <button
            type="button"
            onClick={bookFree}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-sage-deep px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-sage-deep/85"
          >
            Book a free session
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-10 flex flex-wrap gap-2">
          <Chip
            label="All"
            active={active === "All"}
            onClick={() => setActive("All")}
          />
          {therapistSpecializations.map((s) => (
            <Chip
              key={s}
              label={s}
              active={active === s}
              onClick={() => setActive(s)}
            />
          ))}
        </div>

        {/* Grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <motion.article
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-cream transition-shadow duration-300 hover:shadow-[0_24px_50px_-30px_rgba(92,58,46,0.4)]"
            >
              <div className="relative aspect-[5/4] overflow-hidden bg-cream-deep">
                {therapistPhotoUrl(t) ? (
                  <Image
                    src={therapistPhotoUrl(t)!}
                    alt={t.name}
                    fill
                    sizes="(min-width: 1024px) 26vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-brand-brown/25">
                    <User size={72} strokeWidth={1} />
                  </div>
                )}
                {!t.acceptingNew && (
                  <span className="absolute right-3 top-3 rounded-full bg-brand-brown/85 px-2.5 py-1 text-[0.62rem] uppercase tracking-wider text-cream">
                    Waitlist
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div>
                  <h3 className="font-display text-2xl leading-tight text-brand-brown">
                    {t.name}
                  </h3>
                  <p className="mt-1 text-[0.78rem] uppercase tracking-[0.14em] text-sage-deep">
                    {t.designation}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.78rem] text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock4 size={13} /> {t.yearsExperience} yrs
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Globe2 size={13} /> {t.languages.join(", ")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={13} /> Verified
                  </span>
                </div>

                <p className="mt-4 flex-1 text-pretty text-sm text-ink-soft">
                  {t.bio}
                </p>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {t.specializations.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-sage/30 bg-sage-soft/45 px-2.5 py-1 text-[0.7rem] text-sage-deep"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => book(t)}
                  disabled={!t.acceptingNew}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-clinical px-5 py-3 text-sm font-medium text-cream transition-all hover:bg-clinical-deep disabled:cursor-not-allowed disabled:bg-brand-brown-light/60"
                >
                  {t.acceptingNew ? "Book a session" : "Join the waitlist"}
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-line bg-cream-deep/40 p-12 text-center text-ink-soft">
            No therapists in this specialisation yet — we&apos;re onboarding
            new clinicians weekly. Reach out and we&apos;ll match you manually.
          </div>
        )}
      </div>

      <BookingModal
        open={open}
        onClose={() => setOpen(false)}
        therapist={selected}
      />
    </section>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[0.78rem] transition-all ${
        active
          ? "border-brand-brown bg-brand-brown text-cream"
          : "border-line bg-cream text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
      }`}
    >
      {label}
    </button>
  );
}

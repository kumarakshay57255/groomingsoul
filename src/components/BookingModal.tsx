"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarClock, CheckCircle2, Loader2 } from "lucide-react";
import type { Therapist } from "@/lib/therapists";
import { api, ApiError } from "@/lib/api";
import {
  INDIAN_PHONE_HTML_PATTERN,
  PHONE_HELPER,
  normalizeIndianPhone,
} from "@/lib/phone";

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  therapist: Therapist | null;
};

const timeSlots = [
  "Weekday mornings (9 AM–12 PM)",
  "Weekday afternoons (12 PM–4 PM)",
  "Weekday evenings (4 PM–8 PM)",
  "Weekend mornings",
  "Weekend evenings",
  "Flexible — anytime",
];

export function BookingModal({ open, onClose, therapist }: BookingModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSubmitted(false);
      setError(null);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const rawPhone = String(form.get("phone") ?? "").trim();
    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9).");
      setSubmitting(false);
      return;
    }
    const payload = {
      therapistId: therapist?.id ?? null,
      therapistName: therapist?.name ?? null,
      name: String(form.get("name") ?? "").trim(),
      age: Number(form.get("age")),
      phone,
      email: String(form.get("email") ?? "").trim(),
      slot: String(form.get("slot") ?? ""),
    };

    try {
      await api("/api/leads/booking", { method: "POST", body: payload });
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "We couldn't submit just now — please try again or message us on WhatsApp."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-center p-4"
        >
          <button
            type="button"
            aria-label="Close booking"
            onClick={onClose}
            className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-cream-deep"
            >
              <X size={16} />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-7 sm:p-9">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage-deep">
                  <CalendarClock size={14} />
                  {therapist ? "Session request" : "Free initial session"}
                </div>
                <h2
                  id="booking-title"
                  className="mt-2 font-display text-3xl text-brand-brown sm:text-4xl"
                >
                  {therapist
                    ? `Book a session with ${therapist.name}`
                    : "Book a free session"}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Share a few details and our team will reach out within{" "}
                  <strong>24 hours</strong> to confirm your slot.
                  {therapist ? "" : " Completely free — no payment required."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="name" required type="text" />
                  <Field
                    label="Age"
                    name="age"
                    required
                    type="number"
                    min={12}
                    max={99}
                  />
                  <div>
                    <Field
                      label="Contact number"
                      name="phone"
                      required
                      type="tel"
                      inputMode="tel"
                      pattern={INDIAN_PHONE_HTML_PATTERN}
                      maxLength={15}
                      placeholder="9XXXXXXXXX"
                      title="10-digit Indian mobile number"
                    />
                    <p className="mt-1.5 text-[0.7rem] text-ink-soft">
                      {PHONE_HELPER}
                    </p>
                  </div>
                  <Field
                    label="Email"
                    name="email"
                    required
                    type="email"
                  />
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="slot"
                      className="text-xs uppercase tracking-[0.14em] text-sage-deep"
                    >
                      Preferred time slot
                    </label>
                    <select
                      id="slot"
                      name="slot"
                      required
                      defaultValue=""
                      className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-clinical"
                    >
                      <option value="" disabled>
                        Choose a slot…
                      </option>
                      {timeSlots.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-3 text-sm text-brand-brown">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-6 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending…
                    </>
                  ) : (
                    "Request my session"
                  )}
                </button>
                <p className="mt-4 text-center text-[0.7rem] text-ink-soft">
                  Your details stay confidential. We never share them.
                </p>
              </form>
            ) : (
              <div className="p-9 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-soft text-sage-deep">
                  <CheckCircle2 size={28} strokeWidth={1.6} />
                </div>
                <h2 className="mt-5 font-display text-3xl text-brand-brown">
                  Booking received ✨
                </h2>
                <p className="mt-3 text-sm text-ink-soft">
                  Thank you for reaching out. Our team will contact you within
                  the next 24 hours to confirm the session.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 inline-flex items-center justify-center rounded-full border border-brand-brown/25 bg-cream px-6 py-3 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  name,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-[0.14em] text-sage-deep"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:border-clinical"
        {...rest}
      />
    </div>
  );
}

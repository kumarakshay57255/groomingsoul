"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Test } from "@/lib/tests";
import { api, ApiError } from "@/lib/api";
import {
  INDIAN_PHONE_HTML_PATTERN,
  PHONE_HELPER,
  normalizeIndianPhone,
} from "@/lib/phone";

type Answer = number | string | null;

export function TestRunner({ test }: { test: Test }) {
  const [identity, setIdentity] = useState<{
    name: string;
    email: string;
    phone: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Answer[]>(() =>
    Array(test.questions.length).fill(null)
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => answers.filter((a) => a !== null && a !== "").length,
    [answers]
  );
  const total = test.questions.length;
  const progress = Math.round((answeredCount / total) * 100);
  const allAnswered = answeredCount === total;

  function setAnswer(i: number, v: Answer) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
  }

  async function handleSubmit() {
    if (!identity || !allAnswered) return;
    setSubmitting(true);
    setError(null);
    try {
      await api("/api/tests/submit", {
        method: "POST",
        body: {
          testSlug: test.slug,
          testName: test.name,
          identity,
          answers: test.questions.map((q, i) => ({
            id: q.id,
            response: answers[i],
          })),
        },
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "We couldn't save your responses just now. Please try again or reach us on WhatsApp."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) return <ThankYou test={test} />;

  if (!identity) {
    return (
      <IdentityGate
        test={test}
        onContinue={(d) => setIdentity(d)}
      />
    );
  }

  return (
    <div className="relative">
      <ProgressBar percent={progress} answered={answeredCount} total={total} />

      <div className="mx-auto max-w-3xl px-5 pt-20 pb-32 sm:px-8">
        <Link
          href="/therapy/tests"
          className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
        >
          <ArrowLeft size={14} /> Back to all tests
        </Link>
        <p className="mt-6 text-xs uppercase tracking-[0.22em] text-sage-deep">
          {test.shortName}
        </p>
        <h1 className="mt-2 font-display text-balance text-4xl text-brand-brown sm:text-5xl">
          {test.name}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-ink-soft">
          {test.intro}
        </p>

        {test.kind === "likert" && test.scale && (
          <ScaleLegend scale={test.scale} />
        )}

        <ol className="mt-10 space-y-6">
          {test.questions.map((q, i) => (
            <QuestionRow
              key={q.id}
              index={i}
              question={q}
              kind={test.kind}
              scale={test.scale}
              textPlaceholder={test.textPlaceholder}
              value={answers[i]}
              onChange={(v) => setAnswer(i, v)}
            />
          ))}
        </ol>

        {error && (
          <p className="mt-6 rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-3 text-sm text-brand-brown">
            {error}
          </p>
        )}

        <div className="sticky bottom-4 mt-10 rounded-2xl border border-line bg-cream/95 p-4 shadow-[0_18px_40px_-25px_rgba(92,58,46,0.4)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-ink-soft">
              {allAnswered ? (
                <span className="text-sage-deep">
                  All {total} answered — ready to submit.
                </span>
              ) : (
                <>
                  {answeredCount} of {total} answered
                  {answeredCount < total &&
                    ` · ${total - answeredCount} remaining`}
                </>
              )}
            </div>
            <button
              type="button"
              disabled={!allAnswered || submitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream transition-all hover:bg-clinical-deep disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting…
                </>
              ) : (
                "Submit my responses"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Identity gate ---------------------------- */

function IdentityGate({
  test,
  onContinue,
}: {
  test: Test;
  onContinue: (d: { name: string; email: string; phone: string }) => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-5 pt-20 pb-24 sm:px-8">
      <Link
        href="/therapy/tests"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
      >
        <ArrowLeft size={14} /> Back to all tests
      </Link>
      <p className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-sage-deep">
        <Sparkles size={13} className="text-sun" /> Before you begin
      </p>
      <h1 className="mt-3 font-display text-balance text-4xl text-brand-brown sm:text-5xl">
        {test.name}
      </h1>
      <p className="mt-4 text-pretty text-ink-soft">
        {test.intro} Roughly{" "}
        <strong>
          {test.estMinutes} minutes · {test.questions.length} items.
        </strong>
      </p>

      <IdentityForm onContinue={onContinue} />
    </div>
  );
}

function IdentityForm({
  onContinue,
}: {
  onContinue: (d: { name: string; email: string; phone: string }) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const rawPhone = String(fd.get("phone") ?? "").trim();
    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9).");
      return;
    }
    setError(null);
    onContinue({
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 rounded-3xl border border-line bg-cream p-7">
      <div className="space-y-4">
        <IdField label="Full name" name="name" type="text" required />
        <IdField label="Email" name="email" type="email" required />
        <div>
          <IdField
            label="Contact number"
            name="phone"
            type="tel"
            inputMode="tel"
            pattern={INDIAN_PHONE_HTML_PATTERN}
            maxLength={15}
            placeholder="9XXXXXXXXX"
            title="10-digit Indian mobile number"
            required
          />
          <p className="mt-1.5 text-[0.7rem] text-ink-soft">{PHONE_HELPER}</p>
        </div>
      </div>
      {error && (
        <p className="mt-4 rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-2.5 text-sm text-brand-brown">
          {error}
        </p>
      )}
      <p className="mt-5 flex items-center gap-2 rounded-xl bg-sage-soft/40 px-3 py-2.5 text-xs text-sage-deep">
        <ShieldCheck size={14} className="shrink-0" />
        Your details and responses are stored confidentially under our DPDP
        compliance policy.
      </p>
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-6 py-3.5 text-sm font-medium text-cream transition-all hover:bg-clinical-deep"
      >
        Start the test
      </button>
    </form>
  );
}

function IdField({
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
        className="mt-1.5 w-full rounded-xl border border-line bg-cream px-4 py-3 text-sm outline-none transition-colors focus:border-clinical"
        {...rest}
      />
    </div>
  );
}

/* ---------------------------- Question row ----------------------------- */

function QuestionRow({
  index,
  question,
  kind,
  scale,
  textPlaceholder,
  value,
  onChange,
}: {
  index: number;
  question: { id: string; text: string; options?: { value: string; text: string }[] };
  kind: "likert" | "mcq" | "text";
  scale?: Test["scale"];
  textPlaceholder?: string;
  value: Answer;
  onChange: (v: Answer) => void;
}) {
  const answered = value !== null && value !== "";
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className={`rounded-2xl border bg-cream p-5 sm:p-6 transition-colors ${
        answered ? "border-sage/40" : "border-line"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-deep text-[0.78rem] font-medium text-brand-brown">
          {index + 1}
        </span>
        <p className="whitespace-pre-line text-pretty text-base leading-relaxed text-ink">
          {question.text}
        </p>
      </div>

      <div className="mt-5 pl-10">
        {kind === "likert" && scale && (
          <LikertChoices
            name={question.id}
            scale={scale}
            value={value as number | null}
            onChange={(n) => onChange(n)}
          />
        )}
        {kind === "mcq" && question.options && (
          <MCQChoices
            name={question.id}
            options={question.options}
            value={value as string | null}
            onChange={(v) => onChange(v)}
          />
        )}
        {kind === "text" && (
          <textarea
            name={question.id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={textPlaceholder}
            rows={3}
            className="w-full resize-y rounded-xl border border-line bg-cream-deep/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-soft/55 focus:border-clinical focus:bg-cream"
          />
        )}
      </div>
    </motion.li>
  );
}

function LikertChoices({
  name,
  scale,
  value,
  onChange,
}: {
  name: string;
  scale: NonNullable<Test["scale"]>;
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {scale.labels.map((l) => {
        const selected = value === l.value;
        return (
          <label
            key={l.value}
            className={`group flex min-w-[3.5rem] cursor-pointer flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-center text-xs transition-all ${
              selected
                ? "border-clinical bg-clinical text-cream"
                : "border-line bg-cream text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={l.value}
              checked={selected}
              onChange={() => onChange(l.value)}
              className="sr-only"
            />
            <span className="text-base font-medium">{l.value}</span>
            <span className="text-[0.62rem] uppercase tracking-wider opacity-80">
              {l.short}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function MCQChoices({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; text: string }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <li key={o.value}>
            <label
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
                selected
                  ? "border-clinical bg-clinical/5 text-brand-brown"
                  : "border-line bg-cream text-ink hover:border-brand-brown/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                className={`grid h-7 w-7 place-items-center rounded-full border text-[0.78rem] font-medium ${
                  selected
                    ? "border-clinical bg-clinical text-cream"
                    : "border-line text-ink-soft"
                }`}
              >
                {o.value}
              </span>
              <span>{o.text}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/* ----------------------------- Misc UI --------------------------------- */

function ScaleLegend({ scale }: { scale: NonNullable<Test["scale"]> }) {
  return (
    <div className="mt-7 rounded-2xl border border-line bg-cream-deep/40 p-4">
      <div className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
        Response scale
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
        {scale.labels.map((l) => (
          <li key={l.value}>
            <span className="font-medium text-brand-brown">{l.value}</span> ·{" "}
            {l.short}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProgressBar({
  percent,
  answered,
  total,
}: {
  percent: number;
  answered: number;
  total: number;
}) {
  return (
    <div className="fixed inset-x-0 top-[64px] z-30 border-b border-line bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-2.5 sm:px-8">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-deep">
          <motion.div
            className="h-full rounded-full bg-clinical"
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="text-xs tabular-nums text-ink-soft">
          {answered}/{total}
        </span>
      </div>
    </div>
  );
}

function ThankYou({ test }: { test: Test }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl px-5 pt-28 pb-24 text-center sm:px-8"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-soft text-sage-deep">
          <CheckCircle2 size={32} strokeWidth={1.6} />
        </div>
        <h1 className="mt-6 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
          Responses received.
        </h1>
        <p className="mt-4 text-pretty text-ink-soft">
          Thank you for taking the <strong>{test.shortName}</strong>. Our
          internal team will review your responses and reach out within{" "}
          <strong>3–5 working days</strong> with a confidential summary.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/therapy/tests"
            className="inline-flex items-center justify-center rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
          >
            Take another test
          </Link>
          <Link
            href="/therapy"
            className="inline-flex items-center justify-center rounded-full border border-brand-brown/25 bg-cream px-6 py-3 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
          >
            Back to therapy
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCopy,
  Loader2,
  Mail,
  Phone,
  Save,
  Trash2,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminSubmissionDetail,
  REVIEW_STATUSES,
  REVIEW_STATUS_LABELS,
  type ReviewStatus,
  deleteSubmission,
  fetchAdminSubmission,
  updateSubmission,
} from "@/lib/adminTests";
import { getTest, type Question, type Test } from "@/lib/tests";

export function SubmissionDetail({ id }: { id: string }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<AdminSubmissionDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReviewStatus>("pending");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await fetchAdminSubmission(id);
        if (!live) return;
        setSubmission(s);
        setStatus(s.reviewStatus);
        setSummary(s.summary ?? "");
      } catch {
        if (live) setError("Couldn't load this submission.");
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [id]);

  const test = useMemo<Test | undefined>(
    () => (submission ? getTest(submission.testSlug) : undefined),
    [submission]
  );

  /* answerById uses ids like "q1", "q2" — both submission.answers and test.questions
     use the same scheme by construction. */
  const questionById = useMemo(() => {
    if (!test) return new Map<string, Question>();
    return new Map(test.questions.map((q) => [q.id, q]));
  }, [test]);

  async function save() {
    if (!submission) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateSubmission(submission.id, {
        reviewStatus: status,
        summary: summary.trim() || null,
      });
      setSubmission(saved);
      setToast("Saved");
      setTimeout(() => setToast(null), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!submission) return;
    if (
      !confirm(
        `Delete this submission from ${submission.identity.name}? Their raw responses will be lost.`
      )
    )
      return;
    try {
      await deleteSubmission(submission.id);
      router.replace("/admin/tests");
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Delete failed");
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setToast("Copied");
      setTimeout(() => setToast(null), 1200);
    });
  }

  if (loading) {
    return (
      <div className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
        <Loader2 size={14} className="animate-spin" /> Loading submission…
      </div>
    );
  }
  if (error || !submission) {
    return (
      <div className="mt-6">
        <p className="text-sm text-coral">{error}</p>
        <Link
          href="/admin/tests"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-brown hover:underline"
        >
          <ArrowLeft size={14} /> Back to all submissions
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/admin/tests"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand-brown"
      >
        <ArrowLeft size={14} /> All submissions
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Left — review controls + identity */}
        <aside className="lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-line bg-cream p-5">
            <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              Client
            </h2>
            <div>
              <div className="font-display text-2xl text-brand-brown">
                {submission.identity.name}
              </div>
              <div className="mt-2 flex flex-col gap-2 text-sm">
                <ContactRow
                  href={`mailto:${submission.identity.email}`}
                  icon={<Mail size={12} className="text-clinical" />}
                  text={submission.identity.email}
                  onCopy={() => copy(submission.identity.email)}
                />
                <ContactRow
                  href={`tel:${submission.identity.phone}`}
                  icon={<Phone size={12} className="text-clinical" />}
                  text={submission.identity.phone}
                  onCopy={() => copy(submission.identity.phone)}
                />
              </div>
            </div>

            <hr className="border-line" />

            <div>
              <h3 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
                Test
              </h3>
              <div className="mt-1 text-sm text-ink">{submission.testName}</div>
              <div className="text-[0.78rem] text-ink-soft">
                {submission.answers.length} answers
              </div>
            </div>

            <hr className="border-line" />

            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Review status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReviewStatus)}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              >
                {REVIEW_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {REVIEW_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Internal summary
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={8}
                placeholder="Your scoring + clinical observations for this client."
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
            </div>

            {toast && (
              <p className="rounded-xl border border-sage/40 bg-sage-soft/40 px-3 py-2 text-xs text-sage-deep">
                {toast}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-full border border-coral/50 px-3 py-1.5 text-xs font-medium text-coral hover:bg-coral hover:text-cream"
              >
                <Trash2 size={11} /> Delete
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                Save review
              </button>
            </div>
          </div>
        </aside>

        {/* Right — answers */}
        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-line bg-cream p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
                Raw responses
              </h2>
              {test && (
                <span className="text-[0.7rem] text-ink-soft">
                  {test.kind === "likert"
                    ? "Likert scale"
                    : test.kind === "mcq"
                      ? "Multiple choice"
                      : "Free-text"}
                </span>
              )}
            </div>

            {!test ? (
              <p className="mt-3 text-sm text-ink-soft">
                Test definition not found for slug{" "}
                <code>{submission.testSlug}</code>. Raw answers shown below.
              </p>
            ) : null}

            <ol className="mt-4 space-y-3">
              {submission.answers.map((a, idx) => {
                const q = questionById.get(a.id);
                const text = q?.text ?? `(missing question text · id ${a.id})`;
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-line bg-cream-deep/30 p-4"
                  >
                    <div className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                      Q{idx + 1}
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-ink">
                      {text}
                    </p>
                    <AnswerBlock test={test} question={q} response={a.response} />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      </div>
    </>
  );
}

function ContactRow({
  href,
  icon,
  text,
  onCopy,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 text-sm text-brand-brown hover:underline"
      >
        {icon} {text}
      </a>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy"
        title="Copy"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-ink-soft hover:border-brand-brown/40 hover:text-brand-brown"
      >
        <ClipboardCopy size={11} />
      </button>
    </div>
  );
}

function AnswerBlock({
  test,
  question,
  response,
}: {
  test: Test | undefined;
  question: Question | undefined;
  response: number | string | null;
}) {
  if (response === null || response === undefined || response === "") {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-coral-soft/55 px-3 py-1 text-[0.78rem] text-brand-brown">
        Skipped
      </div>
    );
  }

  /* Likert: response is a number; show value + matching label */
  if (test?.kind === "likert" && test.scale) {
    const num = Number(response);
    const label = test.scale.labels.find((l) => l.value === num)?.short;
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-clinical-soft/55 px-3 py-1.5 text-sm">
        <span className="font-display text-base text-brand-brown">{num}</span>
        {label && (
          <span className="text-clinical-deep">·</span>
        )}
        <span className="text-clinical-deep">{label ?? ""}</span>
      </div>
    );
  }

  /* MCQ: response is the letter A/B/C/D; show full option text */
  if (test?.kind === "mcq" && question && "options" in question) {
    const choice = question.options.find((o) => o.value === response);
    return (
      <div className="mt-3 inline-flex items-start gap-2 rounded-xl bg-sage-soft/55 px-3 py-1.5 text-sm">
        <span className="font-display text-base text-sage-deep">
          {String(response)}
        </span>
        <span className="text-sage-deep">·</span>
        <span className="text-ink">{choice?.text ?? "(unknown option)"}</span>
        {choice && (
          <CheckCircle2 size={14} className="mt-0.5 text-sage-deep" />
        )}
      </div>
    );
  }

  /* Text: free-form */
  return (
    <div className="mt-3 whitespace-pre-line rounded-xl bg-cream-deep/55 px-3 py-2 text-sm text-ink">
      {String(response)}
    </div>
  );
}

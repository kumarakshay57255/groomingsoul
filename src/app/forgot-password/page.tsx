"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    try {
      const { devResetUrl } = await forgotPassword(email);
      setSent(true);
      if (devResetUrl) setDevUrl(devResetUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthShell
        eyebrow="Check your email"
        title="Reset link sent."
        subtitle="If an account exists for that email, we've sent a password-reset link valid for 30 minutes."
        footer={
          <>
            Wrong account?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-brand-brown hover:underline"
            >
              Try a different email
            </Link>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl border border-sage/30 bg-sage-soft/40 p-4">
          <CheckCircle2
            size={20}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-sage-deep"
          />
          <p className="text-sm text-ink">
            Open your inbox and click the reset link. If it doesn&apos;t arrive
            within a couple of minutes, check spam or message us on WhatsApp.
          </p>
        </div>

        {devUrl && (
          <div className="mt-4 rounded-2xl border border-dashed border-sun/60 bg-sun/15 p-4 text-xs text-brand-brown">
            <div className="mb-1 font-semibold uppercase tracking-wider">
              Dev-only — email service ships in Phase 4
            </div>
            <a
              href={devUrl}
              className="break-all font-medium underline hover:text-brand-brown"
            >
              {devUrl}
            </a>
          </div>
        )}

        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-brand-brown/25 bg-cream px-6 py-3 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
        >
          Back to sign-in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Forgot password"
      title="Reset your password."
      subtitle="Enter the email you signed up with. We'll send you a secure link to set a new password."
      footer={
        <>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-brown hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        {error && (
          <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-4 py-2.5 text-sm text-brand-brown">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream transition-all hover:bg-clinical-deep disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

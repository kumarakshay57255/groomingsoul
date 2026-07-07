"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { resetPassword } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthShell
        eyebrow="Invalid link"
        title="This reset link is broken."
        subtitle="The link in your email is missing the token. Please request a new one."
      >
        <Link
          href="/forgot-password"
          className="inline-flex w-full items-center justify-center rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
        >
          Request a new link
        </Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        eyebrow="Password updated"
        title="You're all set."
        subtitle="Sign in with your new password to continue."
      >
        <div className="flex items-start gap-3 rounded-2xl border border-sage/30 bg-sage-soft/40 p-4">
          <CheckCircle2
            size={20}
            strokeWidth={1.7}
            className="mt-0.5 shrink-0 text-sage-deep"
          />
          <p className="text-sm text-ink">
            Your password has been changed. Existing sessions are revoked for
            security.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-clinical px-6 py-3 text-sm font-medium text-cream hover:bg-clinical-deep"
        >
          Sign in
        </Link>
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      setSubmitting(false);
      return;
    }
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Set a new password"
      title="Choose a fresh password."
      subtitle="Use at least 8 characters. Avoid passwords you've used elsewhere."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="New password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <AuthInput
          label="Confirm password"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
              <Loader2 size={15} className="animate-spin" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}

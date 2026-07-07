"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import {
  INDIAN_PHONE_HTML_PATTERN,
  PHONE_HELPER,
  normalizeIndianPhone,
} from "@/lib/phone";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const loginHref =
    next !== "/dashboard"
      ? `/login?next=${encodeURIComponent(next)}`
      : "/login";
  const { signup } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const rawPhone = String(fd.get("phone") ?? "").trim();
    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) {
      setError("Enter a valid 10-digit Indian mobile number (starts with 6–9).");
      setSubmitting(false);
      return;
    }
    try {
      await signup({
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        phone,
        password: String(fd.get("password") ?? ""),
      });
      router.replace(next);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign-up failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Begin your Grooming Souls journey."
      subtitle="Free to join. You'll only pay when you choose to enrol in a course."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={loginHref}
            className="font-medium text-brand-brown hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Full name"
          name="name"
          type="text"
          required
          minLength={2}
        />
        <AuthInput
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
        <div>
          <AuthInput
            label="Contact number"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            pattern={INDIAN_PHONE_HTML_PATTERN}
            placeholder="9XXXXXXXXX"
            maxLength={15}
            title="10-digit Indian mobile number"
          />
          <p className="mt-1.5 text-[0.7rem] text-ink-soft">{PHONE_HELPER}</p>
        </div>
        <AuthInput
          label="Password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
              <Loader2 size={15} className="animate-spin" /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
        <p className="text-center text-[0.7rem] text-ink-soft">
          Your phone number will appear in the floating watermark on all paid
          videos.
        </p>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

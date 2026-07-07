"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell, AuthInput } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { landingPathFor, type StaffRole } from "@/lib/adminNav";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextParam = params.get("next");
  const signupHref = nextParam
    ? `/signup?next=${encodeURIComponent(nextParam)}`
    : "/signup";
  const { login } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const u = await login(
        String(fd.get("email") ?? "").trim(),
        String(fd.get("password") ?? "")
      );
      /* Role-aware redirect: explicit ?next= wins; otherwise:
         - admin → /admin
         - intern → /admin/leads (their first allowed page)
         - student → /dashboard */
      let dest: string;
      if (nextParam) {
        dest = nextParam;
      } else if (u.role === "admin" || u.role === "intern") {
        dest = landingPathFor(u.role as StaffRole);
      } else {
        dest = "/dashboard";
      }
      router.replace(dest);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to continue."
      subtitle="Access your purchased courses, ongoing tests, and account settings."
      footer={
        <>
          New here?{" "}
          <Link
            href={signupHref}
            className="font-medium text-brand-brown hover:underline"
          >
            Create an account
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
        <div>
          <AuthInput
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-[0.78rem] text-brand-brown/80 hover:text-brand-brown hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
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
              <Loader2 size={15} className="animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

import Link from "next/link";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const metadata = {
  title: "Payment under review — Grooming Souls",
};

export default function CheckoutSuccessPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative isolate overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute -top-24 left-1/3 h-[28rem] w-[28rem] rounded-full bg-sage-soft/55 blur-3xl animate-breathe" />
            <div className="absolute inset-0 bg-grain opacity-50" />
          </div>

          <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-soft text-sage-deep">
              <CheckCircle2 size={32} strokeWidth={1.6} />
            </div>
            <h1 className="mt-6 font-display text-balance text-5xl text-brand-brown sm:text-6xl">
              Payment under review.
            </h1>
            <p className="mt-5 text-pretty text-ink-soft sm:text-lg">
              Thank you. We&apos;ve received your receipt and our team will
              verify it shortly — typically within <strong>12 hours</strong>.
              Once approved, your course access window starts and you&apos;ll
              see it unlocked in your dashboard.
            </p>

            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-cream-deep/40 p-5 text-left">
              <p className="flex items-start gap-2 text-sm text-ink">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-sage-deep"
                />
                Your receipt screenshot is stored confidentially and only
                reviewed by authorised admins.
              </p>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-clinical px-7 py-3.5 text-sm font-medium text-cream hover:bg-clinical-deep sm:text-base"
              >
                Go to my dashboard
              </Link>
              <Link
                href="https://wa.me/919389872523"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-brown/25 bg-cream px-7 py-3.5 text-sm font-medium text-brand-brown hover:border-brand-brown/60 sm:text-base"
              >
                <MessageCircle size={15} /> Chat with support
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

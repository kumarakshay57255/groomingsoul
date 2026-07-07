import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock4, ListChecks, Lock } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PageHero } from "@/components/PageHero";
import { tests } from "@/lib/tests";

export const metadata: Metadata = {
  title: "Free Psychometric Tests — Grooming Souls",
  description:
    "Five standardized psychological screenings — Big Five, Cognitive Aptitude, Sentence Completion, Perceived Stress, and Emotional Intelligence. All free.",
};

const toneToCard: Record<
  "clinical" | "sage" | "coral" | "sun",
  { wash: string; iconBg: string; iconText: string }
> = {
  clinical: {
    wash: "bg-clinical-soft/50",
    iconBg: "bg-clinical-soft",
    iconText: "text-clinical-deep",
  },
  sage: {
    wash: "bg-sage-soft/50",
    iconBg: "bg-sage-soft",
    iconText: "text-sage-deep",
  },
  coral: {
    wash: "bg-coral-soft/55",
    iconBg: "bg-coral-soft",
    iconText: "text-coral",
  },
  sun: {
    wash: "bg-sun/25",
    iconBg: "bg-sun/40",
    iconText: "text-brand-brown",
  },
};

export default function TestsPortal() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="Psychometric Testing Zone"
          title={
            <>
              Discover yourself,{" "}
              <span className="italic">scientifically.</span>
            </>
          }
          subtitle="Five clinically standardized screenings. Your raw responses are securely saved and reviewed by our internal team — confidential, free, and unbiased."
        />

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              {tests.map((t, i) => {
                const tone = toneToCard[t.tone];
                return (
                  <Link
                    key={t.slug}
                    href={`/therapy/tests/${t.slug}`}
                    className={`group relative overflow-hidden rounded-3xl border border-line p-7 transition-all duration-300 ${tone.wash} hover:-translate-y-1 hover:shadow-[0_20px_45px_-25px_rgba(92,58,46,0.35)]`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`grid h-12 w-12 place-items-center rounded-2xl ${tone.iconBg} ${tone.iconText}`}
                      >
                        <ListChecks size={22} strokeWidth={1.6} />
                      </div>
                      <span className="rounded-full border border-brand-brown/15 bg-cream/80 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-brand-brown">
                        Test {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-2xl text-brand-brown sm:text-3xl">
                      {t.name}
                    </h3>
                    <p className="mt-3 max-w-md text-pretty text-sm text-ink-soft">
                      {t.blurb}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-4 text-[0.78rem] text-ink-soft">
                      <span className="inline-flex items-center gap-1.5">
                        <ListChecks size={13} /> {t.questions.length} items
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock4 size={13} /> ~{t.estMinutes} min
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Lock size={13} /> Confidential
                      </span>
                    </div>

                    <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-brand-brown/20 bg-cream px-4 py-2 text-sm font-medium text-brand-brown transition-colors group-hover:bg-brand-brown group-hover:text-cream">
                      Begin test
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>

            <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-ink-soft">
              All responses are stored securely and reviewed by qualified
              interns under the supervision of our Advisory Panel. You can
              request deletion of your data at any time.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

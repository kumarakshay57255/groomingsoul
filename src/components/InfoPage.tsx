import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PageHero } from "@/components/PageHero";
import { site } from "@/lib/site";

type Section = {
  heading: string;
  body: React.ReactNode;
};

type InfoPageProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  effectiveDate?: string;
  /** Optional pre-content card shown above the body (e.g. for Contact Us). */
  topCard?: React.ReactNode;
  sections: Section[];
  /** Optional small footer line under the body. */
  footnote?: React.ReactNode;
};

/**
 * Shared layout for the foundation-level info pages (About / Contact / Privacy /
 * Terms / Refund). Same hero treatment as the rest of the public site so these
 * pages don't look like an afterthought even while content is being finalised.
 */
export function InfoPage({
  eyebrow,
  title,
  subtitle,
  effectiveDate,
  topCard,
  sections,
  footnote,
}: InfoPageProps) {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle}>
          {effectiveDate && (
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-cream/70 px-4 py-1.5 text-xs uppercase tracking-[0.18em] text-sage-deep">
              Effective {effectiveDate}
            </div>
          )}
        </PageHero>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            {topCard && <div className="mb-10">{topCard}</div>}

            <div className="space-y-10">
              {sections.map((s, i) => (
                <article key={i}>
                  <h2 className="font-display text-2xl text-brand-brown sm:text-3xl">
                    {s.heading}
                  </h2>
                  <div className="mt-3 space-y-3 text-pretty text-base leading-relaxed text-ink-soft">
                    {s.body}
                  </div>
                </article>
              ))}
            </div>

            {footnote && (
              <div className="mt-12 rounded-2xl border border-line bg-cream-deep/40 p-5 text-sm text-ink-soft">
                {footnote}
              </div>
            )}

            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
              <div className="text-sm text-ink-soft">
                Questions about this page? Reach out to our team.
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`tel:${site.phoneRaw}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-brown/20 bg-cream px-4 py-2 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
                >
                  <Phone size={14} /> {site.phone}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-clinical px-4 py-2 text-sm font-medium text-cream hover:bg-clinical-deep"
                >
                  <Mail size={14} /> {site.email}
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-brown/20 bg-cream px-4 py-2 text-sm font-medium text-brand-brown hover:border-brand-brown/60"
                >
                  Back to homepage <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

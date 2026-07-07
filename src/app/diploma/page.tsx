import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PageHero } from "@/components/PageHero";
import { TrustStrip } from "@/components/TrustStrip";
import { CourseCard } from "@/components/CourseCard";
import { CertificateWorkflow } from "@/components/CertificateWorkflow";
import { fetchCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Certified Diploma Courses — Grooming Souls",
  description:
    "Specialised psychological diploma masterclasses with time-bound access and a manually couriered hardcopy certificate on completion.",
};

export const dynamic = "force-dynamic";

export default async function DiplomaPage() {
  const courses = await fetchCourses({ type: "diploma" });

  return (
    <>
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="Certified Diploma Courses"
          title={
            <>
              Upskill with diplomas,{" "}
              <span className="italic">certified on paper.</span>
            </>
          }
          subtitle="Specialised psychology masterclasses with strict time-bound access and a real, manually-printed certificate couriered to your door."
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#catalogue"
              className="inline-flex items-center justify-center rounded-full bg-clinical px-7 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep sm:text-base"
            >
              Browse diplomas
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center justify-center rounded-full border border-brand-brown/25 bg-cream/60 px-7 py-3.5 text-sm font-medium text-brand-brown backdrop-blur transition-all hover:border-brand-brown/60 hover:bg-cream sm:text-base"
            >
              Or visit the Academy
            </Link>
          </div>
        </PageHero>

        <TrustStrip />

        <section id="catalogue" className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-sage-deep">
                  Available Diplomas
                </p>
                <h2 className="mt-2 font-display text-4xl text-balance text-brand-brown sm:text-5xl">
                  Choose your specialisation.
                </h2>
              </div>
              <p className="max-w-sm text-sm text-ink-soft">
                Every diploma is supervised by our Advisory Panel and concludes
                with a hardcopy certificate dispatched by courier.
              </p>
            </div>

            {courses.length === 0 ? (
              <div className="mt-12 rounded-3xl border border-dashed border-line bg-cream-deep/40 p-12 text-center text-ink-soft">
                No diplomas published yet — new specialisations are added
                regularly. Check back soon.
              </div>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}
          </div>
        </section>

        <CertificateWorkflow />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

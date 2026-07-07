import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { PageHero } from "@/components/PageHero";
import { TrustStrip } from "@/components/TrustStrip";
import { AcademyExplorer } from "@/components/AcademyExplorer";
import { fetchCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Psych Academy — Grooming Souls",
  description:
    "Premium psychology video courses for Class 11–12, CUET-UG, CUET-PG, and NET-JRF. Time-bound, IP-protected, and clinically supervised.",
};

export const dynamic = "force-dynamic";

export default async function AcademyPage() {
  const courses = await fetchCourses({ type: "academy" });

  return (
    <>
      <Nav />
      <main className="flex-1">
        <PageHero
          eyebrow="Grooming Souls Psych Academy"
          title={
            <>
              Premium psychology lectures,{" "}
              <span className="italic">securely streamed.</span>
            </>
          }
          subtitle="Structured exam prep across Class 11–12, CUET-UG, CUET-PG, and NET-JRF — with strict time-bound access and clinical supervision."
        >
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#catalogue"
              className="inline-flex items-center justify-center rounded-full bg-clinical px-7 py-3.5 text-sm font-medium text-cream shadow-sm transition-all hover:bg-clinical-deep sm:text-base"
            >
              Browse the catalogue
            </Link>
            <Link
              href="/diploma"
              className="inline-flex items-center justify-center rounded-full border border-brand-brown/25 bg-cream/60 px-7 py-3.5 text-sm font-medium text-brand-brown backdrop-blur transition-all hover:border-brand-brown/60 hover:bg-cream sm:text-base"
            >
              Or explore Diplomas
            </Link>
          </div>
        </PageHero>

        <TrustStrip />

        <div id="catalogue">
          <AcademyExplorer courses={courses} />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

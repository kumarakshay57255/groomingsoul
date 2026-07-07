import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { TherapyHero } from "@/components/TherapyHero";
import { TherapistDirectory } from "@/components/TherapistDirectory";
import { TestsTeaser } from "@/components/TestsTeaser";
import { TrustStrip } from "@/components/TrustStrip";
import { fetchTherapists } from "@/lib/therapists";

export const metadata: Metadata = {
  title: "Therapy & Counselling — Grooming Souls",
  description:
    "Confidential 1-on-1 sessions with verified psychologists, plus free standardized psychometric tests. First reach-out is always free.",
};

export const dynamic = "force-dynamic";

export default async function TherapyPage() {
  const therapists = await fetchTherapists();
  return (
    <>
      <Nav />
      <main className="flex-1">
        <TherapyHero />

        <TrustStrip />
        <TherapistDirectory therapists={therapists} />
        <TestsTeaser />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

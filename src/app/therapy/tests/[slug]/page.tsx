import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { TestRunner } from "@/components/TestRunner";
import { getTest, tests } from "@/lib/tests";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return tests.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) return { title: "Test not found — Grooming Souls" };
  return {
    title: `${test.name} — Grooming Souls`,
    description: test.blurb,
  };
}

export default async function TestPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const test = getTest(slug);
  if (!test) notFound();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <TestRunner test={test} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

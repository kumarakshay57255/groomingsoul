import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { CourseDetailView } from "@/components/CourseDetailView";
import { fetchCourse } from "@/lib/courses";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course) return { title: "Diploma not found — Grooming Souls" };
  return {
    title: `${course.title} — Grooming Souls Diploma`,
    description: course.description ?? undefined,
  };
}

export default async function DiplomaCoursePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const course = await fetchCourse(slug);
  if (!course || course.type !== "diploma") notFound();

  return (
    <>
      <Nav />
      <main className="flex-1">
        <CourseDetailView course={course} showCertificateNotice />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

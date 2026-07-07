"use client";

import { use } from "react";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { CourseEditor } from "@/components/admin/CourseEditor";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue + uploader"
        title="Edit course"
        description="Update course metadata, manage modules and lessons, and upload lesson videos."
      />
      <CourseEditor courseId={id} />
    </>
  );
}

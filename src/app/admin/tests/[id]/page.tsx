"use client";

import { use } from "react";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { SubmissionDetail } from "@/components/admin/SubmissionDetail";

type Params = { id: string };

export default function Page({ params }: { params: Promise<Params> }) {
  const { id } = use(params);
  return (
    <>
      <AdminPageHeader
        eyebrow="Submission review"
        title="Client responses"
        description="Question-by-question answers with scale labels (Likert) or option text (MCQ). Add your clinical summary on the left."
      />
      <SubmissionDetail id={id} />
    </>
  );
}

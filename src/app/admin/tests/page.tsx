"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { SubmissionsManager } from "@/components/admin/SubmissionsManager";
import { REVIEW_STATUSES, type ReviewStatus } from "@/lib/adminTests";

function Inner() {
  const params = useSearchParams();
  const statusParam = params.get("status");
  const initialStatus =
    statusParam && (REVIEW_STATUSES as string[]).includes(statusParam)
      ? (statusParam as ReviewStatus)
      : undefined;
  return <SubmissionsManager initialStatus={initialStatus} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Intern review queue"
        title="Test submissions"
        description="Raw responses for each of the five psychometric tests. Open a row to view question-by-question answers, add your scoring summary, and mark complete."
      />
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </>
  );
}

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { LeadsManager } from "@/components/admin/LeadsManager";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/adminLeads";

function Inner() {
  const params = useSearchParams();
  const statusParam = params.get("status");
  const initialStatus =
    statusParam && (LEAD_STATUSES as string[]).includes(statusParam)
      ? (statusParam as LeadStatus)
      : undefined;
  return <LeadsManager initialStatus={initialStatus} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Lead inbox / CRM"
        title="Therapy leads"
        description="Every booking from /therapy. Click a row to update status, add internal notes, or copy the contact details."
      />
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </>
  );
}

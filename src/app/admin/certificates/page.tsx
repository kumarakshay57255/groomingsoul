"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { CertificatesManager } from "@/components/admin/CertificatesManager";
import { CERT_STATUSES, type CertStatus } from "@/lib/adminCertificates";

function Inner() {
  const params = useSearchParams();
  const statusParam = params.get("status");
  const initialStatus =
    statusParam && (CERT_STATUSES as string[]).includes(statusParam)
      ? (statusParam as CertStatus)
      : undefined;
  return <CertificatesManager initialStatus={initialStatus} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Hardcopy queue"
        title="Certificate dispatch"
        description="Every diploma completion lands here automatically. Print the certificate, courier it, and update the status row by row."
      />
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </>
  );
}

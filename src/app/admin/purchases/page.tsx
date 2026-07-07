"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/PageHeader";
import { PurchasesManager } from "@/components/admin/PurchasesManager";
import {
  PURCHASE_STATUSES,
  type PurchaseAdminStatus,
} from "@/lib/adminPurchases";

function Inner() {
  const params = useSearchParams();
  const statusParam = params.get("status");
  const initialStatus =
    statusParam && (PURCHASE_STATUSES as string[]).includes(statusParam)
      ? (statusParam as PurchaseAdminStatus)
      : undefined;
  return <PurchasesManager initialStatus={initialStatus} />;
}

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Verification queue"
        title="Purchases & receipts"
        description="Verify QR-payment receipts. Approve to activate access (sets the validity window) or reject with a reason for the student."
      />
      <Suspense fallback={null}>
        <Inner />
      </Suspense>
    </>
  );
}

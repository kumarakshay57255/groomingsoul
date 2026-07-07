import { AdminPageHeader } from "@/components/admin/PageHeader";
import { TherapistsManager } from "@/components/admin/TherapistsManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Verified directory"
        title="Therapists"
        description="Manage the directory shown on /therapy. Each row drives a card on the public site."
      />
      <TherapistsManager />
    </>
  );
}

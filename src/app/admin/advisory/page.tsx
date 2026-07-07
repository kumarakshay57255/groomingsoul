import { AdminPageHeader } from "@/components/admin/PageHeader";
import { AdvisoryManager } from "@/components/admin/AdvisoryManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Wall of trust"
        title="Advisory Panel"
        description="Senior psychologists and doctors who supervise our clinical standards and academic curriculum. Each row drives a card on the homepage Advisory section."
      />
      <AdvisoryManager />
    </>
  );
}

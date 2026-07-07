import { AdminPageHeader } from "@/components/admin/PageHeader";
import { TeamManager } from "@/components/admin/TeamManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Foundation editorial"
        title="Core Team & Founder"
        description="Edit the Founder's message, vision and mission strings, plus the team roster shown on the homepage."
      />
      <TeamManager />
    </>
  );
}

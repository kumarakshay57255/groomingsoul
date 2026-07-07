import { AdminPageHeader } from "@/components/admin/PageHeader";
import { StaffManager } from "@/components/admin/StaffManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Access control"
        title="Staff & roles"
        description="Invite admins and interns, change roles inline, deactivate accounts (revokes login + sessions instantly), and remove ex-staff."
      />
      <StaffManager />
    </>
  );
}

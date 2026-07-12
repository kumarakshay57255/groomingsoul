import { AdminPageHeader } from "@/components/admin/PageHeader";
import { AchievementsManager } from "@/components/admin/AchievementsManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Founder's Corner"
        title="Founder Achievements"
        description="Awards, milestones and recognition shown on the homepage. Published items appear on the website in display order."
      />
      <AchievementsManager />
    </>
  );
}

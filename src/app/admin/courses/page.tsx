import { AdminPageHeader } from "@/components/admin/PageHeader";
import { CoursesManager } from "@/components/admin/CoursesManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue + uploader"
        title="Courses & Lessons"
        description="Drag-drop video uploads, validity windows, module reorder, publish toggle. Each row drives the catalogue on /academy or /diploma."
      />
      <CoursesManager />
    </>
  );
}

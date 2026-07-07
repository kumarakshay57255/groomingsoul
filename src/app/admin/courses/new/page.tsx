import { AdminPageHeader } from "@/components/admin/PageHeader";
import { CourseEditor } from "@/components/admin/CourseEditor";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Catalogue + uploader"
        title="New course"
        description="Fill in the basics first — you can add modules and upload videos after saving."
      />
      <CourseEditor courseId="new" />
    </>
  );
}

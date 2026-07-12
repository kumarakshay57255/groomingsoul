import { AdminPageHeader } from "@/components/admin/PageHeader";
import { BooksManager } from "@/components/admin/BooksManager";

export default function Page() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Founder's Corner"
        title="Books"
        description="The founder's published books — cover, details and Amazon link. The first published book is featured on the homepage; all appear on the /books page."
      />
      <BooksManager />
    </>
  );
}

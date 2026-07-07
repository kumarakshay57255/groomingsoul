import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · Grooming Souls",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}

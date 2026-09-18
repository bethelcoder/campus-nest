import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin/letters");
  if (session.role !== "ADMIN" && (session.role as string) !== "UNIVERSITY_ADMIN") {
    redirect(getRoleDashboardPath(session.role));
  }
  return <>{children}</>;
}

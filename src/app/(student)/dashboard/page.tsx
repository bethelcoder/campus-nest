import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getRoleDashboardPath(session.role));
}

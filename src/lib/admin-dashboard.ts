import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/rbac";

export interface AdminDashboardUser {
  id: string;
  name: string;
  surname: string;
  email: string;
}

export async function requireAdminPageSession(nextPath: string): Promise<AdminDashboardUser> {
  const session = await getSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  if (session.role !== "ADMIN") redirect(getRoleDashboardPath(session.role));

  const dbUser = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, surname: true, email: true, role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    surname: dbUser.surname,
    email: dbUser.email,
  };
}

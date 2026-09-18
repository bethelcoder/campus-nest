import { requireRoleGuard } from "@/lib/rbac";

export default async function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleGuard({
    allowedRoles: ["STUDENT"],
    currentPath: "/dashboard/student",
    requireVerified: true,
    requireOnboarded: true,
  });

  return <>{children}</>;
}

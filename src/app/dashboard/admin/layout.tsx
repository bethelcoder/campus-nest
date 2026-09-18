import { requireRoleGuard } from "@/lib/rbac";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleGuard({
    allowedRoles: ["ADMIN"],
    currentPath: "/dashboard/admin",
    requireVerified: false,
    requireOnboarded: false,
  });

  return <>{children}</>;
}

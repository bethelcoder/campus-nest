import { requireRoleGuard } from "@/lib/rbac";

export default async function SrcDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleGuard({
    allowedRoles: ["SRC_REPRESENTATIVE"],
    currentPath: "/dashboard/src",
    requireVerified: true,
    requireOnboarded: false,
  });

  return <>{children}</>;
}

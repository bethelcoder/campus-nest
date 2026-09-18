import { requireRoleGuard } from "@/lib/rbac";

export default async function LandlordDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRoleGuard({
    allowedRoles: ["LANDLORD"],
    currentPath: "/dashboard/landlord",
    requireVerified: true,
    requireOnboarded: true,
  });

  return <>{children}</>;
}

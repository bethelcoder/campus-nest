import { requireRoleGuard } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRoleGuard({
    allowedRoles: ["ADMIN"],
    currentPath: "/dashboard/admin",
    requireVerified: false,
    requireOnboarded: false,
  });

  return <>{children}</>;
}

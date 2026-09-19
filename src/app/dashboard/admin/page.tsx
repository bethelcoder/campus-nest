import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";
import AdminDashboardOverview from "@/components/dashboard/admin-dashboard-overview";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await requireAdminPageSession("/dashboard/admin");

  const [
    properties,
    letters,
    escalations,
    activeTenancies,
    landlords,
  ] = await Promise.all([
    prisma.property.findMany({ select: { status: true } }),
    prisma.confirmationLetter.findMany({ select: { status: true } }),
    prisma.safetyReport.findMany({
      where: {
        OR: [
          { status: "ESCALATED" },
          { severity: "CRITICAL_EMERGENCY", status: { not: "RESOLVED" } },
        ],
      },
      select: { id: true },
    }),
    prisma.tenancy.count({ where: { status: "ACTIVE" } }),
    prisma.user.findMany({
      where: { role: "LANDLORD" },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        onboardingCompleted: true,
        landlordProfile: { select: { entityType: true } },
        properties: { select: { status: true } },
      },
    }),
  ]);

  const stats = {
    verifiedProperties: properties.filter((p) => p.status === "VERIFIED").length,
    pendingProperties: properties.filter((p) => p.status === "PENDING_VERIFICATION").length,
    flaggedProperties: properties.filter((p) => p.status === "FLAGGED").length,
    pendingLetters: letters.filter((l) => l.status === "PENDING_REVIEW").length,
    activeEscalations: escalations.length,
    activeTenancies,
    totalLandlords: landlords.length,
  };

  const landlordQueue = landlords.map((l) => ({
    id: l.id,
    name: `${l.name} ${l.surname}`.trim(),
    email: l.email,
    entityType: l.landlordProfile?.entityType ?? null,
    onboardingCompleted: l.onboardingCompleted,
    propertyCount: l.properties.length,
    pendingPropertyCount: l.properties.filter((p) => p.status === "PENDING_VERIFICATION" || p.status === "DRAFT").length,
  }));

  return (
    <B2cAdminLayout activeTab="Command Console" user={user} pendingCount={stats.pendingLetters}>
      <AdminDashboardOverview stats={stats} landlordQueue={landlordQueue} />
    </B2cAdminLayout>
  );
}

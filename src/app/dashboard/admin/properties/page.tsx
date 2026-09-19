import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";
import AdminPropertiesPanel, { AdminPropertyItem } from "@/components/dashboard/admin-properties-panel";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const user = await requireAdminPageSession("/dashboard/admin/properties");

  const [properties, pendingLetters] = await Promise.all([
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        landlord: { select: { name: true, surname: true, email: true } },
        reports: { where: { status: { not: "RESOLVED" } }, select: { id: true } },
      },
    }),
    prisma.confirmationLetter.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const propertyItems: AdminPropertyItem[] = properties.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    suburb: p.suburb,
    city: p.city,
    status: p.status,
    safetyScore: p.safetyScore !== null ? Number(p.safetyScore) : null,
    priceMonthly: Number(p.priceMonthly),
    bedrooms: p.bedrooms,
    landlordName: `${p.landlord.name} ${p.landlord.surname}`.trim(),
    landlordEmail: p.landlord.email,
    activeReports: p.reports.length,
    physicalInspectionAt: p.physicalInspectionAt?.toISOString() ?? null,
    physicalInspectorName: p.physicalInspectorName ?? null,
    accreditationReference: p.accreditationReference ?? null,
  }));

  return (
    <B2cAdminLayout activeTab="Property Registry" user={user} pendingCount={pendingLetters}>
      <AdminPropertiesPanel initialProperties={propertyItems} />
    </B2cAdminLayout>
  );
}

import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";
import AdminEscalationsPanel, { AdminEscalationItem } from "@/components/dashboard/admin-escalations-panel";

export const dynamic = "force-dynamic";

export default async function AdminEscalationsPage() {
  const user = await requireAdminPageSession("/dashboard/admin/escalations");

  const [reports, pendingLetters] = await Promise.all([
    prisma.safetyReport.findMany({
      where: {
        OR: [
          { status: "ESCALATED" },
          { severity: "CRITICAL_EMERGENCY", status: { not: "RESOLVED" } },
          { status: "UNDER_INTERVENTION", severity: { in: ["HIGH", "CRITICAL_EMERGENCY"] } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { name: true, surname: true, email: true } },
        property: {
          include: {
            landlord: { select: { name: true, surname: true } },
          },
        },
      },
    }),
    prisma.confirmationLetter.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const escalationItems: AdminEscalationItem[] = reports.map((r) => ({
    id: r.id,
    subject: r.subject || "Safety Report",
    description: r.description,
    type: r.type,
    severity: r.severity,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    studentName: `${r.reporter?.name || ""} ${r.reporter?.surname || ""}`.trim() || "Student",
    studentEmail: r.reporter?.email || "",
    propertyTitle: r.property?.title || "Unknown Property",
    propertyAddress: r.property
      ? `${r.property.address}, ${r.property.suburb}`
      : "Address not specified",
    landlordName: r.property?.landlord
      ? `${r.property.landlord.name} ${r.property.landlord.surname}`.trim()
      : "Unknown",
  }));

  return (
    <B2cAdminLayout activeTab="Global Escalations" user={user} pendingCount={pendingLetters}>
      <AdminEscalationsPanel initialReports={escalationItems} />
    </B2cAdminLayout>
  );
}

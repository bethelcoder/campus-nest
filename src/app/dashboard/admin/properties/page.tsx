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
        landlord: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            landlordProfile: {
              select: {
                entityType: true,
                companyName: true,
                cipcDocumentUrl: true,
                taxClearanceDocUrl: true,
                directorIdDocUrl: true,
                bankConfirmationDocUrl: true,
                proofOfAddressDocUrl: true,
              },
            },
          },
        },
        complianceDocs: {
          select: {
            id: true,
            documentType: true,
            title: true,
            fileUrl: true,
            status: true,
            expiryDate: true,
            referenceNumber: true,
          },
        },
        checklistItems: {
          select: {
            id: true,
            passed: true,
            category: true,
            label: true,
            weight: true,
          },
        },
        reports: { where: { status: { not: "RESOLVED" } }, select: { id: true } },
      },
    }),
    prisma.confirmationLetter.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  const propertyItems: AdminPropertyItem[] = properties.map((p) => {
    const passedChecklist = p.checklistItems.filter((c) => c.passed === true).length;
    const totalChecklist = p.checklistItems.length;
    const validDocs = p.complianceDocs.filter((d) => d.status === "VALID").length;
    const totalDocs = p.complianceDocs.length;
    const lp = p.landlord.landlordProfile;
    const hasKycDocs = !!(
      lp?.cipcDocumentUrl ||
      lp?.taxClearanceDocUrl ||
      lp?.directorIdDocUrl ||
      lp?.bankConfirmationDocUrl
    );

    return {
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
      landlordPhone: p.landlord.phone ?? null,
      companyName: lp?.companyName ?? null,
      entityType: lp?.entityType ?? null,
      activeReports: p.reports.length,
      physicalInspectionAt: p.physicalInspectionAt?.toISOString() ?? null,
      physicalInspectorName: p.physicalInspectorName ?? null,
      accreditationReference: p.accreditationReference ?? null,
      passedChecklistCount: passedChecklist,
      totalChecklistCount: totalChecklist,
      validComplianceDocsCount: validDocs,
      totalComplianceDocsCount: totalDocs,
      hasKycDocs,
      complianceDocs: p.complianceDocs.map((d) => ({
        ...d,
        expiryDate: d.expiryDate?.toISOString() ?? null,
      })),
      checklistItems: p.checklistItems,
      kycDocs: {
        cipcDocumentUrl: lp?.cipcDocumentUrl ?? null,
        taxClearanceDocUrl: lp?.taxClearanceDocUrl ?? null,
        directorIdDocUrl: lp?.directorIdDocUrl ?? null,
        bankConfirmationDocUrl: lp?.bankConfirmationDocUrl ?? null,
        proofOfAddressDocUrl: lp?.proofOfAddressDocUrl ?? null,
      },
    };
  });

  return (
    <B2cAdminLayout activeTab="Property Registry" user={user} pendingCount={pendingLetters}>
      <AdminPropertiesPanel initialProperties={propertyItems} />
    </B2cAdminLayout>
  );
}

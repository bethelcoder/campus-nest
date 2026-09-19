import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import { notFound } from "next/navigation";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";
import AdminPropertyAuditView, { PropertyAuditData } from "@/components/dashboard/admin-property-audit-view";

export const dynamic = "force-dynamic";

export default async function AdminPropertyAuditPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireAdminPageSession(`/dashboard/admin/properties/${params.id}`);

  const [property, pendingLetters] = await Promise.all([
    prisma.property.findUnique({
      where: { id: params.id },
      include: {
        landlord: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
            phone: true,
            idNumber: true,
            createdAt: true,
            landlordProfile: true,
          },
        },
        complianceDocs: {
          orderBy: { createdAt: "desc" },
        },
        checklistItems: {
          orderBy: { category: "asc" },
        },
        roomUnits: {
          include: {
            beds: true,
          },
          orderBy: { unitNumber: "asc" },
        },
        reports: {
          orderBy: { createdAt: "desc" },
          include: {
            reporter: {
              select: { name: true, surname: true, email: true },
            },
          },
        },
        _count: {
          select: {
            applications: true,
            tenancies: true,
            favorites: true,
          },
        },
      },
    }),
    prisma.confirmationLetter.count({ where: { status: "PENDING_REVIEW" } }),
  ]);

  if (!property) {
    notFound();
  }

  const propertyData: PropertyAuditData = {
    id: property.id,
    title: property.title,
    address: property.address,
    suburb: property.suburb,
    city: property.city,
    postalCode: property.postalCode,
    formattedAddress: property.formattedAddress,
    latitude: property.latitude,
    longitude: property.longitude,
    priceMonthly: Number(property.priceMonthly),
    depositAmount: property.depositAmount ? Number(property.depositAmount) : null,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    maxOccupants: property.maxOccupants,
    description: property.description,
    amenities: property.amenities || [],
    distanceToCampus: property.distanceToCampus ? Number(property.distanceToCampus) : null,
    images: property.images || [],
    safetyScore: property.safetyScore !== null ? Number(property.safetyScore) : null,
    status: property.status,
    physicalInspectionAt: property.physicalInspectionAt?.toISOString() ?? null,
    physicalInspectorName: property.physicalInspectorName ?? null,
    accreditationReference: property.accreditationReference ?? null,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
    landlord: {
      id: property.landlord.id,
      name: property.landlord.name,
      surname: property.landlord.surname,
      email: property.landlord.email,
      phone: property.landlord.phone,
      idNumber: property.landlord.idNumber,
      createdAt: property.landlord.createdAt.toISOString(),
      landlordProfile: property.landlord.landlordProfile
        ? {
            entityType: property.landlord.landlordProfile.entityType,
            companyName: property.landlord.landlordProfile.companyName,
            companyRegNumber: property.landlord.landlordProfile.companyRegNumber,
            cipcDocumentUrl: property.landlord.landlordProfile.cipcDocumentUrl,
            taxNumber: property.landlord.landlordProfile.taxNumber,
            taxPin: property.landlord.landlordProfile.taxPin,
            taxClearanceDocUrl: property.landlord.landlordProfile.taxClearanceDocUrl,
            businessAddress: property.landlord.landlordProfile.businessAddress,
            proofOfAddressDocUrl: property.landlord.landlordProfile.proofOfAddressDocUrl,
            contactPhone: property.landlord.landlordProfile.contactPhone,
            directorIdNumber: property.landlord.landlordProfile.directorIdNumber,
            directorIdDocUrl: property.landlord.landlordProfile.directorIdDocUrl,
            directorIdCertified: property.landlord.landlordProfile.directorIdCertified,
            bankName: property.landlord.landlordProfile.bankName,
            bankAccountType: property.landlord.landlordProfile.bankAccountType,
            bankAccountNumber: property.landlord.landlordProfile.bankAccountNumber,
            bankBranchCode: property.landlord.landlordProfile.bankBranchCode,
            bankConfirmationDocUrl: property.landlord.landlordProfile.bankConfirmationDocUrl,
            providerAssociationNo: property.landlord.landlordProfile.providerAssociationNo,
            verificationStatus: property.landlord.landlordProfile.verificationStatus,
            verificationNotes: property.landlord.landlordProfile.verificationNotes,
            verifiedAt: property.landlord.landlordProfile.verifiedAt?.toISOString() ?? null,
          }
        : null,
    },
    complianceDocs: (property.complianceDocs || []).map((d) => ({
      id: d.id,
      documentType: d.documentType,
      title: d.title,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileSizeBytes: d.fileSizeBytes,
      issuedDate: d.issuedDate?.toISOString() ?? null,
      expiryDate: d.expiryDate?.toISOString() ?? null,
      issuingBody: d.issuingBody,
      referenceNumber: d.referenceNumber,
      status: d.status,
      rejectionReason: d.rejectionReason,
      verifiedAt: d.verifiedAt?.toISOString() ?? null,
      verifiedByAdminId: d.verifiedByAdminId,
    })),
    checklistItems: (property.checklistItems || []).map((c) => ({
      id: c.id,
      category: c.category,
      label: c.label,
      passed: c.passed,
      weight: c.weight,
      notes: c.notes,
    })),
    roomUnits: (property.roomUnits || []).map((u) => ({
      id: u.id,
      unitNumber: u.unitNumber,
      floorLevel: u.floorLevel,
      roomType: u.roomType,
      bathroomType: u.bathroomType,
      monthlyPrice: Number(u.monthlyPrice),
      depositAmount: Number(u.depositAmount),
      isNsfasCapped: u.isNsfasCapped,
      genderPolicy: u.genderPolicy,
      amenities: u.amenities || [],
      beds: (u.beds || []).map((b) => ({
        id: b.id,
        bedIdentifier: b.bedIdentifier,
        status: b.status,
      })),
    })),
    reports: (property.reports || []).map((r) => ({
      id: r.id,
      subject: r.subject,
      description: r.description,
      status: r.status,
      severity: r.severity,
      createdAt: r.createdAt.toISOString(),
      reporter: r.reporter
        ? {
            name: r.reporter.name,
            surname: r.reporter.surname,
            email: r.reporter.email,
          }
        : undefined,
    })),
    _count: {
      applications: property._count?.applications || 0,
      tenancies: property._count?.tenancies || 0,
      favorites: property._count?.favorites || 0,
    },
  };

  return (
    <B2cAdminLayout activeTab="Property Registry" user={user} pendingCount={pendingLetters}>
      <AdminPropertyAuditView initialProperty={propertyData} />
    </B2cAdminLayout>
  );
}

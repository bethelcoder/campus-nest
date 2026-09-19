import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import LandlordPropertyDetailView from "@/components/dashboard/landlord-property-detail-view";

export const dynamic = "force-dynamic";

export default async function LandlordPropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    notFound();
  }

  const [dbUser, property, dbProperties, liveTenancies, unansweredApplications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      include: { landlordProfile: true },
    }),
    prisma.property.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: true,
        reports: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        applications: {
          include: {
            student: {
              include: { studentProfile: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        tenancies: {
          include: {
            student: {
              include: { studentProfile: true },
            },
            confirmationLetter: true,
          },
        },
      },
    }),
    prisma.property.findMany({
      where: { landlordId: session.sub },
      select: {
        id: true,
        title: true,
        bedrooms: true,
        safetyScore: true,
      },
    }),
    prisma.tenancy.count({
      where: { propertyId: params.id, NOT: { status: "ENDED" } },
    }),
    prisma.application.count({
      where: { propertyId: params.id, NOT: { status: "REJECTED" } },
    }),
  ]);

  if (!property || property.landlordId !== session.sub) {
    notFound();
  }

  const user = {
    id: dbUser?.id || session.sub,
    name: dbUser?.name || "Landlord",
    surname: dbUser?.surname || "",
    email: dbUser?.email || "landlord@example.com",
    entityType: dbUser?.landlordProfile?.entityType || "Private Residence Operator",
  };

  const properties = dbProperties.map((p) => ({
    ...p,
    safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
  }));

  const serializedProperty = {
    ...property,
    priceMonthly: Number(property.priceMonthly),
    depositAmount: property.depositAmount ? Number(property.depositAmount) : null,
    distanceToCampus: property.distanceToCampus ? Number(property.distanceToCampus) : null,
    safetyScore: property.safetyScore ? Number(property.safetyScore) : null,
    tenancies: (property.tenancies || []).map((t) => ({
      ...t,
      monthlyRent: t.monthlyRent ? Number(t.monthlyRent) : Number(property.priceMonthly),
      deposit: t.deposit ? Number(t.deposit) : null,
    })),
    reports: (property.reports || []).map((r) => ({
      ...r,
      slaExpiresAt: r.slaExpiresAt ? r.slaExpiresAt.toISOString() : null,
      resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
  };

  return (
    <B2cLandlordLayout activeTab="My Residences" user={user} properties={properties}>
      <LandlordPropertyDetailView
        property={serializedProperty}
        user={user}
        liveTenancies={liveTenancies}
        unansweredApplications={unansweredApplications}
      />
    </B2cLandlordLayout>
  );
}

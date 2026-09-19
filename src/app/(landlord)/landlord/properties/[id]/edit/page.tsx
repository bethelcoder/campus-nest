import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import ResidenceBuilderPage from "@/components/dashboard/residence-builder-page";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    notFound();
  }

  const [dbUser, property, dbProperties] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      include: { landlordProfile: true },
    }),
    prisma.property.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: true,
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
  };

  return (
    <B2cLandlordLayout activeTab="My Residences" user={user} properties={properties}>
      <ResidenceBuilderPage user={user} initialProperty={serializedProperty} />
    </B2cLandlordLayout>
  );
}
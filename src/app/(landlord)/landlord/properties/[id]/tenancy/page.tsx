import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import ResidenceTenancyDetailView from "@/components/dashboard/residence-tenancy-detail-view";

export const dynamic = "force-dynamic";

export default async function PropertyTenancyPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    redirect("/landlord/login");
  }

  const [dbUser, property, dbProperties, dbStudents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      include: { landlordProfile: true },
    }),
    prisma.property.findUnique({
      where: { id: params.id },
      include: {
        checklistItems: true,
        tenancies: {
          include: {
            student: {
              include: { studentProfile: true },
            },
            confirmationLetter: true,
          },
          orderBy: { createdAt: "desc" },
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
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { studentProfile: true },
      orderBy: { name: "asc" },
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
    tenancies: (property.tenancies || []).map((t: any) => ({
      ...t,
      monthlyRent: t.monthlyRent ? Number(t.monthlyRent) : Number(property.priceMonthly),
      deposit: t.deposit ? Number(t.deposit) : null,
    })),
  };

  const serializedStudents = dbStudents.map((s) => ({
    id: s.id,
    name: s.name,
    surname: s.surname,
    email: s.email,
    phone: s.phone,
    institutionName: s.institutionName,
    studentProfile: s.studentProfile,
  }));

  return (
    <B2cLandlordLayout activeTab="Tenancy" user={user} properties={properties}>
      <ResidenceTenancyDetailView
        property={serializedProperty}
        allStudents={serializedStudents}
        user={user}
      />
    </B2cLandlordLayout>
  );
}

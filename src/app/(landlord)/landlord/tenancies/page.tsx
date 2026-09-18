import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import LandlordTenancyView from "@/components/dashboard/landlord-tenancy-view";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LandlordTenanciesPage({
  searchParams,
}: {
  searchParams?: { propertyId?: string };
}) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    redirect("/landlord/login");
  }

  const [dbUser, dbProperties] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      include: { landlordProfile: true },
    }),
    prisma.property.findMany({
      where: { landlordId: session.sub },
      include: {
        tenancies: {
          include: {
            student: {
              include: { studentProfile: true },
            },
            confirmationLetter: true,
          },
          orderBy: { createdAt: "desc" },
        },
        applications: {
          include: {
            student: {
              include: { studentProfile: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const user = {
    id: dbUser?.id || session.sub,
    name: dbUser?.name || "Landlord",
    surname: dbUser?.surname || "",
    email: dbUser?.email || "landlord@example.com",
    entityType: dbUser?.landlordProfile?.entityType || "Private Residence Operator",
  };

  const properties = dbProperties.map((p) => ({
    ...p,
    priceMonthly: Number(p.priceMonthly),
    depositAmount: p.depositAmount ? Number(p.depositAmount) : null,
    distanceToCampus: p.distanceToCampus ? Number(p.distanceToCampus) : null,
    safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
    tenancies: (p.tenancies || []).map((t) => ({
      ...t,
      monthlyRent: t.monthlyRent ? Number(t.monthlyRent) : Number(p.priceMonthly),
      deposit: t.deposit ? Number(t.deposit) : null,
    })),
  }));

  return (
    <B2cLandlordLayout activeTab="Tenancy" user={user} properties={properties}>
      <LandlordTenancyView
        properties={properties}
        initialSelectedPropertyId={searchParams?.propertyId}
        user={user}
      />
    </B2cLandlordLayout>
  );
}

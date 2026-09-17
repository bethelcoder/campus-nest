import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import ResidenceBuilderPage from "@/components/dashboard/residence-builder-page";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const session = await getSession();
  if (!session) return null;

  const [dbUser, dbProperties] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      include: { landlordProfile: true },
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

  return (
    <B2cLandlordLayout activeTab="My Residences" user={user} properties={properties}>
      <ResidenceBuilderPage user={user} />
    </B2cLandlordLayout>
  );
}

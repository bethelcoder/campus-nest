import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import LandlordKycPanel from "@/components/dashboard/landlord-kyc-panel";

export const dynamic = "force-dynamic";

export default async function LandlordVerificationPage() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    redirect("/landlord/login?next=/landlord/verification");
  }

  const [dbUser, properties] = await Promise.all([
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
    phone: dbUser?.phone || "",
    entityType: dbUser?.landlordProfile?.entityType || "Private Residence Operator",
  };

  const layoutProperties = properties.map((p) => ({
    ...p,
    safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
  }));

  const serializedProfile = dbUser?.landlordProfile ? {
    ...dbUser.landlordProfile,
    verifiedAt: dbUser.landlordProfile.verifiedAt ? dbUser.landlordProfile.verifiedAt.toISOString() : null,
    createdAt: dbUser.landlordProfile.createdAt.toISOString(),
    updatedAt: dbUser.landlordProfile.updatedAt.toISOString(),
  } : null;

  return (
    <B2cLandlordLayout activeTab="Business KYC & Banking" user={user} properties={layoutProperties}>
      <LandlordKycPanel
        initialProfile={serializedProfile as any}
        user={user}
      />
    </B2cLandlordLayout>
  );
}

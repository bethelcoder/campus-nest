import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import LandlordSetupActionGrid from "@/components/dashboard/landlord-setup-action-grid";

export const dynamic = "force-dynamic";

export default async function LandlordDashboardPage() {
  const session = await getSession();

  let user = {
    name: "Sipho",
    surname: "Dlamini",
    email: "sipho.dlamini@studentliving.co.za",
    entityType: "Private Residence Operator",
  };

  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        landlordProfile: true,
      },
    });

    if (dbUser) {
      user = {
        name: dbUser.name,
        surname: dbUser.surname,
        email: dbUser.email,
        entityType: dbUser.landlordProfile?.entityType || "Private Residence Operator",
      };
    }
  }

  return (
    <B2cLandlordLayout activeTab="Home" user={user}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl flex items-center gap-2">
            <span>Welcome to CampusNest Operator Portal</span>
            <span className="inline-block animate-bounce" role="img" aria-label="waving hand">
              👋
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#64748B]">
            Hi {user.name}, let&apos;s get your student housing listings &amp; safety accreditation verified.
          </p>
        </div>
        <LandlordSetupActionGrid user={user} />
      </div>
    </B2cLandlordLayout>
  );
}


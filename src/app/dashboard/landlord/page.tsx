import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import LandlordSetupActionGrid from "@/components/dashboard/landlord-setup-action-grid";

export const dynamic = "force-dynamic";

export default async function LandlordDashboardPage() {
  const session = await getSession();

  let user = {
    id: "",
    name: "Sipho",
    surname: "Dlamini",
    email: "sipho.dlamini@studentliving.co.za",
    entityType: "Private Residence Operator",
  };

  let properties: any[] = [];
  let applications: any[] = [];

  if (session) {
    const [dbUser, dbProperties, dbApplications] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.sub },
        include: {
          landlordProfile: true,
        },
      }),
      prisma.property.findMany({
        where: { landlordId: session.sub },
        include: {
          checklistItems: true,
          applications: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.findMany({
        where: {
          property: {
            landlordId: session.sub,
          },
        },
        include: {
          student: true,
          property: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (dbUser) {
      user = {
        id: dbUser.id,
        name: dbUser.name,
        surname: dbUser.surname,
        email: dbUser.email,
        entityType: dbUser.landlordProfile?.entityType || "Private Residence Operator",
      };
    }

    properties = dbProperties.map((p) => ({
      ...p,
      priceMonthly: Number(p.priceMonthly),
      depositAmount: p.depositAmount ? Number(p.depositAmount) : null,
      distanceToCampus: p.distanceToCampus ? Number(p.distanceToCampus) : null,
      safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
    }));

    applications = dbApplications.map((app) => ({
      id: app.id,
      studentName: `${app.student.name} ${app.student.surname}`,
      studentNumber: app.student.idNumber || app.student.id.slice(0, 8),
      institution: "University of the Witwatersrand",
      funder: "NSFAS Direct (Verified)",
      unit: `${app.property.title} (${app.property.bedrooms} Beds)`,
      status: app.status,
    }));
  }

  return (
    <B2cLandlordLayout activeTab="Home" user={user} properties={properties}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl flex items-center gap-2">
            <span>Welcome to CampusNest Operator Portal</span>
            <span className="inline-block animate-bounce" role="img" aria-label="waving hand">
              👋
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#64748B]">
            Hi {user.name}, manage your student housing listings &amp; track 13-point safety accreditation.
          </p>
        </div>
        <LandlordSetupActionGrid
          user={user}
          initialProperties={properties}
          initialApplications={applications}
        />
      </div>
    </B2cLandlordLayout>
  );
}

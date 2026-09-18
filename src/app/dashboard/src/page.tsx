import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";
import B2cSrcLayout from "@/components/dashboard/b2c-src-layout";
import SrcDashboardOverview, { SrcReportItem } from "@/components/dashboard/src-dashboard-overview";

export const dynamic = "force-dynamic";

export default async function SrcDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/src/login?next=/dashboard/src");
  if (session.role !== "SRC_REPRESENTATIVE") redirect(getRoleDashboardPath(session.role));

  const [dbUser, dbReports] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        institutionName: true,
      },
    }),
    prisma.safetyReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          include: {
            studentProfile: true,
          },
        },
        property: {
          include: {
            landlord: {
              select: {
                name: true,
                surname: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const user = {
    id: dbUser?.id || session.sub,
    name: dbUser?.name || "SRC Officer",
    surname: dbUser?.surname || "",
    email: dbUser?.email || "src.housing@wits.ac.za",
    institutionName: dbUser?.institutionName || "University Student Council",
  };

  const reports: SrcReportItem[] = dbReports.map((r) => ({
    id: r.id,
    subject: r.subject || "Residence Complaint",
    description: r.description,
    type: r.type,
    severity: r.severity,
    status: r.status,
    category: r.category,
    actionNotes: r.actionNotes,
    createdAt: r.createdAt.toISOString(),
    slaExpiresAt: r.slaExpiresAt ? r.slaExpiresAt.toISOString() : null,
    student: {
      name: `${r.reporter?.name || ""} ${r.reporter?.surname || ""}`.trim() || "Student",
      studentNumber: r.reporter?.studentProfile?.studentNumber || (r.reporter as any)?.idNumber || "STU-88210",
      institution: r.reporter?.studentProfile?.universityName || r.reporter?.institutionName || user.institutionName,
      email: r.reporter?.email || "",
      phone: r.reporter?.phone || undefined,
    },
    property: {
      id: r.property?.id || "",
      title: r.property?.title || "Residence",
      address: r.property ? `${r.property.address || ""}, ${r.property.suburb || ""}` : "Address not specified",
      suburb: r.property?.suburb || "",
      landlord: r.property?.landlord ? `${r.property.landlord.name || ""} ${r.property.landlord.surname || ""}`.trim() || "Landlord" : "Landlord",
      landlordEmail: r.property?.landlord?.email || "",
      landlordPhone: r.property?.landlord?.phone || undefined,
      safetyScore: r.property?.safetyScore ? Number(r.property.safetyScore) : null,
    },
  }));

  const openCount = reports.filter((r) => r.status !== "RESOLVED").length;

  return (
    <B2cSrcLayout activeTab="Crisis & Complaints" user={user} openCasesCount={openCount}>
      <SrcDashboardOverview initialReports={reports} user={user} />
    </B2cSrcLayout>
  );
}

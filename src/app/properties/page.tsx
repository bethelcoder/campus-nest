import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import StudentAccreditedResidencesBrowser, { StudentPropertyItem } from "@/components/properties/student-accredited-residences-browser";

export const dynamic = "force-dynamic";

export default async function AccreditedResidencesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/properties");
  if (session.role !== "STUDENT") redirect("/");

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { studentProfile: true },
  });
  if (!student) redirect("/login");

  const properties = await prisma.property.findMany({
    where: { status: "VERIFIED" },
    orderBy: [{ safetyScore: "desc" }, { createdAt: "desc" }],
    include: {
      landlord: {
        include: { landlordProfile: true },
      },
      checklistItems: { select: { passed: true } },
      roomListings: { select: { name: true, roomType: true, monthlyRent: true, availableUnits: true } },
      favorites: { where: { studentId: session.sub }, select: { id: true } },
      applications: { where: { studentId: session.sub }, select: { id: true } },
    },
  });

  const savedCount = await prisma.favorite.count({
    where: { studentId: session.sub },
  });

  const applicationsCount = await prisma.application.count({
    where: { studentId: session.sub },
  });

  const user = {
    name: student.name,
    surname: student.surname,
    email: student.email,
    universityEmail: student.universityEmail,
    studentNumber: student.studentProfile?.studentNumber,
    universityName: student.studentProfile?.universityName,
    fundingType: student.studentProfile?.fundingType,
  };

  const serializedProperties: StudentPropertyItem[] = properties.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    suburb: p.suburb,
    city: p.city,
    latitude: p.latitude !== null ? Number(p.latitude) : null,
    longitude: p.longitude !== null ? Number(p.longitude) : null,
    priceMonthly: Number(p.priceMonthly),
    depositAmount: p.depositAmount !== null ? Number(p.depositAmount) : null,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    maxOccupants: p.maxOccupants,
    distanceToCampus: p.distanceToCampus !== null ? Number(p.distanceToCampus) : null,
    safetyScore: p.safetyScore !== null ? Number(p.safetyScore) : null,
    status: p.status,
    description: p.description,
    amenities: p.amenities || [],
    images: p.images || [],
    physicalInspectionAt: p.physicalInspectionAt ? p.physicalInspectionAt.toISOString() : null,
    physicalInspectorName: p.physicalInspectorName,
    accreditationReference: p.accreditationReference,
    landlord: {
      name: p.landlord.name,
      surname: p.landlord.surname,
      landlordProfile: p.landlord.landlordProfile ? {
        companyName: p.landlord.landlordProfile.companyName,
        entityType: p.landlord.landlordProfile.entityType,
      } : null,
    },
    passedChecks: p.checklistItems.filter((i) => i.passed === true).length,
    totalChecks: p.checklistItems.length,
    roomsAvailable: p.roomListings.reduce((sum, r) => sum + r.availableUnits, 0),
    isSaved: p.favorites.length > 0,
    hasApplied: p.applications.length > 0,
  }));

  return (
    <B2cStudentLayout
      activeTab="Accredited Residences"
      user={user}
      savedCount={savedCount}
      applicationsCount={applicationsCount}
    >
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#059669]">Verified housing registry</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Accredited Residences</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Browse residences verified by CampusNest and published by registered accommodation providers with live Wits Campus proximity.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            {serializedProperties.length} accredited {serializedProperties.length === 1 ? "residence" : "residences"}
          </div>
        </div>

        <StudentAccreditedResidencesBrowser properties={serializedProperties} />
      </div>
    </B2cStudentLayout>
  );
}

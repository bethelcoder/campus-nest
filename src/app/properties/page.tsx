import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import ApplyButton from "./apply-button";
import FavoriteButton from "./favorite-button";

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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Verified housing registry</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Accredited Residences</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Browse residences verified by CampusNest and published by registered accommodation providers.
            </p>
          </div>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            {properties.length} accredited {properties.length === 1 ? "residence" : "residences"}
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-10 text-center">
            <p className="font-bold text-[#0F172A]">No accredited residences available yet</p>
            <p className="mt-1 text-sm text-[#64748B]">Verified landlord listings will appear here once approved.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => {
              const passed = property.checklistItems.filter((item) => item.passed === true).length;
              const total = property.checklistItems.length;
              const landlordProfile = property.landlord.landlordProfile;
              const providerName = landlordProfile?.companyName || `${property.landlord.name} ${property.landlord.surname}`;
              const inspected = Boolean(property.physicalInspectionAt && property.physicalInspectorName);

              return (
                <article key={property.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-lg">
                  <div className="relative flex h-36 items-end bg-gradient-to-br from-[#312E81] via-[#4338CA] to-[#0F766E] p-5 text-white">
                    <div className="absolute right-4 top-4 flex items-center gap-2">
                      <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur">
                        Accredited
                      </span>
                      <FavoriteButton propertyId={property.id} initialSaved={property.favorites.length > 0} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-indigo-100">{property.suburb}, {property.city}</p>
                      <h2 className="mt-1 text-xl font-bold tracking-tight">{property.title}</h2>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-sm leading-5 text-[#64748B]">{property.address}, {property.suburb}, {property.city}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-[#94A3B8]">Monthly rent</p><p className="mt-1 font-bold text-[#0F172A]">R {Number(property.priceMonthly).toLocaleString("en-ZA")}</p></div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-[#94A3B8]">Safety score</p><p className="mt-1 font-bold text-emerald-700">{property.safetyScore ? `${Number(property.safetyScore).toFixed(1)} / 10` : "Verified"}</p></div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-[#94A3B8]">Bedrooms</p><p className="mt-1 font-bold text-[#0F172A]">{property.bedrooms}</p></div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-[#94A3B8]">Checklist</p><p className="mt-1 font-bold text-[#0F172A]">{passed}/{total} passed</p></div>
                    </div>

                    <div className="mt-4 border-t border-[#F1F5F9] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Listed by</p>
                      <p className="mt-1 text-sm font-bold text-[#0F172A]">{providerName}</p>
                      <p className="mt-1 text-xs text-[#64748B]">{landlordProfile?.entityType?.replaceAll("_", " ") || "Registered accommodation provider"}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">Safety verified</span>
                      {inspected && <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">Physically inspected</span>}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link href={`/properties/${property.id}`} className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC]">View details</Link>
                      <ApplyButton propertyId={property.id} hasApplied={property.applications.length > 0} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </B2cStudentLayout>
  );
}

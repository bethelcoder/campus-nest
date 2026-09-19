import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import ApplyButton from "./apply-button";
import FavoriteButton from "./favorite-button";
import { getPublicMediaUrl, FALLBACK_RESIDENCE_IMAGES } from "@/lib/media";
import { LuShieldCheck, LuMapPin } from "react-icons/lu";

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

              const isNsfas =
                (property.amenities || []).includes("NSFAS_ACCREDITED") ||
                (property.description && /nsfas accredited/i.test(property.description));
              const publicAmenities = (property.amenities || []).filter((a) => a !== "NSFAS_ACCREDITED");

              const resolvedImages = (property.images || []).map(getPublicMediaUrl).filter(Boolean);
              const photoCount = resolvedImages.length;
              const fallbackIndex =
                [...property.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_RESIDENCE_IMAGES.length;
              const coverImage =
                resolvedImages[0] || FALLBACK_RESIDENCE_IMAGES[fallbackIndex];
              const thumbnails = resolvedImages.slice(1, 4);

              const roomsAvailable = property.roomListings.reduce((sum, r) => sum + r.availableUnits, 0);

              return (
                <article
                  key={property.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-lg"
                >
                  {/* Real photos */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#E2E8F0]">
                    <img
                      src={coverImage}
                      alt={property.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#047857]">
                        Accredited
                      </span>
                      {isNsfas && (
                        <span className="rounded-full bg-[#047857] px-2.5 py-1 text-[10px] font-bold text-white">
                          NSFAS
                        </span>
                      )}
                      {property.status === "VERIFIED" && (
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#0F172A]">
                          Verified Safe
                        </span>
                      )}
                    </div>

                    <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5 justify-end">
                      {property.safetyScore && (
                        <span className="flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white/95 px-2.5 py-1 text-xs font-black text-[#047857] shadow-xs">
                          <LuShieldCheck className="h-3.5 w-3.5" />
                          {Number(property.safetyScore).toFixed(1)}/10
                        </span>
                      )}
                      <FavoriteButton propertyId={property.id} initialSaved={property.favorites.length > 0} />
                    </div>

                    {photoCount > 0 && (
                      <span className="absolute bottom-3 right-3 rounded-full bg-[#0F172A]/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                        {photoCount} {photoCount === 1 ? "photo" : "photos"}
                      </span>
                    )}
                  </div>

                  {thumbnails.length > 0 && (
                    <div className="grid grid-cols-3 gap-1 bg-white px-1 pt-1">
                      {thumbnails.map((src, i) => (
                        <img key={i} src={src} alt={`${property.title} photo ${i + 2}`} className="h-16 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold leading-tight text-[#0F172A]">{property.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                      <LuMapPin className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                      {property.address}, {property.suburb}, {property.city}
                    </p>

                    {property.description && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#64748B]">{property.description}</p>
                    )}

                    {publicAmenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {publicAmenities.slice(0, 5).map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#475569]"
                          >
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                        {publicAmenities.length > 5 && (
                          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#94A3B8]">
                            +{publicAmenities.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Monthly rent</p>
                        <p className="mt-1 font-bold text-[#0F172A]">R {Number(property.priceMonthly).toLocaleString("en-ZA")}</p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Deposit</p>
                        <p className="mt-1 font-bold text-[#0F172A]">
                          {property.depositAmount ? `R ${Number(property.depositAmount).toLocaleString("en-ZA")}` : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Bedrooms</p>
                        <p className="mt-1 font-bold text-[#0F172A]">{property.bedrooms}</p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Bathrooms</p>
                        <p className="mt-1 font-bold text-[#0F172A]">{property.bathrooms ?? "—"}</p>
                      </div>
                      {property.distanceToCampus && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[#94A3B8]">Distance to campus</p>
                          <p className="mt-1 font-bold text-[#0F172A]">
                            {Number(property.distanceToCampus).toFixed(1)} km
                          </p>
                        </div>
                      )}
                      {property.maxOccupants && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[#94A3B8]">Max occupants</p>
                          <p className="mt-1 font-bold text-[#0F172A]">{property.maxOccupants}</p>
                        </div>
                      )}
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Safety checks</p>
                        <p className="mt-1 font-bold text-emerald-700">
                          {passed}/{total} passed
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Rooms available</p>
                        <p className="mt-1 font-bold text-[#0F172A]">{roomsAvailable > 0 ? roomsAvailable : "—"}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#F1F5F9] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Listed by</p>
                      <p className="mt-1 text-sm font-bold text-[#0F172A]">{providerName}</p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {landlordProfile?.entityType?.replaceAll("_", " ") || "Registered accommodation provider"}
                      </p>
                      {property.accreditationReference && (
                        <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">
                          Ref: {property.accreditationReference}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">Safety verified</span>
                      {inspected && (
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">
                          Inspected by {property.physicalInspectorName}
                        </span>
                      )}
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

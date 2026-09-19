import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import FavoriteButton from "@/app/properties/favorite-button";
import ApplyButton from "@/app/properties/apply-button";
import { getPublicMediaUrl, FALLBACK_RESIDENCE_IMAGES } from "@/lib/media";
import { LuShieldCheck } from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function SavedFavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/saved");
  if (session.role !== "STUDENT") redirect("/");

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      studentProfile: true,
      favorites: {
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            include: {
              landlord: { include: { landlordProfile: true } },
              checklistItems: { select: { passed: true } },
              roomListings: { select: { availableUnits: true } },
            },
          },
        },
      },
      applications: { select: { propertyId: true } },
    },
  });

  if (!student) redirect("/login");

  const user = {
    name: student.name,
    surname: student.surname,
    email: student.email,
    universityEmail: student.universityEmail,
    studentNumber: student.studentProfile?.studentNumber,
    universityName: student.studentProfile?.universityName,
    fundingType: student.studentProfile?.fundingType,
  };

  const applicationsCount = await prisma.application.count({
    where: { studentId: session.sub },
  });

  const favorites = student.favorites;
  const appliedPropertyIds = new Set(student.applications.map((a) => a.propertyId));

  return (
    <B2cStudentLayout
      activeTab="Saved Favorites"
      user={user}
      savedCount={favorites.length}
      applicationsCount={applicationsCount}
    >
      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#059669]">Personal Housing Shortlist</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Saved Favorites</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Residences you have saved using the bookmark icon. Easily compare safety scores, monthly rents, and apply directly.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-xl bg-[#059669] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#047857]"
          >
            Browse Accredited Residences &rarr;
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D1FAE5] text-[#059669]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#0F172A]">No saved residences yet</h2>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Explore verified student accommodations and click the bookmark icon to keep track of your top choices here.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-xl bg-[#059669] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#047857]"
            >
              Discover Residences
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => {
              const prop = favorite.property;
              const passed = prop.checklistItems.filter((i) => i.passed === true).length;
              const total = prop.checklistItems.length;
              const providerName =
                prop.landlord.landlordProfile?.companyName ||
                `${prop.landlord.name} ${prop.landlord.surname}`;
              const inspected = Boolean(prop.physicalInspectionAt && prop.physicalInspectorName);
              const roomsAvailable = prop.roomListings.reduce((sum, r) => sum + r.availableUnits, 0);

              const isNsfas =
                (prop.amenities || []).includes("NSFAS_ACCREDITED") ||
                (prop.description && /nsfas accredited/i.test(prop.description));
              const publicAmenities = (prop.amenities || []).filter((a) => a !== "NSFAS_ACCREDITED");

              const resolvedImages = (prop.images || []).map(getPublicMediaUrl).filter(Boolean);
              const photoCount = resolvedImages.length;
              const thumbnails = resolvedImages.slice(1, 4);
              const fallbackIndex =
                [...prop.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_RESIDENCE_IMAGES.length;
              const coverImage = resolvedImages[0] || FALLBACK_RESIDENCE_IMAGES[fallbackIndex];

              return (
                <article
                  key={favorite.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#E2E8F0]">
                    <img src={coverImage} alt={prop.title} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#047857]">
                        Accredited
                      </span>
                      {isNsfas && (
                        <span className="rounded-full bg-[#047857] px-2.5 py-1 text-[10px] font-bold text-white">
                          NSFAS
                        </span>
                      )}
                    </div>
                    <div className="absolute right-3 top-3">
                      <FavoriteButton propertyId={prop.id} initialSaved={true} />
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
                        <img key={i} src={src} alt={`${prop.title} photo ${i + 2}`} className="h-14 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  )}

                  <div className="mb-1 flex flex-wrap items-center justify-between border-b border-[#F1F5F9] px-5 pb-2 pt-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                      {roomsAvailable > 0 ? `${roomsAvailable} rooms available` : "Residence"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">Safety verified</span>
                      {inspected && (
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-sky-700">
                          Inspected by {prop.physicalInspectorName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="text-lg font-bold leading-tight text-[#0F172A]">{prop.title}</h2>
                    <p className="mt-1 text-sm leading-5 text-[#64748B]">
                      {prop.address}, {prop.suburb}, {prop.city}
                    </p>

                    {prop.description && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#64748B]">{prop.description}</p>
                    )}

                    {publicAmenities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {publicAmenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#475569]"
                          >
                            {a.replace(/_/g, " ")}
                          </span>
                        ))}
                        {publicAmenities.length > 4 && (
                          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#94A3B8]">
                            +{publicAmenities.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Monthly rent</p>
                        <p className="mt-1 font-bold text-[#0F172A]">
                          R {Number(prop.priceMonthly).toLocaleString("en-ZA")}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Safety score</p>
                        <p className="mt-1 flex items-center gap-1 font-bold text-emerald-700">
                          <LuShieldCheck className="h-3.5 w-3.5" />
                          {prop.safetyScore ? `${Number(prop.safetyScore).toFixed(1)} / 10` : "Verified"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Bedrooms</p>
                        <p className="mt-1 font-bold text-[#0F172A]">{prop.bedrooms}</p>
                      </div>
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Bathrooms</p>
                        <p className="mt-1 font-bold text-[#0F172A]">{prop.bathrooms ?? "—"}</p>
                      </div>
                      {prop.depositAmount && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[#94A3B8]">Deposit</p>
                          <p className="mt-1 font-bold text-[#0F172A]">
                            R {Number(prop.depositAmount).toLocaleString("en-ZA")}
                          </p>
                        </div>
                      )}
                      {prop.distanceToCampus && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[#94A3B8]">Distance to campus</p>
                          <p className="mt-1 font-bold text-[#0F172A]">
                            {Number(prop.distanceToCampus).toFixed(1)} km
                          </p>
                        </div>
                      )}
                      {prop.maxOccupants && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[#94A3B8]">Max occupants</p>
                          <p className="mt-1 font-bold text-[#0F172A]">{prop.maxOccupants}</p>
                        </div>
                      )}
                      <div className="rounded-xl bg-[#F8FAFC] p-3">
                        <p className="text-[#94A3B8]">Checklist</p>
                        <p className="mt-1 font-bold text-[#0F172A]">
                          {passed}/{total} passed
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#F1F5F9] pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        Listed by
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#0F172A]">{providerName}</p>
                      <p className="mt-1 text-xs text-[#64748B]">
                        {prop.landlord.landlordProfile?.entityType?.replaceAll("_", " ") ||
                          "Registered accommodation provider"}
                      </p>
                      {prop.accreditationReference && (
                        <p className="mt-1 font-mono text-[10px] text-[#94A3B8]">
                          Ref: {prop.accreditationReference}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/properties/${prop.id}`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                      >
                        View details
                      </Link>
                      <ApplyButton propertyId={prop.id} hasApplied={appliedPropertyIds.has(prop.id)} />
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

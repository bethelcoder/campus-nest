import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/rbac";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import FavoriteButton from "@/app/properties/favorite-button";
import ApplyButton from "@/app/properties/apply-button";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();

  let user = {
    name: "Lerato",
    surname: "Nkosi",
    email: "lerato.nkosi@students.wits.ac.za",
    universityEmail: "lerato.nkosi@students.wits.ac.za",
    studentNumber: "2489102",
    universityName: "University of the Witwatersrand (Wits)",
    fundingType: "NSFAS",
  };

  let favorites: Array<{
    id: string;
    property: {
      id: string;
      title: string;
      address: string;
      suburb: string;
      city: string;
      priceMonthly: unknown;
      safetyScore: unknown;
      bedrooms: number;
      landlord: {
        name: string;
        surname: string;
        landlordProfile: {
          companyName?: string | null;
          entityType?: string | null;
        } | null;
      };
    };
  }> = [];

  let applications: Array<{
    id: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    createdAt: Date;
    property: {
      id: string;
      title: string;
      address: string;
      suburb: string;
      city: string;
      priceMonthly: unknown;
      landlord: {
        name: string;
        surname: string;
        landlordProfile: {
          companyName?: string | null;
        } | null;
      };
    };
    roomListing: {
      name: string;
      roomType: string;
      monthlyRent: unknown;
    } | null;
  }> = [];

  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        studentProfile: true,
        favorites: {
          orderBy: { createdAt: "desc" },
          include: {
            property: {
              include: {
                landlord: { include: { landlordProfile: true } },
              },
            },
          },
        },
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            property: {
              include: {
                landlord: { include: { landlordProfile: true } },
              },
            },
            roomListing: true,
          },
        },
      },
    });

    if (dbUser) {
      user = {
        name: dbUser.name,
        surname: dbUser.surname,
        email: dbUser.email,
        universityEmail: dbUser.universityEmail || dbUser.email,
        studentNumber: dbUser.studentProfile?.studentNumber || "2489102",
        universityName: dbUser.studentProfile?.universityName || "University of the Witwatersrand (Wits)",
        fundingType: dbUser.studentProfile?.fundingType || "NSFAS",
      };
      favorites = dbUser.favorites as typeof favorites;
      applications = dbUser.applications as typeof applications;
    }
  }

  const appliedPropertyIds = new Set(applications.map((a) => a.property.id));

  return (
    <B2cStudentLayout
      activeTab="Home"
      user={user}
      savedCount={favorites.length}
      applicationsCount={applications.length}
    >
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl flex items-center gap-2">
            <span>Welcome to CampusNest</span>
            <span className="inline-block animate-bounce" role="img" aria-label="waving hand">
              👋
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#64748B]">
            Hi {user.name}, let&apos;s get your student profile &amp; housing applications ready.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#F3E8FF] bg-gradient-to-br from-[#F5F3FF] via-white to-[#ECFEFF] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#7C3AED]">Why CampusNest</p>
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A] md:text-2xl">
                The right home makes all the difference.
              </h2>
              <p className="text-sm leading-relaxed text-[#475569] md:text-base">
                Studying is hard enough — where you rest shouldn&apos;t be. That&apos;s why every residence on
                CampusNest is verified <strong className="text-[#0F172A]">safe</strong>, within <strong className="text-[#0F172A]">walking distance</strong> of
                campus, and priced with a <strong className="text-[#0F172A]">student budget</strong> in mind.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xl font-black text-emerald-700">Safe</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Verified</p>
              </div>
              <div className="rounded-xl border border-indigo-200 bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xl font-black text-emerald-700">Close</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">To Campus</p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xl font-black text-emerald-700">Affordable</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Student Budget</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Applications Quick Tracker */}
        <section id="applications" className="space-y-4 scroll-mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Application Tracker</p>
              <h2 className="mt-1 text-xl font-bold text-[#0F172A]">My Applications</h2>
            </div>
            <Link href="/dashboard/student/applications" className="text-xs font-bold text-[#7C3AED] hover:underline">
              View all applications ({applications.length}) &rarr;
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {applications.map((app) => {
                const prop = app.property;
                const room = app.roomListing;
                const provider =
                  prop.landlord.landlordProfile?.companyName ||
                  `${prop.landlord.name} ${prop.landlord.surname}`;

                let statusBadge = (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    Pending Review
                  </span>
                );
                if (app.status === "ACCEPTED") {
                  statusBadge = (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                      Approved
                    </span>
                  );
                } else if (app.status === "REJECTED") {
                  statusBadge = (
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                      Declined
                    </span>
                  );
                }

                return (
                  <div
                    key={app.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-[#0F172A]">{prop.title}</h3>
                          <p className="mt-0.5 text-xs text-[#64748B]">
                            {prop.address}, {prop.suburb}, {prop.city}
                          </p>
                        </div>
                        {statusBadge}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8FAFC] p-3 rounded-xl">
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Room Type</p>
                          <p className="font-bold text-[#0F172A]">
                            {room ? `${room.name}` : "Standard Unit"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#94A3B8]">Landlord</p>
                          <p className="font-bold text-[#0F172A] truncate">{provider}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2 border-t border-[#F1F5F9] text-xs">
                      <span className="text-[#94A3B8] text-[11px]">
                        Applied on {new Date(app.createdAt).toLocaleDateString("en-ZA")}
                      </span>
                      <Link
                        href="/dashboard/student/applications"
                        className="font-bold text-[#7C3AED] hover:underline"
                      >
                        Track Status &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-7 text-center text-sm text-[#64748B]">
              No residential applications submitted yet. Browse accredited residences and click &ldquo;Apply&rdquo; to track them here.
            </div>
          )}
        </section>

        {/* Saved Favorites Section */}
        <section id="saved" className="space-y-4 scroll-mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Your shortlist</p>
              <h2 className="mt-1 text-xl font-bold text-[#0F172A]">Saved Favorites</h2>
            </div>
            <Link href="/dashboard/student/saved" className="text-xs font-bold text-[#7C3AED] hover:underline">
              View saved shortlist ({favorites.length}) &rarr;
            </Link>
          </div>

          {favorites.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {favorites.map((favorite) => {
                const prop = favorite.property;
                const provider =
                  prop.landlord.landlordProfile?.companyName ||
                  `${prop.landlord.name} ${prop.landlord.surname}`;

                return (
                  <article
                    key={favorite.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:shadow-md"
                  >
                    <div className="relative flex h-28 items-end bg-gradient-to-br from-[#312E81] via-[#4338CA] to-[#0F766E] p-4 text-white">
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur">
                          Accredited
                        </span>
                        <FavoriteButton propertyId={prop.id} initialSaved={true} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-indigo-100">
                          {prop.suburb}, {prop.city}
                        </p>
                        <h3 className="text-lg font-bold tracking-tight truncate">{prop.title}</h3>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs text-[#64748B]">
                        {prop.address}, {prop.suburb}, {prop.city}
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                          <p className="text-[#94A3B8] text-[10px]">Monthly rent</p>
                          <p className="mt-0.5 font-bold text-[#0F172A]">
                            R {Number(prop.priceMonthly).toLocaleString("en-ZA")}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#F8FAFC] p-2.5">
                          <p className="text-[#94A3B8] text-[10px]">Safety score</p>
                          <p className="mt-0.5 font-bold text-emerald-700">
                            {prop.safetyScore ? `${Number(prop.safetyScore).toFixed(1)} / 10` : "Verified"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-3 text-xs">
                        <span className="font-semibold text-[#64748B] text-[11px]">
                          Provider: <strong className="text-[#0F172A]">{provider}</strong>
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href={`/properties/${prop.id}`}
                          className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-3 py-2 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                        >
                          View Details
                        </Link>
                        <ApplyButton propertyId={prop.id} hasApplied={appliedPropertyIds.has(prop.id)} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center space-y-3">
              <p className="font-bold text-[#0F172A]">No saved residences yet</p>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Use the bookmark icon on any accredited residence to save it to your favorites shortlist for quick access.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#6D28D9]"
              >
                Browse Accredited Residences
              </Link>
            </div>
          )}
        </section>
      </div>
    </B2cStudentLayout>
  );
}

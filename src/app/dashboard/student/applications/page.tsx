import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";

export const dynamic = "force-dynamic";

export default async function StudentApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/applications");
  if (session.role !== "STUDENT") redirect("/");

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      studentProfile: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            include: {
              landlord: { include: { landlordProfile: true } },
            },
          },
          roomListing: true,
          funderLetterRequest: true,
        },
      },
      favorites: { select: { id: true } },
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

  const applications = student.applications;
  const savedCount = student.favorites.length;

  return (
    <B2cStudentLayout
      activeTab="My Applications"
      user={user}
      savedCount={savedCount}
      applicationsCount={applications.length}
    >
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Page Title Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
              Housing Application Tracker
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">
              My Applications
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Track the status of your submitted accredited residence applications and manage tenancy confirmations.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#6D28D9]"
          >
            Browse Accredited Residences &rarr;
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE9FE] text-[#7C3AED]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#0F172A]">No applications submitted yet</h2>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Explore accredited residences and submit an application to track landlord review and approval statuses here.
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-xl bg-[#7C3AED] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#6D28D9]"
            >
              Explore Residences
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748B]">
                Showing {applications.length} submitted {applications.length === 1 ? "application" : "applications"}
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {applications.map((app) => {
                const prop = app.property;
                const room = app.roomListing;
                const providerName =
                  prop.landlord.landlordProfile?.companyName ||
                  `${prop.landlord.name} ${prop.landlord.surname}`;

                const rentAmount = room ? Number(room.monthlyRent) : Number(prop.priceMonthly);

                let statusBadge = (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Pending Review
                  </span>
                );

                if (app.status === "ACCEPTED") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Application Approved
                    </span>
                  );
                } else if (app.status === "REJECTED") {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Declined
                    </span>
                  );
                }

                return (
                  <article
                    key={app.id}
                    className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md"
                  >
                    <div className="space-y-4">
                      {/* Header row with Title & Status */}
                      <div className="flex items-start justify-between gap-3 border-b border-[#F1F5F9] pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                            Accredited Residence
                          </span>
                          <h2 className="text-lg font-bold text-[#0F172A] leading-tight">
                            {prop.title}
                          </h2>
                          <p className="mt-1 text-xs text-[#64748B]">
                            {prop.address}, {prop.suburb}, {prop.city}
                          </p>
                        </div>
                        {statusBadge}
                      </div>

                      {/* Application Details Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[10px] text-[#94A3B8]">Requested Room</p>
                          <p className="mt-0.5 font-bold text-[#0F172A]">
                            {room ? `${room.name} (${room.roomType})` : "Standard Unit"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[10px] text-[#94A3B8]">Monthly Rent</p>
                          <p className="mt-0.5 font-bold text-[#0F172A]">
                            R {rentAmount.toLocaleString("en-ZA")}/mo
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[10px] text-[#94A3B8]">Landlord / Provider</p>
                          <p className="mt-0.5 font-bold text-[#0F172A] truncate">{providerName}</p>
                        </div>
                        <div className="rounded-xl bg-[#F8FAFC] p-3">
                          <p className="text-[10px] text-[#94A3B8]">Applied On</p>
                          <p className="mt-0.5 font-bold text-[#0F172A]">
                            {new Date(app.createdAt).toLocaleDateString("en-ZA", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {app.message && (
                        <div className="rounded-xl bg-[#F8FAFC] p-3 text-xs">
                          <p className="text-[10px] font-bold uppercase text-[#94A3B8]">Application Note</p>
                          <p className="mt-1 text-[#475569] italic">&ldquo;{app.message}&rdquo;</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-4">
                      <Link
                        href={`/properties/${prop.id}`}
                        className="text-xs font-bold text-[#334155] hover:text-[#7C3AED] transition-colors"
                      >
                        View Residence Details &rarr;
                      </Link>

                      <Link
                        href={`/applications/proof/${app.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7C3AED] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-[#6D28D9]"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Download Proof Letter</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </B2cStudentLayout>
  );
}

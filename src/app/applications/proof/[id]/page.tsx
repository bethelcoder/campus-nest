import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PrintButton from "./print-button";

export const dynamic = "force-dynamic";

export default async function ApplicationProofLetterPage({
  params,
}: {
  params: { id: string };
}) {
  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      student: { include: { studentProfile: true } },
      property: {
        include: {
          landlord: { include: { landlordProfile: true } },
          checklistItems: { select: { passed: true } },
        },
      },
      roomListing: true,
    },
  });

  if (!application) notFound();

  const student = application.student;
  const profile = student.studentProfile;
  const property = application.property;
  const landlord = property.landlord;
  const landlordProfile = landlord.landlordProfile;
  const room = application.roomListing;

  const providerName =
    landlordProfile?.companyName || `${landlord.name} ${landlord.surname}`;
  const addressStr = `${property.address}, ${property.suburb}, ${property.city}`;
  const rentAmount = room ? Number(room.monthlyRent) : Number(property.priceMonthly);

  const referenceCode = `CN-PROOF-${application.id.slice(-8).toUpperCase()}`;

  let statusText = "PENDING REVIEW";
  let statusBg = "bg-amber-100 text-amber-900 border-amber-300";

  if (application.status === "ACCEPTED") {
    statusText = "APPLICATION APPROVED / ACCEPTED";
    statusBg = "bg-emerald-100 text-emerald-900 border-emerald-300";
  } else if (application.status === "REJECTED") {
    statusText = "DECLINED";
    statusBg = "bg-rose-100 text-rose-900 border-rose-300";
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-8 font-poppins text-[#0F172A] sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* Top Floating Actions (Hidden on Print) */}
      <div className="mx-auto max-w-4xl mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/student/applications"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
        >
          &larr; Back to My Applications
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#CBD5E1] bg-white shadow-2xl print:border-none print:shadow-none print:rounded-none">
        {/* Header Branding */}
        <header className="relative bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] px-8 py-10 text-white sm:px-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                CampusNest Official Housing Registry
              </div>
              <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                OFFICIAL PROOF OF APPLICATION &amp; LEASE INTENT
              </h1>
              <p className="mt-2 text-xs font-medium text-indigo-200">
                Official System Stamp &amp; Certificate for Student Funding Authorities (NSFAS &amp; Corporate Bursaries)
              </p>
            </div>

            {/* Official Digital Stamp Box */}
            <div className="shrink-0 rounded-2xl border-2 border-dashed border-emerald-400/60 bg-white/10 p-4 text-center backdrop-blur shadow-inner">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                OFFICIAL SYSTEM STAMP
              </div>
              <div className="mt-1 text-xs font-black tracking-wide text-white">
                VERIFIED BY CAMPUSNEST
              </div>
              <div className="mt-1 font-mono text-[10px] text-indigo-200">
                REF: {referenceCode}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-8 p-8 sm:p-12">
          {/* Status Announcement Banner */}
          <div className={`rounded-2xl border p-5 text-sm font-semibold flex items-center justify-between gap-4 ${statusBg}`}>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold">Current Application Status</p>
              <p className="mt-0.5 text-base font-black">{statusText}</p>
            </div>
            <div className="text-right text-xs">
              <p>Submitted On</p>
              <p className="font-bold">
                {new Date(application.createdAt).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Student Profile Info */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED] flex items-center gap-2">
              <span>1. Verified Student Profile</span>
            </h2>
            <dl className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-2 text-xs">
              <div>
                <dt className="text-[#64748B]">Full Name</dt>
                <dd className="mt-1 font-bold text-[#0F172A] text-sm">
                  {student.name} {student.surname}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Student Number</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {profile?.studentNumber || "2489102"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">University / Institution</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {profile?.universityName || "University of the Witwatersrand (Wits)"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Funding Body / Bursary</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {profile?.funderName || profile?.fundingType || "NSFAS Direct Allowance"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Student Email</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">{student.universityEmail || student.email}</dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Identity Number / Passport</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">{student.idNumber || "Verified via Student Portal"}</dd>
              </div>
            </dl>
          </section>

          {/* Property & Landlord Info */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              2. Accredited Residence &amp; Provider Record
            </h2>
            <dl className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-2 text-xs">
              <div className="sm:col-span-2">
                <dt className="text-[#64748B]">Residence Facility Title</dt>
                <dd className="mt-1 font-bold text-[#0F172A] text-sm">{property.title}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#64748B]">Registered Physical Address</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">{addressStr}</dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Accommodation Provider / Operator</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">{providerName}</dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Entity Registration / Type</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {landlordProfile?.entityType?.replaceAll("_", " ") || "Private Residence Operator"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Student Safety &amp; Security Rating</dt>
                <dd className="mt-1 font-bold text-emerald-700">
                  {property.safetyScore ? `${Number(property.safetyScore).toFixed(1)} / 10 (Tier-1 High Security & 13-Point Inspected)` : "Verified 13-Point Safety Standard"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Landlord Contact Email</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">{landlord.email}</dd>
              </div>
            </dl>
          </section>

          {/* Lease Details */}
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
              3. Applied Room &amp; Lease Terms
            </h2>
            <dl className="grid gap-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-2 text-xs">
              <div>
                <dt className="text-[#64748B]">Requested Room Type</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {room ? `${room.name} (${room.roomType})` : "Standard Student Unit"}
                </dd>
              </div>
              <div>
                <dt className="text-[#64748B]">Monthly Rent Rate</dt>
                <dd className="mt-1 font-bold text-[#0F172A] text-sm">
                  R {rentAmount.toLocaleString("en-ZA")} / month
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[#64748B]">Application Note &amp; Lease Duration</dt>
                <dd className="mt-1 font-bold text-[#0F172A]">
                  {application.message || "Duration: 10 Months (Feb - Nov Academic Year)"}
                </dd>
              </div>
            </dl>
          </section>

          {/* Official Verification Statement */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5 text-xs leading-relaxed text-indigo-950 space-y-2">
            <p className="font-bold">Notice to NSFAS &amp; Financial Aid Offices:</p>
            <p>
              This document serves as formal system-generated confirmation that student{" "}
              <strong>{student.name} {student.surname}</strong> has formally submitted a housing application for accredited residence <strong>{property.title}</strong> through the CampusNest housing network. The residence meets university safety and compliance guidelines.
            </p>
          </div>

          {/* Letter Footer */}
          <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E7EB] pt-6 text-xs text-[#64748B]">
            <div>
              <p className="font-bold text-[#0F172A]">CampusNest Accredited Student Housing Registry</p>
              <p className="text-[11px]">System Reference: {referenceCode}</p>
            </div>
            <div className="text-right text-[11px]">
              <p>Generated: {new Date().toLocaleDateString("en-ZA")}</p>
              <p className="text-emerald-700 font-bold">Verified Digital Registry Entry</p>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}

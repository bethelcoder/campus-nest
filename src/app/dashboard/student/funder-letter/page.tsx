import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/rbac";
import RequestLetterButton from "./request-letter-button";

export const dynamic = "force-dynamic";

function money(value: unknown) {
  if (value === null || value === undefined) return "Not provided";
  return `R ${Number(value).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month`;
}

export default async function StudentFunderLetterPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/funder-letter");
  if (session.role !== "STUDENT") redirect(getRoleDashboardPath(session.role));

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      studentProfile: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          property: { include: { checklistItems: true } },
          funderLetterRequest: true,
        },
      },
    },
  });
  if (!student) redirect("/login");

  const profile = student.studentProfile;
  const user = {
    name: student.name,
    surname: student.surname,
    email: student.email,
    universityEmail: student.universityEmail,
    studentNumber: profile?.studentNumber,
    universityName: profile?.universityName,
    fundingType: profile?.fundingType,
  };

  return (
    <B2cStudentLayout activeTab="QR Funder Letter" user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#059669]">Residence verification</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Request a funder letter</h1>
          <p className="max-w-3xl text-sm leading-6 text-[#64748B]">
            Select a residence you have applied for. CampusNest will only issue a letter when the residence is accredited,
            every recorded checkpoint has passed, and a physical inspection by a CampusNest manager is on record.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p className="font-bold">What the letter proves</p>
          <p className="mt-1 leading-6">
            The letter carries the residence address, landlord, rent, safety score, passed checklist count, accreditation
            reference, and the inspection manager and date. The funder can validate it using the unique reference.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">Your residence applications</h2>
            <span className="text-xs font-semibold text-[#64748B]">{student.applications.length} application(s)</span>
          </div>

          {student.applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
              <p className="font-bold text-[#0F172A]">No applications yet</p>
              <p className="mt-1 text-sm text-[#64748B]">Apply to an accredited residence before requesting its funder letter.</p>
            </div>
          ) : (
            student.applications.map((application) => {
              const property = application.property;
              const passed = property.checklistItems.filter((item) => item.passed === true).length;
              const total = property.checklistItems.length;
              const eligible = property.status === "VERIFIED" &&
                !!property.physicalInspectionAt &&
                !!property.physicalInspectorName &&
                total > 0 &&
                passed === total;
              const eligibilityMessage = property.status !== "VERIFIED"
                ? "The residence has not been accredited by CampusNest administration yet."
                : !property.physicalInspectionAt || !property.physicalInspectorName
                  ? "CampusNest has not recorded the physical inspection yet."
                  : total === 0 || passed !== total
                    ? `The residence safety checklist is incomplete (${passed} of ${total} checkpoints passed).`
                    : "";

              return (
                <article key={application.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:p-6">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A]">{property.title}</h3>
                        <p className="mt-1 text-sm text-[#64748B]">{property.address}, {property.suburb}, {property.city}</p>
                      </div>
                      <div className="grid gap-x-8 gap-y-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                        <div><p className="font-bold uppercase tracking-wider text-[#94A3B8]">Monthly rent</p><p className="mt-1 font-semibold text-[#0F172A]">{money(property.priceMonthly)}</p></div>
                        <div><p className="font-bold uppercase tracking-wider text-[#94A3B8]">Safety score</p><p className="mt-1 font-semibold text-[#0F172A]">{property.safetyScore ? `${Number(property.safetyScore).toFixed(1)} / 10` : "Not scored"}</p></div>
                        <div><p className="font-bold uppercase tracking-wider text-[#94A3B8]">Checklist</p><p className="mt-1 font-semibold text-[#0F172A]">{passed} / {total} passed</p></div>
                        <div><p className="font-bold uppercase tracking-wider text-[#94A3B8]">Inspection</p><p className="mt-1 font-semibold text-[#0F172A]">{property.physicalInspectionAt ? new Date(property.physicalInspectionAt).toLocaleDateString("en-ZA") : "Not recorded"}</p></div>
                      </div>
                    </div>
                    <RequestLetterButton applicationId={application.id} disabled={!eligible || !!application.funderLetterRequest} />
                  </div>
                  <div className={`mt-5 border-t pt-4 text-xs ${eligible ? "border-emerald-100 text-emerald-700" : "border-amber-100 text-amber-700"}`}>
                    {application.funderLetterRequest
                      ? `Letter request ${application.funderLetterRequest.status.toLowerCase().replace("_", " ")} · Reference ${application.funderLetterRequest.letterReference}`
                      : eligible
                        ? `Eligible for request · physically inspected by ${property.physicalInspectorName}`
                        : `Not eligible yet · ${eligibilityMessage}`}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </B2cStudentLayout>
  );
}

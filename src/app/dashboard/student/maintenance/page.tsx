import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import { redirect } from "next/navigation";
import ReportForm from "./report-form";
import EscalateReportButton from "./escalate-report-button";

export const dynamic = "force-dynamic";

export default async function StudentMaintenancePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/maintenance");

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      studentProfile: true,
      tenancies: {
        where: { status: "ACTIVE" },
        orderBy: { startDate: "desc" },
        include: {
          property: {
            include: {
              landlord: { select: { name: true, surname: true } },
              reports: {
                where: { reporterId: session.sub },
                orderBy: { createdAt: "desc" },
                take: 5,
              },
            },
          },
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
    <B2cStudentLayout activeTab="Repairs and Maintenance" user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Resident support</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Repairs and Maintenance</h1>
          <p className="max-w-3xl text-sm leading-6 text-[#64748B]">
            Report a repair or maintenance issue at a residence where you currently live. Your report is connected to the residence and sent to its landlord.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
          Only active tenancies are shown here. This keeps reports tied to the correct residence and landlord and gives each issue a trackable reference.
        </div>

        {student.tenancies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-8 text-center">
            <p className="font-bold text-[#0F172A]">No active residence yet</p>
            <p className="mt-1 text-sm text-[#64748B]">Maintenance reporting becomes available once a landlord confirms your tenancy.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {student.tenancies.map((tenancy) => (
              <section key={tenancy.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-bold text-[#0F172A]">{tenancy.property.title}</h2>
                    <p className="mt-1 text-sm text-[#64748B]">{tenancy.property.address}, {tenancy.property.suburb}, {tenancy.property.city}</p>
                    <p className="mt-2 text-xs font-semibold text-[#64748B]">Landlord: {tenancy.property.landlord.name} {tenancy.property.landlord.surname}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />Active tenancy</span>
                </div>

                <ReportForm propertyId={tenancy.propertyId} />

                {tenancy.property.reports.length > 0 && (
                  <div className="mt-6 border-t border-[#F1F5F9] pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Your recent reports</h3>
                    <div className="mt-3 divide-y divide-[#F1F5F9]">
                      {tenancy.property.reports.map((report) => (
                        <div key={report.id} className={`flex flex-col justify-between gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${report.status === "UNDER_INTERVENTION" || report.status === "ESCALATED" ? "border-red-300 bg-red-50" : "border-transparent"}`}>
                          <div><p className={`text-sm font-semibold ${report.status === "UNDER_INTERVENTION" || report.status === "ESCALATED" ? "text-red-900" : "text-[#0F172A]"}`}>{report.subject}</p><p className="text-xs text-[#64748B]">{report.category || "General"} · {new Date(report.createdAt).toLocaleDateString("en-ZA")}</p></div>
                          <div className="flex items-center gap-3">
                            <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${report.status === "UNDER_INTERVENTION" || report.status === "ESCALATED" ? "bg-red-600 text-white" : "bg-[#F1F5F9] text-[#475569]"}`}>{report.status.replace("_", " ")}</span>
                            {report.status !== "RESOLVED" && report.status !== "UNDER_INTERVENTION" && report.status !== "ESCALATED" && <EscalateReportButton reportId={report.id} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </B2cStudentLayout>
  );
}

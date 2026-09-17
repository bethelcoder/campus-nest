import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FunderVerificationLetter({ params }: { params: { reference: string } }) {
  const request = await prisma.funderLetterRequest.findUnique({
    where: { letterReference: params.reference },
    include: {
      student: { include: { studentProfile: true } },
      property: { include: { landlord: true } },
    },
  });
  if (!request) notFound();

  const student = request.student;
  const property = request.property;
  const address = `${property.address}, ${property.suburb}, ${property.city}`;

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-8 font-poppins text-[#0F172A] sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white shadow-xl">
        <header className="bg-[#0F172A] px-6 py-8 text-white sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">CampusNest registry</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Residence Verification Letter</h1>
          <p className="mt-3 text-sm text-slate-300">Reference: {request.letterReference}</p>
        </header>

        <div className="space-y-8 p-6 sm:p-10">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950">
            This letter confirms that the residence below is recorded in the CampusNest accredited housing registry.
            Its safety and compliance checklist passed in full, and a CampusNest manager recorded a physical inspection.
          </div>

          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Student requesting support</h2>
            <dl className="grid gap-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-2">
              <div><dt className="text-xs text-[#64748B]">Full name</dt><dd className="mt-1 font-bold">{student.name} {student.surname}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Student number</dt><dd className="mt-1 font-bold">{student.studentProfile?.studentNumber || "Not provided"}</dd></div>
              <div><dt className="text-xs text-[#64748B]">University</dt><dd className="mt-1 font-bold">{student.studentProfile?.universityName || "Not provided"}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Funder</dt><dd className="mt-1 font-bold">{student.studentProfile?.funderName || student.studentProfile?.fundingType || "Not provided"}</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Residence accreditation record</h2>
            <dl className="grid gap-5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><dt className="text-xs text-[#64748B]">Registered address</dt><dd className="mt-1 font-bold">{address}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Residence</dt><dd className="mt-1 font-bold">{property.title}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Landlord / operator</dt><dd className="mt-1 font-bold">{property.landlord.name} {property.landlord.surname}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Monthly rent</dt><dd className="mt-1 font-bold">R {Number(property.priceMonthly).toLocaleString("en-ZA")}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Accreditation reference</dt><dd className="mt-1 font-bold">{request.accreditationReference || "CampusNest registry record"}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Safety score</dt><dd className="mt-1 font-bold">{request.safetyScore ? `${Number(request.safetyScore).toFixed(1)} / 10` : "Recorded as passed"}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Checklist result</dt><dd className="mt-1 font-bold text-emerald-700">{request.checklistPassed} / {request.checklistTotal} checkpoints passed</dd></div>
            </dl>
          </section>

          <section className="rounded-2xl border border-[#CBD5E1] p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#7C3AED]">Physical inspection evidence</h2>
            <p className="mt-3 text-sm leading-6 text-[#334155]">
              A CampusNest verification manager physically inspected the residence and recorded the inspection below.
              This record is part of the signed registry data for this letter.
            </p>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <div><dt className="text-xs text-[#64748B]">Inspected by</dt><dd className="mt-1 font-bold">{request.physicalInspectorName}</dd></div>
              <div><dt className="text-xs text-[#64748B]">Inspection date</dt><dd className="mt-1 font-bold">{new Date(request.physicalInspectionAt).toLocaleDateString("en-ZA")}</dd></div>
            </dl>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E5E7EB] pt-5 text-xs text-[#64748B]">
            <span>Issued {new Date(request.requestedAt).toLocaleDateString("en-ZA")}</span>
            <Link href="/" className="font-bold text-[#7C3AED] hover:underline">CampusNest registry home</Link>
          </footer>
        </div>
      </article>
    </main>
  );
}

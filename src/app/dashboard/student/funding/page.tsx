import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import { redirect } from "next/navigation";
import { getRoleDashboardPath } from "@/lib/rbac";

export const dynamic = "force-dynamic";

type FundingPageData = {
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  idNumber: string | null;
  universityEmail: string | null;
  studentNumber: string | null;
  universityName: string | null;
  degreeProgram: string | null;
  yearOfStudy: string | null;
  fundingType: string;
  funderName: string | null;
  funderReference: string | null;
  funderContactEmail: string | null;
  monthlyAllowance: string | null;
  monthlyBudget: string | null;
  householdIncomeBracket: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
};

const fallbackData: FundingPageData = {
  name: "Lerato",
  surname: "Nkosi",
  email: "lerato.nkosi@students.wits.ac.za",
  phone: null,
  idNumber: null,
  universityEmail: "lerato.nkosi@students.wits.ac.za",
  studentNumber: "2489102",
  universityName: "University of the Witwatersrand (Wits)",
  degreeProgram: null,
  yearOfStudy: null,
  fundingType: "NSFAS",
  funderName: "NSFAS",
  funderReference: null,
  funderContactEmail: null,
  monthlyAllowance: null,
  monthlyBudget: null,
  householdIncomeBracket: null,
  guarantorName: null,
  guarantorPhone: null,
  guarantorRelationship: null,
};

function display(value: string | null | undefined) {
  return value?.trim() || "Not provided";
}

function currency(value: string | null) {
  if (!value) return "Not provided";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">{label}</dt>
      <dd className="break-words text-sm font-semibold text-[#0F172A]">{value}</dd>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#F1F5F9] pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">{eyebrow}</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-[#0F172A]">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

export default async function StudentFundingPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/funding");
  if (session.role !== "STUDENT") redirect(getRoleDashboardPath(session.role));

  const dbUser = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { studentProfile: true },
  });
  if (!dbUser) redirect("/login");

  const profile = dbUser?.studentProfile;
  const data: FundingPageData = dbUser
    ? {
        name: dbUser.name,
        surname: dbUser.surname,
        email: dbUser.email,
        phone: dbUser.phone,
        idNumber: dbUser.idNumber,
        universityEmail: dbUser.universityEmail,
        studentNumber: profile?.studentNumber || null,
        universityName: profile?.universityName || null,
        degreeProgram: profile?.degreeProgram || null,
        yearOfStudy: profile?.yearOfStudy || null,
        fundingType: profile?.fundingType || "Not specified",
        funderName: profile?.funderName || null,
        funderReference: profile?.funderReference || null,
        funderContactEmail: profile?.funderContactEmail || null,
        monthlyAllowance: profile?.monthlyAllowance?.toString() || null,
        monthlyBudget: profile?.monthlyBudget?.toString() || null,
        householdIncomeBracket: profile?.householdIncomeBracket || null,
        guarantorName: profile?.guarantorName || null,
        guarantorPhone: profile?.guarantorPhone || null,
        guarantorRelationship: profile?.guarantorRelationship || null,
      }
    : fallbackData;

  const user = {
    name: data.name,
    surname: data.surname,
    email: data.email,
    universityEmail: data.universityEmail,
    studentNumber: data.studentNumber,
    universityName: data.universityName,
    fundingType: data.fundingType,
  };

  return (
    <B2cStudentLayout activeTab="Funding & Bursary" user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Funding profile</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Funding &amp; Bursary</h1>
            <p className="max-w-2xl text-sm leading-6 text-[#64748B]">
              Review the student information and funder details used for accommodation verification and confirmation letters.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Profile available
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <SectionCard eyebrow="Student details" title="Your verified profile">
            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
              <Detail label="Full name" value={`${data.name} ${data.surname}`} />
              <Detail label="ID number" value={display(data.idNumber)} />
              <Detail label="Login email" value={data.email} />
              <Detail label="University email" value={display(data.universityEmail)} />
              <Detail label="Phone number" value={display(data.phone)} />
              <Detail label="Student number" value={display(data.studentNumber)} />
              <Detail label="University" value={display(data.universityName)} />
              <Detail label="Degree programme" value={display(data.degreeProgram)} />
              <Detail label="Year of study" value={display(data.yearOfStudy)} />
            </dl>
          </SectionCard>

          <SectionCard eyebrow="Funding status" title="Current support">
            <div className="rounded-xl bg-[#F5F3FF] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C3AED]">Funding scheme</p>
              <p className="mt-1 text-2xl font-bold text-[#312E81]">{data.fundingType}</p>
            </div>
            <dl className="mt-5 grid gap-5">
              <Detail label="Monthly allowance" value={currency(data.monthlyAllowance)} />
              <Detail label="Monthly accommodation budget" value={currency(data.monthlyBudget)} />
              <Detail label="Household income bracket" value={display(data.householdIncomeBracket)} />
            </dl>
          </SectionCard>
        </div>

        <SectionCard eyebrow="Funder details" title="Who supports your accommodation?"><dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Funder name" value={display(data.funderName)} />
          <Detail label="Funder reference" value={display(data.funderReference)} />
          <Detail label="Funder contact email" value={display(data.funderContactEmail)} />
        </dl></SectionCard>

        <SectionCard eyebrow="Optional contact" title="Guarantor details">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Guarantor name" value={display(data.guarantorName)} />
            <Detail label="Phone number" value={display(data.guarantorPhone)} />
            <Detail label="Relationship" value={display(data.guarantorRelationship)} />
          </dl>
        </SectionCard>
      </div>
    </B2cStudentLayout>
  );
}

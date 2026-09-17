import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import StudentSetupActionGrid from "@/components/dashboard/student-setup-action-grid";

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

  if (session) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.sub },
      include: {
        studentProfile: true,
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
    }
  }

  return (
    <B2cStudentLayout activeTab="Home" user={user}>
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
        <StudentSetupActionGrid user={user} />
      </div>
    </B2cStudentLayout>
  );
}


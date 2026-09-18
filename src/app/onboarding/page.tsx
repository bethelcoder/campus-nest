import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";
import StudentOnboarding from "@/components/onboarding/student-onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/onboarding");
  }

  // Intercept cross-roles
  if (session.role === "LANDLORD") {
    redirect(session.onboardingCompleted ? "/dashboard/landlord" : "/landlord/onboarding");
  } else if (session.role !== "STUDENT") {
    redirect(getRoleDashboardPath(session.role));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      universityEmail: true,
      onboardingStep: true,
      onboardingCompleted: true,
      emailVerifiedAt: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (!user.emailVerifiedAt) {
    redirect(`/verify?email=${encodeURIComponent(user.email)}&role=${user.role}`);
  }

  if (user.onboardingCompleted) {
    redirect("/dashboard/student");
  }

  return <StudentOnboarding initialUser={user} />;
}

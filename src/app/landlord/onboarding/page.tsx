import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";
import LandlordOnboarding from "@/components/onboarding/landlord-onboarding";

export const dynamic = "force-dynamic";

export default async function LandlordOnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/landlord/login?next=/landlord/onboarding");

  // Intercept cross-roles
  if (session.role === "STUDENT") {
    redirect(session.onboardingCompleted ? "/dashboard/student" : "/onboarding");
  } else if (session.role !== "LANDLORD") {
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
      idNumber: true,
      onboardingStep: true,
      onboardingCompleted: true,
      emailVerifiedAt: true,
      role: true,
    },
  });

  if (!user) redirect("/landlord/login");
  if (!user.emailVerifiedAt) redirect(`/verify?email=${encodeURIComponent(user.email)}&role=${user.role}`);
  if (user.onboardingCompleted) redirect("/dashboard/landlord");

  return <LandlordOnboarding initialUser={user} />;
}

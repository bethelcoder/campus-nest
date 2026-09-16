import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StudentOnboarding from "@/components/onboarding/student-onboarding";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/onboarding");
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
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <StudentOnboarding initialUser={user} />;
}

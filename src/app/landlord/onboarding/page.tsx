import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import LandlordOnboarding from "@/components/onboarding/landlord-onboarding";

export const dynamic = "force-dynamic";

export default async function LandlordOnboardingPage() {
  const session = await getSession();
  if (!session) redirect("/landlord/login?next=/landlord/onboarding");

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
    },
  });

  if (!user) redirect("/landlord/login");
  if (user.onboardingCompleted) redirect("/landlord/properties");

  return <LandlordOnboarding initialUser={user} />;
}

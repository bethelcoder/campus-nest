import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function LandlordOnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/landlord/login?next=/landlord/onboarding");
  if (session.role !== "LANDLORD") {
    if (session.role === "STUDENT") redirect("/dashboard");
    redirect("/");
  }

  // If already completed onboarding, redirect directly to landlord properties dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) {
    redirect("/landlord/properties");
  }

  return <>{children}</>;
}

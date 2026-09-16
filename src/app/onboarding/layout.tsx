import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/onboarding");
  if (session.role !== "STUDENT") {
    if (session.role === "LANDLORD") redirect("/landlord/properties");
    redirect("/");
  }

  // If already completed onboarding, redirect directly to student dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { onboardingCompleted: true },
  });

  if (user?.onboardingCompleted) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}

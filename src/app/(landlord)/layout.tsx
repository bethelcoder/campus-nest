import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/landlord/login?next=/landlord/properties");
  if (session.role !== "LANDLORD") redirect("/");

  if (!session.onboardingCompleted) {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { onboardingCompleted: true },
    });
    if (!user?.onboardingCompleted) {
      redirect("/landlord/onboarding");
    }
  }

  return <>{children}</>;
}

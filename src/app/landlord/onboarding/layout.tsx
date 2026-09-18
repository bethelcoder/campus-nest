import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function LandlordOnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/landlord/login?next=/landlord/onboarding");

  if (session.role === "STUDENT") {
    redirect("/onboarding");
  } else if (session.role !== "LANDLORD") {
    redirect(getRoleDashboardPath(session.role));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { onboardingCompleted: true, emailVerifiedAt: true, email: true, role: true },
  });

  if (!user?.emailVerifiedAt) {
    redirect(`/verify?email=${encodeURIComponent(user?.email || "")}&role=${encodeURIComponent(user?.role || "LANDLORD")}`);
  }

  if (user?.onboardingCompleted) {
    redirect("/dashboard/landlord");
  }

  return <>{children}</>;
}

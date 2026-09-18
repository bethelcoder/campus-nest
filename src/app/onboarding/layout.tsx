import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/onboarding");

  if (session.role === "LANDLORD") {
    redirect("/landlord/onboarding");
  } else if (session.role !== "STUDENT") {
    redirect(getRoleDashboardPath(session.role));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { onboardingCompleted: true, emailVerifiedAt: true, email: true, role: true },
  });

  if (!user?.emailVerifiedAt) {
    redirect(`/verify?email=${encodeURIComponent(user?.email || "")}&role=${encodeURIComponent(user?.role || "STUDENT")}`);
  }

  if (user?.onboardingCompleted) {
    redirect("/dashboard/student");
  }

  return <>{children}</>;
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  if (session.role !== "STUDENT") redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { onboardingCompleted: true, emailVerifiedAt: true, email: true, role: true },
  });

  if (!user?.emailVerifiedAt) {
    redirect(`/verify?email=${encodeURIComponent(user?.email || "")}&role=${user?.role || "STUDENT"}`);
  }

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

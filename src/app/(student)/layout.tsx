import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard");
  if (session.role !== "STUDENT") redirect("/");

  if (!session.onboardingCompleted) {
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { onboardingCompleted: true },
    });
    if (!user?.onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  return <>{children}</>;
}

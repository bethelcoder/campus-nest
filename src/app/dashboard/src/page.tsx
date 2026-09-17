import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import SrcDashboardClient, { SrcReport } from "./src-dashboard-client";

export const dynamic = "force-dynamic";

export default async function SrcDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/src");
  if (session.role !== "SRC_REPRESENTATIVE") redirect("/");

  return <SrcDashboardClient />;
}

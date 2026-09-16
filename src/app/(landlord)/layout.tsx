import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function LandlordLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/landlord/properties");
  if (session.role !== "LANDLORD") redirect("/");
  return <>{children}</>;
}

import { redirect } from "next/navigation";

export default function LegacyAdminLettersPage() {
  redirect("/dashboard/admin/letters");
}

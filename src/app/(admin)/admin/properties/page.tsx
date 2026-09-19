import { redirect } from "next/navigation";

export default function LegacyAdminPropertiesPage() {
  redirect("/dashboard/admin/properties");
}

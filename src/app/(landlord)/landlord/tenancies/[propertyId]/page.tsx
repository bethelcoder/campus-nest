import { redirect } from "next/navigation";

export default function TenancyPropertyRedirect({
  params,
}: {
  params: { propertyId: string };
}) {
  redirect(`/landlord/properties/${params.propertyId}/tenancy`);
}

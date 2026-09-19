import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentResidenceDetailView from "@/components/properties/student-residence-detail-view";

export const dynamic = "force-dynamic";

interface PropertyDetailPageProps {
  params: { id: string };
  searchParams?: { preview?: string };
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: PropertyDetailPageProps) {
  const session = await getSession();

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      checklistItems: true,
      landlord: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!property) notFound();

  const isPreview =
    searchParams?.preview === "true" ||
    (session?.role === "LANDLORD" && session?.sub === property.landlordId);

  const serializedProperty = JSON.parse(JSON.stringify(property));

  return (
    <StudentResidenceDetailView
      property={serializedProperty}
      user={session ? { id: session.sub, role: session.role } : null}
      isPreview={Boolean(isPreview)}
    />
  );
}

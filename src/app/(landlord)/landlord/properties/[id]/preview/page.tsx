import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentResidenceDetailView from "@/components/properties/student-residence-detail-view";

export const dynamic = "force-dynamic";

interface LandlordPropertyPreviewProps {
  params: {
    id: string;
  };
}

export default async function LandlordPropertyPreviewPage({
  params,
}: LandlordPropertyPreviewProps) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    redirect("/login");
  }

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

  if (!property) {
    notFound();
  }

  const serializedProperty = JSON.parse(JSON.stringify(property));

  return (
    <StudentResidenceDetailView
      property={serializedProperty}
      user={{ id: session.sub, role: session.role }}
      isPreview={true}
    />
  );
}

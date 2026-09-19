import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentResidenceDetailView from "@/components/properties/student-residence-detail-view";

export const dynamic = "force-dynamic";

interface PropertyDetailPageProps {
  params: { id: string };
  searchParams?: {
    preview?: string;
    apply?: string;
    roomId?: string;
  };
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
      roomListings: true,
      landlord: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          landlordProfile: true,
        },
      },
    },
  });

  if (!property) notFound();

  let studentProfileData: any = null;
  let studentUser: any = null;
  if (session && session.role === "STUDENT") {
    studentUser = await prisma.user.findUnique({
      where: { id: session.sub },
      include: { studentProfile: true },
    });
    if (studentUser) {
      studentProfileData = {
        name: studentUser.name || "Student",
        surname: studentUser.surname || "",
        email: studentUser.email,
        phone: studentUser.phone || "",
        universityEmail: studentUser.universityEmail || studentUser.email,
        studentNumber: studentUser.studentProfile?.studentNumber || "Pending Enrolment",
        universityName: studentUser.studentProfile?.universityName || "Verified Institution",
        degreeProgram: studentUser.studentProfile?.degreeProgram || "Undergraduate / Postgraduate",
        fundingType: studentUser.studentProfile?.fundingType || "NSFAS",
        funderName: studentUser.studentProfile?.funderName || "NSFAS / Self-Funded",
        monthlyAllowance: studentUser.studentProfile?.monthlyAllowance
          ? Number(studentUser.studentProfile.monthlyAllowance)
          : 4800,
      };
    }
  }

  const isPreview =
    searchParams?.preview === "true" ||
    (session?.role === "LANDLORD" && session?.sub === property.landlordId);

  const autoApply = searchParams?.apply === "true";
  const initialRoomId = searchParams?.roomId || null;

  const serializedProperty = JSON.parse(JSON.stringify(property));

  return (
    <StudentResidenceDetailView
      property={serializedProperty}
      user={
        session
          ? {
              id: session.sub,
              role: session.role,
              name: studentUser?.name,
              surname: studentUser?.surname,
              email: studentUser?.email,
            }
          : null
      }
      studentProfile={studentProfileData}
      autoApply={autoApply}
      initialRoomId={initialRoomId}
      slug={property.id}
      isPreview={Boolean(isPreview)}
    />
  );
}

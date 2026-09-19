import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import StudentResidenceDetailView from "@/components/properties/student-residence-detail-view";

export const dynamic = "force-dynamic";

interface ResidencePageProps {
  params: {
    slug: string;
  };
  searchParams: {
    preview?: string;
    apply?: string;
    roomId?: string;
  };
}

async function getPropertyBySlugOrId(slug: string) {
  // 1. Try by exact ID
  let property = await prisma.property.findUnique({
    where: { id: slug, status: "VERIFIED" },
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

  if (property) return property;

  // 2. Try by title match
  const titleSearch = slug.replace(/-/g, " ");
  property = await prisma.property.findFirst({
    where: {
      status: "VERIFIED",
      title: {
        contains: titleSearch,
        mode: "insensitive",
      },
    },
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

  if (property) return property;

  // 3. Match by normalized slug across properties
  const allProps = await prisma.property.findMany({
    where: { status: "VERIFIED" },
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

  const matched = allProps.find((p) => {
    const genSlug = p.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return genSlug === slug.toLowerCase();
  });

  return matched || null;
}

export default async function ResidenceSlugPage({
  params,
  searchParams,
}: ResidencePageProps) {
  const session = await getSession();
  const property = await getPropertyBySlugOrId(params.slug);

  if (!property) {
    notFound();
  }

  // Load real student profile if logged in as student
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
    (session?.role === "LANDLORD" &&
      session?.sub === property.landlordId &&
      searchParams?.preview !== "false");

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
      slug={params.slug}
      isPreview={Boolean(isPreview)}
    />
  );
}


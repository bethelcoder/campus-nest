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
  };
}

async function getPropertyBySlugOrId(slug: string) {
  // 1. Try by exact ID
  let property = await prisma.property.findUnique({
    where: { id: slug, status: "VERIFIED" },
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

  if (property) return property;

  // 3. Match by normalized slug across properties
  const allProps = await prisma.property.findMany({
    where: { status: "VERIFIED" },
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

  const isPreview =
    searchParams?.preview === "true" ||
    (session?.role === "LANDLORD" &&
      session?.sub === property.landlordId &&
      searchParams?.preview !== "false");

  const serializedProperty = JSON.parse(JSON.stringify(property));

  return (
    <StudentResidenceDetailView
      property={serializedProperty}
      user={session ? { id: session.sub, role: session.role } : null}
      isPreview={Boolean(isPreview)}
    />
  );
}


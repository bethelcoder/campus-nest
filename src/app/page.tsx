import { prisma } from "@/lib/prisma";
import StudentLanding from "@/components/landing/student-landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    where: { status: "VERIFIED" },
    orderBy: { safetyScore: "desc" },
    take: 24,
    select: {
      id: true,
      title: true,
      suburb: true,
      city: true,
      priceMonthly: true,
      bedrooms: true,
      safetyScore: true,
      distanceToCampus: true,
      images: true,
    },
  });

  const serializedProperties = properties.map((p) => ({
    id: p.id,
    title: p.title,
    suburb: p.suburb,
    city: p.city,
    priceMonthly: Number(p.priceMonthly),
    bedrooms: p.bedrooms,
    safetyScore: p.safetyScore !== null ? Number(p.safetyScore) : null,
    distanceToCampus: p.distanceToCampus !== null ? Number(p.distanceToCampus) : null,
    images: p.images || [],
  }));

  return <StudentLanding initialProperties={serializedProperties} />;
}

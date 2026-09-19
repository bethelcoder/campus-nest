import { prisma } from "@/lib/prisma";
import StudentLanding from "@/components/landing/student-landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    where: { status: "VERIFIED" },
    orderBy: [{ safetyScore: "desc" }, { createdAt: "desc" }],
    take: 24,
    select: {
      id: true,
      title: true,
      address: true,
      suburb: true,
      city: true,
      latitude: true,
      longitude: true,
      priceMonthly: true,
      bedrooms: true,
      safetyScore: true,
      distanceToCampus: true,
      amenities: true,
      description: true,
      images: true,
    },
  });

  const serializedProperties = properties.map((p) => ({
    id: p.id,
    title: p.title,
    address: p.address,
    suburb: p.suburb,
    city: p.city,
    latitude: p.latitude !== null ? Number(p.latitude) : null,
    longitude: p.longitude !== null ? Number(p.longitude) : null,
    priceMonthly: Number(p.priceMonthly),
    bedrooms: p.bedrooms,
    safetyScore: p.safetyScore !== null ? Number(p.safetyScore) : null,
    distanceToCampus: p.distanceToCampus !== null ? Number(p.distanceToCampus) : null,
    amenities: p.amenities || [],
    description: p.description || "",
    images: p.images || [],
  }));

  return <StudentLanding initialProperties={serializedProperties} />;
}

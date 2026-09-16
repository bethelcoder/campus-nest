import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  SECURITY: "Security",
  FIRE_SAFETY: "Fire Safety",
  UTILITIES: "Utilities",
  BUILDING_STRUCTURE: "Building Structure",
  LOCATION_RISK: "Location Risk",
};

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { checklistItems: true, landlord: { select: { name: true, surname: true } } },
  });

  if (!property) notFound();

  const byCategory = property.checklistItems.reduce<Record<string, typeof property.checklistItems>>(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-2xl font-bold">{property.title}</h1>
        {property.safetyScore !== null && (
          <span className="text-sm font-semibold px-3 py-1 rounded bg-safe/10 text-safe">
            Safety Score: {Number(property.safetyScore).toFixed(1)}/10
          </span>
        )}
      </div>
      <p className="text-gray-600 mb-6">
        {property.address}, {property.suburb}, {property.city}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
        <div className="border rounded p-3">
          <div className="text-gray-500">Price</div>
          <div className="font-semibold">R{Number(property.priceMonthly).toLocaleString()}/mo</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-gray-500">Bedrooms</div>
          <div className="font-semibold">{property.bedrooms}</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-gray-500">Status</div>
          <div className="font-semibold">{property.status}</div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Safety Checklist</h2>
      <div className="space-y-4">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category} className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium mb-2">{CATEGORY_LABELS[category] ?? category}</h3>
            <ul className="space-y-1 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <span
                    className={
                      item.passed === null
                        ? "text-gray-400"
                        : item.passed
                        ? "text-safe"
                        : "text-risk"
                    }
                  >
                    {item.passed === null ? "○" : item.passed ? "✓" : "✕"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}

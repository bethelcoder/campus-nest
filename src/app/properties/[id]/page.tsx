import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import FavoriteButton from "../favorite-button";
import ApplyButton from "../apply-button";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  SECURITY: "Security",
  FIRE_SAFETY: "Fire Safety",
  UTILITIES: "Utilities",
  BUILDING_STRUCTURE: "Building Structure",
  LOCATION_RISK: "Location Risk",
};

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      checklistItems: true,
      landlord: { select: { name: true, surname: true } },
      favorites: session?.sub ? { where: { studentId: session.sub }, select: { id: true } } : false,
      applications: session?.sub ? { where: { studentId: session.sub }, select: { id: true } } : false,
    },
  });

  if (!property) notFound();

  const isSaved = Boolean(session?.sub && property.favorites && property.favorites.length > 0);
  const hasApplied = Boolean(session?.sub && property.applications && property.applications.length > 0);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F172A]">{property.title}</h1>
            {property.safetyScore !== null && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Safety Score: {Number(property.safetyScore).toFixed(1)}/10
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            {property.address}, {property.suburb}, {property.city}
          </p>
        </div>

        {session?.role === "STUDENT" && (
          <div className="flex items-center gap-2">
            <FavoriteButton propertyId={property.id} initialSaved={isSaved} variant="button" />
            <div className="w-32">
              <ApplyButton propertyId={property.id} hasApplied={hasApplied} />
            </div>
          </div>
        )}
      </div>

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

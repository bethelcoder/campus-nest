import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentPropertiesPage() {
  const properties = await prisma.property.findMany({
    where: { status: "VERIFIED" },
    orderBy: { safetyScore: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Browse Verified Properties</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/properties/${p.id}`}
            className="border rounded-lg p-4 bg-white hover:shadow-md"
          >
            <h3 className="font-semibold">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.suburb}, {p.city}</p>
            <p className="text-sm mt-2">
              R{Number(p.priceMonthly).toLocaleString()}/mo ·{" "}
              {p.safetyScore ? `${Number(p.safetyScore).toFixed(1)}/10` : "Unscored"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}

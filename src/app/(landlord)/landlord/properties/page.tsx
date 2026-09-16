import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LandlordPropertiesPage() {
  const session = await getSession();
  if (!session) return null;

  const properties = await prisma.property.findMany({
    where: { landlordId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">My Properties</h1>
        <Link href="/landlord/listings/new" className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded">
          + New Listing
        </Link>
      </div>

      {properties.length === 0 && <p className="text-sm text-gray-500">No properties yet.</p>}

      <div className="space-y-2">
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/landlord/properties/${p.id}`}
            className="flex justify-between items-center border rounded-lg p-4 bg-white hover:shadow-md"
          >
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-sm text-gray-500">{p.suburb}, {p.city}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{p.status}</span>
              {p.safetyScore !== null && (
                <p className="text-sm mt-1">{Number(p.safetyScore).toFixed(1)}/10</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

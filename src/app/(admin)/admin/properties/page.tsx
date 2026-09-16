import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const [properties, reports] = await Promise.all([
    prisma.property.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.safetyReport.findMany({
      where: { status: { in: ["OPEN", "ESCALATED"] } },
      include: { property: { select: { title: true } }, reporter: { select: { name: true, surname: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Properties & Safety Reports</h1>

      <section className="mb-10">
        <h2 className="font-medium mb-3">All Properties</h2>
        <div className="space-y-2">
          {properties.map((p) => (
            <div key={p.id} className="border rounded-lg p-3 bg-white flex justify-between items-center text-sm">
              <span>{p.title} — {p.suburb}, {p.city}</span>
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{p.status}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-3">Open Safety Reports</h2>
        {reports.length === 0 && <p className="text-sm text-gray-500">No open reports.</p>}
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 bg-white text-sm">
              <p className="font-medium">{r.subject}</p>
              <p className="text-gray-500">{r.property.title} — reported by {r.reporter.name} {r.reporter.surname}</p>
              <p className="mt-1">{r.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

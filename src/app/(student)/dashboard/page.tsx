import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session) return null; // layout.tsx already redirects unauthenticated users

  const [applications, tenancies] = await Promise.all([
    prisma.application.findMany({
      where: { studentId: session.sub },
      include: { property: { select: { title: true, suburb: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenancy.findMany({
      where: { studentId: session.sub },
      include: { property: { select: { title: true, suburb: true } }, confirmationLetter: true },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">My Dashboard</h1>

      <section className="mb-8">
        <h2 className="font-medium mb-3">My Tenancy</h2>
        {tenancies.length === 0 && <p className="text-sm text-gray-500">No active tenancy yet.</p>}
        {tenancies.map((t) => (
          <div key={t.id} className="border rounded-lg p-4 bg-white mb-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t.property.title}</p>
                <p className="text-sm text-gray-500">{t.property.suburb}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{t.status}</span>
            </div>
            {t.confirmationLetter && (
              <p className="text-sm mt-2 text-gray-600">
                Confirmation letter: <strong>{t.confirmationLetter.status}</strong>
              </p>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-medium mb-3">My Applications</h2>
        {applications.length === 0 && <p className="text-sm text-gray-500">No applications submitted yet.</p>}
        {applications.map((a) => (
          <div key={a.id} className="border rounded-lg p-4 bg-white mb-2 flex justify-between">
            <span>{a.property.title}</span>
            <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{a.status}</span>
          </div>
        ))}
      </section>
    </main>
  );
}

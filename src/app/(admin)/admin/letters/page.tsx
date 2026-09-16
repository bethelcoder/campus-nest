import { prisma } from "@/lib/prisma";
import LetterActions from "./letter-actions";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  const letters = await prisma.confirmationLetter.findMany({
    orderBy: { createdAt: "desc" },
    include: { tenancy: { include: { property: true } } },
  });

  const stats = {
    activeStudents: await prisma.tenancy.count({ where: { status: "ACTIVE" } }),
    verifiedProperties: await prisma.property.count({ where: { status: "VERIFIED" } }),
    pendingConfirmations: letters.filter((l) => l.status === "PENDING_REVIEW").length,
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">Confirmation Letters</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500">Active Students</p>
          <p className="text-2xl font-semibold">{stats.activeStudents}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500">Verified Properties</p>
          <p className="text-2xl font-semibold">{stats.verifiedProperties}</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-xs text-gray-500">Pending Confirmations</p>
          <p className="text-2xl font-semibold">{stats.pendingConfirmations}</p>
        </div>
      </div>

      <div className="space-y-2">
        {letters.length === 0 && <p className="text-sm text-gray-500">No confirmation letters yet.</p>}
        {letters.map((l) => (
          <div key={l.id} className="border rounded-lg p-4 bg-white flex justify-between items-center">
            <div>
              <p className="font-medium">{l.studentName}</p>
              <p className="text-sm text-gray-500">{l.propertyAddress}</p>
              <p className="text-xs text-gray-400">Ref: {l.letterReference}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{l.status}</span>
              <LetterActions letterId={l.id} status={l.status} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";
import AdminLettersPanel, { AdminLetterItem } from "@/components/dashboard/admin-letters-panel";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage() {
  const user = await requireAdminPageSession("/dashboard/admin/letters");

  const letters = await prisma.confirmationLetter.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tenancy: {
        include: {
          property: { select: { title: true } },
        },
      },
    },
  });

  const letterItems: AdminLetterItem[] = letters.map((l) => ({
    id: l.id,
    studentName: l.studentName,
    propertyAddress: l.propertyAddress,
    letterReference: l.letterReference,
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    propertyTitle: l.tenancy?.property?.title ?? "Unknown Property",
  }));

  const pendingCount = letterItems.filter((l) => l.status === "PENDING_REVIEW").length;

  return (
    <B2cAdminLayout activeTab="Confirmation Letters" user={user} pendingCount={pendingCount}>
      <AdminLettersPanel initialLetters={letterItems} />
    </B2cAdminLayout>
  );
}

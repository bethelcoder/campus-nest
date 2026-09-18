import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import ApplicationsManager from "./applications-manager";

export const dynamic = "force-dynamic";

export default async function ManageApplicationsPage() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") redirect("/landlord/login?next=/landlord/applications");
  const landlord = await prisma.user.findUnique({ where: { id: session.sub }, include: { landlordProfile: true } });
  const properties = await prisma.property.findMany({ where: { landlordId: session.sub }, include: { roomListings: true, applications: true } });
  const applications = await prisma.application.findMany({
    where: { property: { landlordId: session.sub } },
    orderBy: { createdAt: "desc" },
    include: { student: { include: { studentProfile: true } }, property: true, roomListing: true },
  });
  const user = { id: session.sub, name: landlord?.name || "Landlord", surname: landlord?.surname || "", email: landlord?.email || "", entityType: landlord?.landlordProfile?.entityType };
  const layoutProperties = properties.map((property) => ({ ...property, priceMonthly: Number(property.priceMonthly), safetyScore: property.safetyScore ? Number(property.safetyScore) : null }));
  return <B2cLandlordLayout activeTab="Manage Applications" user={user} properties={layoutProperties}><ApplicationsManager initialApplications={applications.map((application) => ({ ...application, createdAt: application.createdAt.toISOString(), property: { title: application.property.title }, roomListing: application.roomListing ? { ...application.roomListing, monthlyRent: Number(application.roomListing.monthlyRent) } : null, student: { name: application.student.name, surname: application.student.surname, email: application.student.email, universityEmail: application.student.universityEmail, studentNumber: application.student.studentProfile?.studentNumber || undefined, universityName: application.student.studentProfile?.universityName || undefined } }))} initialProperties={properties.map((property) => ({ id: property.id, title: property.title, rooms: property.roomListings.map((room) => ({ ...room, monthlyRent: Number(room.monthlyRent) })) }))} /></B2cLandlordLayout>;
}

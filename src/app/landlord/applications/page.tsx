import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cLandlordLayout from "@/components/dashboard/b2c-landlord-layout";
import ApplicationsManager from "./applications-manager";

export const dynamic = "force-dynamic";

export default async function ManageApplicationsPage() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    redirect("/landlord/login?next=/landlord/applications");
  }

  const landlord = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { landlordProfile: true },
  });

  const properties = await prisma.property.findMany({
    where: { landlordId: session.sub },
    include: { roomListings: true, applications: true },
  });

  const applications = await prisma.application.findMany({
    where: { property: { landlordId: session.sub } },
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { studentProfile: true } },
      property: true,
      roomListing: true,
    },
  });

  const user = {
    id: session.sub,
    name: landlord?.name || "Landlord",
    surname: landlord?.surname || "",
    email: landlord?.email || "",
    entityType: landlord?.landlordProfile?.entityType,
  };

  const layoutProperties = properties.map((property) => ({
    ...property,
    priceMonthly: Number(property.priceMonthly),
    safetyScore: property.safetyScore ? Number(property.safetyScore) : null,
  }));

  const formattedApplications = applications.map((app) => ({
    id: app.id,
    status: app.status,
    message: app.message,
    createdAt: app.createdAt.toISOString(),
    proposedBedId: app.proposedBedId,
    offeredRoomName: app.offeredRoomName,
    offeredMonthlyRent: app.offeredMonthlyRent ? Number(app.offeredMonthlyRent) : null,
    leaseStartDate: app.leaseStartDate ? app.leaseStartDate.toISOString() : null,
    leaseEndDate: app.leaseEndDate ? app.leaseEndDate.toISOString() : null,
    landlordNotes: app.landlordNotes,
    rejectionReason: app.rejectionReason,
    property: {
      id: app.property.id,
      title: app.property.title,
    },
    roomListing: app.roomListing
      ? {
          id: app.roomListing.id,
          name: app.roomListing.name,
          roomType: app.roomListing.roomType,
          monthlyRent: Number(app.roomListing.monthlyRent),
          availableUnits: app.roomListing.availableUnits,
        }
      : null,
    student: {
      name: app.student.name,
      surname: app.student.surname,
      email: app.student.email,
      universityEmail: app.student.universityEmail,
      studentProfile: app.student.studentProfile
        ? {
            studentNumber: app.student.studentProfile.studentNumber || undefined,
            universityName: app.student.studentProfile.universityName || undefined,
            yearOfStudy: app.student.studentProfile.yearOfStudy || null,
            fundingType: app.student.studentProfile.fundingType || null,
            bursaryName: app.student.studentProfile.funderName || null,
            idNumber: app.student.idNumber || null,
            phoneNumber: app.student.phone || null,
            emergencyContactName: app.student.studentProfile.emergencyContactName || null,
            emergencyContactPhone: app.student.studentProfile.emergencyContactPhone || null,
          }
        : null,
    },
  }));

  const formattedProperties = properties.map((prop) => ({
    id: prop.id,
    title: prop.title,
    rooms: prop.roomListings.map((r) => ({
      id: r.id,
      name: r.name,
      roomType: r.roomType,
      monthlyRent: Number(r.monthlyRent),
      availableUnits: r.availableUnits,
    })),
  }));

  return (
    <B2cLandlordLayout activeTab="Manage Applications" user={user} properties={layoutProperties}>
      <ApplicationsManager
        initialApplications={formattedApplications as any}
        initialProperties={formattedProperties}
      />
    </B2cLandlordLayout>
  );
}

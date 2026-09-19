import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import StudentApplicationsClient from "@/components/dashboard/student-applications-client";

export const dynamic = "force-dynamic";

export default async function StudentApplicationsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/applications");
  if (session.role !== "STUDENT") redirect("/");

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: {
      studentProfile: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          property: {
            include: {
              landlord: { include: { landlordProfile: true } },
            },
          },
          roomListing: true,
          funderLetterRequest: true,
        },
      },
      favorites: { select: { id: true } },
    },
  });

  if (!student) redirect("/login");

  const user = {
    name: student.name,
    surname: student.surname,
    email: student.email,
    universityEmail: student.universityEmail,
    studentNumber: student.studentProfile?.studentNumber,
    universityName: student.studentProfile?.universityName,
    fundingType: student.studentProfile?.fundingType,
  };

  const applications = student.applications;
  const savedCount = student.favorites.length;

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
      address: app.property.address,
      suburb: app.property.suburb,
      city: app.property.city,
      priceMonthly: Number(app.property.priceMonthly),
      landlord: {
        name: app.property.landlord.name,
        surname: app.property.landlord.surname,
        landlordProfile: app.property.landlord.landlordProfile
          ? {
              companyName: app.property.landlord.landlordProfile.companyName,
            }
          : null,
      },
    },
    roomListing: app.roomListing
      ? {
          id: app.roomListing.id,
          name: app.roomListing.name,
          roomType: app.roomListing.roomType,
          monthlyRent: Number(app.roomListing.monthlyRent),
        }
      : null,
  }));

  return (
    <B2cStudentLayout
      activeTab="My Applications"
      user={user}
      savedCount={savedCount}
      applicationsCount={applications.length}
    >
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Page Title Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#005F56]">
              Housing Placement &amp; Tenancy Tracker
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              My Applications
            </h1>
            <p className="max-w-2xl text-xs text-slate-500">
              Track your accredited housing applications, view official room offers, and sign tenancy confirmations.
            </p>
          </div>
          <Link
            href="/residences"
            className="inline-flex items-center justify-center rounded-xl bg-[#005F56] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#004d46]"
          >
            Browse Residences &rarr;
          </Link>
        </div>

        {/* Client Interactive Applications Tracker */}
        <StudentApplicationsClient initialApplications={formattedApplications as any} />
      </div>
    </B2cStudentLayout>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRoleDashboardPath } from "@/lib/rbac";
import B2cStudentLayout from "@/components/dashboard/b2c-student-layout";
import ProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ManageStudentProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/dashboard/student/manage-profile");
  if (session.role !== "STUDENT") redirect(getRoleDashboardPath(session.role));

  const student = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { studentProfile: true },
  });
  if (!student) redirect("/login");

  const profile = student.studentProfile;
  const initialValues = {
    name: student.name,
    surname: student.surname,
    phone: student.phone || "",
    idNumber: student.idNumber || "",
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.toISOString().slice(0, 10) : "",
    gender: profile?.gender || "",
    nationality: profile?.nationality || "",
    preferredLanguage: profile?.preferredLanguage || "",
    universityName: profile?.universityName || "",
    studentNumber: profile?.studentNumber || "",
    degreeProgram: profile?.degreeProgram || "",
    yearOfStudy: profile?.yearOfStudy || "",
    city: profile?.city || "",
    province: profile?.province || "",
    currentAddress: profile?.currentAddress || "",
    emergencyContactName: profile?.emergencyContactName || "",
    emergencyContactPhone: profile?.emergencyContactPhone || "",
    emergencyContactRelationship: profile?.emergencyContactRelationship || "",
    fundingType: profile?.fundingType || "",
    funderName: profile?.funderName || "",
    funderReference: profile?.funderReference || "",
    funderContactEmail: profile?.funderContactEmail || "",
    monthlyAllowance: profile?.monthlyAllowance?.toString() || "",
    monthlyBudget: profile?.monthlyBudget?.toString() || "",
    householdIncomeBracket: profile?.householdIncomeBracket || "",
    guarantorName: profile?.guarantorName || "",
    guarantorPhone: profile?.guarantorPhone || "",
    guarantorRelationship: profile?.guarantorRelationship || "",
  };

  const additionalContacts = Array.isArray(profile?.emergencyContacts)
    ? profile.emergencyContacts.filter(
        (contact): contact is { name: string; phone: string; relationship: string } =>
          typeof contact === "object" &&
          contact !== null &&
          "name" in contact &&
          "phone" in contact &&
          "relationship" in contact &&
          typeof contact.name === "string" &&
          typeof contact.phone === "string" &&
          typeof contact.relationship === "string"
      )
    : [];

  return (
    <B2cStudentLayout
      activeTab="Manage Profile"
      user={{
        name: student.name,
        surname: student.surname,
        email: student.email,
        universityEmail: student.universityEmail,
        studentNumber: profile?.studentNumber,
        universityName: profile?.universityName,
        fundingType: profile?.fundingType,
      }}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">Account settings</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] md:text-3xl">Manage Profile</h1>
          <p className="max-w-2xl text-sm leading-6 text-[#64748B]">Update the personal, university, address, and emergency contact details used across your CampusNest profile.</p>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:p-7">
          <ProfileForm initialValues={initialValues} additionalContacts={additionalContacts} />
        </div>
      </div>
    </B2cStudentLayout>
  );
}

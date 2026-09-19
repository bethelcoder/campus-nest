import { prisma } from "@/lib/prisma";
import { requireAdminPageSession } from "@/lib/admin-dashboard";
import B2cAdminLayout from "@/components/dashboard/b2c-admin-layout";

export const dynamic = "force-dynamic";

const roleLabels = {
  LANDLORD: "Landlord",
  SRC_REPRESENTATIVE: "SRC representative",
  STUDENT: "Student",
};

export default async function AdminUsersPage() {
  const admin = await requireAdminPageSession("/dashboard/admin/users");
  const users = await prisma.user.findMany({
    where: { role: { in: ["LANDLORD", "SRC_REPRESENTATIVE", "STUDENT"] } },
    orderBy: { createdAt: "desc" },
    include: {
      landlordProfile: true,
      studentProfile: true,
      _count: { select: { properties: true, applications: true } },
    },
  });

  return (
    <B2cAdminLayout activeTab="User Directory" user={admin}>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Platform accounts</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">User directory</h1>
          <p className="mt-1 text-sm text-slate-500">Review landlords, SRC representatives, and students with their registration and onboarding details.</p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Profile details</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const profile = user.role === "LANDLORD" ? user.landlordProfile : user.studentProfile;
                const details = user.role === "LANDLORD"
                  ? `${user.landlordProfile?.companyName || "Individual provider"} · ${user._count.properties} listing(s) · ${user.landlordProfile?.businessAddress || "No business address"}`
                  : user.role === "STUDENT"
                    ? `${user.studentProfile?.universityName || "Institution not supplied"} · ${user.studentProfile?.studentNumber || "No student number"} · ${user._count.applications} application(s)`
                    : `${user.institutionName || "Institution not supplied"} · SRC housing desk`;
                return (
                  <tr key={user.id} className="align-top">
                    <td className="px-4 py-4"><p className="font-bold text-slate-900">{user.name} {user.surname}</p><p className="mt-1 text-slate-500">{user.email}</p></td>
                    <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-2 py-1 font-bold text-slate-700">{roleLabels[user.role as keyof typeof roleLabels]}</span></td>
                    <td className="px-4 py-4 text-slate-600">{user.phone || "No phone"}<br />{user.universityEmail || "No university email"}</td>
                    <td className="max-w-xs px-4 py-4 text-slate-600">{details}</td>
                    <td className="px-4 py-4"><p className={user.emailVerifiedAt ? "font-bold text-emerald-700" : "font-bold text-amber-700"}>{user.emailVerifiedAt ? "Email verified" : "Email pending"}</p><p className="mt-1 text-slate-500">{user.onboardingCompleted ? "Onboarding complete" : "Onboarding incomplete"}</p></td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-500">{user.createdAt.toLocaleDateString("en-ZA")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No users registered yet.</p>}
        </div>
      </div>
    </B2cAdminLayout>
  );
}

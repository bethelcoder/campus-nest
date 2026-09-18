import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import B2cSrcLayout from "@/components/dashboard/b2c-src-layout";
import {
  LuBuilding2,
  LuShieldCheck,
  LuShieldAlert,
  LuMapPin,
  LuBed,
  LuArrowUpRight,
  LuCheck,
  LuUsers,
} from "react-icons/lu";

export const dynamic = "force-dynamic";

export default async function SrcResidencesPage() {
  const session = await getSession();
  if (!session) redirect("/src/login?next=/dashboard/src/residences");
  if (session.role !== "SRC_REPRESENTATIVE") redirect("/");

  const [dbUser, properties, openReportsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        institutionName: true,
      },
    }),
    prisma.property.findMany({
      include: {
        landlord: {
          select: {
            name: true,
            surname: true,
            email: true,
            phone: true,
          },
        },
        checklistItems: true,
        reports: true,
      },
      orderBy: { safetyScore: "desc" },
    }),
    prisma.safetyReport.count({
      where: { status: { not: "RESOLVED" } },
    }),
  ]);

  const user = {
    id: dbUser?.id || session.sub,
    name: dbUser?.name || "SRC Officer",
    surname: dbUser?.surname || "",
    email: dbUser?.email || "src.housing@wits.ac.za",
    institutionName: dbUser?.institutionName || "University Student Council",
  };

  const totalBeds = properties.reduce((acc, p) => acc + (p.bedrooms || 0), 0);
  const accreditedCount = properties.filter((p) => p.status === "VERIFIED").length;

  return (
    <B2cSrcLayout activeTab="Audited Residences" user={user} openCasesCount={openReportsCount}>
      <div className="space-y-6 font-poppins">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                Accreditation Registry
              </span>
              <span className="text-xs text-gray-400">
                {properties.length} Private Residences Listed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
              Off-Campus Student Residences Directory
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Review safety ratings, municipal compliance certifications, and bed capacity for accommodations near {user.institutionName}.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Total Student Bed Capacity
            </span>
            <span className="text-2xl font-black text-[#0F172A] mt-1 block">
              {totalBeds} Beds
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">
              Across {properties.length} student residences
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Accredited &amp; Compliant
            </span>
            <span className="text-2xl font-black text-[#0F172A] mt-1 block">
              {accreditedCount} Verified
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              Passed 13-point safety inspection
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Safety Complaints Filed
            </span>
            <span className="text-2xl font-black text-[#0F172A] mt-1 block">
              {openReportsCount} Active
            </span>
            <span className="text-[11px] text-red-600 font-semibold mt-0.5 block">
              Requiring SRC advocacy / intervention
            </span>
          </div>
        </div>

        {/* Residence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => {
            const hasScore = property.safetyScore !== null && property.safetyScore !== undefined;
            const scoreNum = hasScore ? Number(property.safetyScore).toFixed(1) : null;
            const activeReports = property.reports.filter((r) => r.status !== "RESOLVED").length;

            return (
              <div
                key={property.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        property.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {property.status === "VERIFIED" ? "✓ Verified & Accredited" : "Pending Audit"}
                    </span>

                    {scoreNum && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <LuShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{scoreNum} / 10</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Address */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{property.address}, {property.suburb}</span>
                    </p>
                  </div>

                  {/* Landlord Contact */}
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">Operator Details</span>
                    <p className="font-bold text-gray-900">{property.landlord.name} {property.landlord.surname}</p>
                    <p className="text-gray-500 text-[11px] truncate">{property.landlord.email}</p>
                  </div>

                  {/* Active Complaints Indicator */}
                  {activeReports > 0 ? (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-bold">
                      <LuShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{activeReports} Active student complaint{activeReports > 1 ? "s" : ""}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2 font-bold">
                      <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Zero active complaints</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-semibold">
                    {property.bedrooms} Bed Capacity
                  </span>

                  <span className="text-sm font-extrabold text-gray-900">
                    R {Number(property.priceMonthly).toLocaleString()}
                    <span className="text-[10px] font-normal text-gray-500"> / mo</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </B2cSrcLayout>
  );
}

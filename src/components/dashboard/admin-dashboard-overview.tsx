"use client";

import Link from "next/link";
import {
  LuBuilding2,
  LuFileCheck,
  LuShieldAlert,
  LuUsers,
  LuArrowRight,
  LuCheck,
  LuClock,
} from "react-icons/lu";

export interface AdminOverviewStats {
  verifiedProperties: number;
  pendingProperties: number;
  flaggedProperties: number;
  pendingLetters: number;
  activeEscalations: number;
  activeTenancies: number;
  totalLandlords: number;
}

export interface AdminLandlordQueueItem {
  id: string;
  name: string;
  email: string;
  entityType: string | null;
  onboardingCompleted: boolean;
  propertyCount: number;
  pendingPropertyCount: number;
}

interface AdminDashboardOverviewProps {
  stats: AdminOverviewStats;
  landlordQueue: AdminLandlordQueueItem[];
}

export default function AdminDashboardOverview({
  stats,
  landlordQueue,
}: AdminDashboardOverviewProps) {
  const pendingLandlords = landlordQueue.filter((l) => !l.onboardingCompleted || l.pendingPropertyCount > 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-bold flex items-center gap-1.5">
                Root System Controller
              </span>
              <span className="text-xs text-slate-400 font-medium">Compliance Registry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Platform Administrator Command Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Audit accreditation pipelines, endorse tenancy confirmation letters, and monitor escalated safety incidents across all institutions.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">{stats.verifiedProperties}</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-200 mt-0.5 block">
                Accredited
              </span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block">{stats.pendingLetters}</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-200 mt-0.5 block">
                Pending Letters
              </span>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-red-400 block">{stats.activeEscalations}</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-200 mt-0.5 block">
                Escalations
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Tenancies", value: stats.activeTenancies, href: "/dashboard/admin/letters" },
          { label: "Registered Landlords", value: stats.totalLandlords, href: "/dashboard/admin#landlords" },
          { label: "Pending Verification", value: stats.pendingProperties, href: "/dashboard/admin/properties" },
          { label: "Flagged Properties", value: stats.flaggedProperties, href: "/dashboard/admin/properties" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">{item.label}</span>
            <span className="text-2xl font-black text-[#0F172A] mt-1 block group-hover:text-slate-700">{item.value}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/admin/properties"
          className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs hover:border-gray-300 transition-all flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <LuBuilding2 className="w-5 h-5 text-slate-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Property Registry</h3>
            <p className="text-xs text-gray-500 mt-0.5">Review and accredit student residences</p>
            <span className="text-xs font-bold text-slate-700 mt-2 inline-flex items-center gap-1">
              {stats.pendingProperties} awaiting review <LuArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/letters"
          className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs hover:border-gray-300 transition-all flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <LuFileCheck className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Confirmation Letters</h3>
            <p className="text-xs text-gray-500 mt-0.5">Endorse and dispatch tenancy letters</p>
            <span className="text-xs font-bold text-amber-700 mt-2 inline-flex items-center gap-1">
              {stats.pendingLetters} pending endorsement <LuArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/escalations"
          className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs hover:border-gray-300 transition-all flex items-start gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <LuShieldAlert className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Global Escalations</h3>
            <p className="text-xs text-gray-500 mt-0.5">Monitor critical safety incidents</p>
            <span className="text-xs font-bold text-red-600 mt-2 inline-flex items-center gap-1">
              {stats.activeEscalations} active cases <LuArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      <div id="landlords" className="space-y-4 scroll-mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <LuUsers className="w-4 h-4 text-slate-600" />
              Landlord Verification Queue
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Landlords with incomplete onboarding or properties awaiting accreditation
            </p>
          </div>
        </div>

        {pendingLandlords.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
            <LuCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-900">All landlords verified</p>
            <p className="text-xs text-gray-500 mt-1">No pending KYC or property verification items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLandlords.slice(0, 8).map((landlord) => (
              <div
                key={landlord.id}
                className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {landlord.entityType || "LANDLORD"}
                    </span>
                    {!landlord.onboardingCompleted && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Onboarding Incomplete
                      </span>
                    )}
                    {landlord.pendingPropertyCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {landlord.pendingPropertyCount} Property Pending
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-1">{landlord.name}</h4>
                  <p className="text-xs text-gray-500">{landlord.email}</p>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <LuClock className="w-3.5 h-3.5" />
                  {landlord.propertyCount} propert{landlord.propertyCount === 1 ? "y" : "ies"} listed
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

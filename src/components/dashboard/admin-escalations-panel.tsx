"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LuShieldAlert,
  LuClock,
  LuUsers,
  LuBuilding2,
  LuMapPin,
  LuMail,
  LuArrowRight,
} from "react-icons/lu";

export interface AdminEscalationItem {
  id: string;
  subject: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
  studentName: string;
  studentEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  landlordName: string;
}

type SeverityFilter = "ALL" | "CRITICAL_EMERGENCY" | "HIGH" | "MEDIUM" | "LOW";

interface AdminEscalationsPanelProps {
  initialReports: AdminEscalationItem[];
}

export default function AdminEscalationsPanel({ initialReports }: AdminEscalationsPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    return initialReports.filter((r) => {
      const matchSeverity = severityFilter === "ALL" || r.severity === severityFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        r.subject.toLowerCase().includes(q) ||
        r.propertyTitle.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q);
      return matchSeverity && matchSearch;
    });
  }, [initialReports, severityFilter, searchTerm]);

  const criticalCount = initialReports.filter((r) => r.severity === "CRITICAL_EMERGENCY").length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-6 sm:p-8 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold flex items-center gap-1.5 w-fit">
              <LuShieldAlert className="w-3.5 h-3.5" />
              Global Escalation Monitor
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              High-Severity Incident Ticker
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitor escalated safety reports synced with SRC crisis desks. Platform admins oversee cross-institutional incidents.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/10 border border-white/10 text-center shrink-0">
            <span className="text-3xl font-black text-red-400 block">{criticalCount}</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-200">Critical Cases</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["ALL", "CRITICAL_EMERGENCY", "HIGH", "MEDIUM", "LOW"] as SeverityFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSeverityFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                severityFilter === tab ? "bg-red-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "ALL" ? "All Severities" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search escalations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white min-w-[200px]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <LuShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No active escalations</h3>
          <p className="text-xs text-gray-500 mt-1">Escalated reports will appear here when students escalate safety incidents.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((report) => {
            const isCritical = report.severity === "CRITICAL_EMERGENCY";

            return (
              <div
                key={report.id}
                className={`p-6 rounded-2xl border bg-white shadow-xs ${
                  isCritical ? "border-red-300 bg-red-50/20" : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isCritical ? "bg-red-600 text-white" : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {report.severity.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {report.status.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {report.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <LuClock className="w-3.5 h-3.5" />
                    {new Date(report.createdAt).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="py-4 space-y-2">
                  <h3 className="text-base font-bold text-gray-900">{report.subject}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    {report.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <LuUsers className="w-3.5 h-3.5" /> Student Reporter
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{report.studentName}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <LuMail className="w-3 h-3" />
                      {report.studentEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <LuBuilding2 className="w-3.5 h-3.5" /> Residence
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{report.propertyTitle}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <LuMapPin className="w-3 h-3 shrink-0" />
                      {report.propertyAddress}
                    </p>
                    <p className="text-gray-700 font-semibold">Landlord: {report.landlordName}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400">Ref: {report.id}</span>
                  <Link
                    href="/dashboard/src"
                    className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5"
                  >
                    View SRC Crisis Desk
                    <LuArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

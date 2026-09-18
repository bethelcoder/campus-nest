"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LuShieldAlert,
  LuClock,
  LuCheck,
  LuUsers,
  LuBuilding2,
  LuPhone,
  LuMail,
  LuMapPin,
  LuFilter,
  LuSparkles,
  LuArrowRight,
  LuFileText,
  LuScale,
  LuInfo,
} from "react-icons/lu";

export interface SrcReportItem {
  id: string;
  subject: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  category: string | null;
  actionNotes: string | null;
  createdAt: string;
  slaExpiresAt: string | null;
  student: {
    name: string;
    studentNumber: string;
    institution: string;
    email: string;
    phone?: string;
  };
  property: {
    id?: string;
    title: string;
    address: string;
    suburb?: string;
    landlord: string;
    landlordEmail?: string;
    landlordPhone?: string;
    safetyScore?: number | null;
  };
}

interface SrcDashboardOverviewProps {
  initialReports: SrcReportItem[];
  user: {
    name: string;
    surname: string;
    email: string;
    institutionName?: string | null;
  };
}

type FilterStatus = "ALL" | "ESCALATED" | "UNDER_INTERVENTION" | "RESOLVED";
type FilterSeverity = "ALL" | "CRITICAL_EMERGENCY" | "HIGH" | "MEDIUM" | "LOW";

export default function SrcDashboardOverview({
  initialReports,
  user,
}: SrcDashboardOverviewProps) {
  const [reports, setReports] = useState<SrcReportItem[]>(initialReports);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [severityFilter, setSeverityFilter] = useState<FilterSeverity>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<SrcReportItem | null>(null);
  const [actionNoteInput, setActionNoteInput] = useState("");

  const criticalCount = reports.filter((r) => r.severity === "CRITICAL_EMERGENCY" && r.status !== "RESOLVED").length;
  const interventionCount = reports.filter((r) => r.status === "UNDER_INTERVENTION").length;
  const openCount = reports.filter((r) => r.status !== "RESOLVED").length;

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === "ALL" ? true : r.status === statusFilter;
      const matchSeverity = severityFilter === "ALL" ? true : r.severity === severityFilter;
      const matchSearch =
        searchTerm.trim() === ""
          ? true
          : r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.property.landlord.toLowerCase().includes(searchTerm.toLowerCase());

      return matchStatus && matchSeverity && matchSearch;
    });
  }, [reports, statusFilter, severityFilter, searchTerm]);

  async function updateReportStatus(reportId: string, status: "UNDER_INTERVENTION" | "RESOLVED", note?: string) {
    setUpdatingId(reportId);
    try {
      const res = await fetch("/api/src/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          actionNotes: note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update report");
      }

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? {
                ...r,
                status,
                actionNotes: note || r.actionNotes,
              }
            : r
        )
      );

      if (selectedCase?.id === reportId) {
        setSelectedCase((prev) =>
          prev ? { ...prev, status, actionNotes: note || prev.actionNotes } : null
        );
      }
    } catch (err: any) {
      alert(err.message || "Could not update report status");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-400/30 text-red-300 text-xs font-bold flex items-center gap-1.5">
                <LuShieldAlert className="w-3.5 h-3.5" />
                <span>SRC Crisis &amp; Complaints Desk</span>
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                {user.institutionName || "Student Council"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Student Housing Complaint &amp; Crisis Queue
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-2xl leading-relaxed">
              Advocate for students facing unsafe conditions, unlawful lockouts, or broken lease terms. Coordinate rapid interventions with accredited landlords.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-red-400 block">
                {criticalCount}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-200 mt-0.5 block">
                Critical
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block">
                {interventionCount}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-200 mt-0.5 block">
                In Action
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white/10 border border-white/10 text-center">
              <span className="text-2xl sm:text-3xl font-black text-white block">
                {openCount}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-200 mt-0.5 block">
                Total Open
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["ALL", "ESCALATED", "UNDER_INTERVENTION", "RESOLVED"] as FilterStatus[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "ALL" ? "All Cases" : tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Severity Selector & Search */}
        <div className="flex items-center gap-2.5">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as FilterSeverity)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL_EMERGENCY">🚨 Critical Emergency</option>
            <option value="HIGH">⚠️ High Priority</option>
            <option value="MEDIUM">⚖️ Medium Priority</option>
            <option value="LOW">ℹ️ Standard / Low</option>
          </select>
        </div>
      </div>

      {/* Case Feed Grid */}
      {filteredReports.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <LuCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No Reports in this Queue</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              There are currently no active student complaints matching your filter criteria.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const isCritical = report.severity === "CRITICAL_EMERGENCY";
            const isIntervention = report.status === "UNDER_INTERVENTION";
            const isResolved = report.status === "RESOLVED";

            return (
              <div
                key={report.id}
                className={`p-6 rounded-2xl border transition-all shadow-xs bg-white ${
                  isCritical
                    ? "border-red-300 hover:border-red-400 bg-red-50/20"
                    : isIntervention
                    ? "border-amber-300 hover:border-amber-400 bg-amber-50/20"
                    : "border-[#E5E7EB] hover:border-gray-300"
                }`}
              >
                {/* Card Top Row: Badges & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isCritical
                          ? "bg-red-600 text-white"
                          : report.severity === "HIGH"
                          ? "bg-orange-600 text-white"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {report.severity.replace("_", " ")}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isResolved
                          ? "bg-emerald-100 text-emerald-800"
                          : isIntervention
                          ? "bg-amber-100 text-amber-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>

                    {report.category && (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Category: {report.category.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                    <LuClock className="w-3.5 h-3.5" />
                    <span>Reported: {new Date(report.createdAt).toLocaleDateString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </span>
                </div>

                {/* Main Subject & Description */}
                <div className="py-4 space-y-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {report.subject}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    {report.description}
                  </p>
                </div>

                {/* Entity Columns: Student & Residence Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs">
                  {/* Student Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <LuUsers className="w-3.5 h-3.5 text-indigo-600" /> Student Applicant
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{report.student.name}</p>
                    <p className="text-gray-500 font-mono text-[11px]">ID/Student: {report.student.studentNumber}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <LuMail className="w-3 h-3 text-gray-400" />
                      <a href={`mailto:${report.student.email}`} className="text-indigo-600 hover:underline">
                        {report.student.email}
                      </a>
                    </p>
                  </div>

                  {/* Residence & Landlord Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                      <LuBuilding2 className="w-3.5 h-3.5 text-indigo-600" /> Residence &amp; Provider
                    </span>
                    <p className="font-bold text-gray-900 text-sm">{report.property.title}</p>
                    <p className="text-gray-500 flex items-center gap-1 text-[11px]">
                      <LuMapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{report.property.address}</span>
                    </p>
                    <p className="text-gray-700 font-semibold">
                      Landlord: {report.property.landlord}
                    </p>
                  </div>
                </div>

                {/* Case Action Notes if any */}
                {report.actionNotes && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-indigo-700 mb-0.5">
                      Latest Intervention Notes:
                    </span>
                    {report.actionNotes}
                  </div>
                )}

                {/* Bottom Dispatch Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-gray-400">
                    Ref: {report.id}
                  </span>

                  <div className="flex items-center gap-2">
                    {report.status !== "UNDER_INTERVENTION" && !isResolved && (
                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => updateReportStatus(report.id, "UNDER_INTERVENTION", "SRC has formally initiated mediation with residence management.")}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <LuScale className="w-3.5 h-3.5" />
                        <span>Start Intervention</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        type="button"
                        disabled={updatingId === report.id}
                        onClick={() => updateReportStatus(report.id, "RESOLVED", "Issue inspected and confirmed resolved with student & landlord.")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <LuCheck className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <LuCheck className="w-3.5 h-3.5" /> Case Closed &amp; Resolved
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

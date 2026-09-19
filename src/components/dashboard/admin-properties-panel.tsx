"use client";

import { useState, useMemo } from "react";
import {
  LuBuilding2,
  LuShieldCheck,
  LuMapPin,
  LuCheck,
  LuX,
  LuFlag,
  LuClock,
  LuRotateCcw,
  LuMail,
  LuSearch,
  LuTriangleAlert,
} from "react-icons/lu";

export interface AdminPropertyItem {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  status: string;
  safetyScore: number | null;
  priceMonthly: number;
  bedrooms: number;
  landlordName: string;
  landlordEmail: string;
  activeReports: number;
  physicalInspectionAt: string | null;
  physicalInspectorName?: string | null;
  accreditationReference?: string | null;
}

type StatusFilter = "ALL" | "PENDING_VERIFICATION" | "VERIFIED" | "FLAGGED" | "REJECTED" | "DRAFT";

interface AdminPropertiesPanelProps {
  initialProperties: AdminPropertyItem[];
}

export default function AdminPropertiesPanel({ initialProperties }: AdminPropertiesPanelProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.landlordName.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [properties, statusFilter, searchTerm]);

  async function updateStatus(
    propertyId: string,
    status: "VERIFIED" | "FLAGGED" | "REJECTED" | "PENDING_VERIFICATION" | "DRAFT",
    verify = false,
    message?: string
  ) {
    setUpdatingId(propertyId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, verify, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property status");

      setProperties((prev) =>
        prev.map((p) =>
          p.id === propertyId
            ? {
                ...p,
                status: data.property.status,
                physicalInspectionAt: data.property.physicalInspectionAt
                  ? new Date(data.property.physicalInspectionAt).toISOString()
                  : null,
                physicalInspectorName: data.property.physicalInspectorName ?? null,
                accreditationReference: data.property.accreditationReference ?? null,
              }
            : p
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update property");
    } finally {
      setUpdatingId(null);
    }
  }

  const verifiedCount = properties.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = properties.filter((p) => p.status === "PENDING_VERIFICATION").length;
  const flaggedCount = properties.filter((p) => p.status === "FLAGGED").length;
  const rejectedCount = properties.filter((p) => p.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              Platform Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Official Housing Registry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Property Accreditation &amp; Compliance Registry
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Realistically inspect safety standards, accredit verified residences for student viewing, and enforce compliance.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Registry</span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">{properties.length}</span>
        </div>
        <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Accredited (Live)</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{verifiedCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-red-100 bg-red-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Flagged / Rejected</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{flaggedCount + rejectedCount}</span>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["ALL", "PENDING_VERIFICATION", "VERIFIED", "FLAGGED", "REJECTED", "DRAFT"] as StatusFilter[]).map((tab) => {
            const count =
              tab === "ALL"
                ? properties.length
                : properties.filter((p) => p.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{tab === "ALL" ? "All Properties" : tab.replace("_", " ")}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === tab ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search by title, landlord, suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
          />
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
          <LuTriangleAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Properties List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white space-y-2">
          <LuBuilding2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-900">No properties match your filter</h3>
          <p className="text-xs text-gray-500">Try switching tabs or adjusting your search keyword.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((property) => {
            const scoreDisplay =
              property.safetyScore !== null ? Number(property.safetyScore).toFixed(1) : null;

            const isVerified = property.status === "VERIFIED";
            const isPending = property.status === "PENDING_VERIFICATION";
            const isFlagged = property.status === "FLAGGED";
            const isRejected = property.status === "REJECTED";
            const isDraft = property.status === "DRAFT";

            return (
              <div
                key={property.id}
                className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                  isFlagged
                    ? "border-red-300 bg-red-50/10"
                    : isVerified
                    ? "border-emerald-200"
                    : isPending
                    ? "border-amber-200 bg-amber-50/10"
                    : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    {/* Status and Safety Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : isFlagged
                            ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                            : isRejected
                            ? "bg-gray-200 text-gray-700 border border-gray-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {property.status.replace("_", " ")}
                      </span>

                      {scoreDisplay && (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-2xs">
                          <LuShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{scoreDisplay} / 10 Safety</span>
                        </span>
                      )}

                      {property.activeReports > 0 && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                          <LuFlag className="w-3 h-3" />
                          <span>{property.activeReports} Active Report{property.activeReports > 1 ? "s" : ""}</span>
                        </span>
                      )}
                    </div>

                    {/* Title and Address */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{property.address}, {property.suburb}, {property.city}</span>
                      </p>
                    </div>

                    {/* Landlord and Property Specs */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-600 pt-1">
                      <span>
                        Operator: <strong className="text-gray-900">{property.landlordName}</strong> ({property.landlordEmail})
                      </span>
                      <span>•</span>
                      <span>
                        Rent: <strong className="text-gray-900">R {property.priceMonthly.toLocaleString()}/mo</strong>
                      </span>
                      <span>•</span>
                      <span>{property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}</span>
                    </div>

                    {/* Physical Inspection & Verification Banner */}
                    <div className="pt-1">
                      {isVerified && property.physicalInspectionAt ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Verified &amp; Inspected by {property.physicalInspectorName || "CampusNest Platform Admin"} on{" "}
                            {new Date(property.physicalInspectionAt).toLocaleDateString("en-ZA")}
                            {property.accreditationReference ? ` • Ref: ${property.accreditationReference}` : ""}
                          </span>
                        </div>
                      ) : isPending || (isVerified && !property.physicalInspectionAt) ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                          <LuClock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {isVerified
                              ? "Legacy verified listing awaiting updated physical inspection certificate"
                              : "Self-assessed by landlord • Awaiting Platform Admin physical audit & accreditation"}
                          </span>
                        </div>
                      ) : isFlagged ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                          <LuTriangleAlert className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Listing hidden from student browsing due to reported compliance violation</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    {/* If PENDING or DRAFT: Accredit & Verify */}
                    {(isPending || isDraft) && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "VERIFIED", true)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <LuCheck className="w-4 h-4" />
                        <span>Accredit &amp; Verify</span>
                      </button>
                    )}

                    {/* If VERIFIED: Flag Violation or Revoke */}
                    {isVerified && (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === property.id}
                          onClick={() => {
                            const reason = window.prompt("Reason for flagging this residence violation:");
                            if (reason !== null) {
                              updateStatus(property.id, "FLAGGED", false, reason || "Safety violation flagged by Admin");
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <LuFlag className="w-4 h-4" />
                          <span>Flag Violation</span>
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === property.id}
                          onClick={() => updateStatus(property.id, "PENDING_VERIFICATION", false)}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          title="Revoke verification and return to pending review"
                        >
                          <LuRotateCcw className="w-3.5 h-3.5 text-slate-500" />
                          <span>Return to Review</span>
                        </button>
                      </>
                    )}

                    {/* If FLAGGED: Clear Flag / Re-Accredit or Reject */}
                    {isFlagged && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "VERIFIED", true, "Compliance cleared and re-accredited")}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <LuCheck className="w-4 h-4" />
                        <span>Clear Flag &amp; Re-Accredit</span>
                      </button>
                    )}

                    {/* Reject Action (for pending, flagged, or draft) */}
                    {!isRejected && !isVerified && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => {
                          const reason = window.prompt("Reason for rejecting this listing:");
                          if (reason !== null) {
                            updateStatus(property.id, "REJECTED", false, reason || "Listing failed accreditation standards");
                          }
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LuX className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}

                    {/* If REJECTED: Reopen Review */}
                    {isRejected && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "PENDING_VERIFICATION")}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LuRotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reopen Review</span>
                      </button>
                    )}

                    {/* Message Landlord Action */}
                    <button
                      type="button"
                      disabled={updatingId === property.id}
                      onClick={() => {
                        const message = window.prompt(`Message to operator ${property.landlordName} (${property.landlordEmail}):`);
                        if (message !== null && message.trim()) {
                          updateStatus(property.id, property.status as any, false, message.trim());
                        }
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LuMail className="w-3.5 h-3.5 text-slate-500" />
                      <span>Message</span>
                    </button>
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

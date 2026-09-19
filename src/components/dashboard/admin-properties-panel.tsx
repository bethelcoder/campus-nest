"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  LuFileText,
  LuFileCheck,
  LuUserCheck,
  LuExternalLink,
  LuChevronRight,
  LuEye,
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
  landlordPhone?: string | null;
  companyName?: string | null;
  entityType?: string | null;
  activeReports: number;
  physicalInspectionAt: string | null;
  physicalInspectorName?: string | null;
  accreditationReference?: string | null;
  passedChecklistCount?: number;
  totalChecklistCount?: number;
  validComplianceDocsCount?: number;
  totalComplianceDocsCount?: number;
  hasKycDocs?: boolean;
  complianceDocs?: Array<{
    id: string;
    documentType: string;
    title: string;
    fileUrl: string;
    status: string;
    expiryDate?: string | null;
    referenceNumber?: string | null;
  }>;
  checklistItems?: Array<{
    id: string;
    category: string;
    label: string;
    passed: boolean | null;
    weight: number;
  }>;
  kycDocs?: {
    cipcDocumentUrl?: string | null;
    taxClearanceDocUrl?: string | null;
    directorIdDocUrl?: string | null;
    bankConfirmationDocUrl?: string | null;
    proofOfAddressDocUrl?: string | null;
  };
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
  const [quickAuditProperty, setQuickAuditProperty] = useState<AdminPropertyItem | null>(null);

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

      if (quickAuditProperty && quickAuditProperty.id === propertyId) {
        setQuickAuditProperty((prev) =>
          prev
            ? {
                ...prev,
                status: data.property.status,
                physicalInspectionAt: data.property.physicalInspectionAt
                  ? new Date(data.property.physicalInspectionAt).toISOString()
                  : null,
                physicalInspectorName: data.property.physicalInspectorName ?? null,
                accreditationReference: data.property.accreditationReference ?? null,
              }
            : null
        );
      }
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
    <div className="space-y-6 font-poppins">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-gray-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold">
              Platform Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Official Property Audit &amp; Verification Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Property Accreditation &amp; Compliance Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Inspect landlord KYC, review statutory municipal certificates, audit physical safety checklist items, and stamp verified residences for student viewing.
          </p>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-gray-200 bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Registry</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">{properties.length}</span>
        </div>
        <div className="p-5 rounded-3xl border border-emerald-100 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Accredited (Live)</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">{verifiedCount}</span>
        </div>
        <div className="p-5 rounded-3xl border border-amber-100 bg-amber-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-5 rounded-3xl border border-red-100 bg-red-50/50 shadow-xs">
          <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Flagged / Rejected</span>
          <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">{flaggedCount + rejectedCount}</span>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl border border-gray-200 bg-white shadow-xs">
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

        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search by title, landlord, suburb..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
          />
          <LuSearch className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
          <LuTriangleAlert className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Properties List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-gray-200 bg-white space-y-2">
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
                className={`p-6 sm:p-7 rounded-3xl border bg-white shadow-xs transition-all ${
                  isFlagged
                    ? "border-red-300 bg-red-50/10"
                    : isVerified
                    ? "border-emerald-200"
                    : isPending
                    ? "border-amber-200 bg-amber-50/10"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="space-y-3.5 flex-1">
                    {/* Status, Score, and Document Badges */}
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

                      {/* Checklist Summary Pill */}
                      {property.totalChecklistCount !== undefined && property.totalChecklistCount > 0 && (
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                          <LuCheck className="w-3 h-3 text-emerald-600" />
                          <span>
                            {property.passedChecklistCount}/{property.totalChecklistCount} Checks Passed
                          </span>
                        </span>
                      )}

                      {/* Compliance Docs Pill */}
                      {property.totalComplianceDocsCount !== undefined && (
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                          <LuFileCheck className="w-3 h-3 text-indigo-600" />
                          <span>
                            {property.validComplianceDocsCount}/{property.totalComplianceDocsCount} Docs Approved
                          </span>
                        </span>
                      )}

                      {/* Landlord KYC Pill */}
                      {property.hasKycDocs && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <LuUserCheck className="w-3 h-3 text-emerald-600" />
                          <span>KYC Dossier Uploaded</span>
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
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">{property.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <LuMapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{property.address}, {property.suburb}, {property.city}</span>
                      </p>
                    </div>

                    {/* Landlord and Property Specs */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-5 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                      <span>
                        Operator: <strong className="text-slate-900">{property.companyName || property.landlordName}</strong> ({property.landlordEmail})
                      </span>
                      <span>•</span>
                      <span>
                        Rent: <strong className="text-slate-900">R {property.priceMonthly.toLocaleString()}/mo</strong>
                      </span>
                      <span>•</span>
                      <span>{property.bedrooms} Bed{property.bedrooms > 1 ? "s" : ""}</span>
                      {property.landlordPhone && (
                        <>
                          <span>•</span>
                          <span>Tel: <strong className="text-slate-900">{property.landlordPhone}</strong></span>
                        </>
                      )}
                    </div>

                    {/* Physical Inspection & Verification Banner */}
                    <div className="pt-0.5">
                      {isVerified && property.physicalInspectionAt ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
                          <LuShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Verified &amp; Inspected by {property.physicalInspectorName || "CampusNest Platform Admin"} on{" "}
                            {new Date(property.physicalInspectionAt).toLocaleDateString("en-ZA")}
                            {property.accreditationReference ? ` • Ref: ${property.accreditationReference}` : ""}
                          </span>
                        </div>
                      ) : isPending || (isVerified && !property.physicalInspectionAt) ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                          <LuClock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {isVerified
                              ? "Legacy verified listing awaiting updated physical inspection certificate"
                              : "Self-assessed by landlord • Awaiting Platform Admin physical audit & accreditation"}
                          </span>
                        </div>
                      ) : isFlagged ? (
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl">
                          <LuTriangleAlert className="w-4 h-4 text-red-600 shrink-0" />
                          <span>Listing hidden from student browsing due to reported compliance violation</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
                    {/* Primary Action: Open Full Audit Dossier */}
                    <Link
                      href={`/dashboard/admin/properties/${property.id}`}
                      className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <LuFileText className="w-4 h-4 text-emerald-400" />
                      <span>Audit &amp; Verify Dossier</span>
                      <LuChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {/* Quick Audit Drawer Button */}
                    <button
                      type="button"
                      onClick={() => setQuickAuditProperty(property)}
                      className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <LuEye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Quick Preview</span>
                    </button>

                    {/* Quick Accredit or Flag Actions */}
                    <div className="flex items-center gap-1.5 w-full justify-end pt-1">
                      {(isPending || isDraft) && (
                        <button
                          type="button"
                          disabled={updatingId === property.id}
                          onClick={() => updateStatus(property.id, "VERIFIED", true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <LuCheck className="w-3 h-3" />
                          <span>Accredit</span>
                        </button>
                      )}

                      {isVerified && (
                        <button
                          type="button"
                          disabled={updatingId === property.id}
                          onClick={() => {
                            const reason = window.prompt("Reason for flagging this residence violation:");
                            if (reason !== null) {
                              updateStatus(property.id, "FLAGGED", false, reason || "Safety violation flagged by Admin");
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                        >
                          <LuFlag className="w-3 h-3" />
                          <span>Flag</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => {
                          const message = window.prompt(`Message to operator ${property.landlordName} (${property.landlordEmail}):`);
                          if (message !== null && message.trim()) {
                            updateStatus(property.id, property.status as any, false, message.trim());
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Send notification message to landlord"
                      >
                        <LuMail className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Audit Modal / Drawer */}
      {quickAuditProperty && (
        <div
          onClick={() => setQuickAuditProperty(null)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto space-y-6 animate-fadeIn"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Quick Audit Dossier
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{quickAuditProperty.title}</h2>
                <p className="text-xs text-slate-500">{quickAuditProperty.address}, {quickAuditProperty.suburb}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickAuditProperty(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Landlord KYC Documents Grid */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <LuUserCheck className="w-4 h-4 text-emerald-600" />
                <span>Landlord KYC Documents</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {quickAuditProperty.kycDocs?.cipcDocumentUrl ? (
                  <a
                    href={quickAuditProperty.kycDocs.cipcDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between font-bold text-emerald-900"
                  >
                    <span>CIPC Registration Certificate</span>
                    <LuExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    CIPC Doc Not Uploaded
                  </div>
                )}

                {quickAuditProperty.kycDocs?.taxClearanceDocUrl ? (
                  <a
                    href={quickAuditProperty.kycDocs.taxClearanceDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between font-bold text-emerald-900"
                  >
                    <span>SARS Tax Clearance PIN</span>
                    <LuExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Tax Clearance Not Uploaded
                  </div>
                )}

                {quickAuditProperty.kycDocs?.directorIdDocUrl ? (
                  <a
                    href={quickAuditProperty.kycDocs.directorIdDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between font-bold text-emerald-900"
                  >
                    <span>Certified Director ID</span>
                    <LuExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Director ID Not Uploaded
                  </div>
                )}

                {quickAuditProperty.kycDocs?.bankConfirmationDocUrl ? (
                  <a
                    href={quickAuditProperty.kycDocs.bankConfirmationDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 flex items-center justify-between font-bold text-emerald-900"
                  >
                    <span>Stamped Bank Confirmation</span>
                    <LuExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    Bank Letter Not Uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Statutory Compliance Docs */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <LuFileCheck className="w-4 h-4 text-indigo-600" />
                <span>Uploaded Statutory Property Compliance Documents ({quickAuditProperty.complianceDocs?.length || 0})</span>
              </h3>
              {quickAuditProperty.complianceDocs && quickAuditProperty.complianceDocs.length > 0 ? (
                <div className="space-y-1.5">
                  {quickAuditProperty.complianceDocs.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LuFileText className="w-4 h-4 text-slate-500" />
                        <span>{doc.title || doc.documentType.replace(/_/g, " ")}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        doc.status === "VALID" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {doc.status}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 text-center">
                  No statutory compliance documents uploaded for this listing yet.
                </div>
              )}
            </div>

            {/* Footer with full page navigation */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickAuditProperty(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
              >
                Close Preview
              </button>

              <Link
                href={`/dashboard/admin/properties/${quickAuditProperty.id}`}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <span>Open Complete Audit Console</span>
                <LuExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

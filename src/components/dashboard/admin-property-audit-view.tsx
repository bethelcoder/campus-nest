"use client";

import { useState } from "react";
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
  LuExternalLink,
  LuFileText,
  LuDownload,
  LuUserCheck,
  LuBuilding,
  LuCreditCard,
  LuFileCheck,
  LuTriangleAlert,
  LuImage,
  LuBed,
  LuDollarSign,
  LuSave,
  LuArrowLeft,
  LuCalendar,
} from "react-icons/lu";

export interface PropertyAuditData {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  postalCode?: string | null;
  formattedAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  priceMonthly: number;
  depositAmount?: number | null;
  bedrooms: number;
  bathrooms?: number | null;
  maxOccupants?: number | null;
  description?: string | null;
  amenities: string[];
  distanceToCampus?: number | null;
  images: string[];
  safetyScore: number | null;
  status: "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "FLAGGED" | "REJECTED";
  physicalInspectionAt?: string | null;
  physicalInspectorName?: string | null;
  accreditationReference?: string | null;
  createdAt: string;
  updatedAt: string;
  landlord: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
    idNumber?: string | null;
    createdAt: string;
    landlordProfile?: {
      entityType?: string | null;
      companyName?: string | null;
      companyRegNumber?: string | null;
      cipcDocumentUrl?: string | null;
      taxNumber?: string | null;
      taxPin?: string | null;
      taxClearanceDocUrl?: string | null;
      businessAddress?: string | null;
      proofOfAddressDocUrl?: string | null;
      contactPhone?: string | null;
      directorIdNumber?: string | null;
      directorIdDocUrl?: string | null;
      directorIdCertified?: boolean;
      bankName?: string | null;
      bankAccountType?: string | null;
      bankAccountNumber?: string | null;
      bankBranchCode?: string | null;
      bankConfirmationDocUrl?: string | null;
      providerAssociationNo?: string | null;
      verificationStatus?: string;
      verificationNotes?: string | null;
      verifiedAt?: string | null;
    } | null;
  };
  complianceDocs: Array<{
    id: string;
    documentType: string;
    title: string;
    fileUrl: string;
    fileName: string;
    fileSizeBytes?: number | null;
    issuedDate?: string | null;
    expiryDate?: string | null;
    issuingBody?: string | null;
    referenceNumber?: string | null;
    status: "PENDING_AUDIT" | "VALID" | "EXPIRED" | "REJECTED";
    rejectionReason?: string | null;
    verifiedAt?: string | null;
    verifiedByAdminId?: string | null;
  }>;
  checklistItems: Array<{
    id: string;
    category: "SECURITY" | "FIRE_SAFETY" | "UTILITIES" | "BUILDING_STRUCTURE" | "LOCATION_RISK";
    label: string;
    passed: boolean | null;
    weight: number;
    notes?: string | null;
  }>;
  roomUnits?: Array<{
    id: string;
    unitNumber: string;
    floorLevel: number;
    roomType: string;
    bathroomType: string;
    monthlyPrice: number;
    depositAmount: number;
    isNsfasCapped: boolean;
    genderPolicy: string;
    amenities: string[];
    beds: Array<{
      id: string;
      bedIdentifier: string;
      status: string;
    }>;
  }>;
  reports?: Array<{
    id: string;
    subject: string;
    description: string;
    status: string;
    severity: string;
    createdAt: string;
    reporter?: { name: string; surname: string; email: string };
  }>;
  _count?: {
    applications: number;
    tenancies: number;
    favorites: number;
  };
}

const ALL_COMPLIANCE_TYPES: Array<{
  type: string;
  label: string;
  description: string;
  critical: boolean;
}> = [
  {
    type: "OCCUPANCY_CERTIFICATE",
    label: "Municipal Certificate of Occupancy",
    description: "Issued by local municipality confirming building is safe and approved for residential habitation.",
    critical: true,
  },
  {
    type: "FIRE_SAFETY_CERTIFICATE",
    label: "Fire Safety Compliance Certificate",
    description: "Certified inspection for extinguishers, emergency egress routes, hydrants, and alarms.",
    critical: true,
  },
  {
    type: "ELECTRICAL_COC",
    label: "Electrical Certificate of Compliance (COC)",
    description: "Valid certificate issued by an accredited electrician within the last 24 months.",
    critical: true,
  },
  {
    type: "HEALTH_HYGIENE_CERTIFICATE",
    label: "Environmental Health & Sanitation Certificate",
    description: "Municipal health inspection verifying clean water, waste disposal, and pest control.",
    critical: true,
  },
  {
    type: "BUILDING_INSURANCE_POLICY",
    label: "Comprehensive Building & Public Liability Insurance",
    description: "Active insurance schedule covering public liability and student structural damages.",
    critical: false,
  },
  {
    type: "TITLE_DEED_OR_LEASE",
    label: "Title Deed / Head Lease Agreement",
    description: "Proof of lawful ownership or registered head-lease authorizing student sub-letting.",
    critical: true,
  },
  {
    type: "SECURITY_ARMED_RESPONSE_SLA",
    label: "Armed Response & Security SLA",
    description: "Contract with registered private security provider (e.g., ADT, 24/7 Security) for rapid armed dispatch.",
    critical: false,
  },
  {
    type: "BACKUP_POWER_GENERATOR_CERT",
    label: "Backup Power / Generator Installation Certificate",
    description: "Inverter or generator electrical sign-off verifying load-shedding resilience for student study.",
    critical: false,
  },
  {
    type: "WATER_BACKUP_SANITATION_CERT",
    label: "Backup Water Storage & Sanitation Sign-Off",
    description: "JoJo tank / municipal backup plumbing certificate for continuous water security.",
    critical: false,
  },
  {
    type: "EMERGENCY_EVACUATION_PLAN",
    label: "Emergency Evacuation & Disaster Plan",
    description: "Visible floor layout plans showing assembly points and emergency contact placards.",
    critical: false,
  },
  {
    type: "NSFAS_ACCREDITATION_PROOF",
    label: "NSFAS / University Housing Accreditation Letter",
    description: "Official confirmation of university or NSFAS private student accommodation (PBSA) accreditation.",
    critical: false,
  },
];

export default function AdminPropertyAuditView({ initialProperty }: { initialProperty: PropertyAuditData }) {
  const [property, setProperty] = useState<PropertyAuditData>(initialProperty);
  const [activeTab, setActiveTab] = useState<"dossier" | "compliance" | "checklist" | "specs" | "reports">("dossier");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Accreditation form inputs
  const [inspectorName, setInspectorName] = useState(
    property.physicalInspectorName || "CampusNest Platform Admin"
  );
  const [inspectionDate, setInspectionDate] = useState(
    property.physicalInspectionAt
      ? new Date(property.physicalInspectionAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [accreditationRef, setAccreditationRef] = useState(
    property.accreditationReference || `CN-${property.id.slice(-8).toUpperCase()}`
  );

  // Checklist local state
  const [checklist, setChecklist] = useState(property.checklistItems);
  const [checklistDirty, setChecklistDirty] = useState(false);

  // Preview Image Modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  function toggleChecklistItem(id: string, value: boolean) {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: value } : item))
    );
    setChecklistDirty(true);
  }

  async function saveChecklist() {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistUpdates: checklist.map((i) => ({
            id: i.id,
            passed: i.passed === true,
            notes: i.notes || null,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update safety checklist");

      setProperty((prev) => ({
        ...prev,
        safetyScore: data.property.safetyScore,
        checklistItems: data.property.checklistItems || checklist,
      }));
      setChecklistDirty(false);
      setSuccessMsg("Safety checklist saved and safety score recalculated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to save checklist");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuditDocStatus(
    docId: string,
    status: "VALID" | "REJECTED",
    rejectionReason?: string
  ) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/properties/${property.id}/compliance-docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          rejectionReason: rejectionReason || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to audit document");

      setProperty((prev) => ({
        ...prev,
        complianceDocs: prev.complianceDocs.map((d) => (d.id === docId ? data.doc : d)),
      }));
      setSuccessMsg(`Document marked as ${status}`);
    } catch (err: any) {
      setError(err.message || "Could not update document status");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccreditationDecision(
    targetStatus: "VERIFIED" | "FLAGGED" | "REJECTED" | "PENDING_VERIFICATION",
    message?: string
  ) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          verify: targetStatus === "VERIFIED",
          physicalInspectionAt: targetStatus === "VERIFIED" ? new Date(inspectionDate).toISOString() : null,
          physicalInspectorName: targetStatus === "VERIFIED" ? inspectorName : null,
          accreditationReference: targetStatus === "VERIFIED" ? accreditationRef : null,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update accreditation status");

      setProperty((prev) => ({
        ...prev,
        status: data.property.status,
        physicalInspectionAt: data.property.physicalInspectionAt,
        physicalInspectorName: data.property.physicalInspectorName,
        accreditationReference: data.property.accreditationReference,
      }));
      setSuccessMsg(`Property status updated to ${targetStatus.replace("_", " ")}`);
    } catch (err: any) {
      setError(err.message || "Could not update property");
    } finally {
      setLoading(false);
    }
  }

  const passedChecksCount = checklist.filter((i) => i.passed === true).length;
  const totalChecksCount = checklist.length;
  const validDocsCount = property.complianceDocs.filter((d) => d.status === "VALID").length;

  const landlordProfile = property.landlord.landlordProfile;

  return (
    <div className="space-y-6 pb-12 font-poppins">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/admin/properties"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-gray-200 transition-colors shadow-2xs"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span>Back to Property Registry</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Property ID:</span>
          <code className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md">
            {property.id}
          </code>
        </div>
      </div>

      {/* Main Header & Status Hero Card */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${
                  property.status === "VERIFIED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : property.status === "FLAGGED"
                    ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                    : property.status === "REJECTED"
                    ? "bg-gray-200 text-gray-700 border border-gray-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                {property.status.replace("_", " ")}
              </span>

              {property.safetyScore !== null && (
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                  <LuShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{Number(property.safetyScore).toFixed(1)} / 10 Safety Score</span>
                </span>
              )}

              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                {validDocsCount} / {ALL_COMPLIANCE_TYPES.length} Statutory Certificates Valid
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {property.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
              <LuMapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {property.address}, {property.suburb}, {property.city} {property.postalCode ? `(${property.postalCode})` : ""}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400">Landlord / Entity:</span>{" "}
                <strong className="text-slate-900 font-bold">
                  {landlordProfile?.companyName || `${property.landlord.name} ${property.landlord.surname}`}
                </strong>{" "}
                ({property.landlord.email})
              </div>
              <div>
                <span className="text-slate-400">Monthly Rent:</span>{" "}
                <strong className="text-slate-900 font-bold">R {Number(property.priceMonthly).toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-slate-400">Bedrooms:</span>{" "}
                <strong className="text-slate-900 font-bold">{property.bedrooms}</strong>
              </div>
              <div>
                <span className="text-slate-400">Active Tenancies:</span>{" "}
                <strong className="text-slate-900 font-bold">{property._count?.tenancies || 0}</strong>
              </div>
            </div>
          </div>

          {/* Decision Ribbon Container */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:max-w-sm w-full space-y-4 shrink-0">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Platform Accreditation Controls
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Physical audit inspection stamp and live student visibility.
              </p>
            </div>

            {property.status === "VERIFIED" ? (
              <div className="p-3 bg-emerald-100/60 border border-emerald-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <LuShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Accredited &amp; Listed to Students</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Ref: <strong className="font-mono">{property.accreditationReference || "CN-ACTIVE"}</strong>
                  <br />
                  Audited by: {property.physicalInspectorName || "Admin"} on{" "}
                  {property.physicalInspectionAt
                    ? new Date(property.physicalInspectionAt).toLocaleDateString("en-ZA")
                    : "—"}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <LuClock className="w-4 h-4 text-amber-600" />
                  <span>Pending Official Audit</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Hidden from student browsing until Platform Admin physical inspection and document audit pass.
                </p>
              </div>
            )}

            {/* Accreditation input controls */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Inspector Name</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Audit Date</label>
                  <input
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Certificate Ref Number</label>
                <input
                  type="text"
                  value={accreditationRef}
                  onChange={(e) => setAccreditationRef(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              {property.status !== "VERIFIED" ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleAccreditationDecision("VERIFIED")}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <LuCheck className="w-4 h-4" />
                  <span>Accredit &amp; Issue Certificate</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    const reason = window.prompt("Reason for flagging violation on this residence:");
                    if (reason !== null) {
                      handleAccreditationDecision("FLAGGED", reason || "Safety violation flagged by Admin");
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <LuFlag className="w-4 h-4" />
                  <span>Flag Safety Violation</span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {property.status !== "PENDING_VERIFICATION" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAccreditationDecision("PENDING_VERIFICATION")}
                    className="py-2 px-3 rounded-xl border border-slate-300 hover:bg-white text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <LuRotateCcw className="w-3.5 h-3.5" />
                    <span>Return to Review</span>
                  </button>
                )}

                {property.status !== "REJECTED" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      const reason = window.prompt("Reason for rejecting listing:");
                      if (reason !== null) {
                        handleAccreditationDecision("REJECTED", reason || "Failed physical safety standards");
                      }
                    }}
                    className="py-2 px-3 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    <LuX className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
            <LuTriangleAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <LuCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("dossier")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "dossier"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <LuUserCheck className="w-4 h-4" />
          <span>Landlord KYC &amp; Banking Dossier</span>
          {landlordProfile?.cipcDocumentUrl && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("compliance")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "compliance"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <LuFileCheck className="w-4 h-4" />
          <span>Statutory Compliance Certificates</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {property.complianceDocs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checklist")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "checklist"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <LuShieldCheck className="w-4 h-4" />
          <span>Safety Checklist Physical Audit</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {passedChecksCount}/{totalChecksCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "specs"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <LuBuilding className="w-4 h-4" />
          <span>Specs, Media &amp; Units</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700">
            {property.images.length} photos
          </span>
        </button>
      </div>

      {/* Tab 1: Landlord KYC & Business Dossier */}
      {activeTab === "dossier" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Identity & CIPC Verification */}
            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <LuBuilding className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Entity &amp; Registration</h3>
                    <p className="text-[11px] text-slate-500">CIPC company registration &amp; provider identity</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {landlordProfile?.entityType || "INDIVIDUAL"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Company Name</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {landlordProfile?.companyName || "Private Landlord Operator"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CIPC Reg Number</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.companyRegNumber || "Not Applicable"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SARS Tax Number</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.taxNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SARS Tax PIN</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.taxPin || "—"}
                  </span>
                </div>
              </div>

              {/* Document Download Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">Uploaded Entity Documents</span>
                <div className="flex flex-col gap-2">
                  {landlordProfile?.cipcDocumentUrl ? (
                    <a
                      href={landlordProfile.cipcDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs text-emerald-900 font-bold transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LuFileText className="w-4 h-4 text-emerald-600" />
                        <span>CIPC Registration Certificate (COR14.3 / CK)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                        <span>View Document</span>
                        <LuExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                      <LuFileText className="w-4 h-4" />
                      <span>CIPC registration document not uploaded</span>
                    </div>
                  )}

                  {landlordProfile?.taxClearanceDocUrl ? (
                    <a
                      href={landlordProfile.taxClearanceDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs text-emerald-900 font-bold transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LuFileCheck className="w-4 h-4 text-emerald-600" />
                        <span>SARS Tax Compliance Clearance Certificate</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                        <span>View Document</span>
                        <LuExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                      <LuFileCheck className="w-4 h-4" />
                      <span>SARS tax clearance certificate not uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Director Verification & Physical Address */}
            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <LuUserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Director &amp; Owner Identity</h3>
                    <p className="text-[11px] text-slate-500">Certified ID and proof of business address</p>
                  </div>
                </div>
                {landlordProfile?.directorIdCertified && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <LuCheck className="w-3 h-3" /> Certified ID
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Director / Operator</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {property.landlord.name} {property.landlord.surname}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">SA ID / Passport Number</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.directorIdNumber || property.landlord.idNumber || "—"}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Registered Business Address</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">
                    {landlordProfile?.businessAddress || property.address || "—"}
                  </span>
                </div>
              </div>

              {/* ID and Proof of Address Links */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">Identity &amp; Address Proof</span>
                <div className="flex flex-col gap-2">
                  {landlordProfile?.directorIdDocUrl ? (
                    <a
                      href={landlordProfile.directorIdDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs text-emerald-900 font-bold transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LuUserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Certified Director National ID Document</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                        <span>View Document</span>
                        <LuExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                      <LuUserCheck className="w-4 h-4" />
                      <span>Director ID document not uploaded</span>
                    </div>
                  )}

                  {landlordProfile?.proofOfAddressDocUrl ? (
                    <a
                      href={landlordProfile.proofOfAddressDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs text-emerald-900 font-bold transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <LuMapPin className="w-4 h-4 text-emerald-600" />
                        <span>Proof of Business Address (Utility Bill / Lease)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                        <span>View Document</span>
                        <LuExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                      <LuMapPin className="w-4 h-4" />
                      <span>Proof of address document not uploaded</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Banking Details Dossier (For NSFAS & Direct Rental Disbursements) */}
            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <LuCreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Banking Details &amp; Stamped Verification Letter</h3>
                    <p className="text-[11px] text-slate-500">
                      Required for bursary/NSFAS direct allowance disbursement compliance
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Bank Institution</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{landlordProfile?.bankName || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Type</span>
                  <span className="font-bold text-slate-900 mt-0.5 block">{landlordProfile?.bankAccountType || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Account Number</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.bankAccountNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Branch Code</span>
                  <span className="font-bold text-slate-900 mt-0.5 block font-mono">
                    {landlordProfile?.bankBranchCode || "—"}
                  </span>
                </div>
              </div>

              {landlordProfile?.bankConfirmationDocUrl ? (
                <a
                  href={landlordProfile.bankConfirmationDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-xs text-emerald-900 font-bold transition-all"
                >
                  <div className="flex items-center gap-2">
                    <LuCreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Official Stamped Bank Account Confirmation Letter</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                    <span>Inspect Letter</span>
                    <LuExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              ) : (
                <div className="p-3 rounded-xl border border-dashed border-gray-200 text-xs text-gray-400 flex items-center gap-2">
                  <LuCreditCard className="w-4 h-4" />
                  <span>Stamped bank confirmation letter not uploaded</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Statutory Compliance Documents */}
      {activeTab === "compliance" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <LuFileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Statutory Building &amp; Municipal Compliance Audit</span>
              <span className="text-slate-500">
                Review each uploaded certificate. Verified certificates are stamped into the confirmation letter for NSFAS and university housing audits.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ALL_COMPLIANCE_TYPES.map((template) => {
              const uploadedDoc = property.complianceDocs.find((d) => d.documentType === template.type);

              return (
                <div
                  key={template.type}
                  className={`p-5 rounded-3xl border bg-white shadow-xs transition-all ${
                    uploadedDoc?.status === "VALID"
                      ? "border-emerald-200 bg-emerald-50/10"
                      : uploadedDoc?.status === "REJECTED"
                      ? "border-red-200 bg-red-50/10"
                      : uploadedDoc
                      ? "border-amber-200 bg-amber-50/10"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{template.label}</span>
                        {template.critical && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                            Mandatory
                          </span>
                        )}
                        {uploadedDoc && (
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              uploadedDoc.status === "VALID"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : uploadedDoc.status === "REJECTED"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-amber-100 text-amber-800 border border-amber-300"
                            }`}
                          >
                            {uploadedDoc.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{template.description}</p>

                      {uploadedDoc && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                          {uploadedDoc.issuingBody && (
                            <span>
                              Issuing Body: <strong className="text-slate-900">{uploadedDoc.issuingBody}</strong>
                            </span>
                          )}
                          {uploadedDoc.referenceNumber && (
                            <span>
                              Ref: <strong className="text-slate-900 font-mono">{uploadedDoc.referenceNumber}</strong>
                            </span>
                          )}
                          {uploadedDoc.expiryDate && (
                            <span>
                              Expires:{" "}
                              <strong
                                className={`font-semibold ${
                                  new Date(uploadedDoc.expiryDate) < new Date()
                                    ? "text-red-600 font-bold"
                                    : "text-slate-900"
                                }`}
                              >
                                {new Date(uploadedDoc.expiryDate).toLocaleDateString("en-ZA")}
                              </strong>
                            </span>
                          )}
                          {uploadedDoc.rejectionReason && (
                            <span className="text-red-600 font-bold block w-full mt-1">
                              Rejection note: {uploadedDoc.rejectionReason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Controls for Document */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {uploadedDoc ? (
                        <>
                          <a
                            href={uploadedDoc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                          >
                            <LuFileText className="w-3.5 h-3.5" />
                            <span>View / Download File</span>
                            <LuExternalLink className="w-3 h-3 text-slate-400" />
                          </a>

                          {uploadedDoc.status !== "VALID" && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleAuditDocStatus(uploadedDoc.id, "VALID")}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <LuCheck className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          )}

                          {uploadedDoc.status !== "REJECTED" && (
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => {
                                const reason = window.prompt("Reason for rejecting this document (e.g. Expired, Unclear scan):");
                                if (reason !== null) {
                                  handleAuditDocStatus(uploadedDoc.id, "REJECTED", reason || "Document rejected during audit");
                                }
                              }}
                              className="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <LuX className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-xl">
                          Not uploaded by landlord
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Safety Checklist Physical Audit */}
      {activeTab === "checklist" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white shadow-md">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <LuShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Physical Safety Audit Checklist</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Toggle pass/fail status based on physical site inspection. Live safety score recalculates instantly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Passed Checks</span>
                <span className="text-lg font-black text-emerald-400">
                  {passedChecksCount} / {totalChecksCount}
                </span>
              </div>
              {checklistDirty && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={saveChecklist}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <LuSave className="w-4 h-4" />
                  <span>Save Checklist Changes</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-xs flex items-center justify-between gap-4 transition-all ${
                  item.passed === true
                    ? "border-emerald-200 bg-emerald-50/10"
                    : item.passed === false
                    ? "border-red-200 bg-red-50/10"
                    : "border-gray-200"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {item.category.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">Weight: {item.weight}x</span>
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">{item.label}</p>
                  {item.notes && <p className="text-xs text-slate-500 italic">Notes: {item.notes}</p>}
                </div>

                {/* Toggle Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id, true)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      item.passed === true
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <LuCheck className="w-3.5 h-3.5" />
                    <span>Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChecklistItem(item.id, false)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      item.passed === false
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                    }`}
                  >
                    <LuX className="w-3.5 h-3.5" />
                    <span>Fail</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {checklistDirty && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-amber-800">
                You have unsaved checklist changes. Click save to recalculate the official safety score.
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={saveChecklist}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <LuSave className="w-4 h-4" />
                <span>Save Checklist</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Residence Specs, Photos & Room Inventory */}
      {activeTab === "specs" && (
        <div className="space-y-6">
          {/* Photo Gallery */}
          <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <LuImage className="w-4 h-4 text-emerald-600" />
              <span>Property Photos Gallery ({property.images.length})</span>
            </h3>

            {property.images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {property.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                  >
                    <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                      <span>Click to Zoom</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                No photos uploaded for this property
              </div>
            )}
          </div>

          {/* Amenities & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Amenities &amp; Features</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold"
                  >
                    {amenity.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Listing Description</h3>
              <p className="text-xs leading-relaxed text-slate-600">
                {property.description || "No description provided by landlord."}
              </p>
            </div>
          </div>

          {/* Room Units and Bed Inventory */}
          {property.roomUnits && property.roomUnits.length > 0 && (
            <div className="p-6 rounded-3xl border border-gray-200 bg-white shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <LuBed className="w-4 h-4 text-emerald-600" />
                <span>Room Units &amp; Bed Allocations ({property.roomUnits.length} Units)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.roomUnits.map((unit) => (
                  <div key={unit.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{unit.unitNumber}</span>
                      <span className="font-mono font-bold text-emerald-700">R {Number(unit.monthlyPrice).toLocaleString()}/mo</span>
                    </div>
                    <div className="text-slate-500">
                      <span>Type: {unit.roomType.replace(/_/g, " ")}</span> • <span>Floor {unit.floorLevel}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {unit.beds.map((bed) => (
                        <span key={bed.id} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                          {bed.bedIdentifier} ({bed.status})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Zoom Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-black">
            <img src={selectedImage} alt="Property Zoom" className="max-w-full max-h-[85vh] object-contain" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
            >
              <LuX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

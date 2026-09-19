"use client";

import React, { useState } from "react";
import {
  LuShieldCheck,
  LuFileText,
  LuUpload,
  LuClock,
  LuCalendar,
  LuEye,
  LuTrash2,
  LuPlus,
  LuBuilding2,
  LuFileCheck,
  LuShieldAlert,
  LuZap,
  LuDroplets,
  LuFlame,
  LuLock,
  LuInfo,
  LuX,
} from "react-icons/lu";

export interface ComplianceDocItem {
  id?: string;
  propertyId: string;
  documentType: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number | null;
  issuedDate?: string | Date | null;
  expiryDate?: string | Date | null;
  issuingBody?: string | null;
  referenceNumber?: string | null;
  status: "PENDING_AUDIT" | "VALID" | "EXPIRED" | "REJECTED";
  rejectionReason?: string | null;
}

export const COMPLIANCE_STANDARDS: Array<{
  type: string;
  title: string;
  shortLabel: string;
  authority: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isMandatoryForNsfas: boolean;
  typicalValidityMonths: number;
}> = [
  {
    type: "OCCUPANCY_CERTIFICATE",
    title: "Municipal Certificate of Occupancy",
    shortLabel: "Occupancy Cert",
    authority: "Local Municipality / City Planning",
    description: "Legal permit from local council declaring premises structurally sound for student human habitation.",
    icon: LuBuilding2,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 60,
  },
  {
    type: "FIRE_SAFETY_CERTIFICATE",
    title: "Municipal Fire Safety & Prevention Certificate",
    shortLabel: "Fire Safety",
    authority: "Municipal Fire & Rescue Emergency Services",
    description: "Annual clearance verifying fire hydrants, smoke detectors, extinguishers, and illuminated exit signage.",
    icon: LuFlame,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 12,
  },
  {
    type: "ELECTRICAL_COC",
    title: "Electrical Certificate of Compliance (CoC)",
    shortLabel: "Electrical CoC",
    authority: "Department of Labour Registered Electrician",
    description: "Certified inspection ensuring electrical wiring, distribution boards, and plugs conform to SANS 10142.",
    icon: LuZap,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 24,
  },
  {
    type: "HEALTH_HYGIENE_CERTIFICATE",
    title: "Environmental Health & Sanitation Clearance",
    shortLabel: "Health & Hygiene",
    authority: "Municipal Environmental Health Department",
    description: "Sanitation audit covering communal kitchens, bathrooms, refuse disposal, and pest control management.",
    icon: LuShieldCheck,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 12,
  },
  {
    type: "BUILDING_INSURANCE_POLICY",
    title: "Structural & Public Liability Insurance",
    shortLabel: "Building Insurance",
    authority: "Licensed South African Insurer (FSCA)",
    description: "Comprehensive property insurance policy schedule covering student personal injury and building catastrophe.",
    icon: LuFileCheck,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 12,
  },
  {
    type: "TITLE_DEED_OR_LEASE",
    title: "Title Deed or Head Lease Owner Mandate",
    shortLabel: "Proof of Title",
    authority: "Deeds Office / Property Owner Mandate",
    description: "Verified proof that operator owns the property or holds a notarized head lease authorizing student sub-letting.",
    icon: LuFileText,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 36,
  },
  {
    type: "SECURITY_ARMED_RESPONSE_SLA",
    title: "24/7 Armed Response & Security SLA",
    shortLabel: "Security SLA",
    authority: "PSIRA Registered Armed Response Company",
    description: "Active SLA contract with private armed response firm providing panic button monitoring and biometric logs.",
    icon: LuLock,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 12,
  },
  {
    type: "BACKUP_POWER_GENERATOR_CERT",
    title: "Backup Power / Solar UPS Compliance Certificate",
    shortLabel: "Load Shedding Power",
    authority: "Certified Energy / Electrical Inspector",
    description: "Verification of continuous power backup for communal study areas and perimeter lighting during load shedding.",
    icon: LuZap,
    isMandatoryForNsfas: false,
    typicalValidityMonths: 24,
  },
  {
    type: "WATER_BACKUP_SANITATION_CERT",
    title: "Backup Water Supply & Jojo Tank Compliance",
    shortLabel: "Water Backup",
    authority: "Plumbing Industry Board (PIRB)",
    description: "Sanitary storage verification for municipal water outages ensuring pressurized flow to bathrooms and kitchens.",
    icon: LuDroplets,
    isMandatoryForNsfas: false,
    typicalValidityMonths: 24,
  },
  {
    type: "EMERGENCY_EVACUATION_PLAN",
    title: "Disaster Management & Evacuation Plan",
    shortLabel: "Evacuation Plan",
    authority: "Occupational Health & Safety (OHS) Practitioner",
    description: "Standardized emergency assembly point diagram, first aid protocols, and emergency warden assignments.",
    icon: LuShieldAlert,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 36,
  },
  {
    type: "NSFAS_ACCREDITATION_PROOF",
    title: "NSFAS / Institutional Housing Accreditation Letter",
    shortLabel: "NSFAS Accreditation",
    authority: "NSFAS Accommodation Directorate / University",
    description: "Official institutional letter certifying the residence meets the DHET Policy on the Minimum Norms and Standards.",
    icon: LuShieldCheck,
    isMandatoryForNsfas: true,
    typicalValidityMonths: 12,
  },
];

interface PropertyComplianceVaultProps {
  propertyId: string;
  initialDocs?: ComplianceDocItem[];
  isEditable?: boolean;
}

export default function PropertyComplianceVault({
  propertyId,
  initialDocs = [],
  isEditable = true,
}: PropertyComplianceVaultProps) {
  const [docs, setDocs] = useState<ComplianceDocItem[]>(initialDocs);
  const [activeUploadType, setActiveUploadType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ComplianceDocItem | null>(null);

  // Upload Modal Form State
  const [formState, setFormState] = useState({
    title: "",
    fileUrl: "",
    fileName: "",
    fileSizeBytes: 0,
    issuedDate: "",
    expiryDate: "",
    issuingBody: "",
    referenceNumber: "",
  });

  // Calculate audit score
  const validCount = docs.filter((d) => d.status === "VALID").length;
  const pendingCount = docs.filter((d) => d.status === "PENDING_AUDIT").length;
  const totalStandards = COMPLIANCE_STANDARDS.length;
  const compliancePercentage = Math.round((validCount / totalStandards) * 100);

  const handleOpenUpload = (std: typeof COMPLIANCE_STANDARDS[0]) => {
    const existing = docs.find((d) => d.documentType === std.type);
    setActiveUploadType(std.type);
    setUploadError(null);
    setFormState({
      title: existing?.title || std.title,
      fileUrl: existing?.fileUrl || "",
      fileName: existing?.fileName || "",
      fileSizeBytes: existing?.fileSizeBytes || 0,
      issuedDate: existing?.issuedDate
        ? new Date(existing.issuedDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      expiryDate: existing?.expiryDate
        ? new Date(existing.expiryDate).toISOString().split("T")[0]
        : new Date(Date.now() + std.typicalValidityMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      issuingBody: existing?.issuingBody || std.authority,
      referenceNumber: existing?.referenceNumber || "",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `properties/${propertyId}/compliance`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      setFormState((prev) => ({
        ...prev,
        fileUrl: data.url,
        fileName: file.name,
        fileSizeBytes: file.size,
      }));
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!activeUploadType) return;
    if (!formState.fileUrl) {
      setUploadError("Please upload a document file (.pdf, .jpg, .png)");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const res = await fetch(`/api/properties/${propertyId}/compliance-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: activeUploadType,
          title: formState.title,
          fileUrl: formState.fileUrl,
          fileName: formState.fileName,
          fileSizeBytes: formState.fileSizeBytes,
          issuedDate: formState.issuedDate || undefined,
          expiryDate: formState.expiryDate || undefined,
          issuingBody: formState.issuingBody || undefined,
          referenceNumber: formState.referenceNumber || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save compliance document");

      // Update local docs state
      setDocs((prev) => {
        const filtered = prev.filter((d) => d.documentType !== activeUploadType);
        return [data.doc, ...filtered];
      });

      setActiveUploadType(null);
    } catch (err: any) {
      setUploadError(err.message || "Failed to save document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this compliance certificate?")) return;

    try {
      const res = await fetch(`/api/properties/${propertyId}/compliance-docs/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete document");

      setDocs((prev) => prev.filter((d) => d.id !== docId));
    } catch (err: any) {
      alert(err.message || "Error deleting document");
    }
  };

  return (
    <div className="space-y-6 font-poppins">
      
      {/* 1. Audit Overview & Status Strip */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#005F56]/10 text-[#005F56] border border-[#005F56]/20 text-xs font-bold flex items-center gap-1">
                <LuShieldCheck className="w-3.5 h-3.5" /> 11-Point Regulatory Standard
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                DHET &amp; NSFAS Minimum Norms
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Residence Compliance &amp; Safety Certificate Vault
            </h2>
            <p className="text-xs text-slate-500">
              Official regulatory certificates verified by municipal inspectors and higher education accommodation directorates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Audit Compliance Score
              </span>
              <div className="flex items-baseline gap-1 justify-end mt-0.5">
                <span className="text-xl font-black text-[#005F56]">
                  {validCount} / {totalStandards}
                </span>
                <span className="text-xs font-bold text-slate-500">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Accreditation Readiness</span>
            <span className="font-bold text-[#005F56]">{compliancePercentage}% Compliant</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-[#005F56] rounded-full transition-all duration-500"
              style={{ width: `${compliancePercentage}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> {validCount} Valid Certificates
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> {pendingCount} Pending Inspection
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> {totalStandards - validCount - pendingCount} Missing Upload
            </span>
          </div>
        </div>
      </div>

      {/* 2. Standardized Document Vault Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPLIANCE_STANDARDS.map((std, idx) => {
          const doc = docs.find((d) => d.documentType === std.type);
          const isUploaded = !!doc;
          const Icon = std.icon;

          let statusBadge = (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
              Not Uploaded
            </span>
          );

          let expiryText = null;
          if (doc?.expiryDate) {
            const exp = new Date(doc.expiryDate);
            const now = new Date();
            const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysLeft < 0) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                  Expired
                </span>
              );
              expiryText = <span className="text-rose-600 font-bold">Expired {Math.abs(daysLeft)} days ago</span>;
            } else if (daysLeft <= 30) {
              statusBadge = (
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                  Expiring Soon
                </span>
              );
              expiryText = <span className="text-amber-600 font-bold">Expiring in {daysLeft} days</span>;
            } else {
              statusBadge = (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <LuShieldCheck className="w-3 h-3" /> Valid
                </span>
              );
              expiryText = <span className="text-slate-500">Expires {exp.toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}</span>;
            }
          } else if (isUploaded && doc.status === "PENDING_AUDIT") {
            statusBadge = (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                Pending Audit
              </span>
            );
          }

          return (
            <div
              key={std.type}
              className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                isUploaded
                  ? "bg-white border-slate-200 shadow-2xs hover:border-[#005F56]"
                  : "bg-slate-50/60 border-dashed border-slate-300"
              }`}
            >
              <div className="space-y-2.5">
                {/* Card Top Strip */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#005F56]/10 text-[#005F56] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 leading-tight">
                        {std.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                        {std.authority}
                      </span>
                    </div>
                  </div>
                  {statusBadge}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {std.description}
                </p>

                {/* Uploaded File Info */}
                {isUploaded && doc && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800 truncate">
                      <span className="truncate max-w-[200px] flex items-center gap-1">
                        <LuFileText className="w-3.5 h-3.5 text-[#005F56] shrink-0" />
                        <span className="truncate">{doc.fileName}</span>
                      </span>
                      {expiryText && <span className="text-[10px]">{expiryText}</span>}
                    </div>

                    {doc.referenceNumber && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Ref / Cert #: {doc.referenceNumber}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {std.isMandatoryForNsfas && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    NSFAS Mandatory
                  </span>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {isUploaded && doc && (
                    <>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#005F56] hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Preview Certificate"
                      >
                        <LuEye className="w-4 h-4" />
                      </button>

                      {isEditable && doc.id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id!)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Certificate"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}

                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => handleOpenUpload(std)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isUploaded
                          ? "bg-slate-100 hover:bg-[#005F56] text-slate-700 hover:text-white"
                          : "bg-[#005F56] hover:bg-[#004d46] text-white shadow-xs"
                      }`}
                    >
                      <LuUpload className="w-3.5 h-3.5" />
                      <span>{isUploaded ? "Replace Cert" : "Upload Cert"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: UPLOAD CERTIFICATE */}
      {/* ========================================================================= */}
      {activeUploadType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LuUpload className="w-4 h-4 text-[#005F56]" />
                  <span>Upload Compliance Certificate</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attach official certificate document for regulatory audit verification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveUploadType(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <LuShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* File Dropzone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Certificate Document File (.pdf, .png, .jpg) *
                </label>
                <div className="p-5 border-2 border-dashed border-slate-300 hover:border-[#005F56] rounded-xl text-center space-y-2 bg-slate-50/50">
                  <input
                    type="file"
                    id="compliance-file-input"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <LuFileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <label
                      htmlFor="compliance-file-input"
                      className="px-4 py-2 rounded-xl bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] transition-colors cursor-pointer inline-block"
                    >
                      {uploading ? "Uploading to Vault..." : "Browse Certificate File"}
                    </label>
                  </div>
                  {formState.fileName ? (
                    <p className="text-xs font-semibold text-emerald-700">
                      Selected: {formState.fileName}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">PDF, scanned copy, max 10MB</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Certificate Title / Label *
                </label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issuing Authority / Body
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. City of Johannesburg"
                    value={formState.issuingBody}
                    onChange={(e) => setFormState((p) => ({ ...p, issuingBody: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Certificate / Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. COC-2026-98102"
                    value={formState.referenceNumber}
                    onChange={(e) => setFormState((p) => ({ ...p, referenceNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={formState.issuedDate}
                    onChange={(e) => setFormState((p) => ({ ...p, issuedDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={formState.expiryDate}
                    onChange={(e) => setFormState((p) => ({ ...p, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveUploadType(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={uploading || !formState.fileUrl}
                onClick={handleSaveDocument}
                className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {uploading ? "Saving..." : "Save to Vault"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PREVIEW CERTIFICATE */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{previewDoc.title}</h3>
                <p className="text-[11px] text-slate-400">{previewDoc.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto bg-slate-100 flex items-center justify-center min-h-[400px]">
              {previewDoc.fileUrl.endsWith(".pdf") ? (
                <iframe
                  src={previewDoc.fileUrl}
                  title="PDF Preview"
                  className="w-full h-[500px] rounded-xl border border-slate-300"
                />
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-[500px] object-contain rounded-xl shadow-md"
                />
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {previewDoc.issuingBody ? `Issued by: ${previewDoc.issuingBody}` : "Certified Copy"}
              </span>
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#005F56] text-white font-bold hover:bg-[#004d46]"
              >
                Download Original &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

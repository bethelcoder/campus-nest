"use client";

import React, { useState } from "react";
import {
  LuShieldCheck,
  LuBuilding2,
  LuFileText,
  LuUpload,
  LuCheck,
  LuClock,
  LuDollarSign,
  LuCreditCard,
  LuUserCheck,
  LuSparkles,
  LuEye,
  LuInfo,
  LuShieldAlert,
  LuX,
} from "react-icons/lu";

export interface LandlordProfileData {
  id?: string;
  userId?: string;
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
  verificationStatus?: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "ACTION_REQUIRED" | "REJECTED";
  verificationNotes?: string | null;
  verifiedAt?: string | Date | null;
}

interface LandlordKycPanelProps {
  initialProfile?: LandlordProfileData | null;
  user?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
  };
  onProfileUpdated?: (updated: LandlordProfileData) => void;
}

export default function LandlordKycPanel({
  initialProfile,
  user,
  onProfileUpdated,
}: LandlordKycPanelProps) {
  const [profile, setProfile] = useState<LandlordProfileData>(initialProfile || {
    entityType: "PRIVATE_RESIDENCE",
    verificationStatus: "UNVERIFIED",
  });

  const [form, setForm] = useState({
    entityType: profile.entityType || "PRIVATE_RESIDENCE",
    companyName: profile.companyName || "",
    companyRegNumber: profile.companyRegNumber || "",
    cipcDocumentUrl: profile.cipcDocumentUrl || "",
    taxNumber: profile.taxNumber || "",
    taxPin: profile.taxPin || "",
    taxClearanceDocUrl: profile.taxClearanceDocUrl || "",
    businessAddress: profile.businessAddress || "",
    proofOfAddressDocUrl: profile.proofOfAddressDocUrl || "",
    contactPhone: profile.contactPhone || user?.phone || "",

    directorIdNumber: profile.directorIdNumber || "",
    directorIdDocUrl: profile.directorIdDocUrl || "",
    directorIdCertified: profile.directorIdCertified || false,

    bankName: profile.bankName || "Standard Bank",
    bankAccountType: profile.bankAccountType || "CHEQUE",
    bankAccountNumber: profile.bankAccountNumber || "",
    bankBranchCode: profile.bankBranchCode || "",
    bankConfirmationDocUrl: profile.bankConfirmationDocUrl || "",

    providerAssociationNo: profile.providerAssociationNo || "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload helper
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: "cipcDocumentUrl" | "taxClearanceDocUrl" | "proofOfAddressDocUrl" | "directorIdDocUrl" | "bankConfirmationDocUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldKey);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "landlord/kyc");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "File upload failed");

      setForm((prev) => ({
        ...prev,
        [fieldKey]: data.url,
      }));
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload document");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/landlord/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save verification profile");

      setProfile(data.profile);
      setSaveSuccess(true);
      if (onProfileUpdated) onProfileUpdated(data.profile);
    } catch (err: any) {
      setErrorMessage(err.message || "Error saving verification data");
    } finally {
      setSaving(false);
    }
  };

  const status = profile.verificationStatus || "UNVERIFIED";

  return (
    <div className="space-y-6 font-poppins max-w-5xl mx-auto pb-12">
      
      {/* 1. Top Status Banner */}
      <div className={`p-6 rounded-2xl border shadow-xs transition-all ${
        status === "VERIFIED"
          ? "bg-emerald-50/80 border-emerald-300"
          : status === "PENDING_REVIEW"
          ? "bg-amber-50/80 border-amber-300"
          : status === "ACTION_REQUIRED" || status === "REJECTED"
          ? "bg-rose-50/80 border-rose-300"
          : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                status === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : status === "PENDING_REVIEW"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}>
                <LuShieldCheck className="w-3.5 h-3.5" />
                {status === "VERIFIED"
                  ? "Accredited Housing Provider"
                  : status === "PENDING_REVIEW"
                  ? "KYC & Banking Under Audit"
                  : "Business KYC Required"}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">
                Direct NSFAS Disbursement Eligibility
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Landlord Business Verification &amp; Bank Mandate
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Institutions, bursary funds, and NSFAS require verified CIPC company records, certified director identification, and confirmed bank accounts before approving student leases and releasing allowance disbursements.
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
              status === "VERIFIED"
                ? "bg-emerald-600 text-white border-emerald-700"
                : status === "PENDING_REVIEW"
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-slate-900 text-white border-slate-900"
            }`}>
              Status: {status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Verification documents and banking details updated successfully. Profile submitted for compliance audit.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <LuShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Main KYC Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Business Identity & CIPC Registration */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuBuilding2 className="w-4 h-4 text-[#005F56]" />
              <span>1. Business &amp; Entity Identification</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Registered business details as recorded on the South African CIPC registrar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Legal Entity Structure *
              </label>
              <select
                value={form.entityType}
                onChange={(e) => setForm((p) => ({ ...p, entityType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
              >
                <option value="PRIVATE_RESIDENCE">Private Residence Operator</option>
                <option value="PTY_LTD">Private Company ((Pty) Ltd)</option>
                <option value="INDIVIDUAL">Sole Proprietor / Individual Owner</option>
                <option value="AGENCY">Accredited Property Management Agency</option>
                <option value="TRUST">Property Investment Trust</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Company / Trading Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rise Student Living (Pty) Ltd"
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                CIPC Registration Number (Enterprise #)
              </label>
              <input
                type="text"
                placeholder="e.g. 2021/123456/07"
                value={form.companyRegNumber}
                onChange={(e) => setForm((p) => ({ ...p, companyRegNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                SARS Tax Number / Tax Compliance PIN
              </label>
              <input
                type="text"
                placeholder="e.g. 9810284712 (or SARS PIN)"
                value={form.taxPin}
                onChange={(e) => setForm((p) => ({ ...p, taxPin: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Registered Business Physical Address
              </label>
              <input
                type="text"
                placeholder="e.g. 10 De Korte St, Braamfontein, Johannesburg, 2001"
                value={form.businessAddress}
                onChange={(e) => setForm((p) => ({ ...p, businessAddress: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>
          </div>

          {/* Document Upload Strip: CIPC + Tax Clearance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>CIPC Registration Document (COR14.3)</span>
                {form.cipcDocumentUrl && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Uploaded ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Scanned company registration certificate or CK document.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  id="cipc-doc-input"
                  accept=".pdf,.png,.jpg"
                  onChange={(e) => handleFileUpload(e, "cipcDocumentUrl")}
                  className="hidden"
                />
                <label
                  htmlFor="cipc-doc-input"
                  className="px-3 py-1.5 rounded-lg bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] cursor-pointer inline-flex items-center gap-1"
                >
                  <LuUpload className="w-3.5 h-3.5" />
                  <span>{uploadingField === "cipcDocumentUrl" ? "Uploading..." : "Upload CIPC Doc"}</span>
                </label>
                {form.cipcDocumentUrl && (
                  <a
                    href={form.cipcDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#005F56]"
                  >
                    <LuEye className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Proof of Business Address / Utility</span>
                {form.proofOfAddressDocUrl && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Uploaded ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Municipal utility bill or lease agreement (&lt; 3 months old).
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  id="poa-doc-input"
                  accept=".pdf,.png,.jpg"
                  onChange={(e) => handleFileUpload(e, "proofOfAddressDocUrl")}
                  className="hidden"
                />
                <label
                  htmlFor="poa-doc-input"
                  className="px-3 py-1.5 rounded-lg bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] cursor-pointer inline-flex items-center gap-1"
                >
                  <LuUpload className="w-3.5 h-3.5" />
                  <span>{uploadingField === "proofOfAddressDocUrl" ? "Uploading..." : "Upload Proof of Address"}</span>
                </label>
                {form.proofOfAddressDocUrl && (
                  <a
                    href={form.proofOfAddressDocUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#005F56]"
                  >
                    <LuEye className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Director / Principal Identification */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuUserCheck className="w-4 h-4 text-[#005F56]" />
              <span>2. Director &amp; Authorized Operator Identity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Certified identity verification of the legal owner, signatory director, or appointed accommodation manager.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Director / Signatory South African ID Number *
              </label>
              <input
                type="text"
                placeholder="13-digit South African ID Number"
                value={form.directorIdNumber}
                onChange={(e) => setForm((p) => ({ ...p, directorIdNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Direct Contact Cellphone
              </label>
              <input
                type="tel"
                placeholder="+27 82 123 4567"
                value={form.contactPhone}
                onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Certified Copy of Director ID Document</span>
              {form.directorIdDocUrl && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Uploaded ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Police / Commissioner of Oaths certified copy of green barcoded ID book or Smart ID Card (&lt; 3 months).
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="file"
                id="director-id-input"
                accept=".pdf,.png,.jpg"
                onChange={(e) => handleFileUpload(e, "directorIdDocUrl")}
                className="hidden"
              />
              <label
                htmlFor="director-id-input"
                className="px-3 py-1.5 rounded-lg bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] cursor-pointer inline-flex items-center gap-1"
              >
                <LuUpload className="w-3.5 h-3.5" />
                <span>{uploadingField === "directorIdDocUrl" ? "Uploading..." : "Upload Certified ID"}</span>
              </label>

              {form.directorIdDocUrl && (
                <a
                  href={form.directorIdDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#005F56]"
                >
                  <LuEye className="w-4 h-4" />
                </a>
              )}

              <label className="flex items-center gap-1.5 text-slate-700 text-xs font-medium cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={form.directorIdCertified}
                  onChange={(e) => setForm((p) => ({ ...p, directorIdCertified: e.target.checked }))}
                  className="rounded text-[#005F56] focus:ring-[#005F56]"
                />
                <span>Document contains official commissioner certification stamp</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Verified Banking Details for Direct NSFAS Disbursements */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuCreditCard className="w-4 h-4 text-[#005F56]" />
              <span>3. Banking Details &amp; Disbursement Mandate</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified corporate or trust bank account details for direct funder rent allowances and student EFT payments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Bank Name *
              </label>
              <select
                value={form.bankName}
                onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
              >
                <option value="Standard Bank">Standard Bank</option>
                <option value="First National Bank (FNB)">First National Bank (FNB)</option>
                <option value="ABSA Bank">ABSA Bank</option>
                <option value="Nedbank">Nedbank</option>
                <option value="Capitec Bank">Capitec Bank</option>
                <option value="Investec">Investec</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Account Type *
              </label>
              <select
                value={form.bankAccountType}
                onChange={(e) => setForm((p) => ({ ...p, bankAccountType: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
              >
                <option value="CHEQUE">Cheque / Current Account</option>
                <option value="BUSINESS">Business Account</option>
                <option value="SAVINGS">Savings Account</option>
                <option value="TRUST">Estate Agent / Legal Trust Account</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Account Number *
              </label>
              <input
                type="text"
                placeholder="e.g. 1019284719"
                value={form.bankAccountNumber}
                onChange={(e) => setForm((p) => ({ ...p, bankAccountNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Branch Code
              </label>
              <input
                type="text"
                placeholder="e.g. 250655"
                value={form.bankBranchCode}
                onChange={(e) => setForm((p) => ({ ...p, bankBranchCode: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
              />
            </div>
          </div>

          {/* Stamped Bank Letter Upload */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span>Official Stamped Bank Confirmation Letter</span>
              {form.bankConfirmationDocUrl && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Uploaded ✓
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Official bank statement header or stamped account confirmation letter (&lt; 3 months) showing account holder name matching company name.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="file"
                id="bank-letter-input"
                accept=".pdf,.png,.jpg"
                onChange={(e) => handleFileUpload(e, "bankConfirmationDocUrl")}
                className="hidden"
              />
              <label
                htmlFor="bank-letter-input"
                className="px-3 py-1.5 rounded-lg bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] cursor-pointer inline-flex items-center gap-1"
              >
                <LuUpload className="w-3.5 h-3.5" />
                <span>{uploadingField === "bankConfirmationDocUrl" ? "Uploading..." : "Upload Bank Letter"}</span>
              </label>
              {form.bankConfirmationDocUrl && (
                <a
                  href={form.bankConfirmationDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#005F56]"
                >
                  <LuEye className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
          <p className="text-xs text-slate-500">
            By submitting, you certify that all CIPC, tax, and banking documents provided are accurate and legal.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-md shadow-[#005F56]/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting KYC Audit...</span>
              </>
            ) : (
              <>
                <LuCheck className="w-4 h-4" />
                <span>Save &amp; Submit for Verification</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

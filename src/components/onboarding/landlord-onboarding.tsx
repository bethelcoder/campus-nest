"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuBuilding2,
  LuShieldCheck,
  LuPhone,
  LuLogOut,
  LuMapPin,
  LuLock,
  LuBuilding,
  LuInfo,
  LuCheck,
  LuSparkles,
  LuLayers
} from "react-icons/lu";

import { logOutFromFirebase } from "@/lib/firebase";

interface LandlordOnboardingProps {
  initialUser?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
    idNumber?: string | null;
    onboardingStep: number;
    onboardingCompleted: boolean;
  };
}

export default function LandlordOnboarding({ initialUser }: LandlordOnboardingProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Authenticated Read-Only Email
  const [authEmail, setAuthEmail] = useState(initialUser?.email || "landlord@example.com");

  // Provider Business Profile Form State
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    surname: initialUser?.surname || "",
    phone: initialUser?.phone || "",
    idNumber: initialUser?.idNumber || "",
    entityType: "PRIVATE_RESIDENCE" as "INDIVIDUAL" | "PRIVATE_RESIDENCE" | "AGENCY",
    companyName: "",
    companyRegNumber: "",
    taxNumber: "",
    businessAddress: "",
  });

  // Load draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        setFetchingDraft(true);
        const res = await fetch("/api/onboarding/landlord");
        if (res.ok) {
          const { user, profile } = await res.json();
          if (user?.onboardingCompleted) {
            window.location.href = "/dashboard/landlord";
            return;
          }

          if (user) {
            setAuthEmail(user.email || "landlord@example.com");
            setFormData((prev) => ({
              ...prev,
              name: user.name || prev.name,
              surname: user.surname || prev.surname,
              phone: user.phone || prev.phone,
              idNumber: user.idNumber || prev.idNumber,
            }));
          }

          if (profile) {
            setFormData((prev) => ({
              ...prev,
              entityType: (profile.entityType as any) || prev.entityType,
              companyName: profile.companyName || prev.companyName,
              companyRegNumber: profile.companyRegNumber || prev.companyRegNumber,
              taxNumber: profile.taxNumber || prev.taxNumber,
              businessAddress: profile.businessAddress || prev.businessAddress,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load landlord profile draft", e);
      } finally {
        setFetchingDraft(false);
      }
    }
    loadDraft();
  }, [router]);

  async function handleSignOut() {
    try {
      await logOutFromFirebase();
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/landlord/login";
    } catch {
      window.location.href = "/landlord/login";
    }
  }

  // Step Validation: Check mandatory fields
  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.surname.trim().length > 0 &&
    formData.phone.trim().length >= 5 &&
    formData.businessAddress.trim().length >= 3 &&
    (formData.entityType === "INDIVIDUAL" || (formData.companyName && formData.companyName.trim().length > 0)) &&
    termsAccepted;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      setError(termsAccepted ? "Please fill in all mandatory provider details." : "Please accept the CampusNest Terms and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to complete provider registration."
        );
      }

      window.location.href = data.redirect || "/dashboard/landlord";
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  if (fetchingDraft) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 font-poppins">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading provider profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-poppins flex flex-col justify-between p-4 sm:p-6 lg:p-10">
      {/* Top Main Container (2-Column Island Card Layout) */}
      <div className="max-w-[1200px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* ================= LEFT COLUMN SECTION: FLOATING ISLAND CARD ================= */}
        <aside className="lg:col-span-4 bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between relative overflow-hidden">
          {/* Decorative subtle ambient background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-50 blur-3xl pointer-events-none" />

          <div>
            {/* Header Brand */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
                <LuBuilding2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-gray-900">
                  Campus<span className="text-emerald-600">Nest</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Operator Portal</span>
              </div>
            </Link>

            {/* Authenticated Read-Only Email Pill */}
            <div className="mt-6 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <LuLock className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Verified Login Email
                  </span>
                  <span className="text-xs font-semibold text-gray-800 truncate" title={authEmail}>
                    {authEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Provider Accreditation Value Pillars */}
            <div className="mt-8 space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <LuShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">Accredited Provider Status</h4>
                    <p className="text-[11px] text-emerald-800/80 leading-relaxed mt-0.5">
                      Verify your business profile to publish listings and issue official lease confirmations for NSFAS &amp; bursaries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  <span>Unlimited student residence listings</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  <span>13-point safety inspection score badges</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  <span>Pre-screened verified student applications desk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out / Switch Account */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
            >
              <LuLogOut className="w-3.5 h-3.5" />
              <span>Switch account / Sign out</span>
            </button>
          </div>
        </aside>

        {/* ================= RIGHT COLUMN SECTION: PROVIDER PROFILE FORM ================= */}
        <main className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
              <LuSparkles className="w-3.5 h-3.5" /> Provider Account Setup
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Business &amp; Provider Profile
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-[540px]">
              Set up your operating identity as a verified accommodation provider. You can create and manage multiple student residences directly from your dashboard once completed.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <LuInfo className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Entity / Business Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Provider Operating Entity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: "INDIVIDUAL" as const,
                    title: "Individual Landlord",
                    desc: "Sole proprietor / Private property owner",
                    icon: <LuBuilding className="w-4 h-4 text-emerald-600" />,
                  },
                  {
                    id: "PRIVATE_RESIDENCE" as const,
                    title: "Private Residence",
                    desc: "Dedicated student hostel / residence entity",
                    icon: <LuBuilding2 className="w-4 h-4 text-emerald-600" />,
                  },
                  {
                    id: "AGENCY" as const,
                    title: "Property Agency",
                    desc: "Enterprise operator / Real estate agency",
                    icon: <LuLayers className="w-4 h-4 text-emerald-600" />,
                  },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all text-left ${
                      formData.entityType === opt.id
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="entityType"
                      value={opt.id}
                      checked={formData.entityType === opt.id}
                      onChange={() => setFormData({ ...formData, entityType: opt.id })}
                      className="sr-only"
                    />
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
                          {opt.icon}
                        </div>
                        {formData.entityType === opt.id && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                            <LuCheck className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-900 block">{opt.title}</span>
                      <span className="text-[10px] text-gray-500 leading-tight mt-0.5 block">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Operator Personal Details */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <span>1. Operator Identity</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sipho"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="e.g. Dlamini"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Direct Contact Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 082 123 4567"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                    />
                    <LuPhone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    RSA ID Number / Passport
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="13-digit RSA ID Number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>
              </div>
            </div>

            {/* Business / Trading Information */}
            <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                <span>2. Business Details &amp; Operating Address</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Company / Trading Name {formData.entityType !== "INDIVIDUAL" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={formData.entityType !== "INDIVIDUAL"}
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g. Apex Student Living (Pty) Ltd"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Company Reg Number (CIPC)
                  </label>
                  <input
                    type="text"
                    value={formData.companyRegNumber}
                    onChange={(e) => setFormData({ ...formData, companyRegNumber: e.target.value })}
                    placeholder="e.g. 2021/123456/07"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tax / SARS Reference Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.taxNumber}
                    onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Operating / Head Office Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.businessAddress}
                      onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                      placeholder="e.g. 45 Juta Street, Braamfontein, JHB"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs bg-white text-gray-800"
                    />
                    <LuMapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                You can create residence listings immediately after this step.
              </span>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Provider Portal...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile &amp; Open Portal</span>
                    <span className="text-sm">→</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <label className="flex items-start gap-3 text-xs leading-relaxed text-gray-700 cursor-pointer">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
                <span>I have read and agree to the CampusNest <Link href="/terms" target="_blank" className="font-semibold text-emerald-700 underline">Terms and Conditions</Link> and <Link href="/privacy" target="_blank" className="font-semibold text-emerald-700 underline">Privacy Policy</Link>.</span>
              </label>
              <label className="flex items-start gap-3 text-xs leading-relaxed text-gray-700 cursor-pointer">
                <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
                <span>I consent to receive CampusNest product updates, marketing emails, and relevant partner communications. You can opt out at any time.</span>
              </label>
            </div>

          </form>

        </main>

      </div>
    </div>
  );
}

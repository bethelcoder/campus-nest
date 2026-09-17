"use client";

import { useEffect, useState, useMemo, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuUser,
  LuBuilding2,
  LuShieldCheck,
  LuCheck,
  LuChevronLeft,
  LuCircleHelp,
  LuPhone,
  LuSparkles,
  LuLogOut,
  LuMapPin,
  LuFileText,
  LuFlame,
  LuLock,
  LuZap,
  LuBuilding,
  LuInfo,
  LuLayers
} from "react-icons/lu";

import { STANDARD_CHECKLIST, calculateSafetyScore, type ChecklistTemplateItem } from "@/lib/safety";
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

const SA_UNIVERSITIES = [
  "University of the Witwatersrand (Wits)",
  "University of Johannesburg (UJ)",
  "University of Cape Town (UCT)",
  "University of Pretoria (UP)",
  "Stellenbosch University (SU)",
  "University of KwaZulu-Natal (UKZN)",
  "University of the Western Cape (UWC)",
  "Nelson Mandela University (NMU)",
  "Rhodes University (RU)",
  "North-West University (NWU)",
  "Tshwane University of Technology (TUT)",
  "Cape Peninsula University of Technology (CPUT)",
  "Durban University of Technology (DUT)",
  "Central University of Technology (CUT)",
  "Sefako Makgatho Health Sciences University (SMU)",
  "Other Institution / College",
];

const AMENITY_OPTIONS = [
  { id: "WIFI", label: "High-Speed WiFi Included", icon: "📶" },
  { id: "BACKUP_POWER", label: "Backup Power / Inverter (Load-Shedding)", icon: "⚡" },
  { id: "BACKUP_WATER", label: "Backup Water Tanks", icon: "💧" },
  { id: "BIOMETRIC", label: "Biometric / Tag Access Control", icon: "🔒" },
  { id: "CCTV", label: "24/7 CCTV Surveillance", icon: "📹" },
  { id: "LAUNDRY", label: "On-site Laundry Facilities", icon: "🧺" },
  { id: "STUDY_ROOM", label: "Dedicated Quiet Study Area", icon: "📚" },
  { id: "FURNISHED", label: "Fully / Semi-Furnished Units", icon: "🛏️" },
];

const CATEGORY_LABELS: Record<string, string> = {
  SECURITY: "Perimeter & Access Security",
  FIRE_SAFETY: "Fire Safety & Emergency Exits",
  UTILITIES: "Utilities & Load-Shedding Resilience",
  BUILDING_STRUCTURE: "Structural & Weatherproofing",
  LOCATION_RISK: "Location & Transit Proximity",
};

interface ChecklistAnswerState {
  category: ChecklistTemplateItem["category"];
  label: string;
  weight: number;
  passed: boolean | null;
  notes?: string;
}

export default function LandlordOnboarding({ initialUser }: LandlordOnboardingProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(initialUser?.onboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Authenticated Read-Only Email
  const [authEmail, setAuthEmail] = useState(initialUser?.email || "landlord@example.com");

  // Step 1: Personal & Business Identity
  const [step1Data, setStep1Data] = useState({
    name: initialUser?.name || "",
    surname: initialUser?.surname || "",
    phone: initialUser?.phone || "",
    idNumber: initialUser?.idNumber || "",
    entityType: "INDIVIDUAL", // INDIVIDUAL, PRIVATE_RESIDENCE, AGENCY
    companyName: "",
    companyRegNumber: "",
  });

  // Step 2: Primary Residence Details
  const [step2Data, setStep2Data] = useState({
    draftResidenceName: "",
    draftAddress: "",
    draftSuburb: "",
    draftCity: "Johannesburg",
    draftNearestUniversity: "University of the Witwatersrand (Wits)",
    draftDistanceToCampus: "0.8",
    draftBedrooms: "4",
    draftPriceMonthly: "4800",
    draftAmenities: ["WIFI", "BIOMETRIC", "BACKUP_POWER", "LAUNDRY"] as string[],
  });

  // Step 3: Initial 13-Point Checklist Answers
  const [checklistAnswers, setChecklistAnswers] = useState<ChecklistAnswerState[]>(
    STANDARD_CHECKLIST.map((item) => ({
      category: item.category,
      label: item.label,
      weight: item.weight,
      passed: true,
      notes: "",
    }))
  );

  // Live Safety Score
  const liveSafetyScore = useMemo(() => {
    return calculateSafetyScore(checklistAnswers);
  }, [checklistAnswers]);

  // Load draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        setFetchingDraft(true);
        const res = await fetch("/api/onboarding/landlord");
        if (res.ok) {
          const { user, profile } = await res.json();
          if (user?.onboardingCompleted) {
            router.push("/dashboard/landlord");
            return;
          }

          if (user?.onboardingStep) {
            setCurrentStep(Math.min(user.onboardingStep, 3));
          }

          if (user) {
            setAuthEmail(user.email || "landlord@example.com");
            setStep1Data((prev) => ({
              ...prev,
              name: user.name || prev.name,
              surname: user.surname || prev.surname,
              phone: user.phone || prev.phone,
              idNumber: user.idNumber || prev.idNumber,
            }));
          }

          if (profile) {
            setStep1Data((prev) => ({
              ...prev,
              entityType: profile.entityType || prev.entityType,
              companyName: profile.companyName || prev.companyName,
              companyRegNumber: profile.companyRegNumber || prev.companyRegNumber,
            }));

            setStep2Data((prev) => ({
              ...prev,
              draftResidenceName: profile.draftResidenceName || prev.draftResidenceName,
              draftAddress: profile.draftAddress || prev.draftAddress,
              draftSuburb: profile.draftSuburb || prev.draftSuburb,
              draftCity: profile.draftCity || prev.draftCity,
              draftNearestUniversity: profile.draftNearestUniversity || prev.draftNearestUniversity,
              draftDistanceToCampus: profile.draftDistanceToCampus ? String(profile.draftDistanceToCampus) : prev.draftDistanceToCampus,
              draftBedrooms: profile.draftBedrooms ? String(profile.draftBedrooms) : prev.draftBedrooms,
              draftPriceMonthly: profile.draftPriceMonthly ? String(profile.draftPriceMonthly) : prev.draftPriceMonthly,
              draftAmenities: profile.draftAmenities?.length ? profile.draftAmenities : prev.draftAmenities,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load landlord onboarding draft:", e);
      } finally {
        setFetchingDraft(false);
      }
    }

    loadDraft();
  }, [router]);

  const isStep1Complete = Boolean(
    step1Data.name.trim() &&
    step1Data.surname.trim() &&
    step1Data.phone.trim().length >= 5 &&
    step1Data.entityType
  );

  const isStep2Complete = Boolean(
    step2Data.draftResidenceName.trim() &&
    step2Data.draftAddress.trim() &&
    step2Data.draftSuburb.trim() &&
    step2Data.draftCity.trim() &&
    Number(step2Data.draftBedrooms) >= 1 &&
    Number(step2Data.draftPriceMonthly) > 0
  );

  function toggleAmenity(id: string) {
    setStep2Data((prev) => ({
      ...prev,
      draftAmenities: prev.draftAmenities.includes(id)
        ? prev.draftAmenities.filter((a) => a !== id)
        : [...prev.draftAmenities, id],
    }));
  }

  function setChecklistAnswer(index: number, passed: boolean) {
    setChecklistAnswers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], passed };
      return copy;
    });
  }

  // Logout handler
  async function handleSignOut() {
    await logOutFromFirebase();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/landlord/login");
  }

  // Step 1 Submit
  async function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
    if (!isStep1Complete) {
      setError("Please fill in all mandatory identity and contact fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 1,
          data: step1Data,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : "Could not save step 1");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 Submit
  async function handleStep2Submit(e: FormEvent) {
    e.preventDefault();
    if (!isStep2Complete) {
      setError("Please provide your primary residence name, address, bedrooms, and rental rate.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2,
          data: {
            ...step2Data,
            draftDistanceToCampus: step2Data.draftDistanceToCampus ? Number(step2Data.draftDistanceToCampus) : null,
            draftBedrooms: Number(step2Data.draftBedrooms),
            draftPriceMonthly: Number(step2Data.draftPriceMonthly),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : "Could not save step 2");
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Step 3 Submit
  async function handleStep3Submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/landlord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          data: {
            checklistAnswers,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : "Could not complete accreditation");
        return;
      }
      router.push("/dashboard/landlord");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    {
      num: 1,
      title: "Personal & Business",
      desc: "Identity & operating credentials",
    },
    {
      num: 2,
      title: "Residence Details",
      desc: "Property name, location & pricing",
    },
    {
      num: 3,
      title: "Safety Checklist",
      desc: "13-point inspection & live score",
    },
  ];

  if (fetchingDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Restoring your landlord onboarding session...</p>
        </div>
      </div>
    );
  }

  const checklistByCategory = checklistAnswers.reduce<Record<string, Array<{ item: ChecklistAnswerState; index: number }>>>(
    (acc, item, index) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category].push({ item, index });
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-poppins flex flex-col md:flex-row p-3 md:p-5 gap-4 md:gap-8">
      {/* ----------------- LEFT ISLAND CARD (STICKY / FIXED) ----------------- */}
      <aside className="w-full md:w-[360px] lg:w-[400px] bg-white rounded-3xl border border-gray-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-7 md:p-9 flex flex-col justify-between shrink-0 md:sticky md:top-5 md:h-[calc(100vh-2.5rem)] z-10">
        <div>
          {/* Brand Logo Header */}
          <Link href="/landlord" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform shadow-sm">
              <LuBuilding2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                Campus<span className="text-emerald-600">Nest</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Landlord Accreditation</span>
            </div>
          </Link>

          {/* Authenticated Read-Only Email Pill */}
          <div className="mt-6 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <LuLock className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Verified Login Email</span>
                <span className="text-xs font-semibold text-gray-800 truncate" title={authEmail}>
                  {authEmail}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mt-8 space-y-6">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;

              return (
                <div key={step.num} className="relative flex items-start gap-3.5 group">
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-[15px] top-[32px] w-[2px] h-[calc(100%+8px)] transition-colors duration-300 ${currentStep > step.num ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                    />
                  )}

                  <div className="relative z-[1] shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm transition-all animate-fadeIn">
                        <LuCheck className="w-4 h-4 stroke-[2.8]" />
                      </div>
                    ) : isActive ? (
                      <div className="w-8 h-8 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center ring-4 ring-emerald-500/15 transition-all">
                        {step.num}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-400 font-semibold text-xs flex items-center justify-center">
                        {step.num}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col pt-0.5">
                    <span className={`text-sm font-semibold transition-colors ${isActive ? "text-gray-900 font-bold" : isCompleted ? "text-gray-800" : "text-gray-400"
                      }`}>
                      {step.title}
                    </span>
                    <span className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Left Action / Switch Account */}
        <div className="pt-6 md:pt-0 mt-8 md:mt-0 border-t md:border-t-0 border-gray-100">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all cursor-pointer"
          >
            <LuLogOut className="w-4 h-4 text-gray-500" /> Switch account / Sign out
          </button>
        </div>
      </aside>

      {/* ----------------- RIGHT CONTENT AREA (SCROLLABLE) ----------------- */}
      <main className="flex-1 flex flex-col justify-between py-6 px-4 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="max-w-[620px] w-full mx-auto my-auto py-4">
          {/* Header Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-sm mb-4">
              {currentStep === 1 && <LuUser className="w-7 h-7" />}
              {currentStep === 2 && <LuBuilding2 className="w-7 h-7" />}
              {currentStep === 3 && <LuShieldCheck className="w-7 h-7" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {currentStep === 1 && "Personal & Business Identity"}
              {currentStep === 2 && "Primary Residence Details"}
              {currentStep === 3 && "Property Safety Self-Assessment"}
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-[460px]">
              {currentStep === 1 && "Enter your identity and business details to register as an accredited accommodation partner."}
              {currentStep === 2 && "Tell us about your student residence, location, capacity, and available amenities."}
              {currentStep === 3 && "Complete the 13-point standard safety checklist to calculate your official Safety Score."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <LuInfo className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1 FORM (PERSONAL & BUSINESS IDENTITY) ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={step1Data.name}
                    onChange={(e) => setStep1Data({ ...step1Data, name: e.target.value })}
                    placeholder="e.g. Sipho"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Surname <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={step1Data.surname}
                    onChange={(e) => setStep1Data({ ...step1Data, surname: e.target.value })}
                    placeholder="e.g. Dlamini"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mobile Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={step1Data.phone}
                    onChange={(e) => setStep1Data({ ...step1Data, phone: e.target.value })}
                    placeholder="+27 82 123 4567"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    SA ID or Passport Number
                  </label>
                  <input
                    type="text"
                    value={step1Data.idNumber}
                    onChange={(e) => setStep1Data({ ...step1Data, idNumber: e.target.value })}
                    placeholder="e.g. 8501015024087"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Entity Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Operating Entity Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "INDIVIDUAL", label: "Individual Landlord", desc: "Private property owner" },
                    { id: "PRIVATE_RESIDENCE", label: "Private Residence", desc: "Dedicated student building" },
                    { id: "AGENCY", label: "Managing Agency", desc: "Property management firm" },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all text-left ${step1Data.entityType === opt.id
                          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="entityType"
                        value={opt.id}
                        checked={step1Data.entityType === opt.id}
                        onChange={(e) => setStep1Data({ ...step1Data, entityType: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{opt.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional Business/Company Fields */}
              {step1Data.entityType !== "INDIVIDUAL" && (
                <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Company / Organization Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Trading Name / Company Name
                      </label>
                      <input
                        type="text"
                        value={step1Data.companyName}
                        onChange={(e) => setStep1Data({ ...step1Data, companyName: e.target.value })}
                        placeholder="e.g. Apex Student Living (Pty) Ltd"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        CIPC Company Registration No.
                      </label>
                      <input
                        type="text"
                        value={step1Data.companyRegNumber}
                        onChange={(e) => setStep1Data({ ...step1Data, companyRegNumber: e.target.value })}
                        placeholder="e.g. 2021/892100/07"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || !isStep1Complete}
                  className="w-full bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving & continuing...</span>
                    </>
                  ) : (
                    <span>Continue to Residence Details</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2 FORM (RESIDENCE DETAILS) ================= */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Name of Residence / Building Title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={step2Data.draftResidenceName}
                  onChange={(e) => setStep2Data({ ...step2Data, draftResidenceName: e.target.value })}
                  placeholder="e.g. Braamfontein Student Loft or Apex Manor"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={step2Data.draftAddress}
                  onChange={(e) => setStep2Data({ ...step2Data, draftAddress: e.target.value })}
                  placeholder="e.g. 12 Juta Street"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Suburb <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={step2Data.draftSuburb}
                    onChange={(e) => setStep2Data({ ...step2Data, draftSuburb: e.target.value })}
                    placeholder="e.g. Braamfontein"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={step2Data.draftCity}
                    onChange={(e) => setStep2Data({ ...step2Data, draftCity: e.target.value })}
                    placeholder="e.g. Johannesburg"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nearest Target University / Campus
                  </label>
                  <select
                    value={step2Data.draftNearestUniversity}
                    onChange={(e) => setStep2Data({ ...step2Data, draftNearestUniversity: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    {SA_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Distance to Campus (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={step2Data.draftDistanceToCampus}
                    onChange={(e) => setStep2Data({ ...step2Data, draftDistanceToCampus: e.target.value })}
                    placeholder="e.g. 0.8"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Total Bedrooms / Beds <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={step2Data.draftBedrooms}
                    onChange={(e) => setStep2Data({ ...step2Data, draftBedrooms: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Base Monthly Price Per Bed (ZAR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="100"
                    step="0.01"
                    value={step2Data.draftPriceMonthly}
                    onChange={(e) => setStep2Data({ ...step2Data, draftPriceMonthly: e.target.value })}
                    placeholder="e.g. 4800.00"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Building Amenities &amp; Features
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const selected = step2Data.draftAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${selected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                      >
                        <span className="text-base">{amenity.icon}</span>
                        <span className="flex-1">{amenity.label}</span>
                        {selected && <LuCheck className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-1/3 py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LuChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading || !isStep2Complete}
                  className="w-2/3 bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Continue to Safety Checklist</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3 FORM (13-POINT SAFETY CHECKLIST) ================= */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-6">
              {/* Live Safety Score Gauge Header */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                    Real-Time Safety Accreditation
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-0.5">
                    Certified Safety Score Preview
                  </h3>
                  <p className="text-[11px] text-gray-300 mt-1 max-w-[340px]">
                    7.0+ qualifies for immediate VERIFIED status and official NSFAS letter generation.
                  </p>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-black text-2xl shadow-inner">
                    <LuShieldCheck className="w-6 h-6 text-emerald-400" />
                    <span>{liveSafetyScore !== null ? liveSafetyScore.toFixed(1) : "0.0"}</span>
                    <span className="text-xs text-emerald-400/80 font-normal">/10</span>
                  </div>
                </div>
              </div>

              {/* Categorized Checklist Items */}
              <div className="space-y-5">
                {Object.entries(checklistByCategory).map(([category, items]) => (
                  <div key={category} className="p-4 rounded-3xl border border-gray-200 bg-white shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                        {CATEGORY_LABELS[category] ?? category}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {items.map(({ item, index }) => (
                        <div
                          key={item.label}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-gray-50/70 border border-gray-100 gap-3"
                        >
                          <div className="flex-1 pr-2">
                            <p className="text-xs font-semibold text-gray-800 leading-snug">{item.label}</p>
                            <span className="text-[10px] text-gray-600 font-medium">Weight: {item.weight}x</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setChecklistAnswer(index, true)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${item.passed === true
                                  ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-emerald-50"
                                }`}
                            >
                              <LuCheck className="w-3.5 h-3.5" /> Pass
                            </button>

                            <button
                              type="button"
                              onClick={() => setChecklistAnswer(index, false)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${item.passed === false
                                  ? "bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/20"
                                  : "bg-white border border-gray-300 text-gray-600 hover:bg-rose-50"
                                }`}
                            >
                              ✕ Fail
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-1/3 py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LuChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating verified listing...</span>
                    </>
                  ) : (
                    <span>Complete Accreditation &amp; View Dashboard</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Pagination Dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`transition-all duration-300 ${currentStep === dot
                    ? "w-6 h-2 bg-emerald-600 rounded-full"
                    : "w-2 h-2 bg-gray-300 rounded-full"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Floating Help Trigger */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={() => setShowHelpModal(!showHelpModal)}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 shadow-lg text-gray-700 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-all hover:scale-105 group cursor-pointer"
            title="Need assistance with landlord onboarding?"
          >
            <LuCircleHelp className="w-6 h-6" />
          </button>

          {showHelpModal && (
            <div className="absolute bottom-16 right-0 w-80 p-5 rounded-2xl bg-white border border-gray-200 shadow-2xl animate-fadeIn text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <LuSparkles className="w-4 h-4 text-emerald-600" /> Landlord Accreditation Help
                </span>
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p>
                <strong>How does Safety Accreditation work?</strong>
                <br />
                Your answers to the 13 safety questions calculate your certified Safety Score. High-scoring properties receive priority student placement and fast university endorsement.
              </p>
              <p className="text-[11px] text-gray-500">
                Contact our inspection team at <span className="text-emerald-600 font-semibold">landlords@campusnest.co.za</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LuUser,
  LuGraduationCap,
  LuWallet,
  LuCheck,
  LuChevronLeft,
  LuCircleHelp,
  LuPhone,
  LuSparkles,
  LuLogOut,
  LuLock,
  LuUpload,
  LuFileText,
  LuInfo,
  LuShieldCheck
} from "react-icons/lu";

import { logOutFromFirebase } from "@/lib/firebase";

interface StudentOnboardingProps {
  initialUser?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
    idNumber?: string | null;
    universityEmail?: string | null;
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

const STANDARDIZED_FUNDING = [
  {
    id: "NSFAS",
    label: "NSFAS",
    desc: "National Student Financial Aid Scheme"
  },
  {
    id: "BURSARY",
    label: "Funded (Private Bursary)",
    desc: "Corporate, institutional, or foundation bursary (e.g. Sasol, Funza, Allan Gray)"
  },
  {
    id: "SELF_FUNDED",
    label: "Self-Funded",
    desc: "Family, self-sponsored, or private accommodation payment"
  },
];

export default function StudentOnboarding({ initialUser }: StudentOnboardingProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<number>(initialUser?.onboardingStep || 1);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingProofDoc, setUploadingProofDoc] = useState(false);
  const [fetchingDraft, setFetchingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Authenticated Read-Only Email
  const [authEmail, setAuthEmail] = useState(initialUser?.email || "student@example.com");

  // Step 1: Personal Details & Certified ID Verification
  const [step1Data, setStep1Data] = useState({
    name: initialUser?.name || "",
    surname: initialUser?.surname || "",
    dateOfBirth: "",
    gender: "",
    nationality: "South African",
    preferredLanguage: "English",
    idNumber: initialUser?.idNumber || "",
    idDocumentUrl: "",
    idDocumentName: "",
    idDocumentCertified: false,
    idCertificationDate: "",
  });

  // Step 2: Contact & Study Details
  const [step2Data, setStep2Data] = useState({
    phone: initialUser?.phone || "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "Parent / Guardian",
    currentAddress: "",
    city: "Johannesburg",
    province: "Gauteng",
    isEnrolled: true,
    universityName: "University of the Witwatersrand (Wits)",
    studentNumber: "",
    degreeProgram: "",
    yearOfStudy: "1st Year Undergraduate",
    proofOfRegistrationUrl: "",
    proofOfRegistrationName: "",
  });

  // Step 3: Funding & Household Details
  const [step3Data, setStep3Data] = useState({
    fundingType: "NSFAS",
    funderName: "NSFAS",
    funderReference: "",
    funderContactEmail: "",
    monthlyAllowance: "4800.00",
    monthlyBudget: "4800.00",
    householdIncomeBracket: "R0 - R350,000 (NSFAS Eligible)",
    guarantorName: "",
    guarantorPhone: "",
    guarantorRelationship: "Parent / Guardian",
  });

  // Load draft from backend on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        setFetchingDraft(true);
        const res = await fetch("/api/onboarding/student");
        if (res.ok) {
          const { user, profile } = await res.json();
          if (user?.onboardingCompleted) {
            window.location.href = "/dashboard/student";
            return;
          }

          if (user?.onboardingStep) {
            setCurrentStep(Math.min(user.onboardingStep, 3));
          }

          if (user) {
            setAuthEmail(user.email || "student@example.com");
            setStep1Data((prev) => ({
              ...prev,
              name: user.name || prev.name,
              surname: user.surname || prev.surname,
              idNumber: user.idNumber || prev.idNumber,
            }));
            setStep2Data((prev) => ({
              ...prev,
              phone: user.phone || prev.phone,
            }));
          }

          if (profile) {
            setStep1Data((prev) => ({
              ...prev,
              dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : prev.dateOfBirth,
              gender: profile.gender || prev.gender,
              nationality: profile.nationality || prev.nationality,
              preferredLanguage: profile.preferredLanguage || prev.preferredLanguage,
              idDocumentUrl: profile.idDocumentUrl || prev.idDocumentUrl,
              idDocumentName: profile.idDocumentName || prev.idDocumentName,
              idDocumentCertified: profile.idDocumentCertified ?? prev.idDocumentCertified,
              idCertificationDate: profile.idCertificationDate ? profile.idCertificationDate.slice(0, 10) : prev.idCertificationDate,
            }));

            setStep2Data((prev) => ({
              ...prev,
              emergencyContactName: profile.emergencyContactName || prev.emergencyContactName,
              emergencyContactPhone: profile.emergencyContactPhone || prev.emergencyContactPhone,
              emergencyContactRelationship: profile.emergencyContactRelationship || prev.emergencyContactRelationship,
              currentAddress: profile.currentAddress || prev.currentAddress,
              city: profile.city || prev.city,
              province: profile.province || prev.province,
              isEnrolled: profile.isEnrolled ?? prev.isEnrolled,
              universityName: profile.universityName || prev.universityName,
              studentNumber: profile.studentNumber || prev.studentNumber,
              degreeProgram: profile.degreeProgram || prev.degreeProgram,
              yearOfStudy: profile.yearOfStudy || prev.yearOfStudy,
              proofOfRegistrationUrl: profile.proofOfRegistrationUrl || prev.proofOfRegistrationUrl,
              proofOfRegistrationName: profile.proofOfRegistrationName || prev.proofOfRegistrationName,
            }));

            setStep3Data((prev) => ({
              ...prev,
              fundingType: profile.fundingType || prev.fundingType,
              funderName: profile.funderName || prev.funderName,
              funderReference: profile.funderReference || prev.funderReference,
              funderContactEmail: profile.funderContactEmail || prev.funderContactEmail,
              monthlyAllowance: profile.monthlyAllowance ? Number(profile.monthlyAllowance).toFixed(2) : prev.monthlyAllowance,
              monthlyBudget: profile.monthlyBudget ? Number(profile.monthlyBudget).toFixed(2) : prev.monthlyBudget,
              householdIncomeBracket: profile.householdIncomeBracket || prev.householdIncomeBracket,
              guarantorName: profile.guarantorName || prev.guarantorName,
              guarantorPhone: profile.guarantorPhone || prev.guarantorPhone,
              guarantorRelationship: profile.guarantorRelationship || prev.guarantorRelationship,
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load onboarding draft:", e);
      } finally {
        setFetchingDraft(false);
      }
    }

    loadDraft();
  }, [router]);

  // ID Certification 3-month validation helper
  const isCertificationDateValid = (dateStr: string) => {
    if (!dateStr) return false;
    const certDate = new Date(dateStr);
    if (isNaN(certDate.getTime())) return false;
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - certDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  };

  const isStep1Complete = Boolean(
    step1Data.name.trim() &&
    step1Data.surname.trim() &&
    step1Data.dateOfBirth &&
    step1Data.gender &&
    step1Data.nationality &&
    step1Data.idNumber.trim().length >= 6 &&
    step1Data.idDocumentUrl &&
    step1Data.idDocumentCertified &&
    isCertificationDateValid(step1Data.idCertificationDate)
  );

  const isStep2Complete = Boolean(
    step2Data.phone.trim().length >= 5 &&
    step2Data.emergencyContactName.trim() &&
    step2Data.emergencyContactPhone.trim().length >= 5 &&
    step2Data.emergencyContactRelationship.trim() &&
    step2Data.currentAddress.trim() &&
    step2Data.city.trim() &&
    step2Data.province.trim() &&
    (!step2Data.isEnrolled || (
      step2Data.universityName.trim() &&
      step2Data.studentNumber.trim() &&
      step2Data.degreeProgram.trim() &&
      step2Data.yearOfStudy.trim() &&
      step2Data.proofOfRegistrationUrl
    ))
  );

  const isStep3Complete = Boolean(
    step3Data.fundingType &&
    step3Data.householdIncomeBracket &&
    Number(step3Data.monthlyBudget) > 0 &&
    termsAccepted
  );

  // File Upload Handler with Vercel Blob
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Document size must be under 10MB.");
      return;
    }

    setError(null);
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "id-document");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "File upload failed.");
        return;
      }

      setStep1Data((prev) => ({
        ...prev,
        idDocumentUrl: data.url,
        idDocumentName: file.name,
      }));
    } catch {
      setError("Network error uploading document to storage.");
    } finally {
      setUploadingDoc(false);
    }
  }

  // File Upload Handler for Proof of Registration
  async function handleProofOfRegistrationUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Proof of registration document size must be under 10MB.");
      return;
    }

    setError(null);
    setUploadingProofDoc(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "proof-of-registration");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "File upload failed.");
        return;
      }

      setStep2Data((prev) => ({
        ...prev,
        proofOfRegistrationUrl: data.url,
        proofOfRegistrationName: file.name,
      }));
    } catch {
      setError("Network error uploading proof of registration document.");
    } finally {
      setUploadingProofDoc(false);
    }
  }

  // Sign out handler
  async function handleSignOut() {
    await logOutFromFirebase();
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  // Submit Step 1
  async function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
    if (!isStep1Complete) {
      setError("Please complete all mandatory personal and certified ID verification fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/student", {
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

  // Submit Step 2
  async function handleStep2Submit(e: FormEvent) {
    e.preventDefault();
    if (!isStep2Complete) {
      setError("Please complete all required contact & enrolment fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 2,
          data: step2Data,
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

  // Submit Step 3
  async function handleStep3Submit(e: FormEvent) {
    e.preventDefault();
    if (!isStep3Complete) {
      setError(termsAccepted ? "Please complete your funding scheme and enter a valid monthly budget." : "Please accept the CampusNest Terms and Privacy Policy to continue.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          data: {
            ...step3Data,
            monthlyBudget: parseFloat(step3Data.monthlyBudget) || 0,
            monthlyAllowance: step3Data.monthlyAllowance ? parseFloat(step3Data.monthlyAllowance) : null,
            funderName: step3Data.fundingType === "NSFAS" ? "NSFAS" : step3Data.funderName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : "Could not complete onboarding");
        setLoading(false);
        return;
      }
      window.location.href = "/dashboard/student";
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const steps = [
    {
      num: 1,
      title: "Personal & Certified ID",
      desc: "Profile & certified ID document (≤ 3 months)",
    },
    {
      num: 2,
      title: "Contact & study",
      desc: "Emergency contacts & university enrolment",
    },
    {
      num: 3,
      title: "Funding & budget",
      desc: "NSFAS, Bursary & monthly allowance",
    },
  ];

  if (fetchingDraft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Restoring your onboarding session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-poppins flex flex-col md:flex-row p-3 md:p-5 gap-4 md:gap-8">
      {/* ----------------- LEFT ISLAND CARD (STICKY / FIXED) ----------------- */}
      <aside className="w-full md:w-[360px] lg:w-[400px] bg-white rounded-3xl border border-gray-200/90 shadow-[0_2px_14px_rgba(0,0,0,0.03)] p-7 md:p-9 flex flex-col justify-between shrink-0 md:sticky md:top-5 md:h-[calc(100vh-2.5rem)] z-10">
        <div>
          {/* Brand Logo Header */}
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-gray-900">
                Campus<span className="text-emerald-600">Nest</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Student Verification</span>
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

        {/* Bottom Left Action / Logout */}
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
        <div className="max-w-[580px] w-full mx-auto my-auto py-4">
          {/* Header Badge */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-4">
              {currentStep === 1 && <LuUser className="w-7 h-7" />}
              {currentStep === 2 && <LuGraduationCap className="w-7 h-7" />}
              {currentStep === 3 && <LuWallet className="w-7 h-7" />}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {currentStep === 1 && "Personal & Certified ID Verification"}
              {currentStep === 2 && "Contact & study details"}
              {currentStep === 3 && "Funding & monthly budget"}
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-[440px]">
              {currentStep === 1 && "Submit your personal details and an officially certified copy of your South African ID or passport (stamped within 3 months)."}
              {currentStep === 2 && "Tell us your contact details and current university enrolment status."}
              {currentStep === 3 && "Specify your accommodation funding scheme and monthly living budget."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <LuInfo className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= STEP 1 FORM: PERSONAL & CERTIFIED ID ================= */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
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
                    placeholder="e.g. Tebogo"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
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
                    placeholder="e.g. Mabhele"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    value={step1Data.dateOfBirth}
                    onChange={(e) => setStep1Data({ ...step1Data, dateOfBirth: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={step1Data.gender}
                    onChange={(e) => setStep1Data({ ...step1Data, gender: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={step1Data.nationality}
                    onChange={(e) => setStep1Data({ ...step1Data, nationality: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="South African">South African</option>
                    <option value="SADC National">SADC Region (Zimbabwe, Namibia, Lesotho, etc.)</option>
                    <option value="International">Other International</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    value={step1Data.preferredLanguage}
                    onChange={(e) => setStep1Data({ ...step1Data, preferredLanguage: e.target.value })}
                    placeholder="e.g. English, isiZulu, Sesotho"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
              </div>

              {/* CERTIFIED ID VERIFICATION SECTION */}
              <div className="p-5 rounded-3xl border border-emerald-200/90 bg-emerald-50/40 space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <LuShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Official Certified ID Submission
                  </h3>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Per accreditation policy &amp; municipal bylaws, students must provide a certified copy of their RSA ID or Passport. The certification stamp cannot be older than 3 months.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    RSA ID Number / Passport Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={step1Data.idNumber}
                    onChange={(e) => setStep1Data({ ...step1Data, idNumber: e.target.value })}
                    placeholder="e.g. 020412 5089 087"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload to Vercel Blob */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Upload Certified ID Copy (PDF/JPG/PNG) <span className="text-red-500">*</span>
                    </label>
                    <label className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-dashed border-emerald-300 bg-white hover:bg-emerald-50/50 cursor-pointer transition-colors text-center">
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploadingDoc ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold py-1">
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          <span>Uploading to Vercel Blob...</span>
                        </div>
                      ) : step1Data.idDocumentUrl ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold py-1">
                          <LuFileText className="w-4 h-4" />
                          <span className="truncate max-w-[170px]">{step1Data.idDocumentName || "ID-Document.pdf"}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Saved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold py-1">
                          <LuUpload className="w-4 h-4 text-emerald-600" />
                          <span>Choose File (Max 10MB)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Certification Stamp Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Certification Stamp Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      value={step1Data.idCertificationDate}
                      onChange={(e) => setStep1Data({ ...step1Data, idCertificationDate: e.target.value })}
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    {step1Data.idCertificationDate && !isCertificationDateValid(step1Data.idCertificationDate) && (
                      <p className="text-[10px] text-red-600 font-semibold mt-1">
                        Certification stamp must be within the last 3 months (90 days).
                      </p>
                    )}
                  </div>
                </div>

                {/* Commissioner of Oaths Declaration */}
                <label className="flex items-start gap-2.5 pt-2 border-t border-emerald-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step1Data.idDocumentCertified}
                    onChange={(e) => setStep1Data({ ...step1Data, idDocumentCertified: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-gray-700 font-medium leading-relaxed">
                    I confirm this is an officially certified copy of my South African ID or passport stamped by a Commissioner of Oaths (SAP/Post Office) no older than 3 months.
                  </span>
                </label>
              </div>

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
                    <span>Continue to Contact & Study</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2 FORM: CONTACT & ENROLMENT ================= */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Primary Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <LuPhone className="w-4 h-4" />
                    </div>
                    <input
                      required
                      type="tel"
                      value={step2Data.phone}
                      onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                      placeholder="+27 71 234 5678"
                      className="w-full rounded-2xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Emergency Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={step2Data.emergencyContactName}
                      onChange={(e) => setStep2Data({ ...step2Data, emergencyContactName: e.target.value })}
                      placeholder="e.g. Nomvula Mabhele"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Emergency Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={step2Data.emergencyContactPhone}
                      onChange={(e) => setStep2Data({ ...step2Data, emergencyContactPhone: e.target.value })}
                      placeholder="+27 82 987 6543"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Home Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={step2Data.currentAddress}
                      onChange={(e) => setStep2Data({ ...step2Data, currentAddress: e.target.value })}
                      placeholder="Street address & suburb"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={step2Data.city}
                      onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                      placeholder="e.g. Johannesburg"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ENROLLED STUDENT CHECKBOX CARD */}
              <div className="p-5 rounded-3xl border border-emerald-200/80 bg-emerald-50/40 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step2Data.isEnrolled}
                    onChange={(e) => setStep2Data({ ...step2Data, isEnrolled: e.target.checked })}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">
                      I am currently an enrolled student at a South African higher education institution
                    </span>
                    <span className="text-[11px] text-gray-500 leading-normal block mt-0.5">
                      Check this to link your university details and generate official accommodation confirmation letters.
                    </span>
                  </div>
                </label>

                {step2Data.isEnrolled && (
                  <div className="pt-3 border-t border-emerald-100 space-y-4 animate-fadeIn">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        University / Tertiary Institution <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={step2Data.universityName}
                        onChange={(e) => setStep2Data({ ...step2Data, universityName: e.target.value })}
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      >
                        {SA_UNIVERSITIES.map((uni) => (
                          <option key={uni} value={uni}>{uni}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Student Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="text"
                          value={step2Data.studentNumber}
                          onChange={(e) => setStep2Data({ ...step2Data, studentNumber: e.target.value })}
                          placeholder="e.g. 2489012"
                          className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          Year of Study <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={step2Data.yearOfStudy}
                          onChange={(e) => setStep2Data({ ...step2Data, yearOfStudy: e.target.value })}
                          className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        >
                          <option value="1st Year Undergraduate">1st Year Undergraduate</option>
                          <option value="2nd Year Undergraduate">2nd Year Undergraduate</option>
                          <option value="3rd Year Undergraduate">3rd Year Undergraduate</option>
                          <option value="4th Year / Honours">4th Year / Honours</option>
                          <option value="Postgraduate / Masters / PhD">Postgraduate / Masters / PhD</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Degree / Qualification Program <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={step2Data.degreeProgram}
                        onChange={(e) => setStep2Data({ ...step2Data, degreeProgram: e.target.value })}
                        placeholder="e.g. BSc Computer Science & Mathematics"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    {/* PROOF OF REGISTRATION DOCUMENT UPLOAD */}
                    <div className="pt-3 border-t border-emerald-100 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Official Proof of Registration (Current Academic Year) <span className="text-red-500">*</span>
                        </label>
                        <p className="text-[11px] text-gray-500 mb-2">
                          Upload your university-stamped Proof of Registration document (PDF, PNG, or JPG up to 10MB).
                        </p>
                      </div>

                      {step2Data.proofOfRegistrationUrl ? (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <LuFileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-gray-900 truncate">
                                {step2Data.proofOfRegistrationName || "Proof-of-Registration.pdf"}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                <LuCheck className="w-3 h-3 stroke-[3]" /> Document Attached
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={step2Data.proofOfRegistrationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all"
                            >
                              View
                            </a>
                            <label className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer transition-all">
                              Change
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleProofOfRegistrationUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className={`group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                          uploadingProofDoc
                            ? "border-emerald-300 bg-emerald-50/50"
                            : "border-gray-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/20"
                        }`}>
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={handleProofOfRegistrationUpload}
                            disabled={uploadingProofDoc}
                            className="hidden"
                          />
                          {uploadingProofDoc ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-semibold text-emerald-700">Uploading document to storage...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center">
                              <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-sm">
                                <LuUpload className="w-5 h-5" />
                              </div>
                              <span className="text-xs font-bold text-gray-800">
                                Click to upload Proof of Registration
                              </span>
                              <span className="text-[10px] text-gray-400 mt-0.5">
                                PDF, JPEG or PNG (Max 10MB)
                              </span>
                            </div>
                          )}
                        </label>
                      )}
                    </div>
                  </div>
                )}
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
                    <span>Continue to Funding &amp; Budget</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3 FORM: FUNDING, HOUSEHOLD & 2-DECIMAL BUDGET ================= */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Accommodation Funding Scheme <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2.5">
                  {STANDARDIZED_FUNDING.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${step3Data.fundingType === opt.id
                          ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/10 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                    >
                      <input
                        type="radio"
                        name="fundingType"
                        value={opt.id}
                        checked={step3Data.fundingType === opt.id}
                        onChange={(e) => setStep3Data({ ...step3Data, fundingType: e.target.value })}
                        className="mt-0.5 h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">{opt.label}</span>
                        <span className="text-[11px] text-gray-500 block mt-0.5">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Monthly Budget / Allowance with 2 Decimals */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800">
                    Monthly Accommodation Budget / Allowance <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    ZAR (2 decimals)
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                    R
                  </span>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={step3Data.monthlyBudget}
                    onChange={(e) => setStep3Data({ ...step3Data, monthlyBudget: e.target.value, monthlyAllowance: e.target.value })}
                    placeholder="4800.00"
                    className="w-full rounded-2xl border border-gray-300 bg-[#fbfcfd] pl-9 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  />
                </div>
                <p className="text-[11px] text-gray-500">
                  Enter your monthly budget cap or bursary allocation limit (e.g. 4850.00).
                </p>
              </div>

              {/* NSFAS Ref */}
              {step3Data.fundingType === "NSFAS" && (
                <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-3 animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    NSFAS Application Reference
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      NSFAS Reference / Student ID
                    </label>
                    <input
                      type="text"
                      value={step3Data.funderReference}
                      onChange={(e) => setStep3Data({ ...step3Data, funderReference: e.target.value })}
                      placeholder="e.g. NSFAS-2026-89102"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Private Bursary Fields */}
              {step3Data.fundingType === "BURSARY" && (
                <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Bursary &amp; Sponsor Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Bursary / Scheme Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={step3Data.funderName}
                        onChange={(e) => setStep3Data({ ...step3Data, funderName: e.target.value })}
                        placeholder="e.g. Sasol Foundation Bursary"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Bursary Reference / Student ID
                      </label>
                      <input
                        type="text"
                        value={step3Data.funderReference}
                        onChange={(e) => setStep3Data({ ...step3Data, funderReference: e.target.value })}
                        placeholder="e.g. SASOL-BUR-2026"
                        className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Bursary Contact / Officer Email <span className="text-xs text-gray-400 font-normal">(for letter dispatch)</span>
                    </label>
                    <input
                      type="email"
                      value={step3Data.funderContactEmail}
                      onChange={(e) => setStep3Data({ ...step3Data, funderContactEmail: e.target.value })}
                      placeholder="bursaries@sponsor.co.za"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Household Income & Guarantor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Estimated Annual Household Income Bracket <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={step3Data.householdIncomeBracket}
                    onChange={(e) => setStep3Data({ ...step3Data, householdIncomeBracket: e.target.value })}
                    className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  >
                    <option value="R0 - R350,000 (NSFAS Eligible)">R0 - R350,000 (NSFAS Tier)</option>
                    <option value="R350,001 - R600,000 (Missing Middle)">R350,001 - R600,000 (Missing Middle Scheme)</option>
                    <option value="R600,001 - R1,000,000">R600,001 - R1,000,000</option>
                    <option value="Above R1,000,000">Above R1,000,000</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Financial Guarantor Name
                    </label>
                    <input
                      type="text"
                      value={step3Data.guarantorName}
                      onChange={(e) => setStep3Data({ ...step3Data, guarantorName: e.target.value })}
                      placeholder="e.g. Sipho Mabhele"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Guarantor Phone Number
                    </label>
                    <input
                      type="tel"
                      value={step3Data.guarantorPhone}
                      onChange={(e) => setStep3Data({ ...step3Data, guarantorPhone: e.target.value })}
                      placeholder="+27 83 111 2233"
                      className="w-full rounded-2xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                </div>
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
                  disabled={loading || !isStep3Complete}
                  className="w-2/3 bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Completing setup...</span>
                    </>
                  ) : (
                    <span>Finish &amp; Go to Dashboard</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Step Indicator */}
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

        {/* Floating Help Modal Trigger */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={() => setShowHelpModal(!showHelpModal)}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 shadow-lg text-gray-700 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-all hover:scale-105 group cursor-pointer"
            title="Need assistance with onboarding?"
          >
            <LuCircleHelp className="w-6 h-6" />
          </button>

          {showHelpModal && (
            <div className="absolute bottom-16 right-0 w-80 p-5 rounded-2xl bg-white border border-gray-200 shadow-2xl animate-fadeIn text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <LuSparkles className="w-4 h-4 text-emerald-600" /> Need Help?
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
                <strong>Why do we collect certified documents?</strong>
                <br />
                CampusNest guarantees housing safety and accreditation. Certified IDs ensure compliance with funder mandates and prevent fraud.
              </p>
              <p className="text-[11px] text-gray-500">
                If you encounter any issue, contact support at <span className="text-emerald-600 font-semibold">support@campusnest.co.za</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

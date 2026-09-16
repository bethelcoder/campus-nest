"use client";

import { useEffect, useState, useRef, FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LuUser, 
  LuGraduationCap, 
  LuWallet, 
  LuCheck, 
  LuChevronLeft, 
  LuCircleHelp, 
  LuMail, 
  LuPhone, 
  LuSparkles, 
  LuLogOut,
  LuShieldCheck,
  LuSend
} from "react-icons/lu";

interface StudentOnboardingProps {
  initialUser?: {
    id: string;
    name: string;
    surname: string;
    email: string;
    phone?: string | null;
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
  const [fetchingDraft, setFetchingDraft] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // OTP State for University Email (Step 2)
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Personal Details
  const [step1Data, setStep1Data] = useState({
    name: initialUser?.name || "",
    surname: initialUser?.surname || "",
    dateOfBirth: "",
    gender: "",
    nationality: "South African",
    preferredLanguage: "English",
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
    universityEmail: initialUser?.universityEmail || "",
  });

  // Step 3: Funding & Household Details (Standardized)
  const [step3Data, setStep3Data] = useState({
    fundingType: "NSFAS",
    funderName: "NSFAS",
    funderReference: "",
    funderContactEmail: "",
    householdIncomeBracket: "R0 - R350,000 (NSFAS Eligible)",
    guarantorName: "",
    guarantorPhone: "",
    guarantorRelationship: "Parent / Guardian",
  });

  // Fetch initial draft from backend on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        setFetchingDraft(true);
        const res = await fetch("/api/onboarding/student");
        if (res.ok) {
          const { user, profile } = await res.json();
          if (user?.onboardingCompleted) {
            router.push("/dashboard");
            return;
          }

          if (user?.onboardingStep) {
            setCurrentStep(Math.min(user.onboardingStep, 3));
          }

          if (user) {
            setStep1Data((prev) => ({
              ...prev,
              name: user.name || prev.name,
              surname: user.surname || prev.surname,
            }));
            setStep2Data((prev) => ({
              ...prev,
              phone: user.phone || prev.phone,
              universityEmail: user.universityEmail || prev.universityEmail,
            }));
          }

          if (profile) {
            setStep1Data((prev) => ({
              ...prev,
              dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : prev.dateOfBirth,
              gender: profile.gender || prev.gender,
              nationality: profile.nationality || prev.nationality,
              preferredLanguage: profile.preferredLanguage || prev.preferredLanguage,
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
            }));

            setStep3Data((prev) => ({
              ...prev,
              fundingType: profile.fundingType || prev.fundingType,
              funderName: profile.funderName || prev.funderName,
              funderReference: profile.funderReference || prev.funderReference,
              funderContactEmail: profile.funderContactEmail || prev.funderContactEmail,
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

  // Handler for Send OTP button
  async function handleSendOtp() {
    if (!step2Data.universityEmail || !step2Data.universityEmail.includes("@")) {
      setError("Please enter a valid university email address first.");
      return;
    }
    setError(null);
    setSendingOtp(true);
    setOtpNotice(null);
    try {
      // Simulate sending OTP or trigger backend
      setTimeout(() => {
        setOtpSent(true);
        setSendingOtp(false);
        setOtpNotice(`A 6-digit verification code was sent to ${step2Data.universityEmail}`);
        // Focus first OTP box
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      }, 700);
    } catch {
      setError("Could not dispatch verification code. Please try again.");
      setSendingOtp(false);
    }
  }

  // Handlers for 6-block OTP input
  function handleOtpChange(index: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;

    const nextDigits = [...otpDigits];
    nextDigits[index] = clean ? clean.slice(-1) : "";
    setOtpDigits(nextDigits);

    // Auto-advance to next input box
    if (clean && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit check upon typing all 6 digits
    const fullCode = nextDigits.join("");
    if (fullCode.length === 6) {
      handleAutoVerifyOtp(fullCode);
    }
  }

  function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => {
      if (i < 6) nextDigits[i] = char;
    });
    setOtpDigits(nextDigits);

    if (pasted.length === 6) {
      handleAutoVerifyOtp(pasted);
    } else {
      const nextFocus = Math.min(pasted.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  }

  function handleAutoVerifyOtp(code: string) {
    // Demo / placeholder verification feedback
    setOtpVerified(true);
    setOtpNotice("University email verified successfully!");
  }

  // Submit Step 1
  async function handleStep1Submit(e: FormEvent) {
    e.preventDefault();
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
            // Automatically normalize funderName for NSFAS
            funderName: step3Data.fundingType === "NSFAS" ? "NSFAS" : step3Data.funderName,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? (typeof data.error === "string" ? data.error : JSON.stringify(data.error)) : "Could not complete onboarding");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const steps = [
    {
      num: 1,
      title: "Personal details",
      desc: "Provide your basic profile information",
    },
    {
      num: 2,
      title: "Contact & study",
      desc: "Emergency contacts & university enrolment",
    },
    {
      num: 3,
      title: "Funding & household",
      desc: "NSFAS, Bursary or Self-funded details",
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

          {/* Stepper Progress */}
          <div className="mt-10 md:mt-14 space-y-6">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;

              return (
                <div key={step.num} className="relative flex items-start gap-3.5 group">
                  {/* Vertical connector line */}
                  {idx < steps.length - 1 && (
                    <div 
                      className={`absolute left-[15px] top-[32px] w-[2px] h-[calc(100%+8px)] transition-colors duration-300 ${
                        currentStep > step.num ? "bg-emerald-600" : "bg-gray-200"
                      }`} 
                    />
                  )}

                  {/* Indicator Icon */}
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

                  {/* Step Text */}
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-sm font-semibold transition-colors ${
                      isActive ? "text-gray-900 font-bold" : isCompleted ? "text-gray-800" : "text-gray-400"
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
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all"
          >
            <LuLogOut className="w-4 h-4 text-gray-500" /> Already have an account? Sign in
          </Link>
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
              {currentStep === 1 && "Personal details"}
              {currentStep === 2 && "Contact & study details"}
              {currentStep === 3 && "Funding & household details"}
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-[420px]">
              {currentStep === 1 && "Please provide your personal information to set up your verified profile."}
              {currentStep === 2 && "Tell us your contact details and current university enrolment status."}
              {currentStep === 3 && "Select your funding structure for accommodation accreditation."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 leading-relaxed animate-fadeIn">
              {error}
            </div>
          )}

          {/* ================= STEP 1 FORM ================= */}
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

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
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

          {/* ================= STEP 2 FORM ================= */}
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

                {/* Conditional University Enrolment Fields */}
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

                    {/* UNIVERSITY EMAIL WITH INLINE SEND OTP + 6-BLOCK OTP INPUT */}
                    <div className="pt-2 border-t border-emerald-100">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        University Email Address <span className="text-xs text-gray-400 font-normal">(@...ac.za)</span>
                      </label>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <LuMail className="w-4 h-4" />
                          </div>
                          <input
                            type="email"
                            value={step2Data.universityEmail}
                            onChange={(e) => {
                              setStep2Data({ ...step2Data, universityEmail: e.target.value });
                              setOtpVerified(false);
                            }}
                            placeholder="e.g. student@students.wits.ac.za"
                            className="w-full rounded-2xl border border-gray-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={!step2Data.universityEmail || sendingOtp}
                          className="shrink-0 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingOtp ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : otpSent ? (
                            "Resend OTP"
                          ) : (
                            <>
                              <LuSend className="w-3.5 h-3.5" /> Send OTP
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-1">
                        Used to verify your student standing for official funder endorsement.
                      </p>

                      {/* 6-Block OTP Input Layout */}
                      {otpSent && (
                        <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-white shadow-sm space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                              <LuShieldCheck className="w-4 h-4 text-emerald-600" /> Enter 6-Digit Code
                            </span>
                            {otpNotice && (
                              <span className="text-[10px] text-emerald-700 font-medium">{otpNotice}</span>
                            )}
                          </div>

                          <div className="flex justify-between gap-2 max-w-[320px] mx-auto py-1">
                            {otpDigits.map((digit, idx) => (
                              <input
                                key={idx}
                                ref={(el) => { otpInputRefs.current[idx] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                onPaste={handleOtpPaste}
                                className="w-11 h-12 text-center text-lg font-bold text-gray-900 bg-[#fbfcfd] border border-gray-300 rounded-xl shadow-inner focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 focus:outline-none transition-all"
                              />
                            ))}
                          </div>

                          {otpVerified && (
                            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
                              <LuCheck className="w-4 h-4 text-emerald-600 stroke-[3]" /> University Email Code Verified
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-1/3 py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <LuChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Continue to Funding</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 3 FORM (STANDARDIZED: NSFAS, BURSARY, SELF-FUNDED) ================= */}
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
                      className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                        step3Data.fundingType === opt.id
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

              {/* 1. NSFAS SUB-FIELDS: Only Reference/Application ID */}
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
                    <p className="text-[11px] text-gray-500 mt-1">
                      Enables automatic matching with NSFAS accommodation disbursement allowances.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. PRIVATE BURSARY SUB-FIELDS: Name + Ref + Email */}
              {step3Data.fundingType === "BURSARY" && (
                <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm space-y-4 animate-fadeIn">
                  <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Bursary & Sponsor Details
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

              {/* 3. SELF-FUNDED / HOUSEHOLD DETAILS */}
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
                  className="w-1/3 py-3 px-4 rounded-2xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <LuChevronLeft className="w-4 h-4" /> Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-[#099250] hover:bg-[#087a43] text-white font-semibold py-3 px-5 rounded-2xl shadow-sm hover:shadow text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Completing setup...</span>
                    </>
                  ) : (
                    <span>Finish & Go to Dashboard</span>
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
                className={`transition-all duration-300 ${
                  currentStep === dot
                    ? "w-6 h-2 bg-emerald-600 rounded-full"
                    : "w-2 h-2 bg-gray-300 rounded-full"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Floating Help / Support Trigger in Bottom Right */}
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={() => setShowHelpModal(!showHelpModal)}
            className="w-12 h-12 rounded-2xl bg-white border border-gray-200/90 shadow-lg text-gray-700 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-all hover:scale-105 group"
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
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <p>
                <strong>Why do we collect this info?</strong>
                <br />
                CampusNest uses your study and funder details to auto-generate official Tenancy Confirmation letters for bursaries like NSFAS.
              </p>
              <p className="text-[11px] text-gray-500">
                If you encounter any issue, contact our support team at <span className="text-emerald-600 font-semibold">support@campusnest.co.za</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

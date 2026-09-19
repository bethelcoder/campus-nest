"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { loginWithGoogle } from "@/lib/firebase";
import { formatSrcAlias } from "@/lib/auth";

type Role = "STUDENT" | "LANDLORD" | "SRC_REPRESENTATIVE";
type Mode = "login" | "register";

const roleCopy = {
  STUDENT: {
    eyebrow: "Find your next place",
    title: "Housing that helps you settle in.",
    description:
      "Compare verified residences, check safety details, and find a home close to campus.",
    points: [
      "Verified student-friendly residences",
      "Safety scores you can understand",
      "A simpler way to move closer to campus",
    ],
    loginPrompt: "Looking for a place to list?",
    loginLink: "Landlord sign in",
  },
  LANDLORD: {
    eyebrow: "Grow your residence",
    title: "Reach students who are ready to move.",
    description:
      "Create a trusted listing, show what makes your residence safe, and manage student interest in one place.",
    points: [
      "Showcase your residence with confidence",
      "Complete a clear safety checklist",
      "Manage applications from one dashboard",
    ],
    loginPrompt: "Searching for student housing?",
    loginLink: "Student sign in",
  },
  SRC_REPRESENTATIVE: {
    eyebrow: "Support student rights",
    title: "Help students resolve housing issues.",
    description:
      "Review escalated residence complaints and coordinate timely support for students.",
    points: [
      "See escalated complaints in one queue",
      "Coordinate intervention with landlords",
      "Track urgent cases through resolution",
    ],
    loginPrompt: "Looking for student housing?",
    loginLink: "Student sign in",
  },
} as const;

export default function AuthPage({ role, mode }: { role: Role; mode: Mode }) {
  const copy = roleCopy[role];
  const isRegister = mode === "register";
  const visualImage =
    role === "LANDLORD" ? "/accomodation.png" : "/students-auth.png";
  const visualAlt =
    role === "LANDLORD"
      ? "Accommodation property available for students"
      : "Students finding community near campus";

  return (
    <main className="grid h-screen w-full place-items-stretch overflow-hidden bg-white font-poppins max-md:h-auto max-md:min-h-screen max-md:overflow-visible">
      <section className="grid h-full w-full min-h-0 grid-cols-2 bg-white max-md:block max-md:h-auto">
        <div className={`relative m-[10px_0_10px_10px] h-[calc(100%-20px)] min-h-0 overflow-hidden rounded-lg p-[43px_48px] text-white shadow-[0_7px_18px_rgba(28,70,116,0.12)] max-md:m-0 max-md:mb-[18px] max-md:h-[440px] max-md:min-h-0 max-md:p-[29px_27px] ${role === "LANDLORD" ? "bg-[linear-gradient(148deg,#078c9b_0%,#126b91_56%,#20365e_100%)]" : "bg-[linear-gradient(148deg,#087ce8_0%,#1260b3_56%,#202d63_100%)]"}`}>
          <Link href="/" className="relative z-[3] inline-flex w-fit items-center text-[22px] font-extrabold tracking-[-0.5px] text-white no-underline">
            <span className="mr-2 text-[27px] leading-none">⌂</span> Campus<span className="text-[#d1f2ff]">Nest</span>
          </Link>
          <div className="relative z-[2] mt-[92px] max-w-[410px] max-md:mt-[75px]">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[1.4px] leading-[1.5] text-[#c9f0ff]">{copy.eyebrow}</p>
            <h1 className="m-0 max-w-[410px] text-[clamp(27px,3.1vw,43px)] font-normal leading-[1.16] tracking-[-1.2px]">{copy.title}</h1>
            <p className="mt-[17px] max-w-[350px] text-[11px] leading-[1.75] text-white/85">{copy.description}</p>
            <ul className="mt-5 grid list-none gap-2 p-0 text-[11px] leading-[1.6]">
              {copy.points.map((point) => (
                <li key={point} className="before:mr-[9px] before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#c9f0ff] before:content-['']">{point}</li>
              ))}
            </ul>
          </div>
          <Image
            src={visualImage}
            alt={visualAlt}
            fill
            priority
            className="z-0 object-cover object-bottom opacity-[0.54]"
          />
          <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(4,67,151,0.16)_0%,rgba(5,57,137,0.3)_45%,rgba(9,26,74,0.78)_100%)]" />
        </div>

        <div className="flex flex-col items-center justify-center px-12 py-[72px] font-poppins text-[#111827] max-md:px-[27px] max-md:py-[42px] max-md:pb-[34px]">
          <div className="mb-[27px] w-full max-w-[460px] text-center">
            <h2 className="m-0 text-[25px] font-semibold leading-[1.4] tracking-[-0.7px]">{isRegister ? "Create an account" : "Welcome Back"}</h2>
            <p className="mt-2 text-[10px] leading-[1.8] text-[#687385]">
              {isRegister
                ? "Please enter your details to get started"
                : "Please enter your login details"}
            </p>
          </div>

          {isRegister ? <RegisterForm role={role} /> : <LoginForm role={role} />}

          <p className="mt-[17px] w-full max-w-[460px] text-center text-[9px] leading-[1.9] text-[#738093]">
            {isRegister ? "Already have an account?" : "New to CampusNest?"}{" "}
            <Link
              href={rolePath(role, isRegister ? "login" : "register")}
              className="font-semibold text-[#0875c5] underline underline-offset-2 hover:text-[#065a9b]"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-2.5 w-full max-w-[460px] text-center text-[9px] leading-[1.9] text-[#a0aab7]">
            {copy.loginPrompt}{" "}
            <Link
              href={rolePath(
                role === "STUDENT" ? "LANDLORD" : "STUDENT",
                "login",
              )}
              className="font-semibold text-[#0875c5] underline underline-offset-2 hover:text-[#065a9b]"
            >
              {copy.loginLink}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function rolePath(role: Role, mode: Mode) {
  if (role === "LANDLORD") return `/landlord/${mode}`;
  if (role === "SRC_REPRESENTATIVE") return `/src/${mode}`;
  return `/${mode}`;
}

function LoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    router.prefetch("/onboarding");
    router.prefetch("/landlord/onboarding");
    router.prefetch("/dashboard/student");
    router.prefetch("/dashboard/landlord");
    router.prefetch("/dashboard/src");
  }, [router]);

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    try {
      const gUser = await loginWithGoogle();
      const displayNameParts = (gUser.displayName || "").trim().split(" ");
      const firstName = displayNameParts[0] || "";
      const surname = displayNameParts.slice(1).join(" ") || "";

      const res = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gUser.email,
          name: firstName,
          surname,
          uid: gUser.uid,
          photoURL: gUser.photoURL,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google authentication failed");
        setGoogleLoading(false);
        return;
      }

      setRedirecting(true);
      const targetUrl = next || data.nextStep || (role === "LANDLORD" ? "/dashboard/landlord" : role === "SRC_REPRESENTATIVE" ? "/dashboard/src" : "/dashboard/student");
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Could not sign in with Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.needsVerification) {
          router.push(`/verify?email=${encodeURIComponent(email)}&role=${encodeURIComponent(data.role || role)}`);
          return;
        }
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }

      if (data.user.role === "STUDENT" && !data.user.onboardingCompleted) {
        router.push("/onboarding");
        return;
      }
      if (data.user.role === "LANDLORD" && !data.user.onboardingCompleted) {
        router.push("/landlord/onboarding");
        return;
      }

      const roleHome: Record<string, string> = {
        STUDENT: "/dashboard/student",
        LANDLORD: "/dashboard/landlord",
        ADMIN: "/dashboard/admin",
        SRC_REPRESENTATIVE: "/dashboard/src",
      };

      const userRole = data.user.role;
      let targetUrl = roleHome[userRole] || "/";

      // Validate next parameter belongs to this user's role before trusting it
      if (next) {
        if (userRole === "STUDENT" && (next.startsWith("/dashboard/student") || next.startsWith("/onboarding"))) {
          targetUrl = next;
        } else if (userRole === "LANDLORD" && (next.startsWith("/dashboard/landlord") || next.startsWith("/landlord"))) {
          targetUrl = next;
        } else if (userRole === "SRC_REPRESENTATIVE" && (next.startsWith("/dashboard/src") || next.startsWith("/src"))) {
          targetUrl = next;
        } else if (userRole === "ADMIN" && (next.startsWith("/dashboard/admin") || next.startsWith("/admin"))) {
          targetUrl = next;
        }
      }

      router.push(targetUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-[460px] gap-[18px]">
      {role !== "SRC_REPRESENTATIVE" && (
        <>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading || redirecting}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#dfe5ec] bg-white text-center font-poppins text-xs font-semibold leading-[1.5] text-[#1d2734] shadow-[0_3px_12px_rgba(29,48,67,0.06)] hover:border-[#d7e6f3] hover:bg-[#f8fbff] disabled:opacity-60 cursor-pointer transition-all"
            >
              {googleLoading || redirecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1084ed] border-t-transparent rounded-full animate-spin" />
                  <span>{redirecting ? "Redirecting..." : "Connecting..."}</span>
                </div>
              ) : (
                <>
                  <FcGoogle aria-hidden="true" size={18} /> Continue with Google
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2.5 text-[9px] text-[#a3acb8] before:h-px before:flex-1 before:bg-[#edf0f3] after:h-px after:flex-1 after:bg-[#edf0f3]">
            <span>or sign in using your email</span>
          </div>
        </>
      )}
      <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
        {role === "SRC_REPRESENTATIVE" ? "Official SRC University Email" : "Email address"}
        <input className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10" 
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={role === "SRC_REPRESENTATIVE" ? "src.housing@wits.ac.za" : "you@example.com"}
        />
      </label>
      <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
        Password
        <input className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
      </label>
      {error && <p className="m-0 text-[10px] leading-[1.6] text-[#c53a3a]">{error}</p>}
      <button disabled={loading || googleLoading || redirecting} className={`min-h-12 rounded-2xl border-0 px-4 py-[13px] font-poppins text-[13px] font-bold leading-[1.5] text-white shadow-md disabled:cursor-wait disabled:opacity-60 cursor-pointer transition-all ${role === "SRC_REPRESENTATIVE" ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20" : "bg-[#1084ed] hover:bg-[#0876d8] shadow-[#1084ed]/20"}`}>
        {redirecting ? "Redirecting..." : loading ? "Signing in..." : role === "SRC_REPRESENTATIVE" ? "Sign In to SRC Desk" : "Sign in"}
      </button>
    </form>
  );
}

const SA_UNIVERSITIES = [
  "University of the Witwatersrand (Wits)",
  "University of Johannesburg (UJ)",
  "University of Cape Town (UCT)",
  "University of Pretoria (UP)",
  "Stellenbosch University (SU)",
  "Tshwane University of Technology (TUT)",
  "University of KwaZulu-Natal (UKZN)",
  "Nelson Mandela University (NMU)",
  "Durban University of Technology (DUT)",
  "North-West University (NWU)",
  "University of the Western Cape (UWC)",
  "Central University of Technology (CUT)",
  "Other South African Institution",
];

function RegisterForm({ role }: { role: Role }) {
  const router = useRouter();
  const isSrc = role === "SRC_REPRESENTATIVE";
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    universityEmail: "",
    institutionName: isSrc ? SA_UNIVERSITIES[0] : "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const currentInstitution = form.institutionName || SA_UNIVERSITIES[0];
  const srcAlias = formatSrcAlias(currentInstitution);

  useEffect(() => {
    router.prefetch("/onboarding");
    router.prefetch("/landlord/onboarding");
    router.prefetch("/dashboard/student");
    router.prefetch("/dashboard/landlord");
    router.prefetch("/dashboard/src");
  }, [router]);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const [srcVerificationNotice, setSrcVerificationNotice] = useState<{
    email: string;
    verificationUrl?: string;
  } | null>(null);

  async function handleGoogleRegister() {
    setError(null);
    setGoogleLoading(true);
    try {
      const gUser = await loginWithGoogle();
      if (!gUser.email) {
        throw new Error("No email returned from Google authentication");
      }

      const displayNameParts = (gUser.displayName || "").trim().split(" ");
      const firstName = displayNameParts[0] || "User";
      const surname = displayNameParts.slice(1).join(" ") || "Student";

      const res = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: gUser.email,
          name: firstName,
          surname,
          uid: gUser.uid,
          photoURL: gUser.photoURL,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Google registration failed");
        setGoogleLoading(false);
        return;
      }

      setRedirecting(true);
      const targetUrl = data.user?.role === "SRC_REPRESENTATIVE"
        ? "/dashboard/src"
        : data.nextStep || (role === "LANDLORD" ? "/landlord/onboarding" : "/onboarding");
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error("Google register error:", err);
      setError(err.message || "Could not register with Google.");
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const selectedInstitution = isSrc ? (form.institutionName || SA_UNIVERSITIES[0]) : form.institutionName;
      const alias = isSrc ? formatSrcAlias(selectedInstitution) : { name: form.name, surname: form.surname };
      const emailToSubmit = isSrc ? form.universityEmail : form.email;

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          name: alias.name,
          surname: alias.surname,
          email: emailToSubmit,
          universityEmail: isSrc ? form.universityEmail : (form.universityEmail || undefined),
          institutionName: selectedInstitution || undefined,
          phone: form.phone || undefined,
          password: form.password,
        }),
      });
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        data = { error: `Server response error (${response.status}). Please try again.` };
      }

      if (!response.ok) {
        let errMsg = "Registration failed";
        if (typeof data.error === "string") {
          errMsg = data.error;
        } else if (data.error && typeof data.error === "object") {
          const fieldErrors = Object.values(data.error.fieldErrors || {}).flat();
          if (fieldErrors.length > 0) {
            errMsg = fieldErrors.join(", ");
          } else if (data.error.formErrors && Array.isArray(data.error.formErrors)) {
            errMsg = data.error.formErrors.join(", ");
          }
        }
        setError(errMsg);
        setLoading(false);
        return;
      }

      // ALL successful registrations route to OTP verification
      setRedirecting(true);
      const targetEmail = data.email || emailToSubmit;
      const targetRole = data.role || role;
      window.location.href = `/verify?email=${encodeURIComponent(targetEmail)}&role=${encodeURIComponent(targetRole)}`;
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-[460px] gap-[18px]">
      {/* Google registration option, hidden for SRC accounts. */}
      {!isSrc && (
        <>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={googleLoading || loading || redirecting}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#dfe5ec] bg-white text-center font-poppins text-xs font-semibold leading-[1.5] text-[#1d2734] shadow-[0_3px_12px_rgba(29,48,67,0.06)] hover:border-[#d7e6f3] hover:bg-[#f8fbff] disabled:opacity-60 cursor-pointer transition-all"
            >
              {googleLoading || redirecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#1084ed] border-t-transparent rounded-full animate-spin" />
                  <span>{redirecting ? "Redirecting..." : "Connecting..."}</span>
                </div>
              ) : (
                <>
                  <FcGoogle aria-hidden="true" size={18} /> Continue with Google
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-[9px] text-[#a3acb8] before:h-px before:flex-1 before:bg-[#edf0f3] after:h-px after:flex-1 after:bg-[#edf0f3]">
            <span>or sign up with email</span>
          </div>
        </>
      )}

      {/* For Student and Landlord roles: First Name & Surname */}
      {!isSrc && (
        <div className="grid grid-cols-2 gap-2.5 max-[430px]:grid-cols-1">
          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            First name
            <input
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
              required
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="First name"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            Surname
            <input
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
              required
              value={form.surname}
              onChange={(event) => update("surname", event.target.value)}
              placeholder="Surname"
            />
          </label>
        </div>
      )}

      {/* For SRC Role: University Institution Selector & Official SRC Domain Email & Alias Preview */}
      {isSrc ? (
        <>
          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            University / Higher Education Institution
            <select
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10 cursor-pointer"
              required
              value={form.institutionName || SA_UNIVERSITIES[0]}
              onChange={(event) => update("institutionName", event.target.value)}
            >
              {SA_UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </label>

          {/* Institutional Alias Preview Box */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-950 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                Institutional Council Alias
              </span>
              <span className="text-[10px] font-bold bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full">
                Office Account
              </span>
            </div>
            <p className="font-bold text-gray-900 text-sm">
              {srcAlias.name} {srcAlias.surname}
            </p>
            <p className="text-[11px] text-gray-500 leading-snug">
              Official council desk alias auto-assigned from university type. No personal first/last name required.
            </p>
          </div>

          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            Official SRC University Domain Email
            <input
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
              required
              type="email"
              value={form.universityEmail}
              onChange={(event) => update("universityEmail", event.target.value)}
              placeholder="e.g. src.housing@wits.ac.za"
            />
          </label>
        </>
      ) : (
        <>
          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            Email address
            <input
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
              required
              type="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
            Phone number
            <input
              className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
              required
              type="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+27 00 000 0000"
            />
          </label>
        </>
      )}

      <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
        Password
        <input
          className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-[#1684e8] focus:ring-4 focus:ring-[#1684e8]/10"
          required
          minLength={8}
          type="password"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="At least 8 characters"
        />
      </label>

      {error && <p className="m-0 text-[10px] leading-[1.6] text-[#c53a3a]">{error}</p>}

      <button
        disabled={loading || googleLoading || redirecting}
        className={`min-h-12 rounded-2xl border-0 px-4 py-[13px] font-poppins text-[13px] font-bold leading-[1.5] text-white shadow-md disabled:cursor-wait disabled:opacity-60 cursor-pointer transition-all ${
          isSrc
            ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            : "bg-[#1084ed] hover:bg-[#0876d8] shadow-[#1084ed]/20"
        }`}
      >
        {redirecting
          ? "Redirecting..."
          : loading
          ? isSrc
            ? "Registering Council Account..."
            : "Creating account..."
          : isSrc
          ? "Register SRC Account & Send Verification Link"
          : "Create account"}
      </button>
    </form>
  );
}



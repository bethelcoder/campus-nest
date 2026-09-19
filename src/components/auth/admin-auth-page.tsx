"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { LuShield, LuLock } from "react-icons/lu";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/dashboard/admin");
  }, [router]);

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
          setError(
            "Your admin account requires email verification. Contact the platform team or check your inbox for a verification code."
          );
          return;
        }
        setError(typeof data.error === "string" ? data.error : "Login failed");
        return;
      }

      if (data.user.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setError(
          "This account is not authorized for platform admin access. Please use the appropriate sign-in page for your role."
        );
        return;
      }

      let targetUrl = "/dashboard/admin";
      if (next && (next.startsWith("/dashboard/admin") || next.startsWith("/admin"))) {
        targetUrl = next.startsWith("/admin/") ? next.replace("/admin/", "/dashboard/admin/") : next;
      }

      router.push(targetUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-[460px] gap-[18px]">
      <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
        CampusNest team email
        <input
          className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@campusnest.co.za"
        />
      </label>
      <label className="grid gap-2 text-xs font-semibold leading-[1.75] text-[#4b5563]">
        Password
        <input
          className="min-h-12 w-full rounded-2xl border border-[#d8e0e8] bg-[#fbfcfd] px-4 py-[13px] font-poppins text-[13px] font-normal leading-[1.7] text-[#182333] outline-none focus:border-slate-700 focus:ring-4 focus:ring-slate-700/10"
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
        />
      </label>
      {error && <p className="m-0 text-[10px] leading-[1.6] text-[#c53a3a]">{error}</p>}
      <button
        disabled={loading}
        className="min-h-12 rounded-2xl border-0 px-4 py-[13px] font-poppins text-[13px] font-bold leading-[1.5] text-white shadow-md disabled:cursor-wait disabled:opacity-60 cursor-pointer transition-all bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 flex items-center justify-center gap-2"
      >
        <LuLock className="w-4 h-4" />
        {loading ? "Signing in..." : "Sign In to Admin Console"}
      </button>
      <p className="text-[10px] text-center text-[#8892A4] leading-relaxed">
        Team accounts are provisioned internally. Contact engineering if you need access.
      </p>
    </form>
  );
}

export default function AdminAuthPage() {
  return (
    <main className="grid h-screen w-full place-items-stretch overflow-hidden bg-white font-poppins max-md:h-auto max-md:min-h-screen max-md:overflow-visible">
      <section className="grid h-full w-full min-h-0 grid-cols-2 bg-white max-md:block max-md:h-auto">
        <div className="relative m-[10px_0_10px_10px] h-[calc(100%-20px)] min-h-0 overflow-hidden rounded-lg p-[43px_48px] text-white shadow-[0_7px_18px_rgba(28,70,116,0.12)] max-md:m-0 max-md:mb-[18px] max-md:h-[440px] max-md:min-h-0 max-md:p-[29px_27px] bg-[linear-gradient(148deg,#0f172a_0%,#1e293b_56%,#334155_100%)]">
          <Link
            href="/"
            className="relative z-[3] inline-flex w-fit items-center text-[22px] font-extrabold tracking-[-0.5px] text-white no-underline"
          >
            <span className="mr-2 text-[27px] leading-none">⌂</span>
            Campus<span className="text-slate-300">Nest</span>
          </Link>
          <div className="relative z-[2] mt-[92px] max-w-[410px] max-md:mt-[75px]">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[1.4px] leading-[1.5] text-slate-300">
              Internal · CampusNest Team
            </p>
            <h1 className="m-0 max-w-[410px] text-[clamp(27px,3.1vw,43px)] font-normal leading-[1.16] tracking-[-1.2px]">
              Internal ops console for the platform team.
            </h1>
            <p className="mt-[17px] max-w-[350px] text-[11px] leading-[1.75] text-white/85">
              For CampusNest staff only — audit accreditations, endorse tenancy letters, and monitor escalations across all institutions.
            </p>
            <ul className="mt-5 grid list-none gap-2 p-0 text-[11px] leading-[1.6]">
              {[
                "Property accreditation & compliance registry",
                "Confirmation letter endorsement queue",
                "Global escalation monitoring",
              ].map((point) => (
                <li
                  key={point}
                  className="before:mr-[9px] before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-300 before:content-['']"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(15,23,42,0.16)_0%,rgba(15,23,42,0.45)_45%,rgba(15,23,42,0.88)_100%)]" />
        </div>

        <div className="flex flex-col items-center justify-center px-12 py-[72px] font-poppins text-[#111827] max-md:px-[27px] max-md:py-[42px] max-md:pb-[34px]">
          <div className="mb-[27px] w-full max-w-[460px] text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white mb-4">
              <LuShield className="w-6 h-6" />
            </div>
            <h2 className="m-0 text-[25px] font-semibold leading-[1.4] tracking-[-0.7px]">Team Sign In</h2>
            <p className="mt-2 text-[10px] leading-[1.8] text-[#687385]">
              CampusNest internal staff only — not for students, landlords, or universities
            </p>
          </div>

          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>

          <p className="mt-[17px] w-full max-w-[460px] text-center text-[9px] leading-[1.9] text-[#a0aab7]">
            Not an admin?{" "}
            <Link href="/login" className="font-semibold text-[#0875c5] underline underline-offset-2 hover:text-[#065a9b]">
              Student sign in
            </Link>
            {" · "}
            <Link href="/landlord/login" className="font-semibold text-[#0875c5] underline underline-offset-2 hover:text-[#065a9b]">
              Landlord sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

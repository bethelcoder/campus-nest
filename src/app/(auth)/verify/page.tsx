"use client";

import { Suspense, useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LuShieldCheck, LuMail, LuArrowRight, LuRefreshCw, LuInfo, LuCheck, LuLock } from "react-icons/lu";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const role = searchParams.get("role") ?? "STUDENT";

  const next = searchParams.get("next");

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Persistent cooldown state restoration and server synchronization
  useEffect(() => {
    if (!email) return;

    const storageKey = `campusnest_otp_timer_${email.toLowerCase().trim()}`;
    const storedTarget = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (storedTarget) {
      const targetTime = parseInt(storedTarget, 10);
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setCooldown(remaining);
    }

    // Sync with database truth
    async function syncCooldownWithServer() {
      try {
        const res = await fetch(`/api/auth/verify-otp?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (typeof data.remainingCooldown === "number") {
            setCooldown(data.remainingCooldown);
            if (data.remainingCooldown > 0) {
              localStorage.setItem(storageKey, (Date.now() + data.remainingCooldown * 1000).toString());
            } else {
              localStorage.removeItem(storageKey);
            }
          }
        }
      } catch (err) {
        console.warn("Could not sync OTP cooldown with server:", err);
      }
    }

    syncCooldownWithServer();
  }, [email]);

  // Cooldown countdown tick down
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (email && typeof window !== "undefined") {
            localStorage.removeItem(`campusnest_otp_timer_${email.toLowerCase().trim()}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown, email]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const fullCode = digits.join("");

  async function handleVerifyCode(codeToVerify: string) {
    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        setLoading(false);
        return;
      }

      // Success: redirect to target destination
      const destination =
        next ||
        data.targetUrl ||
        (role === "SRC_REPRESENTATIVE"
          ? "/dashboard/src"
          : role === "ADMIN"
          ? "/dashboard/admin"
          : role === "LANDLORD"
          ? "/landlord/onboarding"
          : "/onboarding");
      window.location.href = destination;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  function handleDigitChange(index: number, val: string) {
    const clean = val.replace(/\D/g, "");
    if (!clean && val !== "") return;

    const nextDigits = [...digits];
    nextDigits[index] = clean ? clean.slice(-1) : "";
    setDigits(nextDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const currentCode = nextDigits.join("");
    if (currentCode.length === 6) {
      handleVerifyCode(currentCode);
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, i) => {
      if (i < 6) nextDigits[i] = char;
    });
    setDigits(nextDigits);

    if (pasted.length === 6) {
      handleVerifyCode(pasted);
    } else {
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.retryAfter) {
          setCooldown(data.retryAfter);
        }
        setError(data.error ?? "Could not resend verification code.");
        return;
      }
      setInfo(data.message ?? "A fresh 6-digit code has been sent to your email.");
      setCooldown(60);
      if (email && typeof window !== "undefined") {
        const storageKey = `campusnest_otp_timer_${email.toLowerCase().trim()}`;
        localStorage.setItem(storageKey, (Date.now() + 60 * 1000).toString());
      }
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Network error resending code.");
    } finally {
      setResending(false);
    }
  }

  const roleTitle =
    role === "LANDLORD"
      ? "Landlord Portal Verification"
      : role === "SRC_REPRESENTATIVE"
      ? "SRC Council Desk Verification"
      : "Student Account Verification";

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-[#F3F4F6] font-poppins">
      <div className="w-full max-w-[460px] bg-white rounded-3xl border border-[#E5E7EB] shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-7 sm:p-9 space-y-6 animate-fadeIn">
        {/* Top Header & Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-gray-900 mb-1">
            <span className="text-2xl text-emerald-600 leading-none">⌂</span> Campus<span className="text-emerald-600">Nest</span>
          </Link>

          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
            <LuShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {roleTitle}
          </h1>

          <p className="text-xs text-gray-500 leading-relaxed max-w-sm mx-auto">
            We sent a 6-digit verification code to:
            <span className="block font-bold text-gray-900 mt-0.5 break-all">{email || "your email address"}</span>
          </p>
        </div>

        {/* Info or Error alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-fadeIn">
            <LuInfo className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {info && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
            <LuCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{info}</span>
          </div>
        )}

        {/* 6-Block OTP Input Layout */}
        <div className="space-y-4">
          <div className="flex justify-between gap-2 max-w-[340px] mx-auto py-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border transition-all shadow-inner outline-none ${
                  digit
                    ? "border-emerald-600 bg-emerald-50/40 text-gray-900 ring-2 ring-emerald-500/10"
                    : "border-gray-300 bg-[#fbfcfd] text-gray-900 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleVerifyCode(fullCode)}
            disabled={loading || fullCode.length !== 6}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#099250] hover:bg-[#087a43] text-white text-xs font-bold shadow-md shadow-emerald-600/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <>
                <span>Verify Email &amp; Continue</span>
                <LuArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Resend Code Section with Cooldown */}
        <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>Didn&apos;t receive the code?</span>
            {cooldown > 0 ? (
              <span className="font-semibold text-gray-400 font-mono">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
              >
                {resending ? (
                  <span className="inline-flex items-center gap-1">
                    <LuRefreshCw className="w-3.5 h-3.5 animate-spin" /> Sending...
                  </span>
                ) : (
                  "Resend code"
                )}
              </button>
            )}
          </div>

          <Link
            href={role === "LANDLORD" ? "/landlord/login" : role === "SRC_REPRESENTATIVE" ? "/src/login" : "/login"}
            className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            Use a different account / Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F4F6]">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}


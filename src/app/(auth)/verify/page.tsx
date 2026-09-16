"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed");
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    const res = await fetch("/api/auth/verify-otp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) setInfo("A new code has been sent.");
    else setError("Could not resend code.");
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-xl font-semibold mb-2">Verify your university email</h1>
      <p className="text-sm text-gray-600 mb-6">
        We sent a 6-digit code to your university email address. Enter it below.
      </p>

      <form onSubmit={handleVerify} className="space-y-3">
        <input
          required
          maxLength={6}
          placeholder="123456"
          className="w-full border rounded px-3 py-2 text-center tracking-[0.5em] text-lg"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
        {error && <p className="text-sm text-risk">{error}</p>}
        {info && <p className="text-sm text-safe">{info}</p>}
        <button
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>

      <button onClick={handleResend} className="mt-4 text-sm text-gray-500 hover:underline">
        Resend code
      </button>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="max-w-sm mx-auto px-6 py-16" />}>
      <VerifyForm />
    </Suspense>
  );
}

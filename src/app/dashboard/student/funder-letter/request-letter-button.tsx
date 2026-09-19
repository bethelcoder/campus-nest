"use client";

import { useState } from "react";

export default function RequestLetterButton({
  applicationId,
  disabled,
}: {
  applicationId: string;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState<string | null>(null);

  async function requestLetter() {
    setStatus("loading");
    setMessage("");
    const response = await fetch("/api/funder-letters/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Could not request the letter");
      return;
    }
    setStatus("done");
    setReference(data.request.letterReference);
    setMessage("Request submitted for CampusNest review.");
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={requestLetter}
        disabled={disabled || status === "loading" || status === "done"}
        className="rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
      >
        {status === "loading" ? "Requesting..." : status === "done" ? "Requested" : "Request letter"}
      </button>
      {message && (
        <p className={`max-w-[230px] text-right text-[11px] ${status === "error" ? "text-rose-600" : "text-emerald-600"}`}>
          {message}
        </p>
      )}
      {reference && (
        <a href={`/funder-letters/${reference}`} className="text-[11px] font-bold text-[#059669] hover:underline">
          Open verification letter
        </a>
      )}
    </div>
  );
}

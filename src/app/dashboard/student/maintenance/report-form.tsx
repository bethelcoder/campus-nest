"use client";

import { FormEvent, useState } from "react";

export default function ReportForm({ propertyId }: { propertyId: string }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PLUMBING");
  const [severity, setSeverity] = useState("MEDIUM");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ propertyId, subject, description, category, severity }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error || "Could not submit your report.");
      return;
    }

    setSubject("");
    setDescription("");
    setStatus("success");
    setMessage(`Report submitted. Reference: ${data.report.id}`);
  }

  return (
    <form onSubmit={submitReport} className="mt-5 space-y-4 border-t border-[#F1F5F9] pt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-semibold text-[#334155]">
          Issue category
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]">
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="STRUCTURAL">Structural or building</option>
            <option value="SECURITY">Security</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-semibold text-[#334155]">
          Severity
          <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-normal text-[#0F172A] outline-none focus:border-[#6366F1]">
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL_EMERGENCY">Critical emergency</option>
          </select>
        </label>
      </div>
      <label className="block space-y-1.5 text-sm font-semibold text-[#334155]">
        Short title
        <input required minLength={3} value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="e.g. Bathroom tap is leaking" className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm font-normal text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#6366F1]" />
      </label>
      <label className="block space-y-1.5 text-sm font-semibold text-[#334155]">
        Describe the issue
        <textarea required minLength={10} value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="Tell the landlord what happened, where it is, and when you first noticed it." className="w-full resize-y rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm font-normal text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#6366F1]" />
      </label>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className={`text-xs ${status === "error" ? "text-rose-600" : status === "success" ? "text-emerald-600" : "text-[#64748B]"}`}>{message || "Your report will be sent to the residence landlord."}</p>
        <button type="submit" disabled={status === "sending"} className="rounded-xl bg-[#0F172A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1E293B] disabled:cursor-wait disabled:bg-[#CBD5E1]">{status === "sending" ? "Sending..." : "Send report to landlord"}</button>
      </div>
    </form>
  );
}

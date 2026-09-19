"use client";

import { useState } from "react";
import { LuFileCheck, LuCheck, LuX, LuSend } from "react-icons/lu";

export interface AdminLetterItem {
  id: string;
  studentName: string;
  propertyAddress: string;
  letterReference: string;
  status: string;
  createdAt: string;
  propertyTitle: string;
}

interface AdminLettersPanelProps {
  initialLetters: AdminLetterItem[];
}

export default function AdminLettersPanel({ initialLetters }: AdminLettersPanelProps) {
  const [letters, setLetters] = useState(initialLetters);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(letterId: string, url: string, body: object) {
    setLoadingId(letterId);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      if (url.includes("endorse")) {
        setLetters((prev) =>
          prev.map((l) =>
            l.id === letterId
              ? { ...l, status: body && (body as { decision: string }).decision === "ENDORSE" ? "ENDORSED" : "REJECTED" }
              : l
          )
        );
      } else if (url.includes("send")) {
        setLetters((prev) =>
          prev.map((l) => (l.id === letterId ? { ...l, status: "SENT_TO_FUNDER" } : l))
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoadingId(null);
    }
  }

  const pendingCount = letters.filter((l) => l.status === "PENDING_REVIEW").length;
  const endorsedCount = letters.filter((l) => l.status === "ENDORSED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            Tenancy Confirmation Queue
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">Confirmation Letter Endorsement</h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Review, endorse, and dispatch official tenancy confirmation letters to students and funders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Letters</span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">{letters.length}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Ready to Send</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{endorsedCount}</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{error}</div>
      )}

      {letters.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <LuFileCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No confirmation letters yet</h3>
          <p className="text-xs text-gray-500 mt-1">Letters will appear here when landlords submit them for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {letters.map((letter) => (
            <div
              key={letter.id}
              className="p-5 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      letter.status === "PENDING_REVIEW"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : letter.status === "ENDORSED"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : letter.status === "SENT_TO_FUNDER"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : letter.status === "REJECTED"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {letter.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(letter.createdAt).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 mt-1">{letter.studentName}</h4>
                <p className="text-xs text-gray-500">{letter.propertyTitle}</p>
                <p className="text-xs text-gray-400">{letter.propertyAddress}</p>
                <p className="text-[11px] font-mono text-gray-400 mt-0.5">Ref: {letter.letterReference}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {letter.status === "PENDING_REVIEW" && (
                  <>
                    <button
                      type="button"
                      disabled={loadingId === letter.id}
                      onClick={() => act(letter.id, "/api/confirmation/endorse", { letterId: letter.id, decision: "ENDORSE" })}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LuCheck className="w-3.5 h-3.5" />
                      Endorse
                    </button>
                    <button
                      type="button"
                      disabled={loadingId === letter.id}
                      onClick={() => act(letter.id, "/api/confirmation/endorse", { letterId: letter.id, decision: "REJECT" })}
                      className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50 text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LuX className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                )}
                {letter.status === "ENDORSED" && (
                  <button
                    type="button"
                    disabled={loadingId === letter.id}
                    onClick={() => act(letter.id, "/api/confirmation/send", { letterId: letter.id })}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LuSend className="w-3.5 h-3.5" />
                    Send to Student &amp; Funder
                  </button>
                )}
                {(letter.status === "SENT_TO_FUNDER" || letter.status === "REJECTED") && (
                  <span className="text-xs font-semibold text-gray-400">No actions available</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

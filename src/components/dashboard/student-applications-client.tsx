"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LuBuilding2,
  LuCheck,
  LuX,
  LuClock,
  LuFileText,
  LuArrowUpRight,
  LuDownload,
  LuSparkles,
  LuShieldCheck,
  LuSend,
  LuBed,
  LuShieldAlert,
  LuInfo,
} from "react-icons/lu";

export interface StudentApplicationItem {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  proposedBedId?: string | null;
  offeredRoomName?: string | null;
  offeredMonthlyRent?: number | null;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
  landlordNotes?: string | null;
  rejectionReason?: string | null;
  property: {
    id: string;
    title: string;
    address: string;
    suburb: string;
    city: string;
    priceMonthly: number;
    landlord: {
      name: string;
      surname: string;
      landlordProfile?: {
        companyName?: string | null;
      } | null;
    };
  };
  roomListing?: {
    id: string;
    name: string;
    roomType: string;
    monthlyRent: number;
  } | null;
}

interface StudentApplicationsClientProps {
  initialApplications: StudentApplicationItem[];
}

export default function StudentApplicationsClient({
  initialApplications,
}: StudentApplicationsClientProps) {
  const [applications, setApplications] = useState<StudentApplicationItem[]>(initialApplications);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleAction = async (applicationId: string, action: "ACCEPT_OFFER" | "DECLINE_OFFER" | "CANCEL") => {
    setBusyId(applicationId);
    setActionNotice(null);

    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process application action");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: action === "ACCEPT_OFFER" ? "ACCEPTED" : "CANCELLED",
              }
            : app
        )
      );

      setActionNotice({
        type: "success",
        text:
          action === "ACCEPT_OFFER"
            ? "Room offer accepted! Tenancy confirmed and room allocated."
            : "Application cancelled.",
      });
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      setActionNotice({
        type: "error",
        text: err.message || "An error occurred",
      });
    } finally {
      setBusyId(null);
    }
  };

  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#005F56]/10 text-[#005F56]">
          <LuBuilding2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">No applications submitted yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore accredited residences and submit an application to track landlord review and approval statuses here.
          </p>
        </div>
        <Link
          href="/residences"
          className="inline-flex items-center justify-center rounded-xl bg-[#005F56] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#004d46]"
        >
          Explore Residences
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {actionNotice && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            actionNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {actionNotice.type === "success" ? (
            <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <LuShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {applications.map((app) => {
          const prop = app.property;
          const room = app.roomListing;
          const providerName =
            prop.landlord?.landlordProfile?.companyName ||
            `${prop.landlord?.name || "Residence"} ${prop.landlord?.surname || "Management"}`;

          const rentAmount = app.offeredMonthlyRent || (room ? Number(room.monthlyRent) : Number(prop.priceMonthly));
          const isBusy = busyId === app.id;

          return (
            <article
              key={app.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-[#005F56]/30 transition-all space-y-4"
            >
              <div className="space-y-4">
                {/* Header row with Title & Status */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#005F56]">
                      Accredited Residence
                    </span>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      {prop.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {prop.address}, {prop.suburb}, {prop.city}
                    </p>
                  </div>

                  {app.status === "ACCEPTED" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                      <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tenancy Active</span>
                    </span>
                  ) : app.status === "OFFER_MADE" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      <LuSparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Offer Received</span>
                    </span>
                  ) : app.status === "UNDER_REVIEW" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800">
                      <LuClock className="w-3.5 h-3.5 text-purple-600" />
                      <span>Under Review</span>
                    </span>
                  ) : app.status === "REJECTED" || app.status === "CANCELLED" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
                      <LuX className="w-3.5 h-3.5 text-rose-600" />
                      <span>{app.status === "CANCELLED" ? "Cancelled" : "Declined"}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Pending Review</span>
                    </span>
                  )}
                </div>

                {/* Offer Alert Banner if OFFER_MADE */}
                {app.status === "OFFER_MADE" && (
                  <div className="p-4 rounded-xl bg-[#005F56]/10 border border-[#005F56]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#005F56] flex items-center gap-1.5">
                        <LuSparkles className="w-4 h-4 text-[#005F56]" />
                        Official Placement Offer
                      </span>
                      <span className="text-xs font-black text-[#005F56]">
                        R{Number(rentAmount).toLocaleString()}/month
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 space-y-1 bg-white p-3 rounded-lg border border-[#005F56]/20">
                      <p className="font-semibold text-slate-900">
                        Allocated Room: {app.offeredRoomName || "Accredited Student Unit"}
                      </p>
                      {app.leaseStartDate && (
                        <p className="text-slate-600 text-[11px]">
                          Lease Period: {new Date(app.leaseStartDate).toLocaleDateString("en-ZA")} –{" "}
                          {app.leaseEndDate ? new Date(app.leaseEndDate).toLocaleDateString("en-ZA") : "Nov 2026"}
                        </p>
                      )}
                      {app.landlordNotes && (
                        <p className="text-slate-600 italic text-[11px] pt-1">
                          Note: &ldquo;{app.landlordNotes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAction(app.id, "ACCEPT_OFFER")}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all text-center shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isBusy ? "Confirming..." : "Accept Offer & Sign Tenancy"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleAction(app.id, "DECLINE_OFFER")}
                        className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* Application Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Room Category</p>
                    <p className="mt-0.5 font-bold text-slate-900 truncate">
                      {room ? `${room.name} (${room.roomType})` : "Standard Accommodation"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Rate</p>
                    <p className="mt-0.5 font-black text-[#005F56]">
                      R {Number(rentAmount).toLocaleString("en-ZA")}/mo
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Residence Provider</p>
                    <p className="mt-0.5 font-bold text-slate-900 truncate">{providerName}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Applied On</p>
                    <p className="mt-0.5 font-bold text-slate-900">
                      {new Date(app.createdAt).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {app.message && (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Application Note</p>
                    <p className="mt-0.5 text-slate-600 italic">&ldquo;{app.message}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <Link
                  href={`/residences/${prop.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || prop.id}`}
                  className="text-xs font-bold text-slate-700 hover:text-[#005F56] transition-colors flex items-center gap-1"
                >
                  <span>View Residence Page</span>
                  <LuArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/applications/proof/${app.id}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#005F56] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#004d46]"
                >
                  <LuDownload className="w-3.5 h-3.5" />
                  <span>Download Confirmation Letter</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

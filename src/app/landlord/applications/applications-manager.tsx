"use client";

import React, { useState, useMemo } from "react";
import {
  LuUsers,
  LuBuilding2,
  LuBed,
  LuShieldCheck,
  LuCheck,
  LuX,
  LuEye,
  LuCalendar,
  LuDollarSign,
  LuClock,
  LuFileText,
  LuSearch,
  LuSlidersHorizontal,
  LuSend,
  LuShieldAlert,
  LuAward,
  LuMail,
  LuPhone,
  LuSchool,
  LuUserCheck,
  LuInfo,
} from "react-icons/lu";

export interface StudentProfileData {
  studentNumber?: string;
  universityName?: string;
  yearOfStudy?: string | null;
  fundingType?: string | null;
  bursaryName?: string | null;
  idNumber?: string | null;
  phoneNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

export interface ApplicationItem {
  id: string;
  status: "SUBMITTED" | "PENDING" | "UNDER_REVIEW" | "OFFER_MADE" | "ACCEPTED" | "REJECTED" | "CANCELLED" | string;
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
    id?: string;
    title: string;
  };
  roomListing: {
    id?: string;
    name: string;
    roomType: string;
    monthlyRent: number;
    availableUnits: number;
  } | null;
  student: {
    name: string;
    surname: string;
    email: string;
    universityEmail: string | null;
    studentProfile?: StudentProfileData | null;
  };
}

export interface LandlordProperty {
  id: string;
  title: string;
  rooms: Array<{
    id?: string;
    name: string;
    roomType: string;
    monthlyRent: number;
    availableUnits: number;
  }>;
}

interface ApplicationsManagerProps {
  initialApplications: ApplicationItem[];
  initialProperties: LandlordProperty[];
}

export default function ApplicationsManager({
  initialApplications,
  initialProperties,
}: ApplicationsManagerProps) {
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [properties, setProperties] = useState<LandlordProperty[]>(initialProperties);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "UNDER_REVIEW" | "OFFER_MADE" | "ACCEPTED" | "REJECTED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [viewDossierApp, setViewDossierApp] = useState<ApplicationItem | null>(null);
  const [offerApp, setOfferApp] = useState<ApplicationItem | null>(null);
  const [declineApp, setDeclineApp] = useState<ApplicationItem | null>(null);

  // Make Offer Form State
  const [offerForm, setOfferForm] = useState({
    offeredRoomName: "",
    offeredMonthlyRent: 4900,
    leaseStartDate: "2026-02-01",
    leaseEndDate: "2026-11-30",
    landlordNotes: "NSFAS accredited student placement offer. Utilities and high-speed uncapped Wi-Fi included.",
  });

  // Decline Reason State
  const [declineReason, setDeclineReason] = useState("");

  // Counts per tab
  const counts = useMemo(() => {
    let pending = 0;
    let underReview = 0;
    let offerMade = 0;
    let accepted = 0;
    let rejected = 0;

    applications.forEach((a) => {
      if (a.status === "PENDING" || a.status === "SUBMITTED") pending++;
      else if (a.status === "UNDER_REVIEW") underReview++;
      else if (a.status === "OFFER_MADE") offerMade++;
      else if (a.status === "ACCEPTED") accepted++;
      else if (a.status === "REJECTED" || a.status === "CANCELLED") rejected++;
    });

    return { all: applications.length, pending, underReview, offerMade, accepted, rejected };
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Tab filter
      if (activeTab === "PENDING" && app.status !== "PENDING" && app.status !== "SUBMITTED") return false;
      if (activeTab === "UNDER_REVIEW" && app.status !== "UNDER_REVIEW") return false;
      if (activeTab === "OFFER_MADE" && app.status !== "OFFER_MADE") return false;
      if (activeTab === "ACCEPTED" && app.status !== "ACCEPTED") return false;
      if (activeTab === "REJECTED" && app.status !== "REJECTED" && app.status !== "CANCELLED") return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const fullName = `${app.student.name} ${app.student.surname}`.toLowerCase();
        const email = app.student.email.toLowerCase();
        const university = (app.student.studentProfile?.universityName || "").toLowerCase();
        const studentNum = (app.student.studentProfile?.studentNumber || "").toLowerCase();
        const propTitle = app.property.title.toLowerCase();
        if (!fullName.includes(q) && !email.includes(q) && !university.includes(q) && !studentNum.includes(q) && !propTitle.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [applications, activeTab, searchTerm]);

  // Update Status API Handler
  const updateStatus = async (
    applicationId: string,
    status: ApplicationItem["status"],
    extraPayload: Record<string, any> = {}
  ) => {
    setBusyId(applicationId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/landlord/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          status,
          ...extraPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update application status");
      }

      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status,
                ...extraPayload,
              }
            : a
        )
      );

      setSuccessMessage(
        status === "OFFER_MADE"
          ? "Room offer transmitted to student successfully!"
          : status === "ACCEPTED"
          ? "Application approved and student placed!"
          : status === "UNDER_REVIEW"
          ? "Application moved to Under Review queue."
          : "Application updated."
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenOfferModal = (app: ApplicationItem) => {
    setOfferApp(app);
    const suggestedRent = app.roomListing?.monthlyRent || 4900;
    const suggestedRoom = app.roomListing?.name || "Standard Single Bed";
    setOfferForm({
      offeredRoomName: suggestedRoom,
      offeredMonthlyRent: Number(suggestedRent),
      leaseStartDate: "2026-02-01",
      leaseEndDate: "2026-11-30",
      landlordNotes: "NSFAS / Bursary accredited placement offer. Includes uncapped Wi-Fi, laundry access, and backup power.",
    });
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerApp) return;

    await updateStatus(offerApp.id, "OFFER_MADE", {
      offeredRoomName: offerForm.offeredRoomName,
      offeredMonthlyRent: Number(offerForm.offeredMonthlyRent),
      leaseStartDate: offerForm.leaseStartDate,
      leaseEndDate: offerForm.leaseEndDate,
      landlordNotes: offerForm.landlordNotes,
    });

    setOfferApp(null);
  };

  const handleSubmitDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineApp) return;

    await updateStatus(declineApp.id, "REJECTED", {
      rejectionReason: declineReason || "Capacity reached for this room category.",
    });

    setDeclineApp(null);
    setDeclineReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#005F56] bg-[#005F56]/10 px-2.5 py-0.5 rounded-md border border-[#005F56]/20">
              Student Placement Command
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {applications.length} Total Applications
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Manage Inbound Applications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review student academic KYC dossiers, issue official room offers, and confirm student placements.
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
          <LuShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center gap-2">
          <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stage Pipeline Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL" as const, label: "All Inbound", count: counts.all },
          { id: "PENDING" as const, label: "Pending Review", count: counts.pending },
          { id: "UNDER_REVIEW" as const, label: "Under Review", count: counts.underReview },
          { id: "OFFER_MADE" as const, label: "Offers Transmitted", count: counts.offerMade },
          { id: "ACCEPTED" as const, label: "Placed & Signed", count: counts.accepted },
          { id: "REJECTED" as const, label: "Declined", count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#005F56] text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, student number, university, or residence..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] placeholder-slate-400"
          />
          <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Applications Stream List */}
      {filteredApplications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-white space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#005F56]/10 text-[#005F56] flex items-center justify-center mx-auto">
            <LuUsers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Applications in this Queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no student applications matching the selected pipeline stage or search query.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const studentProf = app.student.studentProfile;
            const isNsfas =
              studentProf?.fundingType === "NSFAS" ||
              (studentProf?.bursaryName && /nsfas/i.test(studentProf.bursaryName));

            const isBusy = busyId === app.id;

            return (
              <div
                key={app.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-[#005F56]/40 transition-all shadow-xs space-y-4"
              >
                {/* Top Row: Student Info, Status Badge & Timestamp */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#005F56]/10 text-[#005F56] font-black text-sm flex items-center justify-center shrink-0 border border-[#005F56]/20">
                      {app.student.name.charAt(0)}
                      {app.student.surname.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900">
                          {app.student.name} {app.student.surname}
                        </h3>
                        {isNsfas && (
                          <span className="px-2 py-0.5 rounded-md bg-[#005F56]/10 text-[#005F56] text-[10px] font-bold">
                            NSFAS Funded
                          </span>
                        )}
                        {studentProf?.yearOfStudy && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                            Year {studentProf.yearOfStudy}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <LuSchool className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {studentProf?.universityName || "Higher Education Student"}
                          {studentProf?.studentNumber ? ` · #${studentProf.studentNumber}` : ""}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge & Timestamp */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    {app.status === "ACCEPTED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        <LuCheck className="w-3 h-3 text-emerald-600" />
                        <span>Tenancy Confirmed</span>
                      </span>
                    ) : app.status === "OFFER_MADE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                        <LuSend className="w-3 h-3 text-blue-600" />
                        <span>Offer Transmitted</span>
                      </span>
                    ) : app.status === "UNDER_REVIEW" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                        <LuClock className="w-3 h-3 text-purple-600" />
                        <span>Under Review</span>
                      </span>
                    ) : app.status === "REJECTED" || app.status === "CANCELLED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
                        <LuX className="w-3 h-3 text-rose-600" />
                        <span>{app.status === "CANCELLED" ? "Cancelled by Student" : "Declined"}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>New Application</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400">
                      Applied {new Date(app.createdAt).toLocaleDateString("en-ZA")}
                    </span>
                  </div>
                </div>

                {/* Middle Details Grid: Property, Room, Funding, Offer Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Target Residence &amp; Room
                    </span>
                    <p className="font-bold text-slate-900 truncate">{app.property.title}</p>
                    <p className="text-slate-500 truncate">
                      {app.roomListing ? `${app.roomListing.name} (${app.roomListing.roomType})` : "Standard Accommodation"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Funding &amp; Financials
                    </span>
                    <p className="font-bold text-slate-900">
                      {isNsfas ? "NSFAS Bursary" : studentProf?.fundingType || "Self-Funded / Private"}
                    </p>
                    <p className="text-slate-500">
                      Rate: R{Number(app.offeredMonthlyRent || app.roomListing?.monthlyRent || 0).toLocaleString()}/month
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Placement Status &amp; Lease
                    </span>
                    {app.offeredRoomName ? (
                      <p className="font-bold text-[#005F56] truncate">
                        Offered: {app.offeredRoomName}
                      </p>
                    ) : (
                      <p className="font-semibold text-slate-600">No room assigned yet</p>
                    )}
                    {app.leaseStartDate && (
                      <p className="text-slate-500 text-[11px]">
                        Lease: {new Date(app.leaseStartDate).toLocaleDateString("en-ZA")} –{" "}
                        {app.leaseEndDate ? new Date(app.leaseEndDate).toLocaleDateString("en-ZA") : "Nov 2026"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Student Inbound Message if provided */}
                {app.message && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                    <LuFileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{app.message}</span>
                  </div>
                )}

                {/* Bottom Action Ribbon */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setViewDossierApp(app)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:border-[#005F56] hover:text-[#005F56] text-xs font-bold transition-all cursor-pointer"
                  >
                    <LuEye className="w-3.5 h-3.5" />
                    <span>View Student Dossier</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Move to Under Review */}
                    {(app.status === "PENDING" || app.status === "SUBMITTED") && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(app.id, "UNDER_REVIEW")}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Start Review
                      </button>
                    )}

                    {/* Make Room Offer */}
                    {(app.status === "PENDING" || app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleOpenOfferModal(app)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <LuSend className="w-3.5 h-3.5" />
                        <span>Make Room Offer</span>
                      </button>
                    )}

                    {/* Direct Accept */}
                    {(app.status === "PENDING" || app.status === "SUBMITTED" || app.status === "UNDER_REVIEW" || app.status === "OFFER_MADE") && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateStatus(app.id, "ACCEPTED")}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <LuCheck className="w-3.5 h-3.5" />
                        <span>Direct Place</span>
                      </button>
                    )}

                    {/* Decline */}
                    {app.status !== "REJECTED" && app.status !== "CANCELLED" && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setDeclineApp(app)}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL 1: VIEW STUDENT DOSSIER ================= */}
      {viewDossierApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Student Academic &amp; KYC Dossier</h3>
                <p className="text-xs text-slate-500">Verified student profile details &amp; funding status.</p>
              </div>
              <button
                type="button"
                onClick={() => setViewDossierApp(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#005F56]/10 text-[#005F56] font-black text-base flex items-center justify-center border border-[#005F56]/20">
                    {viewDossierApp.student.name.charAt(0)}
                    {viewDossierApp.student.surname.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {viewDossierApp.student.name} {viewDossierApp.student.surname}
                    </h4>
                    <p className="text-slate-500">
                      {viewDossierApp.student.studentProfile?.universityName || "Enrolled Student"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Personal Email:</span>
                    <span className="font-semibold text-slate-800">{viewDossierApp.student.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Student Number:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {viewDossierApp.student.studentProfile?.studentNumber || "Not recorded"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone Number:</span>
                    <span className="font-semibold text-slate-800">
                      {viewDossierApp.student.studentProfile?.phoneNumber || "Not recorded"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Funding Type:</span>
                    <span className="font-semibold text-[#005F56]">
                      {viewDossierApp.student.studentProfile?.fundingType || "NSFAS / Self-Funded"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next of Kin / Emergency Contact
                </span>
                <p className="font-semibold text-slate-800">
                  {viewDossierApp.student.studentProfile?.emergencyContactName || "Guardian on File"}
                </p>
                <p className="text-slate-500">
                  {viewDossierApp.student.studentProfile?.emergencyContactPhone || "Available upon tenancy activation"}
                </p>
              </div>

              {/* Application Details */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Requested Residence
                </span>
                <p className="font-bold text-slate-900">{viewDossierApp.property.title}</p>
                <p className="text-slate-600">
                  {viewDossierApp.roomListing?.name} (R{Number(viewDossierApp.roomListing?.monthlyRent || 0).toLocaleString()}/month)
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewDossierApp(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: MAKE ROOM OFFER ================= */}
      {offerApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-5 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Make Official Room Offer</h3>
                <p className="text-xs text-slate-500">
                  Allocating to {offerApp.student.name} {offerApp.student.surname}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOfferApp(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Assigned Room / Unit Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={offerForm.offeredRoomName}
                  onChange={(e) => setOfferForm({ ...offerForm, offeredRoomName: e.target.value })}
                  placeholder="e.g. Room 102 - Ensuite Single"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Monthly Rent Rate (ZAR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={offerForm.offeredMonthlyRent}
                  onChange={(e) => setOfferForm({ ...offerForm, offeredMonthlyRent: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Lease Start Date</label>
                  <input
                    type="date"
                    required
                    value={offerForm.leaseStartDate}
                    onChange={(e) => setOfferForm({ ...offerForm, leaseStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Lease End Date</label>
                  <input
                    type="date"
                    required
                    value={offerForm.leaseEndDate}
                    onChange={(e) => setOfferForm({ ...offerForm, leaseEndDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Offer Terms &amp; Landlord Notes
                </label>
                <textarea
                  rows={3}
                  value={offerForm.landlordNotes}
                  onChange={(e) => setOfferForm({ ...offerForm, landlordNotes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOfferApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busyId === offerApp.id}
                  className="px-5 py-2 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  Transmit Room Offer →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: DECLINE APPLICATION ================= */}
      {declineApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-rose-900">Decline Application</h3>
                <p className="text-xs text-slate-500">
                  Student: {declineApp.student.name} {declineApp.student.surname}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeclineApp(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDecline} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Reason for Declining (Optional)
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Fully booked for 2026 academic year, gender wing full..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeclineApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={busyId === declineApp.id}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

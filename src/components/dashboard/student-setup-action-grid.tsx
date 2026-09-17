"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DashedCircleIcon,
  CompletedCheckIcon,
  ArrowRightIcon,
  BuildingIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "@/components/common/Icons";

export interface SetupCardItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  isCompleted?: boolean;
  isSkipped?: boolean;
}

interface StudentSetupActionGridProps {
  user?: {
    name: string;
    surname: string;
    email: string;
    studentNumber?: string | null;
    universityName?: string | null;
    fundingType?: string | null;
  };
}

export default function StudentSetupActionGrid({
  user = {
    name: "Lerato",
    surname: "Nkosi",
    email: "student@example.com",
    studentNumber: "2489102",
    universityName: "University of the Witwatersrand (Wits)",
    fundingType: "NSFAS",
  },
}: StudentSetupActionGridProps) {
  const [cards, setCards] = useState<SetupCardItem[]>([
    {
      id: "university_domain",
      title: "Verify University Domain",
      description: "Instant enrollment authentication via @students.wits.ac.za domain handshake.",
      actionText: "Check verification",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "funder_profile",
      title: "Complete Funder Profile",
      description: "Link your NSFAS reference number or corporate bursary and household income bracket.",
      actionText: "Edit funding",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "personal_kyc",
      title: "Personal & Contact KYC",
      description: "Confirm your South African ID number, phone, and emergency guardian declaration.",
      actionText: "Review KYC",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "browse_residences",
      title: "Browse Accredited Units",
      description: "Explore accredited student housing with 13-point municipal safety ratings near campus.",
      actionText: "Browse residences",
      isCompleted: false,
      isSkipped: false,
    },
    {
      id: "single_application",
      title: "Submit Single-Profile Application",
      description: "Apply across multiple accommodation providers with one verified application profile.",
      actionText: "Start application",
      isCompleted: false,
      isSkipped: false,
    },
    {
      id: "funder_qr_letter",
      title: "Generate Funder QR Letter",
      description: "Auto-issue your tamper-proof SHA-256 confirmation letter upon tenancy approval.",
      actionText: "View letter status",
      isCompleted: false,
      isSkipped: false,
    },
  ]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [applicationSent, setApplicationSent] = useState(false);
  const [coverNote, setCoverNote] = useState("");

  const targetResidences = [
    {
      id: "RES-101",
      name: "Braamfontein Student Loft",
      suburb: "Braamfontein",
      distance: "0.8 km to Wits",
      rate: "R 4,800/mo",
      safetyScore: "9.2/10 (Grade A)",
      landlord: "Sipho Dlamini",
    },
    {
      id: "RES-102",
      name: "Kingsway Heights Student Living",
      suburb: "Auckland Park",
      distance: "0.4 km to UJ",
      rate: "R 4,500/mo",
      safetyScore: "9.0/10 (Grade A)",
      landlord: "Apex Student Living",
    },
    {
      id: "RES-103",
      name: "Parktown Medical & Law Residence",
      suburb: "Parktown",
      distance: "0.5 km to Wits Med",
      rate: "R 5,200/mo",
      safetyScore: "9.4/10 (Grade A)",
      landlord: "South Point REIT",
    },
  ];

  const handleAction = (id: string) => {
    if (id === "browse_residences") {
      window.location.href = "/properties";
      return;
    }
    setActiveModal(id);
  };

  const handleSkip = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isSkipped: true } : c)));
  };

  const handleCompleteModal = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isCompleted: true } : c)));
    setActiveModal(null);
  };

  const handleApplyToProperty = (prop: any) => {
    setSelectedProperty(prop);
    setActiveModal("apply_property_modal");
    setApplicationSent(false);
  };

  const handleConfirmApplication = () => {
    setApplicationSent(true);
    setTimeout(() => {
      setCards((prev) =>
        prev.map((c) => (c.id === "single_application" ? { ...c, isCompleted: true } : c))
      );
      setActiveModal(null);
      setApplicationSent(false);
    }, 1800);
  };

  const completedCount = cards.filter((c) => c.isCompleted || c.isSkipped).length;
  const totalCount = cards.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Onboarding Progress Card */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#0F172A] md:text-xl">
            Finish setting up your student profile &amp; housing applications
          </h2>
          <p className="text-sm text-[#64748B]">
            Complete or review these steps to unlock instant funder QR letters and submit to multiple accredited
            providers with a single profile.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <div className="h-2 w-full max-w-md rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#2B7FFF] transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-medium text-[#64748B] pl-4">
              {completedCount} of {totalCount} completed
            </span>
          </div>
        </div>
      </div>

      {/* 2 Rows x 3 Columns Action Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-6 min-h-[190px] shadow-xs transition-all hover:border-[#CBD5E1]"
          >
            <div>
              {/* Top Icon & Status Row */}
              <div className="flex items-center justify-between">
                {card.isCompleted ? <CompletedCheckIcon size={24} /> : <DashedCircleIcon size={24} />}

                {card.isCompleted && <span className="text-xs font-semibold text-[#10B981]">Completed</span>}

                {card.isSkipped && !card.isCompleted && (
                  <span className="text-xs font-medium text-[#64748B]">Skipped</span>
                )}
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3
                  className={`text-sm md:text-base font-semibold ${
                    card.isCompleted ? "text-[#64748B]/80 line-through" : "text-[#0F172A]"
                  }`}
                >
                  {card.title}
                </h3>
                <p
                  className={`mt-1 text-xs md:text-sm leading-relaxed ${
                    card.isCompleted ? "text-[#64748B]/70" : "text-[#64748B]"
                  }`}
                >
                  {card.description}
                </p>
              </div>
            </div>

            {/* Bottom Action Row */}
            {!card.isCompleted && (
              <div className="mt-5 flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleAction(card.id)}
                  className="inline-flex items-center gap-1.5 rounded-[0.5rem] border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-medium text-[#0F172A] shadow-2xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  <span>{card.actionText}</span>
                  <ArrowRightIcon size={12} />
                </button>

                <button
                  type="button"
                  onClick={() => handleSkip(card.id)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer px-1 py-1"
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Target Accommodations Quick Queue */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Accredited Residences Near Your Campus</h3>
            <p className="text-xs text-[#64748B]">
              Apply immediately using your single verified student profile.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] hover:underline"
          >
            <span>Explore all 24+ units</span>
            <ArrowRightIcon size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-3">Residence</th>
                <th className="py-3 px-3">Location &amp; Distance</th>
                <th className="py-3 px-3">Safety Rating</th>
                <th className="py-3 px-3">Monthly Rent</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155] font-medium">
              {targetResidences.map((res) => (
                <tr key={res.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#0F172A]">{res.name}</div>
                    <div className="text-[11px] text-[#94A3B8]">Operator: {res.landlord}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>{res.suburb}</div>
                    <div className="text-[11px] text-[#6366F1]">{res.distance}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full text-[11px]">
                      {res.safetyScore}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold text-[#0F172A]">{res.rate}</td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => handleApplyToProperty(res)}
                      className="px-3.5 py-1.5 rounded-[0.5rem] bg-gradient-to-br from-[#7C3AED] to-[#9333EA] hover:opacity-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Apply with 1-Click</span>
                      <ArrowRightIcon size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Action Modals */}
      {activeModal === "apply_property_modal" && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#0F172A]">
              1-Click Application: {selectedProperty.name}
            </h3>

            {applicationSent ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CompletedCheckIcon size={28} />
                </div>
                <h4 className="text-base font-bold text-[#0F172A]">Application Successfully Dispatched!</h4>
                <p className="text-xs text-[#64748B]">
                  Your verified student KYC &amp; NSFAS funding profile have been routed to {selectedProperty.landlord}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-[#0F172A]">
                    <span>{user.name} {user.surname} ({user.studentNumber})</span>
                    <span className="text-[#10B981] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded text-[10px]">
                      Profile Verified
                    </span>
                  </div>
                  <div className="text-[#64748B] flex flex-col gap-0.5">
                    <span>Institution: <strong>{user.universityName}</strong></span>
                    <span>Funding Body: <strong>{user.fundingType} Direct Allowance</strong></span>
                    <span>Monthly Rate: <strong>{selectedProperty.rate}</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-[#0F172A]">Cover Note for Landlord (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Looking for single room, ready for immediate move-in..."
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#E5E7EB] p-3 focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-[0.5rem] border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApplication}
                    className="rounded-[0.5rem] bg-gradient-to-br from-[#7C3AED] to-[#9333EA] hover:opacity-95 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                  >
                    Submit Verified Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* General Step Modal */}
      {activeModal && activeModal !== "apply_property_modal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#0F172A]">
              {cards.find((c) => c.id === activeModal)?.title}
            </h3>
            <p className="mt-2 text-sm text-[#64748B]">
              {cards.find((c) => c.id === activeModal)?.description}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-[0.5rem] border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteModal(activeModal)}
                className="rounded-[0.5rem] bg-gradient-to-br from-[#7C3AED] to-[#9333EA] hover:opacity-95 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
              >
                Mark as Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

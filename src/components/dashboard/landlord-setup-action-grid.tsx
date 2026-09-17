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

interface LandlordSetupActionGridProps {
  user?: {
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function LandlordSetupActionGrid({
  user = {
    name: "Sipho",
    surname: "Dlamini",
    email: "landlord@example.com",
    entityType: "Private Residence Operator",
  },
}: LandlordSetupActionGridProps) {
  const [cards, setCards] = useState<SetupCardItem[]>([
    {
      id: "business_kyc",
      title: "Business KYC & Identity",
      description: "Submit individual or company details, RSA ID / CIPC number, and verified contact.",
      actionText: "Review identity",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "primary_residence",
      title: "Primary Residence Profile",
      description: "Set up student room capacity, monthly rental rates, and nearest university campus.",
      actionText: "Edit residence",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "safety_audit",
      title: "13-Point Municipal Safety Audit",
      description: "Audit fire extinguishers, smoke alarms, biometric access, and electrical CoC.",
      actionText: "View score: 9.2",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "custom_addenda",
      title: "Configure Custom Application Addenda",
      description: "Inject landlord-specific requirements (e.g. medical disclosure, guarantor affidavits).",
      actionText: "Setup addenda",
      isCompleted: false,
      isSkipped: false,
    },
    {
      id: "inbound_applications",
      title: "Process Inbound Applications",
      description: "Review pre-verified applicant profiles and bind active tenancy lease agreements.",
      actionText: "Review applicants",
      isCompleted: false,
      isSkipped: false,
    },
    {
      id: "maintenance_board",
      title: "Activate SLA Maintenance Board",
      description: "Track and resolve student repair tickets within monitored 48-hour response timers.",
      actionText: "Open SLA board",
      isCompleted: false,
      isSkipped: false,
    },
  ]);

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [applications, setApplications] = useState([
    {
      id: "APP-891",
      studentName: "Lerato Nkosi",
      studentNumber: "2489102",
      institution: "University of the Witwatersrand",
      funder: "NSFAS Direct (R4,800/mo)",
      unit: "Braamfontein Student Loft (Unit 4B)",
      status: "PENDING",
    },
    {
      id: "APP-892",
      studentName: "Kagiso Molefe",
      studentNumber: "2198045",
      institution: "University of Johannesburg",
      funder: "Funded - Sasol Bursary (R5,500/mo)",
      unit: "Braamfontein Student Loft (Unit 2A)",
      status: "PENDING",
    },
  ]);

  const handleAction = (id: string) => {
    setActiveModal(id);
  };

  const handleSkip = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isSkipped: true } : c)));
  };

  const handleCompleteModal = (id: string) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isCompleted: true } : c)));
    setActiveModal(null);
  };

  const handleAppDecision = (id: string, decision: "ACCEPTED" | "REJECTED") => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: decision } : app))
    );
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
            Finish setting up your accredited residence &amp; application desk
          </h2>
          <p className="text-sm text-[#64748B]">
            Complete or review these steps to unlock accredited student trust badges and automated lease confirmation
            dispatch.
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <div className="h-2 w-full max-w-md rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10B981] transition-all duration-500 ease-out"
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

      {/* Inbound Applications Desk */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Inbound Student Applications Desk</h3>
            <p className="text-xs text-[#64748B]">
              Pre-verified student profiles awaiting tenancy confirmation and lease binding.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F1F5F9] text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                <th className="py-3 px-3">Applicant</th>
                <th className="py-3 px-3">Institution &amp; Funder</th>
                <th className="py-3 px-3">Requested Room</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-[#334155] font-medium">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#0F172A]">{app.studentName}</div>
                    <div className="text-[11px] text-[#94A3B8]">ID: {app.studentNumber}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div>{app.institution}</div>
                    <div className="text-[11px] text-[#059669] font-semibold">{app.funder}</div>
                  </td>
                  <td className="py-3.5 px-3">{app.unit}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.status === "ACCEPTED"
                          ? "bg-[#ECFDF5] text-[#059669]"
                          : app.status === "REJECTED"
                          ? "bg-[#FEF2F2] text-[#DC2626]"
                          : "bg-[#FFFBEB] text-[#D97706]"
                      }`}
                    >
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    {app.status === "PENDING" ? (
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleAppDecision(app.id, "ACCEPTED")}
                          className="px-3 py-1 rounded-[0.5rem] bg-[#059669] hover:bg-[#047857] text-white text-[11px] font-semibold shadow-xs"
                        >
                          Accept &amp; Bind Lease
                        </button>
                        <button
                          onClick={() => handleAppDecision(app.id, "REJECTED")}
                          className="px-2.5 py-1 rounded-[0.5rem] border border-[#E5E7EB] hover:bg-[#FEF2F2] text-[#DC2626] text-[11px] font-semibold"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-[#94A3B8] font-bold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Modal */}
      {activeModal && (
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
                className="rounded-[0.5rem] bg-gradient-to-br from-[#059669] to-[#10B981] hover:opacity-95 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
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

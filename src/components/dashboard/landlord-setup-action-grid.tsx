"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DashedCircleIcon,
  CompletedCheckIcon,
  ArrowRightIcon,
  BuildingIcon,
  ShieldCheckIcon,
  FileTextIcon,
} from "@/components/common/Icons";
import { LuPlus, LuBuilding2, LuShield, LuUsers } from "react-icons/lu";

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
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
  initialProperties?: any[];
  initialApplications?: any[];
}

export default function LandlordSetupActionGrid({
  user = {
    name: "Sipho",
    surname: "Dlamini",
    email: "landlord@example.com",
    entityType: "Private Residence Operator",
  },
  initialProperties = [],
  initialApplications = [],
}: LandlordSetupActionGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [applications, setApplications] = useState<any[]>(
    initialApplications.length > 0
      ? initialApplications
      : [
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
        ]
  );

  const hasProperties = properties.length > 0;
  const bestSafetyScore = properties.find((p) => p.safetyScore !== null)?.safetyScore;

  const [cards, setCards] = useState<SetupCardItem[]>([
    {
      id: "business_kyc",
      title: "Business KYC & Provider Profile",
      description: "Accredited provider operating credentials and verified contact address.",
      actionText: "Review profile",
      isCompleted: true,
      isSkipped: false,
    },
    {
      id: "primary_residence",
      title: "Student Residence Listings",
      description: hasProperties
        ? `${properties.length} active residence listing(s) configured in your portfolio.`
        : "Add student room capacity, monthly rental rates, and campus proximity.",
      actionText: hasProperties ? `Manage (${properties.length})` : "+ Add residence",
      isCompleted: hasProperties,
      isSkipped: false,
    },
    {
      id: "safety_audit",
      title: "13-Point Municipal Safety Audit",
      description: bestSafetyScore
        ? `Audit completed. Verified Safety Rating: ${Number(bestSafetyScore).toFixed(1)}/10.`
        : "Complete perimeter, fire extinguisher, and electrical CoC safety checks.",
      actionText: bestSafetyScore ? `Score: ${Number(bestSafetyScore).toFixed(1)}` : "Audit safety",
      isCompleted: !!bestSafetyScore,
      isSkipped: false,
    },
    {
      id: "custom_addenda",
      title: "Configure Custom Lease Addenda",
      description: "Inject landlord-specific requirements (e.g. house rules, quiet hours, deposit policies).",
      actionText: "Setup addenda",
      isCompleted: false,
      isSkipped: false,
    },
    {
      id: "inbound_applications",
      title: "Process Inbound Applications",
      description: "Review pre-verified applicant profiles and bind active tenancy lease agreements.",
      actionText: "Review applicants",
      isCompleted: applications.some((a) => a.status === "ACCEPTED"),
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

  const handleAction = (id: string) => {
    if (id === "primary_residence") {
      if (hasProperties) {
        router.push("/landlord/properties");
      } else {
        router.push("/landlord/properties/new");
      }
      return;
    }
    if (id === "safety_audit") {
      if (hasProperties) {
        router.push("/landlord/properties");
      } else {
        router.push("/landlord/properties/new");
      }
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

  const handlePropertyCreated = (newProp: any) => {
    setProperties((prev) => [newProp, ...prev]);
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === "primary_residence") {
          return {
            ...c,
            isCompleted: true,
            description: `${properties.length + 1} active residence listing(s) in your portfolio.`,
            actionText: `Manage (${properties.length + 1})`,
          };
        }
        if (c.id === "safety_audit" && newProp.safetyScore) {
          return {
            ...c,
            isCompleted: true,
            description: `Audit completed. Verified Safety Rating: ${Number(newProp.safetyScore).toFixed(1)}/10.`,
            actionText: `Score: ${Number(newProp.safetyScore).toFixed(1)}`,
          };
        }
        return c;
      })
    );
  };

  const handleAppDecision = async (id: string, decision: "ACCEPTED" | "REJECTED") => {
    setProcessingId(id);
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: decision } : app))
    );
    if (decision === "ACCEPTED") {
      setCards((prev) =>
        prev.map((c) => (c.id === "inbound_applications" ? { ...c, isCompleted: true } : c))
      );
    }

    try {
      const res = await fetch("/api/landlord/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, status: decision }),
      });
      if (res.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (err) {
      console.error("Failed to update application status:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const completedCount = cards.filter((c) => c.isCompleted || c.isSkipped).length;
  const totalCount = cards.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      
      {/* Onboarding Progress Card with Fast Action Button */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              Provider Setup Tracker
            </span>
            <span className="text-xs text-gray-400">
              {completedCount} of {totalCount} completed ({percentage}%)
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#0F172A] md:text-xl">
            Accredited Residence Operations Dashboard
          </h2>
          <p className="text-xs md:text-sm text-[#64748B]">
            Manage your student properties, track safety compliance scores, and process verified lease confirmations.
          </p>

          <div className="pt-2">
            <div className="h-2 w-full max-w-md rounded-full bg-[#E5E7EB] overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Add New Residence</span>
          </Link>
        </div>
      </div>

      {/* 2 Rows x 3 Columns Action Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-6 min-h-[190px] shadow-xs transition-all hover:border-[#CBD5E1]"
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
                    card.isCompleted ? "text-[#64748B]/80 font-bold" : "text-[#0F172A]"
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
            <div className="mt-5 flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleAction(card.id)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] shadow-xs hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <span>{card.actionText}</span>
                <ArrowRightIcon size={12} />
              </button>

              {!card.isCompleted && (
                <button
                  type="button"
                  onClick={() => handleSkip(card.id)}
                  className="text-xs text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer px-1 py-1"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Inbound Applications Desk */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
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
                          disabled={processingId === app.id}
                          onClick={() => handleAppDecision(app.id, "ACCEPTED")}
                          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-[11px] font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1 transition-all"
                        >
                          {processingId === app.id ? (
                            <>
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <span>Accept &amp; Bind Lease</span>
                          )}
                        </button>
                        <button
                          disabled={processingId === app.id}
                          onClick={() => handleAppDecision(app.id, "REJECTED")}
                          className="px-2.5 py-1 rounded-xl border border-[#E5E7EB] hover:bg-rose-50 text-rose-600 disabled:opacity-60 text-[11px] font-semibold cursor-pointer transition-all"
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

      {/* Generic Setup Item Modal */}
      {activeModal && activeModal !== "primary_residence" && (
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
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCompleteModal(activeModal)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
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

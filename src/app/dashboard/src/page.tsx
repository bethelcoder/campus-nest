"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  ShieldAlert,
  AlertOctagon,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  HeartHandshake,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Award,
  ChevronRight,
  Send,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function SrcCrisisDashboardPage() {
  const [activeStatusFilter, setActiveStatusFilter] = useState<"ALL" | "OPEN" | "UNDER_INTERVENTION" | "RESOLVED">(
    "ALL"
  );

  // Mock Active Grievance Cases
  const [disputes, setDisputes] = useState([
    {
      id: "SRC-CRISIS-2026-089",
      type: "ILLEGAL_EVICTION",
      severity: "CRITICAL_EMERGENCY",
      status: "UNDER_INTERVENTION",
      studentName: "Thandi Khumalo",
      studentNumber: "2489102",
      institution: "University of the Witwatersrand",
      property: "Doornfontein Commune Complex",
      landlord: "Direct Private Owner",
      summary: "Power and water disconnected; landlord issuing lock-out threats during mid-term test cycle.",
      interventionNotes: "Legal aid representative assigned; interim restraining notice served to property manager.",
      reportedAt: "2026-02-16 08:20",
    },
    {
      id: "SRC-CRISIS-2026-088",
      type: "EXTORTION",
      severity: "HIGH",
      status: "OPEN",
      studentName: "Michael van der Merwe",
      studentNumber: "2198045",
      institution: "University of Johannesburg",
      property: "Kingsway Annex",
      landlord: "Private Residence Agency",
      summary: "Manager demanding R500 cash fee for key handover despite full NSFAS direct deposit guarantee.",
      interventionNotes: "Awaiting statement confirmation from student.",
      reportedAt: "2026-02-15 17:45",
    },
    {
      id: "SRC-CRISIS-2026-074",
      type: "DISCRIMINATION",
      severity: "HIGH",
      status: "RESOLVED",
      studentName: "Amara Diallo",
      studentNumber: "2301984",
      institution: "University of Cape Town",
      property: "Observatory Student House",
      landlord: "South Peninsula Properties",
      summary: "Unfair exclusion from communal kitchen facilities based on nationality.",
      interventionNotes: "Landlord attended mediation with SRC Sub-council. Disciplinary warning logged; full access restored.",
      reportedAt: "2026-02-10 14:00",
    },
  ]);

  // Ethical Housing Operators Metric
  const ethicalOperators = [
    { name: "Braamfontein Living Lofts", score: 9.8, disputeResolutionRate: "100%", status: "CERTIFIED_ETHICAL" },
    { name: "Apex Student Living", score: 9.4, disputeResolutionRate: "98%", status: "CERTIFIED_ETHICAL" },
    { name: "South Point Housing REIT", score: 9.1, disputeResolutionRate: "95%", status: "CERTIFIED_ETHICAL" },
  ];

  const handleStatusUpdate = (id: string, newStatus: "OPEN" | "UNDER_INTERVENTION" | "RESOLVED") => {
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d)));
  };

  const filteredDisputes =
    activeStatusFilter === "ALL" ? disputes : disputes.filter((d) => d.status === activeStatusFilter);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-poppins">
      <Navbar userRole="SRC_REPRESENTATIVE" userName="SRC Executive Desk" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-navy-950 to-purple-900 text-white shadow-xl border border-purple-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="purple" size="sm" icon={<Scale className="w-3.5 h-3.5 mr-1" />}>
                SRC Housing Ombudsman Hub
              </Badge>
              <Badge variant="danger" size="sm">
                Emergency Crisis Protocol Active
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              SRC Crisis &amp; Tenancy Protection Tribunal
            </h1>
            <p className="text-xs text-slate-300">
              Direct emergency intervention pipeline for human rights violations, unlawful lockouts, and extortion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-700 text-center">
              <div className="text-xl font-extrabold text-amber-300">
                {disputes.filter((d) => d.status === "OPEN").length}
              </div>
              <div className="text-[10px] text-purple-200">Open Emergencies</div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-700 text-center">
              <div className="text-xl font-extrabold text-blue-300">
                {disputes.filter((d) => d.status === "UNDER_INTERVENTION").length}
              </div>
              <div className="text-[10px] text-purple-200">Under Legal Action</div>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-700 text-center">
              <div className="text-xl font-extrabold text-emerald-300">
                {disputes.filter((d) => d.status === "RESOLVED").length}
              </div>
              <div className="text-[10px] text-purple-200">Resolved</div>
            </div>
          </div>
        </div>

        {/* Section 1: Active Cases Pipeline with Status Hooks */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Crisis Interventions</h2>
              <p className="text-xs text-slate-500">
                Cases escalated from the student dual-track triage engine requiring immediate SRC assistance.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
              {(["ALL", "OPEN", "UNDER_INTERVENTION", "RESOLVED"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveStatusFilter(filter)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeStatusFilter === filter
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                  }`}
                >
                  {filter.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <Card
                key={dispute.id}
                variant="elevated"
                className={`border-l-4 p-6 space-y-4 ${
                  dispute.severity === "CRITICAL_EMERGENCY"
                    ? "border-l-red-600"
                    : dispute.severity === "HIGH"
                    ? "border-l-amber-500"
                    : "border-l-blue-500"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">
                      {dispute.id}
                    </Badge>
                    <Badge variant={dispute.severity === "CRITICAL_EMERGENCY" ? "danger" : "warning"} size="sm">
                      {dispute.type}
                    </Badge>
                    <Badge
                      variant={
                        dispute.status === "RESOLVED"
                          ? "success"
                          : dispute.status === "UNDER_INTERVENTION"
                          ? "info"
                          : "danger"
                      }
                      size="sm"
                    >
                      {dispute.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">{dispute.reportedAt}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Victim / Student:</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {dispute.studentName} ({dispute.studentNumber})
                    </div>
                    <div className="text-slate-500">{dispute.institution}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Respondent / Property:</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{dispute.property}</div>
                    <div className="text-slate-500">Operator: {dispute.landlord}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Intervention Status:</span>
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mt-1">
                      {dispute.interventionNotes}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-navy-900/60 border border-slate-200/80 dark:border-navy-800 leading-relaxed">
                  <strong>Incident Allegation:</strong> {dispute.summary}
                </p>

                {/* Case status tracking hooks */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-slate-400">
                    Logged to Public Ethical Housing Index &bull; DHET Compliance Notified
                  </span>
                  <div className="flex items-center gap-2">
                    {dispute.status !== "UNDER_INTERVENTION" && dispute.status !== "RESOLVED" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusUpdate(dispute.id, "UNDER_INTERVENTION")}
                      >
                        Initiate Intervention &rarr;
                      </Button>
                    )}
                    {dispute.status !== "RESOLVED" && (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => handleStatusUpdate(dispute.id, "RESOLVED")}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Mark Dispute Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 2: Community Ethics Metrics & Operator Index */}
        <div id="ethics" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <Card variant="elevated" className="lg:col-span-2 border-slate-200 dark:border-navy-700">
            <CardHeader className="border-b border-slate-100 dark:border-navy-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-500" />
                <CardTitle className="text-lg">Ethical Housing Operators Registry</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Community safety index tracking landlord compliance, dispute turnaround times, and student well-being.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {ethicalOperators.map((operator, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/40 text-xs"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{operator.name}</h4>
                    <span className="text-slate-500">
                      Dispute Resolution: <strong className="text-emerald-600">{operator.disputeResolutionRate}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="grade-a" size="sm">
                      Ethics Score: {operator.score}/10
                    </Badge>
                    <Badge variant="success" size="sm">
                      {operator.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Crisis Hotline & Legal Protocol */}
          <Card variant="elevated" className="border-slate-200 dark:border-navy-700 bg-purple-950 text-white p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-900 flex items-center justify-center text-purple-300">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">24/7 SRC Emergency Escrow</h3>
              <p className="text-xs text-purple-200 leading-relaxed mt-1">
                In cases of illegal lockouts or extortion, the SRC holds emergency mandate to freeze direct funder
                remittance to non-compliant operators until independent arbitration concludes.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-purple-900/60 border border-purple-800 text-xs font-mono text-purple-200">
              Emergency Dispatch: 0800-CAMPUS-SAFE
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

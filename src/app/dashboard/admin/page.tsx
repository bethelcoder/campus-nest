"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Users,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  BarChart3,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"KYC" | "PROPERTIES" | "ESCALATIONS">("KYC");

  // Mock KYC Review Queue
  const [kycQueue, setKycQueue] = useState([
    {
      id: "kyc-901",
      name: "Sipho Dlamini",
      role: "LANDLORD (SME)",
      email: "landlord@example.com",
      idOrCipc: "8504125192083",
      documentType: "RSA National ID SmartCard",
      submittedDate: "2026-02-15",
      status: "PENDING_REVIEW",
    },
    {
      id: "kyc-902",
      name: "Apex Student Living Pty Ltd",
      role: "LANDLORD (AGENCY)",
      email: "compliance@apexliving.co.za",
      idOrCipc: "2021/894012/07",
      documentType: "CIPC Registration & Tax PIN",
      submittedDate: "2026-02-14",
      status: "PENDING_REVIEW",
    },
  ]);

  // Mock Property Accreditation Controls
  const [propertyList, setPropertyList] = useState([
    {
      id: "prop-1",
      title: "Braamfontein Student Loft",
      landlord: "Sipho Dlamini",
      campus: "Wits (0.8km)",
      safetyScore: 9.2,
      grade: "Grade A",
      status: "VERIFIED",
    },
    {
      id: "prop-2",
      title: "Kingsway Heights Student Living",
      landlord: "Apex Student Living",
      campus: "UJ Auckland Park (0.4km)",
      safetyScore: 8.6,
      grade: "Grade B",
      status: "VERIFIED",
    },
    {
      id: "prop-3",
      title: "Doornfontein Commune Complex",
      landlord: "Direct Private Owner",
      campus: "UJ Doornfontein (1.2km)",
      safetyScore: 5.8,
      grade: "Grade E",
      status: "FLAGGED",
    },
  ]);

  // Mock Global Escalation Tickers
  const [escalations, setEscalations] = useState([
    {
      id: "ESC-401",
      reporter: "Thandi Khumalo (Wits Student)",
      property: "Doornfontein Commune Complex",
      type: "ILLEGAL_EVICTION",
      severity: "CRITICAL_EMERGENCY",
      summary: "Power disconnected & locks changed during exam week without 30-day notice",
      status: "UNDER_INTERVENTION",
      date: "2026-02-16 08:20",
    },
    {
      id: "ESC-402",
      reporter: "Michael van der Merwe (UJ Student)",
      property: "Kingsway Annex",
      type: "EXTORTION",
      severity: "HIGH",
      summary: "Manager demanding R500 cash fee for key handover despite full NSFAS deposit",
      status: "OPEN",
      date: "2026-02-15 17:45",
    },
  ]);

  const handleKycAction = (id: string, action: "APPROVED" | "REJECTED") => {
    setKycQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status: action } : item)));
  };

  const handlePropertyStatusToggle = (id: string, nextStatus: string) => {
    setPropertyList((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, status: nextStatus } : prop))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-poppins">
      <Navbar userRole="ADMIN" userName="Platform Admin" />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-navy-950 text-white shadow-lg border border-navy-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="navy" size="sm">
                Root System Controller
              </Badge>
              <Badge variant="purple" size="sm">
                Compliance Registry
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Platform Administrator Command Console
            </h1>
            <p className="text-xs text-slate-400">
              Auditing accreditation pipelines, verifying KYC files, and orchestrating university dispute escalations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-center">
              <div className="text-xl font-extrabold text-emerald-400">128</div>
              <div className="text-[10px] text-slate-400">Accredited Units</div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-center">
              <div className="text-xl font-extrabold text-amber-400">
                {kycQueue.filter((k) => k.status === "PENDING_REVIEW").length}
              </div>
              <div className="text-[10px] text-slate-400">Pending KYC</div>
            </div>
            <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-700 text-center">
              <div className="text-xl font-extrabold text-red-400">{escalations.length}</div>
              <div className="text-[10px] text-slate-400">Active Escalations</div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-1">
          <button
            onClick={() => setActiveTab("KYC")}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === "KYC"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300"
            }`}
          >
            KYC Verification Queue ({kycQueue.filter((k) => k.status === "PENDING_REVIEW").length})
          </button>
          <button
            onClick={() => setActiveTab("PROPERTIES")}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === "PROPERTIES"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300"
            }`}
          >
            Property Accreditation Registry
          </button>
          <button
            onClick={() => setActiveTab("ESCALATIONS")}
            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
              activeTab === "ESCALATIONS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300"
            }`}
          >
            Global Escalation Ticker ({escalations.length})
          </button>
        </div>

        {/* TAB 1: KYC Queue */}
        {activeTab === "KYC" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Identity &amp; CIPC Verification Queue
            </h3>

            <div className="space-y-3">
              {kycQueue.map((item) => (
                <Card key={item.id} variant="elevated" className="border-slate-200 dark:border-navy-700 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="navy" size="sm">
                          {item.role}
                        </Badge>
                        <Badge
                          variant={
                            item.status === "APPROVED"
                              ? "success"
                              : item.status === "REJECTED"
                              ? "danger"
                              : "warning"
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                        <span className="text-xs text-slate-400">Submitted {item.submittedDate}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{item.name}</h4>
                      <p className="text-xs text-slate-500">
                        {item.documentType}: <strong className="font-mono">{item.idOrCipc}</strong> &bull;{" "}
                        {item.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === "PENDING_REVIEW" ? (
                        <>
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() => handleKycAction(item.id, "APPROVED")}
                            leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          >
                            Approve KYC
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleKycAction(item.id, "REJECTED")}
                            leftIcon={<XCircle className="w-4 h-4" />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Processed</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Properties Registry */}
        {activeTab === "PROPERTIES" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Accredited Housing Stock &amp; Bylaw Controls
            </h3>

            <div className="space-y-3">
              {propertyList.map((prop) => (
                <Card key={prop.id} variant="elevated" className="border-slate-200 dark:border-navy-700 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={prop.grade === "Grade A" ? "grade-a" : prop.grade === "Grade B" ? "grade-b" : "grade-e"}
                          size="sm"
                        >
                          {prop.grade} ({prop.safetyScore}/10)
                        </Badge>
                        <Badge variant={prop.status === "VERIFIED" ? "success" : "danger"} size="sm">
                          {prop.status}
                        </Badge>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{prop.title}</h4>
                      <p className="text-xs text-slate-500">
                        Operator: {prop.landlord} &bull; Campus Proximity: {prop.campus}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {prop.status === "VERIFIED" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handlePropertyStatusToggle(prop.id, "FLAGGED")}
                        >
                          Flag Violation
                        </Button>
                      ) : (
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => handlePropertyStatusToggle(prop.id, "VERIFIED")}
                        >
                          Re-Accredit Property
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Global Escalations */}
        {activeTab === "ESCALATIONS" && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              High-Severity Incident Tickers (Synced with SRC Crisis Desk)
            </h3>

            <div className="space-y-3">
              {escalations.map((esc) => (
                <Card key={esc.id} variant="elevated" className="border-l-4 border-l-red-600 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" size="sm">
                          {esc.severity}
                        </Badge>
                        <Badge variant="navy" size="sm">
                          {esc.type}
                        </Badge>
                        <span className="text-xs text-slate-400">{esc.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{esc.summary}</h4>
                      <p className="text-xs text-slate-500">
                        Property: <strong>{esc.property}</strong> &bull; Reporter: {esc.reporter}
                      </p>
                    </div>

                    <Link href="/dashboard/src">
                      <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                        Open in SRC Desk
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

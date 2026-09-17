"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  QrCode,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  FileCheck2,
  Lock,
  Search,
  Building,
  School,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Timer,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";

const SA_UNIVERSITIES = [
  "All Campuses",
  "University of the Witwatersrand (Wits)",
  "University of Johannesburg (UJ)",
  "University of Cape Town (UCT)",
  "University of Pretoria (UP)",
  "Stellenbosch University (SU)",
  "University of KwaZulu-Natal (UKZN)",
  "Tshwane University of Technology (TUT)",
  "Cape Peninsula University of Technology (CPUT)",
  "North-West University (NWU)",
];

const INCOME_BRACKETS = [
  "Any Household Income",
  "R0 - R350,000 (NSFAS Full Bursary Eligible)",
  "R350,001 - R600,000 (Missing Middle Fund Eligible)",
  "R600,000+ (Self-Funded / Private Bursary)",
];

export default function StudentMarketingPage() {
  // Search Filter State
  const [selectedCampus, setSelectedCampus] = useState("All Campuses");
  const [selectedIncome, setSelectedIncome] = useState("Any Household Income");
  const [maxBudget, setMaxBudget] = useState("5500");

  // Trust Simulator State
  const [monthlyAllowance, setMonthlyAllowance] = useState(4800);
  const [funderType, setFunderType] = useState<"NSFAS" | "CORPORATE" | "UNIVERSITY">("NSFAS");

  const manualDays = funderType === "NSFAS" ? 28 : funderType === "CORPORATE" ? 21 : 14;
  const platformHours = 2; // Instant QR verification
  const savedDays = manualDays - Math.ceil(platformHours / 24);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 dark:border-navy-800 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-navy-900/60 dark:via-navy-950 dark:to-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>DHET Standards Aligned &bull; Cryptographic Funder Dispatch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-poppins leading-[1.15]">
              Safe Off-Campus Housing,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                Instantly Unlocked
              </span>{" "}
              Funding.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              No more waiting weeks for landlord verification letters. Secure accredited student housing with
              a municipal 13-point safety score, and generate instant, tamper-proof bursary confirmations.
            </p>

            {/* Interactive Search Bar Input Container */}
            <div className="mt-8 max-w-4xl mx-auto p-3 sm:p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-xl shadow-blue-500/5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                {/* Institution Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-blue-600" /> Target Campus
                  </label>
                  <select
                    value={selectedCampus}
                    onChange={(e) => setSelectedCampus(e.target.value)}
                    className="w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SA_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Household Income Bracket */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> Funding Tier
                  </label>
                  <select
                    value={selectedIncome}
                    onChange={(e) => setSelectedIncome(e.target.value)}
                    className="w-full text-sm font-semibold rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {INCOME_BRACKETS.map((inc) => (
                      <option key={inc} value={inc}>
                        {inc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Monthly Budget Tier */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" /> Max Rent: R{maxBudget}/mo
                    </label>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="9000"
                    step="250"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full accent-blue-600 cursor-pointer h-9 py-2"
                  />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 100% verified student housing matching
                  your bursary cap
                </span>
                <Link
                  href={`/properties?maxPrice=${maxBudget}&campus=${encodeURIComponent(
                    selectedCampus === "All Campuses" ? "" : selectedCampus
                  )}`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="primary" size="md" className="w-full sm:w-auto" rightIcon={<Search className="w-4 h-4" />}>
                    Search Verified Units
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Prop Matrix */}
      <section className="py-20 bg-white dark:bg-navy-900 border-b border-slate-200/80 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <Badge variant="navy" size="md">
              THE 3-TIER TRUST MATRIX
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-poppins">
              Built Specifically for South African Bursary Students
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Eliminating friction between universities, accreditation officers, and private landlords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tile 1: Domain Verification Handshake */}
            <Card variant="elevated" className="relative group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-inner">
                <School className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl mb-2">Domain Verification Handshake</CardTitle>
              <CardDescription className="text-sm leading-relaxed mb-4">
                Instant authentication using your official university email (e.g.{" "}
                <code className="text-xs bg-slate-100 dark:bg-navy-800 px-1.5 py-0.5 rounded text-blue-600">
                  @students.wits.ac.za
                </code>
                ). Auto-links your active enrollment status without tedious physical proof of registration.
              </CardDescription>
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" /> 26 Public Universities Supported
              </div>
            </Card>

            {/* Tile 2: 2-Step Safety Rating Badge */}
            <Card variant="elevated" className="relative group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl mb-2">2-Step Safety Rating Badge</CardTitle>
              <CardDescription className="text-sm leading-relaxed mb-4">
                Every property undergoes a municipal bylaw audit: biometric access, working fire extinguishers,
                burglar proofing, backup power, and perimeter CCTV. Ranked with transparent 0–100 Grade A to E
                scores.
              </CardDescription>
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 13-Point Municipal Safety Checklist
              </div>
            </Card>

            {/* Tile 3: Automated Cryptographic Confirmation Letter */}
            <Card variant="elevated" className="relative group overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 shadow-inner">
                <QrCode className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl mb-2">Automated Cryptographic QR Letter</CardTitle>
              <CardDescription className="text-sm leading-relaxed mb-4">
                Upon landlord tenancy acceptance, an official confirmation letter is sealed with a SHA-256 HMAC
                cryptographic hash and scannable QR code. Directly valid for NSFAS & corporate bursary disbursement.
              </CardDescription>
              <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <CheckCircle2 className="w-4 h-4" /> Instant Bursary Processing
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Trust Simulator Section */}
      <section className="py-20 bg-slate-100/70 dark:bg-navy-950 border-b border-slate-200/80 dark:border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-3 mb-12">
              <Badge variant="success" size="md">
                INTERACTIVE TRUST SIMULATOR
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-poppins">
                How Much Delay Does CampusNest Eliminate?
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Compare traditional manual landlord confirmation processing with CampusNest instant QR verification.
              </p>
            </div>

            <Card variant="elevated" className="p-6 sm:p-10 bg-white dark:bg-navy-900 border-2 border-blue-500/20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                {/* Simulator Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Select Your Financial Aid / Funder Type
                    </label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setFunderType("NSFAS")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          funderType === "NSFAS"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:bg-slate-100"
                        }`}
                      >
                        NSFAS Direct
                      </button>
                      <button
                        type="button"
                        onClick={() => setFunderType("CORPORATE")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          funderType === "CORPORATE"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:bg-slate-100"
                        }`}
                      >
                        Corporate Bursary
                      </button>
                      <button
                        type="button"
                        onClick={() => setFunderType("UNIVERSITY")}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          funderType === "UNIVERSITY"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-slate-50 dark:bg-navy-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:bg-slate-100"
                        }`}
                      >
                        University Aid
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Monthly Accommodation Allowance
                      </label>
                      <span className="text-sm font-extrabold text-blue-600">R{monthlyAllowance.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min="3500"
                      max="7500"
                      step="100"
                      value={monthlyAllowance}
                      onChange={(e) => setMonthlyAllowance(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-8"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>R3,500</span>
                      <span>R7,500</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-600" />
                      Automatic Funder Dispatch
                    </div>
                    <p>
                      CampusNest pre-validates municipal safety compliance so financial aid administrators can
                      immediately approve payment disbursements without manual inspection backlogs.
                    </p>
                  </div>
                </div>

                {/* Comparison Results Card */}
                <div className="space-y-4">
                  {/* Traditional Manual Flow */}
                  <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60">
                    <div className="flex items-center justify-between text-xs font-bold text-red-700 dark:text-red-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> Traditional Manual Processing
                      </span>
                      <span>{manualDays} Days Avg.</span>
                    </div>
                    <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed">
                      Physical lease printing &rarr; Landlord signing &rarr; Queuing at financial aid &rarr; Manual
                      address verification &rarr; Payment delays & risk of eviction.
                    </p>
                  </div>

                  {/* CampusNest Instant Flow */}
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500 shadow-md shadow-emerald-500/10">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" /> CampusNest Instant QR
                      </span>
                      <span className="text-sm font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-lg">
                        &lt; 2 Hours
                      </span>
                    </div>
                    <p className="text-xs text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
                      Digital lease binding &rarr; Automatic cryptographic SHA-256 token generated &rarr; Public QR
                      verification portal immediately active for bursary audit.
                    </p>
                  </div>

                  {/* Impact Summary Metric */}
                  <div className="text-center pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-sm">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                      <span>Saves ~{savedDays} Days of Disbursement Anxiety</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-tr from-navy-950 via-blue-950 to-navy-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-poppins">
            Ready to Secure Your Accredited Student Room?
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Join thousands of South African university students experiencing safe, accredited, hassle-free off-campus
            living.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="emerald" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Create Free Student Account
              </Button>
            </Link>
            <Link href="/properties">
              <Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10">
                Browse Verified Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

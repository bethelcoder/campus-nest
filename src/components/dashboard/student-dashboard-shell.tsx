"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building,
  FileText,
  Bookmark,
  GraduationCap,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  HelpCircle,
  Settings,
  Search,
  Sun,
  MoreHorizontal,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Calendar,
  Sparkles,
  Eye,
  Check,
  Plus,
  User,
  LogOut,
  MapPin,
  Flame,
  Zap,
  CheckCircle2,
  Info,
  X,
  Send,
} from "lucide-react";

interface StudentDashboardShellProps {
  user?: {
    name: string;
    surname: string;
    email: string;
    universityEmail?: string | null;
    studentNumber?: string | null;
    universityName?: string | null;
    fundingType?: string | null;
  };
}

export default function StudentDashboardShell({
  user = {
    name: "Lerato",
    surname: "Nkosi",
    email: "student@example.com",
    universityEmail: "lerato.nkosi@students.wits.ac.za",
    studentNumber: "2489102",
    universityName: "University of the Witwatersrand (Wits)",
    fundingType: "NSFAS",
  },
}: StudentDashboardShellProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [timeFilter, setTimeFilter] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPropertyForApply, setSelectedPropertyForApply] = useState<any | null>(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicationNotes, setApplicationNotes] = useState("");

  // Target residences available for single-profile application
  const targetProperties = [
    {
      id: "BN-101",
      name: "Braamfontein Student Loft",
      suburb: "Braamfontein, JHB",
      campus: "Wits Main Campus (0.8 km)",
      rate: "R 4,800",
      progress: 0,
      safetyScore: "9.2/10",
      grade: "Grade A",
      occupancy: "1 Available Bed",
      landlord: "Sipho Dlamini",
    },
    {
      id: "KH-204",
      name: "Kingsway Heights Student Living",
      suburb: "Auckland Park, JHB",
      campus: "UJ Kingsway Campus (0.4 km)",
      rate: "R 4,500",
      progress: 0,
      safetyScore: "9.0/10",
      grade: "Grade A",
      occupancy: "2 Available Beds",
      landlord: "Apex Student Living",
    },
    {
      id: "CH-301",
      name: "Parktown Medical & Law Residence",
      suburb: "Parktown, JHB",
      campus: "Wits Medical School (0.5 km)",
      rate: "R 5,200",
      progress: 0,
      safetyScore: "9.4/10",
      grade: "Grade A",
      occupancy: "3 Available Beds",
      landlord: "South Point REIT",
    },
    {
      id: "VR-402",
      name: "Brixton Student Village",
      suburb: "Brixton, JHB",
      campus: "UJ Bunting Road (1.1 km)",
      rate: "R 3,900",
      progress: 0,
      safetyScore: "8.6/10",
      grade: "Grade B",
      occupancy: "1 Available Bed",
      landlord: "Braam Housing Co.",
    },
  ];

  const handleStartApply = (property: any) => {
    setSelectedPropertyForApply(property);
    setShowApplyModal(true);
    setApplicationSubmitted(false);
  };

  const handleConfirmSubmitApplication = () => {
    setApplicationSubmitted(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplicationSubmitted(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] text-[#111827] font-poppins flex flex-col antialiased selection:bg-purple-600 selection:text-white p-2 sm:p-4 lg:p-6">
      {/* Outer Canvas Container matching the exact inspiration layout */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto bg-[#f8f9fa] rounded-3xl shadow-sm border border-slate-200/80 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-64 shrink-0 bg-transparent p-5 flex flex-col justify-between border-r border-slate-200/60 hidden md:flex">
          <div className="space-y-6">
            {/* User Profile Pill at top */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name.charAt(0)}
                  {user.surname.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name} {user.surname}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                    Student · {user.fundingType || "NSFAS"}
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* General Navigation Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>General</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              <button
                onClick={() => setActiveNav("dashboard")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "dashboard"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <LayoutDashboard className={`w-4 h-4 ${activeNav === "dashboard" ? "text-purple-600" : "text-slate-400"}`} />
                <span>Dashboard</span>
              </button>

              <Link
                href="/properties"
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "explore"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <Building className="w-4 h-4 text-slate-400" />
                <span>Explore Residences</span>
              </Link>

              <button
                onClick={() => setActiveNav("applications")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "applications"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>My Applications</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">0</span>
              </button>

              <button
                onClick={() => setActiveNav("saved")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "saved"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-4 h-4 text-slate-400" />
                  <span>Saved Favorites</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">0</span>
              </button>
            </div>

            {/* Compliance & Funding Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Compliance &amp; Funder</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              <button
                onClick={() => setActiveNav("funder")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "funder"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-slate-400" />
                <span>Funding Profile</span>
              </button>

              <button
                onClick={() => setActiveNav("verification")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "verification"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>University Domain</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  Verified
                </span>
              </button>

              <button
                onClick={() => setActiveNav("letters")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "letters"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <FileCheck className="w-4 h-4 text-slate-400" />
                <span>QR Confirmation Letter</span>
              </button>
            </div>

            {/* Safety & Incident Desk */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Safety &amp; Triage</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              <button
                onClick={() => setActiveNav("triage")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "triage"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-slate-400" />
                <span>Incident &amp; Repairs Desk</span>
              </button>
            </div>
          </div>

          {/* Bottom Settings / Help Section */}
          <div className="space-y-1 pt-6 border-t border-slate-200/60">
            <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help Center</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-200/50">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          </div>
        </aside>

        {/* ================= MAIN CONTENT CANVAS ================= */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          
          {/* Top Search & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search input with shortcut hint [/] */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="What are you working on..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium rounded-2xl bg-white border border-slate-200/80 pl-10 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                /
              </span>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>2026 Academic Year</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

              <button className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 shadow-xs">
                <Sun className="w-4 h-4" />
              </button>

              <button className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 shadow-xs">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================= 4 TOP STAT KPI CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Profile Readiness */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Profile Readiness</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">85%</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-2">
                  <span>Progress</span>
                  <span className="font-bold text-slate-700">Ready to Apply</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full w-[85%]" />
                </div>
              </div>
            </div>

            {/* Card 2: Total Applications */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span>Active Applications</span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">0</div>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-purple-600 mt-3 group"
                >
                  <span>Explore &amp; Apply Now</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 3: Saved Favorites */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <span>Saved Residences</span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">0</div>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-purple-600 mt-3 group"
                >
                  <span>Browse Campus Units</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 4: Funder Confirmation Readiness */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span>Funder Confirmation</span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">NSFAS Ready</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-3">
                  <span>Pending Room Lease Bind</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= MIDDLE ROW: ANALYTICS & BREAKDOWN ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2/3 Card: Application Flow & Delay Analytics */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Application &amp; Funding Timeline</h3>
                  <p className="text-[11px] text-slate-400">
                    Estimated disbursement turnaround: Manual (28 Days) vs CampusNest Instant QR (&lt; 2 Hours)
                  </p>
                </div>

                {/* Daily / Weekly / Monthly Switch */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-[11px] font-bold text-slate-600">
                  {(["Daily", "Weekly", "Monthly"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        timeFilter === filter ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Visual Replica */}
              <div className="pt-4">
                <div className="relative h-48 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pb-6 border-b border-slate-100">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-300 font-mono">
                    <div className="border-b border-dashed border-slate-100 pb-1">Stage 4: Funder QR Certified</div>
                    <div className="border-b border-dashed border-slate-100 pb-1">Stage 3: Tenancy Active</div>
                    <div className="border-b border-dashed border-slate-100 pb-1">Stage 2: Landlord Review</div>
                    <div className="border-b border-slate-100 pb-1">Stage 1: Single Profile Built</div>
                  </div>

                  {/* Monday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-16 rounded-xl bg-slate-100/90 border border-slate-200/60 transition-all hover:bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Step 1</span>
                  </div>

                  {/* Tuesday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-24 rounded-xl bg-slate-100/90 border border-slate-200/60 transition-all hover:bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Step 2</span>
                  </div>

                  {/* Wednesday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-20 rounded-xl bg-slate-100/90 border border-slate-200/60 transition-all hover:bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Step 3</span>
                  </div>

                  {/* Thursday (Active Highlighted Bar with Purple Gradient & Popover) */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1 relative">
                    {/* Tooltip Badge */}
                    <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#111827] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 text-amber-400" /> Next: Select Unit
                    </div>
                    <div className="w-full max-w-[48px] h-32 rounded-xl bg-gradient-to-t from-purple-600 to-indigo-500 shadow-md shadow-purple-500/20" />
                    <span className="text-[11px] font-bold text-purple-600">Apply</span>
                  </div>

                  {/* Friday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1 opacity-40">
                    <div className="w-full max-w-[48px] h-14 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Bind</span>
                  </div>

                  {/* Saturday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1 opacity-40">
                    <div className="w-full max-w-[48px] h-10 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Audit</span>
                  </div>

                  {/* Sunday Bar */}
                  <div className="flex flex-col items-center gap-2 z-10 flex-1 opacity-40">
                    <div className="w-full max-w-[48px] h-28 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">QR Cert</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1/3 Card Stack: Verification & Single-Profile Breakdown */}
            <div className="space-y-6">
              {/* Box 1: Enrolled Institution Badge */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Enrolled Institution</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    • Verified Active
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center">
                    WT
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">Wits University</span>
                    <span className="text-[10px] text-slate-400">BSc Computer Science · 2nd Year</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Single-Profile Readiness Breakdown */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Application Readiness</h4>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5">
                  <div className="h-full bg-emerald-500 rounded-l-full w-[45%]" title="KYC Details (45%)" />
                  <div className="h-full bg-purple-500 w-[40%]" title="Funder Profile (40%)" />
                  <div className="h-full bg-slate-200 rounded-r-full w-[15%]" title="Room Selected (15%)" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> KYC Verified
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" /> Funder Linked
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Room Selection
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM TABLE: SINGLE-PROFILE TARGET HOUSING QUEUE ================= */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Target Accommodations &amp; Quick Apply</h3>
                <p className="text-[11px] text-slate-400">
                  One verified application profile allows you to apply seamlessly across accredited providers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/properties"
                  className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Browse Full Registry</span>
                </Link>
                <button className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clean Data Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">
                      <input type="checkbox" className="rounded text-purple-600" />
                    </th>
                    <th className="py-3 px-3">Unit ID</th>
                    <th className="py-3 px-3">Residence Title</th>
                    <th className="py-3 px-3">Campus &amp; Suburb</th>
                    <th className="py-3 px-3">Safety Score</th>
                    <th className="py-3 px-3">Monthly Rate</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {targetProperties.map((prop) => (
                    <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-3.5 px-3">
                        <input type="checkbox" className="rounded text-purple-600" />
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">{prop.id}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {prop.name}
                        </div>
                        <div className="text-[10px] text-slate-400">{prop.landlord}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        <div>{prop.suburb}</div>
                        <div className="text-[10px] text-purple-600">{prop.campus}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                          <ShieldCheck className="w-3 h-3" /> {prop.safetyScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-900">{prop.rate}</td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleStartApply(prop)}
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shadow-xs transition-transform active:scale-95 inline-flex items-center gap-1"
                        >
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ================= MODAL: 1-CLICK SINGLE PROFILE APPLICATION ================= */}
      {showApplyModal && selectedPropertyForApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-0.5 rounded-full">
                  Single Application Profile
                </span>
                <h3 className="text-lg font-bold text-slate-900">Apply to {selectedPropertyForApply.name}</h3>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Application Dispatched!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your verified student KYC &amp; NSFAS funding profile have been routed to {selectedPropertyForApply.landlord}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Auto-populated Verified Student Badge */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{user.name} {user.surname} ({user.studentNumber})</span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                      KYC Verified
                    </span>
                  </div>
                  <div className="text-slate-500 flex flex-col gap-0.5">
                    <span>Institution: <strong>{user.universityName}</strong></span>
                    <span>Funding Body: <strong>{user.fundingType} Direct Allowance</strong></span>
                    <span>Monthly Rate: <strong>{selectedPropertyForApply.rate}/mo</strong></span>
                  </div>
                </div>

                {/* Additional Note for Landlord */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Cover Note or Room Preference (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Looking for single room, ready for immediate move-in..."
                    value={applicationNotes}
                    onChange={(e) => setApplicationNotes(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmitApplication}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Verified Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building,
  FileText,
  Users,
  ShieldCheck,
  FileCheck,
  Wrench,
  HelpCircle,
  Settings,
  Search,
  Sun,
  MoreHorizontal,
  ArrowRight,
  ChevronDown,
  Calendar,
  Sparkles,
  Eye,
  Check,
  X,
  Plus,
  User,
  Flame,
  Timer,
  Info,
  CheckCircle2,
  Layers,
} from "lucide-react";

interface LandlordDashboardShellProps {
  user?: {
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function LandlordDashboardShell({
  user = {
    name: "Sipho",
    surname: "Dlamini",
    email: "landlord@example.com",
    entityType: "Private Residence Operator",
  },
}: LandlordDashboardShellProps) {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [timeFilter, setTimeFilter] = useState<"Daily" | "Weekly" | "Monthly">("Weekly");
  const [searchQuery, setSearchQuery] = useState("");

  const [applications, setApplications] = useState([
    {
      id: "APP-891",
      studentName: "Lerato Nkosi",
      studentNumber: "2489102",
      institution: "University of the Witwatersrand",
      funder: "NSFAS Direct (R4,800/mo)",
      property: "Braamfontein Student Loft (Unit 4B)",
      date: "Feb 16, 2026",
      status: "PENDING",
    },
    {
      id: "APP-892",
      studentName: "Kagiso Molefe",
      studentNumber: "2198045",
      institution: "University of Johannesburg",
      funder: "Funded - Sasol Bursary (R5,500/mo)",
      property: "Braamfontein Student Loft (Unit 2A)",
      date: "Feb 15, 2026",
      status: "PENDING",
    },
  ]);

  const handleApplicationAction = (id: string, action: "ACCEPTED" | "REJECTED") => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: action } : app))
    );
  };

  return (
    <div className="min-h-screen bg-[#eef0f4] text-[#111827] font-poppins flex flex-col antialiased selection:bg-purple-600 selection:text-white p-2 sm:p-4 lg:p-6">
      {/* Outer Window Canvas matching reference layout */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto bg-[#f8f9fa] rounded-3xl shadow-sm border border-slate-200/80 flex overflow-hidden">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-64 shrink-0 bg-transparent p-5 flex flex-col justify-between border-r border-slate-200/60 hidden md:flex">
          <div className="space-y-6">
            {/* User Profile Pill */}
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name.charAt(0)}
                  {user.surname.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name} {user.surname}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium leading-tight">
                    Landlord · SME Tier
                  </span>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* General Navigation */}
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

              <button
                onClick={() => setActiveNav("properties")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "properties"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>My Residences</span>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">2</span>
              </button>

              <button
                onClick={() => setActiveNav("applications")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "applications"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Inbound Applicants</span>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">2</span>
              </button>
            </div>

            {/* Compliance & Safety Group */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Compliance &amp; Safety</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              <button
                onClick={() => setActiveNav("audit")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "audit"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>13-Point Safety Audit</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  9.2 / 10
                </span>
              </button>

              <button
                onClick={() => setActiveNav("leases")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "leases"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <FileCheck className="w-4 h-4 text-slate-400" />
                <span>Leases &amp; Letters</span>
              </button>
            </div>

            {/* Operations */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Operations</span>
                <MoreHorizontal className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              <button
                onClick={() => setActiveNav("maintenance")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeNav === "maintenance"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/70"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <span>SLA Maintenance Board</span>
                </div>
                <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                  48h Active
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Settings */}
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
          
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            {/* Card 1: Total Beds Capacity */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Building className="w-3.5 h-3.5" />
                  </div>
                  <span>Total Beds Capacity</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                </span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">16</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mt-2">
                  <span>Occupancy</span>
                  <span className="font-bold text-slate-700">81% Filled</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full w-[81%]" />
                </div>
              </div>
            </div>

            {/* Card 2: Inbound Applications */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Inbound Applications</span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">2</div>
                <button
                  onClick={() => setActiveNav("applications")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-purple-600 mt-3 group"
                >
                  <span>Review Profiles</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 3: Active Leases */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <span>Active Binding Leases</span>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">13</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 mt-3">
                  <span>View Leases</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Card 4: Safety Score */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Accreditation Score</span>
              </div>

              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">9.2 / 10</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-3">
                  <span>Grade A Gold Standard</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= MIDDLE ROW ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2/3 Card: Occupancy & Inflow Analytics */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Occupancy &amp; Application Flow</h3>
                  <p className="text-[11px] text-slate-400">
                    Weekly student application influx across registered residences
                  </p>
                </div>

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

              <div className="pt-4">
                <div className="relative h-48 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pb-6 border-b border-slate-100">
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-12 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Mon</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-20 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Tues</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-16 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Wed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1 relative">
                    <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-[#111827] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                      <Flame className="w-3 h-3 text-amber-400" /> Peak Inflow
                    </div>
                    <div className="w-full max-w-[48px] h-32 rounded-xl bg-gradient-to-t from-emerald-600 to-teal-500 shadow-md shadow-emerald-500/20" />
                    <span className="text-[11px] font-bold text-emerald-600">Thurs</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-14 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Fri</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-10 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Sat</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 z-10 flex-1">
                    <div className="w-full max-w-[48px] h-24 rounded-xl bg-slate-100 border border-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">Sun</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1/3 Card Stack: Safety Grade & SLA Breakdown */}
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">Primary Residence Profile</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    • Grade A
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center justify-center">
                    BL
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900">Braamfontein Student Loft</span>
                    <span className="text-[10px] text-slate-400">12 Juta St · 8 Beds Capacity</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">SLA Maintenance Resolution</h4>
                  <Timer className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden p-0.5 gap-0.5">
                  <div className="h-full bg-emerald-500 rounded-l-full w-[70%]" title="Resolved in <48h (70%)" />
                  <div className="h-full bg-amber-500 w-[20%]" title="In Progress (20%)" />
                  <div className="h-full bg-slate-200 rounded-r-full w-[10%]" title="Open (10%)" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;48h Resolved
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Active Tech
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-300" /> Open
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= BOTTOM TABLE: INBOUND APPLICATIONS ================= */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inbound Student Applications</h3>
                <p className="text-[11px] text-slate-400">
                  Pre-verified student profiles ready for tenancy binding and QR confirmation dispatch.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/landlord/properties"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage Residence Units</span>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">
                      <input type="checkbox" className="rounded text-purple-600" />
                    </th>
                    <th className="py-3 px-3">App ID</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Institution &amp; Funder</th>
                    <th className="py-3 px-3">Assigned Room</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3">
                        <input type="checkbox" className="rounded text-purple-600" />
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">{app.id}</td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[10px] text-slate-400">ID: {app.studentNumber}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="text-slate-800">{app.institution}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">{app.funder}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{app.property}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.status === "ACCEPTED"
                              ? "bg-emerald-50 text-emerald-700"
                              : app.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {app.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApplicationAction(app.id, "ACCEPTED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Accept
                            </button>
                            <button
                              onClick={() => handleApplicationAction(app.id, "REJECTED")}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600 text-[10px] font-bold inline-flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SearchIcon,
  BellIcon,
  PanelLeftIcon,
  ShieldCheckIcon,
  BuildingIcon,
  FileTextIcon,
  SettingsIcon,
  ChevronDownIcon,
} from "@/components/common/Icons";
import {
  LuShieldAlert,
  LuBuilding2,
  LuFileCheck,
  LuUsers,
  LuGraduationCap,
  LuScale,
  LuCheck,
} from "react-icons/lu";

interface B2cSrcLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  user?: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    institutionName?: string | null;
  };
  openCasesCount?: number;
}

export default function B2cSrcLayout({
  children,
  activeTab = "Crisis Desk",
  user = {
    name: "Kagiso",
    surname: "Mokoena",
    email: "src.housing@wits.ac.za",
    institutionName: "University of the Witwatersrand (Wits)",
  },
  openCasesCount = 0,
}: B2cSrcLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const institutionDisplayName = user.institutionName || "University Student Council";

  async function handleLogout() {
    try {
      const { logOutFromFirebase } = await import("@/lib/firebase");
      await logOutFromFirebase().catch(() => {});
    } catch {}
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/";
  }

  const mainNavItems = [
    {
      label: "Crisis & Complaints",
      href: "/dashboard/src",
      icon: LuShieldAlert,
      badge: openCasesCount > 0 ? `${openCasesCount} Open` : undefined,
    },
    {
      label: "Audited Residences",
      href: "/dashboard/src/residences",
      icon: LuBuilding2,
    },
    {
      label: "Tenancy Letters",
      href: "/dashboard/src/letters",
      icon: LuFileCheck,
    },
  ];

  const governanceNavItems = [
    {
      label: "Housing Regulations",
      href: "/dashboard/src#regulations",
      icon: LuScale,
    },
    {
      label: "Intervention Logs",
      href: "/dashboard/src#interventions",
      icon: LuUsers,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] text-black font-poppins overflow-hidden antialiased">
      {/* ================= LEFT SIDEBAR ================= */}
      <aside
        className={`${
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        } shrink-0 bg-[#F3F4F6] transition-all duration-300 ease-in-out flex flex-col justify-between p-3.5 select-none z-20`}
      >
        <div className="space-y-4">
          {/* Institution / Council Header */}
          <div className="relative">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              } gap-2 rounded-xl p-2 transition-all bg-white border border-[#E5E7EB] shadow-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-xs shadow-xs">
                  <LuScale className="w-4 h-4" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-[13px] font-bold text-gray-900 truncate tracking-tight">
                      SRC Housing Desk
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700 truncate">
                      {institutionDisplayName}
                    </span>
                  </div>
                )}
              </div>

              {!sidebarCollapsed && (
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(true)}
                  className="rounded-lg p-1 text-[#94A3B8] hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                  title="Collapse sidebar"
                >
                  <PanelLeftIcon size={15} />
                </button>
              )}
            </div>
          </div>

          {/* MAIN Section */}
          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                MAIN DESK
              </div>
            )}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.label || pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center ${
                    sidebarCollapsed ? "justify-center px-1.5 py-1.5" : "justify-between px-2.5 py-2"
                  } rounded-xl text-[13px] transition-all ${
                    isActive
                      ? "bg-white !text-black font-bold shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E5E7EB]"
                      : "!text-black font-medium hover:bg-black/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-600" : "!text-gray-700"}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] text-red-700 font-extrabold bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* GOVERNANCE & ADVOCACY Section */}
          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                GOVERNANCE &amp; ADVOCACY
              </div>
            )}
            {governanceNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center ${
                    sidebarCollapsed ? "justify-center px-1.5 py-1.5" : "justify-between px-2.5 py-2"
                  } rounded-xl text-[13px] transition-all !text-black font-medium hover:bg-black/[0.04] border border-transparent`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0 !text-gray-700" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className={`pt-2 border-t border-[#E5E7EB]/60 mt-auto ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/dashboard/src#settings"
            title={sidebarCollapsed ? "Settings" : undefined}
            className={`group flex items-center ${
              sidebarCollapsed ? "justify-center px-1.5 py-1" : "gap-2.5 px-2.5 py-1.5"
            } rounded-xl text-[13px] transition-all !text-black font-medium hover:bg-black/[0.04] border border-transparent`}
          >
            <SettingsIcon size={17} className="shrink-0 !text-black" />
            {!sidebarCollapsed && <span className="tracking-[-0.01em]">Council Settings</span>}
          </Link>
        </div>
      </aside>

      {/* ================= MAIN ISLAND AREA ================= */}
      <div className="flex-1 min-w-0 h-screen p-2.5 md:p-3.5 md:pl-0 flex flex-col overflow-hidden">
        <main className="b2c-dashboard-island bg-white rounded-[24px] md:rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden transition-all">
          
          {/* Header embedded directly at top of island */}
          <div className="px-6 pt-6 pb-0 md:px-8 md:pt-7 shrink-0 bg-white z-10">
            <header className="flex items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
              {/* Search Bar */}
              <div className="flex items-center gap-3 flex-1 max-w-lg">
                {sidebarCollapsed && (
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                  >
                    <PanelLeftIcon size={17} />
                  </button>
                )}

                <div className="relative w-full max-w-[420px]">
                  <SearchIcon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    placeholder="Search complaints, student ID, residence, or landlord..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 shadow-2xs"
                  />
                </div>
              </div>

              {/* Status Badge + Notification Bell + User Profile */}
              <div className="flex items-center gap-3.5 relative">
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  <LuScale className="w-3.5 h-3.5" />
                  <span>SRC Crisis Desk Active</span>
                </span>

                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                >
                  <BellIcon size={18} />
                  {openCasesCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  )}
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 pl-1 cursor-pointer select-none rounded-xl p-1 hover:bg-black/[0.03] transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] shadow-2xs bg-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">
                      {user.name.charAt(0)}
                      {user.surname.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="text-[13.5px] font-bold text-[#0F172A] tracking-[-0.01em]">
                        {user.name} {user.surname}
                      </span>
                      <span className="text-[12px] text-[#64748B]">SRC Housing Officer</span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.name} {user.surname}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-indigo-700 font-semibold truncate mt-0.5">{institutionDisplayName}</p>
                      </div>
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>

          {/* Main page content - Scrolls cleanly inside the white island card */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 md:px-8 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

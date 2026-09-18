"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SearchIcon,
  BellIcon,
  PanelLeftIcon,
  HomeIcon,
  BuildingIcon,
  FileTextIcon,
  ShieldCheckIcon,
  SettingsIcon,
  ChevronDownIcon,
  StoreFrontIcon,
  UsersIcon,
} from "@/components/common/Icons";
import { LuPlus, LuBuilding2, LuCheck } from "react-icons/lu";

interface B2cLandlordLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  user?: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
  properties?: any[];
}

export default function B2cLandlordLayout({
  children,
  activeTab = "Home",
  user = {
    name: "Sipho",
    surname: "Dlamini",
    email: "landlord@example.com",
    entityType: "Private Residence Operator",
  },
  properties = [],
}: B2cLandlordLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const displayProperties = properties.length > 0
    ? properties.map((p) => `${p.title} (${p.bedrooms} Beds)`)
    : ["No residences listed yet"];

  const [currentProperty, setCurrentProperty] = useState(displayProperties[0]);

  async function handleLogout() {
    try {
      const { logOutFromFirebase } = await import("@/lib/firebase");
      await logOutFromFirebase();
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/landlord/login";
    } catch {
      window.location.href = "/landlord/login";
    }
  }

  const totalTenancies = properties.reduce(
    (sum, p) => sum + (p.tenancies?.length || (p._count?.tenancies ?? 0)),
    0
  );

  const mainNavItems = [
    { label: "Home", href: "/dashboard/landlord", icon: HomeIcon },
    { label: "My Residences", href: "/landlord/properties", icon: BuildingIcon, count: properties.length },
    { label: "Tenancy", href: "/landlord/tenancies", icon: UsersIcon, count: totalTenancies > 0 ? totalTenancies : undefined },
    { label: "Inbound Applicants", href: "/dashboard/landlord#applications", icon: FileTextIcon, count: 2 },
  ];

  const complianceNavItems = [
    { label: "13-Point Safety Audit", href: "/dashboard/landlord#audit", icon: ShieldCheckIcon, badge: properties.length > 0 && properties[0].safetyScore ? `${Number(properties[0].safetyScore).toFixed(1)}/10` : undefined },
    { label: "Active Leases", href: "/dashboard/landlord#leases", icon: FileTextIcon },
  ];

  return (
    <div className="h-screen w-full bg-[#F4F5F7] flex overflow-hidden text-[#0F172A] antialiased font-poppins">
      {/* ================= FIXED LEFT SIDEBAR ================= */}
      <aside
        className={`bg-[#F4F5F7] h-screen transition-all duration-200 flex flex-col shrink-0 z-30 select-none ${
          sidebarCollapsed ? "w-[72px] px-2.5 py-4" : "w-[240px] px-3.5 py-4"
        }`}
      >
        <div className="space-y-3 overflow-y-auto no-scrollbar pr-0.5 flex-1">
          {/* Top Brand / Residence Switcher */}
          <div className="relative pt-0.5">
            <div className={`flex items-center ${sidebarCollapsed ? "justify-center flex-col gap-2" : "justify-between"}`}>
              {!sidebarCollapsed ? (
                <button
                  type="button"
                  onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl px-1.5 py-1 text-left hover:bg-black/[0.04] transition-colors cursor-pointer group"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] text-white shadow-xs shrink-0 font-bold text-xs">
                    OP
                  </div>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[13.5px] font-bold text-black tracking-tight truncate max-w-[130px]">
                      Landlord Hub
                    </span>
                    <ChevronDownIcon
                      size={13}
                      className={`text-black transition-transform duration-150 shrink-0 ${
                        propertyDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </div>
                </button>
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] text-white shadow-xs shrink-0 font-bold text-xs">
                  OP
                </div>
              )}

              {/* Sidebar collapse/expand toggle button */}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-black hover:bg-black/[0.04] transition-colors cursor-pointer"
                aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <PanelLeftIcon size={16} className="text-black" />
              </button>
            </div>

            {/* Property Dropdown */}
            {!sidebarCollapsed && propertyDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                  <span>Residence Portfolio</span>
                  <span className="text-emerald-600">{properties.length} Total</span>
                </div>
                <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
                  {displayProperties.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setCurrentProperty(p);
                        setPropertyDropdownOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-[12.5px] text-left transition-colors cursor-pointer ${
                        currentProperty === p
                          ? "bg-[#F3F4F6] font-semibold text-black"
                          : "text-black hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <StoreFrontIcon size={14} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{p}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 mt-1 border-t border-gray-100">
                  <Link
                    href="/landlord/properties/new"
                    onClick={() => setPropertyDropdownOpen(false)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold py-2 transition-colors cursor-pointer"
                  >
                    <LuPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Residence</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* MAIN Section */}
          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                MAIN
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
                    sidebarCollapsed ? "justify-center px-1.5 py-1.5" : "justify-between px-2.5 py-1.5"
                  } rounded-lg text-[13px] transition-all ${
                    isActive
                      ? "bg-white !text-black font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.06)] border border-[#E5E7EB]"
                      : "!text-black font-medium hover:bg-black/[0.04] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className="shrink-0 !text-black" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className="text-[11px] text-[#059669] font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* COMPLIANCE & SAFETY Section */}
          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                COMPLIANCE &amp; SAFETY
              </div>
            )}
            {complianceNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group flex items-center ${
                    sidebarCollapsed ? "justify-center px-1.5 py-1.5" : "justify-between px-2.5 py-1.5"
                  } rounded-lg text-[13px] transition-all !text-black font-medium hover:bg-black/[0.04] border border-transparent`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} className="shrink-0 !text-black" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Settings */}
        <div className={`pt-2 border-t border-[#E5E7EB]/60 mt-auto ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/dashboard/landlord#settings"
            title={sidebarCollapsed ? "Settings" : undefined}
            className={`group flex items-center ${
              sidebarCollapsed ? "justify-center px-1.5 py-1" : "gap-2.5 px-2.5 py-1"
            } rounded-lg text-[13px] transition-all !text-black font-medium hover:bg-black/[0.04] border border-transparent`}
          >
            <SettingsIcon size={17} className="shrink-0 !text-black" />
            {!sidebarCollapsed && <span className="tracking-[-0.01em]">Settings</span>}
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
                    placeholder="Search rooms, student profiles, maintenance..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-[#059669] focus:ring-1 focus:ring-[#059669]/20 shadow-2xs"
                  />
                </div>
              </div>

              {/* Notification Bell + User Profile */}
              <div className="flex items-center gap-3.5 relative">
                <Link
                  href="/landlord/properties/new"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                >
                  <LuPlus className="w-3.5 h-3.5" />
                  <span>Add Residence</span>
                </Link>

                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                >
                  <BellIcon size={18} />
                  <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 pl-1 cursor-pointer select-none rounded-xl p-1 hover:bg-black/[0.03] transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] shadow-2xs bg-[#ECFDF5] flex items-center justify-center font-bold text-xs text-[#059669]">
                      {user.name.charAt(0)}
                      {user.surname.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="text-[13.5px] font-bold text-[#0F172A] tracking-[-0.01em]">
                        {user.name} {user.surname}
                      </span>
                      <span className="text-[12px] text-[#64748B]">Accredited Operator</span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">{user.name} {user.surname}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
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

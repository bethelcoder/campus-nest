"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SearchIcon,
  BellIcon,
  PanelLeftIcon,
  SettingsIcon,
} from "@/components/common/Icons";
import {
  LuLayoutDashboard,
  LuBuilding2,
  LuFileCheck,
  LuShieldAlert,
  LuShield,
  LuUsers,
} from "react-icons/lu";

interface B2cAdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  user?: {
    id?: string;
    name: string;
    surname: string;
    email: string;
  };
  pendingCount?: number;
}

export default function B2cAdminLayout({
  children,
  activeTab = "Command Console",
  user = {
    name: "Platform",
    surname: "Admin",
    email: "admin@campusnest.co.za",
  },
  pendingCount = 0,
}: B2cAdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; createdAt: string }>>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadNotifications() {
    const response = await fetch("/api/admin/notifications");
    if (!response.ok) return;
    const data = await response.json();
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
    setNotificationsOpen(true);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  }

  const mainNavItems = [
    {
      label: "Command Console",
      href: "/dashboard/admin",
      icon: LuLayoutDashboard,
    },
    {
      label: "Property Registry",
      href: "/dashboard/admin/properties",
      icon: LuBuilding2,
    },
    {
      label: "Confirmation Letters",
      href: "/dashboard/admin/letters",
      icon: LuFileCheck,
      badge: pendingCount > 0 ? `${pendingCount} Pending` : undefined,
    },
    {
      label: "Global Escalations",
      href: "/dashboard/admin/escalations",
      icon: LuShieldAlert,
    },
    { label: "User Directory", href: "/dashboard/admin/users", icon: LuUsers },
  ];

  const systemNavItems = [
    {
      label: "Landlord Directory",
      href: "/dashboard/admin#landlords",
      icon: LuUsers,
    },
    {
      label: "Compliance Logs",
      href: "/dashboard/admin#compliance",
      icon: LuShield,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] text-black font-poppins overflow-hidden antialiased">
      <aside
        className={`${
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        } shrink-0 bg-[#F3F4F6] transition-all duration-300 ease-in-out flex flex-col justify-between p-3.5 select-none z-20`}
      >
        <div className="space-y-4">
          <div className="relative">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              } gap-2 rounded-xl p-2 transition-all bg-white border border-[#E5E7EB] shadow-xs`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-black text-xs shadow-xs">
                  <LuShield className="w-4 h-4" />
                </div>
                {!sidebarCollapsed && (
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="text-[13px] font-bold text-gray-900 truncate tracking-tight">
                      CampusNest Ops
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 truncate">
                      Internal Console
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

          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                MAIN CONSOLE
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
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-slate-900" : "!text-gray-700"}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="space-y-0.5 pt-2">
            {!sidebarCollapsed && (
              <div className="px-2.5 pb-0.5 text-[11px] font-bold tracking-wider uppercase text-[#8892A4]">
                SYSTEM
              </div>
            )}
            {systemNavItems.map((item) => {
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

        <div className={`pt-2 border-t border-[#E5E7EB]/60 mt-auto ${sidebarCollapsed ? "flex justify-center" : ""}`}>
          <Link
            href="/dashboard/admin#settings"
            title={sidebarCollapsed ? "Settings" : undefined}
            className={`group flex items-center ${
              sidebarCollapsed ? "justify-center px-1.5 py-1" : "gap-2.5 px-2.5 py-1.5"
            } rounded-xl text-[13px] transition-all !text-black font-medium hover:bg-black/[0.04] border border-transparent`}
          >
            <SettingsIcon size={17} className="shrink-0 !text-black" />
            {!sidebarCollapsed && <span className="tracking-[-0.01em]">Console Settings</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 h-screen p-2.5 md:p-3.5 md:pl-0 flex flex-col overflow-hidden">
        <main className="b2c-dashboard-island bg-white rounded-[24px] md:rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full flex flex-col overflow-hidden transition-all">
          <div className="px-6 pt-6 pb-0 md:px-8 md:pt-7 shrink-0 bg-white z-10">
            <header className="flex items-center justify-between gap-4 pb-6 border-b border-[#F1F5F9]">
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
                    placeholder="Search properties, landlords, letters, or reports..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-3.5 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] outline-none transition-all focus:border-slate-700 focus:ring-1 focus:ring-slate-700/20 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3.5 relative">
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  <LuShield className="w-3.5 h-3.5" />
                  <span>Admin Console Active</span>
                </span>

                <button
                  type="button"
                  onClick={loadNotifications}
                  aria-label="Open notifications"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
                >
                  <BellIcon size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">{unreadCount}</span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-16 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-2">
                      <p className="text-sm font-bold text-slate-900">Latest notifications</p>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="text-xs text-slate-500">Close</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? <p className="px-2 py-6 text-center text-xs text-slate-500">No notifications yet.</p> : notifications.map((notification) => (
                        <div key={notification.id} className="border-b border-slate-100 px-2 py-3 last:border-0">
                          <p className="text-xs font-bold text-slate-900">{notification.title}</p>
                          <p className="mt-1 text-xs text-slate-600">{notification.message}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{new Date(notification.createdAt).toLocaleString("en-ZA")}</p>
                        </div>
                      ))}
                    </div>
                    {unreadCount > 0 && <button type="button" onClick={async () => { await fetch("/api/admin/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" }); setUnreadCount(0); }} className="mt-2 w-full rounded-lg bg-slate-900 py-2 text-xs font-bold text-white">Mark all read</button>}
                  </div>
                )}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 pl-1 cursor-pointer select-none rounded-xl p-1 hover:bg-black/[0.03] transition-colors text-left"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#E5E7EB] shadow-2xs bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                      {user.name.charAt(0)}
                      {user.surname.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left leading-tight">
                      <span className="text-[13.5px] font-bold text-[#0F172A] tracking-[-0.01em]">
                        {user.name} {user.surname}
                      </span>
                      <span className="text-[12px] text-[#64748B]">Platform Administrator</span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900">
                          {user.name} {user.surname}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        <p className="text-[10px] text-slate-600 font-semibold truncate mt-0.5">
                          CampusNest Platform Admin
                        </p>
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

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 md:px-8 md:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  LuBell,
  LuCheck,
  LuCheckCheck,
  LuUsers,
  LuShieldCheck,
  LuFileText,
  LuZap,
  LuClock,
  LuArrowUpRight,
  LuX,
  LuSend,
} from "react-icons/lu";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  type: "APPLICATION" | "KYC" | "COMPLIANCE" | "OFFER" | "SYSTEM";
  linkHref?: string;
}

const DEFAULT_LANDLORD_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Student Application",
    description: "Thabo Mokoena applied for Yale Village (Ensuite Single).",
    timestamp: "10 mins ago",
    unread: true,
    type: "APPLICATION",
    linkHref: "/landlord/applications",
  },
  {
    id: "notif-2",
    title: "KYC & Bank Verification",
    description: "Ensure your CIPC registration & bank mandate letter are uploaded for NSFAS direct disbursement.",
    timestamp: "2 hours ago",
    unread: true,
    type: "KYC",
    linkHref: "/landlord/verification",
  },
  {
    id: "notif-3",
    title: "Fire Safety Certificate Audit",
    description: "Property compliance vault created for all 11 municipal and safety certificates.",
    timestamp: "1 day ago",
    unread: false,
    type: "COMPLIANCE",
    linkHref: "/landlord/properties",
  },
  {
    id: "notif-4",
    title: "System Update",
    description: "Google Maps & Places verification now active across all residence setup flows.",
    timestamp: "2 days ago",
    unread: false,
    type: "SYSTEM",
    linkHref: "/landlord/properties",
  },
];

const DEFAULT_STUDENT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-s-1",
    title: "Accredited Housing Available",
    description: "Explore verified residences with interactive Google Maps campus proximity.",
    timestamp: "Just now",
    unread: true,
    type: "SYSTEM",
    linkHref: "/residences",
  },
  {
    id: "notif-s-2",
    title: "Room Offer Tracking",
    description: "Track the status of your submitted applications and sign tenancy confirmations directly.",
    timestamp: "1 hour ago",
    unread: true,
    type: "APPLICATION",
    linkHref: "/dashboard/student/applications",
  },
  {
    id: "notif-s-3",
    title: "NSFAS Accreditation Proof",
    description: "Download verified proof letters for your university housing bursary desk.",
    timestamp: "1 day ago",
    unread: false,
    type: "COMPLIANCE",
    linkHref: "/dashboard/student/applications",
  },
];

interface NotificationBellDropdownProps {
  role?: "LANDLORD" | "STUDENT";
  className?: string;
}

export default function NotificationBellDropdown({
  role = "LANDLORD",
  className = "",
}: NotificationBellDropdownProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    role === "LANDLORD" ? DEFAULT_LANDLORD_NOTIFICATIONS : DEFAULT_STUDENT_NOTIFICATIONS
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        aria-label="View notifications"
      >
        <LuBell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005F56]" />
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#005F56]/10 text-[#005F56] text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-[#005F56] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LuCheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => {
                let Icon = LuBell;
                if (n.type === "APPLICATION") Icon = LuUsers;
                else if (n.type === "KYC") Icon = LuShieldCheck;
                else if (n.type === "COMPLIANCE") Icon = LuFileText;
                else if (n.type === "OFFER") Icon = LuSend;

                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-2.5 rounded-xl transition-colors text-xs space-y-1 ${
                      n.unread ? "bg-emerald-50/50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                            n.unread
                              ? "bg-[#005F56] text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`font-bold ${
                            n.unread ? "text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {n.title}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 shrink-0">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed pl-8">
                      {n.description}
                    </p>

                    {n.linkHref && (
                      <div className="pl-8 pt-1">
                        <Link
                          href={n.linkHref}
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#005F56] hover:underline"
                        >
                          <span>Open action</span>
                          <LuArrowUpRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

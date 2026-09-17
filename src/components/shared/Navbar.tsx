"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  Building2,
  GraduationCap,
  Scale,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  FileCheck,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface NavbarProps {
  userRole?: "STUDENT" | "LANDLORD" | "UNIVERSITY_ADMIN" | "SRC_REPRESENTATIVE" | null;
  userName?: string | null;
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      window.location.href = "/";
    }
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case "STUDENT":
        return <Badge variant="info" size="sm" icon={<GraduationCap className="w-3 h-3 mr-1" />}>Student</Badge>;
      case "LANDLORD":
        return <Badge variant="success" size="sm" icon={<Building2 className="w-3 h-3 mr-1" />}>Landlord / Operator</Badge>;
      case "UNIVERSITY_ADMIN":
        return <Badge variant="navy" size="sm" icon={<Shield className="w-3 h-3 mr-1" />}>University Admin</Badge>;
      case "SRC_REPRESENTATIVE":
        return <Badge variant="purple" size="sm" icon={<Scale className="w-3 h-3 mr-1" />}>SRC Council</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 dark:bg-navy-950/90 border-b border-slate-200/80 dark:border-navy-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white font-poppins">
                    Campus<span className="text-blue-600 dark:text-blue-400">Nest</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    Registry
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-1 font-medium">
                  Verified Safety & Funding Protocol
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {!userRole && (
                <>
                  <Link
                    href="/students"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/students"
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-900"
                    }`}
                  >
                    For Students
                  </Link>
                  <Link
                    href="/landlords"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/landlords"
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-900"
                    }`}
                  >
                    For Landlords
                  </Link>
                  <Link
                    href="/properties"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith("/properties")
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-900"
                    }`}
                  >
                    Accredited Housing
                  </Link>
                </>
              )}

              {userRole === "STUDENT" && (
                <>
                  <Link
                    href="/properties"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith("/properties")
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Search Residences
                  </Link>
                  <Link
                    href="/dashboard/student"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/dashboard/student" || pathname === "/dashboard"
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Student Hub
                  </Link>
                </>
              )}

              {userRole === "LANDLORD" && (
                <>
                  <Link
                    href="/dashboard/landlord"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/dashboard/landlord"
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Operator Console
                  </Link>
                  <Link
                    href="/landlord/properties"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith("/landlord/properties")
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    My Inventory
                  </Link>
                  <Link
                    href="/landlords"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Tiers & APIs
                  </Link>
                </>
              )}

              {userRole === "UNIVERSITY_ADMIN" && (
                <>
                  <Link
                    href="/dashboard/admin"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50"
                  >
                    Admin Console
                  </Link>
                  <Link
                    href="/admin"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Verification Queue
                  </Link>
                </>
              )}

              {userRole === "SRC_REPRESENTATIVE" && (
                <>
                  <Link
                    href="/dashboard/src"
                    className="px-3.5 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50"
                  >
                    SRC Crisis Desk
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {userRole ? (
              <div className="flex items-center gap-3">
                {getRoleBadge()}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 hover:bg-slate-100 text-sm font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                      {userName ? userName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                    </div>
                    <span>{userName || "Account"}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-2xl shadow-xl border border-slate-200 dark:border-navy-700 py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-navy-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {userName || "User"}
                        </p>
                      </div>
                      <Link
                        href={
                          userRole === "STUDENT"
                            ? "/dashboard/student"
                            : userRole === "LANDLORD"
                            ? "/dashboard/landlord"
                            : userRole === "UNIVERSITY_ADMIN"
                            ? "/dashboard/admin"
                            : "/dashboard/src"
                        }
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            <Link
              href="/students"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            >
              For Students
            </Link>
            <Link
              href="/landlords"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            >
              For Landlords
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            >
              Accredited Housing
            </Link>
            <Link
              href="/dashboard/src"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-600 hover:bg-purple-50"
            >
              SRC Crisis Desk
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-navy-800">
            {userRole ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">{userName || "Account"}</span>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

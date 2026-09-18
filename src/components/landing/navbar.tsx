"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LuMenu, LuX, LuShieldCheck, LuArrowRight, LuBuilding2, LuGraduationCap, LuChevronDown } from "react-icons/lu";

interface NavbarProps {
  mode?: "student" | "landlord";
}

export default function Navbar({ mode = "student" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3"
          : "bg-transparent py-4 md:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              Campus<span className="text-emerald-600">Nest</span>
            </span>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest -mt-0.5">
              {mode === "landlord" ? "Landlord Partner Hub" : "Safety & Accreditation"}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-gray-600">
          {mode === "student" ? (
            <>
              <a href="#properties" className="hover:text-emerald-600 transition-colors">
                Browse Residences
              </a>
              <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
                How It Works
              </a>
              <a href="#safety-score" className="hover:text-emerald-600 transition-colors">
                Safety Checklist
              </a>
              <a href="#destinations" className="hover:text-emerald-600 transition-colors">
                Campus Hubs
              </a>
              <a href="#faqs" className="hover:text-emerald-600 transition-colors">
                FAQs
              </a>
            </>
          ) : (
            <>
              <a href="#why-list" className="hover:text-emerald-600 transition-colors">
                Why CampusNest
              </a>
              <a href="#accreditation" className="hover:text-emerald-600 transition-colors">
                Safety Accreditation
              </a>
              <a href="#how-landlords-work" className="hover:text-emerald-600 transition-colors">
                How It Works
              </a>
              <a href="#landlord-faqs" className="hover:text-emerald-600 transition-colors">
                Landlord FAQs
              </a>
            </>
          )}
        </nav>

        {/* Right CTA / Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {mode === "student" ? (
            <>
              <Link
                href="/landlord"
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-1.5 transition-colors border border-transparent hover:border-gray-200"
              >
                <LuBuilding2 className="w-4 h-4 text-emerald-600" />
                For Landlords
              </Link>
              <div className="h-5 w-[1px] bg-gray-200 mx-1" />
              
              {/* Interactive Sign In Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                  onMouseEnter={() => setSignInDropdownOpen(true)}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <LuChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${signInDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {signInDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Choose Portal
                    </div>

                    <Link
                      href="/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuGraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 block">
                          Student Portal
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Apply for rooms &amp; leases
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/landlord/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuBuilding2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-blue-800 block">
                          Landlord Hub
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Manage residence listings
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/src/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-purple-800 block">
                          SRC Council Desk
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Complaints &amp; crisis triage
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/register"
                className="text-xs font-bold bg-[#099250] hover:bg-[#087a43] text-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                Find Safe Housing <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/"
                className="text-xs font-semibold text-gray-600 hover:text-emerald-700 px-3 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-1.5 transition-colors border border-transparent hover:border-gray-200"
              >
                <LuGraduationCap className="w-4 h-4 text-emerald-600" />
                Student Portal
              </Link>
              <div className="h-5 w-[1px] bg-gray-200 mx-1" />

              {/* Interactive Sign In Dropdown for Landlord page */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                  onMouseEnter={() => setSignInDropdownOpen(true)}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Sign In</span>
                  <LuChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${signInDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {signInDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-[#E5E7EB] bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Choose Portal
                    </div>

                    <Link
                      href="/landlord/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/60 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuBuilding2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-emerald-800 block">
                          Landlord Hub
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Manage residence listings
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100/60 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuGraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-blue-800 block">
                          Student Portal
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Apply for rooms &amp; leases
                        </span>
                      </div>
                    </Link>

                    <Link
                      href="/src/login"
                      onClick={() => setSignInDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100/60 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <LuShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 group-hover:text-purple-800 block">
                          SRC Council Desk
                        </span>
                        <span className="text-[11px] text-gray-500 block leading-tight">
                          Complaints &amp; crisis triage
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/landlord/register"
                className="text-xs font-bold bg-[#099250] hover:bg-[#087a43] text-white px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
              >
                List Your Property <LuArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <LuX className="w-5 h-5" /> : <LuMenu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-5 space-y-4 shadow-xl animate-fadeIn">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-gray-700">
            {mode === "student" ? (
              <>
                <a
                  href="#properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Browse Residences
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  How It Works
                </a>
                <a
                  href="#safety-score"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Safety Checklist
                </a>
                <a
                  href="#destinations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Campus Hubs
                </a>
                <a
                  href="#faqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  FAQs
                </a>
                <Link
                  href="/landlord"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-emerald-700 font-bold border-t border-gray-100 flex items-center gap-2"
                >
                  <LuBuilding2 className="w-4 h-4" /> Go to Landlord Hub
                </Link>
                <Link
                  href="/src/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-purple-700 font-bold flex items-center gap-2"
                >
                  <LuShieldCheck className="w-4 h-4" /> SRC Council Portal
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#why-list"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Why CampusNest
                </a>
                <a
                  href="#accreditation"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Safety Accreditation
                </a>
                <a
                  href="#how-landlords-work"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  How It Works
                </a>
                <a
                  href="#landlord-faqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 hover:text-emerald-600"
                >
                  Landlord FAQs
                </a>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-emerald-700 font-bold border-t border-gray-100 flex items-center gap-2"
                >
                  <LuGraduationCap className="w-4 h-4" /> Go to Student Portal
                </Link>
                <Link
                  href="/src/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-purple-700 font-bold flex items-center gap-2"
                >
                  <LuShieldCheck className="w-4 h-4" /> SRC Council Portal
                </Link>
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="text-center py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                Student Sign In
              </Link>
              <Link
                href="/landlord/login"
                className="text-center py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 hover:bg-gray-50"
              >
                Landlord Sign In
              </Link>
            </div>
            <Link
              href="/register"
              className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

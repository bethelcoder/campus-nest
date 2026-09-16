"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LuMenu, LuX, LuShieldCheck, LuArrowRight, LuBuilding2, LuGraduationCap } from "react-icons/lu";

interface NavbarProps {
  mode?: "student" | "landlord";
}

export default function Navbar({ mode = "student" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <Link
                href="/login"
                className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                Sign In
              </Link>
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
              <Link
                href="/landlord/login"
                className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                Landlord Sign In
              </Link>
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
          className="md:hidden p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
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
              </>
            )}
          </nav>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2.5">
            {mode === "student" ? (
              <>
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-800"
                >
                  Student Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                >
                  Find Safe Housing
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/landlord/login"
                  className="w-full text-center py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-800"
                >
                  Landlord Sign In
                </Link>
                <Link
                  href="/landlord/register"
                  className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                >
                  List Your Property Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

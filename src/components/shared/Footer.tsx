import React from "react";
import Link from "next/link";
import { Shield, Lock, CheckCircle2, GraduationCap, Building2, Scale, HeartHandshake, FileCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800/80">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white font-poppins">
                Campus<span className="text-blue-400">Nest</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The centralized Student Housing Safety & Confirmation Platform. Connecting students, small
              landlords, enterprise operators, and Student Representative Councils (SRCs) through audited safety
              compliance and instant cryptographic funding validation.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-900 border border-navy-700 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> DHET Norms & Standards
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-900 border border-navy-700 text-blue-400">
                <Lock className="w-3.5 h-3.5" /> SHA-256 HMAC Signatures
              </span>
            </div>
          </div>

          {/* Student Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">For Students</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/students" className="hover:text-white transition-colors">
                  Student Trust Engine
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  Accredited Housing Search
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student" className="hover:text-white transition-colors">
                  Track Applications & Leases
                </Link>
              </li>
              <li>
                <Link href="/dashboard/student#triage" className="hover:text-white transition-colors">
                  Dual-Track Complaint Desk
                </Link>
              </li>
            </ul>
          </div>

          {/* Landlord & Enterprise */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Operators & Partners</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/landlords" className="hover:text-white transition-colors">
                  3-Tier Strategy Grid
                </Link>
              </li>
              <li>
                <Link href="/dashboard/landlord" className="hover:text-white transition-colors">
                  SME Landlord Console
                </Link>
              </li>
              <li>
                <Link href="/landlords#enterprise" className="hover:text-white transition-colors">
                  Headless Enterprise API
                </Link>
              </li>
              <li>
                <Link href="/dashboard/landlord#maintenance" className="hover:text-white transition-colors">
                  SLA Maintenance Board
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & SRC */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Compliance & SRC</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/dashboard/src" className="hover:text-white transition-colors flex items-center gap-1.5 text-purple-400">
                  <Scale className="w-3.5 h-3.5" /> SRC Crisis Desk
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-white transition-colors">
                  Administrator Console
                </Link>
              </li>
              <li>
                <Link href="/letters/sample" className="hover:text-white transition-colors">
                  Public QR Verification
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy & POPIA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Institutional Directory & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CampusNest Trust & Safety Registry. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Aligned with DHET Gazetted Minimum Norms for Student Housing</span>
            <span>RSA POPIA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

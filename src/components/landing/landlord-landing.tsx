"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LuShieldCheck,
  LuBuilding2,
  LuUsers,
  LuArrowRight,
  LuCheck,
  LuFileCheck2,
  LuTrendingUp,
  LuLock,
  LuChevronDown,
  LuChevronUp,
  LuCalculator,
} from "react-icons/lu";
import Navbar from "./navbar";

const LANDLORD_FAQS = [
  {
    q: "How does the 13-point Safety Checklist work?",
    a: "After creating your listing, you complete our standard 13-point checklist answering pass/fail on essential student safety criteria (perimeter gates, door locks, fire extinguishers, wiring safety, and load-shedding backup). Our algorithm instantly calculates your property's Safety Score out of 10.",
  },
  {
    q: "How does CampusNest help ensure students pay their rent on time?",
    a: "Most student tenants rely on NSFAS or institutional bursaries. By generating university-endorsed Tenancy Confirmation Letters directly through CampusNest, your tenants can submit required proof to their funder immediately, accelerating allowance disbursement to you.",
  },
  {
    q: "Are there any upfront fees to list my property?",
    a: "No. Creating your account, adding properties, completing safety checklists, and receiving student applications is 100% free during our platform rollout.",
  },
  {
    q: "How do I accept student applications and confirm tenancies?",
    a: "When verified students apply to your listing, you review their details on your landlord dashboard. With one click, you can confirm their tenancy, which automatically initializes their confirmation letter for university endorsement.",
  },
  {
    q: "Can I manage multiple properties or building blocks?",
    a: "Yes! Your landlord dashboard allows you to manage an unlimited number of listings, monitor individual safety scores, and track incoming student applications across all your locations.",
  },
];

export default function LandlordLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [rooms, setRooms] = useState(6);
  const [monthlyRent, setMonthlyRent] = useState(4800);

  const annualRevenue = rooms * monthlyRent * 10; // 10-month academic lease

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 font-poppins selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar mode="landlord" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION FOR LANDLORDS */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/80 via-white to-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/70 border border-teal-200 text-teal-800 text-xs font-bold shadow-sm">
                <LuBuilding2 className="w-4 h-4 text-teal-700" />
                <span>Dedicated Portal for Property Owners &amp; Residence Managers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
                Fill Your Student Rooms <br />
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 bg-clip-text text-transparent">
                  3x Faster with Safety Trust.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Reach thousands of verified, funded students from top South African universities. Complete our 10-minute safety checklist, receive qualified applications, and <strong>accelerate NSFAS &amp; bursary rental payouts with automated tenancy endorsement.</strong>
              </p>

              {/* Landlord Auth CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/landlord/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#099250] hover:bg-[#087a43] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>List Your Property for Free</span>
                  <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/landlord/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Landlord Sign In</span>
                </Link>
              </div>

              {/* Landlord Metrics */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-lg font-black text-emerald-600">95%+</p>
                  <p className="text-[11px] text-gray-500 font-medium">Avg. Occupancy</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-lg font-black text-gray-900">48 Hours</p>
                  <p className="text-[11px] text-gray-500 font-medium">Tenancy Endorsement</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-lg font-black text-emerald-600">R0.00</p>
                  <p className="text-[11px] text-gray-500 font-medium">Upfront Listing Fee</p>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  <p className="text-lg font-black text-gray-900">10,000+</p>
                  <p className="text-[11px] text-gray-500 font-medium">Student Searchers</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                <Image
                  src="/accomodation.png"
                  alt="Modern accredited student accommodation"
                  width={500}
                  height={550}
                  priority
                  className="w-full h-[420px] object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2">
                  <LuShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-900">Accredited Partner</span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                    <span>100% Lease Occupancy Guaranteed</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">Verified Safe</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Connect directly with students whose rent is covered by NSFAS and verified bursary sponsors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. WHY LIST ON CAMPUSNEST (3 VALUE PILLARS) */}
      {/* ========================================================================= */}
      <section id="why-list" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Landlord Advantages
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Why Top Property Owners Choose CampusNest
            </h2>
            <p className="text-sm text-gray-500">
              Eliminate empty rooms, eliminate paperwork chaos, and secure on-time bursary payouts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <LuUsers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Funded Student Pipeline</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connect with pre-screened students whose identity and university enrolment are confirmed through official `.ac.za` institution email OTPs.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <LuShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Safety Accreditation Badge</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our 13-point weighted checklist gives your residence an authentic Safety Score, giving parents and bursary officers confidence to choose your building.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <LuFileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Instant Funder Endorsement</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                One-click tenancy confirmation renders official signed PDFs for university administrators to endorse, ensuring bursaries disburse allowances without weeks of back-and-forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE REVENUE & OCCUPANCY CALCULATOR */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 p-8 sm:p-12 text-white shadow-2xl">
          <div className="max-w-2xl mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <LuCalculator className="w-4 h-4" /> Revenue Estimator
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Estimate Your Residence Earning Potential
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Calculate projected gross annual revenue for an academic year (10 months) at full verified occupancy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
            {/* Input Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 text-gray-300">
                  <span>Number of Student Beds:</span>
                  <span className="text-emerald-400 font-bold text-sm">{rooms} Beds</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 text-gray-300">
                  <span>Monthly Rate Per Bed (ZAR):</span>
                  <span className="text-emerald-400 font-bold text-sm">R{monthlyRent.toLocaleString()} / mo</span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="12000"
                  step="100"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Estimated 10-Month Academic Revenue
              </span>
              <p className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                R{annualRevenue.toLocaleString()}
              </p>
              <p className="text-[11px] text-gray-300">
                Based on 100% verified occupancy powered by CampusNest student demand.
              </p>
              <div className="pt-2">
                <Link
                  href="/landlord/register"
                  className="inline-block w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow transition-all"
                >
                  List My Beds Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS FOR LANDLORDS (3 SIMPLE STEPS) */}
      {/* ========================================================================= */}
      <section id="how-landlords-work" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Simple Onboarding
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Get Listed &amp; Accredited in 3 Steps
            </h2>
            <p className="text-sm text-gray-500">
              No complicated inspections or bureaucratic delays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900">Create Your Listing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Add property address, bedroom count, pricing, distance to campus, and description in under 2 minutes.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900">Complete Safety Checklist</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Answer our 13-point safety questionnaire (gates, fire extinguishers, emergency exits, wiring) to calculate your certified Safety Score.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900">Accept Students &amp; Confirm</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Review incoming student applications, activate tenancies, and automatically dispatch university-endorsed confirmation letters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. LANDLORD FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="landlord-faqs" className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Common Questions
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions by Landlords
          </h2>
        </div>

        <div className="space-y-3">
          {LANDLORD_FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-emerald-700"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <LuChevronUp className="w-5 h-5 text-emerald-600 shrink-0" /> : <LuChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BOTTOM LANDLORD CTA */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-teal-100/60 via-white to-[#fafbfc] text-center border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-700">
            Join the Accredited Housing Network
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
            Ready to Maximize Your Student Residence Occupancy?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            List your properties, complete the safety checklist, and start receiving verified student applications today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/landlord/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#099250] hover:bg-[#087a43] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Register Your Property Free
            </Link>
            <Link
              href="/landlord/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm shadow-sm transition-all"
            >
              Sign In to Landlord Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-gray-200 py-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-black text-base text-gray-900">
              <span className="text-emerald-600 text-xl">⌂</span> CampusNest Landlord Hub
            </div>
            <p className="text-gray-500 leading-relaxed">
              Empowering student property owners with safety accreditation and direct bursary tenancy confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Landlord Links</p>
            <ul className="space-y-1.5">
              <li><Link href="/landlord/register" className="hover:text-emerald-600">Register Property</Link></li>
              <li><Link href="/landlord/login" className="hover:text-emerald-600">Landlord Sign In</Link></li>
              <li><a href="#why-list" className="hover:text-emerald-600">Why CampusNest</a></li>
              <li><a href="#landlord-faqs" className="hover:text-emerald-600">Accreditation FAQs</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Students</p>
            <ul className="space-y-1.5">
              <li><Link href="/" className="hover:text-emerald-600">Student Portal</Link></li>
              <li><Link href="/login" className="hover:text-emerald-600">Student Sign In</Link></li>
              <li><Link href="/register" className="hover:text-emerald-600">Student Registration</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Partner Support</p>
            <p className="text-gray-500">Landlord Support: landlords@campusnest.co.za</p>
            <p className="text-gray-500">Inspection Office: +27 11 000 9989</p>
            <p className="text-[11px] text-gray-400 pt-2">© 2026 CampusNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LuShieldCheck,
  LuGraduationCap,
  LuSearch,
  LuMapPin,
  LuCheck,
  LuArrowRight,
  LuStar,
  LuFileText,
  LuLock,
  LuCircleHelp,
  LuChevronDown,
  LuChevronUp,
  LuBuilding2,
  LuUsers,
  LuSparkles,
} from "react-icons/lu";
import Navbar from "./navbar";

export interface PropertyListing {
  id: string;
  title: string;
  suburb: string;
  city: string;
  priceMonthly: number | string;
  bedrooms: number;
  safetyScore: number | string | null;
  distanceToCampus?: number | string | null;
}

interface StudentLandingProps {
  initialProperties: PropertyListing[];
}

const CAMPUS_HUBS = [
  {
    name: "Braamfontein & Parktown",
    uni: "Wits University & CJC",
    beds: "1,240+ beds",
    avgPrice: "R4,800",
    safety: "9.2/10",
    gradient: "from-blue-600/80 to-indigo-900/90",
    image: "/accomodation.png",
  },
  {
    name: "Auckland Park & Brixton",
    uni: "University of Johannesburg (APK & APB)",
    beds: "980+ beds",
    avgPrice: "R4,200",
    safety: "9.0/10",
    gradient: "from-amber-600/80 to-orange-900/90",
    image: "/students-auth.png",
  },
  {
    name: "Rondebosch & Mowbray",
    uni: "University of Cape Town (UCT)",
    beds: "850+ beds",
    avgPrice: "R6,500",
    safety: "9.6/10",
    gradient: "from-teal-600/80 to-emerald-950/90",
    image: "/accomodation.png",
  },
  {
    name: "Hatfield & Hillcrest",
    uni: "University of Pretoria (UP)",
    beds: "1,100+ beds",
    avgPrice: "R5,100",
    safety: "9.3/10",
    gradient: "from-rose-600/80 to-purple-950/90",
    image: "/students-auth.png",
  },
  {
    name: "Stellenbosch Central",
    uni: "Stellenbosch University (SU)",
    beds: "620+ beds",
    avgPrice: "R6,900",
    safety: "9.5/10",
    gradient: "from-emerald-600/80 to-teal-950/90",
    image: "/accomodation.png",
  },
];

const FAQS = [
  {
    q: "How is the Safety Score calculated for each property?",
    a: "Every listing is audited against our standard 13-point safety checklist covering 5 core weighted categories: Security (perimeter gates, locks, lighting), Fire Safety (smoke detectors, fire extinguishers, emergency routes), Utilities (wiring safety, load-shedding backup), Structural Integrity, and Location Risk. Scores range from 0 to 10.",
  },
  {
    q: "How do I get my Tenancy Confirmation Letter for NSFAS or my bursary?",
    a: "Once a landlord accepts your application and marks your tenancy active, a cryptographic Tenancy Confirmation Letter is generated. Your university administrator reviews and endorses it, after which a signed PDF with an authentic reference UUID is emailed directly to you and your funder.",
  },
  {
    q: "Is CampusNest completely free for students?",
    a: "Yes! Searching verified properties, filtering by safety score, submitting applications, and receiving endorsed confirmation letters is 100% free for all enrolled university students.",
  },
  {
    q: "What if a property does not match its advertised safety checklist?",
    a: "Students can submit instant Safety Reports directly through their dashboard. University administrators and CampusNest safety inspectors investigate flagged properties immediately, with the authority to suspend or reject non-compliant landlords.",
  },
  {
    q: "Can I apply before my NSFAS funding is finalized?",
    a: "Yes! You can complete your student onboarding and indicate NSFAS or provisional bursary status. Landlords on CampusNest understand the funding calendar and prioritize accredited applicants.",
  },
];

export default function StudentLanding({ initialProperties }: StudentLandingProps) {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHub, setSelectedHub] = useState("ALL");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [minScoreFilter, setMinScoreFilter] = useState("ALL");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        p.title.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);

      const matchesHub =
        selectedHub === "ALL" ||
        (selectedHub === "WITS" && (p.suburb.toLowerCase().includes("braam") || p.city.toLowerCase().includes("johannesburg"))) ||
        (selectedHub === "UJ" && (p.suburb.toLowerCase().includes("auckland") || p.suburb.toLowerCase().includes("brixton"))) ||
        (selectedHub === "UCT" && (p.suburb.toLowerCase().includes("rondebosch") || p.city.toLowerCase().includes("cape town"))) ||
        (selectedHub === "UP" && (p.suburb.toLowerCase().includes("hatfield") || p.city.toLowerCase().includes("pretoria"))) ||
        (selectedHub === "STELLENBOSCH" && p.city.toLowerCase().includes("stellenbosch"));

      const price = Number(p.priceMonthly);
      const matchesPrice =
        priceFilter === "ALL" ||
        (priceFilter === "UNDER_5000" && price <= 5000) ||
        (priceFilter === "5000_7000" && price > 5000 && price <= 7000) ||
        (priceFilter === "ABOVE_7000" && price > 7000);

      const score = p.safetyScore ? Number(p.safetyScore) : 0;
      const matchesScore =
        minScoreFilter === "ALL" ||
        (minScoreFilter === "8" && score >= 8.0) ||
        (minScoreFilter === "9" && score >= 9.0);

      return matchesSearch && matchesHub && matchesPrice && matchesScore;
    });
  }, [initialProperties, searchTerm, selectedHub, priceFilter, minScoreFilter]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-gray-900 font-poppins selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar mode="student" />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/70 via-white to-[#fafbfc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                <LuShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>South Africa&apos;s #1 Safety-Scored Student Housing Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.12]">
                Why Just Dream? <br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Live Safe, Study &amp; Succeed!
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Discover verified off-campus residences near your university with transparent 13-point safety scores, accredited landlords, and <strong>instant tenancy confirmation letters for NSFAS &amp; bursaries.</strong>
              </p>

              {/* Dual Hero CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#properties"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#099250] hover:bg-[#087a43] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Explore Verified Housing</span>
                  <LuArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Student Sign Up</span>
                </Link>
              </div>

              {/* Social Proof Metric */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs text-gray-500 font-medium">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">LN</div>
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">TM</div>
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">SD</div>
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center border-2 border-white text-[10px]">KM</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <LuStar key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700">4.9/5</span>
                  <span>from 5,000+ students across SA</span>
                </div>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[440px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                <Image
                  src="/students-auth.png"
                  alt="Students studying comfortably in accredited housing"
                  width={500}
                  height={550}
                  priority
                  className="w-full h-[420px] object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                {/* Floating Badge 1: Top Right */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2.5 animate-bounce-slow">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    9.8
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-900">Safety Score</p>
                    <p className="text-[9px] text-emerald-700 font-semibold">13/13 Inspected</p>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Left */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <LuFileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Tenancy Letter Ready</p>
                      <p className="text-[11px] text-gray-500">NSFAS &amp; Bursary Endorsed</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Instant PDF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. STATS BAR / TRUST NUMBERS */}
      {/* ========================================================================= */}
      <section className="border-y border-gray-200/80 bg-white py-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-0 sm:divide-x divide-gray-100">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">5,000+</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Verified Student Beds</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">9.4 / 10</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Average Safety Score</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">98%</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">NSFAS Endorsement Rate</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">20+</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-500">SA University Campuses</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK SEARCH & CATEGORY PILL FILTER */}
      {/* ========================================================================= */}
      <section id="properties" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Search &amp; Filter Safe Residences
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Every listing has a certified safety checklist score out of 10.
              </p>
            </div>

            {/* Quick Hub Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "ALL", label: "All Hubs" },
                { id: "WITS", label: "Wits / Braamfontein" },
                { id: "UJ", label: "UJ / Auckland Park" },
                { id: "UCT", label: "UCT / Rondebosch" },
                { id: "UP", label: "UP / Hatfield" },
                { id: "STELLENBOSCH", label: "Stellenbosch" },
              ].map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setSelectedHub(hub.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedHub === hub.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {hub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Keyword / Suburb Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <LuSearch className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suburb, street, or title..."
                className="w-full rounded-2xl border border-gray-300 bg-gray-50/50 pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="ALL">Any Monthly Budget</option>
              <option value="UNDER_5000">Under R5,000 / month</option>
              <option value="5000_7000">R5,000 – R7,000 / month</option>
              <option value="ABOVE_7000">Above R7,000 / month</option>
            </select>

            {/* Safety Score Filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 bg-gray-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-gray-900 shadow-sm focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="ALL">Any Safety Score</option>
              <option value="8">Safety Score: 8.0+ / 10</option>
              <option value="9">Top Safety Tier: 9.0+ / 10</option>
            </select>

            {/* Clear Button */}
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedHub("ALL");
                setPriceFilter("ALL");
                setMinScoreFilter("ALL");
              }}
              className="w-full py-2.5 rounded-2xl border border-gray-200 bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-all"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Live Properties Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto">
                <LuSearch className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-gray-800">No verified listings match your search.</p>
              <p className="text-xs text-gray-500">Try adjusting your budget or safety score filters.</p>
            </div>
          )}

          {filteredProperties.map((p) => {
            const score = p.safetyScore !== null ? Number(p.safetyScore) : null;
            const scoreColor =
              score && score >= 9.0
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : score && score >= 7.5
                ? "bg-teal-100 text-teal-800 border-teal-200"
                : "bg-amber-100 text-amber-800 border-amber-200";

            return (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="group block rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
              >
                {/* Image / Banner Container */}
                <div className="relative h-48 bg-gradient-to-tr from-gray-900 to-gray-700 overflow-hidden">
                  <Image
                    src="/accomodation.png"
                    alt={p.title}
                    width={400}
                    height={250}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Safety Score Badge */}
                  {score !== null && (
                    <div className={`absolute top-3.5 right-3.5 px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-md ${scoreColor}`}>
                      <LuShieldCheck className="w-4 h-4" />
                      <span>{score.toFixed(1)} / 10</span>
                    </div>
                  )}

                  {/* Campus distance pill */}
                  {p.distanceToCampus && (
                    <div className="absolute bottom-3 left-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{p.distanceToCampus} km to campus</span>
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <LuMapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{p.suburb}, {p.city}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Monthly Rent</span>
                      <span className="text-base font-black text-gray-900">
                        R{Number(p.priceMonthly).toLocaleString()}
                        <span className="text-xs text-gray-500 font-normal"> / mo</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                        {p.bedrooms} Bed{p.bedrooms > 1 ? "s" : ""}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
                        View →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THREE-PILLAR VALUE HIGHLIGHT STRIP (Vibrant Banner) */}
      {/* ========================================================================= */}
      <section className="my-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl mb-10 text-center sm:text-left">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">
              The CampusNest Guarantee
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1">
              Built Specifically for South African Student Realities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <LuLock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">13-Point Safety Scoring</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Perimeter gates, functional deadbolts, smoke alarms, load-shedding backup water/power, and crime-risk audit before any room is listed.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <LuFileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Instant NSFAS Letters</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Automated cryptographic Tenancy Confirmation Letters with university administrator endorsement ready for bursary disbursement.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <LuShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Zero Scam Guarantee</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Every landlord is identity-verified. No fake WhatsApp deposits, uninspected student slums, or ghost leases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. POPULAR CAMPUS DESTINATIONS (Polaroid / Hub Cards) */}
      {/* ========================================================================= */}
      <section id="destinations" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Top Student Hubs
          </p>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Find Your Perfect Campus Destination
          </h2>
          <p className="text-sm text-gray-500">
            Accredited student housing precincts within walking distance to lecture halls.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPUS_HUBS.map((hub) => (
            <div
              key={hub.name}
              className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              <div className="relative h-64 bg-gray-900">
                <Image
                  src={hub.image}
                  alt={hub.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-75"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${hub.gradient}`} />

                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25">
                      {hub.beds}
                    </span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow">
                      ★ {hub.safety}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold tracking-tight leading-snug">{hub.name}</h3>
                    <p className="text-xs text-white/80 font-medium">{hub.uni}</p>
                    <p className="text-xs font-bold pt-2 text-white/90">
                      From {hub.avgPrice} <span className="font-normal text-[11px] text-white/70">/ month</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HOW IT WORKS IN 3 STEPS */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Simple 3-Step Process
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              How CampusNest Works for Students
            </h2>
            <p className="text-sm text-gray-500">
              From discovering a safe loft to handing your university-endorsed letter to NSFAS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-gray-900">Search &amp; Inspect Scores</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Filter residences by safety score, proximity to your campus shuttle, private vs sharing rooms, and price.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-gray-900">Apply &amp; Confirm Tenancy</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Submit your verified student profile. The landlord accepts your application and activates your tenancy on-platform.
              </p>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200/80 text-center space-y-4 hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-xl flex items-center justify-center mx-auto shadow-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-gray-900">Get Endorsed Confirmation</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your university admin endorses the tenancy letter, and an official PDF is dispatched to you and your bursary scheme.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STUDENT TESTIMONIAL CARD (Gold/Yellow Card Showcase) */}
      {/* ========================================================================= */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#fef9c3] border border-amber-200 p-8 sm:p-12 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <LuStar key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-lg sm:text-xl font-semibold text-gray-900 italic leading-relaxed">
                &ldquo;Finding accommodation in Braamfontein used to be terrifying with fake landlords and fire hazards. Through CampusNest, I picked a loft with a 9.6 safety score and got my NSFAS tenancy confirmation letter endorsed in 24 hours!&rdquo;
              </p>
              <div>
                <p className="font-bold text-gray-900">Lerato Nkosi</p>
                <p className="text-xs text-gray-600">2nd Year BSc Computer Science · Wits University</p>
              </div>
            </div>

            <div className="shrink-0 w-36 h-36 rounded-3xl overflow-hidden border-4 border-white shadow-md bg-amber-100">
              <Image
                src="/students-auth.png"
                alt="Student testimonial"
                width={150}
                height={150}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Frequently Asked Questions
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Have Questions? We&apos;ve Got Answers
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden transition-colors"
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM HIGH-CONVERSION CTA */}
      {/* ========================================================================= */}
      <section className="py-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-100/60 via-white to-[#fafbfc] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            Secure Your Accommodation Today
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900">
            Looking for the Safest Student Housing Experience?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Join thousands of students who moved into verified residences with certified safety scores and instant bursary confirmation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#099250] hover:bg-[#087a43] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Get Started as Student
            </Link>
            <Link
              href="/landlord"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm shadow-sm transition-all"
            >
              For Landlords &amp; Property Owners
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-gray-200 py-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-black text-base text-gray-900">
              <span className="text-emerald-600 text-xl">⌂</span> CampusNest
            </div>
            <p className="text-gray-500 leading-relaxed">
              South Africa&apos;s accredited student accommodation safety and bursary confirmation network.
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Students</p>
            <ul className="space-y-1.5">
              <li><a href="#properties" className="hover:text-emerald-600">Browse Listings</a></li>
              <li><Link href="/login" className="hover:text-emerald-600">Student Sign In</Link></li>
              <li><Link href="/register" className="hover:text-emerald-600">Create Account</Link></li>
              <li><a href="#faqs" className="hover:text-emerald-600">Safety Scoring FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Landlords</p>
            <ul className="space-y-1.5">
              <li><Link href="/landlord" className="hover:text-emerald-600">Landlord Overview</Link></li>
              <li><Link href="/landlord/register" className="hover:text-emerald-600">List Your Property</Link></li>
              <li><Link href="/landlord/login" className="hover:text-emerald-600">Landlord Sign In</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Universities &amp; Support</p>
            <p className="text-gray-500">Support: support@campusnest.co.za</p>
            <p className="text-gray-500">Safety Hotline: +27 11 000 9988</p>
            <p className="text-[11px] text-gray-400 pt-2">© 2026 CampusNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

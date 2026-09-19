"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ApplyButton from "@/app/properties/apply-button";
import FavoriteButton from "@/app/properties/favorite-button";
import { calculateDistanceKm } from "@/lib/maps/campuses";
import { getPublicMediaUrl, FALLBACK_RESIDENCE_IMAGES } from "@/lib/media";
import {
  LuSearch,
  LuShieldCheck,
  LuMapPin,
  LuGraduationCap,
  LuBed,
  LuBath,
  LuUsers,
  LuSparkles,
} from "react-icons/lu";

// Wits University Main Campuses
const WITS_EAST_COORDS = { lat: -26.1912, lng: 28.0302, name: "Wits East Campus" };
const WITS_WEST_COORDS = { lat: -26.1878, lng: 28.0245, name: "Wits West Campus" };

export interface StudentPropertyItem {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  priceMonthly: number;
  depositAmount: number | null;
  bedrooms: number;
  bathrooms: number | null;
  maxOccupants: number | null;
  distanceToCampus: number | null;
  safetyScore: number | null;
  status: string;
  description: string | null;
  amenities: string[];
  images: string[];
  physicalInspectionAt: string | null;
  physicalInspectorName: string | null;
  accreditationReference: string | null;
  landlord: {
    name: string;
    surname: string;
    landlordProfile?: {
      companyName?: string | null;
      entityType?: string | null;
    } | null;
  };
  passedChecks: number;
  totalChecks: number;
  roomsAvailable: number;
  isSaved: boolean;
  hasApplied: boolean;
}

interface Props {
  properties: StudentPropertyItem[];
}

export default function StudentAccreditedResidencesBrowser({ properties }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [bursaryFilter, setBursaryFilter] = useState<"ALL" | "NSFAS" | "PRIVATE">("ALL");
  const [priceFilter, setPriceFilter] = useState<"ALL" | "UNDER_4500" | "NSFAS_CAP" | "ABOVE_5500">("ALL");
  const [distanceMax, setDistanceMax] = useState<"ALL" | "0.5" | "1.0" | "2.0">("ALL");
  const [sortBy, setSortBy] = useState<"PROXIMITY" | "WITS_EAST" | "WITS_WEST" | "PRICE_ASC" | "PRICE_DESC" | "SAFETY">("PROXIMITY");

  // Augment properties with accurate distance calculations to Wits East & West
  const augmentedProperties = useMemo(() => {
    return properties.map((p) => {
      let distEast: number | null = null;
      let distWest: number | null = null;

      if (typeof p.latitude === "number" && typeof p.longitude === "number" && !isNaN(p.latitude) && !isNaN(p.longitude)) {
        distEast = calculateDistanceKm(p.latitude, p.longitude, WITS_EAST_COORDS.lat, WITS_EAST_COORDS.lng);
        distWest = calculateDistanceKm(p.latitude, p.longitude, WITS_WEST_COORDS.lat, WITS_WEST_COORDS.lng);
      } else if (p.distanceToCampus) {
        distEast = Number(p.distanceToCampus);
        distWest = Number(p.distanceToCampus) + 0.3;
      }

      const minDist = distEast !== null && distWest !== null ? Math.min(distEast, distWest) : (distEast || distWest || 0.8);
      const isNsfas =
        (p.amenities && p.amenities.includes("NSFAS_ACCREDITED")) ||
        (p.description && /nsfas accredited/i.test(p.description));

      return {
        ...p,
        distEast,
        distWest,
        minDist,
        isNsfas,
        monthlyRentNum: Number(p.priceMonthly) || 4500,
      };
    });
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = augmentedProperties.filter((p) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q);

      // Bursary filter
      if (bursaryFilter === "NSFAS" && !p.isNsfas) return false;
      if (bursaryFilter === "PRIVATE" && p.isNsfas) return false;

      // Price filter
      if (priceFilter === "UNDER_4500" && p.monthlyRentNum > 4500) return false;
      if (priceFilter === "NSFAS_CAP" && p.monthlyRentNum > 5200) return false;
      if (priceFilter === "ABOVE_5500" && p.monthlyRentNum < 5500) return false;

      // Distance filter (Wits proximity)
      if (distanceMax === "0.5" && p.minDist > 0.5) return false;
      if (distanceMax === "1.0" && p.minDist > 1.0) return false;
      if (distanceMax === "2.0" && p.minDist > 2.0) return false;

      return matchesSearch;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "PROXIMITY") return (a.minDist || 99) - (b.minDist || 99);
      if (sortBy === "WITS_EAST") return (a.distEast || 99) - (b.distEast || 99);
      if (sortBy === "WITS_WEST") return (a.distWest || 99) - (b.distWest || 99);
      if (sortBy === "PRICE_ASC") return a.monthlyRentNum - b.monthlyRentNum;
      if (sortBy === "PRICE_DESC") return b.monthlyRentNum - a.monthlyRentNum;
      if (sortBy === "SAFETY") return (b.safetyScore || 0) - (a.safetyScore || 0);
      return 0;
    });

    return result;
  }, [augmentedProperties, searchTerm, bursaryFilter, priceFilter, distanceMax, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by residence title, suburb, or address (e.g. Braamfontein, Parktown)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] placeholder-slate-400 font-medium"
            />
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setBursaryFilter("ALL");
              setPriceFilter("ALL");
              setDistanceMax("ALL");
              setSortBy("PROXIMITY");
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all shrink-0"
          >
            Reset Filters
          </button>
        </div>

        {/* 4 Priority Filters Grid */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Bursary / NSFAS */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuGraduationCap className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Bursary &amp; Scheme</span>
            </label>
            <select
              value={bursaryFilter}
              onChange={(e) => setBursaryFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">All Schemes</option>
              <option value="NSFAS">NSFAS Accredited Only</option>
              <option value="PRIVATE">Private / Self-Funded</option>
            </select>
          </div>

          {/* 2. Monthly Budget */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Monthly Budget
            </label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">Any Monthly Budget</option>
              <option value="UNDER_4500">Under R4,500 / month</option>
              <option value="NSFAS_CAP">NSFAS Cap (≤ R5,200/mo)</option>
              <option value="ABOVE_5500">R5,500+ / month</option>
            </select>
          </div>

          {/* 3. Distance to Wits Campus */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuMapPin className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Distance to Wits</span>
            </label>
            <select
              value={distanceMax}
              onChange={(e) => setDistanceMax(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">Any Distance</option>
              <option value="0.5">&lt; 500m (Walkable to Wits)</option>
              <option value="1.0">&lt; 1.0 km to Wits</option>
              <option value="2.0">&lt; 2.0 km to Wits</option>
            </select>
          </div>

          {/* 4. Sorting */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuSparkles className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Prioritize &amp; Sort</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-[#005F56]/30 bg-[#005F56]/5 font-bold text-[#005F56] focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="PROXIMITY">Closest to Wits (Overall)</option>
              <option value="WITS_EAST">Closest to Wits East Campus</option>
              <option value="WITS_WEST">Closest to Wits West Campus</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="SAFETY">Top Safety Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <p>
          Showing <strong className="text-slate-800">{filteredProperties.length}</strong> accredited residence{filteredProperties.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      {filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-10 text-center">
          <p className="font-bold text-[#0F172A]">No accredited residences match your filters</p>
          <p className="mt-1 text-sm text-[#64748B]">Try expanding your monthly budget or distance range.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => {
            const landlordProfile = property.landlord.landlordProfile;
            const providerName = landlordProfile?.companyName || `${property.landlord.name} ${property.landlord.surname}`;
            const inspected = Boolean(property.physicalInspectionAt && property.physicalInspectorName);
            const publicAmenities = (property.amenities || []).filter((a) => a !== "NSFAS_ACCREDITED");

            const resolvedImages = (property.images || []).map(getPublicMediaUrl).filter(Boolean);
            const photoCount = resolvedImages.length;
            const fallbackIndex =
              [...property.id].reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_RESIDENCE_IMAGES.length;
            const coverImage = resolvedImages[0] || FALLBACK_RESIDENCE_IMAGES[fallbackIndex];
            const thumbnails = resolvedImages.slice(1, 4);

            return (
              <article
                key={property.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-lg"
              >
                {/* Photo showcase */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#E2E8F0]">
                  <img
                    src={coverImage}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-white/30 bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#047857]">
                      Accredited
                    </span>
                    {property.isNsfas && (
                      <span className="rounded-full bg-[#047857] px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                        NSFAS
                      </span>
                    )}
                    {property.status === "VERIFIED" && (
                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#0F172A]">
                        Verified Safe
                      </span>
                    )}
                  </div>

                  <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5 justify-end">
                    {property.safetyScore && (
                      <span className="flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white/95 px-2.5 py-1 text-xs font-black text-[#047857] shadow-xs">
                        <LuShieldCheck className="h-3.5 w-3.5" />
                        {Number(property.safetyScore).toFixed(1)}/10
                      </span>
                    )}
                    <FavoriteButton propertyId={property.id} initialSaved={property.isSaved} />
                  </div>

                  {/* Campus distance overlay pill */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[10px] font-semibold">
                    <div className="bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {property.distEast !== null ? `${property.distEast} km Wits East` : ""}{" "}
                        {property.distWest !== null ? `• ${property.distWest} km West` : ""}
                      </span>
                    </div>

                    {photoCount > 0 && (
                      <span className="rounded-full bg-[#0F172A]/70 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                        {photoCount} photo{photoCount !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {thumbnails.length > 0 && (
                  <div className="grid grid-cols-3 gap-1 bg-white px-1 pt-1">
                    {thumbnails.map((src, i) => (
                      <img key={i} src={src} alt={`${property.title} photo ${i + 2}`} className="h-16 w-full rounded-lg object-cover" />
                    ))}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold leading-tight text-[#0F172A] group-hover:text-[#005F56] transition-colors">
                    {property.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#64748B]">
                    <LuMapPin className="h-3.5 w-3.5 shrink-0 text-[#059669]" />
                    {property.address}, {property.suburb}, {property.city}
                  </p>

                  {property.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#64748B]">{property.description}</p>
                  )}

                  {publicAmenities.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {publicAmenities.slice(0, 4).map((a) => (
                        <span
                          key={a}
                          className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[10px] font-bold text-[#475569]"
                        >
                          {a.replace(/_/g, " ")}
                        </span>
                      ))}
                      {publicAmenities.length > 4 && (
                        <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#94A3B8]">
                          +{publicAmenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-[#F8FAFC] p-3">
                      <p className="text-[#94A3B8]">Monthly rent</p>
                      <p className="mt-1 font-bold text-[#0F172A]">R {property.priceMonthly.toLocaleString("en-ZA")}</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-3">
                      <p className="text-[#94A3B8]">Deposit</p>
                      <p className="mt-1 font-bold text-[#0F172A]">
                        {property.depositAmount ? `R ${property.depositAmount.toLocaleString("en-ZA")}` : "—"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-3">
                      <p className="text-[#94A3B8]">Bedrooms</p>
                      <p className="mt-1 font-bold text-[#0F172A]">{property.bedrooms} Rooms</p>
                    </div>
                    <div className="rounded-xl bg-[#F8FAFC] p-3">
                      <p className="text-[#94A3B8]">Safety checks</p>
                      <p className="mt-1 font-bold text-emerald-700">
                        {property.passedChecks}/{property.totalChecks} passed
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[#F1F5F9] pt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Listed by</p>
                    <p className="mt-1 text-sm font-bold text-[#0F172A]">{providerName}</p>
                    <p className="mt-0.5 text-xs text-[#64748B]">
                      {landlordProfile?.entityType?.replaceAll("_", " ") || "Registered accommodation provider"}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Link
                      href={`/properties/${property.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-xs font-bold text-[#334155] transition-colors hover:bg-[#F8FAFC]"
                    >
                      View details
                    </Link>
                    <ApplyButton propertyId={property.id} hasApplied={property.hasApplied} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

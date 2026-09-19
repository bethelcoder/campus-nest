"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getPublicMediaUrl } from "@/lib/media";
import PropertiesExplorerMap, { ExplorerProperty } from "@/components/maps/properties-explorer-map";
import { calculateDistanceKm } from "@/lib/maps/campuses";
import {
  LuMapPin,
  LuShieldCheck,
  LuBed,
  LuBuilding2,
  LuArrowUpRight,
  LuSearch,
  LuLayoutGrid,
  LuMap,
  LuSparkles,
  LuSlidersHorizontal,
  LuCheck,
  LuZap,
  LuGraduationCap,
  LuClock,
  LuCompass,
} from "react-icons/lu";

const FALLBACK_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
];

// Wits University Main Campuses (Coordinates)
const WITS_EAST_COORDS = { lat: -26.1912, lng: 28.0302, name: "Wits East Campus" };
const WITS_WEST_COORDS = { lat: -26.1878, lng: 28.0245, name: "Wits West Campus" };

interface ResidenceDirectoryItem {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  priceMonthly: number | any;
  bedrooms?: number | null;
  bathrooms?: number | null;
  maxOccupants?: number | null;
  distanceToCampus?: number | any | null;
  safetyScore?: number | any | null;
  status: string;
  amenities: string[];
  images: string[];
  description?: string | null;
  latitude?: number | any | null;
  longitude?: number | any | null;
  physicalInspectionAt?: Date | string | null;
  physicalInspectorName?: string | null;
  landlord: {
    name: string;
    surname: string;
    landlordProfile?: {
      companyName?: string | null;
      entityType?: string | null;
    } | null;
  };
  roomListings?: Array<{
    availableUnits: number;
  }>;
}

interface ResidencesDirectoryViewProps {
  properties: ResidenceDirectoryItem[];
}

export default function ResidencesDirectoryView({ properties }: ResidencesDirectoryViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [bursaryFilter, setBursaryFilter] = useState<"ALL" | "NSFAS" | "PRIVATE">("ALL");
  const [priceRange, setPriceRange] = useState<"ALL" | "UNDER_4500" | "NSFAS_CAP" | "ABOVE_5500">("ALL");
  const [distanceMax, setDistanceMax] = useState<"ALL" | "0.5" | "1.0" | "2.0">("ALL");
  const [sortBy, setSortBy] = useState<"PROXIMITY" | "WITS_EAST" | "WITS_WEST" | "PRICE_ASC" | "PRICE_DESC" | "SAFETY">("PROXIMITY");
  const [selectedCity, setSelectedCity] = useState("ALL");

  const cities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [properties]);

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
      if (selectedCity !== "ALL" && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }

      // Bursary / NSFAS filter
      if (bursaryFilter === "NSFAS" && !p.isNsfas) return false;
      if (bursaryFilter === "PRIVATE" && p.isNsfas) return false;

      // Price Filter
      if (priceRange === "UNDER_4500" && p.monthlyRentNum > 4500) return false;
      if (priceRange === "NSFAS_CAP" && p.monthlyRentNum > 5200) return false;
      if (priceRange === "ABOVE_5500" && p.monthlyRentNum < 5500) return false;

      // Distance Filter (Wits proximity)
      if (distanceMax === "0.5" && p.minDist > 0.5) return false;
      if (distanceMax === "1.0" && p.minDist > 1.0) return false;
      if (distanceMax === "2.0" && p.minDist > 2.0) return false;

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesSuburb = p.suburb.toLowerCase().includes(query);
        const matchesCity = p.city.toLowerCase().includes(query);
        const matchesDesc = (p.description || "").toLowerCase().includes(query);
        if (!matchesTitle && !matchesSuburb && !matchesCity && !matchesDesc) return false;
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "PROXIMITY") return (a.minDist || 99) - (b.minDist || 99);
      if (sortBy === "WITS_EAST") return (a.distEast || 99) - (b.distEast || 99);
      if (sortBy === "WITS_WEST") return (a.distWest || 99) - (b.distWest || 99);
      if (sortBy === "PRICE_ASC") return a.monthlyRentNum - b.monthlyRentNum;
      if (sortBy === "PRICE_DESC") return b.monthlyRentNum - a.monthlyRentNum;
      if (sortBy === "SAFETY") return Number(b.safetyScore || 0) - Number(a.safetyScore || 0);
      return 0;
    });

    return result;
  }, [augmentedProperties, selectedCity, bursaryFilter, priceRange, distanceMax, sortBy, searchTerm]);

  // Format properties for map explorer
  const mapProperties: ExplorerProperty[] = useMemo(() => {
    return filteredProperties.map((p) => ({
      id: p.id,
      title: p.title,
      address: p.address,
      suburb: p.suburb,
      city: p.city,
      priceMonthly: Number(p.priceMonthly) || 4500,
      bedrooms: p.bedrooms,
      distanceToCampus: p.distanceToCampus ? Number(p.distanceToCampus) : null,
      safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
      amenities: p.amenities,
      images: p.images,
      latitude: p.latitude ? Number(p.latitude) : null,
      longitude: p.longitude ? Number(p.longitude) : null,
      landlord: {
        name: p.landlord.name,
        surname: p.landlord.surname,
      },
    }));
  }, [filteredProperties]);

  return (
    <div className="space-y-6 font-poppins">
      {/* Search, Filter & View Mode Controls Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        {/* Top Row: Search Input & View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by residence title, street, suburb (e.g. Braamfontein, Parktown, Auckland Park)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] placeholder-slate-400"
            />
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-[#005F56] shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LuLayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "map"
                    ? "bg-[#005F56] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LuMap className="w-3.5 h-3.5" />
                <span>Map GPS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: 4 Priority Filters (Price, Distance to Wits East/West, Bursary/NSFAS, Sorting) */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. Bursary / NSFAS Filter */}
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
              <option value="ALL">All Funding Types</option>
              <option value="NSFAS">NSFAS Accredited Only (Capped)</option>
              <option value="PRIVATE">Private &amp; Self-Funded</option>
            </select>
          </div>

          {/* 2. Monthly Price Range Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuSlidersHorizontal className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Monthly Budget</span>
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">All Price Ranges</option>
              <option value="UNDER_4500">Under R4,500 / month</option>
              <option value="NSFAS_CAP">Under R5,200 (NSFAS Cap)</option>
              <option value="ABOVE_5500">R5,500+ / month (Premium)</option>
            </select>
          </div>

          {/* 3. Distance to Wits Main Campus (East / West) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuCompass className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Wits Campus Proximity</span>
            </label>
            <select
              value={distanceMax}
              onChange={(e) => setDistanceMax(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">Any Distance to Wits</option>
              <option value="0.5">Within 500m (5 min walk)</option>
              <option value="1.0">Within 1.0 km (10 min walk)</option>
              <option value="2.0">Within 2.0 km (Campus Zone)</option>
            </select>
          </div>

          {/* 4. Priority Sorting */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <LuClock className="w-3.5 h-3.5 text-[#005F56]" />
              <span>Sort Residences By</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="PROXIMITY">Closest to Wits Campus (Overall)</option>
              <option value="WITS_EAST">Closest to Wits East Campus</option>
              <option value="WITS_WEST">Closest to Wits West Campus</option>
              <option value="PRICE_ASC">Price: Lowest to Highest</option>
              <option value="PRICE_DESC">Price: Highest to Lowest</option>
              <option value="SAFETY">Highest Verified Safety Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* View Mode: Map Explorer */}
      {viewMode === "map" && (
        <div className="space-y-3">
          <PropertiesExplorerMap
            properties={mapProperties}
            height="620px"
          />
        </div>
      )}

      {/* View Mode: Grid View */}
      {viewMode === "grid" && (
        <>
          {filteredProperties.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-white space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#005F56]/10 text-[#005F56] flex items-center justify-center mx-auto">
                <LuBuilding2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Residences Match Your Filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, distance to Wits campus, or bursary criteria to see available student rooms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((p, idx) => {
                const rawImage =
                  p.images && p.images.length > 0
                    ? p.images[0]
                    : FALLBACK_PROPERTY_IMAGES[idx % FALLBACK_PROPERTY_IMAGES.length];

                const image =
                  getPublicMediaUrl(rawImage) ||
                  FALLBACK_PROPERTY_IMAGES[idx % FALLBACK_PROPERTY_IMAGES.length];

                const slug =
                  p.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
                  p.id;

                const score = p.safetyScore ? Number(p.safetyScore).toFixed(1) : null;
                const resolvedImages = (p.images || []).map(getPublicMediaUrl).filter(Boolean);
                const photoCount = resolvedImages.length;

                return (
                  <Link
                    key={p.id}
                    href={`/residences/${slug}`}
                    className="group rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg hover:border-[#005F56] transition-all flex flex-col"
                  >
                    <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                      <img
                        src={image}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {p.isNsfas && (
                          <span className="px-2.5 py-1 rounded-md bg-[#005F56] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <LuCheck className="w-3 h-3" /> NSFAS Capped
                          </span>
                        )}
                        {p.status === "VERIFIED" && (
                          <span className="px-2.5 py-1 rounded-md bg-white/95 text-slate-900 text-[10px] font-bold backdrop-blur-xs shadow-2xs">
                            Verified Safe
                          </span>
                        )}
                      </div>

                      {score && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-white/95 text-[#005F56] text-xs font-black backdrop-blur-xs shadow-2xs flex items-center gap-1 border border-slate-200">
                          <LuShieldCheck className="w-3.5 h-3.5" />
                          <span>{score}/10</span>
                        </div>
                      )}

                      {/* Distance Badge to Wits Campuses */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 text-white text-[10px] font-semibold backdrop-blur-xs flex items-center gap-1.5">
                        <LuMapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>
                          {p.distEast !== null
                            ? `${p.distEast.toFixed(1)} km to Wits East${p.distWest !== null ? ` • ${p.distWest.toFixed(1)} km West` : ""}`
                            : `${Number(p.minDist).toFixed(1)} km to Campus`}
                        </span>
                      </div>

                      {photoCount > 0 && (
                        <span className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-slate-900/70 text-white text-[10px] font-bold backdrop-blur-xs">
                          {photoCount} {photoCount === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#005F56] transition-colors line-clamp-1">
                          {p.title}
                        </h3>

                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <LuMapPin className="w-3.5 h-3.5 text-[#005F56] shrink-0" />
                          <span className="truncate">
                            {p.address}, {p.suburb}
                          </span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Student Rate
                          </span>
                          <span className="text-base font-black text-[#005F56]">
                            R{p.monthlyRentNum.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500">/mo</span>
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#005F56] group-hover:translate-x-0.5 transition-transform">
                          <span>View &amp; Apply</span>
                          <LuArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

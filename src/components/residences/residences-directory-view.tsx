"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { getPublicMediaUrl } from "@/lib/media";
import PropertiesExplorerMap, { ExplorerProperty } from "@/components/maps/properties-explorer-map";
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
} from "react-icons/lu";

const FALLBACK_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
];

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
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState("ALL");

  const cities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (selectedCity !== "ALL" && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      const isNsfas =
        (p.amenities && p.amenities.includes("NSFAS_ACCREDITED")) ||
        (p.description && /nsfas accredited/i.test(p.description));
      if (nsfasOnly && !isNsfas) return false;

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
  }, [properties, selectedCity, nsfasOnly, searchTerm]);

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
    <div className="space-y-6">
      {/* Search, Filter & View Mode Controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by residence name, suburb, or city (e.g. Braamfontein, Hatfield)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] placeholder-slate-400"
          />
          <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {cities.length > 0 && (
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20"
            >
              <option value="ALL">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={nsfasOnly}
              onChange={(e) => setNsfasOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#005F56] focus:ring-[#005F56]"
            />
            <span>NSFAS Accredited Only</span>
          </label>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
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
              <span>Grid View</span>
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
              <span>Map Explorer (GPS)</span>
            </button>
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
              <h3 className="text-base font-bold text-slate-900">No Residences Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query, city filter, or NSFAS filter to discover available accommodation.
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

                const isNsfas =
                  (p.amenities && p.amenities.includes("NSFAS_ACCREDITED")) ||
                  (p.description && /nsfas accredited/i.test(p.description));

                const score = p.safetyScore ? Number(p.safetyScore).toFixed(1) : null;
                const resolvedImages = (p.images || []).map(getPublicMediaUrl).filter(Boolean);
                const photoCount = resolvedImages.length;
                const providerName =
                  p.landlord.landlordProfile?.companyName ||
                  `${p.landlord.name} ${p.landlord.surname}`;
                const roomsAvailable = (p.roomListings || []).reduce(
                  (sum, r) => sum + r.availableUnits,
                  0
                );

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
                        {isNsfas && (
                          <span className="px-2.5 py-1 rounded-md bg-[#005F56] text-white text-[10px] font-bold shadow-xs">
                            NSFAS Accredited
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
                            {p.suburb}, {p.city}
                          </span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                            Rates From
                          </span>
                          <span className="text-base font-black text-[#005F56]">
                            R{Number(p.priceMonthly || 0).toLocaleString()}
                            <span className="text-xs font-normal text-slate-500">/mo</span>
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#005F56] group-hover:translate-x-0.5 transition-transform">
                          <span>View Rooms</span>
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

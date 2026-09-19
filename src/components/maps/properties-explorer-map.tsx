"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import GoogleMapWrapper, { MapMarkerItem } from "./google-map-wrapper";
import { SA_CAMPUSES, CampusLocation, calculateDistanceKm, findNearestCampus } from "@/lib/maps/campuses";
import { getCoordinatesForAddress } from "@/lib/maps/geocoding";
import { getPublicMediaUrl, FALLBACK_RESIDENCE_IMAGES } from "@/lib/media";
import {
  LuMapPin,
  LuShieldCheck,
  LuBed,
  LuCheck,
  LuCompass,
  LuX,
  LuArrowUpRight,
  LuSlidersHorizontal,
  LuSparkles,
  LuNavigation,
  LuLoader,
} from "react-icons/lu";

export interface ExplorerProperty {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  priceMonthly: number | string;
  bedrooms?: number | null;
  distanceToCampus?: number | string | null;
  safetyScore?: number | string | null;
  amenities?: string[];
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
  landlord?: {
    name?: string | null;
    surname?: string | null;
  } | null;
}

interface PropertiesExplorerMapProps {
  properties: ExplorerProperty[];
  selectedCampusId?: string;
  height?: string;
  onSelectProperty?: (property: ExplorerProperty) => void;
  className?: string;
}

export default function PropertiesExplorerMap({
  properties,
  selectedCampusId = "uj-apk",
  height = "600px",
  onSelectProperty,
  className = "",
}: PropertiesExplorerMapProps) {
  const [activeCampusId, setActiveCampusId] = useState<string>(selectedCampusId);
  const [selectedPropId, setSelectedPropId] = useState<string | null>(
    properties.length > 0 ? properties[0].id : null
  );
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000);
  const [nsfasOnly, setNsfasOnly] = useState(false);
  const [radiusFilter, setRadiusFilter] = useState<number>(3000); // 3km radius
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationNotice("Geolocation is not supported by your browser");
      return;
    }
    setLocatingUser(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocatingUser(false);
        const nearest = findNearestCampus(coords.lat, coords.lng);
        if (nearest) {
          setActiveCampusId(nearest.campus.id);
          setLocationNotice(`Located! Nearest campus: ${nearest.campus.universityName} (${nearest.distanceKm} km away)`);
        } else {
          setLocationNotice("Location detected successfully");
        }
        setTimeout(() => setLocationNotice(null), 5000);
      },
      (err) => {
        setLocatingUser(false);
        setLocationNotice("Unable to retrieve GPS location. Please allow location access in your browser.");
        setTimeout(() => setLocationNotice(null), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Selected campus
  const currentCampus =
    SA_CAMPUSES.find((c) => c.id === activeCampusId) || SA_CAMPUSES[0];

  // Prepare properties with resolved coordinates & filters
  const processedProperties = useMemo(() => {
    return properties
      .map((p) => {
        let lat = p.latitude;
        let lng = p.longitude;

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
          const fallback = getCoordinatesForAddress(p.address, p.suburb, p.city);
          lat = fallback.lat;
          lng = fallback.lng;
        }

        const price = Number(p.priceMonthly) || 4500;
        const distToActiveCampus = calculateDistanceKm(
          lat,
          lng,
          currentCampus.lat,
          currentCampus.lng
        );

        const isNsfas =
          (p.amenities && p.amenities.includes("NSFAS_ACCREDITED")) || false;

        return {
          ...p,
          lat,
          lng,
          price,
          distToActiveCampus,
          isNsfas,
        };
      })
      .filter((p) => {
        if (p.price > maxPriceFilter) return false;
        if (nsfasOnly && !p.isNsfas) return false;
        return true;
      });
  }, [properties, currentCampus, maxPriceFilter, nsfasOnly]);

  // Active selected property
  const activeProperty = useMemo(() => {
    return (
      processedProperties.find((p) => p.id === selectedPropId) ||
      (processedProperties.length > 0 ? processedProperties[0] : null)
    );
  }, [processedProperties, selectedPropId]);

  // Construct Map Markers (Campuses + Filtered Properties)
  const mapMarkers: MapMarkerItem[] = useMemo(() => {
    const markers: MapMarkerItem[] = [];

    if (userLocation) {
      markers.push({
        id: "user-gps-location",
        lat: userLocation.lat,
        lng: userLocation.lng,
        title: "Your GPS Location",
        subtitle: "Near Me Center",
        iconType: "residence",
      });
    }

    markers.push({
      id: `campus-${currentCampus.id}`,
      lat: currentCampus.lat,
      lng: currentCampus.lng,
      title: `${currentCampus.shortCode} Campus`,
      isCampus: true,
      iconType: "campus",
    });

    processedProperties.forEach((p) => {
      markers.push({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.title,
        price: p.price,
        subtitle: `${p.suburb}, ${p.city}`,
        isNsfas: p.isNsfas,
        safetyScore: p.safetyScore ? Number(p.safetyScore) : null,
        iconType: "residence",
        data: p,
      });
    });

    return markers;
  }, [currentCampus, processedProperties, userLocation]);

  const handleMarkerClick = (marker: MapMarkerItem) => {
    if (marker.isCampus || marker.id === "user-gps-location") return;
    setSelectedPropId(marker.id);
    const prop = processedProperties.find((p) => p.id === marker.id);
    if (prop && onSelectProperty) onSelectProperty(prop);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Filter & Campus Switcher Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locatingUser}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs ${
              userLocation
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-[#005F56] text-white hover:bg-[#004d46]"
            } disabled:opacity-60`}
          >
            {locatingUser ? (
              <>
                <LuLoader className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <LuNavigation className="w-3.5 h-3.5" />
                <span>{userLocation ? "Near Me (Active)" : "Near Me (GPS)"}</span>
              </>
            )}
          </button>

          <span className="text-slate-300">|</span>

          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <LuCompass className="w-3.5 h-3.5 text-[#005F56]" /> Campus:
          </span>
          <select
            value={activeCampusId}
            onChange={(e) => setActiveCampusId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
          >
            {SA_CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.shortCode} — {c.campusName}
              </option>
            ))}
          </select>

          {/* Quick Radius Pills */}
          <div className="flex items-center gap-1 pl-2">
            {[1000, 3000, 5000].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusFilter(r)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  radiusFilter === r
                    ? "bg-[#005F56] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {r / 1000}km Radius
              </button>
            ))}
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={nsfasOnly}
              onChange={(e) => setNsfasOnly(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#005F56] focus:ring-[#005F56]"
            />
            <span>NSFAS Accredited Only</span>
          </label>

          <span className="text-slate-300">|</span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Max Rent:</span>
            <span className="font-bold text-slate-900">R{maxPriceFilter.toLocaleString()}</span>
            <input
              type="range"
              min="3000"
              max="9500"
              step="500"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-24 accent-[#005F56]"
            />
          </div>
        </div>
      </div>

      {locationNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <LuNavigation className="w-4 h-4 text-[#005F56] shrink-0" />
          <span>{locationNotice}</span>
        </div>
      )}

      {/* Main Map Canvas with Floating Property Preview Card */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        <GoogleMapWrapper
          center={userLocation || { lat: currentCampus.lat, lng: currentCampus.lng }}
          zoom={userLocation ? 15 : 14}
          markers={mapMarkers}
          selectedMarkerId={selectedPropId}
          onMarkerClick={handleMarkerClick}
          radiusCircle={{
            center: userLocation || { lat: currentCampus.lat, lng: currentCampus.lng },
            radiusMeters: radiusFilter,
            color: "#005F56",
          }}
          height={height}
        />

        {/* Floating Property Preview Drawer Card */}
        {activeProperty && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 pointer-events-auto">
            <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeProperty.isNsfas && (
                    <span className="px-2 py-0.5 rounded bg-[#005F56]/10 text-[#005F56] text-[10px] font-bold">
                      NSFAS
                    </span>
                  )}
                  {activeProperty.safetyScore && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                      <LuShieldCheck className="w-3 h-3 text-emerald-600" />
                      {Number(activeProperty.safetyScore).toFixed(1)}/10
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPropId(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LuX className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={
                      activeProperty.images && activeProperty.images.length > 0
                        ? getPublicMediaUrl(activeProperty.images[0])
                        : FALLBACK_RESIDENCE_IMAGES[0]
                    }
                    alt={activeProperty.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_RESIDENCE_IMAGES[0];
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {activeProperty.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <LuMapPin className="w-3 h-3 text-[#005F56] shrink-0" />
                    <span>{activeProperty.address}, {activeProperty.suburb}</span>
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-sm font-black text-slate-900">
                      R{activeProperty.price.toLocaleString()}
                      <span className="text-[10px] font-normal text-slate-500">/mo</span>
                    </span>

                    <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                      {activeProperty.distToActiveCampus.toFixed(1)} km to {currentCampus.shortCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <Link
                  href={`/properties/${activeProperty.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>View Details</span>
                  <LuArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeProperty.lat},${activeProperty.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-lg border border-slate-300 hover:border-[#005F56] text-slate-700 hover:text-[#005F56] text-xs font-bold transition-colors"
                >
                  Directions
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import GoogleMapWrapper, { MapMarkerItem } from "./google-map-wrapper";
import {
  CampusLocation,
  calculateDistanceKm,
  findNearestCampus,
  estimateCommute,
  findCampusByName,
  SA_CAMPUSES,
} from "@/lib/maps/campuses";
import { getCoordinatesForAddress } from "@/lib/maps/geocoding";
import {
  LuMapPin,
  LuCompass,
  LuFootprints,
  LuBike,
  LuBus,
  LuCar,
  LuShoppingBag,
  LuBookOpen,
  LuDumbbell,
  LuHeartPulse,
  LuExternalLink,
  LuNavigation,
  LuLayers,
} from "react-icons/lu";

interface ResidenceCommuteMapProps {
  property: {
    id?: string;
    title: string;
    address: string;
    suburb: string;
    city: string;
    latitude?: number | null;
    longitude?: number | null;
    distanceToCampus?: number | string | null;
    nearestUniversity?: string | null;
    nearestCampus?: string | null;
  };
  className?: string;
}

// Sample nearby student amenities around student hubs
function getNearbyPois(centerLat: number, centerLng: number) {
  return [
    {
      id: "poi-groceries-1",
      title: "Checkers & Pharmacy",
      category: "groceries",
      lat: centerLat + 0.0025,
      lng: centerLng + 0.003,
      distance: "250m",
    },
    {
      id: "poi-transit-1",
      title: "Campus Shuttle & Rea Vaya Stop",
      category: "transit",
      lat: centerLat - 0.0018,
      lng: centerLng + 0.0015,
      distance: "180m",
    },
    {
      id: "poi-study-1",
      title: "Student Study Center & Cafe",
      category: "study",
      lat: centerLat + 0.0012,
      lng: centerLng - 0.0022,
      distance: "320m",
    },
    {
      id: "poi-gym-1",
      title: "Virgin Active / Campus Gym",
      category: "gym",
      lat: centerLat - 0.003,
      lng: centerLng - 0.0025,
      distance: "400m",
    },
  ];
}

export default function ResidenceCommuteMap({
  property,
  className = "",
}: ResidenceCommuteMapProps) {
  const [selectedTravelMode, setSelectedTravelMode] = useState<
    "WALKING" | "CYCLING" | "TRANSIT" | "DRIVING"
  >("WALKING");
  const [showPois, setShowPois] = useState(true);

  // Resolved coordinates
  const coords = useMemo(() => {
    if (property.latitude && property.longitude) {
      return { lat: property.latitude, lng: property.longitude };
    }
    return getCoordinatesForAddress(property.address, property.suburb, property.city);
  }, [property.latitude, property.longitude, property.address, property.suburb, property.city]);

  // Target Campus matching
  const nearestCampus = useMemo(() => {
    const namedCampus = findCampusByName(
      property.nearestUniversity,
      property.nearestCampus
    );
    if (namedCampus) return namedCampus;

    const detected = findNearestCampus(coords.lat, coords.lng);
    return detected ? detected.campus : SA_CAMPUSES[0];
  }, [property.nearestUniversity, property.nearestCampus, coords]);

  // Distance calculation
  const distanceKm = useMemo(() => {
    if (property.distanceToCampus) {
      return Number(property.distanceToCampus);
    }
    return calculateDistanceKm(coords.lat, coords.lng, nearestCampus.lat, nearestCampus.lng);
  }, [property.distanceToCampus, coords, nearestCampus]);

  const commute = estimateCommute(distanceKm);
  const pois = useMemo(() => getNearbyPois(coords.lat, coords.lng), [coords.lat, coords.lng]);

  // Map Markers
  const markers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [
      {
        id: "residence-main",
        lat: coords.lat,
        lng: coords.lng,
        title: property.title,
        iconType: "residence",
      },
      {
        id: `campus-${nearestCampus.id}`,
        lat: nearestCampus.lat,
        lng: nearestCampus.lng,
        title: `${nearestCampus.shortCode} Gate`,
        isCampus: true,
        iconType: "campus",
      },
    ];

    if (showPois) {
      pois.forEach((poi) => {
        list.push({
          id: poi.id,
          lat: poi.lat,
          lng: poi.lng,
          title: poi.title,
          iconType: "poi",
          poiCategory: poi.category,
        });
      });
    }

    return list;
  }, [coords, nearestCampus, property.title, showPois, pois]);

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=${selectedTravelMode.toLowerCase()}`;

  return (
    <div className={`p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LuMapPin className="w-5 h-5 text-[#005F56]" />
            <span>Location &amp; Campus Proximity</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {property.address}, {property.suburb}, {property.city}
          </p>
        </div>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#005F56]/10 hover:bg-[#005F56] text-[#005F56] hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <span>Get Directions</span>
          <LuExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Commute Mode Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setSelectedTravelMode("WALKING")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTravelMode === "WALKING"
              ? "border-[#005F56] bg-emerald-50/70 ring-2 ring-[#005F56]/20"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <LuFootprints className="w-3.5 h-3.5 text-[#005F56]" /> Walking
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.walkingMinutes} min
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            {distanceKm} km to Gate
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTravelMode("CYCLING")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTravelMode === "CYCLING"
              ? "border-[#005F56] bg-emerald-50/70 ring-2 ring-[#005F56]/20"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <LuBike className="w-3.5 h-3.5 text-[#005F56]" /> Cycling / Scooter
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.cyclingMinutes} min
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Bicycle route
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTravelMode("TRANSIT")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTravelMode === "TRANSIT"
              ? "border-[#005F56] bg-emerald-50/70 ring-2 ring-[#005F56]/20"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <LuBus className="w-3.5 h-3.5 text-[#005F56]" /> Campus Shuttle
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.transitMinutes} min
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Shuttle / Bus route
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTravelMode("DRIVING")}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            selectedTravelMode === "DRIVING"
              ? "border-[#005F56] bg-emerald-50/70 ring-2 ring-[#005F56]/20"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <LuCar className="w-3.5 h-3.5 text-[#005F56]" /> Driving / Uber
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.drivingMinutes} min
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Direct road
          </span>
        </button>
      </div>

      {/* Embedded Map Canvas */}
      <div className="space-y-2">
        <GoogleMapWrapper
          center={coords}
          zoom={15}
          markers={markers}
          selectedMarkerId="residence-main"
          routeLine={{
            origin: coords,
            destination: { lat: nearestCampus.lat, lng: nearestCampus.lng },
            travelMode: selectedTravelMode === "DRIVING" ? "DRIVING" : "WALKING",
          }}
          radiusCircle={{
            center: { lat: nearestCampus.lat, lng: nearestCampus.lng },
            radiusMeters: 1500,
            color: "#005F56",
          }}
          height="380px"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-[#005F56]" />
              <span>{property.title}</span>
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              <span>{nearestCampus.campusName}</span>
            </div>
          </div>

          <label className="flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showPois}
              onChange={(e) => setShowPois(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-[#005F56] focus:ring-[#005F56]"
            />
            <span>Show Nearby Amenities (Shops, Transit, Gym)</span>
          </label>
        </div>
      </div>

      {/* Surrounding Points of Interest Badges */}
      {showPois && (
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Nearby Student Conveniences &amp; Transit Points
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {pois.map((poi) => (
              <div
                key={poi.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2"
              >
                {poi.category === "groceries" && <LuShoppingBag className="w-4 h-4 text-[#005F56] shrink-0 mt-0.5" />}
                {poi.category === "transit" && <LuBus className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                {poi.category === "study" && <LuBookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                {poi.category === "gym" && <LuDumbbell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                <div>
                  <span className="font-bold text-slate-900 block text-[11px] leading-tight">{poi.title}</span>
                  <span className="text-[10px] text-slate-500 font-semibold">{poi.distance} away</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

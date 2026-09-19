"use client";

import React, { useState, useEffect, useRef } from "react";
import GoogleMapWrapper, { MapMarkerItem } from "./google-map-wrapper";
import {
  SA_CAMPUSES,
  CampusLocation,
  calculateDistanceKm,
  findNearestCampus,
  estimateCommute,
  findCampusByName,
} from "@/lib/maps/campuses";
import { getCoordinatesForAddress } from "@/lib/maps/geocoding";
import {
  LuMapPin,
  LuSearch,
  LuSparkles,
  LuCompass,
  LuNavigation,
  LuCheck,
  LuFootprints,
  LuCar,
  LuClock,
} from "react-icons/lu";

export interface PropertyLocationValue {
  streetAddress: string;
  suburb: string;
  city: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  distanceToCampus?: number;
  selectedUniversity?: string;
  selectedCampus?: string;
}

interface PropertyLocationPickerProps {
  value?: Partial<PropertyLocationValue>;
  onChange: (val: PropertyLocationValue) => void;
  className?: string;
}

export default function PropertyLocationPicker({
  value,
  onChange,
  className = "",
}: PropertyLocationPickerProps) {
  // Initial coordinates or default to Auckland Park, Johannesburg
  const initialCoords = value?.latitude && value?.longitude
    ? { lat: value.latitude, lng: value.longitude }
    : getCoordinatesForAddress(value?.streetAddress, value?.suburb, value?.city);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialCoords);
  const [searchInput, setSearchInput] = useState(
    value?.streetAddress ? `${value.streetAddress}, ${value.suburb || ""}` : ""
  );
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
    const matched = findCampusByName(value?.selectedUniversity, value?.selectedCampus);
    return matched ? matched.id : "uj-apk";
  });

  const autocompleteInputRef = useRef<HTMLInputElement>(null);

  // Selected campus object
  const selectedCampus =
    SA_CAMPUSES.find((c) => c.id === selectedCampusId) || SA_CAMPUSES[0];

  // Calculated distance & commute to selected campus
  const distanceKm = calculateDistanceKm(
    coords.lat,
    coords.lng,
    selectedCampus.lat,
    selectedCampus.lng
  );
  const commute = estimateCommute(distanceKm);

  // Initialize Google Places Autocomplete if available
  useEffect(() => {
    if (typeof window === "undefined" || !autocompleteInputRef.current) return;

    if (window.google?.maps?.places) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteInputRef.current,
        {
          types: ["geocode", "establishment"],
          componentRestrictions: { country: "za" },
          fields: ["address_components", "geometry", "formatted_address", "name"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setCoords({ lat, lng });

        // Parse address components
        let streetNumber = "";
        let route = "";
        let sublocality = "";
        let locality = "";
        let postalCode = "";

        (place.address_components || []).forEach((c: any) => {
          const types = c.types;
          if (types.includes("street_number")) streetNumber = c.long_name;
          if (types.includes("route")) route = c.long_name;
          if (types.includes("sublocality") || types.includes("sublocality_level_1")) {
            sublocality = c.long_name;
          }
          if (types.includes("locality")) locality = c.long_name;
          if (types.includes("postal_code")) postalCode = c.long_name;
        });

        const streetAddress = `${streetNumber} ${route}`.trim() || place.name || "";
        const suburb = sublocality || value?.suburb || "Auckland Park";
        const city = locality || value?.city || "Johannesburg";

        // Auto-select nearest campus
        const nearest = findNearestCampus(lat, lng);
        const activeCampus = nearest ? nearest.campus : selectedCampus;
        if (nearest) setSelectedCampusId(nearest.campus.id);

        const newDist = nearest ? nearest.distanceKm : calculateDistanceKm(lat, lng, activeCampus.lat, activeCampus.lng);

        onChange({
          streetAddress: streetAddress || searchInput,
          suburb,
          city,
          postalCode,
          latitude: lat,
          longitude: lng,
          distanceToCampus: newDist,
          selectedUniversity: activeCampus.universityName,
          selectedCampus: activeCampus.campusName,
        });
      });
    }
  }, [selectedCampus]);

  // Handle map click or pin drag
  const handlePositionChange = (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
    const nearest = findNearestCampus(newCoords.lat, newCoords.lng);
    const activeCampus = nearest ? nearest.campus : selectedCampus;
    const newDist = calculateDistanceKm(
      newCoords.lat,
      newCoords.lng,
      activeCampus.lat,
      activeCampus.lng
    );

    onChange({
      streetAddress: value?.streetAddress || searchInput,
      suburb: value?.suburb || "Auckland Park",
      city: value?.city || "Johannesburg",
      postalCode: value?.postalCode,
      latitude: newCoords.lat,
      longitude: newCoords.lng,
      distanceToCampus: newDist,
      selectedUniversity: activeCampus.universityName,
      selectedCampus: activeCampus.campusName,
    });
  };

  // Handle manual campus change
  const handleCampusChange = (campusId: string) => {
    setSelectedCampusId(campusId);
    const camp = SA_CAMPUSES.find((c) => c.id === campusId);
    if (camp) {
      const newDist = calculateDistanceKm(coords.lat, coords.lng, camp.lat, camp.lng);
      onChange({
        streetAddress: value?.streetAddress || "",
        suburb: value?.suburb || "",
        city: value?.city || "",
        postalCode: value?.postalCode,
        latitude: coords.lat,
        longitude: coords.lng,
        distanceToCampus: newDist,
        selectedUniversity: camp.universityName,
        selectedCampus: camp.campusName,
      });
    }
  };

  // Markers: Property pin (draggable) + Target Campus Gate pin
  const markers: MapMarkerItem[] = [
    {
      id: "residence-pin",
      lat: coords.lat,
      lng: coords.lng,
      title: value?.streetAddress || "Your Student Residence",
      draggable: true,
      iconType: "residence",
    },
    {
      id: `campus-${selectedCampus.id}`,
      lat: selectedCampus.lat,
      lng: selectedCampus.lng,
      title: `${selectedCampus.shortCode} Gate`,
      isCampus: true,
      iconType: "campus",
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Search & Campus Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Google Maps Address Search
          </label>
          <div className="relative">
            <input
              ref={autocompleteInputRef}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search address (e.g. 45 Juta St, Braamfontein)..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
            />
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Measure Distance to Target Campus
          </label>
          <div className="relative">
            <select
              value={selectedCampusId}
              onChange={(e) => handleCampusChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
            >
              {SA_CAMPUSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.universityName} — {c.campusName}
                </option>
              ))}
            </select>
            <LuCompass className="w-4 h-4 text-[#005F56] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-2">
        <GoogleMapWrapper
          center={coords}
          zoom={15}
          markers={markers}
          selectedMarkerId="residence-pin"
          onMarkerDragEnd={(_, newCoords) => handlePositionChange(newCoords)}
          onMapClick={(newCoords) => handlePositionChange(newCoords)}
          routeLine={{
            origin: coords,
            destination: { lat: selectedCampus.lat, lng: selectedCampus.lng },
            travelMode: "WALKING",
          }}
          radiusCircle={{
            center: { lat: selectedCampus.lat, lng: selectedCampus.lng },
            radiusMeters: 1500, // 1.5km walking radius
          }}
          height="340px"
        />

        <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <LuNavigation className="w-3.5 h-3.5 text-[#005F56] shrink-0" />
          <span>Click anywhere on the map or drag the green pin to pinpoint the exact property entrance.</span>
        </p>
      </div>

      {/* Live Distance & Commute Metrics Ribbon */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Distance to Campus
          </span>
          <span className="text-base font-black text-[#005F56] block mt-0.5">
            {distanceKm} km
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            to {selectedCampus.shortCode} Main Gate
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <LuFootprints className="w-3.5 h-3.5 text-[#005F56]" /> Walking Time
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.walkingMinutes} min
          </span>
          <span className="text-[10px] text-slate-400">
            {commute.isWalkable ? "✓ Walkable zone" : "Shuttle recommended"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
            <LuCar className="w-3.5 h-3.5 text-[#005F56]" /> Drive / Shuttle
          </span>
          <span className="text-base font-black text-slate-900 block mt-0.5">
            ~{commute.transitMinutes} min
          </span>
          <span className="text-[10px] text-slate-400">Student transit</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Coordinates (GPS)
          </span>
          <span className="text-xs font-mono font-bold text-slate-800 block mt-1 truncate">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            ✓ Verified Location
          </span>
        </div>
      </div>
    </div>
  );
}

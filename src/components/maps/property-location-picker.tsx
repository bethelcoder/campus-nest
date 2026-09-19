"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import GoogleMapWrapper, { MapMarkerItem } from "./google-map-wrapper";
import {
  SA_CAMPUSES,
  CampusLocation,
  calculateDistanceKm,
  findNearestCampus,
  estimateCommute,
  findCampusByName,
} from "@/lib/maps/campuses";
import {
  getCoordinatesForAddress,
  geocodeAddressLive,
  reverseGeocodeCoords,
  SA_STUDENT_SUBURBS,
} from "@/lib/maps/geocoding";
import { loadGoogleMapsApi, hasGoogleMapsKey } from "@/lib/maps/google-maps-loader";
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
  LuLoader,
  LuCrosshair,
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

const POPULAR_HUBS = [
  { label: "Braamfontein, JHB", query: "Braamfontein, Johannesburg" },
  { label: "Auckland Park, JHB", query: "Auckland Park, Johannesburg" },
  { label: "Hatfield, PTA", query: "Hatfield, Pretoria" },
  { label: "Rondebosch, CPT", query: "Rondebosch, Cape Town" },
  { label: "Observatory, CPT", query: "Observatory, Cape Town" },
  { label: "Stellenbosch Central", query: "Stellenbosch Central, Stellenbosch" },
  { label: "Glenwood, DBN", query: "Glenwood, Durban" },
  { label: "Summerstrand, GQB", query: "Summerstrand, Gqeberha" },
];

export default function PropertyLocationPicker({
  value,
  onChange,
  className = "",
}: PropertyLocationPickerProps) {
  // Initial coordinates
  const initialCoords =
    value?.latitude && value?.longitude
      ? { lat: value.latitude, lng: value.longitude }
      : getCoordinatesForAddress(value?.streetAddress, value?.suburb, value?.city);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialCoords);
  const [searchInput, setSearchInput] = useState(
    value?.streetAddress
      ? `${value.streetAddress}${value.suburb ? `, ${value.suburb}` : ""}`
      : ""
  );
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedSuccess, setGeocodedSuccess] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState<string>(() => {
    const matched = findCampusByName(value?.selectedUniversity, value?.selectedCampus);
    return matched ? matched.id : "uj-apk";
  });

  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Perform geocoding when user types or submits
  const handlePerformGeocode = useCallback(
    async (queryText: string) => {
      const query = queryText.trim();
      if (!query || query.length < 3) return;

      setIsGeocoding(true);
      try {
        const result = await geocodeAddressLive(query);
        if (result) {
          const newCoords = { lat: result.latitude, lng: result.longitude };
          setCoords(newCoords);

          // Find nearest campus or keep active
          const nearest = findNearestCampus(result.latitude, result.longitude);
          const activeCampus = nearest ? nearest.campus : selectedCampus;
          if (nearest) {
            setSelectedCampusId(nearest.campus.id);
          }

          const newDist = nearest
            ? nearest.distanceKm
            : calculateDistanceKm(
                result.latitude,
                result.longitude,
                activeCampus.lat,
                activeCampus.lng
              );

          onChange({
            streetAddress: result.streetAddress || query,
            suburb: result.suburb || value?.suburb || "Braamfontein",
            city: result.city || value?.city || "Johannesburg",
            postalCode: result.postalCode || value?.postalCode || "",
            latitude: result.latitude,
            longitude: result.longitude,
            distanceToCampus: newDist,
            selectedUniversity: activeCampus.universityName,
            selectedCampus: activeCampus.campusName,
          });

          setGeocodedSuccess(true);
          setTimeout(() => setGeocodedSuccess(false), 2500);
        }
      } catch (err) {
        console.warn("Geocoding failed:", err);
      } finally {
        setIsGeocoding(false);
      }
    },
    [selectedCampus, onChange, value?.suburb, value?.city, value?.postalCode]
  );

  // Initialize Google Places Autocomplete if API is available
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsApi().then((loaded) => {
      if (!isMounted || !loaded || !autocompleteInputRef.current) return;
      if (!window.google?.maps?.places) return;

      try {
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
          const suburb = sublocality || "Braamfontein";
          const city = locality || "Johannesburg";

          setSearchInput(place.formatted_address || `${streetAddress}, ${suburb}`);

          const nearest = findNearestCampus(lat, lng);
          const activeCampus = nearest ? nearest.campus : selectedCampus;
          if (nearest) setSelectedCampusId(nearest.campus.id);

          const newDist = nearest
            ? nearest.distanceKm
            : calculateDistanceKm(lat, lng, activeCampus.lat, activeCampus.lng);

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

          setGeocodedSuccess(true);
          setTimeout(() => setGeocodedSuccess(false), 2500);
        });
      } catch (err) {
        console.warn("Failed to attach Google Places Autocomplete:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCampus, onChange, searchInput]);

  // Handle typing in search bar with auto-debounce geocoding
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);

    // Debounce geocoding for typing (only if string is meaningful)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (val.trim().length >= 6) {
      debounceTimerRef.current = setTimeout(() => {
        handlePerformGeocode(val);
      }, 700);
    }
  };

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      handlePerformGeocode(searchInput);
    }
  };

  // Handle map click or pin drag with reverse geocoding
  const handlePositionChange = async (newCoords: { lat: number; lng: number }) => {
    setCoords(newCoords);
    const nearest = findNearestCampus(newCoords.lat, newCoords.lng);
    const activeCampus = nearest ? nearest.campus : selectedCampus;
    const newDist = calculateDistanceKm(
      newCoords.lat,
      newCoords.lng,
      activeCampus.lat,
      activeCampus.lng
    );

    // Reverse geocode to find street address
    try {
      const rev = await reverseGeocodeCoords(newCoords.lat, newCoords.lng);
      if (rev) {
        const fullAddr = rev.formattedAddress || `${rev.streetAddress}, ${rev.suburb || "Johannesburg"}`;
        if (rev.streetAddress) {
          setSearchInput(fullAddr);
        }
        onChange({
          streetAddress: rev.streetAddress || value?.streetAddress || searchInput,
          suburb: rev.suburb || value?.suburb || "Auckland Park",
          city: rev.city || value?.city || "Johannesburg",
          postalCode: rev.postalCode || value?.postalCode,
          latitude: newCoords.lat,
          longitude: newCoords.lng,
          distanceToCampus: newDist,
          selectedUniversity: activeCampus.universityName,
          selectedCampus: activeCampus.campusName,
        });
        return;
      }
    } catch {
      // Ignore and fallback
    }

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
        streetAddress: value?.streetAddress || searchInput,
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
      title: value?.streetAddress || searchInput || "Your Student Residence",
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-800">
              Google Maps Address Search
            </label>
            {isGeocoding ? (
              <span className="text-[10px] font-bold text-[#005F56] flex items-center gap-1 animate-pulse">
                <LuLoader className="w-3 h-3 animate-spin" /> Pinpointing location...
              </span>
            ) : geocodedSuccess ? (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <LuCheck className="w-3 h-3" /> Pinpoint Updated
              </span>
            ) : null}
          </div>
          <div className="relative flex items-center">
            <input
              ref={autocompleteInputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type street address (e.g. 42 Jorissen St, Braamfontein)..."
              className="w-full pl-9 pr-24 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56] text-xs text-slate-900 bg-white"
            />
            <LuSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />

            <button
              type="button"
              onClick={() => handlePerformGeocode(searchInput)}
              disabled={isGeocoding || !searchInput.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-md bg-[#005F56] hover:bg-[#004d46] text-white text-[10px] font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1"
            >
              {isGeocoding ? (
                <LuLoader className="w-3 h-3 animate-spin" />
              ) : (
                <LuCrosshair className="w-3 h-3" />
              )}
              <span>Pinpoint</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-1">
            Measure Distance to Target Campus Gate
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

      {/* Quick Select Student Hubs Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] text-slate-600">
        <span className="font-bold text-slate-400 shrink-0 uppercase tracking-wider text-[9px]">
          Quick Hubs:
        </span>
        {POPULAR_HUBS.map((hub) => (
          <button
            key={hub.label}
            type="button"
            onClick={() => {
              setSearchInput(hub.query);
              handlePerformGeocode(hub.query);
            }}
            className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-[#005F56]/10 hover:text-[#005F56] text-slate-700 font-medium whitespace-nowrap border border-slate-200 cursor-pointer transition-colors"
          >
            {hub.label}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="space-y-2">
        <GoogleMapWrapper
          center={coords}
          zoom={16}
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
          height="350px"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <p className="flex items-center gap-1.5">
            <LuNavigation className="w-3.5 h-3.5 text-[#005F56] shrink-0" />
            <span>Click anywhere on the map or drag the green pin to pinpoint the exact residence gate.</span>
          </p>
          <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        </div>
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
            to {selectedCampus.shortCode} Gate
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
            Status
          </span>
          <span className="text-xs font-bold text-emerald-600 block mt-1 flex items-center gap-1">
            <LuCheck className="w-3.5 h-3.5" /> Coordinates Synced
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {selectedCampus.universityName}
          </span>
        </div>
      </div>
    </div>
  );
}

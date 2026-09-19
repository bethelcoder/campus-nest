"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadGoogleMapsApi, hasGoogleMapsKey } from "@/lib/maps/google-maps-loader";
import { LuMapPin, LuLayers, LuPlus, LuMinus, LuCompass, LuSparkles, LuInfo } from "react-icons/lu";

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  price?: number;
  subtitle?: string;
  isNsfas?: boolean;
  safetyScore?: number | null;
  isCampus?: boolean;
  draggable?: boolean;
  iconType?: "residence" | "campus" | "poi";
  poiCategory?: string;
  data?: any;
}

export interface GoogleMapWrapperProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerItem[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (marker: MapMarkerItem) => void;
  onMarkerDragEnd?: (markerId: string, newCoords: { lat: number; lng: number }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  radiusCircle?: {
    center: { lat: number; lng: number };
    radiusMeters: number;
    color?: string;
  } | null;
  routeLine?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    travelMode?: "WALKING" | "TRANSIT" | "DRIVING";
  } | null;
  className?: string;
  height?: string | number;
  showControls?: boolean;
  interactiveFallback?: boolean;
}

// Clean custom map styling for Google Maps
const GOOGLE_MAP_STYLES = [
  { featureType: "administrative.land_parcel", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#d9ede8" }] },
  { featureType: "poi.school", elementType: "geometry.fill", stylers: [{ color: "#e8f0fe" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fefefe" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f8c967" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#e9bc62" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e2f5" }] },
];

export default function GoogleMapWrapper({
  center,
  zoom = 15,
  markers = [],
  selectedMarkerId,
  onMarkerClick,
  onMarkerDragEnd,
  onMapClick,
  radiusCircle,
  routeLine,
  className = "",
  height = "420px",
  showControls = true,
}: GoogleMapWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const gMarkersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Fallback interactive map state
  const [fbZoom, setFbZoom] = useState(zoom);
  const [fbCenter, setFbCenter] = useState(center);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);

  // Sync center when props change
  useEffect(() => {
    setFbCenter(center);
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.panTo(center);
    }
  }, [center.lat, center.lng]);

  // Load Google Maps API script
  useEffect(() => {
    let isMounted = true;
    loadGoogleMapsApi().then((loaded) => {
      if (isMounted) {
        setIsGoogleLoaded(loaded);
        setLoadAttempted(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize real Google Map
  useEffect(() => {
    if (!isGoogleLoaded || !containerRef.current || !window.google?.maps) return;

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(containerRef.current, {
        center,
        zoom,
        styles: GOOGLE_MAP_STYLES,
        disableDefaultUI: false,
        zoomControl: showControls,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: true,
      });

      map.addListener("click", (e: any) => {
        if (onMapClick && e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        }
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [isGoogleLoaded, showControls]);

  // Update Google Maps Markers & Overlays
  useEffect(() => {
    if (!isGoogleLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    // Clear previous markers
    gMarkersRef.current.forEach((m) => m.setMap(null));
    gMarkersRef.current = [];

    // Clear previous circle
    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    // Clear previous polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    const map = mapInstanceRef.current;

    // Render Markers
    markers.forEach((item) => {
      const isSelected = selectedMarkerId === item.id;
      let iconConfig: any;

      if (item.isCampus) {
        iconConfig = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4338CA",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        };
      } else if (item.iconType === "poi") {
        iconConfig = {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#0284C7",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 1.5,
        };
      } else {
        // Residence marker
        iconConfig = {
          path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
          fillColor: isSelected ? "#0F766E" : item.isNsfas ? "#005F56" : "#2563EB",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: isSelected ? 1.6 : 1.3,
          anchor: new window.google.maps.Point(12, 22),
        };
      }

      const marker = new window.google.maps.Marker({
        position: { lat: item.lat, lng: item.lng },
        map,
        title: item.title,
        draggable: Boolean(item.draggable),
        icon: iconConfig,
        zIndex: isSelected ? 999 : item.isCampus ? 500 : 100,
      });

      marker.addListener("click", () => {
        if (onMarkerClick) onMarkerClick(item);
      });

      if (item.draggable && onMarkerDragEnd) {
        marker.addListener("dragend", (e: any) => {
          onMarkerDragEnd(item.id, { lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      }

      gMarkersRef.current.push(marker);
    });

    // Render Radius Circle
    if (radiusCircle && radiusCircle.radiusMeters > 0) {
      circleRef.current = new window.google.maps.Circle({
        strokeColor: radiusCircle.color || "#005F56",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: radiusCircle.color || "#005F56",
        fillOpacity: 0.12,
        map,
        center: radiusCircle.center,
        radius: radiusCircle.radiusMeters,
      });
    }

    // Render Route Polyline
    if (routeLine && routeLine.origin && routeLine.destination) {
      polylineRef.current = new window.google.maps.Polyline({
        path: [routeLine.origin, routeLine.destination],
        geodesic: true,
        strokeColor: "#005F56",
        strokeOpacity: 0.85,
        strokeWeight: 4,
        icons: [
          {
            icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 },
            offset: "0",
            repeat: "14px",
          },
        ],
        map,
      });
    }
  }, [isGoogleLoaded, markers, selectedMarkerId, radiusCircle, routeLine]);

  // Fallback interactive map drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      lat: fbCenter.lat,
      lng: fbCenter.lng,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !dragStart) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const scaleFactor = 0.0003 / Math.pow(2, fbZoom - 14);
      setFbCenter({
        lat: dragStart.lat + dy * scaleFactor,
        lng: dragStart.lng - dx * scaleFactor,
      });
    },
    [isDragging, dragStart, fbZoom]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Convert lat/lng to percentage offset for fallback map rendering
  const getCoordinatesPercent = (lat: number, lng: number) => {
    const latSpan = 0.04 / Math.pow(2, fbZoom - 14);
    const lngSpan = 0.05 / Math.pow(2, fbZoom - 14);

    const x = ((lng - fbCenter.lng) / lngSpan) * 100 + 50;
    const y = ((fbCenter.lat - lat) / latSpan) * 100 + 50;

    return { x, y };
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-[#E2E8F0] select-none ${className}`}
      style={{ height }}
    >
      {/* Container for Real Google Maps */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-300 ${
          isGoogleLoaded ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        }`}
      />

      {/* High-Fidelity Interactive Map Fallback (When API key is not yet set or in offline dev) */}
      {!isGoogleLoaded && (
        <div
          className="relative w-full h-full bg-[#E5ECE9] overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={(e) => {
            if (isDragging) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const latSpan = 0.04 / Math.pow(2, fbZoom - 14);
            const lngSpan = 0.05 / Math.pow(2, fbZoom - 14);
            const clickLng = fbCenter.lng + ((clickX / rect.width) * 100 - 50) * (lngSpan / 100);
            const clickLat = fbCenter.lat - ((clickY / rect.height) * 100 - 50) * (latSpan / 100);
            if (onMapClick) onMapClick({ lat: clickLat, lng: clickLng });
          }}
        >
          {/* Subtle Map Grid Background */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #cbd5e1 1px, transparent 1px),
                linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Road / Urban blocks graphic overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="30%" x2="100%" y2="40%" stroke="#ffffff" strokeWidth="8" />
            <line x1="20%" y1="0" x2="45%" y2="100%" stroke="#ffffff" strokeWidth="6" />
            <line x1="0" y1="70%" x2="100%" y2="60%" stroke="#ffffff" strokeWidth="7" />
            <line x1="75%" y1="0" x2="60%" y2="100%" stroke="#ffffff" strokeWidth="5" />
            <circle cx="50%" cy="50%" r="60" fill="#d1fae5" opacity="0.6" />
          </svg>

          {/* Fallback Radius Circle */}
          {radiusCircle && (
            <div
              className="absolute rounded-full border-2 border-[#005F56] bg-[#005F56]/15 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{
                left: `${getCoordinatesPercent(radiusCircle.center.lat, radiusCircle.center.lng).x}%`,
                top: `${getCoordinatesPercent(radiusCircle.center.lat, radiusCircle.center.lng).y}%`,
                width: `${Math.min(500, (radiusCircle.radiusMeters / 15) * Math.pow(2, fbZoom - 14))}px`,
                height: `${Math.min(500, (radiusCircle.radiusMeters / 15) * Math.pow(2, fbZoom - 14))}px`,
              }}
            />
          )}

          {/* Fallback Route Line */}
          {routeLine && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {(() => {
                const p1 = getCoordinatesPercent(routeLine.origin.lat, routeLine.origin.lng);
                const p2 = getCoordinatesPercent(routeLine.destination.lat, routeLine.destination.lng);
                return (
                  <line
                    x1={`${p1.x}%`}
                    y1={`${p1.y}%`}
                    x2={`${p2.x}%`}
                    y2={`${p2.y}%`}
                    stroke="#005F56"
                    strokeWidth="4"
                    strokeDasharray="6,6"
                    className="animate-pulse"
                  />
                );
              })()}
            </svg>
          )}

          {/* Fallback Markers */}
          {markers.map((item) => {
            const { x, y } = getCoordinatesPercent(item.lat, item.lng);
            const isSelected = selectedMarkerId === item.id;
            const isVisible = x >= -10 && x <= 110 && y >= -10 && y <= 110;

            if (!isVisible) return null;

            if (item.isCampus) {
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMarkerClick) onMarkerClick(item);
                  }}
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-700 text-white text-[10px] font-bold shadow-lg border-2 border-white">
                    <LuCompass className="w-3.5 h-3.5 text-indigo-200" />
                    <span>{item.title}</span>
                  </div>
                </div>
              );
            }

            if (item.iconType === "poi") {
              return (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMarkerClick) onMarkerClick(item);
                  }}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="px-2 py-0.5 rounded-full bg-sky-600 text-white text-[9px] font-semibold shadow border border-white">
                    {item.title}
                  </div>
                </div>
              );
            }

            // Residence Pin
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onMarkerClick) onMarkerClick(item);
                }}
                className={`absolute z-30 -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
                  isSelected ? "scale-110 z-40" : "hover:scale-105"
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black shadow-lg border-2 transition-colors ${
                    isSelected
                      ? "bg-[#0F766E] text-white border-white ring-4 ring-[#005F56]/30"
                      : item.isNsfas
                      ? "bg-[#005F56] text-white border-white"
                      : "bg-white text-slate-900 border-slate-300"
                  }`}
                >
                  <LuMapPin className={`w-3.5 h-3.5 ${isSelected || item.isNsfas ? "text-emerald-200" : "text-[#005F56]"}`} />
                  <span>{item.price ? `R${item.price.toLocaleString()}` : item.title}</span>
                  {item.safetyScore && (
                    <span className="text-[10px] font-bold bg-white/20 px-1 rounded ml-0.5">
                      ★{Number(item.safetyScore).toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="w-2 h-2 bg-slate-900/40 rounded-full mx-auto mt-0.5 blur-xs" />
              </div>
            );
          })}
        </div>
      )}

      {/* Top Banner / Google Maps Status indicator */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-auto">
        <div className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          {isGoogleLoaded ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Maps Active</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Campus Map View</span>
            </>
          )}
        </div>
      </div>

      {/* Zoom / Navigation Controls for Fallback */}
      {!isGoogleLoaded && showControls && (
        <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFbZoom((z) => Math.min(18, z + 1));
            }}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-md flex items-center justify-center font-bold text-base cursor-pointer"
            title="Zoom In"
          >
            <LuPlus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFbZoom((z) => Math.max(10, z - 1));
            }}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-md flex items-center justify-center font-bold text-base cursor-pointer"
            title="Zoom Out"
          >
            <LuMinus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFbCenter(center);
              setFbZoom(zoom);
            }}
            className="w-8 h-8 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-md flex items-center justify-center font-bold text-base cursor-pointer"
            title="Reset Center"
          >
            <LuCompass className="w-4 h-4 text-[#005F56]" />
          </button>
        </div>
      )}
    </div>
  );
}

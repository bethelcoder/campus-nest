"use client";

import { useEffect, useRef, useState } from "react";
import { LuMapPin, LuNavigation } from "react-icons/lu";
import { loadGoogleMapsApi } from "@/lib/maps/google-maps-loader";
import GoogleMapWrapper from "./google-map-wrapper";

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface GoogleMapProps {
  location?: MapLocation | null;
  address?: string;
  interactive?: boolean;
  onLocationChange?: (location: MapLocation) => void;
  className?: string;
}

type GoogleMapsWindow = Window & {
  google?: {
    maps?: {
      Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
      Marker: new (options: Record<string, unknown>) => GoogleMarkerInstance;
      Geocoder: new () => GoogleGeocoder;
      LatLng: new (latitude: number, longitude: number) => { lat: () => number; lng: () => number };
      event: { addListener: (target: unknown, event: string, callback: () => void) => unknown };
    };
  };
};

type GoogleMapInstance = {
  setCenter: (center: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMarkerInstance = {
  setMap: (map: GoogleMapInstance | null) => void;
  setPosition: (position: { lat: number; lng: number }) => void;
  getPosition: () => { lat: () => number; lng: () => number } | null;
};

type GoogleGeocoder = {
  geocode: (request: { address: string }, callback: (results: Array<{ geometry: { location: { lat: () => number; lng: () => number } } }> | null, status: string) => void) => void;
};

function formatAddress(address?: string) {
  return address?.trim() || "the selected residence";
}

export default function GoogleMap({
  location,
  address,
  interactive = false,
  onLocationChange,
  className = "h-72",
}: GoogleMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markerRef = useRef<GoogleMarkerInstance | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsApi()
      .then((loaded) => {
        if (!loaded) throw new Error("Google Maps API key is not configured");
        if (cancelled || !mapElementRef.current) return;
        const maps = (window as GoogleMapsWindow).google?.maps;
        if (!maps || typeof maps.Map !== "function") throw new Error("Google Maps is unavailable");

        const initial = location || { latitude: -26.2041, longitude: 28.0473 };
        const center = { lat: initial.latitude, lng: initial.longitude };
        const map = new maps.Map(mapElementRef.current, {
          center,
          zoom: location ? 16 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        mapRef.current = map;

        const marker = new maps.Marker({
          map,
          position: center,
          draggable: interactive,
          title: interactive ? "Drag to set the residence location" : formatAddress(address),
        });
        markerRef.current = marker;

        if (interactive) {
          maps.event.addListener(marker, "dragend", () => {
            const position = marker.getPosition();
            if (!position) return;
            onLocationChangeRef.current?.({ latitude: position.lat(), longitude: position.lng() });
          });
        }

        if (!location && address) {
          new maps.Geocoder().geocode(
            { address },
            (results: Array<{ geometry: { location: { lat: () => number; lng: () => number } } }> | null, status: string) => {
            if (status !== "OK" || !results?.[0] || cancelled) return;
            const position = results[0].geometry.location;
            const next = { latitude: position.lat(), longitude: position.lng() };
            map.setCenter({ lat: next.latitude, lng: next.longitude });
            map.setZoom(16);
            marker.setPosition({ lat: next.latitude, lng: next.longitude });
            onLocationChangeRef.current?.({ ...next, address });
            }
          );
        }
      })
      .catch((loadError: Error) => {
        if (!cancelled) setError(loadError.message);
      });

    return () => {
      cancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [address, interactive, location]);

  if (error) {
    const lat = location?.latitude ?? -26.1925;
    const lng = location?.longitude ?? 28.0347;
    return (
      <div className={className}>
        <GoogleMapWrapper
          center={{ lat, lng }}
          zoom={15}
          markers={[
            {
              id: "res-detail-pin",
              lat,
              lng,
              title: formatAddress(address),
              iconType: "residence",
            },
          ]}
          height="100%"
        />
      </div>
    );
  }

  return <div ref={mapElementRef} className={`${className} overflow-hidden rounded-xl bg-slate-100`} aria-label={interactive ? "Set residence location on map" : "Residence location map"} />;
}

export function GoogleMapsDirectionsLink({ location, label = "Open in Google Maps" }: { location?: MapLocation | null; label?: string }) {
  if (!location) return null;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-bold text-[#005F56] hover:underline">
      <LuNavigation className="h-4 w-4" />
      {label}
    </a>
  );
}

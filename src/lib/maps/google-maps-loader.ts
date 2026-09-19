"use client";

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<void>;
  }
}

/**
 * Singleton loader for Google Maps JavaScript API with Places and Geometry libraries.
 */
export function loadGoogleMapsApi(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  // Already fully loaded
  if (window.google && window.google.maps) {
    return Promise.resolve(true);
  }

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    (window as any).__NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "AIzaSyYourGoogleMapsApiKeyHere" || apiKey.trim() === "") {
    return Promise.resolve(false);
  }

  // Return existing loading promise if already in-flight
  if (window.__googleMapsLoadingPromise) {
    return window.__googleMapsLoadingPromise.then(() => true).catch(() => false);
  }

  window.__googleMapsLoadingPromise = new Promise<void>((resolve, reject) => {
    // Check if script tag is already in document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", (e) => reject(e));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      console.warn("Google Maps script failed to load:", error);
      reject(error);
    };

    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise.then(() => true).catch(() => false);
}

export function hasGoogleMapsKey(): boolean {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return Boolean(key && key !== "AIzaSyYourGoogleMapsApiKeyHere" && key.trim().length > 5);
}

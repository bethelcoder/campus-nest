"use client";

declare global {
  interface Window {
    google?: any;
    __googleMapsLoadingPromise?: Promise<boolean>;
    __initGoogleMapsSdk?: () => void;
  }
}

/**
 * Singleton loader for Google Maps JavaScript API with Places and Geometry libraries.
 */
export function loadGoogleMapsApi(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  // Already fully initialized with Map constructor
  if (window.google?.maps?.Map && typeof window.google.maps.Map === "function") {
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
    return window.__googleMapsLoadingPromise;
  }

  window.__googleMapsLoadingPromise = new Promise<boolean>((resolve) => {
    // If Map constructor is already available
    if (window.google?.maps?.Map && typeof window.google.maps.Map === "function") {
      resolve(true);
      return;
    }

    // Set up global callback invoked when Google Maps finishes initializing
    window.__initGoogleMapsSdk = () => {
      if (window.google?.maps?.importLibrary) {
        Promise.all([
          window.google.maps.importLibrary("maps").catch(() => null),
          window.google.maps.importLibrary("places").catch(() => null),
          window.google.maps.importLibrary("geometry").catch(() => null),
        ]).then(() => {
          resolve(Boolean(window.google?.maps?.Map && typeof window.google.maps.Map === "function"));
        }).catch(() => {
          resolve(Boolean(window.google?.maps?.Map && typeof window.google.maps.Map === "function"));
        });
      } else {
        resolve(Boolean(window.google?.maps?.Map && typeof window.google.maps.Map === "function"));
      }
    };

    // Check if script tag is already in document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.google?.maps?.Map && typeof window.google.maps.Map === "function") {
          clearInterval(interval);
          resolve(true);
        } else if (attempts > 60) {
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&callback=__initGoogleMapsSdk&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onerror = (error) => {
      console.warn("Google Maps script failed to load:", error);
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return window.__googleMapsLoadingPromise;
}

export function hasGoogleMapsKey(): boolean {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return Boolean(key && key !== "AIzaSyYourGoogleMapsApiKeyHere" && key.trim().length > 5);
}


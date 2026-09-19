"use client";

import { useState } from "react";
import { BookmarkIcon } from "@/components/common/Icons";

interface FavoriteButtonProps {
  propertyId: string;
  initialSaved: boolean;
  variant?: "icon" | "button";
  className?: string;
  onToggle?: (saved: boolean) => void;
}

export default function FavoriteButton({
  propertyId,
  initialSaved,
  variant = "icon",
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const previousSaved = saved;
    const newSavedState = !previousSaved;
    
    // Optimistic state update
    setSaved(newSavedState);
    setLoading(true);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSaved(data.saved);
        if (onToggle) onToggle(data.saved);

        setMessage(data.saved ? "Saved to favorites!" : "Removed from favorites");
        setTimeout(() => setMessage(null), 2500);
      } else {
        // Revert on error
        setSaved(previousSaved);
        setMessage("Failed to update favorite");
        setTimeout(() => setMessage(null), 2500);
      }
    } catch {
      setSaved(previousSaved);
      setMessage("Network error");
      setTimeout(() => setMessage(null), 2500);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "button") {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={toggleFavorite}
          disabled={loading}
          aria-label={saved ? "Remove from saved favorites" : "Save residence to favorites"}
          title={saved ? "Remove from saved favorites" : "Save residence to favorites"}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
            saved
              ? "bg-[#059669] text-white shadow-md hover:bg-[#047857]"
              : "border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F8FAFC] hover:border-[#94A3B8]"
          } ${className}`}
        >
          <BookmarkIcon
            size={16}
            className={`transition-transform duration-200 ${saved ? "fill-current scale-110" : ""}`}
          />
          <span>{saved ? "Saved in Favorites" : "Save Residence"}</span>
        </button>

        {message && (
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-[#0F172A] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in zoom-in-95 z-50">
            {message}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        aria-label={saved ? "Remove from saved favorites" : "Save residence"}
        title={saved ? "Remove from saved favorites" : "Save residence to favorites"}
        className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all duration-200 cursor-pointer ${
          saved
            ? "border-white bg-white text-[#059669] shadow-md scale-105"
            : "border-white/40 bg-black/20 text-white hover:bg-black/40 hover:scale-105"
        } ${className}`}
      >
        <BookmarkIcon
          size={17}
          className={`transition-transform duration-200 ${saved ? "fill-current" : ""}`}
        />
      </button>

      {message && (
        <span className="absolute left-1/2 top-full -translate-x-1/2 mt-2 whitespace-nowrap rounded-lg bg-[#0F172A] px-2.5 py-1 text-[11px] font-medium text-white shadow-lg animate-in fade-in zoom-in-95 z-50">
          {message}
        </span>
      )}
    </div>
  );
}
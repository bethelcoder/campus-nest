"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
  LuBed,
  LuUsers,
  LuDollarSign,
  LuBath,
  LuChevronLeft,
  LuCheck,
  LuEye,
  LuUpload,
  LuSparkles,
  LuLock,
  LuZap,
  LuFlame,
  LuSlidersHorizontal,
  LuLayers,
  LuCalendar,
  LuPhone,
  LuMail,
  LuGraduationCap,
  LuAward,
  LuPlus,
  LuShare2,
  LuBookmark,
  LuChevronRight,
  LuWifi,
  LuBookOpen,
  LuTv,
  LuUtensils,
  LuDumbbell,
  LuWaves,
  LuCar,
  LuKey,
  LuWind,
  LuSun,
  LuDroplets,
  LuLaptop,
  LuAccessibility,
  LuClock,
  LuX,
  LuArrowUpRight,
} from "react-icons/lu";
import { extractRoomsFromProperty, AMENITY_METADATA, ROOM_FEATURE_LABELS, type ParsedRoom } from "@/lib/rooms";
import { DynamicApplicationForm } from "@/components/properties/DynamicApplicationForm";
import { getPublicMediaUrl, FALLBACK_RESIDENCE_IMAGES } from "@/lib/media";
import GoogleMap, { GoogleMapsDirectionsLink, type MapLocation } from "@/components/maps/google-map";

interface StudentResidenceDetailViewProps {
  property: any;
  user?: {
    id?: string;
    name?: string;
    surname?: string;
    email?: string;
    role?: string;
  } | null;
  studentProfile?: {
    name: string;
    surname: string;
    email: string;
    phone?: string;
    universityEmail?: string;
    studentNumber?: string;
    universityName?: string;
    degreeProgram?: string;
    fundingType?: string;
    funderName?: string;
    monthlyAllowance?: number;
  } | null;
  autoApply?: boolean;
  initialRoomId?: string | null;
  slug?: string;
  isPreview?: boolean;
}

export default function StudentResidenceDetailView({
  property,
  user,
  studentProfile,
  autoApply = false,
  initialRoomId = null,
  slug,
  isPreview = false,
}: StudentResidenceDetailViewProps) {
  // Image Gallery State - formatted with proxy support for private blobs
  const allImages = useMemo(() => {
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      const valid = property.images
        .filter((img: any) => typeof img === "string" && img.trim().length > 0)
        .map((img: string) => getPublicMediaUrl(img));
      if (valid.length > 0) return valid;
    }
    return FALLBACK_RESIDENCE_IMAGES;
  }, [property.images]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [readMore, setReadMore] = useState(false);

  // Application Modal & Viewing Tour State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(initialRoomId || null);
  const [selectedIntake, setSelectedIntake] = useState("Semester 1 (Immediate)");
  const [tourDate, setTourDate] = useState("2026-09-24");
  const [tourTime, setTourTime] = useState("12:30 PM");
  const [tourScheduled, setTourScheduled] = useState(false);

  // Auto apply trigger when returned from auth
  React.useEffect(() => {
    if (autoApply) {
      if (initialRoomId) {
        setSelectedRoomId(initialRoomId);
      }
      if (user) {
        setShowApplyModal(true);
      } else {
        setShowAuthModal(true);
      }
    }
  }, [autoApply, initialRoomId, user]);

  // Handle application click with auth checking
  const handleApplyClick = (roomId?: string) => {
    if (roomId) {
      setSelectedRoomId(roomId);
    }
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowApplyModal(true);
  };

  // Parsed Room Configurations
  const rooms: ParsedRoom[] = useMemo(() => {
    return extractRoomsFromProperty(property);
  }, [property]);

  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0) || property.bedrooms || 1;
  const startingPrice = property.priceMonthly ? Number(property.priceMonthly) : 4500;
  const isNsfasAccredited =
    (property.amenities && property.amenities.includes("NSFAS_ACCREDITED")) ||
    (property.description && /nsfas accredited/i.test(property.description)) ||
    rooms.some((r) => r.isNsfasCapped);

  const safetyScoreNum =
    property.safetyScore !== null && property.safetyScore !== undefined
      ? Number(property.safetyScore).toFixed(1)
      : null;

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const url = window.location.href.replace("?preview=true", "");
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleScheduleTour = () => {
    setTourScheduled(true);
    setTimeout(() => setTourScheduled(false), 4000);
  };

  const nextPhoto = () => {
    setActivePhotoIdx((prev) => (prev + 1) % allImages.length);
  };

  const prevPhoto = () => {
    setActivePhotoIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Landlord profile info
  const landlordName = property.landlord
    ? `${property.landlord.name || ""} ${property.landlord.surname || ""}`.trim() || "Verified Property Manager"
    : "Verified Residence Landlord";
  const mapLocation: MapLocation | null =
    typeof property.latitude === "number" && typeof property.longitude === "number"
      ? { latitude: property.latitude, longitude: property.longitude }
      : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-poppins">
      
      {/* Landlord Preview Mode Banner */}
      {isPreview && (
        <div className="bg-[#005F56] text-white px-4 py-3 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider">Landlord Preview Mode</span>
              <span className="text-emerald-200 hidden md:inline">— You are previewing how students and bursars see your accommodation.</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/landlord/properties/${property.id}`}
                className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Manage Property
              </Link>
              <Link
                href="/landlord/properties"
                className="px-3 py-1 rounded-lg bg-white text-[#005F56] font-bold hover:bg-emerald-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href={isPreview ? "/landlord/properties" : "/student/properties"}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors mb-2"
            >
              <LuChevronLeft className="w-4 h-4" />
              <span>{isPreview ? "Back to Landlord Dashboard" : "Back to Residences"}</span>
            </Link>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {property.title}
              </h1>
              {isNsfasAccredited && (
                <span className="px-2.5 py-0.5 rounded-md bg-[#005F56]/10 text-[#005F56] border border-[#005F56]/20 text-xs font-bold flex items-center gap-1">
                  <LuCheck className="w-3.5 h-3.5" /> NSFAS Accredited
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 mt-1">
              <LuMapPin className="w-4 h-4 text-[#005F56] shrink-0" />
              <span>
                {property.address}, {property.suburb}, {property.city}
                {property.distanceToCampus && ` • ${Number(property.distanceToCampus).toFixed(1)} km to Campus`}
              </span>
            </p>
          </div>

          {/* Share & Save Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:border-[#005F56] hover:text-[#005F56] transition-all cursor-pointer shadow-2xs"
            >
              <LuShare2 className="w-4 h-4" />
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaved(!saved)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                saved
                  ? "bg-[#005F56] text-white border-[#005F56]"
                  : "bg-white border-slate-300 text-slate-700 hover:border-slate-400"
              }`}
            >
              <LuBookmark className="w-4 h-4" />
              <span>{saved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        {/* Hero Photo Showcase Grid (Matching Reference Screenshot) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 rounded-2xl overflow-hidden bg-slate-900/5 p-1 border border-slate-200">
          
          {/* Main Large Hero Image (Spans 2 columns on desktop) */}
          <div className="lg:col-span-2 relative aspect-4/3 sm:aspect-16/10 rounded-xl overflow-hidden bg-slate-100 group">
            <img
              src={allImages[activePhotoIdx] || FALLBACK_RESIDENCE_IMAGES[0]}
              alt={`${property.title} featured view`}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-[1.01]"
              onClick={() => setLightboxOpen(true)}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_RESIDENCE_IMAGES[activePhotoIdx % FALLBACK_RESIDENCE_IMAGES.length];
              }}
            />

            {/* Previous / Next Controls */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevPhoto();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <LuChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextPhoto();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <LuChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Index Counter */}
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-black/70 text-white text-xs font-semibold backdrop-blur-xs">
              Photo {activePhotoIdx + 1} of {allImages.length}
            </div>
          </div>

          {/* Right 4 Stacked Thumbnail Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
            {allImages.slice(1, 5).map((imgUrl: string, idx: number) => {
              const actualIdx = idx + 1;
              const isLastThumbnail = idx === 3 && allImages.length > 5;
              const extraPhotosCount = allImages.length - 4;

              return (
                <div
                  key={actualIdx}
                  onClick={() => {
                    setActivePhotoIdx(actualIdx);
                    if (isLastThumbnail) setLightboxOpen(true);
                  }}
                  className="relative rounded-xl overflow-hidden aspect-video lg:aspect-auto lg:h-[110px] bg-slate-200 cursor-pointer group border border-slate-200/60"
                >
                  <img
                    src={imgUrl}
                    alt={`${property.title} thumbnail ${actualIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_RESIDENCE_IMAGES[actualIdx % FALLBACK_RESIDENCE_IMAGES.length];
                    }}
                  />

                  {isLastThumbnail && (
                    <div className="absolute inset-0 bg-black/60 hover:bg-black/70 transition-colors flex items-center justify-center text-white font-bold text-sm">
                      +{extraPhotosCount} more photos
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <section className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-[1fr_1.4fr] md:p-6">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#005F56]">Location &amp; directions</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Find {property.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{property.address}, {property.suburb}, {property.city}</p>
            <div className="mt-4">
              <GoogleMapsDirectionsLink location={mapLocation} />
              {!mapLocation && <p className="text-xs text-slate-500">The landlord has not pinned this residence on the map yet.</p>}
            </div>
          </div>
          <GoogleMap location={mapLocation} address={`${property.address}, ${property.suburb}, ${property.city}`} className="h-64" />
        </section>

        {/* Content & Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

          {/* Left 2 Columns: Property Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Price & Quick Specs Ribbon */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Student Accommodation Rate
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-slate-900">
                      R {startingPrice.toLocaleString()}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">/ month per bed</span>
                  </div>
                </div>

                {safetyScoreNum && (
                  <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-[#005F56] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <LuShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {Number(safetyScoreNum) >= 8.5 ? "Verified High Safety" : "Verified Safe Residence"}
                        </span>
                        <span className="text-[10px] font-extrabold text-[#005F56] bg-emerald-100 px-1.5 py-0.5 rounded">
                          {safetyScoreNum} / 10
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                        24/7 Security • Biometrics • 13 Checks Passed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Specs Chips */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700 font-semibold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <LuBed className="w-4 h-4 text-[#005F56]" />
                  <span>{totalBeds} Total Beds ({property.bedrooms || 1} Rooms)</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                  <LuBath className="w-4 h-4 text-[#005F56]" />
                  <span>Private Ensuite &amp; Shared Layouts</span>
                </span>

                {property.distanceToCampus && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                    <LuMapPin className="w-4 h-4 text-[#005F56]" />
                    <span>{Number(property.distanceToCampus).toFixed(1)} km to Campus Gates</span>
                  </span>
                )}
              </div>
            </div>

            {/* Overview / Description */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3">
              <h2 className="text-base font-bold text-slate-900">Residence Overview</h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                {readMore || (property.description || "").length < 280
                  ? property.description || "Fully furnished accredited student accommodation located in close proximity to campus."
                  : `${(property.description || "Fully furnished accredited student accommodation.").slice(0, 280)}...`}
              </div>
              {(property.description || "").length > 280 && (
                <button
                  type="button"
                  onClick={() => setReadMore(!readMore)}
                  className="text-xs font-bold text-[#005F56] hover:underline cursor-pointer"
                >
                  {readMore ? "Read Less" : "Read More →"}
                </button>
              )}
            </div>

            {/* Highlights Grid (Matching Reference Screenshot) */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Key Accommodation Highlights</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuBuilding2 className="w-3.5 h-3.5 text-[#005F56]" /> Property Type
                  </span>
                  <span className="font-bold text-slate-900 block">
                    Dedicated Student Block
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuShieldCheck className="w-3.5 h-3.5 text-[#005F56]" /> NSFAS Status
                  </span>
                  <span className="font-bold text-[#005F56] block">
                    {isNsfasAccredited ? "Accredited Scheme" : "Private Rental"}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuZap className="w-3.5 h-3.5 text-[#005F56]" /> Power Resilience
                  </span>
                  <span className="font-bold text-slate-900 block">
                    Solar Inverter &amp; Backup
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuDroplets className="w-3.5 h-3.5 text-[#005F56]" /> Water Backup
                  </span>
                  <span className="font-bold text-slate-900 block">
                    JoJo Tanks + Booster Pump
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuWifi className="w-3.5 h-3.5 text-[#005F56]" /> Connectivity
                  </span>
                  <span className="font-bold text-slate-900 block">
                    Uncapped 100Mbps Fibre
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                    <LuLock className="w-3.5 h-3.5 text-[#005F56]" /> Security
                  </span>
                  <span className="font-bold text-slate-900 block">
                    Biometrics &amp; 24/7 Guards
                  </span>
                </div>
              </div>
            </div>

            {/* Room Inventory & Rates Section */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Room Configurations &amp; Rates</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a room layout to apply directly for accommodation.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  {rooms.length} Layout Option{rooms.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-4">
                {rooms.map((room, idx) => (
                  <div
                    key={room.id || idx}
                    className="p-5 rounded-xl border border-slate-300 bg-white hover:border-[#005F56] transition-all shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{room.name}</h3>
                          {room.isNsfasCapped && (
                            <span className="text-[10px] font-bold text-[#005F56] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              NSFAS Capped
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {room.typeName} • {room.bathroomLabel} • {room.quantity} unit{room.quantity > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-lg font-black text-slate-900 block">
                            R {room.monthlyPrice.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500"> / bed</span>
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Deposit: R{room.deposit.toLocaleString()}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyClick(room.id)}
                          className="px-4 py-2 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          Apply for Room
                        </button>
                      </div>
                    </div>

                    {/* Room Inclusions */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                      {room.features.map((featId) => (
                        <span
                          key={featId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium"
                        >
                          <LuCheck className="w-3 h-3 text-[#005F56]" />
                          <span>{ROOM_FEATURE_LABELS[featId]?.label || featId}</span>
                        </span>
                      ))}
                    </div>

                    {/* Room Photos if available */}
                    {room.photos && room.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pt-2 no-scrollbar">
                        {room.photos.map((photoUrl, pIdx) => {
                          const resolvedPhoto = getPublicMediaUrl(photoUrl);
                          return (
                            <img
                              key={pIdx}
                              src={resolvedPhoto}
                              alt={`${room.name} interior ${pIdx + 1}`}
                              className="w-24 h-16 rounded-lg object-cover border border-slate-200 shrink-0 cursor-pointer hover:opacity-90"
                              onClick={() => {
                                const idxInAll = allImages.indexOf(resolvedPhoto);
                                setActivePhotoIdx(idxInAll >= 0 ? idxInAll : 0);
                                setLightboxOpen(true);
                              }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = FALLBACK_RESIDENCE_IMAGES[pIdx % FALLBACK_RESIDENCE_IMAGES.length];
                              }}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Living Amenities & Utilities Grid */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-900">Amenities &amp; Utilities Included</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(property.amenities || []).map((amenityKey: string) => {
                  const meta = AMENITY_METADATA[amenityKey] || {
                    label: amenityKey.replace(/_/g, " "),
                    category: "General Facility",
                    description: "Included with residence rental.",
                  };

                  return (
                    <div
                      key={amenityKey}
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#005F56]/10 text-[#005F56] flex items-center justify-center shrink-0 mt-0.5">
                        <LuCheck className="w-4 h-4 font-bold" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{meta.label}</span>
                        <span className="text-[11px] text-slate-500 block leading-tight mt-0.5">
                          {meta.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 13-Point Student Safety & Security Audit */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <LuShieldCheck className="w-5 h-5 text-[#005F56]" />
                    <span>13-Point Safety, Security &amp; Habitation Audit</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Physical safety audit for student peace of mind — verifying biometric access, fire safety, backup utilities &amp; rapid response.
                  </p>
                </div>

                {safetyScoreNum && (
                  <span className="px-3 py-1 rounded-lg bg-[#005F56] text-white text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                    <LuCheck className="w-3.5 h-3.5" />
                    <span>Safety Score {safetyScoreNum} / 10</span>
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {(property.checklistItems || []).map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-800 font-medium">{item.label}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 ${
                        item.passed === true
                          ? "bg-emerald-100 text-emerald-800"
                          : item.passed === false
                          ? "bg-rose-100 text-rose-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.passed === true ? (
                        <>
                          <LuCheck className="w-3.5 h-3.5" /> Pass
                        </>
                      ) : item.passed === false ? (
                        <>✕ Fail</>
                      ) : (
                        "Pending"
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking / Application Sidebar Widget */}
          <div className="space-y-6">

            {/* Request a Tour & Apply Card (Matching Reference Screenshot) */}
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-xs space-y-5 sticky top-20">
              <div>
                <h3 className="text-base font-bold text-slate-900">Apply or Request a Tour</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Book a physical walkthrough or apply directly for your room.
                </p>
              </div>

              {/* Intake Period Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Intake Academic Semester
                </label>
                <select
                  value={selectedIntake}
                  onChange={(e) => setSelectedIntake(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                >
                  <option value="Semester 1 (Immediate)">Semester 1 (Immediate Placement)</option>
                  <option value="Semester 2">Semester 2 Academic Intake</option>
                  <option value="2027 Full Year">2027 Full Year Pre-Booking</option>
                </select>
              </div>

              {/* Tour Date & Time Pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Tour Date
                  </label>
                  <input
                    type="date"
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Time Slot
                  </label>
                  <select
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                  >
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              {tourScheduled && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Viewing tour scheduled for {tourDate} at {tourTime}!</span>
                </div>
              )}

              {/* Primary & Secondary Action CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleApplyClick()}
                  className="w-full py-3 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <LuSparkles className="w-4 h-4" />
                  <span>Apply for Accommodation</span>
                </button>

                <button
                  type="button"
                  onClick={handleScheduleTour}
                  className="w-full py-2.5 rounded-lg border border-slate-300 hover:border-[#005F56] bg-white text-slate-800 hover:text-[#005F56] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LuClock className="w-3.5 h-3.5" />
                  <span>Schedule a Tour</span>
                </button>
              </div>

              {/* Landlord Information Box (Matching Reference Screenshot) */}
              <div className="pt-5 border-t border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Landlord &amp; Agent Information
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#005F56]/10 text-[#005F56] font-extrabold text-base flex items-center justify-center border border-[#005F56]/20 shrink-0">
                    {landlordName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{landlordName}</h4>
                    <span className="inline-block text-[10px] font-bold text-[#005F56] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5">
                      Verified Landlord
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <LuPhone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{property.landlord?.phone || "+27 82 555 0192"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <LuMail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{property.landlord?.email || "landlord@campusnest.co.za"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Contacting ${landlordName}... You can reach them at ${property.landlord?.email || "landlord@campusnest.co.za"}`)}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Contact Landlord
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Lightbox Modal for Photo Gallery */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={allImages[activePhotoIdx]}
              alt={`${property.title} full view`}
              className="w-full max-h-[80vh] object-contain"
            />

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
            >
              <LuX className="w-5 h-5" />
            </button>

            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <LuChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <LuChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Student Authentication Gate Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-br from-[#005F56] to-[#00453e] text-white relative">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                <LuGraduationCap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Student Account Required
              </h3>
              <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                Sign in or register to submit your formal application for <strong>{property.title}</strong> and unlock instant bursar &amp; NSFAS proof letters.
              </p>
            </div>

            {/* Modal Body & Benefits */}
            <div className="p-6 space-y-5">
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#005F56] flex items-center justify-center shrink-0 mt-0.5">
                    <LuCheck className="w-3 h-3 font-bold" />
                  </div>
                  <span><strong>Automatic KYC Auto-Fill:</strong> Validates student number, degree &amp; funding status.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#005F56] flex items-center justify-center shrink-0 mt-0.5">
                    <LuCheck className="w-3 h-3 font-bold" />
                  </div>
                  <span><strong>Digital Placement Letter:</strong> Formal signed PDF for NSFAS / Bursars upon landlord review.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#005F56] flex items-center justify-center shrink-0 mt-0.5">
                    <LuCheck className="w-3 h-3 font-bold" />
                  </div>
                  <span><strong>Seamless Return:</strong> You will be returned right back here to complete your application.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {(() => {
                  const propertySlug = slug || property.slug || property.id;
                  const returnUrl = `/residences/${propertySlug}?apply=true${selectedRoomId ? `&roomId=${selectedRoomId}` : ""}`;
                  const loginUrl = `/login?next=${encodeURIComponent(returnUrl)}`;
                  const registerUrl = `/register?next=${encodeURIComponent(returnUrl)}`;

                  return (
                    <>
                      <Link
                        href={loginUrl}
                        className="w-full py-3 px-4 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        <LuGraduationCap className="w-4 h-4" />
                        <span>Sign In with Student Account</span>
                        <LuChevronRight className="w-4 h-4 ml-auto" />
                      </Link>

                      <Link
                        href={registerUrl}
                        className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:border-[#005F56] bg-white text-slate-800 hover:text-[#005F56] text-xs font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <LuPlus className="w-4 h-4" />
                        <span>Create Free Student Account</span>
                        <LuChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </>
                  );
                })()}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Continue browsing residence details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-slate-200">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LuSparkles className="w-4 h-4 text-[#005F56]" />
                  <span>Student Accommodation Application</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Apply for {property.title} • {selectedIntake}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <DynamicApplicationForm
                propertyId={property.id}
                propertyTitle={property.title}
                monthlyRent={
                  selectedRoomId
                    ? rooms.find((r) => r.id === selectedRoomId)?.monthlyPrice || startingPrice
                    : startingPrice
                }
                landlordName={landlordName}
                rooms={rooms.map((r) => ({
                  id: r.id,
                  name: r.name,
                  typeName: r.typeName,
                  monthlyPrice: r.monthlyPrice,
                  deposit: r.deposit,
                }))}
                selectedRoomId={selectedRoomId}
                onRoomChange={(rId) => setSelectedRoomId(rId)}
                selectedIntake={selectedIntake}
                initialStudent={studentProfile}
                onSubmitSuccess={() => {
                  // Keep open so student can see success state & download letter
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

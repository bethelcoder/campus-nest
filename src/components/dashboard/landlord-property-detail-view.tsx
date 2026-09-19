"use client";

import React, { useState } from "react";
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
  LuUserCheck,
  LuArrowUpRight,
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
} from "react-icons/lu";
import { extractRoomsFromProperty, AMENITY_METADATA, ROOM_FEATURE_LABELS, type ParsedRoom } from "@/lib/rooms";

interface LandlordPropertyDetailViewProps {
  property: any;
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function LandlordPropertyDetailView({
  property,
  user,
}: LandlordPropertyDetailViewProps) {
  const [activeViewTab, setActiveViewTab] = useState<"rooms" | "amenities" | "tenants" | "safety">("rooms");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const rooms: ParsedRoom[] = extractRoomsFromProperty(property);

  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0) || property.bedrooms || 1;
  const totalBedrooms = rooms.reduce((sum, r) => sum + r.quantity, 0) || property.bedrooms || 1;
  const activeTenancies = property.tenancies || [];
  const occupiedBeds = activeTenancies.length;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const safetyScoreNum = property.safetyScore !== null && property.safetyScore !== undefined
    ? Number(property.safetyScore).toFixed(1)
    : null;

  // Group checklist items by category
  const checklistByCategory = (property.checklistItems || []).reduce(
    (acc: Record<string, any[]>, item: any) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-poppins">
      {/* Lightbox Modal for Photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            <img src={selectedPhoto} alt="Room preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold hover:bg-black"
            >
              ✕ Close
            </button>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/landlord/properties"
              className="text-xs font-semibold text-[#64748B] hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <LuChevronLeft className="w-3.5 h-3.5" />
              <span>Back to My Residences</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                property.status === "VERIFIED"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {property.status === "VERIFIED" ? "✓ Accredited Listing" : "Pending Inspection"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            {property.title}
          </h1>

          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
            <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {property.address}, {property.suburb}, {property.city}
              {property.distanceToCampus && ` • ${Number(property.distanceToCampus).toFixed(1)} km to Campus`}
            </span>
          </p>
        </div>

        {/* Action Buttons & Safety Score */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {safetyScoreNum && (
            <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
              <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                Safety Score
              </span>
              <span className="text-base font-extrabold text-emerald-700">
                {safetyScoreNum} / 10
              </span>
            </div>
          )}

          <Link
            href={`/landlord/tenancies?propertyId=${property.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <LuUserCheck className="w-3.5 h-3.5" />
            <span>Manage Tenancies ({occupiedBeds})</span>
          </Link>

          <Link
            href={`/landlord/properties/${property.id}/preview`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LuEye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuBed className="w-3.5 h-3.5 text-emerald-600" /> Capacity
          </span>
          <span className="text-xl font-black text-gray-900 block mt-0.5">
            {totalBeds} Beds
          </span>
          <span className="text-[10px] text-gray-400">Across {totalBedrooms} bedroom units</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuUsers className="w-3.5 h-3.5 text-blue-600" /> Occupancy Rate
          </span>
          <span className="text-xl font-black text-gray-900 block mt-0.5">
            {occupancyRate}%
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">{occupiedBeds} occupied • {availableBeds} vacant</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuDollarSign className="w-3.5 h-3.5 text-emerald-600" /> Base Rental
          </span>
          <span className="text-xl font-black text-emerald-700 block mt-0.5">
            R {Number(property.priceMonthly).toLocaleString()}
            <span className="text-[11px] font-normal text-gray-500"> / bed</span>
          </span>
          <span className="text-[10px] text-gray-400">Starting price per student</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuBath className="w-3.5 h-3.5 text-purple-600" /> Bathrooms
          </span>
          <span className="text-xl font-black text-gray-900 block mt-0.5">
            {property.bathrooms || 1} Bath{property.bathrooms !== 1 ? "s" : ""}
          </span>
          <span className="text-[10px] text-gray-400">Ensuite &amp; communal mix</span>
        </div>
      </div>

      {/* Uploaded residence photos */}
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Residence Photos</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Uploaded photos for this residence listing.
            </p>
          </div>
          {property.images?.length > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {property.images.length} photo{property.images.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {property.images?.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {property.images.map((imageUrl: string, index: number) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setSelectedPhoto(imageUrl)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 text-left"
                aria-label={`View residence photo ${index + 1}`}
              >
                <img
                  src={imageUrl}
                  alt={`${property.title} photo ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white transition-colors group-hover:bg-black/25">
                  <LuEye className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-xs text-gray-400">
            No residence photos uploaded yet.
          </div>
        )}
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: "rooms" as const, label: `Room Listings (${rooms.length})`, icon: <LuBed className="w-3.5 h-3.5" /> },
          { id: "amenities" as const, label: `Property Amenities (${property.amenities?.length || 0})`, icon: <LuZap className="w-3.5 h-3.5" /> },
          { id: "tenants" as const, label: `Active Tenants (${occupiedBeds})`, icon: <LuUsers className="w-3.5 h-3.5" /> },
          { id: "safety" as const, label: "Safety & Compliance Audit", icon: <LuShieldCheck className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveViewTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeViewTab === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: ROOM LISTINGS & DETAILS ================= */}
      {activeViewTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-base font-bold text-gray-900">Room Inventory &amp; Rate Configurations</h2>
              <p className="text-xs text-gray-500">
                Detailed breakdown of available room types, bed capacities, monthly rates, and in-room amenities.
              </p>
            </div>

            <Link
              href={`/landlord/tenancies?propertyId=${property.id}`}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Manage Room Allocations</span>
              <LuArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room, idx) => {
              // Find tenants in this room type if tagged
              const tenantsInRoom = activeTenancies.filter(
                (t: any) => t.roomType === room.type || t.roomName?.includes(room.name)
              );

              return (
                <div
                  key={room.id || idx}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs hover:border-gray-300 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    {/* Top Room Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{room.name}</h3>
                          {room.isNsfasCapped && (
                            <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              NSFAS Cap
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {room.typeName} • {room.bathroomLabel}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-gray-900 block">
                          R {Number(room.monthlyPrice).toLocaleString()}
                          <span className="text-[10px] font-normal text-gray-500"> / bed</span>
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          Deposit: R{Number(room.deposit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Room Specs Pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-700 flex items-center gap-1">
                        <LuBed className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{room.quantity} Unit{room.quantity > 1 ? "s" : ""} ({room.totalBeds} Bed{room.totalBeds > 1 ? "s" : ""})</span>
                      </span>

                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-700 flex items-center gap-1">
                        <LuBath className="w-3.5 h-3.5 text-blue-600" />
                        <span>{room.bathroomLabel}</span>
                      </span>

                      {room.sizeSqm && (
                        <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 font-semibold text-gray-600 text-[11px]">
                          {room.sizeSqm} m²
                        </span>
                      )}
                    </div>

                    {/* In-Room Inclusions Checklist */}
                    {room.features && room.features.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          In-Room Inclusions
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {room.features.map((featKey) => {
                            const feat = ROOM_FEATURE_LABELS[featKey] || { label: featKey, icon: "✓" };
                            return (
                              <span
                                key={featKey}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium"
                              >
                                <span>{feat.icon}</span>
                                <span>{feat.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Interior Room Photos */}
                    {room.photos && room.photos.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Room Pictures ({room.photos.length})
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {room.photos.slice(0, 3).map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => setSelectedPhoto(photoUrl)}
                              className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100 cursor-pointer group"
                            >
                              <img src={photoUrl} alt={`${room.name} ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <LuEye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room Card Footer / Occupancy Status */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-gray-700">
                        {tenantsInRoom.length > 0 ? `${tenantsInRoom.length} Occupant(s)` : "Vacant / Available"}
                      </span>
                    </div>

                    <Link
                      href={`/landlord/tenancies?propertyId=${property.id}`}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Assign Student →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: PROPERTY AMENITIES ================= */}
      {activeViewTab === "amenities" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Verified Residence Amenities &amp; Resilience</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Infrastructure guarantees including load-shedding backup, municipal water storage, and 24/7 student security.
            </p>
          </div>

          {property.amenities && property.amenities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {property.amenities.map((amenityKey: string) => {
                const meta = AMENITY_METADATA[amenityKey] || {
                  label: amenityKey.replace("_", " "),
                  icon: "✨",
                  category: "General Amenity",
                  description: "Verified on-site student accommodation feature.",
                };

                return (
                  <div
                    key={amenityKey}
                    className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] hover:bg-white hover:border-gray-300 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{meta.icon}</span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        {meta.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 leading-snug">{meta.label}</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{meta.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs">
              No amenities listed for this property yet.
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ACTIVE TENANTS & ALLOCATIONS ================= */}
      {activeViewTab === "tenants" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Current Tenants in this Building</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Students residing in {property.title} with verified academic &amp; funding status.
              </p>
            </div>

            <Link
              href={`/landlord/tenancies?propertyId=${property.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <LuPlus className="w-3.5 h-3.5" />
              <span>Full Tenancy Manager</span>
            </Link>
          </div>

          {activeTenancies.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 space-y-3">
              <LuUsers className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No Active Tenants Assigned Yet</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When students apply and you accept their lease, their assigned room and tenancy details will appear here.
              </p>
              <Link
                href="/dashboard/landlord#applications"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
              >
                <span>Review Inbound Applications →</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pr-4">Student / Learner</th>
                    <th className="pb-3 px-4">Assigned Room</th>
                    <th className="pb-3 px-4">Institution &amp; Study</th>
                    <th className="pb-3 px-4">Funding Scheme</th>
                    <th className="pb-3 px-4">Monthly Rent</th>
                    <th className="pb-3 pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeTenancies.map((tenancy: any) => {
                    const student = tenancy.student || {};
                    const profile = student.studentProfile || {};

                    return (
                      <tr key={tenancy.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                              {student.name?.[0] || "S"}{student.surname?.[0] || ""}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{student.name} {student.surname}</span>
                              <span className="text-[11px] text-gray-400 block">{student.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-gray-800 block">
                            {tenancy.roomName || tenancy.roomType || "Standard Room"}
                          </span>
                          <span className="text-[10px] text-gray-400 block">
                            {tenancy.roomType ? tenancy.roomType.replace("_", " ") : "Private Bed"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="text-gray-900 font-medium block">{profile.universityName || "University Student"}</span>
                          <span className="text-[10px] text-gray-400 block">
                            {profile.degreeProgram || "Undergraduate"} {profile.studentNumber ? `• #${profile.studentNumber}` : ""}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                            <LuAward className="w-3 h-3 text-emerald-600" />
                            <span>{profile.fundingType || "NSFAS Direct"}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-900">
                          R {Number(tenancy.monthlyRent || property.priceMonthly).toLocaleString()}
                          <span className="text-[10px] font-normal text-gray-400">/mo</span>
                        </td>

                        <td className="py-3.5 pl-4">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            {tenancy.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: 13-POINT SAFETY AUDIT ================= */}
      {activeViewTab === "safety" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">13-Point Municipal Safety Inspection</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Standard municipal checklist required for university accreditation and NSFAS tenancy confirmation.
              </p>
            </div>

            {safetyScoreNum && (
              <div className="p-3 px-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center gap-3 shrink-0">
                <LuShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider block">
                    Accreditation Score
                  </span>
                  <span className="text-base font-extrabold text-white">
                    {safetyScoreNum} / 10
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {Object.entries(checklistByCategory).map(([category, items]: [string, any]) => (
              <div key={category} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-[#F8FAFC]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {category.replace("_", " ")}
                </h3>
                <div className="space-y-2">
                  {items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-gray-100 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            item.passed === true
                              ? "bg-emerald-100 text-emerald-700"
                              : item.passed === false
                              ? "bg-rose-100 text-rose-700"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {item.passed === true ? "✓" : item.passed === false ? "✕" : "○"}
                        </span>
                        <span className="font-semibold text-gray-800">{item.label}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.passed === true
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {item.passed === true ? "Passed" : "Action Required"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

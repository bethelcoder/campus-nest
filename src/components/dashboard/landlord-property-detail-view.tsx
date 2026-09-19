"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  LuSparkles,
  LuUserCheck,
  LuArrowUpRight,
  LuLock,
  LuZap,
  LuCalendar,
  LuPhone,
  LuMail,
  LuGraduationCap,
  LuAward,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuTriangle,
  LuInfo,
  LuShieldAlert,
  LuClock,
  LuFileText,
  LuFilter,
} from "react-icons/lu";
import { extractRoomsFromProperty, AMENITY_METADATA, ROOM_FEATURE_LABELS, type ParsedRoom } from "@/lib/rooms";
import { getPublicMediaUrl } from "@/lib/media";

interface LandlordPropertyDetailViewProps {
  property: any;
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
  liveTenancies?: number;
  unansweredApplications?: number;
}

export default function LandlordPropertyDetailView({
  property,
  user,
  liveTenancies = 0,
  unansweredApplications = 0,
}: LandlordPropertyDetailViewProps) {
  const [activeViewTab, setActiveViewTab] = useState<"rooms" | "complaints" | "tenants" | "applications" | "amenities" | "safety">("rooms");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [roomFilter, setRoomFilter] = useState<"ALL" | "AVAILABLE" | "TAKEN">("ALL");
  const [complaintFilter, setComplaintFilter] = useState<string>("ALL");

  const [reports, setReports] = useState<any[]>(property.reports || []);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [actionNotesDrafts, setActionNotesDrafts] = useState<Record<string, string>>({});

  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const rooms: ParsedRoom[] = extractRoomsFromProperty(property);

  const totalBeds = rooms.reduce((sum, r) => sum + r.totalBeds, 0) || property.bedrooms || 1;
  const totalBedrooms = rooms.reduce((sum, r) => sum + r.quantity, 0) || property.bedrooms || 1;
  const activeTenancies = property.tenancies || [];
  const occupiedBeds = activeTenancies.length;
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const applications = property.applications || [];
  const pendingComplaints = reports.filter((r) => r.status === "OPEN" || r.status === "UNDER_INTERVENTION" || r.status === "ESCALATED");

  const safetyScoreNum = property.safetyScore !== null && property.safetyScore !== undefined
    ? Number(property.safetyScore).toFixed(1)
    : null;

  const checklistByCategory = (property.checklistItems || []).reduce(
    (acc: Record<string, any[]>, item: any) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  const blockDelete = liveTenancies > 0 || unansweredApplications > 0;

  const handleDelete = async () => {
    if (deleteConfirmText.trim() !== property.title.trim()) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Residence could not be deleted.");
      }
      router.push("/landlord/properties");
      router.refresh();
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete residence.");
      setDeleting(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const tenantsInRoom = activeTenancies.filter(
      (t: any) => t.roomType === room.type || t.roomName?.includes(room.name)
    );
    const isTaken = tenantsInRoom.length >= room.totalBeds;
    const isAvailable = tenantsInRoom.length < room.totalBeds;

    if (roomFilter === "AVAILABLE") return isAvailable;
    if (roomFilter === "TAKEN") return isTaken;
    return true;
  });

  const filteredReports = reports.filter((report) => {
    if (complaintFilter === "ALL") return true;
    return report.status === complaintFilter;
  });

  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    setUpdatingReportId(reportId);
    try {
      const notes = actionNotesDrafts[reportId];
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          actionNotes: notes !== undefined ? notes : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, ...data.report } : r))
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to update complaint status");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating complaint");
    } finally {
      setUpdatingReportId(null);
    }
  };

  const handleSaveNotes = async (reportId: string) => {
    setUpdatingReportId(reportId);
    try {
      const notes = actionNotesDrafts[reportId] || "";
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionNotes: notes }),
      });

      if (res.ok) {
        const data = await res.json();
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, ...data.report } : r))
        );
        alert("Action notes saved successfully!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingReportId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-poppins">
      {/* Lightbox Modal for Photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
            <img src={getPublicMediaUrl(selectedPhoto)} alt="Room preview" className="w-full h-full object-contain" />
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 text-white text-xs font-bold hover:bg-black cursor-pointer"
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
            href={`/landlord/properties/${property.id}/tenancy`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <LuUserCheck className="w-3.5 h-3.5" />
            <span>Manage Tenancies ({occupiedBeds})</span>
          </Link>

          <Link
            href={`/landlord/properties/${property.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-emerald-600 hover:text-emerald-700 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span>Edit Residence</span>
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
            <LuBed className="w-3.5 h-3.5 text-emerald-600" /> Total Capacity
          </span>
          <span className="text-xl font-black text-gray-900 block mt-0.5">
            {totalBeds} Beds
          </span>
          <span className="text-[10px] text-gray-400">Across {totalBedrooms} bedroom units</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuUsers className="w-3.5 h-3.5 text-blue-600" /> Available vs Taken
          </span>
          <span className="text-xl font-black text-emerald-700 block mt-0.5">
            {availableBeds} Vacant / {occupiedBeds} Taken
          </span>
          <span className="text-[10px] text-gray-500 font-semibold">{occupancyRate}% Occupied</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Complaints / Reports
          </span>
          <span className="text-xl font-black text-gray-900 block mt-0.5">
            {pendingComplaints.length} Open
          </span>
          <span className="text-[10px] text-gray-400">{reports.length} total logged issues</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
            <LuDollarSign className="w-3.5 h-3.5 text-emerald-600" /> Base Rental
          </span>
          <span className="text-xl font-black text-emerald-700 block mt-0.5">
            R {Number(property.priceMonthly).toLocaleString()}
            <span className="text-[11px] font-normal text-gray-500"> / bed</span>
          </span>
          <span className="text-[10px] text-gray-400">Starting rate per month</span>
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
                  src={getPublicMediaUrl(imageUrl)}
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
          { id: "rooms" as const, label: `Room Inventory (${rooms.length})`, icon: <LuBed className="w-3.5 h-3.5" /> },
          { id: "complaints" as const, label: `Complaints & Maintenance (${reports.length})`, icon: <LuShieldAlert className="w-3.5 h-3.5 text-amber-500" /> },
          { id: "tenants" as const, label: `Active Tenants (${occupiedBeds})`, icon: <LuUsers className="w-3.5 h-3.5" /> },
          { id: "applications" as const, label: `Applications (${applications.length})`, icon: <LuFileText className="w-3.5 h-3.5" /> },
          { id: "amenities" as const, label: `Amenities (${property.amenities?.length || 0})`, icon: <LuZap className="w-3.5 h-3.5" /> },
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

      {/* ================= TAB 1: ROOM INVENTORY & AVAILABILITY ================= */}
      {activeViewTab === "rooms" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-base font-bold text-gray-900">Room Inventory &amp; Availability Status</h2>
              <p className="text-xs text-gray-500">
                View all configured room types, available vs taken bed capacity, rates, and in-room features.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Room Availability Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setRoomFilter("ALL")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    roomFilter === "ALL" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  All Rooms ({rooms.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoomFilter("AVAILABLE")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    roomFilter === "AVAILABLE" ? "bg-emerald-600 text-white shadow-2xs" : "text-emerald-700 hover:text-emerald-800"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Available Units</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoomFilter("TAKEN")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    roomFilter === "TAKEN" ? "bg-gray-800 text-white shadow-2xs" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Fully Taken</span>
                </button>
              </div>

              <Link
                href={`/landlord/properties/${property.id}/tenancy`}
                className="text-xs font-bold text-[#005F56] hover:text-[#004d46] flex items-center gap-1"
              >
                <span>Manage Room Allocations</span>
                <LuArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room, idx) => {
              const tenantsInRoom = activeTenancies.filter(
                (t: any) => t.roomType === room.type || t.roomName?.includes(room.name)
              );
              const roomTakenBeds = tenantsInRoom.length;
              const roomVacantBeds = Math.max(0, room.totalBeds - roomTakenBeds);
              const isFullyOccupied = roomVacantBeds === 0;

              return (
                <div
                  key={room.id || idx}
                  className={`rounded-2xl border p-5 shadow-xs transition-all space-y-4 flex flex-col justify-between ${
                    isFullyOccupied
                      ? "border-gray-200 bg-white"
                      : "border-emerald-200 bg-gradient-to-br from-white to-emerald-50/20"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Room Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">{room.name}</h3>
                          {isFullyOccupied ? (
                            <span className="text-[9px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              Fully Taken
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              {roomVacantBeds} Bed{roomVacantBeds > 1 ? "s" : ""} Available
                            </span>
                          )}
                          {room.isNsfasCapped && (
                            <span className="text-[9px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
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
                        <span>{room.quantity} Unit{room.quantity > 1 ? "s" : ""} ({room.totalBeds} Total Bed{room.totalBeds > 1 ? "s" : ""})</span>
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

                    {/* Assigned Occupants / Vacancy details */}
                    {tenantsInRoom.length > 0 ? (
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Assigned Students ({tenantsInRoom.length} / {room.totalBeds})
                        </span>
                        <div className="space-y-1.5">
                          {tenantsInRoom.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center justify-center">
                                  {t.student?.name?.[0] || "S"}
                                </div>
                                <span className="font-semibold text-gray-800">{t.student?.name} {t.student?.surname}</span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                {t.student?.studentProfile?.fundingType || "Active Lease"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-dashed border-emerald-200 text-center">
                        <p className="text-xs font-semibold text-emerald-800">All {room.totalBeds} bed slots are vacant &amp; ready for allocation</p>
                      </div>
                    )}

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
                              <img src={getPublicMediaUrl(photoUrl)} alt={`${room.name} ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
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
                      <span className={`w-2 h-2 rounded-full ${isFullyOccupied ? "bg-blue-500" : "bg-emerald-500"}`} />
                      <span className="font-semibold text-gray-700">
                        {isFullyOccupied ? "Fully Occupied" : `${roomVacantBeds} Bed(s) Available`}
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

      {/* ================= TAB 2: COMPLAINTS & MAINTENANCE MANAGEMENT ================= */}
      {activeViewTab === "complaints" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Maintenance &amp; Student Complaints Hub
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-600">{pendingComplaints.length} Action Needed</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Safety Reports &amp; Maintenance Requests
              </h2>
              <p className="text-xs text-gray-500">
                Review issues submitted by student tenants, update resolution statuses, and log action notes.
              </p>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <LuFilter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={complaintFilter}
                onChange={(e) => setComplaintFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="ALL">All Statuses ({reports.length})</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_INTERVENTION">Under Intervention</option>
                <option value="RESOLVED">Resolved</option>
                <option value="ESCALATED">Escalated</option>
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="text-sm font-bold text-gray-900">No Complaints or Maintenance Requests</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No active complaints reported for this residence matching your filter. Student reports will appear here with SLA tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const reporter = report.reporter || {};
                const isResolved = report.status === "RESOLVED";
                const isCritical = report.severity === "CRITICAL_EMERGENCY" || report.severity === "HIGH";

                return (
                  <div
                    key={report.id}
                    className={`rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
                      isResolved
                        ? "bg-[#F8FAFC] border-gray-200"
                        : isCritical
                        ? "bg-rose-50/30 border-rose-200"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              report.status === "RESOLVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : report.status === "UNDER_INTERVENTION"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : report.status === "ESCALATED"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {report.status}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              report.severity === "CRITICAL_EMERGENCY"
                                ? "bg-rose-100 text-rose-800 font-extrabold"
                                : report.severity === "HIGH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {report.severity ? report.severity.replace("_", " ") : "STANDARD"}
                          </span>

                          {report.category && (
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              {report.category}
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 mt-1">{report.subject}</h3>
                      </div>

                      {/* SLA info & Date */}
                      <div className="text-right text-xs text-gray-500 shrink-0">
                        <span className="flex items-center gap-1 sm:justify-end">
                          <LuClock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Logged: {new Date(report.createdAt).toLocaleDateString("en-ZA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </span>
                        {report.slaExpiresAt && (
                          <span className={`text-[10px] font-semibold block mt-0.5 ${
                            new Date(report.slaExpiresAt) < new Date() && !isResolved ? "text-rose-600 font-bold" : "text-gray-400"
                          }`}>
                            SLA Target: {report.slaHours}h ({new Date(report.slaExpiresAt) < new Date() && !isResolved ? "EXPIRED" : "Active"})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Complaint Description */}
                    <div className="p-3.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-700 leading-relaxed">
                      {report.description}
                    </div>

                    {/* Reporter Info Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-gray-100 text-gray-600">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                          Tenant: {reporter.name} {reporter.surname}
                        </span>
                        {reporter.email && (
                          <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <LuMail className="w-3 h-3 text-gray-400" /> {reporter.email}
                          </span>
                        )}
                        {reporter.phone && (
                          <span className="flex items-center gap-1 text-gray-500 text-[11px]">
                            <LuPhone className="w-3 h-3 text-gray-400" /> {reporter.phone}
                          </span>
                        )}
                      </div>

                      {/* Quick Status Toggles */}
                      <div className="flex items-center gap-2">
                        {report.status !== "RESOLVED" ? (
                          <>
                            <button
                              type="button"
                              disabled={updatingReportId === report.id}
                              onClick={() => handleUpdateReportStatus(report.id, "UNDER_INTERVENTION")}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Mark In Progress
                            </button>
                            <button
                              type="button"
                              disabled={updatingReportId === report.id}
                              onClick={() => handleUpdateReportStatus(report.id, "RESOLVED")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                            >
                              <LuCheck className="w-3 h-3" />
                              <span>Mark as Resolved</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={updatingReportId === report.id}
                            onClick={() => handleUpdateReportStatus(report.id, "OPEN")}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Re-open Issue
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Notes Box */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Landlord Action Notes &amp; Resolution Log
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={report.actionNotes || ""}
                          onChange={(e) =>
                            setActionNotesDrafts({
                              ...actionNotesDrafts,
                              [report.id]: e.target.value,
                            })
                          }
                          placeholder="e.g. Plumber dispatched on 18 Sep, parts replaced..."
                          className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          disabled={updatingReportId === report.id}
                          onClick={() => handleSaveNotes(report.id)}
                          className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: ACTIVE TENANTS ================= */}
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
              href={`/landlord/properties/${property.id}/tenancy`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer"
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

      {/* ================= TAB 4: INBOUND APPLICATIONS ================= */}
      {activeViewTab === "applications" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Inbound Applications for this Property</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and accept student applicant requests to move into {property.title}.
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 space-y-2">
              <LuFileText className="w-8 h-8 text-gray-400 mx-auto" />
              <h3 className="text-sm font-bold text-gray-800">No Applications Received Yet</h3>
              <p className="text-xs text-gray-400">When prospective students apply to this residence, their requests will show here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: any) => {
                const student = app.student || {};
                const profile = student.studentProfile || {};

                return (
                  <div key={app.id} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm flex items-center justify-center">
                        {student.name?.[0] || "S"}{student.surname?.[0] || ""}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{student.name} {student.surname}</h4>
                        <p className="text-[11px] text-gray-500">{student.email} • {profile.universityName || "University Applicant"}</p>
                        {app.message && <p className="text-[11px] text-gray-600 mt-1 italic">&ldquo;{app.message}&rdquo;</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {app.status}
                      </span>
                      <Link
                        href={`/landlord/tenancies?propertyId=${property.id}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        Accept &amp; Allocate Room
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: PROPERTY AMENITIES ================= */}
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

      {/* ================= TAB 6: 13-POINT SAFETY AUDIT ================= */}
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
    {/* ================= DANGER ZONE ================= */}
      <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-rose-800 flex items-center gap-2">
              <LuTrash2 className="w-4 h-4" />
              Delete This Residence
            </h2>
            <p className="text-xs text-rose-700/80 mt-0.5">
              {blockDelete
                ? `Currently blocked: ${liveTenancies} active tenanc${
                    liveTenancies === 1 ? "y" : "ies"
                  } and ${unansweredApplications} unanswered application${
                    unansweredApplications === 1 ? "" : "s"
                  } must be resolved or ended first.`
                : "Permanently removes this listing and all of its data. This action cannot be undone."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            disabled={blockDelete}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer shrink-0"
          >
            <LuTrash2 className="w-3.5 h-3.5" />
            <span>Delete Residence</span>
          </button>
        </div>
      </section>

      {/* ================= DELETE CONFIRM MODAL ================= */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <LuTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Delete &quot;{property.title}&quot;?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                This permanently removes the listing, its photos, room configurations, and safety checklist.{" "}
                <span className="font-semibold text-rose-600">This cannot be undone.</span>
              </p>
            </div>
            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <LuInfo className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1.5">
                Type <span className="text-rose-600">{property.title}</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-600/20 focus:border-rose-600 text-xs text-gray-900"
                placeholder={property.title}
              />
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteOpen(false);
                  setDeleteConfirmText("");
                }}
                disabled={deleting}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText.trim() !== property.title.trim()}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

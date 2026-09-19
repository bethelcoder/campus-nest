"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuBuilding2,
  LuUsers,
  LuBed,
  LuMapPin,
  LuSearch,
  LuFilter,
  LuAward,
  LuCheck,
  LuPlus,
  LuCalendar,
  LuDollarSign,
  LuFileText,
  LuPhone,
  LuMail,
  LuGraduationCap,
  LuArrowUpRight,
  LuLayers,
  LuUserCheck,
  LuEye,
  LuPencil,
  LuTrash2,
  LuChevronLeft,
  LuX,
  LuSparkles,
  LuShieldCheck,
  LuShieldAlert,
  LuClock,
  LuRefreshCw,
  LuInfo,
} from "react-icons/lu";
import { extractRoomsFromProperty, type ParsedRoom } from "@/lib/rooms";

interface StudentProfile {
  id?: string;
  studentNumber?: string | null;
  universityName?: string | null;
  degreeProgram?: string | null;
  fundingType?: string | null;
  funderName?: string | null;
  funderReference?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
}

interface StudentUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone?: string | null;
  institutionName?: string | null;
  studentProfile?: StudentProfile | null;
}

export interface TenancyRecord {
  id: string;
  studentId: string;
  propertyId: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  status: "PENDING" | "ACTIVE" | "ENDED";
  roomName?: string | null;
  roomType?: string | null;
  monthlyRent?: number | null;
  deposit?: number | null;
  student: StudentUser;
  confirmationLetter?: any;
}

interface ResidenceTenancyDetailViewProps {
  property: any;
  allStudents?: StudentUser[];
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function ResidenceTenancyDetailView({
  property,
  allStudents = [],
  user,
}: ResidenceTenancyDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local mutable state for tenancies to ensure instant optimistic updates
  const [tenancies, setTenancies] = useState<TenancyRecord[]>(
    (property.tenancies || []).map((t: any) => ({
      ...t,
      monthlyRent: t.monthlyRent ? Number(t.monthlyRent) : Number(property.priceMonthly || 4500),
      deposit: t.deposit ? Number(t.deposit) : 0,
    }))
  );

  // Extract structured rooms from property
  const rooms: ParsedRoom[] = useMemo(() => {
    return extractRoomsFromProperty(property);
  }, [property]);

  // Selected Room Type Filter Tile
  const [selectedRoomTypeFilter, setSelectedRoomTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [fundingFilter, setFundingFilter] = useState<string>("ALL");

  // Modal States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [activeTenancy, setActiveTenancy] = useState<TenancyRecord | null>(null);

  // Form State for Assigning Tenant
  const [assignForm, setAssignForm] = useState({
    mode: "existing" as "existing" | "new",
    studentId: "",
    name: "",
    surname: "",
    email: "",
    phone: "",
    studentNumber: "",
    universityName: property.institution || "University of the Witwatersrand",
    fundingType: "NSFAS",
    funderReference: "",
    roomName: rooms.length > 0 ? rooms[0].name : "Standard Room",
    roomType: rooms.length > 0 ? rooms[0].type : "SINGLE_STANDARD",
    bedNumber: "Bed 1",
    monthlyRent: rooms.length > 0 ? rooms[0].monthlyPrice : Number(property.priceMonthly || 4500),
    deposit: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
    status: "ACTIVE" as "ACTIVE" | "PENDING",
  });

  const [savingAssign, setSavingAssign] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Form State for Editing Tenancy
  const [editForm, setEditForm] = useState({
    roomName: "",
    roomType: "",
    monthlyRent: 0,
    deposit: 0,
    startDate: "",
    endDate: "",
    status: "ACTIVE" as "ACTIVE" | "PENDING" | "ENDED",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Calculated Overall Metrics
  const totalCapacityBeds = useMemo(() => {
    const fromRooms = rooms.reduce((sum, r) => sum + r.totalBeds, 0);
    return fromRooms > 0 ? fromRooms : property.bedrooms || 1;
  }, [rooms, property]);

  const activeTenancies = useMemo(() => {
    return tenancies.filter((t) => t.status === "ACTIVE" || t.status === "PENDING");
  }, [tenancies]);

  const occupiedBedsCount = activeTenancies.length;
  const vacantBedsCount = Math.max(0, totalCapacityBeds - occupiedBedsCount);
  const occupancyPercentage = totalCapacityBeds > 0
    ? Math.round((occupiedBedsCount / totalCapacityBeds) * 100)
    : 0;

  const totalMonthlyRoll = useMemo(() => {
    return activeTenancies.reduce((sum, t) => sum + Number(t.monthlyRent || property.priceMonthly || 4500), 0);
  }, [activeTenancies, property.priceMonthly]);

  const nsfasCount = useMemo(() => {
    return activeTenancies.filter(
      (t) => t.student?.studentProfile?.fundingType === "NSFAS"
    ).length;
  }, [activeTenancies]);

  const bursaryCount = useMemo(() => {
    return activeTenancies.filter(
      (t) => t.student?.studentProfile?.fundingType === "BURSARY"
    ).length;
  }, [activeTenancies]);

  const cashCount = Math.max(0, activeTenancies.length - nsfasCount - bursaryCount);

  // Filtered Table Rows
  const filteredTenancies = useMemo(() => {
    return tenancies.filter((t) => {
      // Room Type filter
      if (selectedRoomTypeFilter !== "ALL") {
        const matchesRoom =
          t.roomType === selectedRoomTypeFilter ||
          (t.roomName && t.roomName.toLowerCase().includes(selectedRoomTypeFilter.toLowerCase()));
        if (!matchesRoom) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && t.status !== statusFilter) {
        return false;
      }

      // Funding filter
      if (fundingFilter !== "ALL") {
        const fType = t.student?.studentProfile?.fundingType || "SELF_FUNDED";
        if (fundingFilter === "NSFAS" && fType !== "NSFAS") return false;
        if (fundingFilter === "BURSARY" && fType !== "BURSARY") return false;
        if (fundingFilter === "SELF_FUNDED" && fType !== "SELF_FUNDED" && fType !== "CASH") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = `${t.student?.name || ""} ${t.student?.surname || ""}`.toLowerCase();
        const studentNum = (t.student?.studentProfile?.studentNumber || "").toLowerCase();
        const email = (t.student?.email || "").toLowerCase();
        const roomName = (t.roomName || "").toLowerCase();
        const uni = (t.student?.studentProfile?.universityName || t.student?.institutionName || "").toLowerCase();

        return (
          studentName.includes(q) ||
          studentNum.includes(q) ||
          email.includes(q) ||
          roomName.includes(q) ||
          uni.includes(q)
        );
      }

      return true;
    });
  }, [tenancies, selectedRoomTypeFilter, statusFilter, fundingFilter, searchQuery]);

  // Handle Opening Edit Modal
  const handleOpenEdit = (tenancy: TenancyRecord) => {
    setActiveTenancy(tenancy);
    setEditForm({
      roomName: tenancy.roomName || "Standard Room",
      roomType: tenancy.roomType || "SINGLE_STANDARD",
      monthlyRent: Number(tenancy.monthlyRent || property.priceMonthly || 4500),
      deposit: Number(tenancy.deposit || 0),
      startDate: tenancy.startDate
        ? new Date(tenancy.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: tenancy.endDate
        ? new Date(tenancy.endDate).toISOString().split("T")[0]
        : "",
      status: tenancy.status,
    });
    setShowEditModal(true);
  };

  // Handle Save Edit Tenancy
  const handleSaveEdit = async () => {
    if (!activeTenancy) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/tenancy/${activeTenancy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update tenancy");

      // Optimistically update local state
      setTenancies((prev) =>
        prev.map((t) => (t.id === activeTenancy.id ? { ...t, ...data.tenancy } : t))
      );

      setShowEditModal(false);
      setActiveTenancy(null);
    } catch (err: any) {
      alert(err.message || "Failed to update tenancy");
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle End / Terminate Tenancy
  const handleConfirmEndTenancy = async () => {
    if (!activeTenancy) return;

    try {
      const res = await fetch(`/api/tenancy/${activeTenancy.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end tenancy");

      // Mark as ENDED in local state
      setTenancies((prev) =>
        prev.map((t) => (t.id === activeTenancy.id ? { ...t, status: "ENDED" } : t))
      );

      setShowEndModal(false);
      setActiveTenancy(null);
    } catch (err: any) {
      alert(err.message || "Failed to end tenancy");
    }
  };

  // Handle Create / Assign Tenancy
  const handleSaveAssign = async () => {
    setSavingAssign(true);
    setAssignError(null);

    try {
      const payload: any = {
        propertyId: property.id,
        roomName: `${assignForm.roomName} - ${assignForm.bedNumber}`,
        roomType: assignForm.roomType,
        monthlyRent: Number(assignForm.monthlyRent),
        deposit: Number(assignForm.deposit),
        startDate: assignForm.startDate,
        endDate: assignForm.endDate || undefined,
        status: assignForm.status,
      };

      if (assignForm.mode === "existing") {
        if (!assignForm.studentId) {
          throw new Error("Please select a registered student from the list.");
        }
        payload.studentId = assignForm.studentId;
      } else {
        if (!assignForm.name || !assignForm.surname || !assignForm.email) {
          throw new Error("Please fill in the student's name, surname, and email.");
        }
        payload.name = assignForm.name;
        payload.surname = assignForm.surname;
        payload.email = assignForm.email;
        payload.phone = assignForm.phone;
        payload.studentNumber = assignForm.studentNumber;
        payload.universityName = assignForm.universityName;
        payload.fundingType = assignForm.fundingType;
        payload.funderReference = assignForm.funderReference;
      }

      const res = await fetch("/api/tenancy/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign student.");

      // Add newly assigned tenancy to local state
      setTenancies((prev) => [data.tenancy, ...prev]);

      setShowAssignModal(false);
      // Reset form
      setAssignForm({
        mode: "existing",
        studentId: "",
        name: "",
        surname: "",
        email: "",
        phone: "",
        studentNumber: "",
        universityName: property.institution || "University of the Witwatersrand",
        fundingType: "NSFAS",
        funderReference: "",
        roomName: rooms.length > 0 ? rooms[0].name : "Standard Room",
        roomType: rooms.length > 0 ? rooms[0].type : "SINGLE_STANDARD",
        bedNumber: "Bed 1",
        monthlyRent: rooms.length > 0 ? rooms[0].monthlyPrice : Number(property.priceMonthly || 4500),
        deposit: 0,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0],
        status: "ACTIVE",
      });
    } catch (err: any) {
      setAssignError(err.message || "Failed to assign student.");
    } finally {
      setSavingAssign(false);
    }
  };

  const isNsfasAccredited =
    (property.amenities && property.amenities.includes("NSFAS_ACCREDITED")) ||
    (property.description && /nsfas accredited/i.test(property.description));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-poppins">
      
      {/* 1. Header & Navigation Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/landlord/tenancies"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#005F56] transition-colors"
            >
              <LuChevronLeft className="w-4 h-4" />
              <span>Back to Tenancy Hub</span>
            </Link>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              Residence Unit Allocation
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {property.title} — Tenancy Management
            </h1>
            {isNsfasAccredited && (
              <span className="px-2.5 py-0.5 rounded-md bg-[#005F56]/10 text-[#005F56] border border-[#005F56]/20 text-xs font-bold flex items-center gap-1">
                <LuShieldCheck className="w-3.5 h-3.5" /> NSFAS Accredited
              </span>
            )}
            {property.safetyScore && (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                Safety Score: {Number(property.safetyScore).toFixed(1)}/10
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <LuMapPin className="w-4 h-4 text-[#005F56] shrink-0" />
            <span>{property.address}, {property.suburb}, {property.city}</span>
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Link
            href={`/landlord/properties/${property.id}/preview`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-[#005F56] bg-white text-slate-700 hover:text-[#005F56] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <LuEye className="w-4 h-4" />
            <span>Preview Public View</span>
          </Link>

          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-[#005F56] bg-white text-slate-700 hover:text-[#005F56] text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <LuPencil className="w-3.5 h-3.5" />
            <span>Edit Property Specs</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setAssignError(null);
              setShowAssignModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-md shadow-[#005F56]/20 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Assign Student</span>
          </button>
        </div>
      </div>

      {/* 2. Analytics Overview Metrics (4 Grid Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Metric 1: Capacity & Beds */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <LuBed className="w-3.5 h-3.5 text-[#005F56]" /> Total Residence Capacity
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalCapacityBeds}
            </span>
            <span className="text-xs font-bold text-slate-500">Student Beds</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Across {rooms.length} room layout configuration{rooms.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Metric 2: Occupancy Rate */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <LuUserCheck className="w-3.5 h-3.5 text-blue-600" /> Active Placement
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {occupiedBedsCount}
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {occupancyPercentage}% Full
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
            <div
              className="h-full bg-[#005F56] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, occupancyPercentage)}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Vacancy / Available */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <LuSparkles className="w-3.5 h-3.5 text-amber-500" /> Vacant Beds Ready
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {vacantBedsCount}
            </span>
            <span className="text-xs font-bold text-slate-500">Available</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {vacantBedsCount > 0 ? "Ready for student assignment" : "Residence fully occupied"}
          </span>
        </div>

        {/* Metric 4: Monthly Rent Roll */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <LuDollarSign className="w-3.5 h-3.5 text-purple-600" /> Monthly Inflow
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              R {totalMonthlyRoll.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">/ mo</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {nsfasCount} NSFAS • {bursaryCount} Bursary • {cashCount} Cash
          </span>
        </div>

      </div>

      {/* 3. Interactive Room Types Filter Tiles */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <LuLayers className="w-4 h-4 text-[#005F56]" />
              <span>Room Type Configurations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any room tile to filter assigned student tenants and view individual room occupancy.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            {rooms.length} Layout Option{rooms.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          
          {/* 'All Rooms' Master Tile */}
          <button
            type="button"
            onClick={() => setSelectedRoomTypeFilter("ALL")}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
              selectedRoomTypeFilter === "ALL"
                ? "border-[#005F56] bg-[#005F56]/5 ring-2 ring-[#005F56]/20 shadow-xs"
                : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">All Room Types</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#005F56]" />
            </div>

            <div>
              <span className="text-xl font-black text-slate-900 block">
                {occupiedBedsCount} / {totalCapacityBeds} Beds
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {vacantBedsCount} Vacant Slots
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
              <span>View Combined Roster</span>
              <LuChevronLeft className="w-3.5 h-3.5 rotate-180 text-[#005F56]" />
            </div>
          </button>

          {/* Individual Room Type Tiles */}
          {rooms.map((room, idx) => {
            const isSelected = selectedRoomTypeFilter === room.type || selectedRoomTypeFilter === room.name;
            const tenanciesInRoom = activeTenancies.filter(
              (t) =>
                t.roomType === room.type ||
                t.roomName?.toLowerCase().includes(room.name.toLowerCase())
            );
            const occupiedInRoom = tenanciesInRoom.length;
            const vacantInRoom = Math.max(0, room.totalBeds - occupiedInRoom);

            return (
              <button
                key={room.id || idx}
                type="button"
                onClick={() => setSelectedRoomTypeFilter(isSelected ? "ALL" : room.type)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "border-[#005F56] bg-[#005F56]/5 ring-2 ring-[#005F56]/20 shadow-xs"
                    : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate" title={room.name}>
                    {room.name}
                  </span>
                  {room.isNsfasCapped && (
                    <span className="text-[9px] font-bold text-[#005F56] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      NSFAS
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">
                      {occupiedInRoom} / {room.totalBeds}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Beds Occupied</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
                    {vacantInRoom} Available (R{room.monthlyPrice.toLocaleString()}/mo)
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{room.bathroomLabel}</span>
                  <span className="font-bold text-[#005F56]">{isSelected ? "Filtering ✓" : "Filter →"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Assigned Students Table Listing (Full CRUD) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        
        {/* Table Top Controls & Search Bar */}
        <div className="p-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LuUsers className="w-4 h-4 text-[#005F56]" />
                <span>Assigned Student Tenant Roster</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  {filteredTenancies.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete directory of enrolled students with bed numbers, lease duration, and bursar payment status.
              </p>
            </div>

            {selectedRoomTypeFilter !== "ALL" && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-800">
                <span>Filtering by: <strong>{selectedRoomTypeFilter}</strong></span>
                <button
                  type="button"
                  onClick={() => setSelectedRoomTypeFilter("ALL")}
                  className="p-1 hover:bg-emerald-200 rounded-md cursor-pointer"
                >
                  <LuX className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, student #, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
              />
            </div>

            {/* Funding Filter */}
            <div>
              <select
                value={fundingFilter}
                onChange={(e) => setFundingFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
              >
                <option value="ALL">All Funding Schemes</option>
                <option value="NSFAS">NSFAS Allowance (Direct)</option>
                <option value="BURSARY">Corporate / Foundation Bursary</option>
                <option value="SELF_FUNDED">Cash / Private Self-Funded</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
              >
                <option value="ALL">All Tenancy Statuses</option>
                <option value="ACTIVE">Active Tenancy</option>
                <option value="PENDING">Pending Move-In</option>
                <option value="ENDED">Ended / Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredTenancies.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <LuUsers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Student Tenants Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "ALL" || fundingFilter !== "ALL" || selectedRoomTypeFilter !== "ALL"
                ? "No tenancies match your search and filter criteria. Try resetting filters."
                : "No students have been assigned to this residence yet. Click '+ Assign Student' to allocate your first student."}
            </p>
            <button
              type="button"
              onClick={() => {
                setAssignError(null);
                setShowAssignModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#005F56] text-white text-xs font-bold hover:bg-[#004d46] transition-colors cursor-pointer mt-2"
            >
              <LuPlus className="w-4 h-4" />
              <span>Assign First Student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student Learner</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Room &amp; Bed Allocated</th>
                  <th className="py-3.5 px-4">Funding Source</th>
                  <th className="py-3.5 px-4">Lease Term</th>
                  <th className="py-3.5 px-4">Monthly Rate</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenancies.map((tenancy) => {
                  const studentName = `${tenancy.student?.name || "Student"} ${tenancy.student?.surname || ""}`.trim();
                  const studentNumber = tenancy.student?.studentProfile?.studentNumber || "N/A";
                  const university = tenancy.student?.studentProfile?.universityName || tenancy.student?.institutionName || "Higher Education";
                  const fundingType = tenancy.student?.studentProfile?.fundingType || "NSFAS";
                  const monthlyRent = Number(tenancy.monthlyRent || property.priceMonthly || 4500);

                  const startFormatted = tenancy.startDate
                    ? new Date(tenancy.startDate).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
                    : "Immediate";
                  const endFormatted = tenancy.endDate
                    ? new Date(tenancy.endDate).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })
                    : "Open Lease";

                  return (
                    <tr key={tenancy.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Column 1: Student Name & Number */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#005F56]/10 text-[#005F56] font-extrabold text-xs flex items-center justify-center border border-[#005F56]/20 shrink-0">
                            {studentName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{studentName}</span>
                            <span className="text-[11px] text-slate-500 block">
                              Std No: {studentNumber} • {university}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Contact Info */}
                      <td className="py-4 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <LuMail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[140px]">{tenancy.student?.email}</span>
                        </div>
                        {tenancy.student?.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <LuPhone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{tenancy.student?.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Room & Bed Allocation */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {tenancy.roomName || "Standard Unit"}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded inline-block mt-0.5">
                            {tenancy.roomType ? tenancy.roomType.replace(/_/g, " ") : "Single Standard"}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Funding Source */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            fundingType === "NSFAS"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : fundingType === "BURSARY"
                              ? "bg-purple-50 text-purple-800 border border-purple-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <LuGraduationCap className="w-3.5 h-3.5" />
                          <span>{fundingType} Direct</span>
                        </span>
                      </td>

                      {/* Column 5: Lease Term */}
                      <td className="py-4 px-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <LuCalendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{startFormatted}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block pl-5">
                          to {endFormatted}
                        </span>
                      </td>

                      {/* Column 6: Monthly Rent */}
                      <td className="py-4 px-4">
                        <span className="font-black text-slate-900 block">
                          R {monthlyRent.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">per bed / mo</span>
                      </td>

                      {/* Column 7: Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            tenancy.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : tenancy.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {tenancy.status === "ACTIVE" && <LuCheck className="w-3 h-3" />}
                          <span>{tenancy.status}</span>
                        </span>
                      </td>

                      {/* Column 8: CRUD Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTenancy(tenancy);
                              setShowViewModal(true);
                            }}
                            title="View Full Student & Tenancy Details"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-[#005F56]/10 hover:text-[#005F56] text-slate-700 transition-colors cursor-pointer"
                          >
                            <LuEye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tenancy)}
                            title="Edit Room / Lease Allocation"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors cursor-pointer"
                          >
                            <LuPencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete / End */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTenancy(tenancy);
                              setShowEndModal(true);
                            }}
                            title="End Tenancy & Release Bed"
                            className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 transition-colors cursor-pointer"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSIGN STUDENT TO ROOM (CREATE FLOW) */}
      {/* ========================================================================= */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LuPlus className="w-4 h-4 text-[#005F56]" />
                  <span>Assign Student to Residence Bed</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocate a verified student to a specific room layout in {property.title}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              
              {assignError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <LuShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{assignError}</span>
                </div>
              )}

              {/* Student Mode Selector (Pick from registered vs new entry) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Student Selection Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAssignForm((p) => ({ ...p, mode: "existing" }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      assignForm.mode === "existing"
                        ? "border-[#005F56] bg-[#005F56]/10 text-[#005F56]"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Select Registered Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssignForm((p) => ({ ...p, mode: "new" }))}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      assignForm.mode === "new"
                        ? "border-[#005F56] bg-[#005F56]/10 text-[#005F56]"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    Enter New Student Profile
                  </button>
                </div>
              </div>

              {/* Mode 1: Select Registered Student */}
              {assignForm.mode === "existing" && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Choose Registered Student
                  </label>
                  <select
                    value={assignForm.studentId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      const found = allStudents.find((s) => s.id === sId);
                      setAssignForm((prev) => ({
                        ...prev,
                        studentId: sId,
                        fundingType: found?.studentProfile?.fundingType || "NSFAS",
                        universityName: found?.studentProfile?.universityName || found?.institutionName || prev.universityName,
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-[#005F56]/20 focus:border-[#005F56]"
                  >
                    <option value="">-- Select a registered student --</option>
                    {allStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.surname} ({s.email}) — {s.studentProfile?.studentNumber || "No Std No"} [{s.studentProfile?.fundingType || "NSFAS"}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mode 2: Enter New Student Details */}
              {assignForm.mode === "new" && (
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Lerato"
                        value={assignForm.name}
                        onChange={(e) => setAssignForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Surname *</label>
                      <input
                        type="text"
                        placeholder="e.g. Nkosi"
                        value={assignForm.surname}
                        onChange={(e) => setAssignForm((p) => ({ ...p, surname: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Email *</label>
                      <input
                        type="email"
                        placeholder="student@students.wits.ac.za"
                        value={assignForm.email}
                        onChange={(e) => setAssignForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="+27 82 123 4567"
                        value={assignForm.phone}
                        onChange={(e) => setAssignForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Student Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 2489102"
                        value={assignForm.studentNumber}
                        onChange={(e) => setAssignForm((p) => ({ ...p, studentNumber: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Funding Scheme</label>
                      <select
                        value={assignForm.fundingType}
                        onChange={(e) => setAssignForm((p) => ({ ...p, fundingType: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
                      >
                        <option value="NSFAS">NSFAS Direct Allowance</option>
                        <option value="BURSARY">Corporate Bursary</option>
                        <option value="SELF_FUNDED">Private Cash / Self-Funded</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Room & Bed Allocation Selectors */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                  Room &amp; Bed Slot Selection
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Room Configuration *</label>
                    <select
                      value={assignForm.roomName}
                      onChange={(e) => {
                        const chosenName = e.target.value;
                        const found = rooms.find((r) => r.name === chosenName);
                        setAssignForm((prev) => ({
                          ...prev,
                          roomName: chosenName,
                          roomType: found?.type || "SINGLE_STANDARD",
                          monthlyRent: found?.monthlyPrice || prev.monthlyRent,
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
                    >
                      {rooms.map((r, i) => (
                        <option key={r.id || i} value={r.name}>
                          {r.name} — R{r.monthlyPrice.toLocaleString()}/mo ({r.totalBeds} Beds)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Bed Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bed 1, Bed 2, Bed A"
                      value={assignForm.bedNumber}
                      onChange={(e) => setAssignForm((p) => ({ ...p, bedNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Rent (ZAR) *</label>
                    <input
                      type="number"
                      value={assignForm.monthlyRent}
                      onChange={(e) => setAssignForm((p) => ({ ...p, monthlyRent: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Deposit Amount (ZAR)</label>
                    <input
                      type="number"
                      value={assignForm.deposit}
                      onChange={(e) => setAssignForm((p) => ({ ...p, deposit: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lease Start Date *</label>
                    <input
                      type="date"
                      value={assignForm.startDate}
                      onChange={(e) => setAssignForm((p) => ({ ...p, startDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Lease End Date</label>
                    <input
                      type="date"
                      value={assignForm.endDate}
                      onChange={(e) => setAssignForm((p) => ({ ...p, endDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingAssign}
                onClick={handleSaveAssign}
                className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                {savingAssign ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Allocating Bed...</span>
                  </>
                ) : (
                  <>
                    <LuCheck className="w-4 h-4" />
                    <span>Confirm &amp; Allocate Bed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT TENANCY MODAL (UPDATE FLOW) */}
      {/* ========================================================================= */}
      {showEditModal && activeTenancy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Tenancy: {activeTenancy.student?.name} {activeTenancy.student?.surname}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update assigned unit, monthly rent, or lease dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Room / Bed Name</label>
                <input
                  type="text"
                  value={editForm.roomName}
                  onChange={(e) => setEditForm((p) => ({ ...p, roomName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Rent (ZAR)</label>
                  <input
                    type="number"
                    value={editForm.monthlyRent}
                    onChange={(e) => setEditForm((p) => ({ ...p, monthlyRent: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tenancy Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-medium focus:outline-none focus:border-[#005F56]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ENDED">ENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#005F56]"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-6 py-2.5 rounded-lg bg-[#005F56] hover:bg-[#004d46] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW STUDENT PROFILE & CONFIRMATION LETTER (READ FLOW) */}
      {/* ========================================================================= */}
      {showViewModal && activeTenancy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 bg-[#005F56] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                  Student Tenancy Profile
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {activeTenancy.student?.name} {activeTenancy.student?.surname}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Academic Registration</span>
                  <span className="text-[#005F56] bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                    Verified Student
                  </span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div>Institution: <strong>{activeTenancy.student?.studentProfile?.universityName || activeTenancy.student?.institutionName || "Wits University"}</strong></div>
                  <div>Student Number: <strong>{activeTenancy.student?.studentProfile?.studentNumber || "2489102"}</strong></div>
                  <div>Email: <strong>{activeTenancy.student?.email}</strong></div>
                  <div>Phone: <strong>{activeTenancy.student?.phone || "+27 82 123 4567"}</strong></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Room &amp; Lease Terms</span>
                  <span className="text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">
                    {activeTenancy.status}
                  </span>
                </div>
                <div className="text-slate-600 space-y-1">
                  <div>Residence: <strong>{property.title}</strong></div>
                  <div>Allocated Room: <strong>{activeTenancy.roomName}</strong></div>
                  <div>Monthly Rent: <strong>R {Number(activeTenancy.monthlyRent || property.priceMonthly).toLocaleString()} / mo</strong></div>
                  <div>Funding Scheme: <strong>{activeTenancy.student?.studentProfile?.fundingType || "NSFAS Direct Allowance"}</strong></div>
                </div>
              </div>

            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: END TENANCY CONFIRMATION (DELETE FLOW) */}
      {/* ========================================================================= */}
      {showEndModal && activeTenancy && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <LuShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Terminate Tenancy Agreement?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to end the tenancy for{" "}
                <strong>{activeTenancy.student?.name} {activeTenancy.student?.surname}</strong> in{" "}
                <strong>{activeTenancy.roomName}</strong>?
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                This will release the bed slot back into the vacant pool for immediate student placement.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEndTenancy}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, End Tenancy
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

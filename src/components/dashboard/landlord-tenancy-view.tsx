"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  LuChevronRight,
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
} from "react-icons/lu";
import { extractRoomsFromProperty, type ParsedRoom } from "@/lib/rooms";

interface LandlordTenancyViewProps {
  properties: any[];
  initialSelectedPropertyId?: string;
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function LandlordTenancyView({
  properties,
  initialSelectedPropertyId,
  user,
}: LandlordTenancyViewProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialSelectedPropertyId || (properties.length > 0 ? properties[0].id : "")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [fundingFilter, setFundingFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) || properties[0] || null;
  }, [properties, selectedPropertyId]);

  // Aggregate all tenancies across all properties
  const allTenancies = useMemo(() => {
    return properties.flatMap((p) =>
      (p.tenancies || []).map((t: any) => ({
        ...t,
        propertyTitle: p.title,
        propertyAddress: p.address,
        propertySuburb: p.suburb,
        propertyCity: p.city,
      }))
    );
  }, [properties]);

  // Filtered tenancies for the current view
  const displayedTenancies = useMemo(() => {
    let list = selectedPropertyId === "ALL"
      ? allTenancies
      : (selectedProperty?.tenancies || []).map((t: any) => ({
          ...t,
          propertyTitle: selectedProperty?.title,
          propertyAddress: selectedProperty?.address,
          propertySuburb: selectedProperty?.suburb,
          propertyCity: selectedProperty?.city,
        }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.student?.name?.toLowerCase().includes(q) ||
          t.student?.surname?.toLowerCase().includes(q) ||
          t.student?.email?.toLowerCase().includes(q) ||
          t.student?.studentProfile?.studentNumber?.toLowerCase().includes(q) ||
          t.roomName?.toLowerCase().includes(q) ||
          t.roomType?.toLowerCase().includes(q)
      );
    }

    if (fundingFilter !== "ALL") {
      list = list.filter(
        (t: any) => t.student?.studentProfile?.fundingType === fundingFilter
      );
    }

    if (statusFilter !== "ALL") {
      list = list.filter((t: any) => t.status === statusFilter);
    }

    return list;
  }, [allTenancies, selectedProperty, selectedPropertyId, searchQuery, fundingFilter, statusFilter]);

  // Extract rooms for selected property
  const selectedPropertyRooms: ParsedRoom[] = useMemo(() => {
    if (!selectedProperty) return [];
    return extractRoomsFromProperty(selectedProperty);
  }, [selectedProperty]);

  // Build room-by-room slots
  const roomSlots = useMemo(() => {
    if (!selectedProperty || selectedPropertyId === "ALL") return [];
    const tenancies = selectedProperty.tenancies || [];
    const assignedTenancyIds = new Set<string>();

    const slots: Array<{
      slotId: string;
      roomName: string;
      roomType: string;
      typeName: string;
      bathroomLabel: string;
      monthlyPrice: number;
      isNsfasCapped: boolean;
      bedNumber: number;
      totalBedsInRoom: number;
      assignedTenancy: any | null;
    }> = [];

    // Pass 1: Build slots and match direct room type / room name tenancies
    selectedPropertyRooms.forEach((r) => {
      const matchingTenancies = tenancies.filter(
        (t: any) =>
          !assignedTenancyIds.has(t.id) &&
          (t.roomName === r.name ||
            t.roomType === r.type ||
            (t.roomName && t.roomName.toLowerCase().includes(r.name.toLowerCase())))
      );

      let roomMatchIdx = 0;
      for (let unit = 1; unit <= r.quantity; unit++) {
        const unitName = r.quantity > 1 ? `${r.name} (Unit ${unit})` : r.name;
        for (let bed = 1; bed <= r.bedsPerRoom; bed++) {
          const assigned = matchingTenancies[roomMatchIdx] || null;
          if (assigned) {
            assignedTenancyIds.add(assigned.id);
            roomMatchIdx++;
          }

          slots.push({
            slotId: `${r.id}-unit-${unit}-bed-${bed}`,
            roomName: r.bedsPerRoom > 1 ? `${unitName} - Bed ${bed}` : unitName,
            roomType: r.type,
            typeName: r.typeName,
            bathroomLabel: r.bathroomLabel,
            monthlyPrice: r.monthlyPrice,
            isNsfasCapped: r.isNsfasCapped,
            bedNumber: bed,
            totalBedsInRoom: r.bedsPerRoom,
            assignedTenancy: assigned,
          });
        }
      }
    });

    // Pass 2: Assign any remaining unallocated tenancies to first vacant slots
    const remainingTenancies = tenancies.filter((t: any) => !assignedTenancyIds.has(t.id));
    let remIdx = 0;
    for (const slot of slots) {
      if (!slot.assignedTenancy && remIdx < remainingTenancies.length) {
        slot.assignedTenancy = remainingTenancies[remIdx];
        assignedTenancyIds.add(remainingTenancies[remIdx].id);
        remIdx++;
      }
    }

    return slots;
  }, [selectedProperty, selectedPropertyId, selectedPropertyRooms]);

  // Portfolio-wide KPI calculations
  const totalPortfolioBeds = properties.reduce(
    (sum, p) => sum + (p.maxOccupants || p.bedrooms || 1),
    0
  );
  const totalOccupiedBeds = allTenancies.length;
  const portfolioOccupancy = totalPortfolioBeds > 0
    ? Math.round((totalOccupiedBeds / totalPortfolioBeds) * 100)
    : 0;

  const totalMonthlyInflow = allTenancies.reduce(
    (sum, t) => sum + Number(t.monthlyRent || t.property?.priceMonthly || 4500),
    0
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-poppins">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              Tenancy &amp; Lease Allocation
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs font-semibold text-gray-500">
              {allTenancies.length} Student Tenant{allTenancies.length !== 1 ? "s" : ""} Placed
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Learner Tenancy Management &amp; Room Allocations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Select any property to view assigned learners, room assignments, NSFAS funding confirmation, and available student beds.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Add New Residence</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <LuBed className="w-3.5 h-3.5 text-emerald-600" /> Total Student Beds
          </span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {totalPortfolioBeds} Beds
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Across {properties.length} residence listing{properties.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <LuUserCheck className="w-3.5 h-3.5 text-blue-600" /> Active Tenants
          </span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {totalOccupiedBeds} Placed
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            {portfolioOccupancy}% Portfolio Occupancy
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <LuAward className="w-3.5 h-3.5 text-purple-600" /> NSFAS-Funded
          </span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">
            {allTenancies.filter((t) => t.student?.studentProfile?.fundingType === "NSFAS").length} Direct
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Guaranteed bursary allowance
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <LuDollarSign className="w-3.5 h-3.5 text-emerald-600" /> Monthly Revenue
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            R {totalMonthlyInflow.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500 mt-0.5 block">
            Active lease gross rent
          </span>
        </div>
      </div>

      {/* ================= RESIDENCES PROPERTY SELECTOR BAR ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <LuBuilding2 className="w-3.5 h-3.5 text-emerald-600" />
            Select Residence to View Room Tenants ({properties.length})
          </h2>
          <span className="text-[11px] text-gray-400">Click a property card below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {properties.map((p) => {
            const isSelected = selectedPropertyId === p.id;
            const pBeds = p.maxOccupants || p.bedrooms || 1;
            const pTenants = p.tenancies?.length || 0;
            const pRate = Math.round((pTenants / pBeds) * 100);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPropertyId(p.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? "bg-emerald-50/70 border-emerald-600 shadow-xs ring-2 ring-emerald-500/20"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 truncate">
                    <h3 className={`text-xs font-bold truncate ${isSelected ? "text-emerald-950" : "text-gray-900"}`}>
                      {p.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {p.suburb}, {p.city}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                      <LuCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
                  <span className="font-semibold text-gray-600 flex items-center gap-1">
                    <LuUsers className="w-3 h-3 text-gray-400" />
                    <span>{pTenants} / {pBeds} Beds</span>
                  </span>
                  <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                    pRate >= 100 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {pRate}% Full
                  </span>
                </div>
              </button>
            );
          })}

          {/* All Properties Option */}
          <button
            type="button"
            onClick={() => setSelectedPropertyId("ALL")}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              selectedPropertyId === "ALL"
                ? "bg-emerald-50/70 border-emerald-600 shadow-xs ring-2 ring-emerald-500/20"
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div>
              <h3 className="text-xs font-bold text-gray-900">All Residences</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Combined tenant roster</p>
            </div>
            <div className="text-[11px] font-bold text-emerald-700 pt-2">
              {allTenancies.length} Total Tenants →
            </div>
          </button>
        </div>
      </div>

      {/* ================= VISUAL ROOM-BY-ROOM OCCUPANCY MAP ================= */}
      {selectedPropertyId !== "ALL" && selectedProperty && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Room Allocation Map
                </span>
                <span className="text-xs text-gray-300">•</span>
                <span className="text-xs font-semibold text-gray-600">{selectedProperty.title}</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">
                Learners Assigned to Rooms &amp; Bed Availability
              </h2>
              <p className="text-xs text-gray-500">
                Real-time occupancy status showing which student learner is placed in which specific room.
              </p>
            </div>

            <Link
              href={`/landlord/properties/${selectedProperty.id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 shrink-0"
            >
              <span>View Property Specs</span>
              <LuArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {roomSlots.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-gray-200 text-gray-400 text-xs">
              No rooms configured for this property yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomSlots.map((slot) => {
                const isOccupied = !!slot.assignedTenancy;
                const student = slot.assignedTenancy?.student;
                const profile = student?.studentProfile;

                return (
                  <div
                    key={slot.slotId}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isOccupied
                        ? "bg-white border-emerald-200 shadow-2xs hover:border-emerald-300"
                        : "bg-gray-50/60 border-dashed border-gray-300"
                    }`}
                  >
                    <div>
                      {/* Room Badge Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">
                            {slot.roomName}
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            {slot.typeName} • {slot.bathroomLabel}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isOccupied
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isOccupied ? "Occupied" : "Vacant Bed"}
                        </span>
                      </div>

                      {/* Learner Info (If Occupied) */}
                      {isOccupied && student ? (
                        <div className="mt-3 p-3 rounded-xl bg-[#F8FAFC] border border-gray-100 space-y-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                              {student.name?.[0] || "S"}{student.surname?.[0] || ""}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-gray-900 block text-xs truncate">
                                {student.name} {student.surname}
                              </span>
                              <span className="text-[10px] text-gray-400 block truncate">
                                {student.email}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] space-y-0.5 pt-1 border-t border-gray-200/60 text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Institution:</span>
                              <span className="font-semibold text-gray-800 truncate max-w-[140px]">
                                {profile?.universityName || "Wits University"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Funding:</span>
                              <span className="font-bold text-emerald-700">
                                {profile?.fundingType || "NSFAS"}
                              </span>
                            </div>
                            {profile?.studentNumber && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Student No:</span>
                                <span className="font-medium text-gray-700">#{profile.studentNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-4 rounded-xl border border-dashed border-gray-200 bg-white/70 text-center space-y-1">
                          <LuBed className="w-5 h-5 text-gray-400 mx-auto" />
                          <p className="text-xs font-semibold text-gray-600">Available for Move-In</p>
                          <p className="text-[10px] text-gray-400">R {slot.monthlyPrice.toLocaleString()} / month</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Row */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold text-gray-900">
                        R {slot.monthlyPrice.toLocaleString()}<span className="text-[10px] font-normal text-gray-400">/mo</span>
                      </span>

                      {isOccupied && slot.assignedTenancy?.confirmationLetter ? (
                        <Link
                          href={`/letters/${slot.assignedTenancy.confirmationLetter.id || slot.assignedTenancy.confirmationLetter.letterReference}`}
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <LuFileText className="w-3 h-3" />
                          <span>Letter Ready</span>
                        </Link>
                      ) : isOccupied ? (
                        <span className="text-[10px] text-gray-500 font-semibold">Lease Active</span>
                      ) : (
                        <Link
                          href="/dashboard/landlord#applications"
                          className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          Allocate Student →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= DETAILED TENANTS ROSTER TABLE ================= */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">All Registered Learners &amp; Tenancy Leases</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive roster of verified student tenancies, academic study details, and confirmation letters.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, room, #no..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-48"
              />
              <LuSearch className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={fundingFilter}
              onChange={(e) => setFundingFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Funders</option>
              <option value="NSFAS">NSFAS Direct</option>
              <option value="BURSARY">Institutional Bursary</option>
              <option value="SELF_FUNDED">Private / Self-Funded</option>
            </select>
          </div>
        </div>

        {displayedTenancies.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border-2 border-dashed border-gray-200 space-y-2">
            <LuUsers className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-sm font-bold text-gray-800">No matching tenants found</h3>
            <p className="text-xs text-gray-400">Try changing your search query or select another residence above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Learner / Tenant</th>
                  <th className="pb-3 px-4">Residence &amp; Assigned Room</th>
                  <th className="pb-3 px-4">University &amp; Study</th>
                  <th className="pb-3 px-4">Funding Scheme</th>
                  <th className="pb-3 px-4">Monthly Rent</th>
                  <th className="pb-3 px-4">Lease Period</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedTenancies.map((tenancy: any) => {
                  const student = tenancy.student || {};
                  const profile = student.studentProfile || {};

                  return (
                    <tr key={tenancy.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0">
                            {student.name?.[0] || "S"}{student.surname?.[0] || ""}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{student.name} {student.surname}</span>
                            <span className="text-[11px] text-gray-400 block">{student.email}</span>
                            {student.phone && (
                              <span className="text-[10px] text-gray-400 block">{student.phone}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 block">
                          {tenancy.propertyTitle || "Residence"}
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold block">
                          {tenancy.roomName || tenancy.roomType || "Standard Bedroom"}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {tenancy.propertySuburb}, {tenancy.propertyCity}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-gray-900 font-medium block">{profile.universityName || "Higher Education Institution"}</span>
                        <span className="text-[11px] text-gray-500 block">{profile.degreeProgram || "Undergraduate"}</span>
                        {profile.studentNumber && (
                          <span className="text-[10px] text-gray-400 block font-mono">#{profile.studentNumber}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px]">
                          <LuAward className="w-3 h-3 text-emerald-600" />
                          <span>{profile.fundingType || "NSFAS Direct"}</span>
                        </span>
                        {profile.funderReference && (
                          <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                            Ref: {profile.funderReference}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        R {Number(tenancy.monthlyRent || tenancy.property?.priceMonthly || 4800).toLocaleString()}
                        <span className="text-[10px] font-normal text-gray-400 block">/ bed per month</span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <span className="text-gray-700 font-medium block">
                          {new Date(tenancy.startDate).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}
                          {tenancy.endDate ? ` – ${new Date(tenancy.endDate).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })}` : " – Nov 2026"}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Active Academic Lease</span>
                      </td>

                      <td className="py-3.5 pl-4 text-right">
                        {tenancy.confirmationLetter ? (
                          <Link
                            href={`/letters/${tenancy.confirmationLetter.id || tenancy.confirmationLetter.letterReference}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 text-[11px] font-bold transition-colors"
                          >
                            <LuFileText className="w-3 h-3" />
                            <span>View Letter</span>
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-gray-400">
                            Active Tenancy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

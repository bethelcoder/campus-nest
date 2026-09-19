"use client";

import { useState, useMemo } from "react";
import {
  LuBuilding2,
  LuShieldCheck,
  LuMapPin,
  LuCheck,
  LuX,
  LuFlag,
} from "react-icons/lu";

export interface AdminPropertyItem {
  id: string;
  title: string;
  address: string;
  suburb: string;
  city: string;
  status: string;
  safetyScore: number | null;
  priceMonthly: number;
  bedrooms: number;
  landlordName: string;
  landlordEmail: string;
  activeReports: number;
  physicalInspectionAt: string | null;
}

type StatusFilter = "ALL" | "PENDING_VERIFICATION" | "VERIFIED" | "FLAGGED" | "REJECTED" | "DRAFT";

interface AdminPropertiesPanelProps {
  initialProperties: AdminPropertyItem[];
}

export default function AdminPropertiesPanel({ initialProperties }: AdminPropertiesPanelProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.landlordName.toLowerCase().includes(q) ||
        p.suburb.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [properties, statusFilter, searchTerm]);

  async function updateStatus(propertyId: string, status: "VERIFIED" | "FLAGGED" | "REJECTED" | "PENDING_VERIFICATION", verify = false, message?: string) {
    setUpdatingId(propertyId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, verify, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update property");

      setProperties((prev) =>
        prev.map((p) => (p.id === propertyId ? { ...p, status: data.property.status } : p))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update property");
    } finally {
      setUpdatingId(null);
    }
  }

  const verifiedCount = properties.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = properties.filter((p) => p.status === "PENDING_VERIFICATION").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
            Accreditation Registry
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
            Property Accreditation &amp; Compliance Registry
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Review safety scores, approve pending listings, and flag non-compliant residences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Listed</span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">{properties.length}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Accredited</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{verifiedCount}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingCount}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {(["ALL", "PENDING_VERIFICATION", "VERIFIED", "FLAGGED", "REJECTED", "DRAFT"] as StatusFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab ? "bg-slate-900 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "ALL" ? "All" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white min-w-[200px]"
        />
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">{error}</div>
      )}

      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <LuBuilding2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No properties match your filters</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((property) => {
            const scoreDisplay =
              property.safetyScore !== null ? Number(property.safetyScore).toFixed(1) : null;

            return (
              <div
                key={property.id}
                className={`p-6 rounded-2xl border bg-white shadow-xs ${
                  property.status === "FLAGGED"
                    ? "border-red-300"
                    : property.status === "VERIFIED"
                    ? "border-emerald-200"
                    : "border-[#E5E7EB]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          property.status === "VERIFIED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : property.status === "FLAGGED"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : property.status === "REJECTED"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {property.status.replace("_", " ")}
                      </span>
                      {scoreDisplay && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <LuShieldCheck className="w-3.5 h-3.5" />
                          {scoreDisplay} / 10
                        </span>
                      )}
                      {property.activeReports > 0 && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                          {property.activeReports} active report{property.activeReports > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{property.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <LuMapPin className="w-3.5 h-3.5 shrink-0" />
                      {property.address}, {property.suburb}, {property.city}
                    </p>
                    <p className="text-xs text-gray-600">
                      Operator: <strong>{property.landlordName}</strong> · {property.landlordEmail}
                    </p>
                    <p className="text-xs text-gray-500">
                      R {property.priceMonthly.toLocaleString()}/mo · {property.bedrooms} beds
                      {property.physicalInspectionAt && (
                        <> · Inspected {new Date(property.physicalInspectionAt).toLocaleDateString("en-ZA")}</>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {(property.status === "PENDING_VERIFICATION" || property.status === "DRAFT") && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "VERIFIED")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuCheck className="w-3.5 h-3.5" />
                        Accredit
                      </button>
                    )}
                    {property.status === "VERIFIED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "FLAGGED")}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuFlag className="w-3.5 h-3.5" />
                        Flag Violation
                      </button>
                    )}
                    {!property.physicalInspectionAt && property.status !== "REJECTED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, property.status as "VERIFIED" | "FLAGGED" | "PENDING_VERIFICATION", true)}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuShieldCheck className="w-3.5 h-3.5" />
                        Verify inspection
                      </button>
                    )}
                    {property.status !== "REJECTED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => {
                          const message = window.prompt("Optional message to the landlord:");
                          if (message !== null) updateStatus(property.id, property.status as "VERIFIED" | "FLAGGED" | "REJECTED" | "PENDING_VERIFICATION", false, message || undefined);
                        }}
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Message landlord
                      </button>
                    )}
                    {property.status === "FLAGGED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "VERIFIED")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuCheck className="w-3.5 h-3.5" />
                        Re-Accredit
                      </button>
                    )}
                    {property.status !== "REJECTED" && property.status !== "VERIFIED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "REJECTED")}
                        className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <LuX className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    )}
                    {property.status === "REJECTED" && (
                      <button
                        type="button"
                        disabled={updatingId === property.id}
                        onClick={() => updateStatus(property.id, "PENDING_VERIFICATION")}
                        className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-xs font-bold cursor-pointer"
                      >
                        Reopen Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

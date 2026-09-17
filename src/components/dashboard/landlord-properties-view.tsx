"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LuPlus,
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
  LuBed,
  LuUsers,
  LuSparkles,
  LuArrowUpRight,
  LuClock,
} from "react-icons/lu";

interface LandlordPropertiesViewProps {
  initialProperties: any[];
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

export default function LandlordPropertiesView({
  initialProperties,
  user,
}: LandlordPropertiesViewProps) {
  const [properties, setProperties] = useState<any[]>(initialProperties);

  const totalBeds = properties.reduce((sum, p) => sum + (p.bedrooms || 0), 0);
  const verifiedCount = properties.filter((p) => p.status === "VERIFIED").length;

  const handlePropertyCreated = (newProp: any) => {
    setProperties((prev) => [newProp, ...prev]);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              Portfolio Management
            </span>
            <span className="text-xs text-gray-400">
              {properties.length} Total Residence{properties.length !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] mt-1">
            My Student Housing Residences
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Add unlimited student accommodation listings, update room availability, and view safety compliance scores.
          </p>
        </div>

        <Link
          href="/landlord/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          <LuPlus className="w-4 h-4" />
          <span>Add New Residence</span>
        </Link>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Student Beds
          </span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">
            {totalBeds} Beds
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Across {properties.length} residence listing{properties.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Accredited Listings
          </span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">
            {verifiedCount} Verified
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            13-point safety inspection passed
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Active Applications
          </span>
          <span className="text-2xl font-black text-[#0F172A] mt-1 block">
            {properties.reduce((sum, p) => sum + (p.applications?.length || 0), 0)} Inbound
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Awaiting lease confirmation
          </span>
        </div>
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-white space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <LuBuilding2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No Residences Created Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Start building your student housing portfolio. You can add as many residences and room listings as you manage.
            </p>
          </div>
          <Link
            href="/landlord/properties/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            <span>Create First Residence Listing</span>
          </Link>
        </div>
      )}

      {/* Property Cards Grid */}
      {properties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => {
            const hasScore = property.safetyScore !== null && property.safetyScore !== undefined;
            const scoreNum = hasScore ? Number(property.safetyScore).toFixed(1) : null;

            return (
              <div
                key={property.id}
                className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        property.status === "VERIFIED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {property.status === "VERIFIED" ? "✓ Accredited" : "Pending Audit"}
                    </span>

                    {scoreNum && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <LuShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{scoreNum} / 10</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Address */}
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <LuMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{property.address}, {property.suburb}</span>
                    </p>
                  </div>

                  {/* Specs Pill Strip */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 font-medium">
                      <LuBed className="w-3.5 h-3.5 text-gray-400" />
                      <span>{property.bedrooms} Beds</span>
                    </span>

                    {property.distanceToCampus && (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-100 font-medium text-[11px]">
                        {Number(property.distanceToCampus).toFixed(1)} km to Campus
                      </span>
                    )}
                  </div>

                  {/* Amenities Preview */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {property.amenities.slice(0, 3).map((amenity: string) => (
                        <span
                          key={amenity}
                          className="text-[10px] font-semibold text-gray-500 bg-gray-100/70 px-2 py-0.5 rounded-md"
                        >
                          {amenity.replace("_", " ")}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="text-[10px] font-bold text-gray-400 px-1 py-0.5">
                          +{property.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Bottom Row */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Base Rental
                    </span>
                    <span className="text-sm font-extrabold text-gray-900">
                      R {Number(property.priceMonthly).toLocaleString()}
                      <span className="text-[10px] font-normal text-gray-500"> / bed</span>
                    </span>
                  </div>

                  <Link
                    href={`/landlord/properties/${property.id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                  >
                    <span>Manage</span>
                    <LuArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from "react";

export default function LandlordLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 animate-pulse font-poppins">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-24 h-4 rounded-md bg-slate-200" />
            <div className="w-64 h-7 rounded-md bg-slate-200" />
            <div className="w-96 h-4 rounded-md bg-slate-100" />
          </div>
          <div className="w-32 h-10 rounded-xl bg-slate-200" />
        </div>

        {/* Metrics Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
              <div className="w-24 h-3.5 rounded bg-slate-200" />
              <div className="w-16 h-7 rounded bg-slate-200" />
              <div className="w-32 h-3 rounded bg-slate-100" />
            </div>
          ))}
        </div>

        {/* Content Table Skeleton */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <div className="w-48 h-5 rounded bg-slate-200" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100/80 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

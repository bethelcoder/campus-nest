"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Room = { id: string; name: string; roomType: string; description: string | null; monthlyRent: string; availableUnits: number };

interface ApplyButtonProps {
  propertyId: string;
  hasApplied?: boolean;
}

export default function ApplyButton({ propertyId, hasApplied = false }: ApplyButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState("10 Months (Feb - Nov Academic Year)");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function openRooms() {
    setOpen(true);
    if (rooms.length) return;
    const response = await fetch(`/api/properties/${propertyId}/rooms`);
    const data = await response.json();
    if (!response.ok) {
      setState("error");
      setMessage(data.error || "Could not load rooms");
      return;
    }
    const fetchedRooms = data.rooms.map((room: Room) => ({ ...room, monthlyRent: String(room.monthlyRent) }));
    setRooms(fetchedRooms);
    if (fetchedRooms.length > 0) {
      setSelected(fetchedRooms[0].id);
    }
  }

  async function apply() {
    setState("loading");
    const body: Record<string, string> = { propertyId, duration };
    if (selected) body.roomListingId = selected;

    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      setState("error");
      setMessage(data.error || "Could not submit application");
      return;
    }
    setState("success");
    setMessage("Application submitted successfully!");
    startTransition(() => {
      router.refresh();
    });
  }

  if (hasApplied) {
    return (
      <Link
        href="/dashboard/student/applications"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span>Applied</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={openRooms}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#059669] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#047857] cursor-pointer"
      >
        Apply
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-30 mb-2 w-[min(340px,calc(100vw-3rem))] rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between gap-3 border-b border-[#F1F5F9] pb-2.5">
            <p className="text-sm font-bold text-[#0F172A]">Application Details</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              Close
            </button>
          </div>

          {state !== "success" ? (
            <>
              {/* Duration selector */}
              <div className="mt-3 space-y-1">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  Lease Duration / Applied Months
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-xl border border-[#CBD5E1] bg-white p-2.5 text-xs font-semibold text-[#0F172A] outline-none focus:border-[#059669]"
                >
                  <option value="10 Months (Feb - Nov Academic Year)">10 Months (Feb - Nov Academic Year)</option>
                  <option value="12 Months (Full Calendar Year Jan - Dec)">12 Months (Full Calendar Year Jan - Dec)</option>
                  <option value="6 Months (Semester 1 Feb - Jul)">6 Months (Semester 1 Feb - Jul)</option>
                  <option value="6 Months (Semester 2 Jul - Dec)">6 Months (Semester 2 Jul - Dec)</option>
                </select>
              </div>

              {/* Room selection */}
              <div className="mt-3 space-y-1">
                <label className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  Select Room Type
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                  {rooms.map((room) => (
                    <label
                      key={room.id}
                      className={`block cursor-pointer rounded-xl border p-2.5 transition-colors ${
                        selected === room.id ? "border-[#059669] bg-[#ECFDF5]" : "border-[#E5E7EB] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`room-${propertyId}`}
                          value={room.id}
                          checked={selected === room.id}
                          onChange={() => setSelected(room.id)}
                          className="accent-[#059669]"
                        />
                        <span className="text-xs font-bold text-[#0F172A]">
                          {room.name} · {room.roomType}
                        </span>
                      </div>
                      <span className="mt-0.5 block pl-5 text-[11px] text-[#64748B]">
                        R {Number(room.monthlyRent).toLocaleString("en-ZA")}/mo · {room.availableUnits} available
                      </span>
                    </label>
                  ))}
                  {!rooms.length && state !== "error" && (
                    <p className="text-xs text-[#64748B] py-1">Standard accredited room unit selected by default.</p>
                  )}
                </div>
              </div>

              {message && (
                <p className={`mt-3 text-xs font-medium ${state === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                  {message}
                </p>
              )}

              <button
                type="button"
                disabled={state === "loading"}
                onClick={apply}
                className="mt-3 w-full rounded-xl bg-[#059669] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#047857] disabled:bg-[#CBD5E1] cursor-pointer"
              >
                {state === "loading" ? "Submitting Application..." : "Submit Application"}
              </button>
            </>
          ) : (
            <div className="py-4 text-center space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-bold">
                ✓
              </div>
              <p className="text-xs font-bold text-[#0F172A]">{message}</p>
              <Link
                href="/dashboard/student/applications"
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#059669] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#047857]"
              >
                View in My Applications &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

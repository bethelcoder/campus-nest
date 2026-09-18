"use client";

import { useState } from "react";

type Room = { id?: string; name: string; roomType: string; description?: string | null; monthlyRent: number; availableUnits: number };
type Property = { id: string; title: string; rooms: Room[] };
type Application = { id: string; status: string; message: string | null; createdAt: string; property: { title: string }; roomListing: Room | null; student: { name: string; surname: string; email: string; universityEmail: string | null; studentNumber?: string; universityName?: string } };

export default function ApplicationsManager({ initialApplications, initialProperties }: { initialApplications: Application[]; initialProperties: Property[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [properties, setProperties] = useState(initialProperties);
  const [busy, setBusy] = useState("");
  const [roomForm, setRoomForm] = useState<Record<string, Room>>({});
  const [message, setMessage] = useState("");

  async function decide(applicationId: string, status: "ACCEPTED" | "REJECTED") {
    setBusy(applicationId);
    const response = await fetch("/api/landlord/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ applicationId, status }) });
    const data = await response.json();
    if (!response.ok) setMessage(data.error || "Could not update application");
    else setApplications((current) => current.map((application) => application.id === applicationId ? { ...application, status } : application));
    setBusy("");
  }

  async function addRoom(propertyId: string) {
    const form = roomForm[propertyId];
    if (!form?.name || !form.roomType || !form.monthlyRent) return;
    const response = await fetch(`/api/properties/${propertyId}/rooms`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Could not add room type"); return; }
    setProperties((current) => current.map((property) => property.id === propertyId ? { ...property, rooms: [...property.rooms, { ...data.room, monthlyRent: Number(data.room.monthlyRent) }] } : property));
    setRoomForm((current) => ({ ...current, [propertyId]: { name: "", roomType: "", monthlyRent: 0, availableUnits: 0 } }));
  }

  async function updateRoom(propertyId: string, room: Room) {
    if (!room.id) return;
    await fetch(`/api/properties/${propertyId}/rooms`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ roomId: room.id, availableUnits: room.availableUnits, monthlyRent: room.monthlyRent, name: room.name, roomType: room.roomType }) });
  }

  return <div className="space-y-7">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Landlord workspace</p><h1 className="mt-1 text-2xl font-bold text-[#0F172A]">Manage Applications</h1><p className="mt-2 text-sm text-[#64748B]">Review student profiles, selected room types, and decide who may move into your residences.</p></div>
    {message && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">{message}</p>}
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><h2 className="text-lg font-bold">Room availability</h2><p className="mt-1 text-sm text-[#64748B]">List room types and keep available spaces current before students apply.</p><div className="mt-5 space-y-5">{properties.map((property) => <div key={property.id} className="border-t border-[#F1F5F9] pt-4"><h3 className="font-bold">{property.title}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{property.rooms.map((room) => <div key={room.id} className="rounded-xl bg-[#F8FAFC] p-3"><p className="text-sm font-bold">{room.name} · {room.roomType}</p><div className="mt-2 flex items-center gap-2"><input type="number" min="0" value={room.availableUnits} onChange={(event) => setProperties((current) => current.map((item) => item.id === property.id ? { ...item, rooms: item.rooms.map((candidate) => candidate.id === room.id ? { ...candidate, availableUnits: Number(event.target.value) } : candidate) } : item))} className="h-9 w-24 rounded-lg border border-[#E5E7EB] px-2 text-sm" /><button type="button" onClick={() => updateRoom(property.id, room)} className="rounded-lg bg-[#0F172A] px-3 py-2 text-[11px] font-bold text-white">Update availability</button></div><p className="mt-2 text-xs text-[#64748B]">R {room.monthlyRent.toLocaleString("en-ZA")}/month</p></div>)}</div><div className="mt-4 grid gap-2 sm:grid-cols-5"><input placeholder="Room name" value={roomForm[property.id]?.name || ""} onChange={(event) => setRoomForm((current) => ({ ...current, [property.id]: { ...(current[property.id] || { roomType: "", monthlyRent: 0, availableUnits: 0 }), name: event.target.value } }))} className="h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs" /><input placeholder="Room type" value={roomForm[property.id]?.roomType || ""} onChange={(event) => setRoomForm((current) => ({ ...current, [property.id]: { ...(current[property.id] || { name: "", monthlyRent: 0, availableUnits: 0 }), roomType: event.target.value } }))} className="h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs" /><input type="number" placeholder="Rent" onChange={(event) => setRoomForm((current) => ({ ...current, [property.id]: { ...(current[property.id] || { name: "", roomType: "", availableUnits: 0 }), monthlyRent: Number(event.target.value) } }))} className="h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs" /><input type="number" min="0" placeholder="Available" onChange={(event) => setRoomForm((current) => ({ ...current, [property.id]: { ...(current[property.id] || { name: "", roomType: "", monthlyRent: 0 }), availableUnits: Number(event.target.value) } }))} className="h-9 rounded-lg border border-[#E5E7EB] px-2 text-xs" /><button type="button" onClick={() => addRoom(property.id)} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white">Add room type</button></div></div>)}</div></section>
    <section className="space-y-4"><h2 className="text-lg font-bold">Student applications</h2>{applications.length === 0 ? <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">No applications yet.</div> : applications.map((application) => <article key={application.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><div className="flex items-center gap-2"><h3 className="font-bold">{application.student.name} {application.student.surname}</h3><span className="rounded-full bg-[#F1F5F9] px-2 py-1 text-[10px] font-bold uppercase">{application.status}</span></div><p className="mt-1 text-sm text-[#64748B]">{application.student.universityName || "University not provided"} · {application.student.studentNumber || "Student number not provided"}</p><p className="text-xs text-[#64748B]">{application.student.email} · {application.property.title}</p><p className="mt-3 text-sm font-semibold">Requested room: {application.roomListing ? `${application.roomListing.name} (${application.roomListing.roomType}) · R ${application.roomListing.monthlyRent.toLocaleString("en-ZA")}/month` : "Legacy application without room selection"}</p></div>{application.status === "PENDING" && <div className="flex h-fit gap-2"><button type="button" disabled={busy === application.id} onClick={() => decide(application.id, "REJECTED")} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Decline</button><button type="button" disabled={busy === application.id} onClick={() => decide(application.id, "ACCEPTED")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Accept</button></div>}</div></article>)}</section>
  </div>;
}

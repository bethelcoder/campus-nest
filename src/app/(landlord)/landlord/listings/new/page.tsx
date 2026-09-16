"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    address: "",
    suburb: "",
    city: "",
    priceMonthly: "",
    bedrooms: "",
    distanceToCampus: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceMonthly: Number(form.priceMonthly),
          bedrooms: Number(form.bedrooms),
          distanceToCampus: form.distanceToCampus ? Number(form.distanceToCampus) : undefined,
          amenities: [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not create listing");
        return;
      }
      router.push(`/landlord/properties/${data.property.id}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">New Property Listing</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required placeholder="Title" className="w-full border rounded px-3 py-2 text-sm"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input required placeholder="Street address" className="w-full border rounded px-3 py-2 text-sm"
          value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Suburb" className="border rounded px-3 py-2 text-sm"
            value={form.suburb} onChange={(e) => setForm({ ...form, suburb: e.target.value })} />
          <input required placeholder="City" className="border rounded px-3 py-2 text-sm"
            value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input required type="number" placeholder="Price/mo (R)" className="border rounded px-3 py-2 text-sm"
            value={form.priceMonthly} onChange={(e) => setForm({ ...form, priceMonthly: e.target.value })} />
          <input required type="number" placeholder="Bedrooms" className="border rounded px-3 py-2 text-sm"
            value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
          <input type="number" step="0.1" placeholder="km to campus" className="border rounded px-3 py-2 text-sm"
            value={form.distanceToCampus} onChange={(e) => setForm({ ...form, distanceToCampus: e.target.value })} />
        </div>
        <textarea placeholder="Description" className="w-full border rounded px-3 py-2 text-sm" rows={3}
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

        {error && <p className="text-sm text-risk">{error}</p>}

        <button disabled={loading} className="w-full bg-gray-900 text-white rounded py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Creating..." : "Create listing & continue to safety checklist"}
        </button>
      </form>
    </main>
  );
}

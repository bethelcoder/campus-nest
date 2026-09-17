"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuBuilding2,
  LuMapPin,
  LuShieldCheck,
  LuCheck,
  LuUpload,
  LuSparkles,
  LuChevronLeft,
  LuDollarSign,
  LuBed,
  LuUsers,
  LuInfo,
  LuZap,
  LuFlame,
  LuLock,
  LuFileText,
  LuEye,
  LuTrash2,
} from "react-icons/lu";
import { STANDARD_CHECKLIST, calculateSafetyScore, type ChecklistTemplateItem } from "@/lib/safety";

interface ResidenceBuilderPageProps {
  user: {
    id?: string;
    name: string;
    surname: string;
    email: string;
    entityType?: string | null;
  };
}

const SA_UNIVERSITIES = [
  {
    name: "University of the Witwatersrand (Wits)",
    campuses: ["Braamfontein East", "Braamfontein West", "Parktown Education", "Parktown Medical"],
  },
  {
    name: "University of Johannesburg (UJ)",
    campuses: ["Auckland Park Kingsway (APK)", "Auckland Park Bunting (APB)", "Doornfontein (DFC)", "Soweto (SWC)"],
  },
  {
    name: "University of Cape Town (UCT)",
    campuses: ["Upper Campus", "Middle & Lower Campus", "Hiddingh", "Health Sciences (Observatory)"],
  },
  {
    name: "University of Pretoria (UP)",
    campuses: ["Hatfield", "Hillcrest", "Groenkloof", "Prinshof (Medical)", "Mamelodi"],
  },
  {
    name: "Stellenbosch University (SU)",
    campuses: ["Stellenbosch Main", "Tygerberg (Medical)", "Bellville Park"],
  },
  {
    name: "Tshwane University of Technology (TUT)",
    campuses: ["Pretoria Main", "Arcadia", "Arts Campus", "Ga-Rankuwa", "Soshanguve"],
  },
  {
    name: "University of KwaZulu-Natal (UKZN)",
    campuses: ["Howard College", "Westville", "Pietermaritzburg", "Nelson R Mandela Medical"],
  },
  {
    name: "Nelson Mandela University (NMU)",
    campuses: ["Gqeberha South Campus", "North Campus", "Second Avenue", "Missionvale", "George"],
  },
  {
    name: "Other Institution / College",
    campuses: ["Main Campus"],
  },
];

const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const AMENITY_CATEGORIES = [
  {
    category: "Power & Load-Shedding",
    items: [
      { id: "BACKUP_POWER", label: "Solar Inverter / Battery UPS (WiFi & Lighting during load-shedding)", icon: "⚡" },
      { id: "GENERATOR", label: "Full Complex Backup Diesel Generator", icon: "🔋" },
    ],
  },
  {
    category: "Water & Utilities",
    items: [
      { id: "BACKUP_WATER", label: "Backup JoJo Water Tanks + Pressure Pump", icon: "💧" },
      { id: "SOLAR_GEYSER", label: "Solar / Heat Pump Hot Water System", icon: "☀️" },
      { id: "WATER_INCLUDED", label: "Water Included in Monthly Rent", icon: "🚿" },
      { id: "ELEC_INCLUDED", label: "Electricity / Monthly Power Quota Included", icon: "💡" },
    ],
  },
  {
    category: "Connectivity & Study",
    items: [
      { id: "WIFI", label: "Uncapped High-Speed Fibre WiFi (100Mbps+)", icon: "📶" },
      { id: "STUDY_ROOM", label: "Dedicated Quiet Study Center with Power Sockets", icon: "📚" },
      { id: "COMPUTER_LAB", label: "Student Computer Lab & Printing Station", icon: "💻" },
    ],
  },
  {
    category: "Security & Access Control",
    items: [
      { id: "BIOMETRIC", label: "Biometric Fingerprint / Facial Recognition Access Control", icon: "🔒" },
      { id: "CCTV", label: "24/7 Monitored CCTV Surveillance System", icon: "📹" },
      { id: "ARMED_RESPONSE", label: "Electric Perimeter Fencing & Armed Response Link", icon: "🚨" },
      { id: "GUARD_SECURITY", label: "24-Hour On-Site Security Guard / Caretaker", icon: "👮" },
    ],
  },
  {
    category: "Living, Furnishings & Facilities",
    items: [
      { id: "FURNISHED", label: "Fully Furnished (Bed, Study Desk, Chair, Lockable Wardrobe)", icon: "🛏️" },
      { id: "LAUNDRY", label: "On-Site Laundry Machines (Washers & Dryers)", icon: "🧺" },
      { id: "KITCHEN_COMMUNAL", label: "Fully Equipped Communal Kitchen (Stoves, Microwaves, Fridges)", icon: "🍳" },
      { id: "TV_LOUNGE", label: "Student Social Lounge / TV Room (DSTV/Netflix)", icon: "📺" },
      { id: "OUTDOOR_BRAAI", label: "Outdoor Courtyard / Braai Area", icon: "🍖" },
      { id: "FITNESS_GYM", label: "On-Site Student Gym / Fitness Room", icon: "🏋️" },
    ],
  },
];

export default function ResidenceBuilderPage({ user }: ResidenceBuilderPageProps) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Active Tab View within Builder
  const [activeTab, setActiveTab] = useState<"basics" | "capacity" | "amenities" | "safety" | "media">("basics");

  // Basic Info Form State
  const [basics, setBasics] = useState({
    title: "",
    buildingType: "STUDENT_BLOCK", // STUDENT_BLOCK, COMMUNE, COMPLEX, HOSTEL
    institution: SA_UNIVERSITIES[0].name,
    campus: SA_UNIVERSITIES[0].campuses[0],
    distanceToCampus: "0.8",
    transitMode: "WALKING", // WALKING, SHUTTLE, TAXI
    streetAddress: "",
    suburb: "",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "",
    description: "",
  });

  // Capacity & Pricing Form State
  const [capacity, setCapacity] = useState({
    totalBeds: "12",
    totalBedrooms: "6",
    totalBathrooms: "3",
    singleRoomsCount: "2",
    singleRoomRate: "5200.00",
    doubleRoomsCount: "4",
    doubleRoomRate: "4600.00",
    depositAmount: "4600.00",
    nsfasEligible: true,
  });

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "BACKUP_POWER",
    "BACKUP_WATER",
    "WIFI",
    "STUDY_ROOM",
    "BIOMETRIC",
    "CCTV",
    "FURNISHED",
    "LAUNDRY",
    "WATER_INCLUDED",
  ]);

  // 13-Point Checklist State
  const [checklistAnswers, setChecklistAnswers] = useState<
    Array<{
      category: ChecklistTemplateItem["category"];
      label: string;
      weight: number;
      passed: boolean | null;
      notes?: string;
    }>
  >(
    STANDARD_CHECKLIST.map((item) => ({
      category: item.category,
      label: item.label,
      weight: item.weight,
      passed: true,
      notes: "",
    }))
  );

  // Media and Document State
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Live Safety Score Calculation
  const liveSafetyScore = useMemo(() => {
    return calculateSafetyScore(checklistAnswers);
  }, [checklistAnswers]);

  // Selected University Campuses
  const currentUniversityCampuses = useMemo(() => {
    const uni = SA_UNIVERSITIES.find((u) => u.name === basics.institution);
    return uni ? uni.campuses : ["Main Campus"];
  }, [basics.institution]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const setChecklistAnswer = (index: number, passed: boolean) => {
    setChecklistAnswers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], passed };
      return updated;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "property");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setPhotos((prev) => [...prev, data.url]);
    } catch (err: any) {
      setError(err.message || "Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Form Validation
  const isBasicsValid =
    basics.title.trim().length > 0 &&
    basics.streetAddress.trim().length > 0 &&
    basics.suburb.trim().length > 0 &&
    basics.city.trim().length > 0;

  const isCapacityValid =
    Number(capacity.totalBeds) >= 1 &&
    Number(capacity.doubleRoomRate || capacity.singleRoomRate) > 0;

  const isFormValid = isBasicsValid && isCapacityValid;

  const handlePublish = async () => {
    if (!isFormValid) {
      setError("Please fill in all mandatory residence basics and capacity details.");
      setActiveTab("basics");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const basePrice = Number(capacity.doubleRoomRate || capacity.singleRoomRate || 4800);
      const payload = {
        title: basics.title,
        address: `${basics.streetAddress}${basics.postalCode ? `, ${basics.postalCode}` : ""}`,
        suburb: basics.suburb,
        city: basics.city,
        priceMonthly: basePrice,
        depositAmount: capacity.depositAmount ? Number(capacity.depositAmount) : undefined,
        bedrooms: Number(capacity.totalBedrooms || 1),
        bathrooms: Number(capacity.totalBathrooms || 1),
        maxOccupants: Number(capacity.totalBeds || 1),
        description: basics.description || `Accredited student housing located in ${basics.suburb}, ${Number(basics.distanceToCampus)}km from ${basics.institution} (${basics.campus}).`,
        amenities: selectedAmenities,
        distanceToCampus: basics.distanceToCampus ? Number(basics.distanceToCampus) : undefined,
        images: photos,
        checklistAnswers,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create residence listing");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/landlord/properties");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to create residence listing.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 font-poppins">
      
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link
              href="/landlord/properties"
              className="text-xs font-semibold text-[#64748B] hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <LuChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Residences</span>
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              New Residence Listing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {basics.title ? basics.title : "Register Student Residence"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure residence infrastructure, capacity, NSFAS/bursary pricing, and 13-point safety accreditation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 px-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Safety Rating
            </span>
            <span className="text-base font-extrabold text-emerald-700">
              {liveSafetyScore !== null ? `${liveSafetyScore.toFixed(1)} / 10` : "-- / 10"}
            </span>
          </div>

          <button
            type="button"
            disabled={saving || success}
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing Listing...</span>
              </>
            ) : success ? (
              <>
                <LuCheck className="w-4 h-4" />
                <span>Listing Published!</span>
              </>
            ) : (
              <>
                <LuSparkles className="w-4 h-4" />
                <span>Publish Accredited Residence</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
          <LuInfo className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: "basics" as const, label: "1. Identity & Location", icon: <LuBuilding2 className="w-3.5 h-3.5" /> },
          { id: "capacity" as const, label: "2. Capacity & Rates", icon: <LuBed className="w-3.5 h-3.5" /> },
          { id: "amenities" as const, label: "3. Living Amenities", icon: <LuZap className="w-3.5 h-3.5" /> },
          { id: "safety" as const, label: "4. 13-Point Safety Audit", icon: <LuShieldCheck className="w-3.5 h-3.5" /> },
          { id: "media" as const, label: "5. Photos & Compliance", icon: <LuUpload className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: IDENTITY & LOCATION ================= */}
      {activeTab === "basics" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Residence Identity &amp; Institution Proximity</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify your property&apos;s title, classification, and targeted university campuses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Residence / Building Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={basics.title}
                onChange={(e) => setBasics({ ...basics, title: e.target.value })}
                placeholder="e.g. Apex Student Manor, Braamfontein Loft"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Property Classification
              </label>
              <select
                value={basics.buildingType}
                onChange={(e) => setBasics({ ...basics, buildingType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
              >
                <option value="STUDENT_BLOCK">Dedicated Student Apartment Block</option>
                <option value="COMMUNE">Accredited Student Commune / House</option>
                <option value="COMPLEX">Multi-Unit Residential Complex</option>
                <option value="HOSTEL">Full Student Residence / Hostel</option>
              </select>
            </div>
          </div>

          {/* Institution Selection */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Campus Proximity &amp; Transit Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Higher Education Institution
                </label>
                <select
                  value={basics.institution}
                  onChange={(e) => {
                    const uni = SA_UNIVERSITIES.find((u) => u.name === e.target.value);
                    setBasics({
                      ...basics,
                      institution: e.target.value,
                      campus: uni ? uni.campuses[0] : "Main Campus",
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {SA_UNIVERSITIES.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Nearest Campus / Faculty Location
                </label>
                <select
                  value={basics.campus}
                  onChange={(e) => setBasics({ ...basics, campus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {currentUniversityCampuses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Distance to Campus Gates (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={basics.distanceToCampus}
                  onChange={(e) => setBasics({ ...basics, distanceToCampus: e.target.value })}
                  placeholder="e.g. 0.8"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Primary Commute Access
                </label>
                <select
                  value={basics.transitMode}
                  onChange={(e) => setBasics({ ...basics, transitMode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  <option value="WALKING">Safe Walking Distance (&lt; 1.5 km)</option>
                  <option value="SHUTTLE">Official University Shuttle Route Stop</option>
                  <option value="TAXI">Public Transit / Rea Vaya / MyCiTi (&lt; 300m)</option>
                  <option value="PRIVATE_SHUTTLE">Residence-Operated Private Shuttle</option>
                </select>
              </div>
            </div>
          </div>

          {/* Physical Address Details */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Physical Location &amp; Postal Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Street Address &amp; Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={basics.streetAddress}
                    onChange={(e) => setBasics({ ...basics, streetAddress: e.target.value })}
                    placeholder="e.g. 45 Juta Street, Braamfontein"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                  />
                  <LuMapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Suburb / Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.suburb}
                  onChange={(e) => setBasics({ ...basics, suburb: e.target.value })}
                  placeholder="e.g. Braamfontein, Auckland Park, Hatfield"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={basics.city}
                  onChange={(e) => setBasics({ ...basics, city: e.target.value })}
                  placeholder="e.g. Johannesburg, Cape Town, Pretoria"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Province
                </label>
                <select
                  value={basics.province}
                  onChange={(e) => setBasics({ ...basics, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800 bg-white"
                >
                  {SA_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={basics.postalCode}
                  onChange={(e) => setBasics({ ...basics, postalCode: e.target.value })}
                  placeholder="e.g. 2001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Capacity &amp; Rates →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CAPACITY & RATES ================= */}
      {activeTab === "capacity" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Room Configurations &amp; Student Rates</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Set student bed capacity and rates aligned with DHET / NSFAS accommodation allowances.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              DHET Norms Aligned
            </span>
          </div>

          {/* Building Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Student Beds <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={capacity.totalBeds}
                onChange={(e) => setCapacity({ ...capacity, totalBeds: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-900 font-bold bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Maximum total student occupants</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Bedrooms
              </label>
              <input
                type="number"
                min={1}
                value={capacity.totalBedrooms}
                onChange={(e) => setCapacity({ ...capacity, totalBedrooms: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-900 font-bold bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Number of physical sleeping rooms</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Bathrooms
              </label>
              <input
                type="number"
                min={1}
                value={capacity.totalBathrooms}
                onChange={(e) => setCapacity({ ...capacity, totalBathrooms: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-gray-900 font-bold bg-white"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Showers / Toilets (Min 1:5 ratio)</span>
            </div>
          </div>

          {/* Pricing Matrix */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Monthly Rental Rates per Room Type (ZAR)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">Single Room (Private)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    1 Bed / Room
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Monthly Rental Rate (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      step="0.01"
                      value={capacity.singleRoomRate}
                      onChange={(e) => setCapacity({ ...capacity, singleRoomRate: e.target.value })}
                      placeholder="5200.00"
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900">2-Sharing Room (Double)</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    2 Beds / Room
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Monthly Rate Per Bed (ZAR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">R</span>
                    <input
                      type="number"
                      step="0.01"
                      value={capacity.doubleRoomRate}
                      onChange={(e) => setCapacity({ ...capacity, doubleRoomRate: e.target.value })}
                      placeholder="4600.00"
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-900 font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Standard Security Deposit (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">R</span>
                  <input
                    type="number"
                    step="0.01"
                    value={capacity.depositAmount}
                    onChange={(e) => setCapacity({ ...capacity, depositAmount: e.target.value })}
                    placeholder="4600.00"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 mt-5">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Accept NSFAS Direct Accommodation</span>
                  <span className="text-[10px] text-gray-500 block">Matches national NSFAS payment allowance schedule</span>
                </div>
                <input
                  type="checkbox"
                  checked={capacity.nsfasEligible}
                  onChange={(e) => setCapacity({ ...capacity, nsfasEligible: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("basics")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Living Amenities →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIVING AMENITIES ================= */}
      {activeTab === "amenities" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Student Living Amenities &amp; Resilience</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select all verified facilities included with accommodation rent.
            </p>
          </div>

          <div className="space-y-6">
            {AMENITY_CATEGORIES.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {group.category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((item) => {
                    const isSelected = selectedAmenities.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleAmenity(item.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-emerald-500/20"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/50"
                        }`}
                      >
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <span className="flex-1 leading-snug">{item.label}</span>
                        {isSelected && <LuCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("capacity")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("safety")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Safety Audit →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: 13-POINT SAFETY AUDIT ================= */}
      {activeTab === "safety" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">13-Point Municipal Safety Checklist</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Standardized municipal health &amp; safety inspection required for university &amp; NSFAS accreditation.
              </p>
            </div>

            {/* Live Safety Score Badge */}
            <div className="p-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center gap-3 shrink-0 shadow-sm">
              <LuShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Computed Rating
                </span>
                <span className="text-lg font-extrabold text-white">
                  {liveSafetyScore !== null ? `${liveSafetyScore.toFixed(1)} / 10` : "-- / 10"}
                </span>
              </div>
            </div>
          </div>

          {/* Checklist Items list */}
          <div className="space-y-3">
            {checklistAnswers.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all text-xs"
              >
                <div className="flex-1">
                  <span className="font-bold text-gray-900 block text-xs">{item.label}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                    Category: {item.category.replace("_", " ")} • Priority Weight: {item.weight}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, true)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      item.passed === true
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                    }`}
                  >
                    <LuCheck className="w-3.5 h-3.5" /> Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setChecklistAnswer(idx, false)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      item.passed === false
                        ? "bg-rose-600 text-white shadow-xs ring-2 ring-rose-500/20"
                        : "bg-gray-100 text-gray-600 hover:bg-rose-50"
                    }`}
                  >
                    ✕ Fail
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-between">
            <button
              type="button"
              onClick={() => setActiveTab("amenities")}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Continue to Photos &amp; Compliance →
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: PHOTOS & COMPLIANCE ================= */}
      {activeTab === "media" && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">Property Photos &amp; Compliance Documentation</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload verified photos of bedroom interiors, study spaces, and security perimeter.
            </p>
          </div>

          {/* Photos Upload Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Property Gallery ({photos.length} uploaded)</span>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer transition-colors">
                <LuUpload className="w-3.5 h-3.5" />
                <span>{uploadingPhoto ? "Uploading to Blob..." : "+ Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="sr-only"
                />
              </label>
            </div>

            {photos.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center space-y-2">
                <LuUpload className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-600 font-semibold">No property images uploaded yet</p>
                <p className="text-[11px] text-gray-400">Upload photos of rooms, bathrooms, study desks, and security gates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 group aspect-video bg-gray-100">
                    <img src={url} alt={`Residence photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    >
                      <LuTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Complete Bar */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LuShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs text-gray-600">
                Ready to publish. Safety Rating will be live immediately.
              </span>
            </div>

            <button
              type="button"
              disabled={saving || success || !isFormValid}
              onClick={handlePublish}
              className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : success ? (
                <>
                  <LuCheck className="w-4 h-4" />
                  <span>Published Successfully!</span>
                </>
              ) : (
                <>
                  <LuSparkles className="w-4 h-4" />
                  <span>Complete &amp; Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
